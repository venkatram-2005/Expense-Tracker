# Smart Expense Tracker API

A Node.js/Express REST API that manages personal expenses in memory. The project uses a layered design: routes/controllers handle HTTP, the service holds business rules, the repository abstracts storage, and middleware centralizes errors.

The API listens on `http://localhost:3000` by default. Set `PORT` to use another port.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/expenses` | Add an expense |
| `GET` | `/expenses` | List expenses; use `?category=Food` to filter |
| `GET` | `/expenses/total` | Overall total; use `?category=Food` for a category total |
| `DELETE` | `/expenses/:id` | Delete an expense |
| `GET` | `/health` | Health check |
| `GET` | `/api-docs/openapi.json` | OpenAPI 3 documentation (bonus) |


Successful `POST` responses return `201` and the generated UUID. Errors use a consistent `{ "error": { "message": "...", "details": [] } }` shape. Because storage is in memory, data resets whenever the server restarts.
