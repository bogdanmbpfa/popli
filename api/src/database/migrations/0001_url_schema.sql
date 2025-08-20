CREATE SCHEMA "url_management";
--> statement-breakpoint
CREATE TABLE "url_management"."short_url_clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"short_url_id" uuid NOT NULL,
	"ip_address" varchar(40) NOT NULL,
	"country" varchar(255) NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"user_agent" varchar(255) NOT NULL,
	"device_type" varchar(255),
	"browser" varchar(255),
	"os" varchar(255),
	"referrer" text,
	"clicked_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "short_url_clicks_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "url_management"."short_urls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"url" varchar(255) NOT NULL,
	"short_code" varchar(16) NOT NULL,
	"alias" varchar(255),
	"title" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "short_urls_id_unique" UNIQUE("id"),
	CONSTRAINT "short_urls_short_code_unique" UNIQUE("short_code"),
	CONSTRAINT "short_urls_alias_unique" UNIQUE("alias")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_short_url_clicks_id" ON "url_management"."short_url_clicks" USING btree ("id");--> statement-breakpoint
CREATE INDEX "idx_short_url_clicks_short_url_id" ON "url_management"."short_url_clicks" USING btree ("short_url_id");--> statement-breakpoint
CREATE INDEX "idx_short_url_clicks_country" ON "url_management"."short_url_clicks" USING btree ("country");--> statement-breakpoint
CREATE INDEX "idx_short_url_clicks_device_type" ON "url_management"."short_url_clicks" USING btree ("device_type");--> statement-breakpoint
CREATE INDEX "idx_short_url_clicks_browser" ON "url_management"."short_url_clicks" USING btree ("browser");--> statement-breakpoint
CREATE INDEX "idx_short_url_clicks_os" ON "url_management"."short_url_clicks" USING btree ("os");--> statement-breakpoint
CREATE INDEX "idx_short_url_clicks_referrer" ON "url_management"."short_url_clicks" USING btree ("referrer");--> statement-breakpoint
CREATE INDEX "idx_short_url_clicks_clicked_at" ON "url_management"."short_url_clicks" USING btree ("clicked_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_short_urls_id" ON "url_management"."short_urls" USING btree ("id");--> statement-breakpoint
CREATE INDEX "idx_short_urls_user_id" ON "url_management"."short_urls" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_short_urls_short_code" ON "url_management"."short_urls" USING btree ("short_code");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_short_urls_alias" ON "url_management"."short_urls" USING btree ("alias");