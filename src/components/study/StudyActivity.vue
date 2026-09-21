<template>
  <div class="grid">
    <div class="col flex flex-column">
      <div v-if="active">
        <Button
          label="Deactivate Study"
          @click="$emit('update:active', false)"
        ></Button>
        <div>
          Link to study:
          <a :href="baseURL"> Right Click to Copy </a>
        </div>
      </div>
      <div v-else>
        <Button
          label="Activate Study"
          @click="$emit('update:active', true)"
        ></Button>
      </div>
      <div v-if="permanentToken == null || permanentToken === ''">
        <Button
          label="Create Permanent Access Token"
          @click="$emit('createMasterToken')"
        />
      </div>
      <div v-else>
        <div>Permanent Sign Up token is : {{ permanentToken }}</div>
        <div>
          SignUp Link:
          <a :href="baseTokenURL + permanentToken"> Right Click to Copy </a>
        </div>
      </div>
      <div v-if="accessTokens != null && accessTokens.length > 0">
        <h3>Sign Up Tokens</h3>
        <ScrollPanel :style="{ width: '100%', height: maxSignupSize + 'rem' }">
          <ul>
            <li v-for="token in accessTokens">{{ token }}</li>
          </ul>
        </ScrollPanel>
      </div>
      <Button
        class="w-4 mt-3 mb-3"
        label="Create Access Tokens"
        @click="showCreateTokensDialog = true"
      />
      <div v-if="usedTokens != null && usedTokens.length > 0">
        <h3>Used Sign Up tokens</h3>
        <ScrollPanel :style="{ width: '100%', height: maxUsedSize + 'rem' }">
          <ul>
            <li v-for="token in usedTokens">{{ token }}</li>
          </ul>
        </ScrollPanel>
      </div>
    </div>
    <Dialog
      v-if="showCreateTokensDialog"
      v-model:visible="showCreateTokensDialog"
    >
      <div class="grid">
        <div class="col">
          <label for="project">How many tokens to you want to create</label>
        </div>
        <div class="col">
          <InputNumber v-model="tokenCount" />
        </div>
      </div>
      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="showCreateTokensDialog = false"
          text
        />
        <Button
          label="Create"
          icon="pi pi-check"
          @click="createTokens"
          autofocus
          :disabled="!(tokenCount > 0)"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputNumber from "primevue/inputnumber";
import ScrollPanel from "primevue/scrollpanel";
import { ref, computed } from "vue";
const props = defineProps({
  active: {
    type: Boolean,
    required: true,
  },
  accessTokens: {
    type: Array,
    required: true,
  },
  permanentToken: {
    type: [String, null],
    required: true,
  },
  usedTokens: {
    type: Array,
    required: true,
  },
  studyID: {
    type: String,
    required: true,
  },
  shortCut: {
    type: String,
  },
});
const emit = defineEmits([
  "update:active",
  "createTokens",
  "createMasterToken",
]);
const showCreateTokensDialog = ref(false);
const tokenCount = ref(10);

function createTokens() {
  // hide dialog
  showCreateTokensDialog.value = false;
  emit("createTokens", tokenCount.value);
  // reset tokenCount
  tokenCount.value = 10;
}

const baseURL = computed(
  () =>
    `${getFullHost()}/signup/${props.shortCut ? props.shortCut : props.studyID}`
);

function getFullHost() {
  var currentURL = window.location.href;

  // Extracting protocol and host
  return (
    currentURL.split("//")[0] + "//" + currentURL.split("//")[1].split("/")[0]
  );
}

const baseTokenURL = computed(() => `${baseURL.value}?token=`);

const maxSignupSize = computed(() =>
  Math.max(props.accessTokens ? props.accessTokens.length : 0, 10)
);
const maxUsedSize = computed(() =>
  Math.max(props.usedtokens ? props.usedtokens.length : 0, 10)
);

//TODO: Deactivate project.
</script>
