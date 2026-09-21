import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "url";

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  const SERVER_URL = `${
    process.env.VITE_HTTPS === "true" ? "https://" : "http://"
  }${process.env.VITE_BACKENDDOMAIN}${
    process.env.VITE_BACKENDPORT != undefined
      ? ":" + process.env.VITE_BACKENDPORT
      : ""
  }`;

  console.log("Server URL: " + SERVER_URL);
  return defineConfig({
    resolve: {
      alias: [
        {
          find: "@/",
          replacement: fileURLToPath(new URL("./src/", import.meta.url)).replace(/\\/g, "/"),
        },
      ],
    },
    plugins: [vue()],
    server: {
      proxy: {
        "^/exp/.*/.*/.+": {
          target: `${SERVER_URL}`,
          rewrite: (path) => path.replace(/^\/exp\//, "/run/"),
          /*configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
              console.log("proxy error", err);
            });
            proxy.on("proxyReq", (proxyReq, req, _res) => {
              console.log(
                "Sending Request:",
                req.method,
                req.url,
                " => TO THE TARGET =>  ",
                proxyReq.method,
                proxyReq.protocol,
                proxyReq.host,
                proxyReq.path,
                JSON.stringify(proxyReq.getHeaders())
              );
            });
            proxy.on("proxyRes", (proxyRes, req, _res) => {
              console.log(
                "Received Response from the Target:",
                proxyRes.statusCode,
                req.url,
                JSON.stringify(proxyRes.headers)
              );
            });
          },*/
          secure: false,
        },
        "^/api/.*": {
          target: `${SERVER_URL}`,
          rewrite: (path) => path.replace(/^\/api/, ""),
          secure: false,
          /*configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
              console.log("proxy error", err);
            });
            proxy.on("proxyReq", (proxyReq, req, _res) => {
              console.log(
                "Sending Request:",
                req.method,
                req.url,
                " => TO THE TARGET =>  ",
                proxyReq.method,
                proxyReq.protocol,
                proxyReq.host,
                proxyReq.path,
                JSON.stringify(proxyReq.getHeaders())
              );
            });
            proxy.on("proxyRes", (proxyRes, req, _res) => {
              console.log(
                "Received Response from the Target:",
                proxyRes.statusCode,
                req.url,
                JSON.stringify(proxyRes.headers)
              );
            });
          },*/
        },
        "^/pilot/.*/.*/.+": {
          target: `${SERVER_URL}`,
          rewrite: (path) =>
            path.replace(/^\/pilot(\/\w+\/\w+)(\/.*)$/, "/task$1/execute$2"),
          secure: false,
        },
        "^/editing/.*/.*/.+": {
          target: `${SERVER_URL}`,
          rewrite: (path) =>
            path.replace(/^\/editing(\/\w+\/\w+)(\/.*)$/, "/task$1/execute$2"),
          secure: false,
          configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
              console.log("proxy error", err);
            });
            proxy.on("proxyReq", (proxyReq, req, _res) => {
              console.log(
                "Sending Request:",
                req.method,
                req.url,
                " => TO THE TARGET =>  ",
                proxyReq.method,
                proxyReq.protocol,
                proxyReq.host,
                proxyReq.path,
                JSON.stringify(proxyReq.getHeaders())
              );
            });
            proxy.on("proxyRes", (proxyRes, req, _res) => {
              console.log(
                "Received Response from the Target:",
                proxyRes.statusCode,
                req.url,
                JSON.stringify(proxyRes.headers)
              );
            });
          },
        },
      },
    },
  });
};
