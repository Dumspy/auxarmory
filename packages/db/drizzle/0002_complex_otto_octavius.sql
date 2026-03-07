CREATE TABLE "wow_cache_connected_realms" (
	"region" text NOT NULL,
	"battlenet_id" integer NOT NULL,
	"status_type" text,
	"population_type" text,
	"payload" jsonb NOT NULL,
	"last_seen_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wow_cache_playable_classes" (
	"region" text NOT NULL,
	"battlenet_id" integer NOT NULL,
	"name" text NOT NULL,
	"payload" jsonb NOT NULL,
	"last_seen_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wow_cache_playable_races" (
	"region" text NOT NULL,
	"battlenet_id" integer NOT NULL,
	"name" text NOT NULL,
	"payload" jsonb NOT NULL,
	"last_seen_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wow_cache_playable_specializations" (
	"region" text NOT NULL,
	"battlenet_id" integer NOT NULL,
	"specialization_type" text NOT NULL,
	"name" text NOT NULL,
	"payload" jsonb NOT NULL,
	"last_seen_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wow_cache_professions" (
	"region" text NOT NULL,
	"battlenet_id" integer NOT NULL,
	"name" text NOT NULL,
	"payload" jsonb NOT NULL,
	"last_seen_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wow_cache_realms" (
	"region" text NOT NULL,
	"battlenet_id" integer NOT NULL,
	"connected_realm_id" integer,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"locale" text,
	"timezone" text,
	"realm_type" text,
	"is_tournament" boolean,
	"payload" jsonb NOT NULL,
	"last_seen_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "wow_cache_connected_realms_uidx" ON "wow_cache_connected_realms" USING btree ("region","battlenet_id");--> statement-breakpoint
CREATE INDEX "wow_cache_connected_realms_region_idx" ON "wow_cache_connected_realms" USING btree ("region");--> statement-breakpoint
CREATE UNIQUE INDEX "wow_cache_playable_classes_uidx" ON "wow_cache_playable_classes" USING btree ("region","battlenet_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wow_cache_playable_races_uidx" ON "wow_cache_playable_races" USING btree ("region","battlenet_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wow_cache_playable_specs_uidx" ON "wow_cache_playable_specializations" USING btree ("region","battlenet_id","specialization_type");--> statement-breakpoint
CREATE UNIQUE INDEX "wow_cache_professions_uidx" ON "wow_cache_professions" USING btree ("region","battlenet_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wow_cache_realms_uidx" ON "wow_cache_realms" USING btree ("region","battlenet_id");--> statement-breakpoint
CREATE INDEX "wow_cache_realms_slug_idx" ON "wow_cache_realms" USING btree ("region","slug");--> statement-breakpoint
CREATE INDEX "wow_cache_realms_connected_realm_idx" ON "wow_cache_realms" USING btree ("region","connected_realm_id");