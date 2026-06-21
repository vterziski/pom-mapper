# POM Mapper

A browser extension for Chrome and Firefox that scans web pages and exports Page Object Model (POM) files ready to use in your test automation framework.

## Features

- **Multi-framework** — export for Playwright, Selenium, or Cypress
- **Multi-language** — TypeScript, JavaScript, Java, and Python (Java/Python not available for Cypress)
- **Accumulative scanning** — scan multiple times to capture elements across modals, dropdowns, and dynamic panels before exporting
- **Dynamic list/table support** — repeated rows and list items are automatically collapsed into parameterized `nth`-element methods
- **Salesforce / Shadow DOM** — auto-detects Salesforce Lightning pages and enables deep scan mode to pierce shadow DOM boundaries
- **AI self-healing** — bring your own OpenAI or Anthropic API key to automatically suggest replacement locators when elements break after a UI change
- **Enterprise custom frameworks** — upload a `.pomrc.json` to define your own export template

## Selector Priority

Elements are identified using the following priority order:

1. `data-testid`
2. `aria-label`
3. `id`
4. `name`
5. `title`
6. Role + text content

## Installation

### Chrome

Install directly from the [Chrome Web Store](https://chrome.google.com/webstore/detail/pom-mapper) — no setup required.

**Manual install (developer mode)**

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** and select the project folder
5. The POM Mapper icon will appear in your toolbar

### Firefox

Install directly from [Firefox Add-ons (AMO)](https://addons.mozilla.org/firefox/addon/pom-mapper) — no setup required.

**Manual install (developer mode)**

1. Clone or download this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Navigate to the project folder and select `manifest.json`
5. The POM Mapper icon will appear in your toolbar

> Note: Temporary add-ons in Firefox are removed when the browser closes. For a permanent install use the Firefox Add-ons store link above.

## Usage

1. Navigate to the page you want to map
2. Open any modals, dropdowns, or dynamic panels you want to include
3. Click the POM Mapper icon in the toolbar
4. Select your framework and language
5. Click **Map Page** — repeat as needed to accumulate elements from different UI states
6. Click **Export** to download the generated file

### Deep Scan (Shadow DOM)

For Salesforce pages, deep scan is enabled automatically. You can also toggle it manually to pierce shadow DOM boundaries on any page.

### AI Self-Healing

If locators break after a UI change:

1. Go to **Settings** and enter your OpenAI (`sk-...`) or Anthropic (`sk-ant-...`) API key
2. Select your AI provider
3. From the results view, click **✨ Heal Locators**
4. The extension rescans the page, detects broken locators, and suggests replacements — you approve each one individually

## Example Output

**Playwright (TypeScript)**

```typescript
import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  // Inputs
  emailInput = () => this.page.getByLabel('Email');
  passwordInput = () => this.page.locator('[name="password"]');

  // Buttons
  signInButton = () => this.page.getByRole('button', { name: 'Sign In' });
}
```

**Cypress (JavaScript)**

```javascript
class LoginPage {
  emailInput() { return cy.get('[aria-label="Email"]'); }
  passwordInput() { return cy.get('[name="password"]'); }
  signInButton() { return cy.get('[role="button"]'); }
}

module.exports = { LoginPage };
```

**Selenium (Python)**

```python
from selenium.webdriver.common.by import By

class LoginPage:
    def __init__(self, driver):
        self.driver = driver

    def email_input(self):
        return self.driver.find_element(By.CSS_SELECTOR, '[aria-label="Email"]')

    def password_input(self):
        return self.driver.find_element(By.NAME, "password")

    def sign_in_button(self):
        return self.driver.find_element(By.CSS_SELECTOR, '[role="button"]')
```

## Contributing

Contributions are welcome — bug fixes, new framework/language support, and feature ideas.
See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines and dev setup instructions.
To report a security issue, see [SECURITY.md](SECURITY.md).

## Feedback

Found a bug or have a suggestion? [Open an issue on GitHub](https://github.com/vterziski/pom-mapper/issues/new).

## License

[MIT](LICENSE)
