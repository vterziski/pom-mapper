# POM Mapper v1.2–v1.4 Feature Design

**Date:** 2026-06-26
**Scope:** Three iterative releases adding competitive differentiators, new audience reach, and power features
**Sequencing:** Impact First — beat competition → expand audience → deepen core

---

## Overview

All features ship across three minor versions:

| Version | Theme | Features |
|---------|-------|----------|
| v1.2 | Control & Quality | Element picker, rename in popup, exclude/filter, iframe chooser, locator quality score |
| v1.3 | New Audiences | C# support, WebdriverIO, Robot Framework, GUIDE.md + help link |
| v1.4 | Power Features | Export history, snapshot export/import, clipboard copy |

---

## v1.2 — Control & Quality

### 1. Visual Element Picker

**What it does:** Adds a "Pick" mode activated from the popup. When enabled, the extension injects a hover overlay into the page — mousing over elements highlights them with a blue border and tooltip showing the generated name and locator. Clicking an element toggles its inclusion in the scan results.

**Architecture:**
- New `picker.js` content script injected on demand when Pick mode is activated
- Communicates with popup via `chrome.runtime.sendMessage` to add/remove elements
- Overlay uses `pointer-events: none` except on the highlight layer to avoid breaking page interactions
- Pick mode deactivates automatically when the popup closes

**UI changes:**
- New "Pick Elements" button in the popup below the Map Page button
- Button toggles to "Stop Picking" when active
- Popup shows live count of picked elements

**Testing requirements:**
- Verify picker highlights elements correctly on standard pages, SPAs, and Salesforce
- Verify adding/removing elements updates the results list correctly
- Verify picker deactivates cleanly on popup close

---

### 2. Rename Elements in Popup

**What it does:** Each element row in the results list is editable. An inline edit icon appears on hover. Clicking it replaces the name with a text input. Pressing Enter or clicking away commits the new name. The export uses the renamed value.

**Architecture:**
- Rename state stored in popup memory (not persisted between sessions)
- Renamed elements marked with a subtle indicator so the user knows it was manually changed
- Export templates receive the final resolved name — no changes needed in templates themselves

**UI changes:**
- Pencil icon on each element row (visible on hover)
- Inline text input replaces the name on edit
- Renamed rows show a small "edited" dot indicator

**Testing requirements:**
- Verify renamed elements export with the new name across all frameworks and languages
- Verify special characters in names are sanitised (spaces → camelCase, invalid chars stripped)
- Verify rename state is preserved when switching framework/language before export

---

### 3. Exclude / Filter Elements Before Export

**What it does:** Each element row gets a checkbox (checked by default). Unchecking removes the element from the export. A toolbar above the list provides Select All / Deselect All. Elements with auto-generated names that are likely noise (unnamed divs, spans without meaningful attributes) are auto-unchecked on first scan.

**Architecture:**
- Exclusion state stored in popup memory alongside rename state
- Auto-exclusion logic in `scanner.js` — elements with no testid, aria-label, id, name, or meaningful role get flagged
- Export reads only checked elements

**UI changes:**
- Checkbox on each element row (left side)
- "Select all / Deselect all" toggle above the list
- Export button label updates to "Export (12)" showing count of selected elements
- Greyed-out rows for unchecked elements

**Testing requirements:**
- Verify unchecked elements are absent from all export formats
- Verify auto-exclusion correctly flags noise without removing legitimate elements
- Verify Select All / Deselect All works correctly
- Verify export count badge updates in real time

---

### 4. iframe Chooser

**What it does:** After scanning, if iframes are detected, a collapsible panel appears above the results listing each iframe by `src` or `title`. The user checks which iframes to include and clicks "Scan Selected iframes" to merge those elements into the results.

**Architecture:**
- `scanner.js` detects iframes during page scan and returns them as a separate `iframes` array in the scan result
- Popup renders the iframe chooser panel when `iframes.length > 0`
- On confirmation, content script re-enters selected iframes using `contentDocument` and appends results
- Cross-origin iframes (where `contentDocument` is null) are shown as disabled with a "Cross-origin — cannot scan" label

**UI changes:**
- Collapsible "Iframes detected (N)" panel above results
- Checkbox list of iframes with src/title
- "Scan Selected iframes" button at the bottom of the panel
- Cross-origin iframes shown greyed out with explanation

**Testing requirements:**
- Verify same-origin iframes are scanned and elements merged correctly
- Verify cross-origin iframes are detected and disabled gracefully
- Verify iframe elements appear in export grouped under a comment indicating their iframe source
- Verify pages with no iframes show no iframe panel

---

### 5. Locator Quality Score

**What it does:** Each element row displays a mini score bar showing locator stability. Clicking a weak or moderate bar opens an inline panel with 2–3 alternative locator suggestions ranked by stability. The user can select one to replace the original.

**Score tiers:**
- **Strong** (full bar, green) — `data-testid`, `aria-label`, `id`
- **Fair** (60% bar, amber) — `name`, `title`, `role + text`
- **Weak** (25% bar, red) — positional selectors, generic class names, nth-child

**Architecture:**
- New `quality.js` module — `scoreLocator(locator): { tier, score, alternatives }`
- Alternatives generated by re-running the selector priority chain and returning all candidates, not just the top one
- Score calculated at scan time and stored with each element
- Clicking the bar opens an inline dropdown within the row — no modal

**UI changes:**
- Score bar (40px wide, 4px tall) on the right of each element row
- "Strong / Fair / Weak" label beside the bar in muted text
- Weak and Fair bars show a `›` caret indicating they are clickable
- Inline suggestion panel shows alternatives as selectable radio options with their locator strings

**Testing requirements:**
- Verify scoring correctly classifies all selector types
- Verify alternatives are generated and ranked correctly
- Verify selecting an alternative updates the element's locator and the bar re-scores
- Verify strong locators show no caret and are not clickable

---

## v1.3 — New Audiences

### 6. C# Language Support

**Frameworks:** Playwright and Selenium (not Cypress — Cypress has no C# API)

**Playwright C# template** (`playwright-csharp.js`):
```csharp
using Microsoft.Playwright;

public class LoginPage
{
    private readonly IPage _page;
    public LoginPage(IPage page) => _page = page;

    public ILocator EmailInput => _page.GetByLabel("Email");
    public ILocator SignInButton => _page.GetByRole(AriaRole.Button, new() { Name = "Sign In" });
}
```

**Selenium C# template** (`selenium-csharp.js`):
```csharp
using OpenQA.Selenium;

public class LoginPage
{
    private readonly IWebDriver _driver;
    public LoginPage(IWebDriver driver) => _driver = driver;

    public IWebElement EmailInput => _driver.FindElement(By.CssSelector("[aria-label='Email']"));
    public IWebElement SignInButton => _driver.FindElement(By.CssSelector("[role='button']"));
}
```

**UI changes:** C# added as a language button in the segmented selector. Language selector disables C# automatically when Cypress is selected.

**Testing requirements:**
- Verify C# output is syntactically valid for both frameworks
- Verify C# button is disabled when Cypress is selected
- Verify all locator types render correctly in C# syntax

---

### 7. WebdriverIO Support

**Export style toggle** (shown when WebdriverIO is selected):
- **POM Style** — class with `$()` selectors and async methods
- **Native Style** — flat page object following official WDIO docs convention

**POM style example:**
```javascript
class LoginPage {
  get emailInput() { return $('[aria-label="Email"]'); }
  get signInButton() { return $('[data-testid="sign-in"]'); }

  async signIn(email, password) {
    await this.emailInput.setValue(email);
    await this.signInButton.click();
  }
}
module.exports = new LoginPage();
```

**Native style example:**
```javascript
import Page from './page.js';

class LoginPage extends Page {
  get emailInput() { return $('[aria-label="Email"]'); }
  get signInButton() { return $('[data-testid="sign-in"]'); }
}
export default new LoginPage();
```

**UI changes:** Style toggle appears below the framework selector when WebdriverIO is active.

**Testing requirements:**
- Verify both POM and native style exports are syntactically valid JavaScript
- Verify style toggle persists when switching pages within the same session
- Verify all locator types render correctly in WDIO `$()` syntax

---

### 8. Robot Framework Support

**Export style toggle:**
- **Resource File (native)** — `.robot` resource file with Browser library keywords
- **Python Library** — Python class used as a Robot Framework library

**Resource file example:**
```robot
*** Settings ***
Library    Browser

*** Variables ***
${EMAIL_INPUT}      [aria-label="Email"]
${SIGN_IN_BUTTON}   [data-testid="sign-in"]

*** Keywords ***
Fill Email
    [Arguments]    ${email}
    Fill Text    ${EMAIL_INPUT}    ${email}

Click Sign In
    Click    ${SIGN_IN_BUTTON}
```

**UI changes:** Style toggle appears below framework selector when Robot Framework is active. File extension in the downloaded file changes to `.robot` for resource file style, `.py` for Python library style.

---

### 9. GUIDE.md + Help Link

**GUIDE.md sections:**
1. Quick Start (install + first scan in 60 seconds)
2. Accumulative Scanning
3. Frameworks & Languages (one section per framework including C#, WDIO, Robot)
4. Element Picker & Selection Control
5. Rename & Exclude Elements
6. iframe Scanning
7. Locator Quality Score
8. Shadow DOM & Salesforce
9. AI Self-Healing
10. Custom Frameworks (.pomrc.json)

**Help link:** A `?` icon added to the popup header (right side, beside the settings gear). Clicking it opens `https://github.com/vterziski/pom-mapper/blob/main/GUIDE.md` in a new tab using `chrome.tabs.create`.

---

## v1.4 — Power Features

### 10. Export History & Versioning

**Storage:** `chrome.storage.local` — up to 20 snapshots, oldest removed when limit is reached.

**Snapshot schema:**
```json
{
  "id": "uuid",
  "timestamp": 1706000000,
  "url": "https://example.com/login",
  "pageTitle": "Login Page",
  "framework": "playwright",
  "language": "ts",
  "className": "LoginPage",
  "elements": [
    { "name": "emailInput", "locator": "[aria-label='Email']", "type": "input", "score": "strong" }
  ]
}
```

**UI changes:**
- Clock icon added to the popup header
- History panel lists snapshots grouped by page URL, showing timestamp, framework, language, element count
- Clicking a snapshot restores it into the results view
- "Download Snapshot" button exports full history as `.pom-history.json`
- "Import Snapshot" button in History panel loads a previously exported file

**Testing requirements:**
- Verify snapshots are saved on every export
- Verify 20-snapshot limit evicts oldest correctly
- Verify restoring a snapshot populates the results view accurately
- Verify download produces valid JSON
- Verify import correctly loads and restores a snapshot

---

### 11. Clipboard Copy

**What it does:** A **Copy** button sits alongside the Export button. One click copies the full generated POM content to the clipboard. Button text changes to "Copied!" for 1.5 seconds then reverts.

**Architecture:**
- Uses `navigator.clipboard.writeText()` — available in extension popup context
- Same code path as export — generates the file content then writes to clipboard instead of triggering a download

**Testing requirements:**
- Verify clipboard content matches what would be exported to file
- Verify "Copied!" confirmation appears and reverts correctly
- Verify works across all framework/language combinations

---

## Cross-cutting Concerns

### Quality & Testing
Every feature ships with:
- Unit tests covering the new module logic (quality scorer, snapshot storage, iframe detection)
- Manual test checklist covering Chrome and Firefox
- Verification on at least: a standard login page, a Salesforce page, a page with iframes, a SPA with dynamic content

### No Breaking Changes
All new UI elements are additive. Existing scan → export flow remains unchanged for users who do not interact with new features.

### Version Bumps
- v1.2 — after all five Control & Quality features pass testing
- v1.3 — after all four New Audience features pass testing  
- v1.4 — after all three Power Features pass testing

Each version bump triggers a store submission to both Chrome Web Store and Firefox Add-ons.
