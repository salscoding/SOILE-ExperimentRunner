<template>
  <Dialog v-model:visible="isVisible" modal :header="'Saving ' + name">
    <div class="flex flex-column mb-2 w-full">
      <label for="tag" class="mr-2">Version Name:</label>
      <InputText
        :class="isTagNotOk ? 'p-invalid' : ''"
        id="tag"
        v-model="tag"
      />
      <span v-if="isTagNotOk" class="text-red-500 text-sm">
        {{ tagNotOkText }}
      </span>
      <span v-else="isTagNotOk" class="text-white text-sm"> Tag </span>
    </div>
    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        @click="isVisible = false"
        text
      ></Button>
      <Button
        label="Save Version"
        :disabled="isTagNotOk"
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
    name: {
      type: String,
      required: true,
    },
    currentTags: {
      type: Array,
      required: true,
    },
  },
  emits: ["update:visible", "submit"],
  data() {
    return {
      tag: "",
    };
  },
  methods: {
    submit() {
      this.$emit("submit", this.tag);
    },
  },
  computed: {
    isTagNotOk() {
      return this.tag === "" || this.currentTags.includes(this.tag);
    },
    tagNotOkText() {
      return this.tag === ""
        ? "You need to provide a tag for this version"
        : `Tag ${this.tag} already exists for ${this.name}`;
    },
    isVisible: {
      get() {
        return this.visible;
      },
      set(newValue) {
        this.$emit("update:visible", newValue);
      },
    },
  },
});
</script>
