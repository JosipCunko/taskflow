#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

/**
 * Script to automatically update package.json version based on git commit messages
 * Expects commit messages in format: v13.1, v14.0, v14.4, etc.
 */

function getLatestCommitMessage() {
  try {
    const commitMessage = execSync("git log -1 --pretty=%B", {
      encoding: "utf8",
    }).trim();
    return commitMessage;
  } catch (error) {
    console.error("Error getting commit message:", error.message);
    return null;
  }
}

function extractVersionFromCommit(commitMessage) {
  // Match version patterns like v13.1, v14.0, v14.4
  const versionRegex = /^v(\d+)\.(\d+)(?:\.(\d+))?/;
  const match = commitMessage.match(versionRegex);

  if (match) {
    const major = match[1];
    const minor = match[2];
    const patch = match[3] || "0"; // Default patch to 0 if not specified
    return `${major}.${minor}.${patch}`;
  }

  return null;
}

function updatePackageJsonVersion(newVersion) {
  const packageJsonPath = path.join(__dirname, "package.json");

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const oldVersion = packageJson.version;

    if (oldVersion === newVersion) {
      console.log(
        `Version ${newVersion} is already up to date in package.json`
      );
      return false;
    }

    packageJson.version = newVersion;
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2) + "\n"
    );

    console.log(
      `✅ Updated package.json version from ${oldVersion} to ${newVersion}`
    );
    return true;
  } catch (error) {
    console.error("Error updating package.json:", error.message);
    return false;
  }
}

function main() {
  console.log("🔍 Checking latest commit for version update...");

  const commitMessage = getLatestCommitMessage();
  if (!commitMessage) {
    console.log("❌ Could not retrieve commit message");
    process.exit(1);
  }

  console.log(`📝 Latest commit: "${commitMessage}"`);

  const version = extractVersionFromCommit(commitMessage);
  if (!version) {
    console.log(
      "ℹ️  No version found in commit message (expected format: v13.1, v14.0, etc.)"
    );
    console.log("   Skipping version update.");
    process.exit(0);
  }

  console.log(`🎯 Found version: ${version}`);

  const updated = updatePackageJsonVersion(version);

  if (updated) {
    console.log("✨ Version update complete!");

    // Optionally stage the updated package.json
    try {
      execSync("git add package.json", { stdio: "ignore" });
      console.log("📦 Staged package.json for commit");
    } catch {
      console.log(
        "⚠️  Could not stage package.json (this is okay if running outside git)"
      );
    }
  }
}

// Handle command line arguments
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
📦 TaskFlow Version Updater

This script automatically updates package.json version based on git commit messages.

Usage:
  node update-version.js              # Update based on latest commit
  node update-version.js --help       # Show this help

Expected commit message format:
  v13.1    -> package.json version: 13.1.0
  v14.0    -> package.json version: 14.0.0
  v14.4    -> package.json version: 14.4.0
  v15.2.1  -> package.json version: 15.2.1

The script will:
1. Read the latest git commit message
2. Extract version if it matches the pattern
3. Update package.json version field
4. Stage package.json for commit (if in git repo)
`);
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { extractVersionFromCommit, updatePackageJsonVersion };
