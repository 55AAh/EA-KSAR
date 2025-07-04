import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "./frontend",
  plugins: [react()],
  server: {
    proxy: {
      "^/(api|docs|openapi.json)": "http://localhost:8000",
    },
  },
});
