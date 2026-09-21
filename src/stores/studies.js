import { defineStore } from "pinia";
import axios from "axios";
import { useErrorStore } from "./errors";

export const useStudyStore = defineStore("studies", {
  state: () => ({
    // initialize the state. We don't update from the local storage, because this could contain privilegded data
    currentEditedStudy: JSON.parse(
      sessionStorage.getItem("soile:currentStudy")
    ),
    researchStudies: [],
    editableStudies: [],
  }),
  actions: {
    clearData() {
      this.currentEditedStudy = null;
      sessionStorage.removeItem("soile:currentStudy");
      this.researchStudies = [];
      this.editableStudies = [];
    },
    async updateResearchStudies() {
      try {
        const response = await axios.post("/study/list?access=read");
        console.log(response?.data);
        // update pinia state
        this.researchStudies = response?.data;
      } catch (e) {
        console.log("Error" + e);
        this.processAxiosError(e);
      }
    },
    async updateEditableStudies() {
      try {
        const response = await axios.post("/study/list?access=write");
        console.log(response?.data);
        // update pinia state
        this.editableStudies = response?.data;
      } catch (e) {
        console.log("Error" + e);
        this.processAxiosError(e);
      }
    },
    editingActive() {
      return this.currentEditedStudy != null;
    },
    /**
     *
     * @param {*} UUID the UUID of the project
     */
    async fetchProjectData(UUID) {
      try {
        const response = await axios.post("/study/" + UUID);
        return response.data;
      } catch (error) {
        this.processAxiosError(error);
      }
    },
    /**
     * Generate a master token for the indicated project.
     * @param {} UUID
     */
    async generateMasterToken(UUID) {
      try {
        const response = await axios.post(
          "/study/" + UUID + "/createtokens?unique=true"
        );
        return response.data;
      } catch (error) {
        this.processAxiosError(error);
      }
    },
    /***
     * Generate access tokens for the given project.
     */
    async generateTokens(UUID, count) {
      try {
        const response = await axios.post(
          "/study/" +
            UUID +
            "/createtokens?count=" +
            count +
            "&" +
            "unique=false"
        );
        return response.data;
      } catch (error) {
        this.processAxiosError(error);
      }
    },
    /**
     * Get information about tokens for this project
     * @param {*} UUID
     */
    async getTokenInformation(UUID) {
      try {
        const response = await axios.post("/study/" + UUID + "/tokeninfo");
        return response.data;
      } catch (error) {
        this.processAxiosError(error);
      }
    },
    /**
     * Get information about tokens for this project
     * @param {*} UUID
     */
    async getDownloadableData(UUID) {
      try {
        const response = await axios.post("/study/" + UUID + "/data/list");
        return response.data;
      } catch (error) {
        this.processAxiosError(error);
      }
    },
    /**
     * Request a download, returns the downloadID to be used to re-query the back-end for
     * the download status
     * @param {*} UUID
     * @param {*} request
     */
    async requestDownload(UUID, request) {
      try {
        const response = await axios.post(`/study/${UUID}/data`, request);
        console.log(response.data);
        console.log(response);
        return response.data.downloadID;
      } catch (error) {
        this.processAxiosError(error);
        return false;
      }
    },

    /**
     * RRequest the status of a download (i.e. whether it is ready and can be started available)
     * @param {*} studyID the ID of the study the dowwnload is associated with
     * @param {*} downloadID the download ID.
     */
    async requestDownloadStatus(studyID, downloadID) {
      try {
        const response = await axios.post(
          `/study/${studyID}/download/${downloadID}/check`
        );
        return response.data;
      } catch (error) {
        this.processAxiosError(error);
        return false;
      }
    },
    /**
     * Update the stored study with up to date information.
     */
    updateStore(UUID) {
      if (UUID === this.currentEditedStudy?.UUID) {
        sessionStorage.setItem(
          "soile:currentStudy",
          JSON.stringify(this.currentEditedStudy)
        );
      }
    },
    /**
     * Update a given study.
     * @param {*} studyData
     */
    async updateStudy(studyData) {
      try {
        const response = await axios.post(
          `/study/${studyData.UUID}/update`,
          studyData
        );
        this.updateStore(studyData.UUID);
        return response.data;
      } catch (error) {
        console.error(error);
        this.processAxiosError(error);
        return false;
      }
    },
    /**
     * Reset a given study.
     * @param {*} studyID
     */
    async resetStudy(studyID) {
      try {
        await axios.post(`/study/${studyID}/reset`);
        return true;
      } catch (error) {
        this.processAxiosError(error);
        return false;
      }
    },
    /**
     * Delete a given study.
     * @param {*} studyID
     */
    async deleteStudy(studyID) {
      try {
        await axios.post(`/study/${studyID}/delete`);
        this.clearData();
        await this.updateResearchStudies();
        await this.updateEditableStudies();
        return true;
      } catch (error) {
        this.processAxiosError(error);
        return false;
      }
    },
    /**
     * Download results for the given Study ID and the given downloadID.
     * @param {*} studyID
     * @param {*} downloadID
     */
    async downloadResults(studyID, downloadID) {
      /* const response = await axios.get(
        `/study/${studyID}/download/${downloadID}`,
        {
          responseType: "stream",
        }
      );
      const contentDispositionHeader = response.headers["content-disposition"];
      const filename = contentDispositionHeader
        ? contentDispositionHeader.split("filename=")[1]
        : "file.txt";
      console.log(response.headers);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([response.data]));
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }*/
      // This needs to use the session cookie for the download. Hopefully this works.
      const fileUrl = `${axios.defaults.baseURL}/study/${studyID}/download/${downloadID}`;
      const link = document.createElement("a");
      link.href = fileUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    /**
     * Activate the project with the given id
     * @param {*} UUID
     */
    async activate(UUID) {
      try {
        const response = await axios.post("/study/" + UUID + "/start");
        this.updateStore(UUID);
        return true;
      } catch (error) {
        this.processAxiosError(error);
        return false;
      }
    },

    /**
     * Activate the project with the given id
     * @param {*} UUID
     */
    async deactivate(UUID) {
      try {
        const response = await axios.post("/study/" + UUID + "/stop");
        return true;
      } catch (error) {
        this.processAxiosError(error);
        return false;
      }
    },

    processAxiosError(err) {
      const errorStore = useErrorStore();
      errorStore.processAxiosError(err);
    },
    // create a new Study based on the given data.
    async createStudy(studyData) {
      try {
        const response = await axios.post(
          `/project/${studyData.sourceUUID}/${studyData.version}/init`,
          studyData
        );
        return response.data.projectID;
      } catch (error) {
        this.processAxiosError(error);
        return false;
      }
    },
    /**
     * Select the currently edited Study.
     * @param {*} UUID
     */
    async selectCurrentStudy(UUID) {
      try {
        const response = await axios.post(`/study/${UUID}/get`);
        console.log(response.data);
        console.log(response);
        if (!response.data.shortcut) {
          response.data.shortcut = "";
        }
        this.currentEditedStudy = response.data;
        sessionStorage.setItem(
          "soile:currentStudy",
          JSON.stringify(this.currentEditedStudy)
        );
      } catch (error) {
        this.processAxiosError(error);
        return false;
      }
    },
    async getCollaboratorsForStudy(UUID) {
      try {
        const response = await axios.post(`/study/${UUID}/collaborators`);
        console.log(response.data);
        console.log(response);
        return response.data;
      } catch (error) {
        this.processAxiosError(error);
        return false;
      }
    },
    /**
     * Get all available studies, irrespective of access rights (only callable by admins).
     */
    async getAllStudies() {
      try {
        const response = await axios.post(`/study/list?full=true`);
        return response.data;
      } catch (error) {
        this.processAxiosError(error);
        return false;
      }
    },
  },
});
