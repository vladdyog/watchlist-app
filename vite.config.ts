import { defineConfig } from "vite";
import packageJson from "./package.json";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: process.env.VERCEL ? "/" : "/watchlist-app/",
  plugins: [react(), tailwindcss()],
  define: {
    "import.meta.env.PACKAGE_VERSION": JSON.stringify(
      packageJson.version,
    ),
    "import.meta.env.AUTHOR": JSON.stringify(
      packageJson.author,
    ),
  },
});
