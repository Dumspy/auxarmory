ALTER TABLE "wow_character_dashboard" RENAME TO "wow_character_snapshots";--> statement-breakpoint
ALTER TABLE "wow_character_snapshots" DROP CONSTRAINT "wow_character_dashboard_character_id_wow_characters_id_fk";
--> statement-breakpoint
DROP INDEX "wow_character_dashboard_snapshot_idx";--> statement-breakpoint
ALTER TABLE "wow_character_snapshots" ADD CONSTRAINT "wow_character_snapshots_character_id_wow_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."wow_characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "wow_character_snapshots_snapshot_idx" ON "wow_character_snapshots" USING btree ("snapshot_at");