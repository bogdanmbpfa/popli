CREATE SCHEMA "qr_code_management";
--> statement-breakpoint
CREATE TYPE "public"."qr_code_data_type" AS ENUM('text', 'url', 'email', 'phone');--> statement-breakpoint
CREATE TABLE "qr_code_management"."qr_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"image_url" varchar(255),
	"data_type" "qr_code_data_type" NOT NULL,
	"options" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "qr_codes_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "qr_code_management"."qr_code_scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"qr_code_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"ip_address" varchar(40) NOT NULL,
	"country" varchar(255) NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"user_agent" varchar(255) NOT NULL,
	"device_type" varchar(255),
	"browser" varchar(255),
	"os" varchar(255),
	"referrer" text,
	"scanned_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "qr_code_scans_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_qr_codes_id" ON "qr_code_management"."qr_codes" USING btree ("id");--> statement-breakpoint
CREATE INDEX "idx_qr_codes_user_id" ON "qr_code_management"."qr_codes" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_qr_code_scans_id" ON "qr_code_management"."qr_code_scans" USING btree ("id");--> statement-breakpoint
CREATE INDEX "idx_qr_code_scans_qr_code_id" ON "qr_code_management"."qr_code_scans" USING btree ("qr_code_id");--> statement-breakpoint
CREATE INDEX "idx_qr_code_scans_user_id" ON "qr_code_management"."qr_code_scans" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_qr_code_scans_country" ON "qr_code_management"."qr_code_scans" USING btree ("country");--> statement-breakpoint
CREATE INDEX "idx_qr_code_scans_device_type" ON "qr_code_management"."qr_code_scans" USING btree ("device_type");--> statement-breakpoint
CREATE INDEX "idx_qr_code_scans_browser" ON "qr_code_management"."qr_code_scans" USING btree ("browser");--> statement-breakpoint
CREATE INDEX "idx_qr_code_scans_os" ON "qr_code_management"."qr_code_scans" USING btree ("os");--> statement-breakpoint
CREATE INDEX "idx_qr_code_scans_referrer" ON "qr_code_management"."qr_code_scans" USING btree ("referrer");--> statement-breakpoint
CREATE INDEX "idx_qr_code_scans_scanned_at" ON "qr_code_management"."qr_code_scans" USING btree ("scanned_at");