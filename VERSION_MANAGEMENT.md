# TaskFlow Version Management

This directory contains scripts for automatically managing version numbers in TaskFlow based on git commit messages.

## 📦 Files

- `update-version.js` - Main script that updates package.json version based on commit messages
- `install-hooks.js` - Script to install git hooks
- `hooks/pre-commit` - Git pre-commit hook (runs linting)
- `hooks/post-commit` - Git post-commit hook (updates version)

## 🚀 Setup

1. Install the git hooks:

   ```bash
   npm run install-hooks
   ```

2. Start committing with version numbers:
   ```bash
   git commit -m "v14.1"
   git commit -m "v15.0"
   git commit -m "v15.2.1"
   ```

## 📝 Usage

### Automatic (Recommended)

After installing hooks, just commit with version format:

```bash
git commit -m "v14.1 - Added new feature"
```

The post-commit hook will automatically update package.json and create a follow-up commit.

### Manual

Run the version updater manually:

```bash
npm run update-version
```

## 🎯 Version Format

The script recognizes these commit message formats:

- `v13.1` → package.json version: `13.1.0`
- `v14.0` → package.json version: `14.0.0`
- `v14.4` → package.json version: `14.4.0`
- `v15.2.1` → package.json version: `15.2.1`

## ⚙️ How it Works

1. **Pre-commit hook**: Runs linting to ensure code quality
2. **Post-commit hook**:
   - Reads the latest commit message
   - Extracts version number if present
   - Updates package.json version field
   - Creates an automatic commit with the updated package.json

## 🔧 Troubleshooting

### Hooks not running?

- Make sure hooks are executable: `chmod +x .git/hooks/pre-commit .git/hooks/post-commit`
- Reinstall hooks: `npm run install-hooks`

### Version not updating?

- Check commit message format matches: `v[major].[minor]` or `v[major].[minor].[patch]`
- Run manually to test: `npm run update-version`

### Skip hooks temporarily?

Use `--no-verify` flag:

```bash
git commit --no-verify -m "commit without running hooks"
```

## 📋 Examples

```bash
# These will update package.json:
git commit -m "v13.1"                    # → 13.1.0
git commit -m "v14.0 - Major update"     # → 14.0.0
git commit -m "v14.4 - Bug fixes"       # → 14.4.0

# These will NOT update package.json:
git commit -m "Fixed bug"                # No version format
git commit -m "Added feature"            # No version format
git commit -m "release-1.0"              # Wrong format
```
