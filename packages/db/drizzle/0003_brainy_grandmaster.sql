DROP INDEX "sync_runs_lookup_idx";--> statement-breakpoint
DROP INDEX "sync_state_scope_uidx";--> statement-breakpoint
ALTER TABLE "sync_runs" ADD COLUMN "scope_key" text DEFAULT 'global' NOT NULL;--> statement-breakpoint
ALTER TABLE "sync_state" ADD COLUMN "scope_key" text DEFAULT 'global' NOT NULL;--> statement-breakpoint
CREATE INDEX "sync_runs_lookup_idx" ON "sync_runs" USING btree ("provider","domain","entity","region","scope_key","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sync_state_scope_uidx" ON "sync_state" USING btree ("provider","domain","entity","region","scope_key");