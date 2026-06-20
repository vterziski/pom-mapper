function toLocatorString(locatorData, framework, language) {
  const { strategy, value, role } = locatorData;
  const q = (s) => (language === 'python' || language === 'java') ? `"${s}"` : `'${s}'`;

  if (framework === 'playwright') {
    if (language === 'python') {
      if (strategy === 'testid') return `page.get_by_test_id(${q(value)})`;
      if (strategy === 'label')  return `page.get_by_label(${q(value)})`;
      if (strategy === 'id')     return `page.locator(${q('#' + value)})`;
      if (strategy === 'name')   return `page.locator(${q('[name="' + value + '"]')})`;
      if (strategy === 'role')   return `page.get_by_role(${q(role)}, name=${q(value)})`;
    }
    // TypeScript, JavaScript, Java (same API, quote style differs)
    if (strategy === 'testid') return `page.getByTestId(${q(value)})`;
    if (strategy === 'label')  return `page.getByLabel(${q(value)})`;
    if (strategy === 'id')     return `page.locator(${q('#' + value)})`;
    if (strategy === 'name')   return `page.locator(${q('[name="' + value + '"]')})`;
    if (strategy === 'role')   return `page.getByRole(${q(role)}, { name: ${q(value)} })`;
  }

  if (framework === 'selenium') {
    if (language === 'python') {
      if (strategy === 'id')   return `driver.find_element(By.ID, ${q(value)})`;
      if (strategy === 'name') return `driver.find_element(By.NAME, ${q(value)})`;
      const css = strategy === 'testid' ? `[data-testid="${value}"]`
                : strategy === 'label'  ? `[aria-label="${value}"]`
                : strategy === 'role'   ? `[role="${role}"]` : '';
      return `driver.find_element(By.CSS_SELECTOR, '${css}')`;
    }
    if (language === 'java') {
      // Java uses @FindBy annotations — return raw CSS string, template wraps it
      if (strategy === 'id')     return `#${value}`;
      if (strategy === 'name')   return `[name="${value}"]`;
      if (strategy === 'testid') return `[data-testid="${value}"]`;
      if (strategy === 'label')  return `[aria-label="${value}"]`;
      if (strategy === 'role')   return `[role="${role}"]`;
    }
    // TypeScript / JavaScript
    if (strategy === 'id')   return `driver.findElement(By.id(${q(value)}))`;
    if (strategy === 'name') return `driver.findElement(By.name(${q(value)}))`;
    const css = strategy === 'testid' ? `[data-testid="${value}"]`
              : strategy === 'label'  ? `[aria-label="${value}"]`
              : strategy === 'role'   ? `[role="${role}"]` : '';
    return `driver.findElement(By.css(${q(css)}))`;
  }

  if (framework === 'cypress') {
    if (strategy === 'id')     return `cy.get(${q('#' + value)})`;
    if (strategy === 'name')   return `cy.get(${q('[name="' + value + '"]')})`;
    if (strategy === 'testid') return `cy.get(${q('[data-testid="' + value + '"]')})`;
    if (strategy === 'label')  return `cy.get(${q('[aria-label="' + value + '"]')})`;
    if (strategy === 'role')   return `cy.get(${q('[role="' + role + '"]')})`;
  }

  return '';
}

module.exports = { toLocatorString };
