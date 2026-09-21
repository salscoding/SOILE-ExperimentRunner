<template>
  <DataTable
    v-model:filters="filters"
    :value="userList"
    tableStyle="width:100%"
    :globalFilterFields="columns"
  >
    <template #header>
      <div
        class="flex flex-wrap align-items-center justify-content-between gap-2"
      >
        <span class="text-xl text-900 font-bold">{{ title }}</span>
        <div
          class="flex flex-wrap align-items-center justify-content-between gap-2"
        >
          <span v-if="showFilters" class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText
              v-model="filters['global'].value"
              placeholder="Keyword Search"
            />
          </span>
          <span v-if="showUserEdit" class="p-input-icon-left">
            <Button
              @click="showUserDialog = true"
              icon="pi pi-user-plus"
              rounded
              raised
            />
          </span>
          <Button
            @click="$emit('updateUsers')"
            icon="pi pi-refresh"
            rounded
            raised
          />
        </div>
      </div>
    </template>
    <Column v-for="column in columns" :header="getHeader(column)">
      <template
        v-if="column === roleColumn && !showPermissions"
        #body="rowData"
      >
        <DropDownWrapper
          :options="roleOptions"
          :value="currentRoles[userList.indexOf(rowData.data)]"
          @update:value="(event) => updateCurrentRole(event, rowData.data)"
        ></DropDownWrapper>
      </template>
      <template v-else #body="rowData">
        {{ rowData.data[column] }}
      </template>
      <template
        v-if="showFilters && column === roleColumn"
        #filter="{ filterModel, filterCallback }"
      >
        <DropDownWrapper
          v-model:value="filterModel.value"
          @change="filterCallback()"
          :options="roleOptions"
          placeholder="Select One"
          class="p-column-filter"
        />
      </template>
      <template
        v-else-if="showFilters"
        #filter="{ filterModel, filterCallback }"
      >
        <InputText
          v-model="filterModel.value"
          type="text"
          @input="filterCallback()"
          class="p-column-filter"
          placeholder="Search Column"
        />
      </template>
    </Column>
    <Column v-if="showPermissions">
      <template #body="rowData">
        <Button
          label="Change Permissions"
          @click="editPermissions(rowData)"
        ></Button>
      </template>
    </Column>
    <Column v-if="showPermissions">
      <template #body="rowData">
        <div class="flex">
          <DropDownWrapper
            :options="roleOptions"
            :value="currentRoles[userList.indexOf(rowData.data)]"
            @update:value="(event) => updateCurrentRole(event, rowData.data)"
          ></DropDownWrapper>
          <Button
            label="Change Role"
            @click="updateRole(rowData.data)"
          ></Button>
        </div>
      </template>
    </Column>

    <Column v-if="showDetails">
      <template #body="rowData">
        <Button label="Show Details" @click="openDetails(rowData)"></Button>
      </template>
    </Column>
    <Column>
      <template #body="rowData">
        <Button
          label="Delete"
          :disabled="rowData.data.username === currentUser"
          @click="deleteUser(rowData)"
        ></Button>
      </template>
    </Column>
  </DataTable>

  <div v-if="showPermissions && showPermissionDialog">
    <PermissionDialog
      v-model:visible="showPermissionDialog"
      :user="selectedUser"
    >
    </PermissionDialog>
  </div>

  <div v-if="showUserEdit && showUserDialog">
    <UserDialog
      v-if="selectedUser"
      v-model:visible="showUserDialog"
      @updateUser="updateUser"
      :showPassword="false"
      :usernamefixed="true"
      :initialSettings="selectedUser"
      submitLabel="Update User"
    ></UserDialog>
    <UserDialog
      v-else
      v-model:visible="showUserDialog"
      @updateUser="createUser"
    >
    </UserDialog>
  </div>

  <div v-if="confirmDeletion && needsConfirmDeletion">
    <ConfirmDialog
      v-model:isVisible="confirmDeletion"
      message="Deleting a user will also delete all of their data in all Studies they participated in the"
      confirm="Delete user and Files"
      reject="Cancel"
      @confirm="deleteUser"
      @reject="
        confirmDeletion = false;
        selectedUser = null;
      "
    />
  </div>
</template>

<script setup>
import DataTable from "primevue/datatable";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Column from "primevue/column";

import PermissionDialog from "@/components/dialogs/PermissionDialog.vue";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog.vue";
import DropDownWrapper from "@/components/utils/DropDownWrapper.vue";
import UserDialog from "@/components/dialogs/UserDialog.vue";

import { useUserStore, useAuthStore } from "@/stores";
import { FilterMatchMode } from "@primevue/core/api";
import { ref, computed, reactive, watch } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: "Users",
  },
  userList: {
    type: Array,
    required: true,
  },
  roleOptions: {
    type: Array,
    required: true,
  },
  roleColumn: {
    type: String,
    required: true,
  },
  columnHeaders: {
    type: Array,
  },
  showPermissions: {
    type: Boolean,
    default: false,
  },
  showDetails: {
    type: Boolean,
    default: false,
  },
  showFilters: {
    type: Boolean,
    default: false,
  },
  deletionLabel: {
    type: String,
    default: "Delete User",
  },
  showUserEdit: {
    type: Boolean,
    default: false,
  },
  createLabel: {
    type: String,
    default: "Create New User",
  },
  needsConfirmDeletion: {
    type: Boolean,
    default: true,
  },
});

const showPermissionDialog = ref(false);
const showUserDialog = ref(false);

const selectedUser = ref(null);
const confirmDeletion = ref(false);

const emit = defineEmits([
  "updateRole",
  "deleteUser",
  "updateUserInfo",
  "updateUsers",
  "createUser",
]);
const userSettings = ref(null);

const currentRoles = ref(null);
const userStore = useUserStore();
const authStore = useAuthStore();

const currentUser = ref(authStore.user);
currentRoles.value = reactive(props.userList.map((x) => x[props.roleColumn]));
console.log(props.userList);

/**
 * Watch the user list to update the presented data, if the list changes
 */
watch(
  () => props.userList,
  async (newList) => {
    console.log(newList);
    currentRoles.value = reactive(newList.map((x) => x[props.roleColumn]));
  }
);

/**
 * Update the current (i.e. displayed) Role of the user. this is NOT the actual role, only the role that will get set.
 * @param {String} newValue  the new role for the used
 * @param {*} element the rowData representing the user.
 */
function updateCurrentRole(newValue, element) {
  console.log(newValue);
  console.log(element);
  currentRoles.value[props.userList.indexOf(element)] = newValue;
}

/**
 * Obtain the names of the columns.
 */
const columns = computed(() => {
  if (props.columnHeaders) {
    console.log(props.columnHeaders.map((x) => x.name));
    return props.columnHeaders.map((x) => x.name);
  } else {
    return props.userList.length > 0 ? Object.keys(props.userList[0]) : [];
  }
});

/**
 * Build Filters for the columns. (TODO: activate)
 */
function createFilterObject() {
  const res = { global: { value: null, matchMode: FilterMatchMode.CONTAINS } };
  for (const column of columns.value) {
    res[column] = { value: null, matchMode: FilterMatchMode.CONTAINS };
  }
  return res;
}

// The filters for the columns
const filters = ref(createFilterObject());

/**
 * Update the actual role of the user, emitting an updateRole event, that should also trigger the
 * update of the data.
 * @param {*} element
 */
function updateRole(element) {
  const newRole = currentRoles.value[props.userList.indexOf(element)];
  if (newRole != element[props.roleColumn]) {
    emit("updateRole", { username: element.username, role: newRole });
    //userStore.updateRole(element.username, newRole);
  }
}

function deleteUser(user) {
  console.log("delete User called with");
  console.log(user);
  if (props.needsConfirmDeletion && user) {
    selectedUser.value = user.data.username;
    confirmDeletion.value = true;
  } else {
    if (user) {
      selecteduser.value = user.data.username;
    }
    emit("deleteUser", selectedUser.value);
    selectedUser.value = null;
    confirmDeletion.value = false;
  }
}
/**
 * Edit the permissions of the user represented by the given row.
 * @param {*} rowData
 */
function editPermissions(rowData) {
  selectedUser.value = rowData.data.username;
  showPermissionDialog.value = true;
  console.log(rowData);
}

// Need to watch the visible state of the permissionsDialog, to clear the selected user when it closes.
watch(showPermissionDialog, (newValue) => {
  if (!newValue) {
    console.log("resetting selected user");
    selectedUser.value = null;
  }
});

// Need to watch the visible state of the userDialog, to clear the selected user when it closes.
watch(showUserDialog, (newValue) => {
  if (!newValue) {
    console.log("resetting selected user");
    selectedUser.value = null;
  }
});
/**
 * Show the details of the User represented by the given column.
 * @param {*} rowData
 */
async function openDetails(rowData) {
  console.log(rowData);
  selectedUser.value = rowData.data;
  showUserDialog.value = true;
}

/**
 * Update the user with the given data. must contain a username.
 * @param {*} updateData
 */
function updateUser(updateData) {
  emit("updateUserInfo", updateData);
  showUserDialog.value = false;
}

/**
 * Get the header column, if columnHeaders are provided.
 * @param {*} columnName
 */
function getHeader(columnName) {
  if (props.columnHeaders != null) {
    return props.columnHeaders.find((column) => column.name === columnName)
      .header;
  } else {
    return columnName;
  }
}

function createUser(userData) {
  showUserDialog.value = false;
  emit("createUser", userData);
}
</script>
