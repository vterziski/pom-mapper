// All logic inlined — Chrome extensions cannot use require().
// Core logic mirrors src/naming.js, src/selector.js, src/scanner.js.

const TYPE_SUFFIXES = { input:'Input', button:'Button', link:'Link', select:'Select', textarea:'Textarea' };
const ROLE_MAP = { button:'button', link:'link', select:'combobox', input:'textbox', textarea:'textbox' };
const QUERIES = [
  { selector: 'input:not([type="hidden"])', type: 'input',    group: 'inputs' },
  { selector: 'button, [role="button"]',    type: 'button',   group: 'buttons' },
  { selector: 'a[href]',                    type: 'link',     group: 'links' },
  { selector: 'select',                     type: 'select',   group: 'selects' },
  { selector: 'textarea',                   type: 'textarea', group: 'textareas' },
];

function toCamelCase(str) {
  return str.replace(/[^a-zA-Z0-9\s]/g, ' ').trim()
    .split(/[\s_-]+/).filter(Boolean)
    .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

function toSnakeCase(str) {
  return str.replace(/[^a-zA-Z0-9\s]/g, ' ').trim()
    .split(/[\s_-]+/).filter(Boolean).map(w => w.toLowerCase()).join('_');
}

function toElementName(rawName, type, seen, language) {
  const suffix = TYPE_SUFFIXES[type] || '';
  const isPython = language === 'python';
  const base = isPython
    ? toSnakeCase(rawName) + (suffix ? '_' + suffix.toLowerCase() : '')
    : toCamelCase(rawName) + suffix;
  if (!seen[base]) { seen[base] = 1; return base; }
  seen[base] += 1;
  return isPython ? base + '_' + seen[base] : base + seen[base];
}

function getLocatorData(el, type) {
  const testId = el.getAttribute('data-testid');
  if (testId) return { strategy: 'testid', value: testId, rawName: testId };
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) return { strategy: 'label', value: ariaLabel, rawName: ariaLabel };
  const id = el.getAttribute('id');
  if (id) return { strategy: 'id', value: id, rawName: id };
  const name = el.getAttribute('name');
  if (name) return { strategy: 'name', value: name, rawName: name };
  const text = el.textContent.trim();
  if (text) return { strategy: 'role', role: ROLE_MAP[type] || type, value: text, rawName: text };
  return null;
}

const LIST_CONTEXTS = [
  { test: (el) => !!el.closest('tr') && !!el.closest('tbody'), container: 'tbody tr', prefix: 'row' },
  { test: (el) => !!el.closest('tr'),                           container: 'tr',       prefix: 'row' },
  { test: (el) => !!el.closest('[role="row"]'),                 container: '[role="row"]', prefix: 'row' },
  { test: (el) => !!el.closest('ul') && !!el.closest('li'),    container: 'ul li',    prefix: 'item' },
  { test: (el) => !!el.closest('ol') && !!el.closest('li'),    container: 'ol li',    prefix: 'item' },
  { test: (el) => !!el.closest('li'),                          container: 'li',       prefix: 'item' },
  { test: (el) => !!el.closest('[role="listitem"]'),           container: '[role="listitem"]', prefix: 'item' },
];

function getListContext(el) {
  for (const ctx of LIST_CONTEXTS) {
    if (ctx.test(el)) return { container: ctx.container, prefix: ctx.prefix };
  }
  return null;
}

function scanPage(language) {
  const seen = {};
  const seenListLocators = new Set();
  const result = { inputs: [], buttons: [], links: [], selects: [], textareas: [] };
  for (const { selector, type, group } of QUERIES) {
    for (const el of Array.from(document.querySelectorAll(selector))) {
      const locatorData = getLocatorData(el, type);
      if (!locatorData) continue;

      const listContext = getListContext(el);
      if (listContext) {
        const dedupeKey = `${listContext.container}::${locatorData.value}`;
        if (seenListLocators.has(dedupeKey)) continue;
        seenListLocators.add(dedupeKey);
        const prefixedRaw = listContext.prefix + '-' + locatorData.rawName;
        const name = toElementName(prefixedRaw, type, seen, language);
        result[group].push({
          name,
          locatorData: { ...locatorData, container: listContext.container },
          type,
          isListItem: true,
        });
      } else {
        const name = toElementName(locatorData.rawName, type, seen, language);
        result[group].push({ name, locatorData, type });
      }
    }
  }
  return result;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'SCAN_PAGE') {
    sendResponse({ success: true, data: scanPage(message.language || 'ts') });
  }
  return true;
});
