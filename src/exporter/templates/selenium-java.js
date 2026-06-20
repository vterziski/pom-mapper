const { toLocatorString, getShadowParts } = require('../locators');

const GROUPS = ['inputs','buttons','links','selects','textareas'];
const LABELS = { inputs:'Inputs', buttons:'Buttons', links:'Links', selects:'Selects', textareas:'Textareas' };

function generate(elements, className) {
  const hasShadow = GROUPS.some(g => elements[g].some(el => el.isShadowElement));
  const lines = [
    'import org.openqa.selenium.By;',
    'import org.openqa.selenium.WebDriver;',
    'import org.openqa.selenium.WebElement;',
    ...(hasShadow ? ['import org.openqa.selenium.SearchContext;'] : []),
    'import org.openqa.selenium.support.FindBy;',
    'import org.openqa.selenium.support.PageFactory;',
    '',
    `public class ${className} {`,
    '  private WebDriver driver;',
  ];
  for (const group of GROUPS.filter(g => elements[g].length > 0)) {
    lines.push('', `  // ${LABELS[group]}`);
    for (const el of elements[group]) {
      if (el.isListItem) {
        const cssTemplate = toLocatorString(el.locatorData, 'selenium', 'java');
        lines.push(`  public WebElement ${el.name}(int n) {`);
        lines.push(`    return driver.findElement(By.cssSelector("${cssTemplate}"));`);
        lines.push(`  }`);
      } else if (el.isShadowElement) {
        const { host, innerCss } = getShadowParts(el.locatorData);
        lines.push(`  public WebElement ${el.name}() {`);
        lines.push(`    SearchContext shadowRoot = driver.findElement(By.cssSelector("${host}")).getShadowRoot();`);
        lines.push(`    return shadowRoot.findElement(By.cssSelector("${innerCss}"));`);
        lines.push(`  }`);
      } else {
        const css = toLocatorString(el.locatorData, 'selenium', 'java');
        lines.push(`  @FindBy(css = "${css}")`, `  private WebElement ${el.name};`);
      }
    }
  }
  lines.push(
    '',
    `  public ${className}(WebDriver driver) {`,
    '    this.driver = driver;',
    '    PageFactory.initElements(driver, this);',
    '  }',
    '}'
  );
  return lines.join('\n');
}

module.exports = { generate };
