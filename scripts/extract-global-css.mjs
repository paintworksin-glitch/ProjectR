import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const appPath = path.join(root, "src/App.jsx");
const s = fs.readFileSync(appPath, "utf8");
const start = s.indexOf("const G = `");
const end = s.indexOf("`;\n\nconst ShinyText");
if (start < 0 || end < 0) throw new Error("markers not found");
const inner = s.slice(start + "const G = `".length, end);
fs.writeFileSync(
  path.join(root, "src/modules/globalStyles.js"),
  `export const G = \`${inner}\`;\n`
);
const merged = s.slice(0, start) + s.slice(end + "`;\n\n".length);
fs.writeFileSync(path.join(root, "src/modules/NorthingApp.jsx"), merged);
console.log("OK", inner.length, "chars CSS");
