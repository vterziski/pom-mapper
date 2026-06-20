const { toLocatorString, getShadowParts } = require('../locators');

const GROUPS = ['inputs','buttons','links','selects','textareas'];
const LABELS = { inputs:'Inputs', buttons:'Buttons', links:'Links', selects:'Selects', textareas:'Textareas' };

function generate(elements, className) {
  const lines = [`export class ${className} {`];
  for (const group of GROUPS.filter(g => elements[g].length > 0)) {
    lines.push('', `  // ${LABELS[group]}`);
    for (const el of elements[group]) {
      if (el.isListItem) {
        const loc = toLocatorString(el.locatorData, 'cypress', 'ts');
        lines.push(`  ${el.name} = (n: number) => ${loc};`);
      } else if (el.isShadowElement) {
        const { host, innerCss } = getShadowParts(el.locatorData);
        lines.push(`  ${el.name} = () => cy.get('${host}').shadow().find('${innerCss}');`);
      } else {
        const loc = toLocatorString(el.locatorData, 'cypress', 'ts');
        lines.push(`  ${el.name} = () => ${loc};`);
      }
    }
  }
  lines.push('}');
  return lines.join('\n');
}

module.exports = { generate };
