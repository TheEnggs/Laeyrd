// eslint.config.js
import { defineConfig } from "eslint/config";
import js from "@eslint/js";

export default defineConfig([
  {
    ignores: [
      "dist",
      "node_modules",
      "build",
      "coverage",
      "*.config.js", // optional if you don’t want to lint config files
    ],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "module",
      ecmaVersion: "latest",
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": "warn",
      "no-undef": "warn",
    },
  },
]);
