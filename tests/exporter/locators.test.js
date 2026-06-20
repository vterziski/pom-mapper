const { toLocatorString, getShadowParts } = require('../../src/exporter/locators');

const testidData  = { strategy: 'testid', value: 'login-btn' };
const labelData   = { strategy: 'label',  value: 'Email' };
const idData      = { strategy: 'id',     value: 'username' };
const nameData    = { strategy: 'name',   value: 'password' };
const roleData    = { strategy: 'role',   role: 'button', value: 'Sign In' };

describe('Playwright', () => {
  test('testid → getByTestId', () => {
    expect(toLocatorString(testidData, 'playwright', 'ts')).toBe("page.getByTestId('login-btn')");
  });
  test('label → getByLabel', () => {
    expect(toLocatorString(labelData, 'playwright', 'ts')).toBe("page.getByLabel('Email')");
  });
  test('id → locator #id', () => {
    expect(toLocatorString(idData, 'playwright', 'ts')).toBe("page.locator('#username')");
  });
  test('name → locator [name]', () => {
    expect(toLocatorString(nameData, 'playwright', 'ts')).toBe('page.locator(\'[name="password"]\')');
  });
  test('role → getByRole', () => {
    expect(toLocatorString(roleData, 'playwright', 'ts')).toBe("page.getByRole('button', { name: 'Sign In' })");
  });
  test('python: testid uses snake_case method', () => {
    expect(toLocatorString(testidData, 'playwright', 'python')).toBe('page.get_by_test_id("login-btn")');
  });
  test('python: label uses snake_case method', () => {
    expect(toLocatorString(labelData, 'playwright', 'python')).toBe('page.get_by_label("Email")');
  });
  test('python: role uses snake_case method', () => {
    expect(toLocatorString(roleData, 'playwright', 'python')).toBe('page.get_by_role("button", name="Sign In")');
  });
  test('java: testid uses double quotes', () => {
    expect(toLocatorString(testidData, 'playwright', 'java')).toBe('page.getByTestId("login-btn")');
  });
});

describe('Selenium', () => {
  test('testid → CSS selector (TS)', () => {
    expect(toLocatorString(testidData, 'selenium', 'ts')).toBe('driver.findElement(By.css(\'[data-testid="login-btn"]\'))');
  });
  test('label → CSS [aria-label] (TS)', () => {
    expect(toLocatorString(labelData, 'selenium', 'ts')).toBe('driver.findElement(By.css(\'[aria-label="Email"]\'))');
  });
  test('id → By.id (TS)', () => {
    expect(toLocatorString(idData, 'selenium', 'ts')).toBe("driver.findElement(By.id('username'))");
  });
  test('name → By.name (TS)', () => {
    expect(toLocatorString(nameData, 'selenium', 'ts')).toBe("driver.findElement(By.name('password'))");
  });
  test('python: CSS selector uses Python syntax', () => {
    expect(toLocatorString(testidData, 'selenium', 'python')).toBe('driver.find_element(By.CSS_SELECTOR, \'[data-testid="login-btn"]\')');
  });
  test('java: CSS selector returns raw CSS string for @FindBy', () => {
    expect(toLocatorString(testidData, 'selenium', 'java')).toBe('[data-testid="login-btn"]');
  });
});

describe('Cypress', () => {
  test('testid → cy.get [data-testid]', () => {
    expect(toLocatorString(testidData, 'cypress', 'ts')).toBe('cy.get(\'[data-testid="login-btn"]\')');
  });
  test('label → cy.get [aria-label]', () => {
    expect(toLocatorString(labelData, 'cypress', 'ts')).toBe('cy.get(\'[aria-label="Email"]\')');
  });
  test('id → cy.get #id', () => {
    expect(toLocatorString(idData, 'cypress', 'ts')).toBe("cy.get('#username')");
  });
  test('name → cy.get [name]', () => {
    expect(toLocatorString(nameData, 'cypress', 'ts')).toBe('cy.get(\'[name="password"]\')');
  });
});

describe('toLocatorString — list item (container present)', () => {
  const listLocator = { strategy: 'testid', value: 'delete-btn', container: 'tbody tr' };

  test('playwright ts: nth chain', () => {
    expect(toLocatorString(listLocator, 'playwright', 'ts'))
      .toBe("page.locator('tbody tr').nth(n).getByTestId('delete-btn')");
  });

  test('playwright python: nth chain snake_case', () => {
    expect(toLocatorString(listLocator, 'playwright', 'python'))
      .toBe('page.locator("tbody tr").nth(n).get_by_test_id("delete-btn")');
  });

  test('cypress ts: eq().find()', () => {
    expect(toLocatorString(listLocator, 'cypress', 'ts'))
      .toBe("cy.get('tbody tr').eq(n).find('[data-testid=\"delete-btn\"]')");
  });

  test('selenium ts: nth-child css template literal', () => {
    const result = toLocatorString(listLocator, 'selenium', 'ts');
    expect(result).toContain('tbody tr:nth-child');
    expect(result).toContain('[data-testid="delete-btn"]');
  });

  test('selenium python: f-string nth-child', () => {
    const result = toLocatorString(listLocator, 'selenium', 'python');
    expect(result).toContain('f\'tbody tr:nth-child({n+1})');
    expect(result).toContain('[data-testid="delete-btn"]');
  });
});

describe('Error handling', () => {
  test('throws on null locatorData', () => {
    expect(() => toLocatorString(null, 'playwright', 'ts')).toThrow('Invalid locatorData');
  });
  test('throws on undefined locatorData', () => {
    expect(() => toLocatorString(undefined, 'playwright', 'ts')).toThrow('Invalid locatorData');
  });
  test('throws on missing strategy', () => {
    expect(() => toLocatorString({ value: 'test' }, 'playwright', 'ts')).toThrow('Invalid locatorData');
  });
  test('throws on missing value', () => {
    expect(() => toLocatorString({ strategy: 'testid' }, 'playwright', 'ts')).toThrow('Invalid locatorData');
  });
  test('throws on unsupported framework', () => {
    expect(() => toLocatorString(testidData, 'unknown', 'ts')).toThrow('Unsupported combination');
  });
});

describe('title strategy', () => {
  const titleData = { strategy: 'title', value: 'Close dialog' };

  test('playwright → getByTitle', () => {
    expect(toLocatorString(titleData, 'playwright', 'ts')).toBe("page.getByTitle('Close dialog')");
  });
  test('playwright python → get_by_title', () => {
    expect(toLocatorString(titleData, 'playwright', 'python')).toBe('page.get_by_title("Close dialog")');
  });
  test('cypress → cy.get [title]', () => {
    expect(toLocatorString(titleData, 'cypress', 'ts')).toBe("cy.get('[title=\"Close dialog\"]')");
  });
  test('selenium ts → By.css [title]', () => {
    expect(toLocatorString(titleData, 'selenium', 'ts')).toBe("driver.findElement(By.css('[title=\"Close dialog\"]'))");
  });
  test('selenium python → By.CSS_SELECTOR [title]', () => {
    expect(toLocatorString(titleData, 'selenium', 'python')).toBe("driver.find_element(By.CSS_SELECTOR, '[title=\"Close dialog\"]')");
  });
});

describe('getShadowParts', () => {
  test('returns host and innerCss for testid strategy', () => {
    const data = { strategy: 'testid', value: 'save-btn', shadowHost: 'lightning-button' };
    const parts = getShadowParts(data);
    expect(parts).toEqual({ host: 'lightning-button', innerCss: '[data-testid="save-btn"]' });
  });

  test('returns host and innerCss for aria-label strategy', () => {
    const data = { strategy: 'label', value: 'Submit', shadowHost: 'c-my-form' };
    const parts = getShadowParts(data);
    expect(parts).toEqual({ host: 'c-my-form', innerCss: '[aria-label="Submit"]' });
  });

  test('returns host and innerCss for title strategy', () => {
    const data = { strategy: 'title', value: 'Close', shadowHost: 'c-modal' };
    const parts = getShadowParts(data);
    expect(parts).toEqual({ host: 'c-modal', innerCss: '[title="Close"]' });
  });
});
