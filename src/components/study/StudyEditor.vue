<template>
  <h2>{{ currentEditedStudy?.name }}</h2>
  <div class="grid h-full studydisplay">
    <div class="displaypart col-4">
      <h3>Project Properties</h3>
      <ObjectAndVersionSelectorWithProps
        :dropDownClasses="isStudyEditable ? '' : 'p-disabled'"
        v-model:element="sourceProject"
        v-model:version="sourceVersion"
        objectType="project"
        versionTitle="at Version"
        elementTitle="Project Name"
      />
      <StudyProperties
        v-model:name="currentStudyName"
        v-model:descriptionShort="currentStudyShortDescription"
        v-model:descriptionLong="currentStudyDescription"
        v-model:shortCut="currentStudyShortcut"
        v-model:private="currentStudyPrivate"
        v-model:language="currentStudyLanguage"
        @update:valid="(event) => (dataValid = event)"
      />
      <StudyChanging
        :isActive="isActive"
        :isStudyEditable="isStudyEditable"
        @resetStudy="resetStudy"
        @deleteStudy="deleteStudy"
        @updateStudy="updateStudy"
        @pilotStudy="pilotStudy"
      />
    </div>
    <div class="displaypart col-4">
      <StudyActivity
        v-model:active="currentStudyActive"
        :accessTokens="accessTokens"
        :permanentToken="permanentAccessToken"
        :usedTokens="usedTokens"
        :studyID="currentEditedStudy?.UUID"
        :shortCut="currentStudyShortcut ? currentStudyShortcut : null"
        @createTokens="(event) => createAccessTokens(event)"
        @createMasterToken="createMasterToken"
      ></StudyActivity>

      <CollaboratorManager
        :availablePermissions="['READ', 'READ_WRITE', 'FULL']"
        :currentCollaborators="collaborators"
        :userList="userStore.users"
        listStyle=""
      ></CollaboratorManager>
    </div>
    <div class="displaypart col-4">
      Available Data
      <StudyDataSelector
        :studyID="currentEditedStudy?.UUID"
        :availableData="availableData"
      ></StudyDataSelector>
    </div>
  </div>
</template>

<script>
import Dropdown from "primevue/select";
import Button from "primevue/button";

import ObjectAndVersionSelectorWithProps from "@/components/utils/ObjectAndVersionSelectorWithProps.vue";
import {
  useStudyStore,
  useUserStore,
  useElementStore,
  usePilotStore,
  useProjectStore,
} from "@/stores";
import { reactive } from "vue";
import { mapState } from "pinia";

import { ConfirmDialog } from "@/components/dialogs";
import StudyChanging from "./StudyChanging.vue";
import StudyProperties from "./StudyProperties.vue";
import StudyActivity from "./StudyActivity.vue";
import CollaboratorManager from "./CollaboratorManager.vue";
import StudyDataSelector from "./StudyDataSelector.vue";
import UserEditor from "@/components/user/UserEditor.vue";

export default {
  components: {
    StudyDataSelector,
    ObjectAndVersionSelectorWithProps,
    Dropdown,
    StudyProperties,
    StudyActivity,
    UserEditor,
    Button,
    CollaboratorManager,
    ConfirmDialog,
    StudyChanging,
  },
  props: {
    editableStudies: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      dataValid: true,
      accessTokens: [],
      permanentAccessToken: null,
      usedTokens: [],
      availableData: {},
      collaborators: [],
      showUserDialog: false,
      showResetDialog: false,
      showDeleteDialog: false,
    };
  },
  setup(props) {
    console.log("Setting up StudyEditor");
    const studyStore = useStudyStore();
    const projectStore = useProjectStore();
    const pilotStore = usePilotStore();
    const userStore = useUserStore();
    const elementStore = useElementStore();
    return { elementStore, studyStore, userStore, pilotStore, projectStore };
  },
  computed: {
    ...mapState(useStudyStore, ["currentEditedStudy"]),
    currentStudyName: {
      get() {
        return this.currentEditedStudy?.name;
      },
      set(newValue) {
        this.currentEditedStudy.name = newValue;
      },
    },
    currentStudyPrivate: {
      get() {
        return this.currentEditedStudy?.private;
      },
      set(newValue) {
        this.currentEditedStudy.private = newValue;
      },
    },
    currentStudyShortcut: {
      get() {
        return this.currentEditedStudy?.shortcut;
      },
      set(newValue) {
        this.currentEditedStudy.shortcut = newValue;
      },
    },
    currentStudyDescription: {
      get() {
        return this.currentEditedStudy?.description;
      },
      set(newValue) {
        this.currentEditedStudy.description = newValue;
      },
    },
    currentStudyShortDescription: {
      get() {
        return this.currentEditedStudy?.shortDescription;
      },
      set(newValue) {
        this.currentEditedStudy.shortDescription = newValue;
      },
    },
    currentStudyLanguage: {
      get() {
        return this.currentEditedStudy?.language;
      },
      set(newValue) {
        this.currentEditedStudy.language = newValue;
      },
    },
    currentStudyActive: {
      get() {
        console.log("Updated value");
        console.log(this.currentEditedStudy?.active);
        return this.currentEditedStudy?.active;
      },
      set(newValue) {
        console.log("Updating activity");
        console.log(newValue);
        console.log(this.currentEditedStudy);
        this.currentEditedStudy.active = newValue;
      },
    },
    isStudyEditable() {
      return (
        (this.currentEditedStudy?.UUID == null || this.hasWriteAccess) &&
        (!this.availableData.participants ||
          this.availableData.participants.length == 0) && // This study cannot have any participants, if it does, the settings cannot be changed.
        !this.isActive
      );
    },
    isActive() {
      return this.currentStudyActive;
    },
    hasWriteAccess() {
      return this.editableStudies
        .map((x) => x.UUID)
        .includes(this.currentEditedStudy?.UUID);
    },
    sourceProject: {
      get() {
        return this.elementStore.availableProjects.find(
          (x) => x.UUID === this.currentEditedStudy?.sourceUUID
        );
      },
      set(newValue) {
        this.currentEditedStudy.sourceUUID = newValue.UUID;
      },
    },
    sourceVersion: {
      get() {
        return this.currentEditedStudy?.version;
      },
      set(newValue) {
        console.log(newValue);
        if (newValue) {
          this.currentEditedStudy.version = newValue.version;
        } else {
          this.currentEditedStudy.version = undefined;
        }
      },
      additionalUsersExist: {},
    },
    currentStudyID() {
      if (this.currentEditedStudy != null && this.currentEditedStudy?.UUID) {
        return this.currentEditedStudy?.UUID;
      } else {
        return null;
      }
    },
  },
  watch: {
    // on an updated project, we reparse it.
    async currentStudyActive(newValue) {
      console.log("Activity of current project changed");
      if (newValue) {
        await this.studyStore.activate(this.currentEditedStudy.UUID);
      } else {
        await this.studyStore.deactivate(this.currentEditedStudy.UUID);
      }
      this.projectStore.updateStudies();
    },
    currentEditedStudy(newValue) {
      this.updateData();
    },
  },
  methods: {
    updateRole(newRole, username) {
      const user = this.collaborators.find((x) => x.user === username);
      if (this.currentStudyID) {
        userStore
          .updateRoleInStudy(user, newRole, this.currentStudyID)
          .then((res) => {
            if (res) {
              this.collaborators[index].role = newRole;
            }
          });
      }
    },
    pilotStudy() {
      this.elementStore
        .getElement(
          this.currentEditedStudy.sourceUUID,
          this.currentEditedStudy.version,
          "project"
        )
        .then((element) => {
          this.pilotStore.setCurrentObject(element);
          console.log(
            "Setting language to study language: " +
              this.currentEditedStudy.language
          );
          this.$i18n.locale = this.currentEditedStudy.language;
          this.$router.push("/pilot/");
        });
    },
    async updateData() {
      console.log("Updating Data for Study in Editor");
      await this.studyStore.updateEditableStudies();
      this.updateTokenData();
      this.updateAvailableDLData();
      if (this.hasWriteAccess) {
        this.updateCollaborators();
      }
      this.userStore.fetchUserData();
    },
    async updateTokenData() {
      console.log("Updating token data");
      const tokenInformation = await this.studyStore.getTokenInformation(
        this.currentEditedStudy?.UUID
      );
      this.usedTokens = tokenInformation.usedTokens || [];
      this.accessTokens = tokenInformation.signupTokens || [];
      this.permanentAccessToken = tokenInformation.permanentAccessToken || "";
    },
    async updateAvailableDLData() {
      this.availableData = await this.studyStore.getDownloadableData(
        this.currentEditedStudy?.UUID
      );
    },
    async updateCollaborators() {
      if (this.currentStudyID) {
        const collabs = await this.studyStore.getCollaboratorsForStudy(
          this.currentStudyID
        );
        if (collabs) {
          this.collaborators = collabs;
        } else {
          this.collaborators = [];
        }
      }
    },
    async createAccessTokens(count) {
      await this.studyStore.generateTokens(this.currentEditedStudy.UUID, count);
      await this.updateTokenData();
    },
    async createMasterToken() {
      await this.studyStore.generateMasterToken(this.currentEditedStudy.UUID);
      await this.updateTokenData();
    },
    async updateStudy() {
      await this.studyStore.updateStudy(this.currentEditedStudy);
    },
    async resetStudy() {
      await this.studyStore.resetStudy(this.currentEditedStudy.UUID);
      this.updateData();
      this.showResetDialog = false;
    },
    async deleteStudy() {
      this.studyStore.deleteStudy(this.currentEditedStudy.UUID).then((done) => {
        if (done) {
          this.$router.push("/");
        }
      });
    },
  },
  mounted() {
    if (this.currentEditedStudy && this.currentEditedStudy.UUID) {
      console.log("StudyEditor Mounted");
      this.updateData();
      this.studyStore.selectCurrentStudy(this.currentEditedStudy.UUID);
    }
  },
};
</script>

<style scoped>
.displaypart {
  margin: 2px auto;
  border: 1px solid;
}
.studydisplay {
  min-height: 50vh;
  height: 100%;
}
</style>
