CREATE TABLE "wow_character_dashboard" (
	"character_id" text PRIMARY KEY NOT NULL,
	"equipped_item_level" integer,
	"active_spec_id" integer,
	"active_spec_name" text,
	"avatar_url" text,
	"last_login_at" timestamp,
	"mythic_rating" integer,
	"mythic_rating_color" text,
	"raid_progress" jsonb,
	"pvp_summary" jsonb,
	"weekly_vault" jsonb,
	"conquest" jsonb,
	"snapshot_at" timestamp NOT NULL,
	"payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wow_characters" (
	"id" text PRIMARY KEY NOT NULL,
	"region" text NOT NULL,
	"battlenet_character_id" integer NOT NULL,
	"realm_id" integer NOT NULL,
	"realm_slug" text NOT NULL,
	"name" text NOT NULL,
	"class_id" integer,
	"class_name" text,
	"race_id" integer,
	"race_name" text,
	"active_spec_id" integer,
	"active_spec_name" text,
	"level" integer,
	"guild_id" text,
	"avatar_url" text,
	"last_login_at" timestamp,
	"last_seen_at" timestamp NOT NULL,
	"last_profile_sync_at" timestamp,
	"summary_payload" jsonb,
	"profile_payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wow_guilds" (
	"id" text PRIMARY KEY NOT NULL,
	"region" text NOT NULL,
	"battlenet_guild_id" integer NOT NULL,
	"realm_id" integer NOT NULL,
	"realm_slug" text NOT NULL,
	"name" text NOT NULL,
	"name_slug" text,
	"faction_type" text,
	"member_count" integer,
	"achievement_points" integer,
	"crest_payload" jsonb,
	"summary_payload" jsonb,
	"last_seen_at" timestamp NOT NULL,
	"last_profile_sync_at" timestamp,
	"last_roster_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wow_profile_account_characters" (
	"id" text PRIMARY KEY NOT NULL,
	"wow_profile_account_id" text NOT NULL,
	"character_id" text NOT NULL,
	"wow_account_id" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"first_seen_at" timestamp NOT NULL,
	"last_seen_at" timestamp NOT NULL,
	"last_ownership_sync_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wow_profile_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"auth_account_id" text NOT NULL,
	"user_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"region" text NOT NULL,
	"battlenet_account_id" text,
	"profile_id" integer,
	"battletag" text,
	"status" text DEFAULT 'active' NOT NULL,
	"last_discovered_at" timestamp NOT NULL,
	"last_synced_at" timestamp,
	"last_successful_sync_at" timestamp,
	"last_error_at" timestamp,
	"last_error_message" text,
	"summary_payload" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wow_user_character_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"character_id" text NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wow_character_dashboard" ADD CONSTRAINT "wow_character_dashboard_character_id_wow_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."wow_characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wow_characters" ADD CONSTRAINT "wow_characters_guild_id_wow_guilds_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."wow_guilds"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wow_profile_account_characters" ADD CONSTRAINT "wow_profile_account_characters_wow_profile_account_id_wow_profile_accounts_id_fk" FOREIGN KEY ("wow_profile_account_id") REFERENCES "public"."wow_profile_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wow_profile_account_characters" ADD CONSTRAINT "wow_profile_account_characters_character_id_wow_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."wow_characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wow_user_character_preferences" ADD CONSTRAINT "wow_user_character_preferences_character_id_wow_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."wow_characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "wow_character_dashboard_snapshot_idx" ON "wow_character_dashboard" USING btree ("snapshot_at");--> statement-breakpoint
CREATE UNIQUE INDEX "wow_characters_region_battlenet_uidx" ON "wow_characters" USING btree ("region","battlenet_character_id");--> statement-breakpoint
CREATE INDEX "wow_characters_realm_name_idx" ON "wow_characters" USING btree ("region","realm_slug","name");--> statement-breakpoint
CREATE INDEX "wow_characters_guild_idx" ON "wow_characters" USING btree ("guild_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wow_guilds_region_battlenet_uidx" ON "wow_guilds" USING btree ("region","battlenet_guild_id");--> statement-breakpoint
CREATE INDEX "wow_guilds_realm_idx" ON "wow_guilds" USING btree ("region","realm_slug");--> statement-breakpoint
CREATE INDEX "wow_guilds_name_slug_idx" ON "wow_guilds" USING btree ("region","name_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "wow_profile_account_characters_uidx" ON "wow_profile_account_characters" USING btree ("wow_profile_account_id","character_id");--> statement-breakpoint
CREATE INDEX "wow_profile_account_characters_account_idx" ON "wow_profile_account_characters" USING btree ("wow_profile_account_id","is_active");--> statement-breakpoint
CREATE INDEX "wow_profile_account_characters_character_idx" ON "wow_profile_account_characters" USING btree ("character_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wow_profile_accounts_auth_account_uidx" ON "wow_profile_accounts" USING btree ("auth_account_id");--> statement-breakpoint
CREATE INDEX "wow_profile_accounts_user_idx" ON "wow_profile_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wow_profile_accounts_region_idx" ON "wow_profile_accounts" USING btree ("region");--> statement-breakpoint
CREATE INDEX "wow_profile_accounts_status_idx" ON "wow_profile_accounts" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "wow_user_character_preferences_uidx" ON "wow_user_character_preferences" USING btree ("user_id","character_id");--> statement-breakpoint
CREATE INDEX "wow_user_character_preferences_user_idx" ON "wow_user_character_preferences" USING btree ("user_id");