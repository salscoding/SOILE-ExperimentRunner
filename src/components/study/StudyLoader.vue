<template>
  <Button icon="pi pi-folder-open" label="Load Study"></Button>
  <Button
    icon="pi pi-plus"
    label="New Study"
    @click="creationDialogVisible = true"
  ></Button>
  <StudyCreationDialog
    v-model:visible="creationDialogVisible"
    @selected="(event) => handleCreation(event)"
  ></StudyCreationDialog>
  <StudyLoadDialog
    v-model:visible="loadDialogVisible"
    @selected="(event) => handleLoad(event)"
  ></StudyLoadDialog>
</template>

<script>
import { useProjectStore } from "@/stores/project";
import { mapState } from "pinia";
import Button from "primevue/button";
import StudyCreationDialog from "@/components/study/StudyCreationDialog.vue";
import StudyLoadDialog from "@/components/study/StudyLoadDialog.vue";

export default {
  name: "StudyManagementView",
  computed: {
    ...mapState(useProjectStore, ["researchStudies", "editableStudies"]),
  },
  emits: ["studySelected"],
  components: { Button, StudyCreationDialog, StudyLoadDialog },
  mounted() {
    this.projectStore.updateEditableStudies();
    this.projectStore.updateResearchStudies();
  },
  setup() {
    const projectStore = useProjectStore();
    return { projectStore };
  },
  data() {
    return {
      currentStudy: undefined,
      creationDialogVisible: false,
      loadDialogVisible: false,
    };
  },
  methods: {
    handleCreation(event) {
      if (event) {
        this.$emit("studySelected", event);
      }
      this.creationDialogVisible = false;
    },
    handleLoad(event) {
      if (event) {
        this.$emit("studySelected", event);
      }
      this.loadDialogVisible = false;
    },
  },
};
</script>

<style scoped></style>
