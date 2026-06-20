const { generate } = require('../../../src/exporter/templates/playwright-ts');

const elements = {
  inputs: [{ name: 'emailInput', locatorData: { strategy: 'label', value: 'Email' }, type: 'input' }],
  buttons: [{ name: 'signInButton', locatorData: { strategy: 'role', role: 'button', value: 'Sign In' }, type: 'button' }],
  links: [],
  selects: [],
  textareas: [],
};

describe('playwright-ts template', () => {
  test('includes Playwright import', () => {
    expect(generate(elements, 'LoginPage')).toContain("import { Page } from '@playwright/test';");
  });
  test('exports class with correct name', () => {
    expect(generate(elements, 'LoginPage')).toContain('export class LoginPage');
  });
  test('has constructor with private page', () => {
    expect(generate(elements, 'LoginPage')).toContain('constructor(private page: Page)');
  });
  test('generates input as arrow function using this.page', () => {
    expect(generate(elements, 'LoginPage')).toContain("emailInput = () => this.page.getByLabel('Email');");
  });
  test('generates button as arrow function', () => {
    expect(generate(elements, 'LoginPage')).toContain("signInButton = () => this.page.getByRole('button', { name: 'Sign In' });");
  });
  test('includes group comment headers for non-empty groups', () => {
    const out = generate(elements, 'LoginPage');
    expect(out).toContain('// Inputs');
    expect(out).toContain('// Buttons');
  });
  test('omits headers for empty groups', () => {
    const out = generate(elements, 'LoginPage');
    expect(out).not.toContain('// Links');
  });
});

test('generates parameterized method for list item', () => {
  const elements = {
    buttons: [{
      name: 'rowDeleteButton',
      locatorData: { strategy: 'testid', value: 'delete-btn', container: 'tbody tr' },
      type: 'button',
      isListItem: true,
    }],
    inputs: [], links: [], selects: [], textareas: [],
  };
  const output = generate(elements, 'UsersPage');
  expect(output).toContain("rowDeleteButton = (n: number) =>");
  expect(output).toContain("this.page.locator('tbody tr').nth(n).getByTestId('delete-btn')");
});
