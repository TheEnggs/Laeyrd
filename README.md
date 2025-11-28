![Logo](https://raw.githubusercontent.com/TheEnggs/Laeyrd/master/packages/media/icons/laeyrd.png)

# 🧩 Laeyrd — Theme, Settings & Sync for VS Code

> **🎉 Extension is available on marketplace 🎉**
> [Check Out](https://marketplace.visualstudio.com/items?itemName=TheEnggs.Laeyrd)

![Logo](https://raw.githubusercontent.com/TheEnggs/Laeyrd/master/packages/media/preview.png)

---

## ✨ Overview

**Laeyrd** is a Visual Studio Code extension designed to give developers full control over their editor’s **look, feel, and behavior** — all from within VS Code itself.

It’s not just a theme — it’s a _theme builder_, _settings manager_, and _sync engine_ rolled into one extension.

At its core, Laeyrd lets you:

1. 🎨 **Create and customize new themes** directly inside VS Code.
2. ⚙️ **Modify and sync your settings** seamlessly across machines.
3. ☁️ **Authenticate with GitHub** (via device flow) to sync your personalized environment safely.

---

## 🚧 Status

This extension is in **active development**.
Expect occasional bugs, rough edges, and missing polish while testing.

- 🐛 Some UI actions may fail or behave inconsistently.
- 🔐 Sync and authentication are under active development.
- 💾 File paths, schema, and local storage locations may change in future releases.

---

## 🧠 Features

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

## 🧩 Tech Stack

| Part                  | Description                                           |
| --------------------- | ----------------------------------------------------- |
| **Extension Backend** | Node.js (CommonJS) with TypeScript                    |
| **Webview UI**        | React + Vite + Tailwind CSS                           |
| **Storage**           | Local VS Code global storage (for themes & settings)  |
| **Sync**              | GitHub Device Flow API                                |
| **Build Tooling**     | VSCE + Vite + ESBuild + TypeScript project references |
