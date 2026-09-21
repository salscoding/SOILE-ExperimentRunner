import { defineStore } from "pinia";

import axios from "axios";

import { useProjectStore } from "./project";
import { useGraphStore } from "./graph";
import { useUserStore } from "./users";
import { useEditorStore } from "./editing";
import { useElementStore } from "./elements";
import { useStudyStore } from "./studies";

import { useErrorStore } from "./errors";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    // initialize state from session storage to enable user to stay logged in for the session (not using local store)
    user: JSON.parse(sessionStorage.getItem("soile-user")),
    roles: JSON.parse(sessionStorage.getItem("soile-userroles")),
    jwtToken: JSON.parse(sessionStorage.getItem("soile-jwtToken")),
    projectToken: "",
    isAnonymous: JSON.parse(sessionStorage.getItem("soile-anonymous")),
    returnUrl: null,
    authed: false,
  }),
  actions: {
    isAuthed() {
      return this.authed;
    },
    isAdmin() {
      if (this.isAuthed()) {
        return this.roles.includes("Admin");
      } else {
        return false;
      }
    },
    isUser() {
      if (this.user) {
        return true;
      }
    },
    /**
     * Check whether the current session is a session of a researcher
     */
    isResearcher() {
      if (this.isAuthed()) {
        console.log(this.roles);
        return (
          this.roles.includes("Admin") || this.roles.includes("Researcher")
        );
      } else {
        return false;
      }
    },
    /**
     * Refresh the current session.
     */
    async refreshSession() {
      if (this.jwtToken) {
        this.setAccessToken(this.jwtToken);
      }
      if (this.projectToken) {
        this.setProjectToken(this.projectToken);
      }
      try {
        console.log("Checking auth status");
        // refresh the session cookie.
        await this.updateLoginStatus();
      } catch (error) {
        if (error.response?.status != 401) {
          console.log(error);
          this.processAxiosError(error);
        }
      }
    },
    /**
     * Log a user into the system.
     * @param {*} username
     * @param {*} password
     * @param {*} remember
     */
    async login(username, password, remember) {
      var loginData = {
        username,
        password,
        remember: remember ? "1" : "0",
      };
      console.log(loginData);
      try {
        const response = await axios.post("/login", loginData, {
          headers: { "Content-Type": "application/json" },
        });
        console.log(response?.data);
        // update pinia state
        await this.updateLoginStatus();
        this.setAccessToken(response?.data.token);
        // store user details and jwt in local storage to keep user logged in between page refreshes
        await this.updateUserData();
        // redirect to previous url or default to home page
      } catch (e) {
        this.processAxiosError(e);
      }
    },
    /**
     * Log a user into the system using a one-time token.
     * @param {*} token The token to use
     */
    async oneTimeAuth(token) {
      console.log(token);
      try {
        const response = await axios.post(
          "/password/one_time_auth",
          {},
          {
            headers: { "Content-Type": "application/json" },
            params: { token: token },
          }
        );

        // update pinia state
        await this.updateLoginStatus();
        this.setAccessToken(response?.data.token);
        // store user details and jwt in local storage to keep user logged in between page refreshes
        await this.updateUserData();
        // redirect to previous url or default to home page
      } catch (e) {
        this.processAxiosError(e);
      }
    },
    /**
     * Send a password reset request
     * @param {*} emailOrUserName the email or username to requesta  password reset for
     */
    async resetPassword(emailOrUserName) {
      var loginData = {
        emailOrUserName,
      };
      console.log(loginData);
      try {
        const response = await axios.post(
          "/password/request_reset",
          loginData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        return true;
      } catch (e) {
        this.processAxiosError(e);
        return false;
      }
    },

    async logout() {
      try {
        // post to logout (invalidating session)
        const response = await axios.post("/logout");
        // reset user and update available projects.
        this.setRoles([]);
        this.setUser(null);
        this.authed = false;
        this.setAccessToken(null);
        this.setProjectToken(null);
        await this.updateLoginStatus();
        this.cleanupStores();
        console.log("Logged Out");
      } catch (e) {
        this.processAxiosError(e);
      }
    },
    cleanupStores() {
      const graphs = useGraphStore();
      graphs.clearData();
      const users = useUserStore();
      users.clearData();
      const editing = useEditorStore();
      editing.clearData();
      const listStore = useProjectStore();
      listStore.clearData();
      listStore.updateAvailableStudies();
      const elements = useElementStore();
      elements.clearData();
      const studies = useStudyStore();
      studies.clearData();
    },

    async updateUserData() {
      const listStore = useProjectStore();
      await this.updateLoginStatus();
      await listStore.updateAvailableStudies();
      await listStore.fetchSignedUpStudies();
    },
    /**
     * Sign up a user with a given access token to the project with the given projectID.
     * @param {*} studyID
     * @param {*} accessToken
     * @param {boolean} silent - whether to throw an error if unsuccessfull
     * @returns
     */
    async signUp(studyID, accessToken, silent) {
      const params = accessToken ? { token: accessToken } : {};
      try {
        const response = await axios.post(
          "/study/" + studyID + "/signup",
          null,
          {
            params: params,
          }
        );
        this.setProjectToken(response?.data.token);
        console.log("Signup was successful");
        return true;
      } catch (failed) {
        if (!silent) {
          this.processAxiosError(failed);
        }
        return false;
      }
    },
    /**
     * Withdraw from the specified study.
     * @param {*} studyID
     * @returns
     */
    async withdraw(studyID) {
      try {
        const response = await axios.post(
          "/study/" + studyID + "/withdraw",
          null
        );
        this.setProjectToken(null);
        console.log("Withdraw was successful");
        return true;
      } catch (failed) {
        console.log("Caught error");
        console.log(failed);
        this.processAxiosError(failed);
        return false;
      }
    },
    setAccessToken(token) {
      this.jwtToken = token;
      if (token) {
        sessionStorage.setItem("soile-jwtToken", JSON.stringify(this.jwtToken));
        axios.defaults.headers.common["Authorization"] = "Bearer " + token;
        this.isAnonymous = false;
      } else {
        sessionStorage.removeItem("soile-jwtToken");
        // if the header is a jwt header, reset it, f we no longer have a token.
        if (axios.defaults.headers.common["Authorization"]) {
          if (
            axios.defaults.headers.common["Authorization"].startsWith("Bearer ")
          ) {
            axios.defaults.headers.common["Authorization"] = "";
          }
        }
      }
    },
    setRoles(roles) {
      this.roles = roles;
      if (roles && roles.length > 0) {
        sessionStorage.setItem("soile-userroles", JSON.stringify(roles));
      } else {
        sessionStorage.removeItem("soile-userroles");
      }
    },
    setUser(user) {
      this.user = user;
      if (user) {
        sessionStorage.setItem("soile-user", JSON.stringify(user));
      } else {
        this.isAnonymous = true;
        sessionStorage.removeItem("soile-user");
      }
    },

    async updateLoginStatus() {
      try {
        console.log("Testing auth");
        const response = await axios.post("/test/auth");
        console.log("Auth succeeded");
        console.log(response?.data);
        this.authed = true;
        this.setUser(response?.data.user);
        this.setRoles(response?.data.roles);
      } catch (error) {
        if (error.response?.status == 401) {
          // We are no longer authorized
          this.authed = false;
        } else {
          throw error;
        }
      }
    },
    setProjectToken(token) {
      console.log("Setting Project token");
      if (!this.user) {
        console.log("This is not a user, so we are setting the projectToken");
        this.projectToken = token;
        axios.defaults.headers.common["Authorization"] = token;
        this.isAnonymous = true;
      }
    },
    processAxiosError(err) {
      const errorStore = useErrorStore();
      errorStore.processAxiosError(err);
    },
  },
});
