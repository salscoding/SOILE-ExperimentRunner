<template>
  <DataTable
    :value="displayedItems"
    tableStyle="width:100%"
    header="Tags and Versions"
  >
    <Column v-for="column in cols" :header="column">
      <template v-if="column === 'Tag'" #body="rowData">
        {{ rowData.data[column.toLowerCase()] }}
      </template>
      <template v-else-if="column === 'Date'" #body="rowData">
        {{ parseDate(rowData.data.date) }}
      </template>
      <template v-else #body="rowData">
        {{ rowData.data[column.toLowerCase()] }}
      </template>
    </Column>
    <Column header="Change">
      <template #body="rowData">
        <Button
          v-if="removeVersions"
          label="Remove Tag"
          @click="confirmRemove(rowData.data)"
        ></Button>
        <Button v-else label="Add Tag" @click="showAdd(rowData.data)"></Button>
      </template>
    </Column>
  </DataTable>

  <div v-if="showConfirmRemove">
    <ConfirmDialog
      v-model:isVisible="showConfirmRemove"
      :message="
        'Do you really want to remove tag <' + selectedTagData.tag + '>'
      "
      @confirm="deleteTag"
      @reject="showConfirmRemove = false"
    >
    </ConfirmDialog>
  </div>
  <div v-if="showAddTag">
    <EnterTextDialog
      title="Enter a new Tag"
      message="Enter a Tag"
      confirm="Set Tag"
      v-model:isVisible="showAddTag"
      :validationFunction="(x) => !(existingTags.includes(x) || x == '')"
      @confirm="(event) => addTag(event)"
      @reject="showAddTag = false"
    />
  </div>
</template>

<script setup>
import DataTable from "primevue/datatable";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Column from "primevue/column";

import EnterTextDialog from "@/components/dialogs/EnterTextDialog.vue";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog.vue";

import { useElementStore } from "@/stores";
import { FilterMatchMode } from "@primevue/core/api";
import {
  ref,
  computed,
  reactive,
  onMounted,
} from "vue";

const props = defineProps({
  UUID: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },
  removeVersions: {
    type: Boolean,
    default: true,
  },
  elementVersionList: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["refreshData"]);
const showConfirmRemove = ref(false);
const showAddTag = ref(false);

const elementStore = useElementStore();
const selectedTagData = ref(null);
const displayedItems = computed(() => {
  if (!props.removeVersions) {
    return props.elementVersionList.filter(
      (x) => x.canbetagged && x.tag == null
    );
  } else {
    return props.elementVersionList.filter((x) => x.tag != null);
  }
});
const cols = props.removeVersions
  ? ["Version", "Tag", "Date"]
  : ["Version", "Date"];

const existingTags = computed(() => {
  return props.elementVersionList.map((x) => x.tag);
});

/**
 * Add a Tag to the currently selected version
 * @param {*} tagName
 */
async function addTag(tagName) {
  const added = await elementStore.addTagForElement(
    props.UUID,
    selectedTagData.value.version,
    props.type,
    tagName
  );
  if (added) {
    emit("refreshData");
  }
  showAddTag.value = false;
}
/**
 * Delete the currently selected Tag from the Element.
 */
async function deleteTag() {
  const removed = await elementStore.removeTagsForElement(
    props.UUID,
    props.type,
    [selectedTagData.value.tag]
  );
  showConfirmRemove.value = false;
  if (removed) {
    emit("refreshData");
  }
}

/**
 * Convert a long Date value into a readable string
 * @param {*} longValue
 */
function parseDate(longValue) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
  };
  return new Date(longValue).toLocaleDateString(undefined, options);
}
/**
 * Show the add Tag dialog
 * @param {*} rowData
 */
function showAdd(rowData) {
  selectedTagData.value = rowData;
  showAddTag.value = true;
}

/**
 * Show the add Tag dialog
 * @param {*} rowData
 */
function confirmRemove(rowData) {
  console.log(rowData);
  selectedTagData.value = rowData;
  showConfirmRemove.value = true;
}
</script>
