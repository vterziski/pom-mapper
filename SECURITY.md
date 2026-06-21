# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✅ Yes    |

Only the latest published version receives security fixes. We recommend always using the most recent version from the Chrome Web Store or Firefox Add-ons store.

## Reporting a Vulnerability

If you discover a security vulnerability in POM Mapper, please **do not open a public GitHub issue**. Public disclosure before a fix is available puts users at risk.

Instead, report it privately by emailing:

**vane.terziski@gmail.com**

Please include:
- A description of the vulnerability
- Steps to reproduce it
- The potential impact
- Your suggested fix if you have one (optional but appreciated)

We will acknowledge your report within **48 hours** and aim to release a fix within **7 days** for critical issues.

## Scope

The following are considered in scope:

- Logic bugs in the DOM scanner that could expose sensitive page content
- Vulnerabilities in the AI self-healing feature that could leak API keys
- Content Security Policy bypasses introduced by the extension
- Any behaviour that causes the extension to read or transmit data beyond what is documented

The following are out of scope:

- Vulnerabilities in third-party AI providers (OpenAI, Anthropic) — report those directly to them
- Bugs in the browser itself (Chrome, Firefox) — report those to the respective vendors
- Issues that require physical access to the user's device

## Security Design

POM Mapper is designed with the following principles:

- **No remote code** — the extension contains no external script references and does not use `eval()`
- **Local storage only** — API keys and settings are stored in `chrome.storage.local` / `browser.storage.local` and never transmitted to our servers
- **On-demand scanning** — the extension only reads the DOM when the user explicitly clicks Map Page; it does not run in the background or monitor browsing activity
- **BYOK AI** — when AI self-healing is used, locator data is sent directly from the browser to the user's chosen AI provider using their own API key; we have no visibility into this traffic

## Disclosure Policy

We follow a **coordinated disclosure** model. Once a fix is released, we will publicly acknowledge the reporter (unless they prefer to remain anonymous) and document the issue in the release notes.
