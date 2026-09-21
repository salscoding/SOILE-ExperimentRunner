<template>
  <Dropdown
    v-model="selectedElement"
    :options="availableItems"
    :loading="loading"
    optionLabel="name"
    :placeholder="'Select ' + objectType"
  />
  <Dropdown
    v-if="selectedElement"
    v-model="selectedVersion"
    :options="availableVersions"
    optionLabel="tag"
    placeholder="Select Version"
  />
</template>

<script>
import Dropdown from "primevue/select";
import { useElementStore } from "../../stores";

export default {
  components: { Dropdown },
  emits: ["updateSelection", "updateVersion"],
  props: {
    objectType: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      selectedElement: undefined,
      selectedVersion: undefined,
      loading: true,
      availableItems: [],
      availableVersions: [],
    };
  },

  setup() {
    const elementStore = useElementStore();
    return { elementStore: elementStore };
  },
  computed: {
    selectedItem() {
      return {
        name: this.selectedElement?.name,
        UUID: this.selectedElement?.UUID,
        version: this.selectedVersion?.version,
      };
    },
  },
  watch: {
    selectedItem: {
      handler(newValue) {
        this.$emit("updateSelection", newValue);
      },
      deep: true,
    },
    "selectedItem.UUID": {
      async handler(newValue) {
        this.availableVersions = await this.elementStore.getTagsForElement(
          newValue,
          this.objectType.toLowerCase()
        );
      },
    },
  },
  async mounted() {
    // TODO: heck whether this savely works with onMounted or whether this should be done with onDisplay

    this.loading = true;
    await this.elementStore.updateAvailableOptions(
      this.objectType.toLowerCase()
    );
    this.availableItems = await this.elementStore.getListForType(
      this.objectType.toLowerCase()
    );
    this.loading = false;
  },
};
</script>
