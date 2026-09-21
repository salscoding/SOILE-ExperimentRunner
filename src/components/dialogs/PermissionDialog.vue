<template>
  <Dialog v-model:visible="dialogVisible" header="User Details" modal>
    <ProgressSpinner v-if="loading"></ProgressSpinner>
    <Tabs v-else value="tasks">
      <TabList>
        <Tab value="tasks">Tasks</Tab>
        <Tab value="experiments">Experiments</Tab>
        <Tab value="projects">Projects</Tab>
        <Tab value="studies">Studies</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="tasks">
          <PermissionSelector
            :currentPermissions="currentPermissions?.permissions?.tasks"
            :availablePermissions="availablePermissions"
            :availableElements="availableTasks"
            @savePermissions="(event) => savePermissions(event, 'TASK')"
          >
          </PermissionSelector>
        </TabPanel>
        <TabPanel value="experiments">
          <PermissionSelector
            :currentPermissions="currentPermissions?.permissions?.experiments"
            :availablePermissions="availablePermissions"
            :availableElements="availableExperiments"
            @savePermissions="(event) => savePermissions(event, 'EXPERIMENT')"
          >
          </PermissionSelector>
        </TabPanel>
        <TabPanel value="projects">
          <PermissionSelector
            :currentPermissions="currentPermissions?.permissions?.projects"
            :availablePermissions="availablePermissions"
            :availableElements="availableProjects"
            @savePermissions="(event) => savePermissions(event, 'PROJECT')"
          >
          </PermissionSelector>
        </TabPanel>
        <TabPanel value="studies">
          <PermissionSelector
            :currentPermissions="currentPermissions?.permissions?.instances"
            :availablePermissions="availablePermissions"
            :availableElements="availableStudies"
            @savePermissions="(event) => savePermissions(event, 'STUDY')"
          >
          </PermissionSelector>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Dialog>
</template>

<script>
import Dialog from "primevue/dialog";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import ProgressSpinner from "primevue/progressspinner";

import { useStudyStore, useElementStore, useUserStore } from "@/stores";
import { reactive } from "vue";
import { storeToRefs } from "pinia";
import PermissionSelector from "@/components/utils/PermissionSelector.vue";

export default {
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    user: {
      type: String,
      required: true,
    },
  },
  components: {
    Dialog,
    PermissionSelector,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    ProgressSpinner,
  },
  data() {
    return {
      //TODO: refactor to remove instances
      currentPermissions: null,
      availablePermissions: ["READ", "READ_WRITE", "FULL"],
      availableStudies: [],
    };
  },
  methods: {
    async updateCurrentPermissions(user) {
      if (user) {
        console.log("Updating permissions");
        const newPermissions = await this.userStore.getPermissions(user);
        if (newPermissions) {
          this.currentPermissions = newPermissions;
        } else {
          resetPermissionInfo();
        }
      }
    },
    /**
     * Reset the information. (e.g. if no user is selected)
     */
    resetPermissionInfo() {
      this.currentPermissions = null;
    },
    savePermissions(permissions, type) {
      if (this.user != null) {
        this.userStore.setPermissions(
          this.user,
          permissions.map((x) => {
            return { type: x.permission, target: x.id };
          }),
          type,
        );
      }
    },
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(value) {
        console.log;
        this.$emit("update:visible", value);
      },
    },
    loading() {
      console.log("Updating loading");
      return this.currentPermissions == null;
    },
  },
  setup() {
    const studyStore = useStudyStore();
    const userStore = useUserStore();
    const elementStore = useElementStore();
    const { availableTasks, availableExperiments, availableProjects } =
      storeToRefs(elementStore);
    return {
      availableTasks,
      availableExperiments,
      availableProjects,
      elementStore,
      studyStore,
      userStore,
    };
  },
  watch: {
    user(newValue) {
      console.log("User updated as: " + newValue);
      this.updateCurrentPermissions(newValue);
    },
  },
  async mounted() {
    this.availableStudies = await this.studyStore.getAllStudies();
    await this.elementStore.updateAvailableProjects();
    await this.elementStore.updateAvailableTasks();
    await this.elementStore.updateAvailableExperiments();
    console.log("Mounted with user: " + this.user);
    console.log(this.availableTasks);
    await this.updateCurrentPermissions(this.user);
  },
};
</script>
