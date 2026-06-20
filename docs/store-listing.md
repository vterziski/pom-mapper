# Chrome Web Store — submission reference

## Store description (copy-paste into the listing)

POM Mapper scans any web page and exports ready-to-use Page Object Model (POM) files for your test automation framework — no manual writing required.

**Frameworks supported**
- Playwright — TypeScript, JavaScript, Java, Python
- Selenium — TypeScript, JavaScript, Java, Python
- Cypress — TypeScript, JavaScript

**How it works**
1. Navigate to the page you want to automate
2. Open any modals, dropdowns, or dynamic panels you want to capture
3. Click Map Page — repeat as many times as needed to accumulate elements from different UI states
4. Choose your framework and language, then click Export

The extension prioritises the most stable selectors automatically: data-testid → aria-label → id → name → title → role+text.

**Key features**
- Accumulative scanning — merge multiple scans before exporting, perfect for single-page apps with dynamic content
- Dynamic lists and tables — repeated rows are collapsed into parameterised nth-element methods automatically
- Shadow DOM / Salesforce — auto-detects Salesforce Lightning pages and enables deep scan mode to pierce shadow DOM boundaries
- AI self-healing (BYOK) — bring your own OpenAI or Anthropic API key to automatically suggest replacement locators when elements change after a UI update
- Enterprise custom templates — upload a .pomrc.json to use your own export format

No data is collected. API keys are stored locally in your browser and never shared.

---

## host_permissions justification (paste into the submission form)

POM Mapper is a DOM inspection tool that must be able to scan any web page the user navigates to — including internal apps, staging environments, and third-party websites used in test automation workflows. There is no way to know in advance which URLs a QA engineer will be testing, so restricting to a predefined list of hosts would make the extension non-functional for the majority of use cases.

The extension only reads the DOM of the active tab when the user explicitly clicks "Map Page". It does not run in the background, does not monitor browsing history, and does not transmit any page content to external servers (unless the user opts in to AI self-healing using their own API key, in which case locator data is sent directly to the provider they configured).

---

## Screenshots checklist (1280×800 or 640×400 PNG, at least 1 required)

Suggested shots to take in Chrome:
1. Ready state — popup open on a real login page showing the framework/language selectors
2. Results state — elements listed after a scan, showing the locator preview
3. Export state — the downloaded .ts or .py file open in an editor
4. Salesforce page — deep scan toggle enabled with the ⚡ badge visible

## Promotional images

- `docs/promo-tile.svg` — 440×280 small tile (export to PNG before uploading)
