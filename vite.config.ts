
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@core": path.resolve(__dirname, "./src/packages/core"),
      "@ui": path.resolve(__dirname, "./src/packages/ui"),
      "@free-estimator": path.resolve(__dirname, "./src/packages/free-estimator"),
      "@auth-estimator": path.resolve(__dirname, "./src/packages/auth-estimator"),
    },
  },
}));
