# AI Notes

## A straightforward account of how AI was used

I used an AI coding assistant as a development partner while building this take-home task. It was useful for quickly turning the written requirements into an initial API shape, suggesting a sensible folder structure, and drafting repetitive implementation pieces such as the repository, request validation, and tests.

The assistant's output was a starting point, not something I treated as automatically correct. I reviewed the code in the context of the assignment, ran it locally, and changed pieces that did not fit the final solution or would have made the setup less reliable for an evaluator.

## What was AI-assisted

AI helped draft or scaffold the following parts:

- The initial endpoint design for creating, listing, filtering, totaling, and deleting expenses.
- The separation into controller, service, repository, validator, and error modules.
- The in-memory `Map` repository implementation and UUID generation.
- The first version of the Node test suite, including the helper that starts a temporary HTTP server and sends requests with `fetch`.
- The initial OpenAPI document and README outline.

I then reviewed and refined those pieces as described below.

## What I checked, changed, and why

### Keeping installation dependable

The first approach used Express. In the available environment, installing external packages was not dependable, which would create unnecessary risk for a submission whose README commands are run automatically. I replaced that dependency with Node's built-in `http` module. The API remains a normal REST API, but `npm install` now completes without downloading runtime dependencies. This was a deliberate trade-off in favour of a predictable clean-checkout setup.

### Reviewing the data validation

I checked that the API does not accept empty titles or categories, zero/negative/non-numeric amounts, fractional-cent values, malformed dates, unknown JSON fields, or malformed request shapes. One important correction was date handling: JavaScript's date parsing can silently turn an impossible date such as `2026-02-30` into a date in March. The final validator checks the year, month, and day after constructing a UTC date, so impossible calendar dates are rejected instead of being normalized. Totals are calculated in cents before being converted back to a decimal amount, avoiding common floating-point results such as `0.30000000000000004`.

### Reviewing request routing and responses

I verified that `/expenses/total` is handled before the dynamic `/expenses/:id` route, so the word `total` is not mistaken for an expense ID. I also checked that successful deletion returns `204 No Content`, that missing IDs return `404`, and that validation errors have a consistent JSON shape. Query categories are trimmed before use and an explicitly empty category query is rejected.

### Testing the result

I ran the required commands from the repository root:

```bash
npm install
npm test
```

The automated tests make real HTTP requests to a server listening on a temporary port. They cover:

- Creating two expenses and confirming that server-generated IDs are returned.
- Listing all expenses.
- Filtering by category.
- Calculating the overall total and a category total.
- Deleting an expense and confirming the list changes.
- Invalid amount and impossible-date validation errors.
- Deleting an unknown ID.
- Availability of the OpenAPI documentation endpoint.

## AI suggestions I chose not to use

I deliberately kept the scope focused and declined a few plausible additions:

- **Database or JSON-file persistence:** the brief explicitly allows in-memory storage. Adding persistence would add setup and edge cases without improving the required behavior.
- **Authentication and user accounts:** these are outside the personal-expense API requirements and would distract from the core endpoints.
- **Multiple bonus features:** the brief asks for at most one. I selected OpenAPI documentation only and did not add search, a monthly summary, or Docker support.
- **A large external test framework:** Node's built-in test runner is sufficient here and avoids an unnecessary dependency.
- **A web UI:** the assignment asks for a backend REST API, so I kept the submission backend-only.

## Final responsibility

I take responsibility for the final code and documentation. AI accelerated scaffolding and review, while the final choices—especially the dependency-free server, stricter validation, test coverage, and the scoped feature set—were made to keep the solution clear, robust, and easy to evaluate.
