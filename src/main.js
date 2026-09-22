import { createApp } from "vue";
import "@fontsource-variable/inter";
import "./style.css";
import App from "./App.vue";

import { setupAxios } from "./axios";
// use pinia for state management
import { createPinia } from "pinia";
import { router } from "./helpers/router";

// import primevue styles and package
import PrimeVue from "primevue/config";
import { definePreset } from "@primeuix/themes";
import Lara from "@primeuix/themes/lara";
import "primeicons/primeicons.css";
import ToastService from "primevue/toastservice";
import Tooltip from "primevue/tooltip";

// primeflex for layouting
import "primeflex/primeflex.css";

//SOILE Specific css
import "@/assets/globalStyles.css";

// localisation support
import i18n from "./i18n";

// Preserve the previous Lara Light Indigo appearance with the upgraded theme API.
const SoilePreset = definePreset(Lara, {
  primitive: {
    indigo: {
      50: "#f7f7fe",
      100: "#dadafc",
      200: "#bcbdf9",
      300: "#9ea0f6",
      400: "#8183f4",
      500: "#6366f1",
      600: "#5457cd",
      700: "#4547a9",
      800: "#363885",
      900: "#282960",
      950: "#1e1b4b",
    },
  },
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
    formField: {
      paddingX: "0.75rem",
      paddingY: "0.75rem",
    },
    colorScheme: {
      light: {
        surface: {
          0: "#ffffff",
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#030712",
        },
        text: {
          color: "#4b5563",
          hoverColor: "#374151",
          mutedColor: "#6b7280",
          hoverMutedColor: "#4b5563",
        },
        formField: {
          color: "#4b5563",
        },
      },
    },
  },
  components: {
    button: {
      root: {
        paddingX: "1.25rem",
        paddingY: "0.75rem",
      },
    },
    checkbox: {
      root: {
        width: "22px",
        height: "22px",
      },
    },
    datatable: {
      header: {
        padding: "1rem",
      },
      headerCell: {
        padding: "1rem",
      },
      bodyCell: {
        padding: "1rem",
      },
      footerCell: {
        padding: "1rem",
      },
      footer: {
        padding: "1rem",
      },
    },
    menubar: {
      root: {
        padding: "0.5rem",
        background: "{surface.50}",
        borderColor: "{surface.200}",
      },
    },
    select: {
      dropdown: {
        width: "3rem",
      },
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
