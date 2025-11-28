import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["./packages/extension/src/extension.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node18",
  outfile: "./dist/extension.js",
  external: ["vscode"],
  sourcemap: false,
  minify: true,
  tsconfig: "./packages/extension/tsconfig.json",
  mainFields: ["module", "main"],
});
