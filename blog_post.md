# Introducing Laeyrd: A Better Way to Manage VS Code Themes and UI elements

If you’re like me, you spend a lot of time in VS Code. And if you care about your development environment, you’ve probably spent way too much time tweaking your theme in `settings.json`.

Changing a comment color or adjusting the sidebar contrast usually involves:
1. Opening `settings.json`.
2. Guessing the right scope (is it `editor.background` or `panel.background`?).
3. Typing a hex code.
4. Saving and checking if it looks right.
5. Repeating until you give up.

I built **Laeyrd** to solve this. It’s a VS Code extension that gives you a proper UI for customizing your editor, plus a way to sync those customizations across your machines.

## What it does

Laeyrd isn't a theme itself; it's a tool to modify *any* theme and settings. It sits on top of your current setup and lets you override specific values without touching a JSON file.

### 1. Visual Customization
You get a panel with color pickers for common UI elements (activity bar, sidebar, editor background, etc.). Changes are applied in real-time as a "draft" so you can see exactly what you're getting before you commit to it.

### 2. Token Inspection & Editing
Instead of hunting for TextMate scopes, Laeyrd lets you target specific syntax highlighting colors. You can adjust how functions, variables, or keywords look, regardless of the active theme.

### 3. Sync Across Machines
This is the big one. If you work on multiple computers (e.g., a work laptop and a personal desktop), keeping your config in sync is a pain. Laeyrd handles this by syncing your theme overrides and settings, so your environment feels the same everywhere.

### 4. Font & Layout Control
It also exposes settings for fonts (family, size, weight) and layout (line height, density) in a unified interface, saving you from digging through the default settings UI.

### 5. Instant Theme Creation
Creating a custom theme usually involves generating a project, packaging a `.vsix` file, and installing it. Laeyrd allows you to create a new theme directly inside VS Code. Once you save your drafts, your new theme appears instantly in the **Color Theme** tab. It feels just like a native extension—easy to switch to and manage—without needing to manually edit `settings.json` for the initial setup. We only rely on `settings.json` for ongoing customization, keeping the creation process seamless.

## How it works

Under the hood, Laeyrd uses the VS Code API to write to `workbench.colorCustomizations` and `editor.tokenColorCustomizations`. When you publish, it registers a new theme directly in the editor. This eliminates the need to generate, download, or install a `.vsix` file. You get a first-class theme entry that you can switch to anytime, with `settings.json` handling only the specific overrides you make on top of it.

The UI is a React application running in a Webview, communicating with the extension host to apply changes.

## Open Source

I’ve recently open-sourced Laeyrd. If you’re interested in how it works or want to contribute, check out the repository. The architecture is pretty standard:
- **Extension Host**: TypeScript/Node.js
- **UI**: React/Vite/Tailwind

## Try it out

You can install Laeyrd from the VS Code Marketplace. It’s free and open source.

[Link to Marketplace]
[Link to GitHub]
