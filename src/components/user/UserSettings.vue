<template>
  <div>
    <h1>{{ title }}</h1>
    <form @submit.prevent="saveSettings">
      <div class="grid">
        <div
          v-tooltip="'Username must not contain @'"
          class="col flex align-items-center"
        >
          <label for="username">Username</label>
        </div>
        <div class="col flex align-items-center">
          <InputText
            id="username"
            v-model="settings.username"
            :disabled="usernamefixed"
            :invalid="!userNameValid"
          />
        </div>
      </div>
      <div class="grid">
        <div class="col flex align-items-center">
          <label for="email">Email</label>
        </div>
        <div class="col flex align-items-center">
          <InputText
            type="email"
            id="email"
            v-model="settings.email"
            :invalid="!emailPossible"
          />
        </div>
      </div>
      <div class="grid">
        <div
          v-tooltip="'Must include both a first and a last name'"
          class="col flex align-items-center"
        >
          <label for="fullname">Full Name</label>
        </div>
        <div class="col flex align-items-center">
          <InputText
            id="fullname"
            v-model="settings.fullname"
            :invalid="!namePossible"
          />
        </div>
      </div>
      <div v-if="settings.role != null && settings.role != ''" class="grid">
        <div class="col flex align-items-center">
          <label for="role">Role</label>
        </div>
        <div class="col flex align-items-center">
          <InputText disabled id="role" v-model="settings.role" />
        </div>
      </div>
      <div v-if="showPassword">
        <div class="grid">
          <div class="col flex align-items-center">
            <label for="password">Password</label>
          </div>
          <div class="col flex align-items-center">
            <Password id="password" v-model="settings.password" />
          </div>
        </div>
        <div class="grid">
          <div class="col flex align-items-center">
            <label for="confirmPassword">Confirm Password</label>
          </div>
          <div class="col flex align-items-center">
            <Password id="confirmPassword" v-model="settings.confirmPassword" />
          </div>
        </div>
      </div>
      <div class="grid">
        <div class="col">
          <Button type="submit" :label="submitLabel" :disabled="!inputValid" />
        </div>
        <div v-if="showCancel" class="flex col justify-content-end">
          <Button @click="$emit('cancel')" label="Cancel" />
        </div>
      </div>
    </form>
  </div>
</template>
<script>
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";

import { useErrorStore } from "@/stores";

export default {
  props: {
    title: {
      type: String,
      default: "User Settings",
    },
    usernamefixed: {
      type: Boolean,
      default: false,
    },
    showPassword: {
      type: Boolean,
      default: true,
    },
    initialSettings: {
      type: Object,
      default: {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        fullname: "",
        role: "",
      },
    },
    submitLabel: {
      type: String,
      default: "Create",
    },
    showCancel: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      settings: { ...this.initialSettings },
    };
  },
  setup() {
    const errorStore = useErrorStore();
    return { errorStore };
  },
  methods: {
    saveSettings() {
      if (
        this.showPassword &&
        (!(this.settings.confirmPassword === this.settings.password) ||
          this.settings.password.length < 10)
      ) {
        this.errorStore.raiseError(
          "error",
          "Passwords must match and must have a length of at least 10",
        );
      } else {
        this.$emit("updateUser", this.settings);
      }
    },
  },
  components: {
    InputText,
    Password,
    Button,
  },
  mounted() {
    this.settings = { ...this.initialSettings };
  },
  computed: {
    userNameValid() {
      return this.settings.username && !this.settings.username.includes("@");
    },
    emailPossible() {
      return (
        this.settings.email &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.settings.email)
      );
    },
    namePossible() {
      return (
        this.settings.fullname &&
        this.settings.fullname.trim().length > 0 &&
        !this.settings.fullname.includes(" ")
      );
    },
    passwordValid() {
      return (
        !this.showPassword ||
        (this.settings.password &&
          this.settings.password.length >= 10 &&
          this.settings.password === this.settings.confirmPassword)
      );
    },
    inputValid() {
      return (
        this.userNameValid &&
        this.passwordValid &&
        this.emailPossible &&
        this.namePossible
      );
    },
  },
  watch: {
    initialSettings(newValue) {
      this.settings = { ...newValue };
    },
  },
  emits: ["updateUser", "cancel"],
};
</script>
