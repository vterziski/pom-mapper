function toCssSelector(strategy, value, role) {
  if (strategy === 'testid') return `[data-testid="${value}"]`;
  if (strategy === 'label')  return `[aria-label="${value}"]`;
  if (strategy === 'role')   return `[role="${role}"]`;
  return '';
}

function toChildCss(strategy, value, role) {
  if (strategy === 'testid') return `[data-testid="${value}"]`;
  if (strategy === 'label')  return `[aria-label="${value}"]`;
  if (strategy === 'id')     return `#${value}`;
  if (strategy === 'name')   return `[name="${value}"]`;
  if (strategy === 'role')   return `[role="${role}"]`;
  return '';
}

function toLocatorString(locatorData, framework, language) {
  if (!locatorData || !locatorData.strategy || !locatorData.value) {
    throw new Error(`Invalid locatorData: ${JSON.stringify(locatorData)}`);
  }

  const { strategy, value, role, container } = locatorData;
  const q = (s) => (language === 'python' || language === 'java') ? `"${s}"` : `'${s}'`;

  if (container) {
    const childCss = toChildCss(strategy, value, role);

    if (framework === 'playwright') {
      if (language === 'python') {
        let inner;
        if (strategy === 'testid') inner = `get_by_test_id("${value}")`;
        else if (strategy === 'label') inner = `get_by_label("${value}")`;
        else if (strategy === 'role') inner = `get_by_role("${role}", name="${value}")`;
        else inner = `locator("${childCss}")`;
        return `page.locator("${container}").nth(n).${inner}`;
      }
      let inner;
      if (strategy === 'testid') inner = `getByTestId(${q(value)})`;
      else if (strategy === 'label') inner = `getByLabel(${q(value)})`;
      else if (strategy === 'role') inner = `getByRole(${q(role)}, { name: ${q(value)} })`;
      else inner = `locator(${q(childCss)})`;
      return `page.locator(${q(container)}).nth(n).${inner}`;
    }

    if (framework === 'selenium') {
      if (language === 'python') {
        return `driver.find_element(By.CSS_SELECTOR, f'${container}:nth-child({n+1}) ${childCss}')`;
      }
      if (language === 'java') {
        return `${container}:nth-child(" + (n + 1) + ") ${childCss}`;
      }
      return `driver.findElement(By.css(\`${container}:nth-child(\${n + 1}) ${childCss}\`))`;
    }

    if (framework === 'cypress') {
      return `cy.get(${q(container)}).eq(n).find(${q(childCss)})`;
    }
  }

  if (framework === 'playwright') {
    if (language === 'python') {
      if (strategy === 'testid') return `page.get_by_test_id(${q(value)})`;
      if (strategy === 'label')  return `page.get_by_label(${q(value)})`;
      if (strategy === 'id')     return `page.locator(${q('#' + value)})`;
      if (strategy === 'name')   return `page.locator(${q('[name="' + value + '"]')})`;
      if (strategy === 'role')   return `page.get_by_role(${q(role)}, name=${q(value)})`;
    }
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
      const css = toCssSelector(strategy, value, role);
      return `driver.find_element(By.CSS_SELECTOR, '${css}')`;
    }
    if (language === 'java') {
      if (strategy === 'id')     return `#${value}`;
      if (strategy === 'name')   return `[name="${value}"]`;
      if (strategy === 'testid') return `[data-testid="${value}"]`;
      if (strategy === 'label')  return `[aria-label="${value}"]`;
      if (strategy === 'role')   return `[role="${role}"]`;
    }
    if (strategy === 'id')   return `driver.findElement(By.id(${q(value)}))`;
    if (strategy === 'name') return `driver.findElement(By.name(${q(value)}))`;
    const css = toCssSelector(strategy, value, role);
    return `driver.findElement(By.css(${q(css)}))`;
  }

  if (framework === 'cypress') {
    if (strategy === 'id')     return `cy.get(${q('#' + value)})`;
    if (strategy === 'name')   return `cy.get(${q('[name="' + value + '"]')})`;
    if (strategy === 'testid') return `cy.get(${q('[data-testid="' + value + '"]')})`;
    if (strategy === 'label')  return `cy.get(${q('[aria-label="' + value + '"]')})`;
    if (strategy === 'role')   return `cy.get(${q('[role="' + role + '"]')})`;
  }

  throw new Error(`Unsupported combination: framework="${framework}", language="${language}", strategy="${strategy}"`);
}

module.exports = { toLocatorString };
