const ROLE_MAP = {
  button: 'button',
  link: 'link',
  select: 'combobox',
  input: 'textbox',
  textarea: 'textbox',
};

function getLocatorData(el, type) {
  const testId = el.getAttribute('data-testid');
  if (testId) return { strategy: 'testid', value: testId, rawName: testId };

  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) return { strategy: 'label', value: ariaLabel, rawName: ariaLabel };

  const id = el.getAttribute('id');
  if (id) return { strategy: 'id', value: id, rawName: id };

  const name = el.getAttribute('name');
  if (name) return { strategy: 'name', value: name, rawName: name };

  const text = el.textContent.trim();
  if (text) return { strategy: 'role', role: ROLE_MAP[type] || type, value: text, rawName: text };

  return null;
}

module.exports = { getLocatorData };
