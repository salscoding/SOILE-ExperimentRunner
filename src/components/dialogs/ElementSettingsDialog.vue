<template>
  <Dialog v-model:visible="isVisible" modal header="Settings">
    <div>
      <div class="flex align-items-center mb-2">
        <label for="objectname">Name:</label>

        <InputText v-if="newElement" id="objectname" v-model="name" />
        <p class="ml-2" v-else>{{ name }}</p>
      </div>
      <div class="flex align-items-center mb-2">
        <label for="private" class="ml-2"> Private </label>
        <Checkbox v-model="private" name="private" :binary="true" />
      </div>
      <div v-if="hasCodeType">
        <div class="flex align-items-center mb-2">
          <Dropdown
            :class="dropDownClasses"
            v-model="codeType"
            :options="availableCodeTypes"
            :loading="loading"
            :placeholder="CodeType"
          />
        </div>
        <div class="flex align-items-center mb-2">
          <Dropdown
            :class="dropDownClasses"
            v-model="codeVersion"
            :options="codeVersionOptions"
            :disabled="codeVersionOptions.length == 0"
            placeholder="Code version"
          />
        </div>
      </div>
    </div>
    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        @click="isVisible = false"
        text
      ></Button>
      <Button
        label="Update Settings"
        :disabled="!canSubmit"
        icon="pi pi-check"
        @click="submit"
      ></Button>
    </template>
  </Dialog>
</template>

<script>
import Dropdown from "primevue/select";
import InputText from "primevue/inputtext";
import Checkbox from "primevue/checkbox";
import Dialog from "primevue/dialog";
import Button from "primevue/button";

import { defineComponent } from "vue";
export default defineComponent({
  components: { Dropdown, InputText, Button, Dialog, Checkbox },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    initialValues: {
      type: Object,
      required: false,
    },
    availableCodeTypes: {
      type: Object,
    },
    newElement: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["update:visible", "submit"],
  data() {
    return {
      codeType: undefined,
      codeVersion: undefined,
      private: false,
      name: false,
    };
  },
  methods: {
    submit() {
      if (this.availableCodeTypes) {
        this.$emit("submit", {
          codeType: this.codeType,
          codeVersion: this.codeVersion,
          name: this.name,
          private: this.private,
        });
      } else {
        this.$emit("submit", { name: this.name, private: this.private });
      }
    },
  },
  computed: {
    codeVersionOptions() {
      if (this.availableCodeTypes && this.codeType) {
        return this.availableCodeTypes[this.codeType].versions;
      } else {
        return [];
      }
    },
    codeTypeOptions() {
      if (this.availableCodeTypes) {
        return Object.getOwnPropertyNames(this.availableCodeTypes);
      }
      return [];
    },
    isVisible: {
      get() {
        return this.visible;
      },
      set(newValue) {
        this.$emit("update:visible", newValue);
      },
    },
    canSubmit() {
      if (this.name === "") {
        return false;
      } else {
        if (this.availableCodeTypes) {
          if (this.codeType == null || this.codeVersion == null) {
            return false;
          }
        }
      }
      return true;
    },
    hasCodeType() {
      return this.availableCodeTypes != null;
    },
  },

  async mounted() {
    // TODO: heck whether this savely works with onMounted or whether this should be done with onDisplay
    if (this.availableCodeTypes) {
      this.codeType = this.initialValues.codeType;
      this.codeVersion = this.initialValues.codeVersion;
    }
    this.name = this.initialValues.name;
    this.private = this.initialValues.private;
  },
});
</script>
