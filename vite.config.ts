import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1];
const pagesBase = repository && !repository.endsWith(".github.io") ? `/${repository}/` : "/";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.GITHUB_ACTIONS ? pagesBase : "/",
  build: {
    emptyOutDir: true,
  },
});
