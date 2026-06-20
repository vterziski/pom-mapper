const { toLocatorString } = require('../locators');

const GROUPS = ['inputs','buttons','links','selects','textareas'];
const LABELS = { inputs:'Inputs', buttons:'Buttons', links:'Links', selects:'Selects', textareas:'Textareas' };

function generate(elements, className) {
  const lines = [
    'import org.openqa.selenium.WebDriver;',
    'import org.openqa.selenium.WebElement;',
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
