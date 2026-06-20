const { getLocatorData } = require('../src/selector');

function makeEl(tag, attrs = {}, textContent = '') {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  el.textContent = textContent;
  return el;
}

describe('getLocatorData', () => {
  test('prefers data-testid', () => {
    const el = makeEl('button', { 'data-testid': 'login-btn' }, 'Login');
    expect(getLocatorData(el, 'button')).toEqual({
      strategy: 'testid',
      value: 'login-btn',
      rawName: 'login-btn',
    });
  });

  test('falls back to aria-label', () => {
    const el = makeEl('input', { 'aria-label': 'Email address' });
    expect(getLocatorData(el, 'input')).toEqual({
      strategy: 'label',
      value: 'Email address',
      rawName: 'Email address',
    });
  });

  test('falls back to id', () => {
    const el = makeEl('input', { id: 'username' });
    expect(getLocatorData(el, 'input')).toEqual({
      strategy: 'id',
      value: 'username',
      rawName: 'username',
    });
  });

  test('falls back to name attribute', () => {
    const el = makeEl('input', { name: 'password' });
    expect(getLocatorData(el, 'input')).toEqual({
      strategy: 'name',
      value: 'password',
      rawName: 'password',
    });
  });

  test('falls back to role + text for button', () => {
    const el = makeEl('button', {}, 'Sign In');
    expect(getLocatorData(el, 'button')).toEqual({
      strategy: 'role',
      role: 'button',
      value: 'Sign In',
      rawName: 'Sign In',
    });
  });

  test('falls back to role + text for link', () => {
    const el = makeEl('a', { href: '#' }, 'Forgot password?');
    expect(getLocatorData(el, 'link')).toEqual({
      strategy: 'role',
      role: 'link',
      value: 'Forgot password?',
      rawName: 'Forgot password?',
    });
  });

  test('returns null when no usable selector exists', () => {
    const el = makeEl('button', {}, '');
    expect(getLocatorData(el, 'button')).toBeNull();
  });
});
