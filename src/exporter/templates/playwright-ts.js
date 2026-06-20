const { toLocatorString } = require('../locators');

const GROUPS = ['inputs','buttons','links','selects','textareas'];
const LABELS = { inputs:'Inputs', buttons:'Buttons', links:'Links', selects:'Selects', textareas:'Textareas' };

function generate(elements, className) {
  const lines = [
    "import { Page } from '@playwright/test';",
    '',
    `export class ${className} {`,
    '  constructor(private page: Page) {}',
  ];
  for (const group of GROUPS.filter(g => elements[g].length > 0)) {
    lines.push('', `  // ${LABELS[group]}`);
    for (const el of elements[group]) {
      const loc = toLocatorString(el.locatorData, 'playwright', 'ts').replace(/^page\./, 'this.page.');
      lines.push(`  ${el.name} = () => ${loc};`);
    }
  }
  lines.push('}');
  return lines.join('\n');
}

module.exports = { generate };
