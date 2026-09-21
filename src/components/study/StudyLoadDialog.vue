<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    header="Set Study Properties"
    :style="{ width: '50vw' }"
  >
    <Dropdown
      v-model="selected"
      :options="researchStudies"
      :loading="loading"
      optionLabel="name"
      placeholder="Select Study"
    />
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" @click="abort" text />
      <Button
        label="Select"
        icon="pi pi-check"
        @click="elementSelected"
        autofocus
        :disabled="loading"
      />
    </template>
  </Dialog>
</template>

<script>
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Dropdown from "primevue/select";
import ObjectAndVersionSelector from "@/components/utils/ObjectAndVersionSelector.vue";
import StudyProperties from "./StudyProperties.vue";
import { useStudyStore } from "@/stores";
import { mapState } from "pinia";

export default {
  components: { Dialog, Dropdown, Button },
  emits: ["selected", "update:visible"],
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    researchStudies: {
      type: Array,
      reuired: true,
    },
  },
  data() {
    return {
      selected: undefined,
      loading: false,
    };
  },
  setup() {
    const projectStore = useStudyStore();
    return { projectStore };
  },
  async mounted() {
    this.loading = true;
    await this.projectStore.updateResearchStudies();
    this.loading = false;
  },

  methods: {
    abort() {
      this.$emit("selected", false);
    },
    async elementSelected() {
      this.loading = true;
      this.$emit("selected", this.selected);
    },
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(value) {
        this.loading = false;
        this.$emit("update:visible", value);
      },
    },
  },
  watch: {
    visible() {
      this.loading = false;
    },
  },
};
</script>
