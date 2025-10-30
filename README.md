# 🧩 Laeyrd — Theme, Settings & Sync for VS Code

> **⚠️ Pre-release Notice**  
> Laeyrd is currently in **early testing** and not ready for production use.  
> Expect bugs, missing features, and occasional chaos. We are not expecting contributions right now, will open soon.
> VSIX file will be released soon for testing purposes.
---

## ✨ Overview

**Laeyrd** is a Visual Studio Code extension designed to give developers full control over their editor’s **look, feel, and behavior** — all from within VS Code itself.  

It’s not just a theme — it’s a *theme builder*, *settings manager*, and *sync engine* rolled into one extension.

At its core, Laeyrd lets you:

1. 🎨 **Create and customize new themes** directly inside VS Code.
2. ⚙️ **Modify and sync your settings** seamlessly across machines.
3. ☁️ **Authenticate with GitHub** (via device flow) to sync your personalized environment safely.

---

## 🚧 Project Status

Laeyrd is **not production ready** yet.  
This pre-release version exists for **testing and feedback**.

- 🧪 Expect unfinished features.
- 🐛 Some UI actions may fail or behave inconsistently.
- 🔐 Sync and authentication are under active development.
- 💾 File paths, schema, and local storage locations may change in future releases.

---

## 🧠 Features (Pre-release)

### 🎨 Theme Customization

- Create your **own theme** from scratch or base it on an existing one.
- Modify editor colors, token colors, and UI accents.
- Save and apply new themes that behave like any installed VS Code theme.
- Your generated theme files are stored locally (for now) and automatically registered with VS Code.

> Example: Create a new theme, tweak its syntax colors, and it instantly appears in your theme picker.

---

### ⚙️ Settings Customization

- Manage your VS Code settings from within a clean, integrated UI.
- Adjust configuration categories such as:
  - Font family & size  
  - Line height & minimap visibility  
  - Editor background & caret color  
  - Workbench behavior and layout options
- All changes are applied in real-time, without manually editing `settings.json`.

> Laeyrd aims to make “editor personalization” accessible without touching raw JSON.

---

### ☁️ Sync Feature (Experimental)

- Sync your custom themes and settings across machines.
- Uses **GitHub authentication** through **device flow**.
- Securely connects and backs up your configuration.
- Future support planned for:
  - Cross-device restore
  - Versioned backups
  - Multi-account sync

> Currently, sync works **only with GitHub**, and only in testing environments.

---

## 🧩 Tech Stack

| Part | Description |
|------|--------------|
| **Extension Backend** | Node.js (CommonJS) with TypeScript |
| **Webview UI** | React + Vite + Tailwind CSS |
| **Storage** | Local VS Code global storage (for themes & settings) |
| **Sync** | GitHub Device Flow API |
| **Build Tooling** | VSCE + Vite + TypeScript project references |

---

## 🧰 Development Setup

Clone and install dependencies:

```bash
git clone https://github.com/your-org/laeyrd
cd laeyrd
npm install
