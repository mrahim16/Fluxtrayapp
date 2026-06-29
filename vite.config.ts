import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { spawn } from "child_process";

const host = process.env.TAURI_DEV_HOST;
const automationScript = resolve(__dirname, "playwright", "automation.ts");

export default defineConfig(() => ({
  plugins: [
    vue(),
    {
      name: "automation-endpoint",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url !== "/api/automation" || req.method !== "POST") {
            next();
            return;
          }

          const child = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["tsx", automationScript], {
            cwd: __dirname,
            env: process.env,
          });

          let stdout = "";
          let stderr = "";

          child.stdout.on("data", (chunk) => {
            stdout += chunk.toString();
          });

          child.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
          });

          child.on("error", (error) => {
            res.statusCode = 500;
            res.setHeader("content-type", "application/json");
            res.end(JSON.stringify({ error: `Could not start automation: ${error.message}` }));
          });

          child.on("close", (code) => {
            if (code !== 0) {
              res.statusCode = 500;
              res.setHeader("content-type", "application/json");
              res.end(JSON.stringify({ error: stderr.trim() || "Automation failed." }));
              return;
            }

            res.statusCode = 200;
            res.setHeader("content-type", "application/json");
            res.end(stdout.trim());
          });
        });
      },
    },
  ],

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },

  clearScreen: false,

  server: {
    port: 1422,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,

    watch: {
      ignored: ["**/src-tauri/**"],
    },
    build: {
      sourcemap: false,
    },
  },
}));
