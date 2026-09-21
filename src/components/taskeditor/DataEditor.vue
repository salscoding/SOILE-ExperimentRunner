<template>
  <div>
    <Tabs v-model:value="activeIndex">
      <TabList>
        <Tab :value="0">
          <span> Source Code </span>
          <Button
            size="small"
            :disabled="!sourceChanged"
            icon="pi pi-save"
            @click="
              $emit('saveSource');
              sourceChanged = false;
            "
          />
        </Tab>
        <Tab
          v-for="(fileTab, index) in tabs"
          :key="fileTab.fullpath || index"
          :value="index + 1"
        >
          <span v-tooltip="fileTab.fullpath">
            {{ fileTab.filename }}
          </span>
          <Button
            size="small"
            icon="pi pi-times"
            @click.stop="$emit('closeFile', fileTab)"
          />
          <Button
            size="small"
            :disabled="!fileTab.modified"
            icon="pi pi-save"
            @click.stop="$emit('saveFile', fileTab)"
          />
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel :value="0">
          <CodeEditor
            :inputText="sourceCode"
            :inputLanguage="sourceLanguage"
            @update:inputText="
              $emit('update:sourceCode', $event);
              sourceChanged = true;
            "
          />
        </TabPanel>
        <TabPanel
          v-for="(fileTab, index) in tabs"
          :key="fileTab.fullpath || index"
          :value="index + 1"
        >
          <CodeEditor
            :inputText="fileTab.data"
            @update:inputText="$emit('updateData', { index, value: $event })"
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script>
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import Button from "primevue/button";

import CodeEditor from "./CodeEditor.vue";

export default {
  components: {
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    CodeEditor,
    Button,
  },
  props: {
    tabs: {
      type: Array,
      required: true,
    },
    sourceCode: {
      type: String,
      required: true,
    },
    selectedFile: {
      type: Number,
      required: true,
    },
    sourceLanguage: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      sourceChanged: false,
    };
  },
  emits: [
    "update:sourceCode",
    "updateData",
    "closeFile",
    "saveFile",
    "saveSource",
    "update:selectedFile",
  ],
  computed: {
    activeIndex: {
      set(newValue) {
        this.$emit("update:selectedFile", newValue);
      },
      get() {
        return this.selectedFile;
      },
    },
  },
  methods: {},
};
</script>
