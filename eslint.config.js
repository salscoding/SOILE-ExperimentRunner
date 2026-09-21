import pluginVue from "eslint-plugin-vue";
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from "@vue/eslint-config-typescript";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";

export default defineConfigWithVueTs(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "src/helpers/experimentlang/soile2.js",
    ],
  },
  pluginVue.configs["flat/base"],
  vueTsConfigs.base,
  {
    rules: {
      "vue/block-lang": "off",
    },
  },
  skipFormatting,
);
