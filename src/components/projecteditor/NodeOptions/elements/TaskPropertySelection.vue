<template>
  <div v-if="selectionType !== 'impossible'">
    <div class="grid border-white border-solid border-1 border-round-sm mt-2">
      <div class="col-12">Add {{ elementDescription }} Data</div>
      <div class="col-12">Variable Name:</div>
      <div v-if="selectionType === 'manual'" class="col-6">
        <input
          class="baklava-input w-full"
          type="text"
          v-model="currentSelected"
          name="addPersistent"
        />
      </div>
      <div v-else="selectionType === 'fixed'" class="col-6">
        <Dropdown
          class="w-full"
          :options="possibleValues"
          v-model="currentSelected"
          :placeholder="`Select`"
        ></Dropdown>
      </div>
      <div class="col-6 flex justify-content-end align-content-center">
        <button
          :class="['baklava-button', newElementNotOk ? 'disabled' : '']"
          :disabled="newElementNotOk"
          @click="$emit('addElement', currentSelected)"
        >
          Add {{ elementDescription }}
        </button>
      </div>
      <div class="col-12">
        Existing {{ elementDescription }} Values:
        <ul>
          <li v-for="element in existingValues">
            <div class="flex align-items-center justify-content-between">
              {{ element }}
              <button
                class="baklava-button"
                :name="element"
                @click="$emit('removeElement', element)"
              >
                Remove {{ elementDescription }}
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { checkOutput } from "@/helpers/projecteditor/taskProcessor";
import Dropdown from "primevue/select";
import { defineComponent } from "vue";

export default defineComponent({
  components: { Dropdown },
  props: {
    existingValues: {
      type: Array<string>,
      required: true,
    },
    possibleValues: {
      type: Array<string>,
      required: true,
    },
    selectionType: {
      type: String,
      required: true,
    },
    elementDescription: {
      type: String,
      required: true,
    },
  },
  emits: ["removeElement", "addElement"],
  data() {
    return {
      currentSelected: "",
    };
  },
  computed: {
    newElementNotOk() {
      return !checkOutput(this.currentSelected);
    },
  },
});
</script>
