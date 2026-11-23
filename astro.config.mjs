import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.daybydoc.fr",
  output: "static",
  trailingSlash: "never",
  build: { format: "file" },
  integrations: [
    sitemap({ filter: (page) => !/\/(merci|404)$/.test(page.replace(/\/$/, "")) }),
  ],
});
