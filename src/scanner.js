const { getLocatorData } = require('./selector');
const { toElementName } = require('./naming');

const QUERIES = [
  { selector: 'input:not([type="hidden"])', type: 'input',    group: 'inputs' },
  { selector: 'button, [role="button"]',    type: 'button',   group: 'buttons' },
  { selector: 'a[href]',                    type: 'link',     group: 'links' },
  { selector: 'select',                     type: 'select',   group: 'selects' },
  { selector: 'textarea',                   type: 'textarea', group: 'textareas' },
];

function getListContext(el) {
  if (el.closest('tr')) {
    const hasTbody = !!el.closest('tbody');
    return { container: hasTbody ? 'tbody tr' : 'tr', prefix: 'row' };
  }
  if (el.closest('[role="row"]')) {
    return { container: '[role="row"]', prefix: 'row' };
  }
  if (el.closest('li')) {
    const ul = el.closest('ul');
    const ol = el.closest('ol');
    return { container: ul ? 'ul li' : ol ? 'ol li' : 'li', prefix: 'item' };
  }
  if (el.closest('[role="listitem"]')) {
    return { container: '[role="listitem"]', prefix: 'item' };
  }
  return null;
}

function scanPage(doc, language = 'ts') {
  const seen = {};
  const seenListLocators = new Set(); // key: container::locatorValue
  const result = { inputs: [], buttons: [], links: [], selects: [], textareas: [] };

  for (const { selector, type, group } of QUERIES) {
    for (const el of Array.from(doc.querySelectorAll(selector))) {
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

module.exports = { scanPage, getListContext };
