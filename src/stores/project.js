import { defineStore } from "pinia";

import axios from "axios";
import { useErrorStore } from "./errors";

export const useProjectStore = defineStore("projects", {
  state: () => ({
    // initialize the state. We don't update from the local storage, because this could contain privilegded data
    signedUpStudies: [],
    availableStudies: [],
    currentTaskSettings: {},
    isRunningTask: false,
  }),
  actions: {
    clearData() {
      this.signedUpStudies = [];
      this.availableStudies = [];
      this.currentTaskSettings = {};
      this.isRunningTask = false;
    },
    /**
     * Update the studies available to the current user.
     */
    async updateAvailableStudies() {
      try {
        const response = await axios.post("/study/listrunning");
        console.log(response?.data);
        // update pinia state
        this.availableStudies = response?.data;
      } catch (e) {
        console.log("Error" + e);
        this.processAxiosError(e);
      }
    },
    /**
     * Clear all data
     */
    clearData() {
      this.signedUpStudies = [];
    },

    async updateStudies() {
      this.updateAvailableStudies();
      this.fetchSignedUpStudies();
    },

    /**
     * Fetch the studies the current user is signed up to.
     */
    async fetchSignedUpStudies() {
      try {
        console.log("Updating signed up projects");
        const response = await axios.post("/user/activeprojects");
        this.signedUpStudies = response?.data;
        console.log(response);
      } catch (error) {
        // unauthenticated is an expected error here, that we will ignore, but any other error should be resolved.
        if (!error.response?.status == 401) {
          console.log(error);
          this.processAxiosError(error);
        }
      }
    },
    /**
     * Fetch study data
     */
    async fetchStudyData(path) {
      try {
        const response = await axios.post(`/study/${path}/get`);
        return response.data;
      } catch (error) {
        // unauthenticated is an expected error here, that we will ignore, but any other error should be resolved.
        console.log(error);
        this.processAxiosError(error);
        return false;
      }
    },
    processAxiosError(err) {
      const errorStore = useErrorStore();
      errorStore.processAxiosError(err);
    },
    async updateTaskSettings(projectID) {
      console.log(projectID);
      if (projectID) {
        try {
          const response = await axios.post(
            "/study/" + projectID + "/getcurrenttaskinfo"
          );
          this.currentTaskSettings = response.data;
        } catch (error) {
          this.processAxiosError(error);
        }
      }
    },
    setTaskActive() {
      this.isRunningTask = true;
    },
    setTaskNotRunning() {
      this.isRunningTask = false;
    },
    async updaloadData(studyID, file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await axios.post(
          `/study/${studyID}/uploaddata`,
          formData
        );
        return response.data.id;
      } catch (error) {
        this.processAxiosError(error);
      }
    },
    getStudyDetails(UUIDorShortcut) {
      return this.availableStudies.find(
        (x) => x.shortcut === UUIDorShortcut || x.UUID === UUIDorShortcut
      );
    },
  },
});
