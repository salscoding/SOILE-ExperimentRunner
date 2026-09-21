<template>
  <div class="taskbar flex">
    <div v-if="newTask" class="taskbarfield p-field">
      <InputText
        label="Task Name"
        v-model="currentName"
        placeHolder="Choose a name for the Task"
      ></InputText>
    </div>
    <div v-else class="flex taskbarfield p-field">
      <h2>{{ currentName }}</h2>
    </div>

    <div v-if="!isValid || !task.UUID">
      <!-- We leave this in only if we have a new task that is not saved yet -->
      <div class="taskbarfield p-field">
        <Dropdown
          v-model="selectedCodeType"
          :options="codeOptions"
          placeholder="Select Code Style"
          label="Code Style"
        />
      </div>
      <div v-if="selectedCodeType === 'psychopy'" class="taskbarfield p-field">
        <Dropdown
          v-model="selectedVersion"
          :options="codeTypeVersions"
          :disabled="!selectedCodeType"
          label="Code Style Version"
          placeholder="Select Code Version"
        />
      </div>
    </div>
    <div class="taskbarfield">
      <Button
        class="taskbarfield"
        :disabled="!isValid"
        :label="saveLabel"
        icon="pi pi-save"
        @click="save"
      ></Button>
    </div>
    <div class="taskbarfield">
      <Button
        class="taskbarfield"
        label="Edit Properties"
        icon="pi pi-pencil"
        @click="$emit('editProperties')"
      ></Button>
    </div>
    <div v-if="!newTask" class="taskbarfield">
      <Button
        class="taskbarfield"
        label="Reload"
        icon="pi pi-refresh"
        @click="showReloadConfirm = true"
      ></Button>
      <Button
        class="taskbarfield"
        label="Select Version"
        icon="pi pi-server"
        @click="showChangeVersion = true"
      ></Button>
      <Button
        class="taskbarfield"
        label="Manage Versions"
        icon="pi pi-wrench"
        @click="showVersionManagement = true"
      ></Button>
      <Button
        class="taskbarfield"
        label="Export Task"
        icon="pi pi-download"
        @click="download"
      ></Button>
    </div>
    <SelectNewVersionDialog
      v-if="changeTaskVersion"
      @selected="changeTaskVersion"
      objectType="task"
      :element="task"
      v-model:visible="showChangeVersion"
    ></SelectNewVersionDialog>
    <ConfirmDialog
      v-if="showReloadConfirm"
      @confirm="reload"
      @reject="showReloadConfirm = false"
      message="This will reset all changes made since the last save"
      v-model:isVisible="showReloadConfirm"
      confirm="Reload Task"
    ></ConfirmDialog>
    <ElementVersionManagementDialog
      v-if="showVersionManagement"
      v-model:isVisible="showVersionManagement"
      :UUID="currentUUID"
      type="Task"
    >
    </ElementVersionManagementDialog>
  </div>
</template>

<script>
import Dropdown from "primevue/select";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import ObjectAndVersionSelectorWithProps from "@/components/utils/ObjectAndVersionSelectorWithProps.vue";
import SelectNewVersionDialog from "@/components/dialogs/SelectNewVersionDialog.vue";
import ElementVersionManagementDialog from "@/components/dialogs/ElementVersionManagementDialog.vue";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog.vue";

export default {
  name: "TaskBar",
  props: {
    codeType: {
      type: String,
    },
    codeVersion: {
      type: String,
    },
    // the task is the Name/UUID combination.
    task: {
      type: Object,
      required: false,
    },
    taskVersion: {
      type: Object,
      required: true,
    },
    codeTypeOptions: {
      type: Object,
      required: true,
    },
    newTask: {
      type: Boolean,
      required: true,
    },
    // this is somewhat hackish, but necessary to allow an update of the enclosing validity.
    valid: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      currentType: null,
      showChangeVersion: false,
      showReloadConfirm: false,
      showVersionManagement: false,
    };
  },
  computed: {
    codeTypeVersions() {
      return this.codeType
        ? this.codeTypeOptions.find((x) => x.name === this.codeType).versions
        : [];
    },
    codeOptions() {
      return this.codeTypeOptions.map((x) => x.name);
    },
    selectedCodeType: {
      get() {
        return this.codeType;
      },
      set(newValue) {
        // reset the version, since the value changed;
        if (this.currentType != newValue) {
          this.selectedVersion = null;
        }
        if (newValue != "psychopy") {
          this.selectedVersion = this.codeTypeOptions.find(
            (x) => x.name === newValue
          ).versions[0];
        }
        this.currentType = newValue;
        this.$emit("update:codeType", newValue);
      },
    },
    selectedVersion: {
      get() {
        return this.codeVersion;
      },
      set(newValue) {
        // reset the version, since the value changed;
        this.$emit("update:codeVersion", newValue);
      },
    },
    currentName: {
      get() {
        return this.task.name;
      },
      set(newValue) {
        // reset the version, since the value changed;
        console.log("Setting new Name");
        this.$emit("update:task", { name: newValue });
      },
    },
    // this is just a VERY informal check.
    isValid() {
      // either new or has a task and version to base any changes on.
      const taskBasicsOK =
        (this.newTask && this.currentName != "") ||
        (this.task.name != null && this.taskVersion.version != null);
      const taskTypeOk = this.codeType != null && this.codeVersion != null;
      console.log("Emitting an update for valid");
      this.$emit("update:valid", taskBasicsOK && taskTypeOk);
      return taskBasicsOK && taskTypeOk;
    },
    saveLabel() {
      return this.newTask ? "Create Task" : "Save";
    },
    currentUUID() {
      return this.task ? this.task.UUID : undefined;
    },
    currentVersion() {
      return this.taskVersion ? this.taskVersion.version : undefined;
    },
  },
  methods: {
    save() {
      this.$emit("save");
    },

    reload() {
      // Perform reload logic here
      console.log("Reloading");
      this.$emit("reload");
      this.showReloadConfirm = false;
    },
    changeTaskVersion(updated) {
      if (updated) {
        this.$emit("changeTaskVersion", updated);
      }
    },
    download() {
      this.$emit("download");
    },
  },
  emits: ["reload", "changeTaskVersion", "update:valid", "editProperties"],
  components: {
    Dropdown,
    Button,
    ObjectAndVersionSelectorWithProps,
    InputText,
    SelectNewVersionDialog,
    ConfirmDialog,
    ElementVersionManagementDialog,
  },
};
</script>

<style scoped>
.taskbar {
  width: 100%;
  align-items: center;
}

.taskbarfield {
  display: inline-block;
  margin-left: 5px;
}
</style>
