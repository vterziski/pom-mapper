const { toLocatorString } = require('../locators');

const GROUPS = ['inputs','buttons','links','selects','textareas'];
const LABELS = { inputs:'Inputs', buttons:'Buttons', links:'Links', selects:'Selects', textareas:'Textareas' };

function generate(elements, className) {
  const lines = [
    "const { By } = require('selenium-webdriver');",
    '',
    `class ${className} {`,
    '  constructor(driver) { this.driver = driver; }',
  ];
  for (const group of GROUPS.filter(g => elements[g].length > 0)) {
    lines.push('', `  // ${LABELS[group]}`);
    for (const el of elements[group]) {
      if (el.isListItem) {
        const loc = toLocatorString(el.locatorData, 'selenium', 'js').replace(/^driver\./, 'this.driver.');
        lines.push(`  ${el.name}(n) { return ${loc}; }`);
      } else {
        const loc = toLocatorString(el.locatorData, 'selenium', 'js').replace(/^driver\./, 'this.driver.');
        lines.push(`  ${el.name}() { return ${loc}; }`);
      }
    }
  }
  lines.push('}', '', `module.exports = { ${className} };`);
  return lines.join('\n');
}

module.exports = { generate };
