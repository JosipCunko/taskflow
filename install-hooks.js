#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Script to install git hooks for TaskFlow
 */

function installHooks() {
  const hooksDir = path.join(__dirname, "hooks");
  const gitHooksDir = path.join(__dirname, ".git", "hooks");

  // Check if .git directory exists
  if (!fs.existsSync(gitHooksDir)) {
    console.log(
      "❌ .git/hooks directory not found. Make sure you are in a git repository."
    );
    process.exit(1);
  }

  // Check if hooks directory exists
  if (!fs.existsSync(hooksDir)) {
    console.log("❌ hooks directory not found.");
    process.exit(1);
  }

  console.log("📦 Installing TaskFlow git hooks...");

  const hooks = ["pre-commit", "post-commit"];
  let installed = 0;

  hooks.forEach((hookName) => {
    const sourcePath = path.join(hooksDir, hookName);
    const targetPath = path.join(gitHooksDir, hookName);

    if (fs.existsSync(sourcePath)) {
      try {
        // Copy the hook file
        fs.copyFileSync(sourcePath, targetPath);

        // Make it executable (Unix/Linux/Mac)
        if (process.platform !== "win32") {
          fs.chmodSync(targetPath, "755");
        }

        console.log(`✅ Installed ${hookName} hook`);
        installed++;
      } catch (error) {
        console.log(`❌ Failed to install ${hookName} hook:`, error.message);
      }
    } else {
      console.log(`⚠️  Hook file ${hookName} not found in hooks directory`);
    }
  });

  if (installed > 0) {
    console.log(`\n🎉 Successfully installed ${installed} git hook(s)!`);
    console.log("\n📝 Usage:");
    console.log('  - Commit with version format: git commit -m "v14.1"');
    console.log(
      "  - The post-commit hook will automatically update package.json"
    );
    console.log("  - Or run manually: npm run update-version");
  } else {
    console.log("\n❌ No hooks were installed.");
    process.exit(1);
  }
}

if (require.main === module) {
  installHooks();
}
