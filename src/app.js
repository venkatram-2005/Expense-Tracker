const http = require('node:http');
const { ExpenseRepository } = require('./repositories/expense-repository');
const { ExpenseService } = require('./services/expense-service');
const { createExpenseController } = require('./controllers/expense-controller');
const { AppError } = require('./errors/app-error');
const { openapi } = require('./openapi');

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error('Malformed JSON body')); }
    });
    req.on('error', reject);
  });
}

function createApp({ repository = new ExpenseRepository() } = {}) {
  const controller = createExpenseController(new ExpenseService(repository));
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const query = Object.fromEntries(url.searchParams);
    try {
      if (req.method === 'GET' && url.pathname === '/health') return sendJson(res, 200, { status: 'ok' });
      if (req.method === 'GET' && url.pathname === '/api-docs/openapi.json') return sendJson(res, 200, openapi);
      if (req.method === 'POST' && url.pathname === '/expenses') {
        const data = controller.create({ body: await readJsonBody(req) });
        return sendJson(res, 201, data);
      }
      if (req.method === 'GET' && url.pathname === '/expenses/total') {
        return sendJson(res, 200, controller.total({ query }));
      }
      if (req.method === 'GET' && url.pathname === '/expenses') {
        return sendJson(res, 200, controller.list({ query }));
      }
      const match = url.pathname.match(/^\/expenses\/([^/]+)$/);
      if (req.method === 'DELETE' && match) {
        controller.remove({ params: { id: decodeURIComponent(match[1]) } });
        res.writeHead(204);
        return res.end();
      }
      return sendJson(res, 404, { error: { message: 'Route not found' } });
    } catch (error) {
      if (error instanceof AppError) return sendJson(res, error.statusCode, { error: { message: error.message, details: error.details } });
      if (error.message === 'Malformed JSON body') return sendJson(res, 400, { error: { message: error.message } });
      console.error(error);
      return sendJson(res, 500, { error: { message: 'Internal server error' } });
    }
  });
}

module.exports = { createApp };
