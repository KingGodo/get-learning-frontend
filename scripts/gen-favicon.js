const fs = require("fs");
const path = require("path");

const pub = path.join(__dirname, "..", "public");
const src = path.join(pub, "logo.png");
const dests = [
  path.join(pub, "favicon.png"),
  path.join(__dirname, "..", "src", "app", "icon.png"),
];

if (!fs.existsSync(src)) {
  console.error("missing public/logo.png");
  process.exit(1);
}

for (const dest of dests) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log("copied logo ->", path.relative(path.join(__dirname, ".."), dest));
}
