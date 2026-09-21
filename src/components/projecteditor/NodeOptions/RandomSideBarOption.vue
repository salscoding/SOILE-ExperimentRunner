<template>
  <HelpItem
    helpSubject="RandomNode"
    buttonClass="baklava-button absolute"
    buttonStyle="position: absolute;top:15px; right:10px"
  ></HelpItem>
  <div>
    <div>
      <DropDown
        v-model="randomType"
        :options="randomOptions"
        optionLabel="name"
        class="baklave-dropdown"
      >
      </DropDown>
    </div>
    <div
      class="grid border-white border-solid border-1 border-round-sm mt-2 mb-2"
      v-if="randomType.value === 'random'"
    >
      <div class="col-12 flex align-items-center">
        <label for="outputAmount">Select Number of Outputs</label>
        <InputNumber
          class="w-4"
          v-model="outputCount"
          showButtons
          inputId="outputAmount"
          inputClass="w-4"
          :min="1"
          :max="100"
        />
      </div>
      <div class="col-12 flex align-items-center justify-content-between">
        <div
          v-tooltip="
            'If set, the value is assigned once and will always stay the same for any future pass. If not assigned, a new random assignment will be done whenever a participant reaches this point'
          "
        >
          {{ "Assign Once" }}
        </div>
        <Checkbox v-model="assignOnce" :binary="true" name="random" />
      </div>
    </div>
    <div
      v-else-if="randomType.value === 'block'"
      class="grid border-white border-solid border-1 border-round-sm mt-2 mb-2"
    >
      <div class="col-12 flex align-items-center justify-content-between">
        <div
          v-tooltip="
            'Specify the blocks using symbols for each block. ABBA would mean that the first participant goes to output A, second and third to B, fourth to A and then starting again with fifths to A'
          "
        >
          {{ "Block Specification" }}
        </div>
        <InputText class="w-5" v-model="blockSpecification"></InputText>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HelpItem from "@/components/helppages/HelpItem.vue";
import DropDown from "primevue/select";
import Checkbox from "primevue/checkbox";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";

import RandomNode from "../NodeTypes/FilterNode";
import { ComponentInterface } from "../NodeInterfaces/ComponentInterface";
import { RandomOption } from "../interfaces/RandomizerInterfaces";

export default defineComponent({
  props: {
    intf: {
      type: Object as () => ComponentInterface<RandomNode>,
      required: true,
    },
  },
  components: { DropDown, InputNumber, Checkbox, InputText, HelpItem },
  data() {
    return {
      editing: [],
    };
  },
  setup(props) {
    const currentNode = props.intf.data;
    const nodeID = currentNode?.id;
    const currentFilters = currentNode.Filters;
    return { currentNode, nodeID, currentFilters };
  },
  methods: {},
  watch: {},
  computed: {
    randomType: {
      set(newValue: RandomOption) {
        this.currentNode.setType(newValue);
      },
      get(): RandomOption {
        return this.currentNode.getType();
      },
    },
    assignOnce: {
      set(newValue: boolean) {
        this.currentNode.setSetting("assignOnce", newValue);
      },
      get(): boolean {
        return this.currentNode.settings.assignOnce;
      },
    },
    outputCount: {
      set(newValue: number) {
        if (this.randomType.value === "random") {
          this.currentNode.setOutputsForCount(newValue);
        }
      },
      get(): number {
        return this.currentNode.getOutputCount();
      },
    },
    blockSpecification: {
      set(newValue: string) {
        if (this.randomType.value === "block") {
          this.currentNode.setBlockSpecification(newValue);
        }
      },
      get(): string {
        return this.currentNode.settings.blockSpecification
          ? this.currentNode.settings.blockSpecification
          : "";
      },
    },
    randomOptions() {
      return this.currentNode.getRandomOptions();
    },
  },
  mounted() {
    //this.updateNodeData();
  },
});
</script>

<style scoped>
.p-inputnumber-input {
  width: 40px !important;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: content;
}
</style>
