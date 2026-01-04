# Agent Guidelines for auxarmory

## Build/Lint/Test Commands
- `pnpm check` - Run oxlint and oxfmt (auto-fixes)
- `pnpm build` - Build all packages via turbo
- `pnpm check-types` - Type-check all packages
- `pnpm dev` - Run all dev servers
- `pnpm dev:web` - Run web app only
- `turbo -F <workspace> <command>` - Run command in specific workspace (e.g., `turbo -F web build`)

## Code Style
- **Indentation**: Tabs (size 4) for code, 2 spaces for JSON/Nix
- **Quotes**: Double quotes for JS/TS
- **Types**: Strict TypeScript with `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`
- **Imports**: Use workspace aliases (`@auxarmory/*`), prefer named imports
- **Naming**: camelCase for variables/functions, PascalCase for components/types, snake_case for DB columns
- **Error Handling**: Use TRPCError with proper codes for API errors, validate with Zod schemas
- **Database**: Use Drizzle ORM with Postgres, add indexes for foreign keys, use `$onUpdate` for timestamps
- **Auth**: Use better-auth, check `ctx.session` in protected procedures
- **Components**: Export default for page components, named exports for utilities
- **Formatting**: Run `oxlint && oxfmt --write` before committing
