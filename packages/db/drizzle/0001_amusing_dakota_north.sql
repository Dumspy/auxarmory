CREATE TYPE "public"."sync_run_mode" AS ENUM('weekly', 'full', 'incremental', 'manual');--> statement-breakpoint
CREATE TYPE "public"."sync_run_status" AS ENUM('running', 'success', 'failed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."sync_run_trigger" AS ENUM('scheduler', 'manual', 'recovery', 'system');--> statement-breakpoint
CREATE TABLE "sync_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"domain" text NOT NULL,
	"entity" text NOT NULL,
	"region" text DEFAULT 'global' NOT NULL,
	"mode" "sync_run_mode" NOT NULL,
	"status" "sync_run_status" NOT NULL,
	"triggered_by" "sync_run_trigger" NOT NULL,
	"job_name" text,
	"job_id" text,
	"scheduled_for" timestamp,
	"started_at" timestamp NOT NULL,
	"finished_at" timestamp,
	"inserted_count" integer DEFAULT 0 NOT NULL,
	"updated_count" integer DEFAULT 0 NOT NULL,
	"skipped_count" integer DEFAULT 0 NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"error_payload" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_state" (
	"provider" text NOT NULL,
	"domain" text NOT NULL,
	"entity" text NOT NULL,
	"region" text DEFAULT 'global' NOT NULL,
	"last_run_id" text,
	"last_status" "sync_run_status",
	"last_started_at" timestamp,
	"last_finished_at" timestamp,
	"last_success_at" timestamp,
	"last_reset_key" text,
	"cursor" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "sync_runs_lookup_idx" ON "sync_runs" USING btree ("provider","domain","entity","region","started_at");--> statement-breakpoint
CREATE INDEX "sync_runs_status_idx" ON "sync_runs" USING btree ("status","started_at");--> statement-breakpoint
CREATE INDEX "sync_runs_job_id_idx" ON "sync_runs" USING btree ("job_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sync_state_scope_uidx" ON "sync_state" USING btree ("provider","domain","entity","region");--> statement-breakpoint
CREATE INDEX "sync_state_last_success_idx" ON "sync_state" USING btree ("last_success_at");