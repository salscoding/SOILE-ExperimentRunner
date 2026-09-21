<template>
  <Tabs class="pb-0" v-model:value="activeElement">
    <TabList>
      <Tab v-if="editorStore.experiments.elements.length > 0" :value="0">
        Experiments
      </Tab>
      <Tab
        v-if="editorStore.tasks.elements.length > 0"
        :value="editorStore.experiments.elements.length > 0 ? 1 : 0"
      >
        Tasks
      </Tab>
      <Tab
        v-if="editorStore.projects.elements.length > 0"
        :value="
          (editorStore.experiments.elements.length > 0 ? 1 : 0) +
          (editorStore.tasks.elements.length > 0 ? 1 : 0)
        "
      >
        Projects
      </Tab>
    </TabList>
    <TabPanels>
      <TabPanel v-if="editorStore.experiments.elements.length > 0" :value="0">
        <Tabs class="pb-0" v-model:value="editorStore.experiments.active">
          <TabList>
            <Tab
              v-for="(experiment, index) in editorStore.experiments.elements"
              :key="experiment.data?.UUID || index"
              :value="index"
            >
              <span> {{ experiment.name }} </span>
              <Button
                icon="pi pi-times"
                @click.stop="
                  closeTab(index, editorStore.experiments, 'experiment')
                "
              />
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel
              v-for="(experiment, index) in editorStore.experiments.elements"
              :key="experiment.data?.UUID || index"
              :value="index"
            >
              <div style="width: 100%; height: 80vh">
                <Editor
                  type="experiment"
                  :newElement="experiment.newElement"
                  :baklava="experiment.editor"
                  :data="experiment.data"
                  :name="experiment.name"
                  @updateElement="
                    (data) => updateElement(data, index, 'experiment')
                  "
                  @createElement="
                    (data) => updateElement(data, index, 'experiment')
                  "
                  @updateName="(name) => updateName(name, index, 'experiment')"
                ></Editor>
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </TabPanel>
      <TabPanel
        v-if="editorStore.tasks.elements.length > 0"
        :value="editorStore.experiments.elements.length > 0 ? 1 : 0"
      >
        <Tabs class="pb-0" v-model:value="editorStore.tasks.active">
          <TabList>
            <Tab
              v-for="(task, index) in editorStore.tasks.elements"
              :key="task.data?.UUID || index"
              :value="index"
            >
              <span> {{ task.name }} </span>
              <Button
                icon="pi pi-times"
                @click.stop="closeTab(index, editorStore.tasks, 'task')"
              />
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel
              v-for="(task, index) in editorStore.tasks.elements"
              :key="task.data?.UUID || index"
              :value="index"
            >
              <div style="width: 100%; height: 80vh">
                <TaskEditor
                  :newElement="task.newElement"
                  :target="task.data"
                  @updateName="(name) => updateName(name, index, 'task')"
                  @updateCurrentVersion="
                    (event) => updateCurrentTaskVersion(event, index, 'task')
                  "
                  @saveTask="(event) => updateElement(event, index, 'task')"
                  @changeTask="(event) => changeElement(event, index, 'task')"
                ></TaskEditor>
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </TabPanel>
      <TabPanel
        v-if="editorStore.projects.elements.length > 0"
        :value="
          (editorStore.experiments.elements.length > 0 ? 1 : 0) +
          (editorStore.tasks.elements.length > 0 ? 1 : 0)
        "
      >
        <Tabs class="pb-0" v-model:value="editorStore.projects.active">
          <TabList>
            <Tab
              v-for="(project, index) in editorStore.projects.elements"
              :key="project.data?.UUID || index"
              :value="index"
            >
              <span> {{ project.name }} </span>
              <Button
                icon="pi pi-times"
                @click.stop="closeTab(index, editorStore.projects, 'project')"
              />
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel
              v-for="(project, index) in editorStore.projects.elements"
              :key="project.data?.UUID || index"
              :value="index"
            >
              <div style="width: 100%; height: 80vh">
                <Editor
                  type="project"
                  :newElement="project.newElement"
                  :baklava="project.editor"
                  :data="project.data"
                  :name="project.name"
                  @updateElement="
                    (data) => updateElement(data, index, 'project')
                  "
                  @createElement="
                    (data) => updateElement(data, index, 'project')
                  "
                  @updateName="(name) => updateName(name, index, 'project')"
                ></Editor>
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </TabPanel>
    </TabPanels>
  </Tabs>
  <ConfirmDialog
    :target="currentTarget"
    message="Are you sure you want to close this? All unsaved changes will be lost"
    reject="Cancel"
    :isVisible="showConfirm"
    @confirm="closeConfirmation(true)"
    @reject="closeConfirmation(false)"
  />
</template>
<script setup>
/**
 * This component handles the ordering of editor components for the
 * different types of editable parts of projects/experiments/tasks
 * It contains
 */
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import Button from "primevue/button";

import { useEditorStore, useGraphStore } from "@/stores";
import { router } from "@/helpers";

import Editor from "@/components/projecteditor/Editor.vue";
import TaskEditor from "@/components/taskeditor/TaskEditor.vue";

import { ref, computed, reactive } from "vue";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog.vue";

const editorStore = useEditorStore();
const graphStore = useGraphStore();
const currentTarget = ref({});
const showConfirm = ref(false);
const currentSelectedTask = ref(undefined);

/**
 * Determine and set the current active element i.e. which of Project/Task/Experiment is active.
 */
const activeElement = computed({
  get() {
    const expOffset = editorStore.experiments.elements.length > 0 ? 1 : 0;
    const taskOffset = editorStore.tasks.elements.length > 0 ? 1 : 0;
    console.log("Updating active Element");
    switch (editorStore.activeElement) {
      case "":
        return 0;
      case "Task":
        handleTaskChange({ index: editorStore.tasks.active });
        return expOffset;
      case "Project":
        handleTypeChange();
        return expOffset + taskOffset;
      case "Experiment":
        handleTypeChange();
        return 0;
    }
  },
  set(newValue) {
    const expOffset = editorStore.experiments.elements.length > 0 ? 1 : 0;
    const taskOffset = editorStore.tasks.elements.length > 0 ? 1 : 0;
    const currentValue = newValue - expOffset - taskOffset;
    if (currentValue == 0) {
      editorStore.activeElement = "Project";
    } else {
      if (currentValue == -1) {
        if (newValue == 1) {
          editorStore.activeElement = "Task";
        } else {
          if (expOffset == 1) {
            editorStore.activeElement = "Experiment";
          } else {
            editorStore.activeElement = "Task";
          }
        }
      } else {
        if (currentValue == -2) {
          editorStore.activeElement = "Experiment";
        }
      }
    }
  },
});

/**
 * Handle the change in a task.
 * I.e. the switch between one task and another. This switch requires setting
 * the route to the respective TaskID / Version in order to allow
 * previews and retrievals to work properly
 * @param {{index : Number}} event the object indicating the new active index.
 */
function handleTaskChange(event) {
  // Indices are: Experiment 0, Task: 1, Project 2;
  console.log("Trying to change Tasks");
  console.log(event);
  const currentTask = editorStore.tasks.elements[event.index];
  if (currentTask?.data?.UUID) {
    console.log(currentTask);
    router.push(
      "/editing/" +
        currentTask.data.UUID +
        "/" +
        currentTask.currentVersion +
        "/",
    );
  } else {
    router.push("/editing");
  }
}

/**
 * Handle a change in the edited type (Project/Task/Experiment).
 * This mainly requires resetting the route for tasks.
 */
function handleTypeChange() {
  // Indices are: Experiment 0, Task: 1, Project 2;
  if (editorStore.activeElement === "Task") {
    if (currentSelectedTask.value) {
      const currentTask = editorStore.tasks.elements[currentSelectedTask];
      console.log(currentTask);
      router.push({
        path:
          "/editing/" +
          currentTask.UUID +
          "/" +
          currentTask.currentVersion +
          "/",
      });
    }
  } else {
    // remove any surplus...
    router.push("/editing");
  }
}

/**
 * Update the Version of the currently edited task. This is necessary
 * since it requires an update of the route to reflect the change
 * which itself is required to obtain the correct files for the new version.
 * @param {*} version The new version of the task
 * @param {*} index the index position of the task.
 */
function updateCurrentTaskVersion(version, index) {
  editorStore.updateCurrentTaskVersion(version, index);
  if (editorStore.activeElement === "Task") {
    handleTaskChange({ index: index });
  }
}
/**
 * Update a given element and save it, on the back-end
 * @param {*} data the data of the element
 * @param {*} index the index of the element within its panel
 * @param {*} type the type of the element
 */
async function updateElement(data, index, type) {
  console.log(
    "Changing object at position " + index + " for type " + type + " to:",
  );
  console.log(data);
  await editorStore.saveObject(type, data, index);
}

/**
 * Update element Properties
 * @param {{UUID : string, version: string}} newObjectInfo the object info.
 * @param {number} index the index of the changed object
 * @param {string} type one of 'task', 'experiment' and 'project'
 */
async function changeElement(newObjectInfo, index, type) {
  editorStore.changeElement(
    type,
    newObjectInfo.UUID,
    newObjectInfo.version,
    index,
  );
}

/**
 * Update the Name of a resource. NOTE: This does not update the name on the back-end
 * AND it also does not check, whether this name change is acceptable.
 * @param {string} name The new name of the element
 * @param {number} index the index of the element to change the name
 * @param {string} type the type (Task/Project/Experiment) of the element to change.
 */
function updateName(name, index, type) {
  console.log(
    "Updating name for index " + index + " for type " + type + " to " + name,
  );
  const elementStore = editorStore.getStoreForType(type);
  elementStore.elements[index].name = name;
}

/**
 * Close the given tab for the given type
 * @param {number} index
 * @param {*} target The elementstor that needs to be changed.
 * @param {string} type
 */
function closeTab(index, target, type) {
  console.log("Trying to close tab");
  console.log(currentTarget);
  console.log("Could set target");
  currentTarget.value = { index: index, target: target, type };
  showConfirm.value = true;
}

/**
 * Close confirmation
 * @param {boolean} close whether to actually close the element.
 */
function closeConfirmation(close) {
  console.log("Getting confirmation with value " + close);
  console.log(currentTarget.value);
  if (close) {
    const currentElement =
      currentTarget.value.target.elements[currentTarget.value.index].data;
    currentTarget.value.target.elements.splice(currentTarget.value.index, 1);
    currentTarget.value.active = currentTarget.value.index - 1;
    const element = {
      UUID: currentElement.UUID,
      version: currentElement.version,
      type: currentTarget.value.target.id,
    };
    if (
      currentTarget.value.type === "project" ||
      currentTarget.value.type === "experiment"
    ) {
      console.log("Trying to remove Graph for element: ");
      console.log(element);
      graphStore.removeGraphForElement(element);
    }
  }
  // reset the current Target
  currentTarget.value = {};
  showConfirm.value = false;
}
</script>
