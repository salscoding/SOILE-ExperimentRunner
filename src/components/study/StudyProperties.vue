<template>
  <div class="grid">
    <div class="col">
      <label for="name">Name</label>
    </div>
    <div class="col">
      <InputText
        :class="{ 'p-invalid': !nameValid }"
        id="name"
        v-model="currentName"
      />
    </div>
  </div>
  <div class="grid">
    <div class="col">
      <label for="description">Description</label>
    </div>
    <div class="col">
      <TextArea id="description" v-model="currentDescriptionLong" />
    </div>
  </div>
  <div class="grid">
    <div class="col">
      <label for="shortDescription">Short Description</label>
    </div>
    <div class="col">
      <InputText id="shortDescription" v-model="currentDescriptionShort" />
    </div>
  </div>
  <div class="grid">
    <div class="col">
      <label for="shortcut">Study URL Shortcut</label>
    </div>
    <div class="col">
      <div>
        <InputText
          id="shortcut"
          :class="{ 'p-invalid': !shortCutValid }"
          v-model="currentShortCut"
          :maxlength="15"
        />
      </div>
      <div>
        <small v-if="!shortCutValid" class="p-error" id="text-error"
          >Shortcut can be max 20 characters and needs to be alphanumeric</small
        >
      </div>
    </div>
  </div>
  <div class="grid">
    <div class="col">
      <label for="shortcut">Language</label>
    </div>
    <div class="col">
      <div>
        <DropDown
          :options="supportedLocales"
          optionLabel="name"
          id="language"
          v-model="currentLanguage"
        />
      </div>
    </div>
  </div>
  <div class="grid">
    <div class="col">
      <label for="private">Private</label>
    </div>
    <div class="col">
      <Checkbox v-model="currentPrivate" :binary="true" />
    </div>
  </div>
</template>

<script>
import Checkbox from "primevue/checkbox";
import InputText from "primevue/inputtext";
import TextArea from "primevue/textarea";
import DropDown from "primevue/select";

import { mapState } from "pinia";

import ObjectAndVersionSelector from "@/components/utils/ObjectAndVersionSelector.vue";
import { supportedLocales } from "@/i18n";
import { useLanguageStore } from "@/stores";

export default {
  components: { TextArea, InputText, Checkbox, DropDown },
  emits: [
    "update:valid",
    "update:name",
    "update:shortCut",
    "update:descriptionShort",
    "update:descriptionLong",
    "update:private",
    "update:language",
  ],

  props: {
    name: {
      type: String,
      required: true,
    },
    descriptionShort: {
      type: String,
      required: true,
    },
    descriptionLong: {
      type: String,
      required: true,
    },
    shortCut: {
      type: String,
      required: true,
    },
    private: {
      type: Boolean,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState(useLanguageStore, ["supportedLocales"]),
    currentLanguage: {
      get() {
        return this.supportedLocales.find((x) => x.id == this.language);
      },
      set(newValue) {
        this.$emit("update:language", newValue.id);
      },
    },
    currentName: {
      set(newValue) {
        this.$emit("update:name", newValue);
      },
      get() {
        return this.name;
      },
    },
    currentDescriptionShort: {
      set(newValue) {
        this.$emit("update:descriptionShort", newValue);
      },
      get() {
        return this.descriptionShort;
      },
    },
    currentDescriptionLong: {
      set(newValue) {
        this.$emit("update:descriptionLong", newValue);
      },
      get() {
        return this.descriptionLong;
      },
    },
    currentShortCut: {
      set(newValue) {
        this.$emit("update:shortCut", newValue);
      },
      get() {
        return this.shortCut;
      },
    },
    currentPrivate: {
      set(newValue) {
        this.$emit("update:private", newValue);
      },
      get() {
        return this.private;
      },
    },
    shortCutValid() {
      const isValid =
        (this.shortCut.search(/^[0-9a-zA-Z]*$/) == 0 ||
          this.shortCut.length == 0) &&
        this.shortCut.length <= 20;
      this.$emit("update:valid", isValid && this.nameValid);
      return isValid;
    },
    nameValid() {
      this.$emit("update:valid", this.name.length > 0 && this.shortCutValid);
      return this.name.length > 0;
    },
  },
};
</script>
