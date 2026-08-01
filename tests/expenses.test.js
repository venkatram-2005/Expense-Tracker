const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');

async function withServer(callback) {
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  try { await callback(baseUrl); } finally { await new Promise((resolve) => server.close(resolve)); }
}

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = response.status === 204 ? undefined : await response.json();
  return { response, body };
}

const expense = { title: 'Weekly groceries', amount: 54.25, category: 'Food', date: '2026-07-31' };

test('creates, lists, filters, totals, and deletes expenses', async () => {
  await withServer(async (baseUrl) => {
    const created = await request(baseUrl, '/expenses', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(expense) });
    assert.equal(created.response.status, 201);
    assert.match(created.body.data.id, /^[\w-]+$/);

    await request(baseUrl, '/expenses', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...expense, title: 'Bus', amount: 3.5, category: 'Transport' }) });
    const all = await request(baseUrl, '/expenses');
    assert.equal(all.body.data.length, 2);
    const filtered = await request(baseUrl, '/expenses?category=Food');
    assert.deepEqual(filtered.body.data.map((item) => item.title), ['Weekly groceries']);
    const total = await request(baseUrl, '/expenses/total');
    assert.deepEqual(total.body.data, { category: null, total: 57.75, count: 2 });
    const categoryTotal = await request(baseUrl, '/expenses/total?category=Food');
    assert.deepEqual(categoryTotal.body.data, { category: 'Food', total: 54.25, count: 1 });

    const deleted = await request(baseUrl, `/expenses/${created.body.data.id}`, { method: 'DELETE' });
    assert.equal(deleted.response.status, 204);
    const afterDelete = await request(baseUrl, '/expenses');
    assert.equal(afterDelete.body.data.length, 1);
  });
});

test('rejects invalid input and reports missing expenses', async () => {
  await withServer(async (baseUrl) => {
    const invalid = await request(baseUrl, '/expenses', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...expense, amount: -1, date: '2026-02-30' }) });
    assert.equal(invalid.response.status, 400);
    assert.deepEqual(invalid.body.error.details, ['amount must be a positive number with at most 2 decimal places', 'date must be a valid ISO date in YYYY-MM-DD format']);
    const missing = await request(baseUrl, '/expenses/not-here', { method: 'DELETE' });
    assert.equal(missing.response.status, 404);
  });
});

test('rejects invalid payload shapes, money values, query values, and content types', async () => {
  await withServer(async (baseUrl) => {
    const cases = [
      [{ ...expense, amount: 1.999 }, 'amount must be a positive number with at most 2 decimal places'],
      [{ ...expense, title: '   ' }, 'title must be a non-empty string'],
      [{ ...expense, category: '' }, 'category must be a non-empty string'],
      [{ ...expense, extra: true }, 'unknown field(s): extra']
    ];
    for (const [payload, expectedError] of cases) {
      const result = await request(baseUrl, '/expenses', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      assert.equal(result.response.status, 400);
      assert.ok(result.body.error.details.includes(expectedError));
    }
    const notAnObject = await request(baseUrl, '/expenses', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '[]' });
    assert.equal(notAnObject.response.status, 400);
    const wrongContentType = await request(baseUrl, '/expenses', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: '{}' });
    assert.equal(wrongContentType.response.status, 415);
    const emptyCategory = await request(baseUrl, '/expenses?category=%20%20');
    assert.equal(emptyCategory.response.status, 400);
    const repeatedCategory = await request(baseUrl, '/expenses?category=Food&category=Transport');
    assert.equal(repeatedCategory.response.status, 400);
  });
});

test('calculates money totals without floating-point rounding errors', async () => {
  await withServer(async (baseUrl) => {
    for (const amount of [0.1, 0.2]) {
      const result = await request(baseUrl, '/expenses', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...expense, amount }) });
      assert.equal(result.response.status, 201);
    }
    const total = await request(baseUrl, '/expenses/total');
    assert.equal(total.body.data.total, 0.3);
  });
});

test('publishes OpenAPI documentation', async () => {
  await withServer(async (baseUrl) => {
    const docs = await request(baseUrl, '/api-docs/openapi.json');
    assert.equal(docs.response.status, 200);
    assert.equal(docs.body.openapi, '3.0.3');
  });
});
