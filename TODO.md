---
title: Roadmap & Upcoming Features
description: What you can expect next from the Laeyrd theme customizer extension.
---

# Roadmap · Work in Progress

This project is still evolving. Below is a rough list of what’s planned so users and contributors know what’s coming next. Nothing here is set in stone, but these are the main directions.

---

## Code Cleanup & Refactors

The current codebase works, but there are plenty of areas that need polishing:

- Better separation of concerns between extension host, webview UI, and shared types
- Stricter TypeScript types and safer message contracts
- Cleanup of legacy experiments, dead code, and temporary hacks
- More consistent naming, folder structure, and internal APIs

You can expect gradual refactors to make the project easier to understand, navigate, and contribute to.

---

## Open Source Contributions

This project is intended to be contributor-friendly:

- Clearer documentation (`README`, `CONTRIBUTING`, and architecture notes)
- Well-defined issues with labels like `good first issue` and `help wanted`
- Small, focused tasks for UI, UX, and extension logic
- Discussions around design decisions, roadmap, and new ideas

Community feedback and contributions will shape how this tool grows.

---

## Color Grouping & Better Organization

Right now colors and tokens are editable, but the UX can be improved:

- Grouping colors by **semantic purpose** (backgrounds, borders, text, accents, etc.)
- Grouping token colors by **language role** (variables, functions, types, comments, etc.)
- Smarter mapping for imported themes (better defaults and fallbacks)
- More intuitive panels to help users understand _what_ they are changing

The goal is to make theme customization understandable, not just a wall of hex codes.

---

## Authentication

Planned support for optional authentication to unlock:

- User-specific profiles
- Cloud-backed theme collections
- Shared presets across machines

This will most likely be optional and only needed for features that require remote storage or sync.

---

## Sync Feature

A core long-term goal:

- Sync theme configurations across multiple machines
- Backup of drafts and saved themes
- Potential integration with external storage (e.g. a simple backend, or exportable sync files)

The idea is that once you tune your setup, you don’t have to rebuild it every time you switch environments.

---

## AI Integration (On Demand)

AI will be opt-in and used **only when requested**, not silently in the background.

Possible areas:

- Suggesting color palettes based on an existing theme or mood
- Proposing adjustments for better contrast and accessibility
- Generating starting points for new themes based on descriptions

If you don’t want AI involved, you’ll still have full manual control.

---

## More Setup & Quality-of-Life Features

There are many smaller features planned to make the extension easier to live with:

- Better onboarding for first-time users
- Guided flows to import, tweak, and apply themes safely
- Safer apply/revert mechanisms with clear diffing & rollback
- More preview options and fine-grained control over what gets overridden
- Optional presets and templates for common theme styles

This file is intentionally not a strict spec. It’s here to give you a sense of direction and to invite ideas, feedback, and contributions.

---

If you have suggestions, find bugs, or want to help build any of these features, feel free to open an issue or discussion in the repository.
::contentReference[oaicite:0]{index=0}
