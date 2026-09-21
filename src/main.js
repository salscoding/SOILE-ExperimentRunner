import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

import { setupAxios } from "./axios";
// use pinia for state management
import { createPinia } from "pinia";
import { router } from "./helpers/router";

// import primevue styles and package
import PrimeVue from "primevue/config";
import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";
import "primeicons/primeicons.css";
import ToastService from "primevue/toastservice";
import Tooltip from "primevue/tooltip";

// primeflex for layouting
import "primeflex/primeflex.css";

//SOILE Specific css
import "@/assets/globalStyles.css";

// localisation support
import i18n from "./i18n";

// Keep the upgraded Aura theme aligned with the previous Lara Light Indigo UI.
const SoilePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{indigo.50}",
      100: "{indigo.100}",
      200: "{indigo.200}",
      300: "{indigo.300}",
      400: "{indigo.400}",
      500: "{indigo.500}",
      600: "{indigo.600}",
      700: "{indigo.700}",
      800: "{indigo.800}",
      900: "{indigo.900}",
      950: "{indigo.950}",
    },
  },
});

// set up axios URLs
setupAxios(import.meta.env);

// set up the app.
const app = createApp(App);
app
  .use(i18n)
  .directive("tooltip", Tooltip)
  .use(createPinia())
  .use(PrimeVue, {
    theme: {
      preset: SoilePreset,
      options: {
        darkModeSelector: false,
      },
    },
  })
  .use(ToastService)
  .use(router)
  .mount("#app");
