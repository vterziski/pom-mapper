const { scanPage } = require('../src/scanner');

function buildDOM(html) {
  document.body.innerHTML = html;
  return document;
}

describe('scanPage', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  test('captures button with data-testid', () => {
    buildDOM('<button data-testid="submit-btn">Submit</button>');
    const result = scanPage(document);
    expect(result.buttons).toHaveLength(1);
    expect(result.buttons[0].name).toBe('submitBtnButton');
    expect(result.buttons[0].locatorData.strategy).toBe('testid');
  });

  test('captures input with aria-label', () => {
    buildDOM('<input aria-label="Email" type="email" />');
    const result = scanPage(document);
    expect(result.inputs).toHaveLength(1);
    expect(result.inputs[0].name).toBe('emailInput');
  });

  test('captures link', () => {
    buildDOM('<a href="/about" aria-label="About us">About</a>');
    const result = scanPage(document);
    expect(result.links).toHaveLength(1);
    expect(result.links[0].name).toBe('aboutUsLink');
  });

  test('skips elements with no usable selector', () => {
    buildDOM('<button></button>');
    const result = scanPage(document);
    expect(result.buttons).toHaveLength(0);
  });

  test('captures select', () => {
    buildDOM('<select name="country"><option>US</option></select>');
    const result = scanPage(document);
    expect(result.selects).toHaveLength(1);
    expect(result.selects[0].name).toBe('countrySelect');
  });

  test('captures textarea', () => {
    buildDOM('<textarea name="message"></textarea>');
    const result = scanPage(document);
    expect(result.textareas).toHaveLength(1);
    expect(result.textareas[0].name).toBe('messageTextarea');
  });

  test('returns all group keys even when empty', () => {
    buildDOM('');
    const result = scanPage(document);
    ['inputs', 'buttons', 'links', 'selects', 'textareas'].forEach(k =>
      expect(result).toHaveProperty(k)
    );
  });

  test('deduplicates names within same scan', () => {
    buildDOM(`
      <button data-testid="submit">A</button>
      <button data-testid="submit">B</button>
    `);
    const result = scanPage(document);
    expect(result.buttons[0].name).toBe('submitButton');
    expect(result.buttons[1].name).toBe('submitButton2');
  });

  test('accepts language param for Python snake_case names', () => {
    buildDOM('<button data-testid="login-btn">Login</button>');
    const result = scanPage(document, 'python');
    expect(result.buttons[0].name).toBe('login_btn_button');
  });
});
