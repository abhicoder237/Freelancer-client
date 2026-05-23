import { defineConfig, loadEnv } from "vite";
import react                     from "@vitejs/plugin-react";
import path                      from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    resolve: {
      alias: {
        "@":          path.resolve(__dirname, "./src"),
        "@shared":    path.resolve(__dirname, "./src/shared"),
        "@admin":     path.resolve(__dirname, "./src/admin"),
        "@website":   path.resolve(__dirname, "./src/website"),
        "@assets":    path.resolve(__dirname, "./src/assets"),
        "@hooks":     path.resolve(__dirname, "./src/shared/hooks"),
        "@context":   path.resolve(__dirname, "./src/shared/context"),
        "@services":  path.resolve(__dirname, "./src/shared/services"),
        "@utils":     path.resolve(__dirname, "./src/shared/utils"),
        "@constants": path.resolve(__dirname, "./src/shared/constants"),
        "@components":path.resolve(__dirname, "./src/shared/components"),
      },
    },

    // ── No proxy needed in production ───────
    server: {
      port: 5173,
    },

    build: {
      outDir:    "dist",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            query:  ["@tanstack/react-query"],
            ui:     ["react-icons", "react-hot-toast", "react-hook-form"],
          },
        },
      },
    },
  };
});