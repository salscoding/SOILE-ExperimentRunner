import { defineStore } from "pinia";
import axios from "axios";
import { useErrorStore } from "./errors";
import { extractQMarkUpOutputOptions } from "@/helpers/projecteditor/taskProcessor";
import { extractElangOutputOptions } from "../helpers/projecteditor/taskProcessor";
export const useElementStore = defineStore("elements", {
  state: () => ({
    // initialize the state. We don't update from the local storage, because this could contain privilegded data
    availableTasks: [],
    availableExperiments: [],
    availableProjects: [],
    existingTasks: [],
    existingExperiments: [],
    existingProjects: [],
    codeOptions: [],
    elements: { task: {}, project: {}, experiment: {} },
    outputOptions: new Map(),
    keywords: [],
  }),
  actions: {
    clearData() {
      this.availableTasks = [];
      this.availableExperiments = [];
      this.availableProjects = [];
      this.existingTasks = [];
      this.existingExperiments = [];
      this.existingProjects = [];
      this.codeOptions = [];
      this.elements = { task: {}, project: {}, experiment: {} };
      this.outputOptions = new Map();
    },

    /**
     * Process axios error. Mainly to avoid having to define the errorStore at many places.
     * @param {*} err
     */
    processAxiosError(err) {
      const errorStore = useErrorStore();
      errorStore.processAxiosError(err);
    },
    /**
     * Get the keywords available in the current tasks
     */
    async getKeywords() {
      await this.updateAvailableTasks(false);
      if (this.keywords.length == 0) {
        const newKeywords = [];
        for (const task of this.availableTasks) {
          newKeywords.push(...task.keywords);
        }
        this.keywords = Array.from(new Set(newKeywords));
      }
      return this.keywords;
    },
    /**
     * Get the options for the specified type
     * @param {String} type  One of "Task", "Experiment" or "Project"
     * @param {Boolean} full whether to obtain ALL elements available (also unaccessible, for checking purposes or not).
     */
    async updateAvailableOptions(type, full) {
      const usedType = type.toLowerCase();
      switch (usedType) {
        case "task":
          await this.updateAvailableTasks(full);
          return full ? this.existingTasks : this.availableTasks;
        case "project":
          await this.updateAvailableProjects(full);
          return full ? this.existingProjects : this.availableProjects;
        case "experiment":
          await this.updateAvailableExperiments(full);
          return full ? this.existingExperiments : this.availableExperiments;
      }
    },

    /**
     * Update the Projects available to the current user (i,.e where they have access to)
     */
    async updateAvailableProjects(full) {
      try {
        const response = await axios.post(
          "/project/list" + (full ? "?full=true" : "")
        );
        console.log(response?.data);

        // update pinia state
        if (full) {
          this.existingProjects = response?.data;
        } else {
          this.availableProjects = response?.data;
        }
        console.log(this.availableProjects);
      } catch (e) {
        console.log("Error" + e);
        this.processAxiosError(e);
      }
    },
    /**
     * Update the Experiments available to the current user (i,.e where they have access to)
     */
    async updateAvailableExperiments(full) {
      try {
        const response = await axios.post(
          "/experiment/list" + (full ? "?full=true" : "")
        );
        console.log(response?.data);

        // update pinia state
        if (full) {
          this.existingExperiments = response?.data;
        } else {
          this.availableExperiments = response?.data;
        }
      } catch (e) {
        console.log("Error" + e);
        this.processAxiosError(e);
      }
    },
    /**
     * Update the Tasks available to the current user (i,.e where they have access to)
     */
    async updateAvailableTasks(full) {
      try {
        const response = await axios.post(
          "/task/list" + (full ? "?full=true" : "")
        );
        console.log(response?.data);

        // update pinia state
        if (full) {
          this.existingTasks = response?.data;
        } else {
          this.availableTasks = response?.data;
        }
      } catch (e) {
        console.log("Error" + e);
        this.processAxiosError(e);
      }
    },
    /**
     * Update the Code Options available
     */
    async updateCodeOptions() {
      try {
        const response = await axios.get("/task/codeoptions");
        console.log(response?.data);

        // update pinia state
        this.codeOptions = response?.data;
      } catch (e) {
        console.log("Error" + e);
        this.processAxiosError(e);
      }
    },
    /**
     * Get the list of options/versions for the given element.
     * @param {string} UUID  the UUID of the element
     * @param {string} type type of element ('task','experiment' or 'project' )
     */
    async getOptionsForElement(UUID, type) {
      const usedType = type.toLowerCase();
      switch (usedType) {
        case "task":
          return await this.getTaskOptions(UUID);
        case "project":
          return await this.getProjectOptions(UUID);
        case "experiment":
          return await this.getExperimentOptions(UUID);
      }
    },
    /**
     * Get the available versions for a specific task
     * @param {string} UUID the UUID of the task
     */
    async getTaskOptions(UUID) {
      try {
        const response = await axios.post("/task/" + UUID + "/list");
        return response?.data;
      } catch (e) {
        console.log("Error" + e);
        this.processAxiosError(e);
      }
    },
    /**
     * Get the compiled code for the specified task at the specified version
     */
    async compileTask(UUID, version) {
      try {
        const element = await this.getElement(UUID, version, "task");
        if (element) {
          const response = await axios.post("/task/compile/", {
            code: element.code,
            type: element.codeType.language,
          });
          return response?.data;
        }
      } catch (err) {
        this.processAxiosError(err);
      }
    },
    /**
     * Get the outputs of a task
     * @param {*} task the task (with UUID, version and codeType)
     * @returns
     */
    async getTaskOutputs(task) {
      console.log("Trying to obtain Outputs");
      const taskKey = `${task.UUID}.${task.version}`;
      console.log("Key is " + taskKey);
      console.log(task);
      if (!this.outputOptions.has(taskKey)) {
        if (task.codeType.language === "qmarkup") {
          const compiled = await this.compileTask(task.UUID, task.version);
          if (compiled) {
            this.outputOptions.set(
              taskKey,
              extractQMarkUpOutputOptions(compiled)
            );
          } else {
            this.outputOptions.set({
              outputs: [],
              persistent: [],
              outputInfoType: "impossible",
            });
          }
        } else if (task.codeType.language === "elang") {
          this.outputOptions.set(taskKey, extractElangOutputOptions(task.code));
        } else if (task.codeType.language === "psychopy") {
          this.outputOptions.set(taskKey, {
            outputs: [],
            persistent: [],
            outputInfoType: "impossible",
          });
        } else {
          this.outputOptions.set(taskKey, {
            outputs: [],
            persistent: [],
            outputInfoType: "manual",
          });
        }
      }
      return this.outputOptions.get(taskKey);
    },

    /**
     * Get the available versions for a specific project
     * @param {string} UUID the UUID of the project
     */
    async getProjectOptions(UUID) {
      try {
        const response = await axios.post("/project/" + UUID + "/list");
        return response?.data;
      } catch (e) {
        console.log("Error" + e);
        this.processAxiosError(e);
      }
    },
    /**
     * Get the available versions for a specific experiment
     * @param {string} UUID the UUID of the experiment
     */
    async getExperimentOptions(UUID) {
      try {
        const response = await axios.post("/experiment/" + UUID + "/list");
        return response?.data;
      } catch (e) {
        console.log("Error" + e);
        this.processAxiosError(e);
      }
    },
    /**
     * get the list of objects for the given type. Makes it easier to write reusable components
     * Does not refresh the available components
     * @param {string} the type of element ('task','experiment' or 'project' )
     */
    getListForType(type) {
      const usedType = type.toLowerCase();
      switch (usedType) {
        case "task":
          return this.availableTasks;
        case "project":
          return this.availableProjects;
        case "experiment":
          return this.availableExperiments;
      }
    },
    /**
     * Get the list of tags for the specified items
     * @param {string} UUID  the UUID of the element
     * @param {string} type type of element ('task','experiment' or 'project' )
     */
    async getTagsForElement(UUID, type) {
      var options;
      const usedType = type.toLowerCase();
      switch (usedType) {
        case "task":
          options = await this.getTaskOptions(UUID);
          break;
        case "project":
          options = await this.getProjectOptions(UUID);
          break;
        case "experiment":
          options = await this.getExperimentOptions(UUID);
          break;
      }
      return options
        .filter((x) => x.tag)
        .map((x) => {
          return { tag: x.tag, version: x.version };
        });
    },
    /**
     * Remove tags for a given element.
     * @param {string} UUID  the UUID of the element
     * @param {string} type type of element ('task','experiment' or 'project' )
     * @param {array} tags the Tags to remove from the element.
     */
    async removeTagsForElement(UUID, type, tags) {
      const usedType = type.toLowerCase();
      try {
        const response = await axios.post(
          "/" + type.toLowerCase() + "/" + UUID + "/removetags",
          tags
        );
        return response.status == 200;
      } catch (err) {
        this.processAxiosError(err);
      }
    },
    /**
     * Remove tags for a given element.
     * @param {string} UUID  the UUID of the element
     * @param {string} type type of element ('task','experiment' or 'project' )
     * @param {String} tags the Tags to remove from the element.
     */
    async addTagForElement(UUID, version, type, tag) {
      try {
        const response = await axios.post(
          "/" + type.toLowerCase() + "/" + UUID + "/" + version + "/addtag",
          {
            name: tag,
          }
        );
        return response.status == 200;
      } catch (err) {
        this.processAxiosError(err);
      }
    },
    /**
     * Get the Tag of a specific element of the given type at a specific version.
     *
     * @param {String} type the type of the element ( task, experiment or project )
     * @param {String} UUID the uuid of the element
     * @param {String} version the version of the element
     * @returns {String} the tag of the element
     */
    async getTagForVersion(type, UUID, version) {
      const currentElement = await this.getElement(UUID, version, type);
      return currentElement.tag;
    },
    /**
     * Download a given Task at a specific version.
     * @param {*} taskID
     * @param {*} taskVersion
     */
    async downloadTask(taskID, taskVersion) {
      // This needs to use the session cookie for the download. Hopefully this works.
      const fileUrl = `${axios.defaults.baseURL}/task/${taskID}/${taskVersion}/download`;
      const link = document.createElement("a");
      link.href = fileUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    /**
     * Upload a new task from an exported zip file.
     * @param {File} file The file to upload
     * @param {String} taskName the name for the uploaded task
     */
    async uploadTask(file, taskname) {
      // This needs to use the session cookie for the download. Hopefully this works.
      const fileUrl = `/task/upload?name=${taskname}&tag=Uploaded_Version`;
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await axios.post(fileUrl, formData);

        return response.data;
      } catch (e) {
        console.log("Error" + e);
        this.processAxiosError(e);
        return null;
      }
    },
    /**
     * Get the options for  agiven type
     * @param {*} type The type to check
     * @param {*} full Wheter to only get the available options or the full options
     *
     */
    async retrieveOptionsforType(type, full) {
      // refresh if empty, otherwise we consider this ok.
      if (this.getOptionsforType(type, full) == 0) {
        this.updateAvailableOptions(type, full);
      }
      return this.getOptionsforType(type, full);
    },
    /**
     *
     * @param {*} type The type to check
     * @param {*} full Wheter to only get the available options or the full options
     *
     */
    async getOptionsforType(type, full) {
      const lc_type = type.toLowerCase();
      var options = undefined;
      switch (lc_type) {
        case "task":
          return full ? this.existingTasks : this.availableTasks;
          break;
        case "project":
          return full ? this.existingProjects : this.availableProjects;
          break;
        case "experiment":
          return full ? this.existingExperiments : this.availableExperiments;
          break;
      }
    },

    /**
     * Check whether a name is acceptable for a given type
     * @param {*} name The name to check
     * @param {*} type The type to check
     */
    async checkNameForType(name, type) {
      const lc_type = type.toLowerCase();
      switch (lc_type) {
        case "task":
        case "project":
        case "experiment":
      }
    },
    /**
     * Write an element and return th new version.
     * @param {*} UUID the UUID of the object
     * @param {*} version  the version of the object this version is derived from.
     * @param {*} data Only the codeType and code fields are required here.
     * @param {*} type the type (element, task or project) of the object
     * @return The new Version of the element;
     */
    async createElement(name, data, type, updateCallback) {
      let params;
      if (type.toLowerCase() === "task") {
        params = {
          name: name,
          codeType: data.codeType.language,
          codeVersion: data.codeType.version,
        };
      } else {
        params = { name: name };
      }

      axios
        .post("/" + type.toLowerCase() + "/create", null, {
          params: params,
        })
        .then(async (response) => {
          data.UUID = response.data.UUID;
          data.version = response.data.version;
          const newVersion = await this.updateElement(
            data.UUID,
            data.version,
            data,
            type
          );
          data.version = newVersion;
          updateCallback(data);
        })
        .catch((err) => {
          this.processAxiosError(err);
        });
    },

    /**
     * Get an element, either load (if not yet loaded) or take from memory.
     * @param {*} UUID the UUID of the object
     * @param {*} version  the version of the object
     * @param {*} type the type (element, task or project) of the object
     */
    async getElement(UUID, version, type) {
      const usedType = type.toLowerCase();
      try {
        const element = this.elements[usedType][UUID]
          ? this.elements[usedType][UUID][version]
          : undefined;
        if (element) {
          return element;
        } else {
          if (!this.elements[usedType][UUID]) {
            this.elements[usedType][UUID] = {};
          }
          const response = await axios.get(
            "/" + type.toLowerCase() + "/" + UUID + "/" + version + "/get"
          );
          this.elements[usedType][UUID][version] = response.data;
          if (!this.elements[usedType][UUID][version].tag) {
            try {
              const response = await axios.get(
                "/" +
                  type.toLowerCase() +
                  "/" +
                  UUID +
                  "/" +
                  version +
                  "/gettag"
              );
              this.elements[usedType][UUID][version].tag = response.data.tag;
            } catch (err) {
              // this needs to be caugth explicitly, as this indicates that the element has no Tag which can be ok.
              console.log("Caught error");
              this.processAxiosError(err);
              const errorStore = useErrorStore();
              errorStore.raiseError(
                "warn",
                `No Tag found for ${this.elements[usedType][UUID][version].name}`
              );
              //errorStore.processAxiosError(err);
            }
          }
          return this.elements[usedType][UUID][version];
        }
      } catch (err) {
        this.processAxiosError(err);
      }
    },
    /**
     * Write an element and return th new version.
     * @param {*} UUID the UUID of the object
     * @param {*} version  the version of the object this version is derived from.
     * @param {*} data the data of the elment (including version and UUID)
     * @param {*} type the type (element, task or project) of the object
     * @return The new Version of the element;
     */
    async updateElement(UUID, version, data, type) {
      try {
        const response = await axios.post(
          "/" + type.toLowerCase() + "/" + UUID + "/" + version + "/post",
          data
        );
        data.version = response.data.version;
        if (!this.elements[type.toLowerCase()][UUID]) {
          this.elements[type.toLowerCase()][UUID] = {};
        }
        this.elements[type.toLowerCase()][UUID][data.version] = data;
        return response.data.version;
      } catch (err) {
        this.processAxiosError(err);
      }
    },

    /**
     * Get the persistent data for a given task.
     * @param {String} UUID
     * @param {String} version
     */
    async getPersistentDataForTask(UUID, version) {
      const element = await this.getElement(UUID, version, "task");
      if (element.codeType.language === "elang") {
        const outputRegexp = /savevariable\( *"([^"]+)"/g;
        return [...element.code.matchAll(outputRegexp)].map((x) => x[1]);
      } else {
        return [];
      }
    },
    /**
     * Get the persistent data for the experiment indicated by the UUID and version
     * @param {String} UUID
     * @param {String} version
     * @returns
     */
    async getPersistentDataForExperiment(UUID, version) {
      const experiment = await this.getElement(UUID, version, "experiment");
      return this.getPersistentDataForExperimentInstance(experiment);
    },
    /**
     * Get the persistent data for the experimentinstance indicated by the UUID and version
     * @param {String} UUID
     * @param {String} version
     * @returns
     */
    async getPersistentDataForExperimentInstance(instance) {
      const persistentElements = new Set();
      for (const element of instance.elements) {
        if (element.type === "task") {
          const codeData = await this.getPersistentDataForTask(
            element.data.UUID,
            element.data.version
          );
          const instanceData = element.data.persistent;
          instanceData.array.forEach((value) => {
            persistentElements.add(value);
          });
          codeData.array.forEach((value) => {
            persistentElements.add(value);
          });
        }
        if (element.type === "experiment") {
          this.getPersistentDataForExperimentInstance(element.data).forEach(
            (value) => {
              persistentElements.add(value);
            }
          );
        }
      }
      return Array.from(persistentElements);
    },
    /**
     * Get the persistent data for the element indicated by the UUID and version along with its type (task or experiment)
     * @param {String} UUID
     * @param {String} version
     * @returns
     */
    async getPersistentDataForElement(UUID, version, type) {
      switch (type) {
        case "task":
          return await this.getPersistentDataForTask(UUID, version);
        case "experiment":
          return await this.getPersistentDataForExperiment(UUID, version);
      }
    },

    /**
     * Test whether a specific experiment can be randomized (i.e. has no filters in it)
     * @param {String} UUID
     * @param {String} version
     * @returns {Boolean}
     */
    async canExperimentBeRandomized(UUID, version) {
      const currentElement = await this.getElement(UUID, version, "experiment");
      for (const current of currentElement.elements) {
        // cannot be randomized if there are filters in the Experiment.
        if (current.type === "filter") {
          return false;
        }
      }
      return true;
    },

    /**
     * Get the list of Files for the task with the given UUID and version
     * @param {*} UUID
     * @param {*} version
     */
    async getFilesForTask(UUID, version) {
      try {
        const response = await axios.get(
          "/task/" + UUID + "/" + version + "/filelist"
        );
        return response.data;
      } catch (e) {
        console.log("Error" + e);
        this.processAxiosError(e);
      }
    },
    /**
     * Add a file to the given version of the given task.
     * @param {*} UUID
     * @param {*} version
     * @param {*} filename
     * @param {*} files the files to upload
     */
    async addFileToTask(UUID, version, filename, files) {
      try {
        const formData = new FormData();
        console.log(files);
        console.log(filename);
        for (const f of files) {
          console.log(f);
          formData.append("files", f.file, f.name);
        }
        const response = await axios.post(
          "/task/" + UUID + "/" + version + "/resource/" + filename,
          formData
        );

        return response.data.version;
      } catch (e) {
        console.log("Error" + e);
        this.processAxiosError(e);
        return null;
      }
    },

    /**
     * Remove the specified filename from the given task
     * @param {*} UUID
     * @param {*} version
     * @param {*} filename
     */
    async removeFileFromTask(UUID, version, filename) {
      try {
        const response = await axios.post(
          "/task/" +
            UUID +
            "/" +
            version +
            "/resource/" +
            filename +
            "?delete=true"
        );
        return response.data.version;
      } catch (e) {
        console.log("Error" + e);
        this.processAxiosError(e);
        return null;
      }
    },
    /**
     * Get a Resource file for the given task represented by the file name
     * @param {*} UUID
     * @param {*} version
     * @param {*} filename
     */
    async getResourceFile(UUID, version, filename) {
      try {
        const url = this.getResourceURL(UUID, version, filename);
        const response = await axios.get(url);
        return {
          url: url,
          filename: filename,
          data: response.data,
          type: response.headers["content-type"],
        };
      } catch (e) {
        console.log("Error" + e);
        this.processAxiosError(e);
        return null;
      }
    },
    /**
     * Get the URL of a resource in a specific task for a specific version
     * @param {*} UUID
     * @param {*} version
     * @param {*} filename
     */
    getResourceURL(UUID, version, filename) {
      return "/task/" + UUID + "/" + version + "/resource/" + filename;
    },
  },
});
