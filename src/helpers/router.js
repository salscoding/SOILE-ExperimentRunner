import { createRouter, createWebHistory } from "vue-router";
import {
  StudyManagementView,
  ProjectEditingView,
  SignupView,
  ExperimentView,
  WelcomeView,
  UserManagementView,
  RegisterView,
  LoginView,
  ProfileView,
  PilotView,
  ForgotPasswordView,
  ResetPasswordView,
} from "@/views";
import { useProjectStore } from "@/stores";

const routes = [
  {
    path: "/",
    name: "Welcome",
    component: WelcomeView,
  },
  {
    path: "/usermanagement",
    name: "User Management",
    component: UserManagementView,
  },
  {
    path: "/editing",
    name: "ProjectEditing",
    component: ProjectEditingView,
  },
  {
    path: "/editing/:id/:version/",
    name: "TaskEditingView",
    component: ProjectEditingView,
    props: true,
  },
  {
    path: "/pilot/:id/:version/",
    name: "PilotTask",
    component: PilotView,
    props: true,
  },
  {
    path: "/pilot/",
    name: "PilotStarter",
    component: PilotView,
    props: true,
  },
  {
    path: "/management",
    name: "Study Management",
    component: StudyManagementView,
  },
  {
    path: "/exp/:id/:taskID/",
    name: "Experiment Runner",
    component: ExperimentView,
    props: true,
  },
  {
    path: "/signup/:id",
    name: "Signup",
    component: SignupView,
    props: true,
  },
  {
    path: "/register",
    name: "User Registeration",
    component: RegisterView,
  },
  {
    path: "/login",
    name: "Login",
    component: LoginView,
  },
  {
    path: "/forgot_password",
    name: "ForgotPassword",
    component: ForgotPasswordView,
  },
  {
    path: "/password_reset",
    name: "PasswordReset",
    component: ResetPasswordView,
    props: (route) => ({ token: route.query.token }),
  },
  {
    path: "/profile",
    name: "Profile",
    component: ProfileView,
  },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: "active",
  routes: routes,
});

router.beforeEach(async (to) => {
  console.log("Updating route");
  // redirect to login page if not logged in and trying to access a restricted page
  const projectStore = useProjectStore();
  // regardless on where we are, we are NOt currently running a task.
  projectStore.setTaskNotRunning();
});
