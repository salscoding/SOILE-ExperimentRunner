<template>
  <Dialog v-model:visible="dialogVisible" header="Version Management" modal>
    <Tabs value="remove">
      <TabList>
        <Tab value="remove">Remove Versions</Tab>
        <Tab value="recover">Recover Versions</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="remove">
          <VersionManager
            :UUID="UUID"
            :type="type"
            :elementVersionList="elementVersionList"
            @refreshData="updateData"
          ></VersionManager>
        </TabPanel>
        <TabPanel value="recover">
          <VersionManager
            :UUID="UUID"
            :type="type"
            :removeVersions="false"
            :elementVersionList="elementVersionList"
            @refreshData="updateData"
          ></VersionManager>
        </TabPanel>
      </TabPanels>
    </Tabs>
    <template #footer>
      <Button
        label="Close"
        icon="pi pi-times"
        @click="$emit('update:isVisible', false)"
        text
      />
    </template>
  </Dialog>
</template>

<script>
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import VersionManager from "@/components/utils/VersionManager.vue";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import { useElementStore } from "@/stores";

export default {
  name: "ElementVersionDialog",
  components: {
    Dialog,
    Button,
    VersionManager,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
  },
  emits: ["update:isVisible"],
  props: {
    UUID: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    isVisible: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      elementVersionList: [],
    };
  },
  setup() {
    const elementStore = useElementStore();
    return { elementStore };
  },
  methods: {
    async updateData() {
      this.elementVersionList = await this.elementStore.getOptionsForElement(
        this.UUID,
        this.type,
      );
    },
  },
  computed: {
    dialogVisible: {
      get() {
        return this.isVisible;
      },
      set(value) {
        this.$emit("update:isVisible", value);
      },
    },
  },
  async mounted() {
    this.updateData();
  },
};
</script>
