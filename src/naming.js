const TYPE_SUFFIXES = {
  input: 'Input',
  button: 'Button',
  link: 'Link',
  select: 'Select',
  textarea: 'Textarea',
};

function toCamelCase(str) {
  return str
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word, i) =>
      i === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}

function toSnakeCase(str) {
  return str
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase())
    .join('_');
}

function toElementName(rawName, type, seen, language = 'ts') {
  const suffix = TYPE_SUFFIXES[type] || '';
  const isPython = language === 'python';
  const base = isPython
    ? toSnakeCase(rawName) + '_' + suffix.toLowerCase()
    : toCamelCase(rawName) + suffix;

  if (!seen[base]) {
    seen[base] = 1;
    return base;
  }
  seen[base] += 1;
  return isPython ? base + '_' + seen[base] : base + seen[base];
}

module.exports = { toElementName, toCamelCase, toSnakeCase };
