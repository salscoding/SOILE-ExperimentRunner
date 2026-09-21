<template>
  <div class="flex flex-column w-full">
    <div class="flex flex-row w-full">
      <DropDown
        editable
        v-model="keywordAddition"
        :options="keywords"
        :class="valid ? '' : 'p-invalid'"
        class="flex flex-grow-1"
        @keyup.enter.prevent="addKeyword"
      ></DropDown>
      <Button @click="addKeyword">Add</Button>
    </div>

    <div clas="flex">
      <span class="surface-ground" v-for="existing of addedKeywords"
        >{{ existing
        }}<span
          class="vertical-align-super text-red-500 text-sm textbutton"
          @click="removeKeyword(existing)"
          >x</span
        >
      </span>
    </div>
  </div>
</template>

<script>
import Button from "primevue/button";
import DropDown from "primevue/select";
import { useElementStore } from "@/stores/elements";
import { storeToRefs } from "pinia";
export default {
  components: { Button, DropDown },
  props: {
    addedKeywords: {
      type: Array,
      required: true,
    },
    valid: {
      type: Boolean,
      defautl: true,
    },
  },
  data() {
    return {
      keywordAddition: "",
    };
  },
  setup() {
    const elementStore = useElementStore();
    const { keywords } = storeToRefs(elementStore);
    return { elementStore, keywords };
  },
  methods: {
    removeKeyword(keyword) {
      this.$emit("removeKeyword", keyword);
    },
    addKeyword() {
      if (this.keywordAddition) {
        this.$emit("addKeyword", this.keywordAddition);
        this.keywordAddition = "";
      }
    },
  },
  mounted() {
    this.elementStore.getKeywords();
  },
};
</script>
