import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

const siteUrl = process.env.SITE_URL || "https://bota-dev-blogs.github.io";

export default defineConfig({
  site: siteUrl,
  integrations: [mdx()],
  output: "static",
  vite: {
    server: {
      watch: {
        ignored: ["**/.exports/**", "**/.tmp/**", "**/AI/**"]
      }
    }
  }
});
