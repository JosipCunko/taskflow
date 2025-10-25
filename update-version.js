/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * update-version.js
 *
 * Updates the version in package.json and sw.js based on the commit message.
 * Usage:
 *   npm run update-version major   → 1.2.3 → 2.0.0
 *   npm run update-version minor   → 1.2.3 → 1.3.0
 *   npm run update-version patch   → 1.2.3 → 1.2.4
 */

const fs = require("fs");
const path = require("path");

const packageJsonPath = path.join(__dirname, "package.json");
const swJsPath = path.join(__dirname, "public", "sw.js");

if (!fs.existsSync(packageJsonPath)) {
  console.error("❌ package.json not found in current directory");
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const [major, minor, patch] = pkg.version.split(".").map(Number);

const bumpType = process.argv[2];

if (!["major", "minor", "patch"].includes(bumpType)) {
  console.log(`
❌ Invalid or missing argument.

Usage:
  npm run update-version major   → 1.2.3 → 2.0.0
  npm run update-version minor   → 1.2.3 → 1.3.0
  npm run update-version patch   → 1.2.3 → 1.2.4
`);
  process.exit(1);
}

let newVersion;

switch (bumpType) {
  case "major":
    newVersion = `${major + 1}.0.0`;
    break;
  case "minor":
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case "patch":
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

// Update package.json
pkg.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + "\n");
console.log(`✅ Version updated in package.json: ${newVersion}`);

// Update sw.js
try {
  if (fs.existsSync(swJsPath)) {
    let swContent = fs.readFileSync(swJsPath, "utf8");
    const newSwContent = swContent.replace(
      /(const CACHE_VERSION = ")[^"]*(")/,
      `$1${newVersion}$2`
    );

    if (newSwContent !== swContent) {
      fs.writeFileSync(swJsPath, newSwContent, "utf8");
      console.log(`✅ Cache version updated in public/sw.js: ${newVersion}`);
    } else {
      console.warn("⚠️ CACHE_VERSION could not be updated in public/sw.js.");
    }
  } else {
    console.warn("⚠️ public/sw.js not found, skipping cache version update.");
  }
} catch (error) {
  console.error("❌ Error updating service worker version:", error);
}
