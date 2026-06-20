// ---- Inlined locator string generator (mirrors src/exporter/locators.js) ----
function toLocatorString(locatorData, framework, language) {
  const { strategy, value, role } = locatorData;
  const q = (s) => (language === 'python' || language === 'java') ? `"${s}"` : `'${s}'`;

  if (framework === 'playwright') {
    if (language === 'python') {
      if (strategy === 'testid') return `page.get_by_test_id(${q(value)})`;
      if (strategy === 'label')  return `page.get_by_label(${q(value)})`;
      if (strategy === 'title')  return `page.get_by_title(${q(value)})`;
      if (strategy === 'id')     return `page.locator(${q('#' + value)})`;
      if (strategy === 'name')   return `page.locator(${q('[name="' + value + '"]')})`;
      if (strategy === 'role')   return `page.get_by_role(${q(role)}, name=${q(value)})`;
    }
    if (strategy === 'testid') return `page.getByTestId(${q(value)})`;
    if (strategy === 'label')  return `page.getByLabel(${q(value)})`;
    if (strategy === 'title')  return `page.getByTitle(${q(value)})`;
    if (strategy === 'id')     return `page.locator(${q('#' + value)})`;
    if (strategy === 'name')   return `page.locator(${q('[name="' + value + '"]')})`;
    if (strategy === 'role')   return `page.getByRole(${q(role)}, { name: ${q(value)} })`;
  }
  if (framework === 'selenium') {
    if (language === 'python') {
      if (strategy === 'id')    return `driver.find_element(By.ID, ${q(value)})`;
      if (strategy === 'name')  return `driver.find_element(By.NAME, ${q(value)})`;
      if (strategy === 'title') return `driver.find_element(By.CSS_SELECTOR, '[title="${value}"]')`;
      const css = strategy === 'testid' ? `[data-testid="${value}"]` : strategy === 'label' ? `[aria-label="${value}"]` : `[role="${role}"]`;
      return `driver.find_element(By.CSS_SELECTOR, '${css}')`;
    }
    if (language === 'java') {
      if (strategy === 'id')     return `#${value}`;
      if (strategy === 'name')   return `[name="${value}"]`;
      if (strategy === 'title')  return `[title="${value}"]`;
      if (strategy === 'testid') return `[data-testid="${value}"]`;
      if (strategy === 'label')  return `[aria-label="${value}"]`;
      return `[role="${role}"]`;
    }
    if (strategy === 'id')    return `driver.findElement(By.id(${q(value)}))`;
    if (strategy === 'name')  return `driver.findElement(By.name(${q(value)}))`;
    if (strategy === 'title') return `driver.findElement(By.css(${q('[title="' + value + '"]')}))`;
    const css = strategy === 'testid' ? `[data-testid="${value}"]` : strategy === 'label' ? `[aria-label="${value}"]` : `[role="${role}"]`;
    return `driver.findElement(By.css(${q(css)}))`;
  }
  if (framework === 'cypress') {
    if (strategy === 'id')     return `cy.get(${q('#' + value)})`;
    if (strategy === 'name')   return `cy.get(${q('[name="' + value + '"]')})`;
    if (strategy === 'title')  return `cy.get(${q('[title="' + value + '"]')})`;
    if (strategy === 'testid') return `cy.get(${q('[data-testid="' + value + '"]')})`;
    if (strategy === 'label')  return `cy.get(${q('[aria-label="' + value + '"]')})`;
    return `cy.get(${q('[role="' + role + '"]')})`;
  }
  return '';
}

// ---- Inlined file generator (mirrors src/exporter templates) ----
const GROUP_LABELS = { inputs:'Inputs', buttons:'Buttons', links:'Links', selects:'Selects', textareas:'Textareas' };
const GROUPS = ['inputs','buttons','links','selects','textareas'];

function generateFile(elements, className, framework, language) {
  const activeGroups = GROUPS.filter(g => elements[g].length > 0);

  function locLine(el) { return toLocatorString(el.locatorData, framework, language); }

  if (framework === 'playwright' && language === 'ts') {
    const lines = ["import { Page } from '@playwright/test';", '', `export class ${className} {`, '  constructor(private page: Page) {}'];
    for (const g of activeGroups) { lines.push('', `  // ${GROUP_LABELS[g]}`); for (const el of elements[g]) lines.push(`  ${el.name} = () => ${locLine(el).replace(/^page\./, 'this.page.')};`); }
    lines.push('}'); return lines.join('\n');
  }
  if (framework === 'playwright' && language === 'js') {
    const lines = [`class ${className} {`, '  constructor(page) { this.page = page; }'];
    for (const g of activeGroups) { lines.push('', `  // ${GROUP_LABELS[g]}`); for (const el of elements[g]) lines.push(`  ${el.name}() { return ${locLine(el).replace(/^page\./, 'this.page.')}; }`); }
    lines.push('}', '', `module.exports = { ${className} };`); return lines.join('\n');
  }
  if (framework === 'playwright' && language === 'java') {
    const lines = ['import com.microsoft.playwright.*;', '', `public class ${className} {`, '  private final Page page;', '', `  public ${className}(Page page) { this.page = page; }`];
    for (const g of activeGroups) { lines.push('', `  // ${GROUP_LABELS[g]}`); for (const el of elements[g]) lines.push(`  public Locator ${el.name}() { return ${locLine(el).replace(/^page\./, 'this.page.')}; }`); }
    lines.push('}'); return lines.join('\n');
  }
  if (framework === 'playwright' && language === 'python') {
    const lines = ['from playwright.sync_api import Page', '', `class ${className}:`, '    def __init__(self, page: Page):', '        self.page = page'];
    for (const g of activeGroups) { lines.push('', `    # ${GROUP_LABELS[g]}`); for (const el of elements[g]) { lines.push(`    def ${el.name}(self):`); lines.push(`        return ${locLine(el).replace(/^page\./, 'self.page.')}`); } }
    return lines.join('\n');
  }
  if (framework === 'selenium' && language === 'ts') {
    const lines = ["import { WebDriver, By } from 'selenium-webdriver';", '', `export class ${className} {`, '  constructor(private driver: WebDriver) {}'];
    for (const g of activeGroups) { lines.push('', `  // ${GROUP_LABELS[g]}`); for (const el of elements[g]) lines.push(`  ${el.name} = () => ${locLine(el).replace(/^driver\./, 'this.driver.')};`); }
    lines.push('}'); return lines.join('\n');
  }
  if (framework === 'selenium' && language === 'js') {
    const lines = ["const { By } = require('selenium-webdriver');", '', `class ${className} {`, '  constructor(driver) { this.driver = driver; }'];
    for (const g of activeGroups) { lines.push('', `  // ${GROUP_LABELS[g]}`); for (const el of elements[g]) lines.push(`  ${el.name}() { return ${locLine(el).replace(/^driver\./, 'this.driver.')}; }`); }
    lines.push('}', '', `module.exports = { ${className} };`); return lines.join('\n');
  }
  if (framework === 'selenium' && language === 'java') {
    const lines = ['import org.openqa.selenium.WebDriver;', 'import org.openqa.selenium.WebElement;', 'import org.openqa.selenium.support.FindBy;', 'import org.openqa.selenium.support.PageFactory;', '', `public class ${className} {`, '  private WebDriver driver;'];
    for (const g of activeGroups) { lines.push('', `  // ${GROUP_LABELS[g]}`); for (const el of elements[g]) { lines.push(`  @FindBy(css = "${locLine(el)}")`); lines.push(`  private WebElement ${el.name};`); } }
    lines.push('', `  public ${className}(WebDriver driver) {`, '    this.driver = driver;', '    PageFactory.initElements(driver, this);', '  }', '}'); return lines.join('\n');
  }
  if (framework === 'selenium' && language === 'python') {
    const lines = ['from selenium.webdriver.common.by import By', '', `class ${className}:`, '    def __init__(self, driver):', '        self.driver = driver'];
    for (const g of activeGroups) { lines.push('', `    # ${GROUP_LABELS[g]}`); for (const el of elements[g]) { lines.push(`    def ${el.name}(self):`); lines.push(`        return ${locLine(el).replace(/^driver\./, 'self.driver.')}`); } }
    return lines.join('\n');
  }
  if (framework === 'cypress') {
    const isTs = language === 'ts';
    const lines = isTs ? [`export class ${className} {`] : [`class ${className} {`];
    for (const g of activeGroups) { lines.push('', `  // ${GROUP_LABELS[g]}`); for (const el of elements[g]) lines.push(isTs ? `  ${el.name} = () => ${locLine(el)};` : `  ${el.name}() { return ${locLine(el)}; }`); }
    if (!isTs) lines.push('}', '', `module.exports = { ${className} };`); else lines.push('}');
    return lines.join('\n');
  }
  return '';
}

function getFilename(className, language) {
  if (language === 'python') return className.replace(/([A-Z])/g, (m, l, i) => (i === 0 ? l.toLowerCase() : '_' + l.toLowerCase())) + '.py';
  return className + ({ ts: '.ts', js: '.js', java: '.java' }[language] || '.ts');
}

// ---- State ----
let accumulated = { inputs: [], buttons: [], links: [], selects: [], textareas: [] };
let scanCount = 0;
let selectedFramework = 'playwright';
let selectedLanguage = 'ts';
let previousTab = null;
let deepScan = false;

// ---- DOM refs ----
const $ = (id) => document.getElementById(id);
const states = { ready: $('state-ready'), results: $('state-results'), empty: $('state-empty'), settings: $('state-settings') };

function showState(name) {
  Object.values(states).forEach(s => s.classList.add('hidden'));
  states[name].classList.remove('hidden');
}

// ---- Supported languages per framework ----
const FRAMEWORK_LANGUAGES = {
  playwright: ['ts', 'js', 'java', 'python'],
  selenium:   ['ts', 'js', 'java', 'python'],
  cypress:    ['ts', 'js'],
};

function applyLanguageOptions(framework) {
  const supported = FRAMEWORK_LANGUAGES[framework] || ['ts', 'js'];
  const langBtns = document.querySelectorAll('#language-selector .seg-btn');
  langBtns.forEach(b => {
    b.style.display = supported.includes(b.dataset.value) ? '' : 'none';
  });
  if (!supported.includes(selectedLanguage)) {
    selectedLanguage = supported[0];
    langBtns.forEach(b => b.classList.remove('active'));
    document.querySelector(`#language-selector .seg-btn[data-value="${selectedLanguage}"]`).classList.add('active');
  }
}

// ---- Framework / Language selectors ----
document.querySelectorAll('#framework-selector .seg-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#framework-selector .seg-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedFramework = btn.dataset.value;
    applyLanguageOptions(selectedFramework);
  });
});

document.querySelectorAll('#language-selector .seg-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#language-selector .seg-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedLanguage = btn.dataset.value;
  });
});

// ---- Storage helpers ----
function getStorageData(keys) {
  return new Promise(resolve => chrome.storage.local.get(keys, resolve));
}

function setStorageData(data) {
  return new Promise(resolve => chrome.storage.local.set(data, resolve));
}

// ---- Merge ----
function mergeElements(existing, incoming) {
  const merged = { ...existing };
  for (const g of GROUPS) {
    const existingLocators = new Set(existing[g].map(e => e.locatorData.value));
    merged[g] = [...existing[g], ...(incoming[g] || []).filter(e => !existingLocators.has(e.locatorData.value))];
  }
  return merged;
}

function totalCount(elements) {
  return GROUPS.reduce((sum, g) => sum + elements[g].length, 0);
}

// ---- Render results ----
function renderResults() {
  const groups = GROUPS.filter(g => accumulated[g].length > 0);
  const list = $('elements-list');
  list.innerHTML = '';
  for (const group of groups) {
    const hdr = document.createElement('div');
    hdr.className = 'group-header';
    hdr.textContent = GROUP_LABELS[group];
    list.appendChild(hdr);
    for (const el of accumulated[group]) {
      const row = document.createElement('div');
      row.className = 'element-row';
      const preview = toLocatorString(el.locatorData, selectedFramework, selectedLanguage);
      row.innerHTML = `<span class="element-name">${el.name}</span><span class="element-locator">${preview}</span>`;
      list.appendChild(row);
    }
  }
  const count = totalCount(accumulated);
  $('scan-badge').textContent = `Scanned ${scanCount} time${scanCount > 1 ? 's' : ''} · ${count} element${count !== 1 ? 's' : ''}`;
  $('export-label').textContent = `Exporting as: ${selectedFramework.charAt(0).toUpperCase() + selectedFramework.slice(1)} · ${selectedLanguage.toUpperCase()}`;
}

// ---- Scan ----
function runScan() {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content/content.js'] }, () => {
      chrome.tabs.sendMessage(tab.id, { action: 'SCAN_PAGE', language: selectedLanguage, deepScan }, (response) => {
        if (!response || !response.success) return;
        scanCount += 1;
        accumulated = mergeElements(accumulated, response.data);
        if (totalCount(accumulated) === 0) { showState('empty'); return; }
        renderResults();
        showState('results');
      });
    });
  });
}

// ---- Deep scan toggle ----
$('deep-scan-toggle').addEventListener('change', (e) => {
  deepScan = e.target.checked;
});

// ---- Export ----
$('btn-export').addEventListener('click', () => {
  const className = $('class-name').value.trim() || 'PageObject';
  const content = generateFile(accumulated, className, selectedFramework, selectedLanguage);
  const filename = getFilename(className, selectedLanguage);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
});

// ---- AI Healing ----
$('btn-heal').addEventListener('click', async () => {
  const { apiKey: storedKey, aiProvider: storedProvider } = await getStorageData(['apiKey', 'aiProvider']);
  if (!storedKey) { alert('Add your API key in Settings first.'); return; }

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content/content.js'] }, () => {
      chrome.tabs.sendMessage(tab.id, { action: 'SCAN_PAGE', language: selectedLanguage }, async (response) => {
        if (!response || !response.success) return;
        const newScan = response.data;
        const newLocators = new Set(GROUPS.flatMap(g => newScan[g].map(e => e.locatorData.value)));
        const missing = GROUPS.flatMap(g => accumulated[g].filter(e => !newLocators.has(e.locatorData.value)));

        if (missing.length === 0) { alert('No broken locators found — all elements still present.'); return; }

        for (const el of missing) {
          const prompt = `You are a test automation expert. An element locator is broken after a UI change.
Old locator: strategy="${el.locatorData.strategy}", value="${el.locatorData.value}", name="${el.name}", type="${el.type}"
Find the best new locator. Prefer data-testid > aria-label > id > name > role+text.
Respond ONLY with JSON: {"strategy":"<strategy>","value":"<value>"} or with "role" key if role strategy.`;

          try {
            const isAnthropic = storedProvider === 'anthropic';
            const url = isAnthropic ? 'https://api.anthropic.com/v1/messages' : 'https://api.openai.com/v1/chat/completions';
            const headers = { 'Content-Type': 'application/json', ...(isAnthropic ? { 'x-api-key': storedKey, 'anthropic-version': '2023-06-01' } : { Authorization: `Bearer ${storedKey}` }) };
            const body = isAnthropic
              ? JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 256, messages: [{ role: 'user', content: prompt }] })
              : JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] });
            const res = await fetch(url, { method: 'POST', headers, body });
            const data = await res.json();
            const text = isAnthropic ? data.content[0].text : data.choices[0].message.content;
            const suggestion = JSON.parse(text.trim());
            const confirmed = confirm(`Heal "${el.name}"?\n\nOld: ${el.locatorData.strategy}="${el.locatorData.value}"\nNew: ${suggestion.strategy}="${suggestion.value}"\n\nApply?`);
            if (confirmed) el.locatorData = suggestion;
          } catch (e) {
            alert(`Could not heal "${el.name}": ${e.message}`);
          }
        }
        renderResults();
      });
    });
  });
});

// ---- Feedback ----
function openFeedback() {
  chrome.tabs.create({ url: 'https://github.com/vterziski/pom-mapper/issues/new' });
}
$('btn-feedback').addEventListener('click', (e) => { e.preventDefault(); openFeedback(); });
$('btn-feedback-settings').addEventListener('click', (e) => { e.preventDefault(); openFeedback(); });

// ---- Settings ----
function openSettings() {
  previousTab = document.querySelector('[id^="state-"]:not(.hidden)')?.id?.replace('state-', '') || 'ready';
  getStorageData(['apiKey', 'aiProvider']).then(({ apiKey: key, aiProvider: provider }) => {
    if (key) $('api-key').value = key;
    if (provider) $('provider-select').value = provider;
    showState('settings');
  });
}

$('btn-settings').addEventListener('click', openSettings);
$('btn-settings-results').addEventListener('click', openSettings);
$('btn-settings-back').addEventListener('click', () => showState(previousTab || 'ready'));

$('btn-save-settings').addEventListener('click', async () => {
  const key = $('api-key').value.trim();
  const provider = $('provider-select').value;
  await setStorageData({ apiKey: key, aiProvider: provider });

  const pomrcFile = $('pomrc-upload').files[0];
  if (pomrcFile) {
    const text = await pomrcFile.text();
    try { JSON.parse(text); await setStorageData({ pomrc: text }); }
    catch { alert('Invalid .pomrc.json file — must be valid JSON.'); return; }
  }
  showState(previousTab || 'ready');
});

// ---- Navigation ----
$('btn-map').addEventListener('click', runScan);
$('btn-rescan').addEventListener('click', runScan);
$('btn-retry').addEventListener('click', () => showState('ready'));

// ---- Init ----
chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
  $('page-url').textContent = tab.url;
  const title = (tab.title || 'Page').replace(/[^a-zA-Z0-9\s]/g, '').trim();
  $('class-name').value = title.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('') || 'PageObject';

  const { apiKey: key } = await getStorageData(['apiKey']);
  if (key) $('btn-heal').classList.remove('hidden');

  chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content/content.js'] }, () => {
    chrome.tabs.sendMessage(tab.id, { action: 'DETECT_SALESFORCE' }, (response) => {
      if (response && response.isSalesforce) {
        $('sf-badge').classList.remove('hidden');
        $('deep-scan-toggle').checked = true;
        deepScan = true;
      }
    });
  });
});
