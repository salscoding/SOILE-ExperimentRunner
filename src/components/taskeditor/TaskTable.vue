<template>
  <DataTable
    v-model:filters="filters"
    :value="availableTasks"
    paginator
    :rows="10"
    dataKey="name"
    filterDisplay="row"
    :loading="loading"
    :globalFilterFields="[
      'keywords',
      'name',
      'description',
      'author',
      'type',
      'language',
    ]"
    v-model:selection="selectedTask"
    selectionMode="single"
  >
    <template #header>
      <div class="flex justify-content-end">
        <span class="p-input-icon-left">
          <i class="pi pi-search" />
          <InputText
            v-model="filters['global'].value"
            placeholder="Keyword Search"
          />
        </span>
      </div>
    </template>
    <template #empty> No tasks found. </template>
    <template #loading> Loading task data. Please wait. </template>
    <Column field="name" header="Name" style="min-width: 12rem">
      <template #body="{ data }">
        {{ data.name }}
      </template>
      <template #filter="{ filterModel, filterCallback }">
        <InputText
          v-model="filterModel.value"
          type="text"
          @input="filterCallback()"
          class="p-column-filter"
          placeholder="Search by name"
        />
      </template>
    </Column>
    <Column
      header="Language"
      filterField="language"
      style="min-width: 3rem"
      :showFilterMenu="false"
    >
      <template #body="{ data }">
        <div class="flex align-items-center gap-2">
          <span>{{ data.language }}</span>
        </div>
      </template>
      <template #filter="{ filterModel, filterCallback }">
        <MultiSelect
          v-model="filterModel.value"
          @change="filterCallback()"
          :options="languageOptions"
          placeholder="Any"
          class="p-column-filter"
          style="min-width: 3rem"
        >
          <template #option="slotProps">
            <div class="flex align-items-center gap-2">
              <span>{{ slotProps.option }}</span>
            </div>
          </template>
        </MultiSelect>
      </template>
    </Column>
    <Column
      field="type"
      header="Type"
      :showFilterMenu="false"
      style="width: 3rem"
    >
      <template #body="{ data }">
        {{ data.type }}
      </template>
      <template #filter="{ filterModel, filterCallback }">
        <MultiSelect
          v-model="filterModel.value"
          @change="filterCallback()"
          :options="typeOptions"
          placeholder="Select"
          class="p-column-filter"
          style="min-width: 6rem"
          :showClear="true"
        >
          <template #option="slotProps">
            {{ slotProps.option }}
          </template>
        </MultiSelect>
      </template>
    </Column>
    <Column
      field="author"
      header="Author"
      :showFilterMenu="false"
      :filterMenuStyle="{ width: '3rem' }"
      style="min-width: 3rem"
    >
      <template #body="{ data }">
        {{ data.author }}
      </template>
      <template #filter="{ filterModel, filterCallback }">
        <MultiSelect
          v-model="filterModel.value"
          @change="filterCallback()"
          :options="authorOptions"
          placeholder="Select Author"
          class="p-column-filter"
          style="min-width: 3rem"
          :showClear="true"
        >
          <template #option="slotProps">
            {{ slotProps.option }}
          </template>
        </MultiSelect>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import MultiSelect from "primevue/multiselect";

import { useElementStore } from "../../stores";

const props = defineProps({ selectedTask: Object });
const emit = defineEmits(["update:selectedTask"]);
const elementStore = useElementStore();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  type: { value: null, matchMode: FilterMatchMode.IN },
  language: { value: null, matchMode: FilterMatchMode.IN },
  author: { value: null, matchMode: FilterMatchMode.EQUALS },
});

const typeOptions = computed(() =>
  Array.from(new Set(elementStore.availableTasks.map((x: any) => x.type)))
);

const languageOptions = computed(() =>
  Array.from(new Set(elementStore.availableTasks.map((x: any) => x.language)))
);

const authorOptions = computed(() =>
  Array.from(new Set(elementStore.availableTasks.map((x: any) => x.author)))
);

const availableTasks = ref([]);
const loading = ref(true);
const selectedTask = computed({
  get: () => {
    return props.selectedTask;
  },
  set: (value) => {
    emit("update:selectedTask", value);
  },
});

onMounted(() => {
  elementStore.updateAvailableOptions("task").then(() => {
    availableTasks.value = elementStore.availableTasks;
    loading.value = false;
  });
});
</script>
