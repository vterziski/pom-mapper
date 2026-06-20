const { toLocatorString } = require('../locators');

const GROUPS = ['inputs','buttons','links','selects','textareas'];
const LABELS = { inputs:'Inputs', buttons:'Buttons', links:'Links', selects:'Selects', textareas:'Textareas' };

function generate(elements, className) {
  const lines = [`class ${className} {`];
  for (const group of GROUPS.filter(g => elements[g].length > 0)) {
    lines.push('', `  // ${LABELS[group]}`);
    for (const el of elements[group]) {
      if (el.isListItem) {
        const loc = toLocatorString(el.locatorData, 'cypress', 'js');
        lines.push(`  ${el.name}(n) { return ${loc}; }`);
      } else {
        const loc = toLocatorString(el.locatorData, 'cypress', 'js');
        lines.push(`  ${el.name}() { return ${loc}; }`);
      }
    }
  }
  lines.push('}', '', `module.exports = { ${className} };`);
  return lines.join('\n');
}

module.exports = { generate };
