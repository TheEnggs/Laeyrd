# Contributing to Laeyrd

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them.

Please make sure to read the relevant section before making your contribution. It will make it a lot easier for us maintainers and smooth out the experience for all involved. The community looks forward to your contributions.

> And if you like the project, but just don't have time to contribute, that's fine. There are other easy ways to support the project and show your appreciation, which we would also be very happy about:
> - Star the project
> - Tweet about it
> - Refer this project in your project's readme
> - Mention the project at local meetups and tell your friends/colleagues

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)
- [Development Workflow](#development-workflow)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [Running the Extension](#running-the-extension)
  - [Project Structure](#project-structure)
- [Styleguides](#styleguides)

## Code of Conduct

This project and everyone participating in it is governed by the [Laeyrd Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [INSERT EMAIL].

## I Have a Question

If you want to ask a question, we assume that you have read the available [Documentation](README.md).

Before you ask a question, it is best to search for existing [Issues](https://github.com/theenggs/laeyrd/issues) that might help you. In case you've found a suitable issue and still need clarification, you can write your question in this issue. It is also advisable to search the internet for answers first.

## I Want To Contribute

### Reporting Bugs

- **Use a clear and descriptive title** for the issue to identify the problem.
- **Describe the exact steps to reproduce the problem** in as many details as possible.
- **Provide specific examples to demonstrate the steps**. Include links to files or GitHub projects, or copy/pasteable snippets, which you use in those examples.
- **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
- **Explain which behavior you expected to see instead and why.**
- **Include screenshots and animated GIFs** which show you following the described steps and clearly demonstrate the problem.

### Suggesting Enhancements

- **Use a clear and descriptive title** for the issue to identify the suggestion.
- **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why.
- **Include screenshots and animated GIFs** which help you demonstrate the steps or point out the part which the suggestion is related to.

### Your First Code Contribution

Unsure where to begin contributing? You can start by looking through these `good first issue` and `help wanted` issues:

- [Good First Issues](https://github.com/theenggs/laeyrd/labels/good%20first%20issue) - issues which should only require a few lines of code, and a test or two.
- [Help Wanted Issues](https://github.com/theenggs/laeyrd/labels/help%20wanted) - issues which should be a bit more involved than beginner issues.

## Development Workflow

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [VS Code](https://code.visualstudio.com/)

### Setup

1. Fork the repository.
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/laeyrd.git`
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Extension

1. Open the project in VS Code: `code .`
2. Press `F5` to start debugging. This will:
   - Build the extension and webview.
   - Launch a new VS Code window (Extension Development Host) with the extension loaded.
3. In the new window, run the command `Laeyrd: Open` to see the extension in action.

**Hot Reloading:**
- The project supports hot reloading for the webview.
- Run `npm run dev` in the terminal to start the watch mode for both extension and webview.

### Project Structure

The project is a monorepo-style structure:

- `packages/extension`: The VS Code extension host code (backend).
- `packages/webview-ui`: The React-based UI for the webview (frontend).
- `packages/shared`: Shared types and utilities used by both.

## Styleguides

### Commit Messages

- Use [Conventional Commits](https://www.conventionalcommits.org/)
- Format: `<type>(<scope>): <subject>`
  - `feat`: New feature
  - `fix`: Bug fix
  - `docs`: Documentation only changes
  - `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
  - `refactor`: A code change that neither fixes a bug nor adds a feature
  - `perf`: A code change that improves performance
  - `test`: Adding missing tests or correcting existing tests
  - `chore`: Changes to the build process or auxiliary tools

### Code Style

- We use **Prettier** for code formatting.
- We use **ESLint** for linting.
- Run `npm run lint` to check for issues.
- Run `npm run lint:fix` to fix auto-fixable issues.
