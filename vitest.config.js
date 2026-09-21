import { fileURLToPath } from "node:url";
import { mergeConfig, loadEnv } from "vite";
import { configDefaults, defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue"; //add this line
import viteConfig from "./vite.config.js";
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  process.env.VITE_BACKENDDOMAIN = "virtserver.swaggerhub.com";
  process.env.VITE_BASE_URL = "/THOMASPFAU/SoileAPI/1.0.0";
  process.env.VITE_BACKENDPORT = "";
  process.env.VITE_FRONTENDPORT = "";
  process.env.VITE_HTTPS = "true";
  return mergeConfig(
    viteConfig({ mode }),
    defineConfig({
      test: {
        globals: true,
        environment: "jsdom",
        exclude: [...configDefaults.exclude, "e2e/*"],
        root: fileURLToPath(new URL("./", import.meta.url)),
        alias: {
          "@/": new URL("./src/", import.meta.url).pathname,
        },
      },
    })
  );
};
