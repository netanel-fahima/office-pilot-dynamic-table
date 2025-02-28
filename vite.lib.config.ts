import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    }),
  ],
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "DynamicTable",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "antd",
        "firebase/app",
        "firebase/firestore",
        "firebase/auth",
        "lucide-react",
        "@hello-pangea/dnd",
        "@rjsf/antd",
        "@rjsf/core",
        "@rjsf/utils",
        "@rjsf/validator-ajv8",
        "xlsx",
        "file-saver",
      ],
      output: {
        globals: {
          react: "React",
          "react/jsx-runtime": "jsx",
          "react-dom": "ReactDOM",
          antd: "antd",
          "firebase/app": "firebase",
          "firebase/firestore": "firestore",
          "firebase/auth": "auth",
          "lucide-react": "lucide",
          "@hello-pangea/dnd": "dnd",
          "@rjsf/antd": "rjsfAntd",
          "@rjsf/core": "rjsfCore",
          "@rjsf/utils": "rjsfUtils",
          "@rjsf/validator-ajv8": "rjsfValidator",
          xlsx: "XLSX",
          "file-saver": "FileSaver",
        },
      },
    },
  },
});
