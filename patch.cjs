const fs = require("fs");
const file = "node_modules/@tanstack/router-plugin/dist/esm/core/code-splitter/compilers.js";
let content = fs.readFileSync(file, "utf8");

content = content.replace(
  /import\('\$\{splitUrl\}'\)/g,
  "import('${splitUrl.replace(/'/g, \"\\\\'\")}')"
);

fs.writeFileSync(file, content);
console.log("Patched successfully again!");
