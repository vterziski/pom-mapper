const FREE_LIMIT = 20;

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function getUsage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['usage'], ({ usage }) => {
      const month = currentMonth();
      if (!usage || usage.month !== month) {
        resolve({ count: 0, month });
      } else {
        resolve(usage);
      }
    });
  });
}

function incrementUsage() {
  return getUsage().then((usage) => {
    const updated = { count: usage.count + 1, month: usage.month };
    return new Promise((resolve) => {
      chrome.storage.local.set({ usage: updated }, resolve);
    });
  });
}

function canExport() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['usage', 'premiumToken'], ({ usage, premiumToken }) => {
      if (premiumToken) return resolve(true);
      const month = currentMonth();
      const count = (!usage || usage.month !== month) ? 0 : usage.count;
      resolve(count < FREE_LIMIT);
    });
  });
}

module.exports = { getUsage, incrementUsage, canExport, FREE_LIMIT };
