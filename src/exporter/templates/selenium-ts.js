const { toLocatorString } = require('../locators');

const GROUPS = ['inputs','buttons','links','selects','textareas'];
const LABELS = { inputs:'Inputs', buttons:'Buttons', links:'Links', selects:'Selects', textareas:'Textareas' };

function generate(elements, className) {
  const lines = [
    "import { WebDriver, By } from 'selenium-webdriver';",
    '',
    `export class ${className} {`,
    '  constructor(private driver: WebDriver) {}',
  ];
  for (const group of GROUPS.filter(g => elements[g].length > 0)) {
    lines.push('', `  // ${LABELS[group]}`);
    for (const el of elements[group]) {
      const loc = toLocatorString(el.locatorData, 'selenium', 'ts').replace(/^driver\./, 'this.driver.');
      lines.push(`  ${el.name} = () => ${loc};`);
    }
  }
  lines.push('}');
  return lines.join('\n');
}

module.exports = { generate };
