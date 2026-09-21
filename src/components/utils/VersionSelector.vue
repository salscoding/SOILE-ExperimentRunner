<template>
  <Dropdown
    :class="dropDownClasses"
    v-model="selectedVersion"
    :options="availableVersions"
    :optionLabel="versionLabel"
    :loading="loading"
    :disabled="!element"
    placeholder="Select Version"
  />
</template>

<script>
import Dropdown from "primevue/select";
import { useElementStore } from "@/stores";
import { defineComponent } from "vue";
export default defineComponent({
  components: { Dropdown },
  props: {
    objectType: {
      type: String,
      required: true,
    },
    element: {
      type: Object,
      required: false,
    },
    version: {
      type: Object,
      required: false,
    },
    elementLabel: {
      type: String,
      default: "name",
    },
    versionLabel: {
      type: String,
      default: "tag",
    },
    dropDownClasses: {
      type: String,
    },
  },
  emits: ["update:element", "update:version"],
  data() {
    return {
      currentVersion: undefined,
      loading: false,
      availableVersions: [],
    };
  },

  setup() {
    const elementStore = useElementStore();
    return { elementStore: elementStore };
  },
  computed: {
    selectedVersion: {
      get() {
        return this.version ? this.version : this.currentVersion;
      },
      set(newValue) {
        // reset the version, since the value changed;
        console.log("setting version");
        this.currentVersion = newValue;
        this.$emit("update:version", newValue);
      },
    },
  },
  methods: {
    async updateAvailableVersions(UUID) {
      this.loading = true;
      const versions = await this.elementStore.getOptionsForElement(
        UUID,
        this.objectType.toLowerCase()
      );
      this.availableVersions = versions
        .filter((x) => x.tag)
        .map((x) => {
          return { tag: x.tag, version: x.version };
        });
      this.loading = false;
    },
  },
  watch: {
    "element.UUID": {
      async handler(newValue) {
        console.log("SelectedItem UUID changed");
        if (newValue) {
          this.updateAvailableVersions(newValue);
        }
      },
    },
  },
  async mounted() {
    // TODO: heck whether this savely works with onMounted or whether this should be done with onDisplay
    if (this.element.UUID) {
      this.updateAvailableVersions(this.element.UUID);
    }
  },
});
</script>
