const { toLocatorString } = require('../locators');

const GROUPS = ['inputs','buttons','links','selects','textareas'];
const LABELS = { inputs:'Inputs', buttons:'Buttons', links:'Links', selects:'Selects', textareas:'Textareas' };

function generate(elements, className) {
  const lines = [
    'from playwright.sync_api import Page',
    '',
    `class ${className}:`,
    '    def __init__(self, page: Page):',
    '        self.page = page',
  ];
  for (const group of GROUPS.filter(g => elements[g].length > 0)) {
    lines.push('', `    # ${LABELS[group]}`);
    for (const el of elements[group]) {
      if (el.isListItem) {
        const loc = toLocatorString(el.locatorData, 'playwright', 'python').replace(/^page\./, 'self.page.');
        lines.push(`    def ${el.name}(self, n):`, `        return ${loc}`);
      } else {
        const loc = toLocatorString(el.locatorData, 'playwright', 'python').replace(/^page\./, 'self.page.');
        lines.push(`    def ${el.name}(self):`, `        return ${loc}`);
      }
    }
  }
  return lines.join('\n');
}

module.exports = { generate };
