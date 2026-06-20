const GROUPS = ['inputs', 'buttons', 'links', 'selects', 'textareas'];

function diffElements(oldElements, newElements) {
  const newLocators = new Set(
    GROUPS.flatMap(g => (newElements[g] || []).map(e => e.locatorData.value))
  );
  return GROUPS.flatMap(g =>
    (oldElements[g] || []).filter(e => !newLocators.has(e.locatorData.value))
  );
}

function buildHealingPrompt(element, domContext) {
  return `You are a test automation expert. An element locator is broken after a UI change.

Old locator: strategy="${element.locatorData.strategy}", value="${element.locatorData.value}", element name="${element.name}", type="${element.type}"

Current DOM context around the element area:
${domContext}

Find the best new locator for this element. Prefer data-testid > aria-label > id > name > role+text. Never use classes or XPath.

Respond ONLY with a JSON object in this exact format: {"strategy":"<strategy>","value":"<value>"}
If role strategy, add "role" key: {"strategy":"role","role":"button","value":"Sign In"}`;
}

function parseHealingResponse(responseText) {
  try {
    return JSON.parse(responseText.trim());
  } catch {
    return null;
  }
}

async function callLLM(apiKey, provider, prompt) {
  const isAnthropic = provider === 'anthropic';
  const url = isAnthropic
    ? 'https://api.anthropic.com/v1/messages'
    : 'https://api.openai.com/v1/chat/completions';

  const headers = {
    'Content-Type': 'application/json',
    ...(isAnthropic
      ? { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }
      : { Authorization: `Bearer ${apiKey}` }),
  };

  const body = isAnthropic
    ? JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 256, messages: [{ role: 'user', content: prompt }] })
    : JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] });

  const res = await fetch(url, { method: 'POST', headers, body });
  if (!res.ok) throw new Error(`LLM API error: ${res.status}`);
  const data = await res.json();
  return isAnthropic ? data.content[0].text : data.choices[0].message.content;
}

module.exports = { diffElements, buildHealingPrompt, parseHealingResponse, callLLM };
