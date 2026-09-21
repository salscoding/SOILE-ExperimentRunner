import { defineStore } from "pinia";

import { useErrorStore } from "./errors";
import { useElementStore } from "./elements";
import { useBaklava } from "@baklavajs/renderer-vue";
import { reactive } from "vue";
const defaultData = {
  task: {
    code: "",
    name: undefined,
    UUID: undefined,
    version: undefined,
    tag: undefined,
    private: false,
    codeType: {
      language: undefined,
      version: undefined,
    },
    description: undefined,
    keywords: undefined,
    author: undefined,
    created: undefined,
    type: undefined,
  },
  experiment: {
    name: undefined,
    UUID: undefined,
    version: undefined,
    tag: undefined,
    private: false,
    elements: [],
  },
  project: {
    name: undefined,
    UUID: undefined,
    version: undefined,
    tag: undefined,
    private: false,
    start: undefined,
    tasks: [],
    experiments: [],
    filters: [],
    randomizers: [],
  },
};

export const useEditorStore = defineStore("editing", {
  state: () => ({
    // initialize the state. We don't update from the local storage, because this could contain privilegded data
    experiments: { active: 0, elements: [], id: "experiment" },
    projects: { active: 0, elements: [], id: "project" },
    tasks: { active: 0, elements: [], id: "task" },
    activeElement: "",
  }),
  actions: {
    clearData() {
      this.experiments = { active: 0, elements: [] };
      this.projects = { active: 0, elements: [] };
      this.tasks = { active: 0, elements: [] };
      this.activeElement = "";
    },
    getDefaultDataForType(type) {
      return reactive(
        JSON.parse(JSON.stringify(defaultData[type.toLowerCase()]))
      );
    },
    createElement(type, data) {
      console.log(data);
      var elementData = this.getDefaultDataForType(type.toLowerCase());
      const store = this.getStoreForType(type);
      const existentNames = store.elements.map((x) => x.name);
      var name = this.uniqueID(type, existentNames);
      if (data) {
        console.log(data);
        elementData = data;
        name = data.name;
      }
      this.createElementForType(type, name, elementData, true);
      store.active = store.elements.length - 1;
      this.activeElement = type;
    },
    createElementForType(type, name, data, newElement) {
      console.log("Creating element for " + type);
      data.name = name;
      const store = this.getStoreForType(type);
      if (
        type.toLowerCase() === "experiment" ||
        type.toLowerCase() === "project"
      ) {
        console.log("Initializing new editor for object");
        store.elements.push(
          reactive({
            name: name,
            newElement: newElement,
            data: data,
            editor: useBaklava(),
          })
        );
      } else {
        // Tasks have an additional currentVersion because they can have a changed version
        // from the original saved task if e.g. files have been added but the task has not been stored.
        store.elements.push(
          reactive({
            name: name,
            newElement: newElement,
            data: data,
            currentVersion: data?.version,
          })
        );
      }
    },
    async changeElementAtPosition(type, index, UUID, version) {
      const data = await this.loadObject(type, UUID, version);
      const store = this.getStoreForType(type);
      store.elements[index].data = data;
    },
    // load an element and push
    async loadElement(type, elementName, elementID, elementVersion) {
      console.log(type);
      const store = this.getStoreForType(type);
      console.log(store);
      for (const [i, element] of store.elements.entries()) {
        if (
          element.name === elementName &&
          element.data?.version === elementVersion
        ) {
          store.active = i;
          this.activeElement = type;
          return;
        }
      }
      // not present, so we need to actually load it.
      const data = await this.loadObject(type, elementID, elementVersion);
      this.createElementForType(type, elementName, data, false);
      store.active = store.elements.length - 1;
      this.activeElement = type;
    },
    /**
     * Change an element to represent a specific UUID and version
     * @param {String} type the type of the element
     * @param {*} index
     * @param {*} UUID
     * @param {*} version
     */
    async changeElement(type, UUID, version, index) {
      console.log(type);
      const store = this.getStoreForType(type);
      // not present, so we need to actually load it.
      const data = await this.loadObject(type, UUID, version);
      store.elements[index].data = data;
    },
    getStoreForType(type) {
      const currentType = type.toLowerCase();
      switch (currentType) {
        case "task":
          return this.tasks;
        case "project":
          return this.projects;
        case "experiment":
          return this.experiments;
      }
    },
    uniqueID(prefix, existing) {
      var i = 1;
      // ugly but we need unique names.
      while ([...existing.values()].some((v) => v === prefix + " " + i)) {
        i = i + 1;
      }
      return prefix + " " + i;
    },
    async loadObject(type, id, version) {
      const elementStore = useElementStore();
      return await elementStore.getElement(id, version, type);
    },
    processAxiosError(err) {
      const errorStore = useErrorStore();
      errorStore.processAxiosError(err);
    },
    async saveObject(type, data, index) {
      if (!data.UUID) {
        return this.createObject(type, data, index);
      }
      const elementStore = useElementStore();
      const newVersion = await elementStore.updateElement(
        data.UUID,
        data.version,
        data,
        type
      );
      const store = this.getStoreForType(type);
      data.version = newVersion;
      store.elements[index].data = reactive(data);
    },
    async createObject(type, data, index) {
      const elementStore = useElementStore();
      const updateElement = (newObject) => {
        const store = this.getStoreForType(type);
        store.elements[index].data = reactive(newObject);
        store.elements[index].newElement = false;
      };
      const newObject = await elementStore.createElement(
        data.name,
        data,
        type,
        updateElement
      );
    },
    updateCurrentTaskVersion(version, index) {
      this.tasks.elements[index].currentVersion = version;
    },
  },
});
