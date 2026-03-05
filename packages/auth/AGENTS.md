# Auth Agent Notes

This package uses Better Auth with Drizzle and supports both platform-level and organization-level access control.

## Source of Truth

- Auth config: `packages/auth/src/index.ts`
- DB auth schema (generated): `packages/db/src/schema/auth/generated.ts`
- tRPC authorization middleware: `packages/api/src/authz.ts`
- tRPC protected/authorized procedures: `packages/api/src/index.ts`
- Web auth client + permission query helpers: `apps/web/src/lib/auth-client.ts`

## Access Control Model

- Platform RBAC is provided by the Better Auth `admin()` plugin.
- Organization RBAC is provided by the Better Auth `organization()` plugin.
- Server-side enforcement happens in API middleware (`authorizedProcedure` + `assertProcedurePermission`).
- Client-side permission checks are for UX only; they do not replace server checks.

## Adding Roles and Permissions

1. Define shared access-control statements and roles (recommended in a dedicated module under `packages/auth/src/`, e.g. `permissions.ts`).
2. Pass `ac` and `roles` to server plugins in `packages/auth/src/index.ts`:
    - `admin({ ac, roles })`
    - `organization({ ac, roles })`
3. Pass matching `ac` and `roles` to client plugins in `apps/web/src/lib/auth-client.ts`:
    - `adminClient({ ac, roles })`
    - `organizationClient({ ac, roles })`
4. Use those permissions in API route metadata (`meta.authz.permissions`) and web guards/nav checks.

## Schema and Migration Workflow

Use Better Auth CLI for auth schema generation and Drizzle for migrations:

1. Generate Better Auth schema into:
    - `packages/db/src/schema/auth/generated.ts`
2. Generate Drizzle migration:
    - `pnpm --filter @auxarmory/db db:generate`
3. Apply migration:
    - `pnpm --filter @auxarmory/db db:migrate`

Note: the first platform admin can be promoted manually in DB if needed.

## Better Auth Docs

- Admin plugin: https://better-auth.com/docs/plugins/admin
- Organization plugin: https://better-auth.com/docs/plugins/organization
- Access control plugin: https://better-auth.com/docs/plugins/access
- CLI: https://better-auth.com/docs/concepts/cli
- Drizzle adapter: https://better-auth.com/docs/adapters/drizzle
