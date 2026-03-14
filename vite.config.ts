import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * Converts render-blocking CSS <link> tags to non-blocking preloads
 * with a JS fallback, so the browser doesn't block first paint.
 */
function cssPreloadPlugin(): Plugin {
  return {
    name: "css-preload",
    enforce: "post",
    transformIndexHtml(html) {
      // Match Vite-injected CSS link tags and convert to preload
      return html.replace(
        /<link rel="stylesheet"(.*?)href="(.*?\.css)"(.*?)>/g,
        (_, before, href, after) =>
          `<link rel="preload" as="style" href="${href}" onload="this.onload=null;this.rel='stylesheet'"${before}${after}>` +
          `<noscript><link rel="stylesheet" href="${href}"></noscript>`
      );
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    cssPreloadPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
