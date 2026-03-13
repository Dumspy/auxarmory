CREATE TABLE "battlenet_resp_sink" (
	"id" text PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "battlenet_resp_sink_created_idx" ON "battlenet_resp_sink" USING btree ("created_at");
