const openapi = {
  openapi: '3.0.3',
  info: { title: 'Smart Expense Tracker API', version: '1.0.0' },
  paths: {
    '/expenses': {
      get: { summary: 'List expenses; optionally filter by category', parameters: [{ name: 'category', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Expenses returned' } } },
      post: { summary: 'Create an expense', responses: { 201: { description: 'Expense created' }, 400: { description: 'Invalid input' } } }
    },
    '/expenses/total': { get: { summary: 'Get overall or category total', parameters: [{ name: 'category', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Total returned' } } } },
    '/expenses/{id}': { delete: { summary: 'Delete an expense', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' }, 404: { description: 'Not found' } } } }
  }
};

module.exports = { openapi };
