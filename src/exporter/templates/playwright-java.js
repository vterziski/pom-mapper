const { toLocatorString } = require('../locators');

const GROUPS = ['inputs','buttons','links','selects','textareas'];
const LABELS = { inputs:'Inputs', buttons:'Buttons', links:'Links', selects:'Selects', textareas:'Textareas' };

function generate(elements, className) {
  const lines = [
    'import com.microsoft.playwright.*;',
    '',
    `public class ${className} {`,
    '  private final Page page;',
    '',
    `  public ${className}(Page page) { this.page = page; }`,
  ];
  for (const group of GROUPS.filter(g => elements[g].length > 0)) {
    lines.push('', `  // ${LABELS[group]}`);
    for (const el of elements[group]) {
      const loc = toLocatorString(el.locatorData, 'playwright', 'java').replace(/^page\./, 'this.page.');
      lines.push(`  public Locator ${el.name}() { return ${loc}; }`);
    }
  }
  lines.push('}');
  return lines.join('\n');
}

module.exports = { generate };
