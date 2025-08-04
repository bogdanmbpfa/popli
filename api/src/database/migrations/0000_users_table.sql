CREATE SCHEMA "user_management";
--> statement-breakpoint
CREATE TABLE "user_management"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"handle" varchar(40) NOT NULL,
	"profile_image" varchar(40),
	"cover_image" varchar(40),
	"bio" text,
	"email_confirmation_code" varchar(6),
	"email_confirmation_code_expires_at" timestamp,
	"email_confirmed_at" timestamp,
	"password_reset_code" varchar(6),
	"password_reset_code_expires_at" timestamp,
	"jwt_secret" varchar(40) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_password_unique" UNIQUE("password"),
	CONSTRAINT "users_handle_unique" UNIQUE("handle"),
	CONSTRAINT "users_email_confirmation_code_unique" UNIQUE("email_confirmation_code"),
	CONSTRAINT "users_password_reset_code_unique" UNIQUE("password_reset_code"),
	CONSTRAINT "users_jwt_secret_unique" UNIQUE("jwt_secret")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_email" ON "user_management"."users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_handle" ON "user_management"."users" USING btree ("handle");