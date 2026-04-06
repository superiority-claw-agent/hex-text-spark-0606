import { cpSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const distDir = path.join(projectRoot, "dist");

rmSync(distDir, { force: true, recursive: true });
mkdirSync(distDir, { recursive: true });

cpSync(path.join(projectRoot, "index.html"), path.join(distDir, "index.html"));
cpSync(path.join(projectRoot, "src"), path.join(distDir, "src"), {
  recursive: true,
});

console.log("Built static assets:");
console.log("dist/index.html");
console.log("dist/src/main.js");
console.log("dist/src/styles.css");
console.log("dist/src/lib/examples.js");
console.log("dist/src/lib/hex.js");
