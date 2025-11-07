// eslint.config.js

// TODO: Implement eslint

// import js from "@eslint/js";
// import { defineConfig } from "eslint/config";
// import tseslint from "typescript-eslint";
// import reactPlugin from "eslint-plugin-react";
// import reactHooks from "eslint-plugin-react-hooks";
// import jsxA11y from "eslint-plugin-jsx-a11y";
// import importPlugin from "eslint-plugin-import";
// import unusedImports from "eslint-plugin-unused-imports";
// import prettierConfig from "eslint-config-prettier";

// /** @type {import("eslint").Linter.FlatConfig[]} */

// export default defineConfig([
//   // --- global shared config for all files ---
//   {
//     ignores: ["node_modules", "dist", "build", "coverage"],
//     files: ["**/*.{ts,tsx,js,jsx}"],
//     languageOptions: {
//       parser: tseslint.parser,
//       parserOptions: {
//         projectService: true, // enables per-folder tsconfig discovery
//         tsconfigRootDir: import.meta.dirname,
//         ecmaVersion: "latest",
//         sourceType: "module",
//         ecmaFeatures: { jsx: true },
//       },
//       globals: {
//         // browser + node shared globals
//         console: "readonly",
//         process: "readonly",
//       },
//     },
//     plugins: {
//       "@typescript-eslint": tseslint.plugin,
//       import: importPlugin,
//       "unused-imports": unusedImports,
//       react: reactPlugin,
//       "react-hooks": reactHooks,
//       "jsx-a11y": jsxA11y,
//     },
//     settings: {
//       react: { version: "detect" },
//     },
//     rules: {
//       // --- hygiene ---
//       "no-unused-vars": "off",
//       "@typescript-eslint/no-unused-vars": "off",
//       "unused-imports/no-unused-imports": "error",

//       // --- import order ---
//       "import/order": [
//         "error",
//         {
//           groups: [
//             "builtin",
//             "external",
//             "internal",
//             "parent",
//             "sibling",
//             "index",
//           ],
//           "newlines-between": "always",
//         },
//       ],

//       // --- React-specific ---
//       "react/react-in-jsx-scope": "off",
//       "react/prop-types": "off",

//       // --- TS-specific ---
//       "@typescript-eslint/no-explicit-any": "warn",
//       "@typescript-eslint/explicit-module-boundary-types": "off",
//     },
//   },

//   //   // --- prettier last to neutralize formatting rules ---
//   //   prettierConfig,
// ]);
