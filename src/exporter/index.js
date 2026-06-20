const templates = {
  'playwright-ts':     require('./templates/playwright-ts'),
  'playwright-js':     require('./templates/playwright-js'),
  'playwright-java':   require('./templates/playwright-java'),
  'playwright-python': require('./templates/playwright-python'),
  'selenium-ts':       require('./templates/selenium-ts'),
  'selenium-js':       require('./templates/selenium-js'),
  'selenium-java':     require('./templates/selenium-java'),
  'selenium-python':   require('./templates/selenium-python'),
  'cypress-ts':        require('./templates/cypress-ts'),
  'cypress-js':        require('./templates/cypress-js'),
};

function generateFile(elements, className, framework, language) {
  const key = `${framework}-${language}`;
  const template = templates[key];
  if (!template) throw new Error(`Unsupported combination: ${key}`);
  return template.generate(elements, className);
}

function getFilename(className, language) {
  if (language === 'python') {
    return className.replace(/([A-Z])/g, (m, l, i) => (i === 0 ? l.toLowerCase() : '_' + l.toLowerCase())) + '.py';
  }
  const ext = { ts: '.ts', js: '.js', java: '.java' }[language] || '.ts';
  return `${className}${ext}`;
}

module.exports = { generateFile, getFilename };
