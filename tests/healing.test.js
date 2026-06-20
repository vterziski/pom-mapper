const { diffElements, buildHealingPrompt, parseHealingResponse } = require('../src/healing');

const oldElements = {
  buttons: [{ name: 'loginButton', locatorData: { strategy: 'testid', value: 'login-btn' }, type: 'button' }],
  inputs: [],
  links: [],
  selects: [],
  textareas: [],
};

const newElements = {
  buttons: [],
  inputs: [],
  links: [],
  selects: [],
  textareas: [],
};

describe('diffElements', () => {
  test('returns missing elements not found in new scan', () => {
    const missing = diffElements(oldElements, newElements);
    expect(missing).toHaveLength(1);
    expect(missing[0].name).toBe('loginButton');
  });

  test('returns empty array when all elements still present', () => {
    const missing = diffElements(oldElements, oldElements);
    expect(missing).toHaveLength(0);
  });
});

describe('buildHealingPrompt', () => {
  test('includes old locator info in prompt', () => {
    const el = { name: 'loginButton', locatorData: { strategy: 'testid', value: 'login-btn' }, type: 'button' };
    const prompt = buildHealingPrompt(el, '<button id="signin-btn">Sign In</button>');
    expect(prompt).toContain('login-btn');
    expect(prompt).toContain('signin-btn');
  });
});

describe('parseHealingResponse', () => {
  test('extracts locator data from LLM JSON response', () => {
    const response = JSON.stringify({ strategy: 'id', value: 'signin-btn' });
    expect(parseHealingResponse(response)).toEqual({ strategy: 'id', value: 'signin-btn' });
  });

  test('returns null for invalid JSON', () => {
    expect(parseHealingResponse('not json')).toBeNull();
  });
});
