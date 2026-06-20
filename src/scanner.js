const { getLocatorData } = require('./selector');
const { toElementName } = require('./naming');

const QUERIES = [
  { selector: 'input:not([type="hidden"])', type: 'input', group: 'inputs' },
  { selector: 'button, [role="button"]', type: 'button', group: 'buttons' },
  { selector: 'a[href]', type: 'link', group: 'links' },
  { selector: 'select', type: 'select', group: 'selects' },
  { selector: 'textarea', type: 'textarea', group: 'textareas' },
];

function scanPage(doc, language = 'ts') {
  const seen = {};
  const result = { inputs: [], buttons: [], links: [], selects: [], textareas: [] };

  for (const { selector, type, group } of QUERIES) {
    for (const el of Array.from(doc.querySelectorAll(selector))) {
      const locatorData = getLocatorData(el, type);
      if (!locatorData) continue;
      const name = toElementName(locatorData.rawName, type, seen, language);
      result[group].push({ name, locatorData, type });
    }
  }

  return result;
}

module.exports = { scanPage };
