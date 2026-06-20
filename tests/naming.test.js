const { toElementName } = require('../src/naming');

describe('toElementName', () => {
  test('converts hyphenated data-testid to camelCase + type suffix', () => {
    expect(toElementName('login-submit', 'button', {})).toBe('loginSubmitButton');
  });

  test('converts aria-label with spaces to camelCase + type suffix', () => {
    expect(toElementName('Email address', 'input', {})).toBe('emailAddressInput');
  });

  test('converts underscore id to camelCase', () => {
    expect(toElementName('user_name', 'input', {})).toBe('userNameInput');
  });

  test('appends numeric suffix for duplicate names', () => {
    const seen = { submitButton: 1 };
    expect(toElementName('submit', 'button', seen)).toBe('submitButton2');
  });

  test('handles single word', () => {
    expect(toElementName('search', 'input', {})).toBe('searchInput');
  });

  test('strips non-alphanumeric characters', () => {
    expect(toElementName('my-link!', 'link', {})).toBe('myLinkLink');
  });

  test('suffix for select', () => {
    expect(toElementName('country', 'select', {})).toBe('countrySelect');
  });

  test('suffix for textarea', () => {
    expect(toElementName('description', 'textarea', {})).toBe('descriptionTextarea');
  });

  test('Python snake_case output', () => {
    expect(toElementName('login-submit', 'button', {}, 'python')).toBe('login_submit_button');
  });

  test('Java camelCase output (same as default)', () => {
    expect(toElementName('login-submit', 'button', {}, 'java')).toBe('loginSubmitButton');
  });
});
