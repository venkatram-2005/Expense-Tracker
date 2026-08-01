# AI Notes

## How AI was used

I used an AI coding assistant to scaffold the Express application structure, propose the REST endpoint design, and draft the initial unit/integration tests and documentation. The generated portions include the controller/service/repository layering, error middleware, OpenAPI document, and test harness.

## What I reviewed and changed

I reviewed the generated code and validated it by running the test suite against a locally started HTTP server. I specifically changed the date validation so it verifies real calendar dates rather than accepting values such as `2026-02-30`, which JavaScript date parsing can normalize silently. I also verified validation failures, filtering, totals, deletion, and the documentation endpoint through automated tests.

## Suggestions I did not use

I did not add a database, authentication, or Docker setup because the assignment explicitly permits in-memory storage and asks for backend functionality only. I also avoided adding a heavy testing framework; Node's built-in test runner keeps installation and execution simple while still testing the API over HTTP.
