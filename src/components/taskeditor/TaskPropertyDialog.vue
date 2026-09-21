<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :header="existing ? 'Edit Task Properties' : 'Create new Task'"
    :style="{ width: '80vw' }"
  >
    <div class="flex w-full">
      <div class="flex flex-column w-full">
        <div class="flex w-full m-3">
          <label for="name" class="col-2 font-bold">Name:</label>
          <InputText
            :disabled="existing"
            class="col-9"
            :class="nameValid ? '' : 'p-invalid'"
            v-model="name"
            ref="Name"
          ></InputText>
        </div>
        <div class="flex w-full m-3">
          <label class="col-2 font-bold">Task Type:</label>
          <DropDown
            ref="type"
            :class="selectedType ? '' : 'p-invalid'"
            v-model="selectedType"
            :options="typeOptions"
            class="col-9"
          ></DropDown>
        </div>
        <div class="flex w-full m-3">
          <label for="language_select" class="col-2 font-bold">Language:</label>
          <DropDown
            ref="language_select"
            :class="language ? '' : 'p-invalid'"
            v-model="language"
            editable
            :options="languages"
            class="col-9"
          ></DropDown>
        </div>
        <div class="flex w-full m-3">
          <label for="codetype" class="col-2 font-bold">Code Type:</label>
          <DropDown
            :class="existing || codetype ? '' : 'p-invalid'"
            :disabled="existing"
            :options="codeOptions"
            ref="codetype"
            v-model="codetype"
            optionLabel="language"
            class="col-9"
          ></DropDown>
        </div>
        <div class="flex w-full m-3 flex-column">
          <div class="flex w-full">
            <label for="codetype" class="col-2 font-bold">Keywords:</label>
            <Keywords
              class="w-9"
              :valid="keywordsOk"
              ref="keywords_selector"
              placeholder="Type or select keywords"
              :addedKeywords="keywords"
              @addKeyword="addKeyword"
              @removeKeyword="removeKeyword"
            ></Keywords>
          </div>
          <div class="flex w-full">
            <div class="col-2"></div>
            <div v-if="!keywordsOk" class="text-red-500 text-sm">
              At least 2 keywords are required
            </div>
          </div>
        </div>
        <div class="flex w-full m-3 flex-column">
          <div class="flex w-full">
            <label class="col-2 font-bold">Description:</label>
            <TextArea
              class="col-9"
              :class="descriptionOk ? '' : 'p-invalid'"
              v-model="description"
            ></TextArea>
          </div>
          <div class="flex w-full">
            <div class="col-2"></div>
            <div v-if="!descriptionOk" class="text-red-500 text-sm">
              Description must be at least 20 characters long
            </div>
          </div>
        </div>

        <div v-if="existing" class="flex w-full m-3">
          <label for="created_field" class="col-2 font-bold">Created:</label>
          <Calendar
            ref="created_field"
            :disabled="true"
            v-model="created"
            class="col-9"
          ></Calendar>
        </div>
        <div v-if="author" class="flex w-full m-3">
          <label for="author_field" class="col-2 font-bold">Author:</label>
          <InputText
            :disabled="author"
            v-model="author"
            ref="author_field"
            class="col-9"
          ></InputText>
        </div>
      </div>
    </div>
    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        @click="dialogVisible = false"
        text
      />
      <Button
        :label="submitLabel"
        icon="pi pi-check"
        @click="submitTask()"
        autofocus
        :disabled="!selectionValid"
      />
    </template>
  </Dialog>
</template>

<script>
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import DropDown from "primevue/select";
import InputText from "primevue/inputtext";
import TextArea from "primevue/textarea";
import Calendar from "primevue/datepicker";

import { storeToRefs } from "pinia";

import Keywords from "./Keywords.vue";

import { useElementStore, useAuthStore, useUserStore } from "../../stores";

export default {
  components: {
    Button,
    Calendar,
    Dialog,
    DropDown,
    Keywords,
    InputText,
    TextArea,
  },
  emits: ["update:visible"],
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    initialValues: {
      type: Object,
      required: false,
    },
  },
  setup() {
    const elementStore = useElementStore();
    const { existingTasks } = storeToRefs(elementStore);
    const authStore = useAuthStore();
    const userStore = useUserStore();
    return { elementStore, authStore, existingTasks, userStore };
  },
  data() {
    return {
      author: undefined,
      created: undefined,
      keywords: [],
      name: "",
      selectedType: "",
      language: "english",
      languages: ["finnish", "english"],
      codetype: null,
      description: "",
      typeOptions: ["Questionnaire", "Test", "Task Instruction", "Other"],
      codeOptions: [
        { language: "qmarkup", version: "1.0" },
        { language: "elang", version: "1.0" },
        { language: "javascript", version: "ES6" },
      ],
    };
  },
  methods: {
    addKeyword(keyword) {
      this.keywords.push(keyword);
    },
    removeKeyword(keyword) {
      console.log("Removing keyword:  " + keyword);
      let index = this.keywords.indexOf(keyword);
      if (index !== -1) {
        // Remove the item at the found index
        this.keywords.splice(index, 1);
      }
    },
    submitTask() {
      this.$emit("submit", {
        name: this.name,
        language: this.language,
        type: this.selectedType,
        codeType: this.codetype,
        keywords: this.keywords,
        description: this.description,
        author: this.author,
        created: this.created,
      });
    },
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(value) {
        this.$emit("update:visible", value);
      },
    },
    existingTaskNames() {
      return this.existingTasks.map((x) => x.name.toLowerCase());
    },
    nameValid() {
      return (
        this.existing ||
        (!this.existingTaskNames.includes(this.name.toLowerCase()) &&
          this.name.length > 3)
      );
    },
    submitLabel() {
      return this.existing ? "Update Task" : "Create Task";
    },
    selectionValid() {
      // TODO: Proper validation
      return (
        this.keywordsOk &&
        this.descriptionOk &&
        this.nameValid &&
        this.selectedType &&
        this.codetype &&
        this.language
      );
    },
    descriptionOk() {
      return this.description.length > 20;
    },
    keywordsOk() {
      console.log(this.keywords.length);
      return this.keywords.length >= 2;
    },
    existing() {
      if (this.initialValues) {
        return true;
      } else {
        return false;
      }
    },
  },
  async mounted() {
    if (this.initialValues) {
      this.existing = true;
      this.name = this.initialValues.name;
      this.type = this.initialValues.type;
      this.keywords = this.initialValues.keywords;
      this.codetype = this.initialValues.codeType;
      this.description = this.initialValues.description;
      this.selectedType = this.initialValues.type;
      this.author = this.initialValues.author;
      this.created = new Date(this.initialValues.created);
      this.language = this.initialValues.language;
    } else {
      const userData = await this.userStore.fetchUserInfo(this.authStore.user);
      this.author = userData.fullname ? userData.fullname : userData.username;
      this.created = Date.now();
    }
    this.elementStore.updateAvailableOptions("task", true);
  },
};
</script>
