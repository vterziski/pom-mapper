const { scanPage, getListContext, isSalesforcePage, querySelectorAllDeep } = require('../src/scanner');

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

  test('collapses repeated buttons in tbody rows into one parameterized entry', () => {
    buildDOM(`
      <table><tbody>
        <tr><td><button data-testid="delete-btn">Delete</button></td></tr>
        <tr><td><button data-testid="delete-btn">Delete</button></td></tr>
        <tr><td><button data-testid="delete-btn">Delete</button></td></tr>
      </tbody></table>
    `);
    const result = scanPage(document);
    expect(result.buttons).toHaveLength(1);
    expect(result.buttons[0].isListItem).toBe(true);
    expect(result.buttons[0].locatorData.container).toBe('tbody tr');
  });

  test('collapses repeated buttons in ul li into one parameterized entry', () => {
    buildDOM(`
      <ul>
        <li><button aria-label="Remove">x</button></li>
        <li><button aria-label="Remove">x</button></li>
      </ul>
    `);
    const result = scanPage(document);
    expect(result.buttons).toHaveLength(1);
    expect(result.buttons[0].isListItem).toBe(true);
    expect(result.buttons[0].locatorData.container).toBe('ul li');
  });

  test('keeps distinct locator values in same list as separate parameterized entries', () => {
    buildDOM(`
      <table><tbody>
        <tr><td><button data-testid="edit-btn">Edit</button><button data-testid="delete-btn">Delete</button></td></tr>
        <tr><td><button data-testid="edit-btn">Edit</button><button data-testid="delete-btn">Delete</button></td></tr>
      </tbody></table>
    `);
    const result = scanPage(document);
    expect(result.buttons).toHaveLength(2);
    expect(result.buttons.every(b => b.isListItem)).toBe(true);
  });

  test('non-list buttons are not marked as list items', () => {
    buildDOM('<button data-testid="submit">Submit</button>');
    const result = scanPage(document);
    expect(result.buttons[0].isListItem).toBeUndefined();
    expect(result.buttons[0].locatorData.container).toBeUndefined();
  });
});

describe('isSalesforcePage', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  test('detects lightning-input', () => {
    document.body.innerHTML = '<lightning-input label="Name"></lightning-input>';
    expect(isSalesforcePage(document)).toBe(true);
  });

  test('detects slds-scope', () => {
    document.body.innerHTML = '<div class="slds-scope"><button>Go</button></div>';
    expect(isSalesforcePage(document)).toBe(true);
  });

  test('detects data-aura-rendered-by', () => {
    document.body.innerHTML = '<div data-aura-rendered-by="123:0"></div>';
    expect(isSalesforcePage(document)).toBe(true);
  });

  test('does not trigger on generic data-component-id', () => {
    document.body.innerHTML = '<div data-component-id="hero-banner"></div>';
    expect(isSalesforcePage(document)).toBe(false);
  });

  test('returns false for plain page', () => {
    document.body.innerHTML = '<button>Click</button>';
    expect(isSalesforcePage(document)).toBe(false);
  });
});

describe('querySelectorAllDeep', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  test('finds elements in regular DOM', () => {
    document.body.innerHTML = '<button data-testid="btn">Click</button>';
    const results = querySelectorAllDeep('button', document);
    expect(results.length).toBeGreaterThanOrEqual(1);
  });
});

describe('getListContext', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  test('returns row context for element inside tbody tr', () => {
    document.body.innerHTML = '<table><tbody><tr><td><button id="b">X</button></td></tr></tbody></table>';
    const el = document.getElementById('b');
    const ctx = getListContext(el);
    expect(ctx).toEqual({ container: 'tbody tr', prefix: 'row' });
  });

  test('returns item context for element inside ul li', () => {
    document.body.innerHTML = '<ul><li><button id="b">X</button></li></ul>';
    const el = document.getElementById('b');
    const ctx = getListContext(el);
    expect(ctx).toEqual({ container: 'ul li', prefix: 'item' });
  });

  test('returns null for element not inside a list', () => {
    document.body.innerHTML = '<button id="b">X</button>';
    const el = document.getElementById('b');
    expect(getListContext(el)).toBeNull();
  });
});
