const { getUsage, incrementUsage, canExport, FREE_LIMIT } = require('../src/usage');

function mockStorage(data = {}) {
  global.chrome = {
    storage: {
      local: {
        get: jest.fn((keys, cb) => cb(data)),
        set: jest.fn((data, cb) => cb && cb()),
      },
    },
  };
}

describe('usage module', () => {
  beforeEach(() => jest.clearAllMocks());

  test('FREE_LIMIT is 20', () => {
    expect(FREE_LIMIT).toBe(20);
  });

  test('getUsage returns 0 count and current month when storage empty', async () => {
    mockStorage({});
    const usage = await getUsage();
    expect(usage.count).toBe(0);
    expect(usage.month).toMatch(/^\d{4}-\d{2}$/);
  });

  test('getUsage resets count when month changed', async () => {
    mockStorage({ usage: { count: 15, month: '2020-01' } });
    const usage = await getUsage();
    expect(usage.count).toBe(0);
  });

  test('getUsage preserves count in same month', async () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    mockStorage({ usage: { count: 12, month: currentMonth } });
    const usage = await getUsage();
    expect(usage.count).toBe(12);
  });

  test('canExport returns true when under limit and no premium token', async () => {
    mockStorage({ usage: { count: 5, month: new Date().toISOString().slice(0, 7) } });
    expect(await canExport()).toBe(true);
  });

  test('canExport returns false when at limit and no premium token', async () => {
    mockStorage({ usage: { count: 20, month: new Date().toISOString().slice(0, 7) } });
    expect(await canExport()).toBe(false);
  });

  test('canExport returns true for premium token regardless of count', async () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    mockStorage({ usage: { count: 20, month: currentMonth }, premiumToken: 'tok_abc123' });
    expect(await canExport()).toBe(true);
  });

  test('incrementUsage increments count and saves', async () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    mockStorage({ usage: { count: 5, month: currentMonth } });
    await incrementUsage();
    expect(global.chrome.storage.local.set).toHaveBeenCalledWith(
      { usage: { count: 6, month: currentMonth } },
      expect.any(Function)
    );
  });
});
