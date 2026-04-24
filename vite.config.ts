import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Use a different base path when deployed on Vercel vs deploying to GH Pages
  base: process.env.VERCEL ? "/" : "/watchlist-app/",
  plugins: [react()],
});
