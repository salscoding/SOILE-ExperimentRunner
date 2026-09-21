<template>
  <Dropdown
    v-if="optionLabel != null"
    :options="options"
    v-model="currentValue"
    :optionLabel="optionLabel"
    @change="(event) => $emit('change', event)"
  ></Dropdown>
  <Dropdown
    v-else
    :options="options"
    v-model="currentValue"
    @change="(event) => $emit('change', event)"
  ></Dropdown>
</template>

<script>
import Dropdown from "primevue/select";
export default {
  components: { Dropdown },
  name: "DropDownWrapper",
  emits: ["change", "update:value"],
  props: {
    options: {
      type: Array,
      required: true,
    },
    value: {
      type: [Number, Object, String], // essentially anything
    },
    optionLabel: {
      type: String,
      required: false,
    },
  },

  computed: {
    currentValue: {
      set(newValue) {
        this.$emit("update:value", newValue);
      },
      get() {
        console.log(this.value);
        return this.value;
      },
    },
  },
  mounted() {
    console.log(this);
  },
};
</script>
