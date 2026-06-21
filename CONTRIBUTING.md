# Contributing to POM Mapper

Thank you for taking the time to contribute! Whether you're fixing a bug, suggesting a feature, or improving the docs — all contributions are welcome.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

Be respectful and constructive. We welcome contributors of all experience levels. Harassment, discrimination, or dismissive behaviour will not be tolerated.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/your-username/pom-mapper.git
   cd pom-mapper
   ```
3. **Install dependencies** (used for tests only — the extension itself has none):
   ```bash
   npm install
   ```
4. **Run the tests** to make sure everything is working:
   ```bash
   npm test
   ```

---

## How to Contribute

- **Bug fix** — open an issue first to describe the bug, then submit a PR with a fix and a failing test that now passes
- **New feature** — open an issue to discuss the idea before writing code; this avoids wasted effort if the direction doesn't fit the project
- **Documentation** — feel free to submit PRs directly for typos, unclear wording, or missing instructions
- **New framework or language** — add the template under `src/exporter/templates/`, wire it up in `src/exporter/index.js`, mirror the logic in `content/content.js`, and add tests

---

## Development Setup

The extension is pure vanilla JavaScript with no build step. To load it in your browser during development:

**Chrome**
1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the project folder

**Firefox**
1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `manifest.json` from the project folder

After any code change, click the reload button on the extension card to pick up the changes.

### Running tests

```bash
npm test          # run all tests
npm test -- --watch   # watch mode
```

Tests use Jest with jsdom. All modules in `src/` are covered. The `content/content.js` file mirrors the scanner logic inline (Chrome extensions cannot use `require()`), so any logic change must be applied in both places.

---

## Project Structure

```
pom-mapper/
├── manifest.json           # Extension manifest (MV3)
├── content/
│   └── content.js          # Content script — injected into pages on demand
├── popup/
│   ├── popup.html          # Extension popup UI
│   ├── popup.css           # Popup styles
│   └── popup.js            # Popup logic (inlined locator generator)
├── icons/                  # Extension icons (16, 48, 128px)
├── src/
│   ├── naming.js           # camelCase / snake_case name generation
│   ├── selector.js         # Selector priority logic
│   ├── scanner.js          # DOM scanning, shadow DOM, list detection
│   └── exporter/
│       ├── locators.js     # Locator string generation for all frameworks
│       ├── index.js        # Exporter entry point
│       └── templates/      # One file per framework+language combination
└── tests/                  # Jest unit tests mirroring src/ structure
```

---

## Submitting a Pull Request

1. Create a branch from `main`:
   ```bash
   git checkout -b fix/your-bug-description
   ```
2. Make your changes
3. Add or update tests where relevant
4. Run `npm test` and make sure all tests pass
5. Commit with a clear message:
   ```bash
   git commit -m "fix: describe what you fixed and why"
   ```
6. Push and open a Pull Request against `main`
7. Fill in the PR description — what changed, why, and how to test it

PRs without passing tests will not be merged.

---

## Reporting Bugs

[Open an issue](https://github.com/vterziski/pom-mapper/issues/new) and include:

- Browser and version
- The URL or type of page where it happened (no need to share sensitive content)
- Steps to reproduce
- What you expected vs what actually happened
- A screenshot of the popup if relevant

---

## Suggesting Features

[Open an issue](https://github.com/vterziski/pom-mapper/issues/new) with the label `enhancement` and describe:

- The problem you're trying to solve
- How you imagine the feature working
- Any framework, language, or site-specific context that's relevant

---

## Questions?

If you're unsure about anything, open an issue and ask. There are no stupid questions.
