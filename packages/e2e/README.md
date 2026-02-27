# E2E setup

These tests are DB-backed integration tests and expect a Postgres instance.

## Local DB strategy

Use one Docker Compose stack with two databases inside the same Postgres container:

- `auxarmory_dev`
- `auxarmory_test`

Start the DB:

```bash
pnpm db:up
```

Recommended environment values:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/auxarmory_dev
DATABASE_URL_TEST=postgres://postgres:postgres@localhost:5432/auxarmory_test
```

Sync schema for test DB:

```bash
pnpm --filter @auxarmory/db db:sync:test
```

Run e2e tests:

```bash
pnpm test:e2e
```
