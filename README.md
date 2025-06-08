# Setup
1. Run `cp .env.example .env`
2. Update `.env` with your tokens
3. Run `docker compose up -d` to postgresql and redis
4. Run `pmpn install` to install dependencies
4. cd `./packages/db` & run `pnpm generate` to genereate the prisma client
5. cd `./packages/db` & run `pnpm db:push` to push the schema to the database
