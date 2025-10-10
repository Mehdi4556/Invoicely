CREATE TABLE "invoice_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"item_name" varchar(255) NOT NULL,
	"description" text,
	"quantity" integer NOT NULL,
	"price" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clients" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "clients" CASCADE;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_client_id_clients_id_fk";
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "company_logo" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "company_name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "company_address" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "client_name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "client_address" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "currency" varchar(10) DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "theme" varchar(10) DEFAULT 'light';--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "invoice_prefix" varchar(10);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "serial_number" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "invoice_date" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "payment_terms" varchar(100);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "billing_details" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "label_type_value" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "login" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "gmail" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "number";--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "amount";--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "due_date";--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "client_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_gmail_unique" UNIQUE("gmail");