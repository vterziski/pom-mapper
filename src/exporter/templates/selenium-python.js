const { toLocatorString } = require('../locators');

const GROUPS = ['inputs','buttons','links','selects','textareas'];
const LABELS = { inputs:'Inputs', buttons:'Buttons', links:'Links', selects:'Selects', textareas:'Textareas' };

function generate(elements, className) {
  const lines = [
    'from selenium.webdriver.common.by import By',
    '',
    `class ${className}:`,
    '    def __init__(self, driver):',
    '        self.driver = driver',
  ];
  for (const group of GROUPS.filter(g => elements[g].length > 0)) {
    lines.push('', `    # ${LABELS[group]}`);
    for (const el of elements[group]) {
      if (el.isListItem) {
        const loc = toLocatorString(el.locatorData, 'selenium', 'python').replace(/^driver\./, 'self.driver.');
        lines.push(`    def ${el.name}(self, n):`, `        return ${loc}`);
      } else {
        const loc = toLocatorString(el.locatorData, 'selenium', 'python').replace(/^driver\./, 'self.driver.');
        lines.push(`    def ${el.name}(self):`, `        return ${loc}`);
      }
    }
  }
  return lines.join('\n');
}

module.exports = { generate };
