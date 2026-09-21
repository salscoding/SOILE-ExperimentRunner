<template>
  <label :style="style" :for="source_data.id">{{ source_data.label }}</label>
  <Dropdown
    class="ml-2"
    :class="isValid ? 'p-inputtext-sm' : 'p-invalid'"
    v-model="value"
    optionLabel="text"
    optionValue="value"
    :options="source_data.options"
    placeholder="--- Please select an option ---"
  />
</template>

<script>
import Dropdown from "primevue/select";

export default {
  props: {
    source_data: {
      type: Object,
      required: true,
    },
  },
  emits: ["dataUpdate"],
  components: { Dropdown },
  data() {
    return {
      value: null,
    };
  },
  watch: {
    value() {
      this.$emit("dataUpdate", {
        isValid: true,
        target: this.source_data.id,
        value: this.value,
      });
    },
    source_data(newValue) {
      if (newValue.value != undefined && newValue != null) {
        this.value = newValue.value;
      }
      if (newValue.required) {
        this.$emit("dataUpdate", {
          isValid: this.isValid,
          target: newValue.id,
          value: this.value,
        });
      }
    },
  },
  computed: {
    isValid() {
      return this.value ? true : false;
    },
    getComputedStyle() {
      return "width: " + this.data.width + "em";
    },
    style() {
      return Object.entries(this.source_data.style)
        .map(([k, v]) => `${k}:${v}`)
        .join(";");
    },
  },
  mounted() {},
};
</script>

<style scoped></style>
