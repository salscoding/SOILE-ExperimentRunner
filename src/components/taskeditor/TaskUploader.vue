<template>
  <input
    class="hidden"
    type="file"
    ref="uploadZip"
    accept=".zip"
    @change="handleZipSelected"
  />
  <EnterTextDialog
    v-if="showNameSelection"
    v-model:isVisible="showNameSelection"
    title="Select name for uploaded Task"
    message="Name for uploaded Task:"
    :defaultValue="selectedTaskName"
    @reject="
      showNameSelection = false;
      selectedFile = null;
      selectedTaskName = '';
    "
    @confirm="submitUpload"
    :validationFunction="checkName"
  ></EnterTextDialog>
</template>

<script setup>
//TODO: Add processing screen, while File is uploaded.
import { useElementStore, useErrorStore } from "@/stores";
import EnterTextDialog from "@/components/dialogs/EnterTextDialog.vue";

import JSZip from "jszip";
import { ref, computed, reactive } from "vue";
import { storeToRefs } from "pinia";

const elementStore = useElementStore();
const errorStore = useErrorStore();
const { existingTasks } = storeToRefs(elementStore);
const emit = defineEmits(["elementSelected"]);

const uploadZip = ref(null);

const selectedTaskName = ref("");
const showNameSelection = ref(false);
const selectedFile = ref(null);

/**
 * Open the zip selection window
 */
function loadZip() {
  uploadZip.value.click();
}

/**
 * Check whether the name already exists on the server.
 * @param {*} name the name to check.
 */
function checkName(name) {
  return !existingTasks.value.map((x) => x.name).includes(name);
}

async function submitUpload(name) {
  console.log("Upload submitted");
  selectedTaskName.value = name;
  const taskData = await elementStore.uploadTask(
    selectedFile.value,
    selectedTaskName.value
  );
  if (taskData) {
    emit("elementSelected", taskData);
  }
  showNameSelection.value = false;
}
/**
 * Submit the selected zip to the the elementstoe to create it.
 * @param {*} event
 */
async function handleZipSelected(event) {
  const file = event.target.files[0];
  elementStore.updateAvailableTasks(true);
  if (!file) return;

  try {
    const zip = new JSZip();
    const zipData = await zip.loadAsync(file);

    // Specify the path to the file you want to extract
    const filePath = "soile.cfg";
    const extractedFile = zipData.file(filePath);

    if (extractedFile) {
      const content = await extractedFile.async("text");
      console.log(content);
      const extractedFileContent = JSON.parse(content);
      console.log(extractedFileContent);
      selectedTaskName.value = extractedFileContent.name;
      console.log(selectedTaskName.value);
      selectedFile.value = file;
      showNameSelection.value = true;
    } else {
      errorStore.raiseError(
        "error",
        "Could not find soile config file. This does not look like a Task exported by Soile"
      );
    }
  } catch (error) {
    errorStore.raiseError(
      "error",
      "Error extracting file, see log for details"
    );
    console.error("Error extracting file:", error);
  }
}

defineExpose({
  loadZip,
});
</script>

<style></style>
