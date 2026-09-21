<template>
  <Menubar :model="menuItems">
    <template #start>
      <div class="p-mr-2">
        <router-link to="/">
          Soile
          <!--<img src="path/to/your/logo.png" alt="Logo" />-->
        </router-link>
      </div>
    </template>
    <template #end>
      <DropDown
        v-model="currentLocale"
        :options="supportedLocales"
        optionLabel="name"
      ></DropDown>
      <HelpPage />
    </template>
  </Menubar>
  <StudyCreationDialog
    v-if="creationDialogVisible"
    v-model:visible="creationDialogVisible"
    @selected="(event) => handleCreation(event)"
  ></StudyCreationDialog>
  <StudyLoadDialog
    v-if="loadDialogVisible"
    v-model:visible="loadDialogVisible"
    :researchStudies="studyStore.researchStudies"
    @selected="(event) => handleLoad(event)"
  ></StudyLoadDialog>
</template>

<script>
import Menubar from "primevue/menubar";
import Menu from "primevue/menu";
import Dialog from "primevue/dialog";
import DropDown from "primevue/select";

import { computed, ref } from "vue";
import { mapState } from "pinia";

import { useAuthStore, useStudyStore, useLanguageStore } from "@/stores";
import { supportedLocales } from "@/i18n";
import Login from "./LoginForm.vue";
import StudyCreationDialog from "@/components/study/StudyCreationDialog.vue";
import StudyLoadDialog from "@/components/study/StudyLoadDialog.vue";
import HelpPage from "@/components/helppages/HelpPage.vue";
import { router } from "@/helpers/router.js";

export default {
  name: "TopNavbar",
  components: {
    Login,
    Menubar,
    Menu,
    Dialog,
    StudyCreationDialog,
    StudyLoadDialog,
    HelpPage,
    DropDown,
  },
  data() {
    return {
      creationDialogVisible: false,
      loadDialogVisible: false,
      showHelp: false,
    };
  },
  computed: {
    ...mapState(useLanguageStore, ["supportedLocales"]),
    currentLocale: {
      get() {
        return this.supportedLocales.find(
          (x) => x.id == this.languageStore.getLocale()
        );
      },
      set(newValue) {
        this.languageStore.setLocale(newValue.id);
      },
    },
    editingMenu() {
      return {
        label: "Project Editing",
        icon: "pi pi-wrench",
        command: () => {
          router.push("/editing");
        },
      };
    },
    studyMenu() {
      return {
        label: "Study Management",
        icon: "pi pi-file-edit",
        command:
          !this.isInManagement && this.studyStore.editingActive()
            ? () => {
                router.push("/management");
              }
            : null,
        items: [
          {
            label: "Create Study",
            icon: "pi pi-plus",
            command: () => {
              router.push("/management");
              this.creationDialogVisible = true;
            },
          },
          {
            label: "Load Study",
            icon: "pi pi-wrench",
            command: () => {
              this.loadDialogVisible = true;
              router.push("/management");
            },
          },
        ],
      };
    },
    userMenu() {
      const items = [];
      if (this.isLoggedIn) {
        if (!this.isAnonymous) {
          items.push({
            label: "Profile",
            icon: "pi pi-user",
            command: () => {
              this.$router.push("/profile");
            },
          });
        }
        items.push({
          label: "Logout",
          icon: "pi pi-fw pi-power-off",
          command: async () => {
            await this.authStore.logout();
            this.$router.push("/");
          },
        });
      }
      return {
        label: this.isLoggedIn ? "User" : this.$t("login"),
        icon: this.isLoggedIn ? "pi pi-user" : "pi pi-sign-in",
        items: this.isLoggedIn ? items : null,
        command: !this.isLoggedIn
          ? () => {
              this.$router.push("/login");
            }
          : null,
      };
    },
    userManagementMenu() {
      return {
        label: "User Management",
        icon: "pi pi-user-edit",
        command: () => {
          this.$router.push("/usermanagement");
        },
      };
    },

    menuItems() {
      const menus = [];
      if (this.isResearcher) {
        menus.push(this.editingMenu);
        menus.push(this.studyMenu);
      }
      if (this.isAdmin) {
        menus.push(this.userManagementMenu);
      }
      menus.push(this.userMenu);
      return menus;
    },
    isInManagement() {
      return this.$route.name === "Study Management";
    },
  },
  methods: {
    async handleCreation(event) {
      this.creationDialogVisible = false;
      console.log(event);
      if (event) {
        const studyID = await this.studyStore.createStudy(event);
        await this.studyStore.selectCurrentStudy(studyID);
      }
    },
    async handleLoad(event) {
      this.loadDialogVisible = false;
      if (event) {
        await this.studyStore.selectCurrentStudy(event.UUID);
      }
    },
  },
  setup() {
    const authStore = useAuthStore();
    const showLoginDialog = ref(false);
    const isLoggedIn = computed(() => authStore.authed);
    const isAnonymous = computed(() => authStore.isAnonymous);
    const isAdmin = computed(() => authStore.isAdmin());
    const isResearcher = computed(() => authStore.isResearcher());
    const studyStore = useStudyStore();
    const languageStore = useLanguageStore();
    return {
      showLoginDialog,
      isLoggedIn,
      authStore,
      isResearcher,
      isAdmin,
      studyStore,
      isAnonymous,
      languageStore,
    };
  },
};
</script>
