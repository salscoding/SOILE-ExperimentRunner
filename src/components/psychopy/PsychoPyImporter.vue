<template>
  <div>
    <Dialog
      v-model:visible="dialogVisible"
      modal
      header="Select Folder"
      @hide="resetForm"
    >
      <div class="p-fluid">
        <div v-if="folderSelected">
          <div class="p-field align-items-center flex mb-3">
            <label for="taskName">Task Name:</label>
            <InputText
              id="taskName"
              v-model="taskName"
              type="text"
              :class="errorMessage ? 'p-invalid' : ''"
              aria-describedby="text-error"
            />
          </div>
          <small class="p-error" id="text-error">{{
            errorMessage || "&nbsp;"
          }}</small>
        </div>
        <div
          v-if="folderSelected && dataFolder != null"
          class="p-field align-items-center flex"
          v-tooltip="
            'Also upload data in the data foler of the task. If this was downloaded from pavlovia you likely don\'t want to do this'
          "
        >
          <label for="useData">Use Data Folder:</label>
          <InputSwitch v-model="uploadDataFolder" id="useData" />
        </div>
        <div class="p-field">
          <input
            class="hidden"
            type="file"
            ref="folderInput"
            @change="handleFolderSelection"
            directory
            webkitdirectory
          />
        </div>
        <div v-if="!folderSelected" class="p-field">
          <Button @click="selectFolder" class="p-button p-button-primary"
            >Select Folder</Button
          >
        </div>
      </div>
      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="$emit('update:visible', false)"
          text
        />
        <Button
          label="Create Task"
          icon="pi pi-check"
          :disabled="errorMessage || !folderSelected"
          @click="createTask"
          autofocus
        />
      </template>
    </Dialog>
  </div>
</template>

<script>
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import InputSwitch from "primevue/toggleswitch";

import { useElementStore, useEditorStore, useGraphStore } from "@/stores";
import { storeToRefs } from "pinia";
import { useField, useForm } from "vee-validate";

import {
  readCode,
  updatePsychoJSStart,
  processFile,
} from "./psychopyconverter.js";

export default {
  components: {
    Dialog,
    InputText,
    Button,
    InputSwitch,
  },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(value) {
        this.$emit("update:visible", value);
      },
    },
    errorMessage() {
      if (!this.taskName || this.taskName === "") {
        return "Must provide a name";
      }
      const temp = this.existingTasks.map((x) => x.name);
      console.log(temp);
      console.log(this.taskName.trim());
      console.log(temp.includes(this.taskName.trim()));
      return this.existingTasks
        .map((x) => x.name)
        .includes(this.taskName.trim())
        ? "Name is already in use"
        : false;
    },
  },
  setup() {
    const elementStore = useElementStore();
    const editorStore = useEditorStore();
    const { existingTasks } = storeToRefs(elementStore);
    return {
      elementStore,
      editorStore,
      existingTasks,
    };
  },
  data() {
    return {
      taskName: "",
      uploadDataFolder: false,
      dataFolder: null,
      folderSelected: false,
      taskCode: "",
      psychojsversion: null,
      scriptName: "",
      legacyScriptName: "",
      libFolder: "",
      taskFiles: null,
    };
  },
  methods: {
    async handleFolderSelection(event) {
      console.log(event);
      const files = Array.from(event.target.files); // Get all the files that are in the folder.
      console.log(files);
      const rootFolder = this.getSourceFolder(files[0]);
      // get the index file and derive Data from it.
      const indexFile = files.find(
        (file) =>
          file.webkitRelativePath.replace(/\\/g, "/") ===
          rootFolder + "/index.html"
      );
      this.libFolder = rootFolder + "/lib/";
      // check whether there is a data folder...
      const dataFolder = rootFolder + "/data/";
      if (
        files.some((file) =>
          file.webkitRelativePath
            .replace(/\\/g, "/")
            .startsWith(rootFolder + "/data/")
        )
      ) {
        this.dataFolder = dataFolder;
      }
      try {
        const taskInfo = await readCode(indexFile);
        this.taskCode = taskInfo.code;
        this.taskName = taskInfo.name;
        this.psychojsversion = taskInfo.version;
        this.scriptName = taskInfo.script;
        this.legacyScriptName = taskInfo.legacyscript;
        this.folderSelected = true;
        this.taskFiles = files;
      } catch (e) {
        // TODO: Handle error properly
        console.log(e);
        return;
      }
    },
    excludeDirectoryFromFiles(inputFiles, folder) {
      return inputFiles.filter((f) => !f.webkitRelativePath.startsWith(folder));
    },
    async createTask() {
      var usedFiles = [];
      if (this.uploadDataFolder) {
        usedFiles = this.excludeDirectoryFromFiles(
          this.taskFiles,
          this.libFolder
        ).map((f) => {
          return { file: f, name: f.webkitRelativePath.replace(/^.+?\//i, "") };
        });
      } else {
        usedFiles = this.excludeDirectoryFromFiles(
          this.excludeDirectoryFromFiles(this.taskFiles, this.libFolder),
          this.dataFolder
        ).map((f) => {
          return { file: f, name: f.webkitRelativePath.replace(/^.+?\//i, "") };
        });
      }
      // these are now the used files and now we need to update/remove the script and index html file and add the config file.
      // first, remove the index file
      usedFiles = usedFiles.filter((file) => file.name != "index.html");
      console.log(usedFiles);
      // update the script file
      const scriptFile = usedFiles.find(
        (file) => file.name === this.scriptName
      );
      scriptFile.file = await processFile(scriptFile.file, updatePsychoJSStart);
      // update the legacy script file
      const legacyScriptFile = usedFiles.find(
        (file) => file.name === this.legacyScriptName
      );
      legacyScriptFile.file = await processFile(
        legacyScriptFile.file,
        updatePsychoJSStart
      );
      // add a config file.
      const defaultConfig = { SOILE: true };
      const configBlob = new Blob([JSON.stringify(defaultConfig, null, 2)], {
        type: "application/json",
      });
      usedFiles.push({
        file: new File([configBlob], "soileconfig.json", {
          type: "application/json",
        }),
        name: "soileconfig.json",
      });
      // Emit the convertedData event with the extracted information
      const taskData = {
        codeType: {
          language: "psychopy",
          version: this.psychojsversion,
        },
        code: this.taskCode,
      };
      const taskInfo = await this.elementStore.createElement(
        this.taskName,
        taskData,
        "task"
      );
      const newVersion = await this.elementStore.addFileToTask(
        taskInfo.UUID,
        taskInfo.version,
        "",
        usedFiles
      );
      taskInfo.tag = "Uploaded Version";
      taskInfo.version = newVersion;
      const finalVersion = await this.elementStore.updateElement(
        taskInfo.UUID,
        taskInfo.version,
        taskInfo,
        "task"
      );
      this.$emit("taskCreated", {
        name: this.taskName,
        UUID: taskInfo.UUID,
        version: finalVersion,
      });
    },

    /**
     * This is somewhat hackish, as we get relative pathes but don't get the directories...
     * @param {*} inputFile
     */
    getSourceFolder(inputFile) {
      // this is the directory provided
      return inputFile.webkitRelativePath.replace(/\\/g, "/").split("/")[0];
    },
    selectFolder() {
      // Trigger folder selection by clicking the hidden input element
      this.$refs.folderInput.click();
    },
    resetForm() {
      this.taskName = "";
      this.uploadDataFolder = false;
      this.dataFolder = null;
      this.folderSelected = false;
      this.taskCode = "";
      this.psychojsversion = null;
      this.scriptName = "";
      this.legacyScriptName = "";
      this.taskFiles = null;
    },
  },
  mounted() {
    this.elementStore.updateAvailableTasks(true);
  },
};
</script>

<style>
/* Add your custom styles here if needed */
</style>
