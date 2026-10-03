import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { apiPlugin } from "./server/plugin.ts";

export default defineConfig(({ mode }) => {
  // Load every var (not just VITE_*) for the server side only. Nothing here reaches the browser.
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), apiPlugin(env)],
    server: { port: 5173 },
  };
});
