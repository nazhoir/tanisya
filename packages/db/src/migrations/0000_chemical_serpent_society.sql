CREATE TYPE "public"."content_type" AS ENUM('', '');--> statement-breakpoint
CREATE TYPE "public"."bare_metal_cycle" AS ENUM('monthly', 'quarterly', 'annually');--> statement-breakpoint
CREATE TYPE "public"."bare_metal_state" AS ENUM('on', 'off', 'reset');--> statement-breakpoint
CREATE TYPE "public"."bare_metal_status" AS ENUM('active', 'suspended', 'terminated', 'building', 'rebuilding');--> statement-breakpoint
CREATE TYPE "public"."cart_status" AS ENUM('active', 'converted', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."dcv_method" AS ENUM('dns', 'http', 'https', 'email');--> statement-breakpoint
CREATE TYPE "public"."dns_record_type" AS ENUM('A', 'AAAA', 'MXE', 'MX', 'CNAME', 'SPF');--> statement-breakpoint
CREATE TYPE "public"."document_verification_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."domain_contact_type" AS ENUM('registrant', 'billing', 'admin', 'tech');--> statement-breakpoint
CREATE TYPE "public"."domain_poll_action_status" AS ENUM('pending', 'complete');--> statement-breakpoint
CREATE TYPE "public"."domain_status" AS ENUM('Live', 'Unpaid', 'Pending', 'Expired', 'PendingDeleteRestorable', 'PendingTransfer', 'PendingRestore', 'Suspended', 'Transferred', 'Rejected');--> statement-breakpoint
CREATE TYPE "public"."domain_verification_status" AS ENUM('waiting', 'verifying', 'document_validating', 'active');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'issued', 'paid', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."object_storage_status" AS ENUM('active', 'suspended', 'terminated');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('draft', 'pending_payment', 'awaiting_verification', 'paid', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('bank_transfer', 'stripe', 'midtrans', 'xendit', 'manual');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'waiting_confirmation', 'paid', 'failed', 'expired', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('domain', 'hosting', 'vps', 'digital', 'physical');--> statement-breakpoint
CREATE TYPE "public"."recurring_interval" AS ENUM('once', 'monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."refund_status" AS ENUM('requested', 'approved', 'rejected', 'processed');--> statement-breakpoint
CREATE TYPE "public"."ssl_status" AS ENUM('pending', 'active', 'expired', 'cancelled', 'reissuing');--> statement-breakpoint
CREATE TYPE "public"."supplier_type" AS ENUM('registrar', 'hosting_provider', 'vps_provider', 'distributor', 'manufacturer');--> statement-breakpoint
CREATE TYPE "public"."user_contact_label" AS ENUM('Default', 'Admin', 'Technical', 'Billing', 'Registrant');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "apikey" (
	"id" text PRIMARY KEY NOT NULL,
	"config_id" text DEFAULT 'default' NOT NULL,
	"name" text,
	"start" text,
	"reference_id" text NOT NULL,
	"prefix" text,
	"key" text NOT NULL,
	"refill_interval" integer,
	"refill_amount" integer,
	"last_refill_at" timestamp,
	"enabled" boolean DEFAULT true,
	"rate_limit_enabled" boolean DEFAULT true,
	"rate_limit_time_window" integer DEFAULT 86400000,
	"rate_limit_max" integer DEFAULT 10,
	"request_count" integer DEFAULT 0,
	"remaining" integer,
	"last_request" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"permissions" text,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"metadata" text,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"active_organization_id" text,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "two_factor" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"two_factor_enabled" boolean DEFAULT false,
	"username" text,
	"display_username" text,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "content_type" NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"cover" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "content_content_unique" UNIQUE("content")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_user_id" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bank_account" (
	"id" text PRIMARY KEY NOT NULL,
	"bank_name" text NOT NULL,
	"account_number" text NOT NULL,
	"account_holder" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bare_metal_order" (
	"id" text PRIMARY KEY NOT NULL,
	"order_item_id" text NOT NULL,
	"supplier_id" text NOT NULL,
	"provider_bare_metal_order_id" integer,
	"customer_id" integer NOT NULL,
	"bare_metal_product_id" integer NOT NULL,
	"name" text NOT NULL,
	"os" text NOT NULL,
	"cycle" "bare_metal_cycle" NOT NULL,
	"keypair" text NOT NULL,
	"status" "bare_metal_status" DEFAULT 'building' NOT NULL,
	"suspend_reason" text,
	"state" "bare_metal_state" NOT NULL,
	"ip_address" text,
	"renewed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_by_user_id" text NOT NULL,
	"status" "cart_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_item" (
	"id" text PRIMARY KEY NOT NULL,
	"cart_id" text NOT NULL,
	"product_id" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" integer NOT NULL,
	"discount_amount" integer NOT NULL,
	"total_amount" integer NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain_contact" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"type" "domain_contact_type" NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"country_code" text NOT NULL,
	"postal_code" text NOT NULL,
	"fax" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain_dns_record" (
	"id" text PRIMARY KEY NOT NULL,
	"domain_registration_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "dns_record_type" NOT NULL,
	"content" text NOT NULL,
	"ttl" integer DEFAULT 3600 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain_dnssec" (
	"id" text PRIMARY KEY NOT NULL,
	"domain_registration_id" text NOT NULL,
	"provider_dnssec_id" integer,
	"key_tag" integer NOT NULL,
	"algorithm" integer NOT NULL,
	"digest_type" integer NOT NULL,
	"digest" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain_document_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"domain_registration_id" text NOT NULL,
	"document_type" text NOT NULL,
	"document_url" text NOT NULL,
	"status" "document_verification_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by_admin_id" text,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain_forwarding" (
	"id" text PRIMARY KEY NOT NULL,
	"domain_registration_id" text NOT NULL,
	"provider_forwarding_id" integer,
	"from" text NOT NULL,
	"to" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain_nameserver" (
	"id" text PRIMARY KEY NOT NULL,
	"domain_registration_id" text NOT NULL,
	"provider_host_id" integer,
	"hostname" text NOT NULL,
	"ip_address" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain_poll" (
	"id" text PRIMARY KEY NOT NULL,
	"domain_registration_id" text,
	"provider_poll_id" integer NOT NULL,
	"action_status" "domain_poll_action_status" NOT NULL,
	"message" text,
	"acknowledged_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain_registration" (
	"id" text PRIMARY KEY NOT NULL,
	"order_item_id" text NOT NULL,
	"supplier_id" text NOT NULL,
	"domain_name" text NOT NULL,
	"tld" text NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"requires_document_verification" boolean DEFAULT false NOT NULL,
	"provider_customer_id" integer NOT NULL,
	"registrant_contact_id" integer,
	"billing_contact_id" integer,
	"admin_contact_id" integer,
	"tech_contact_id" integer,
	"years" integer NOT NULL,
	"name_servers" jsonb NOT NULL,
	"privacy_protection" boolean DEFAULT false NOT NULL,
	"auth_code" text,
	"provider_domain_id" integer,
	"invoice_option" text,
	"extra" jsonb,
	"verification_status" "domain_verification_status" NOT NULL,
	"status" "domain_status" NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"is_registrar_locked" boolean DEFAULT false NOT NULL,
	"dnssec_enabled" boolean DEFAULT false NOT NULL,
	"creation_date" date,
	"expiry_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"invoice_number" text NOT NULL,
	"status" "invoice_status" DEFAULT 'draft' NOT NULL,
	"subtotal" integer NOT NULL,
	"tax_total" integer NOT NULL,
	"discount_total" integer NOT NULL,
	"grand_total" integer NOT NULL,
	"currency" text NOT NULL,
	"due_date" timestamp NOT NULL,
	"issued_at" timestamp,
	"paid_at" timestamp,
	"tax_breakdown" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "object_storage_bucket" (
	"id" text PRIMARY KEY NOT NULL,
	"object_storage_order_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "object_storage_key" (
	"id" text PRIMARY KEY NOT NULL,
	"object_storage_order_id" text NOT NULL,
	"provider_key_id" integer,
	"label" text,
	"access_key" text,
	"secret_key" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "object_storage_order" (
	"id" text PRIMARY KEY NOT NULL,
	"order_item_id" text NOT NULL,
	"supplier_id" text NOT NULL,
	"provider_object_storage_id" integer,
	"customer_id" integer NOT NULL,
	"name" text NOT NULL,
	"size_gb" integer NOT NULL,
	"billing_cycle" integer NOT NULL,
	"status" "object_storage_status" DEFAULT 'active' NOT NULL,
	"suspend_reason" text,
	"renewed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"ordered_by_user_id" text NOT NULL,
	"invoice_id" text NOT NULL,
	"status" "order_status" DEFAULT 'draft' NOT NULL,
	"subtotal" integer NOT NULL,
	"discount_total" integer NOT NULL,
	"tax_total" integer NOT NULL,
	"grand_total" integer NOT NULL,
	"currency" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_item" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text NOT NULL,
	"supplier_id" text NOT NULL,
	"product_name_snapshot" text NOT NULL,
	"product_type_snapshot" "product_type" NOT NULL,
	"supplier_name_snapshot" text NOT NULL,
	"quantity" integer NOT NULL,
	"cost_price_snapshot" integer NOT NULL,
	"unit_price" integer NOT NULL,
	"discount_amount" integer NOT NULL,
	"tax_rate_snapshot" integer NOT NULL,
	"tax_amount" integer NOT NULL,
	"total_amount" integer NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"invoice_id" text NOT NULL,
	"method" "payment_method" NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"amount" integer NOT NULL,
	"currency" text NOT NULL,
	"external_reference" text,
	"gateway_response" jsonb,
	"paid_at" timestamp,
	"verified_by_admin_id" text,
	"verified_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" text PRIMARY KEY NOT NULL,
	"supplier_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" "product_type" NOT NULL,
	"description" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"requires_verification" boolean DEFAULT false NOT NULL,
	"stock" integer,
	"tax_category_id" text NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_price" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"cost_price" integer NOT NULL,
	"base_price" integer NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"recurring_interval" "recurring_interval" NOT NULL,
	"is_promo" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_tax_category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refund" (
	"id" text PRIMARY KEY NOT NULL,
	"payment_id" text NOT NULL,
	"amount" integer NOT NULL,
	"reason" text NOT NULL,
	"status" "refund_status" DEFAULT 'requested' NOT NULL,
	"processed_by_admin_id" text,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ssl_order" (
	"id" text PRIMARY KEY NOT NULL,
	"order_item_id" text NOT NULL,
	"supplier_id" text NOT NULL,
	"provider_ssl_order_id" integer,
	"ssl_product_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"domain" text NOT NULL,
	"period" integer NOT NULL,
	"dcv_method" "dcv_method" NOT NULL,
	"dcv_email" text,
	"csr_code" text NOT NULL,
	"status" "ssl_status" DEFAULT 'pending' NOT NULL,
	"certificate_issued_at" timestamp,
	"certificate_expires_at" timestamp,
	"download_url" text,
	"admin_contact" jsonb NOT NULL,
	"tech_contact" jsonb NOT NULL,
	"org_info" jsonb,
	"gateway_response" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "supplier_type" NOT NULL,
	"contact_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text NOT NULL,
	"website" text NOT NULL,
	"metadata" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tax_rate" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"rate" integer NOT NULL,
	"country_code" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_contact" (
	"id" text PRIMARY KEY NOT NULL,
	"external_id" integer NOT NULL,
	"contact_id" text NOT NULL,
	"user_id" text NOT NULL,
	"label" "user_contact_label" NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"organization" text NOT NULL,
	"street1" text NOT NULL,
	"street2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"country_code" text NOT NULL,
	"postal_code" text NOT NULL,
	"voice" text NOT NULL,
	"fax" text,
	"reference" text,
	"status" integer NOT NULL,
	"status_label" text NOT NULL,
	"pending_change" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whois_protection" (
	"id" text PRIMARY KEY NOT NULL,
	"domain_registration_id" text NOT NULL,
	"is_purchased" boolean DEFAULT false NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"purchased_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "whois_protection_domain_registration_id_unique" UNIQUE("domain_registration_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content" ADD CONSTRAINT "content_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bare_metal_order" ADD CONSTRAINT "bare_metal_order_order_item_id_order_item_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_item"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bare_metal_order" ADD CONSTRAINT "bare_metal_order_supplier_id_supplier_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_cart_id_cart_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."cart"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_contact" ADD CONSTRAINT "domain_contact_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_dns_record" ADD CONSTRAINT "domain_dns_record_domain_registration_id_domain_registration_id_fk" FOREIGN KEY ("domain_registration_id") REFERENCES "public"."domain_registration"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_dnssec" ADD CONSTRAINT "domain_dnssec_domain_registration_id_domain_registration_id_fk" FOREIGN KEY ("domain_registration_id") REFERENCES "public"."domain_registration"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_document_verification" ADD CONSTRAINT "domain_document_verification_domain_registration_id_domain_registration_id_fk" FOREIGN KEY ("domain_registration_id") REFERENCES "public"."domain_registration"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_forwarding" ADD CONSTRAINT "domain_forwarding_domain_registration_id_domain_registration_id_fk" FOREIGN KEY ("domain_registration_id") REFERENCES "public"."domain_registration"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_nameserver" ADD CONSTRAINT "domain_nameserver_domain_registration_id_domain_registration_id_fk" FOREIGN KEY ("domain_registration_id") REFERENCES "public"."domain_registration"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_poll" ADD CONSTRAINT "domain_poll_domain_registration_id_domain_registration_id_fk" FOREIGN KEY ("domain_registration_id") REFERENCES "public"."domain_registration"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_registration" ADD CONSTRAINT "domain_registration_order_item_id_order_item_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_registration" ADD CONSTRAINT "domain_registration_supplier_id_supplier_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "object_storage_bucket" ADD CONSTRAINT "object_storage_bucket_object_storage_order_id_object_storage_order_id_fk" FOREIGN KEY ("object_storage_order_id") REFERENCES "public"."object_storage_order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "object_storage_key" ADD CONSTRAINT "object_storage_key_object_storage_order_id_object_storage_order_id_fk" FOREIGN KEY ("object_storage_order_id") REFERENCES "public"."object_storage_order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "object_storage_order" ADD CONSTRAINT "object_storage_order_order_item_id_order_item_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_item"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "object_storage_order" ADD CONSTRAINT "object_storage_order_supplier_id_supplier_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_ordered_by_user_id_user_id_fk" FOREIGN KEY ("ordered_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_supplier_id_supplier_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_supplier_id_supplier_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_tax_category_id_product_tax_category_id_fk" FOREIGN KEY ("tax_category_id") REFERENCES "public"."product_tax_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_price" ADD CONSTRAINT "product_price_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refund" ADD CONSTRAINT "refund_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ssl_order" ADD CONSTRAINT "ssl_order_order_item_id_order_item_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_item"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ssl_order" ADD CONSTRAINT "ssl_order_supplier_id_supplier_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_contact" ADD CONSTRAINT "user_contact_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whois_protection" ADD CONSTRAINT "whois_protection_domain_registration_id_domain_registration_id_fk" FOREIGN KEY ("domain_registration_id") REFERENCES "public"."domain_registration"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "apikey_configId_idx" ON "apikey" USING btree ("config_id");--> statement-breakpoint
CREATE INDEX "apikey_referenceId_idx" ON "apikey" USING btree ("reference_id");--> statement-breakpoint
CREATE INDEX "apikey_key_idx" ON "apikey" USING btree ("key");--> statement-breakpoint
CREATE INDEX "invitation_organizationId_idx" ON "invitation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" USING btree ("email");--> statement-breakpoint
CREATE INDEX "member_organizationId_idx" ON "member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_userId_idx" ON "member" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_slug_uidx" ON "organization" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "twoFactor_secret_idx" ON "two_factor" USING btree ("secret");--> statement-breakpoint
CREATE INDEX "twoFactor_userId_idx" ON "two_factor" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "audit_log_actorUserId_idx" ON "audit_log" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "audit_log_entityType_idx" ON "audit_log" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "audit_log_entityId_idx" ON "audit_log" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "bare_metal_order_orderItemId_idx" ON "bare_metal_order" USING btree ("order_item_id");--> statement-breakpoint
CREATE INDEX "bare_metal_order_providerBareMetalOrderId_idx" ON "bare_metal_order" USING btree ("provider_bare_metal_order_id");--> statement-breakpoint
CREATE INDEX "bare_metal_order_status_idx" ON "bare_metal_order" USING btree ("status");--> statement-breakpoint
CREATE INDEX "domain_dns_record_domainRegistrationId_idx" ON "domain_dns_record" USING btree ("domain_registration_id");--> statement-breakpoint
CREATE INDEX "domain_dns_record_type_idx" ON "domain_dns_record" USING btree ("type");--> statement-breakpoint
CREATE INDEX "domain_dnssec_domainRegistrationId_idx" ON "domain_dnssec" USING btree ("domain_registration_id");--> statement-breakpoint
CREATE INDEX "domain_doc_verification_status_idx" ON "domain_document_verification" USING btree ("status");--> statement-breakpoint
CREATE INDEX "domain_doc_verification_domainRegistrationId_idx" ON "domain_document_verification" USING btree ("domain_registration_id");--> statement-breakpoint
CREATE INDEX "domain_forwarding_domainRegistrationId_idx" ON "domain_forwarding" USING btree ("domain_registration_id");--> statement-breakpoint
CREATE INDEX "domain_nameserver_domainRegistrationId_idx" ON "domain_nameserver" USING btree ("domain_registration_id");--> statement-breakpoint
CREATE INDEX "domain_poll_actionStatus_idx" ON "domain_poll" USING btree ("action_status");--> statement-breakpoint
CREATE UNIQUE INDEX "domain_poll_providerPollId_uidx" ON "domain_poll" USING btree ("provider_poll_id");--> statement-breakpoint
CREATE UNIQUE INDEX "domain_registration_domainName_uidx" ON "domain_registration" USING btree ("domain_name");--> statement-breakpoint
CREATE INDEX "domain_registration_expiryDate_idx" ON "domain_registration" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "domain_registration_status_idx" ON "domain_registration" USING btree ("status");--> statement-breakpoint
CREATE INDEX "domain_registration_supplierId_idx" ON "domain_registration" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "domain_registration_verificationStatus_idx" ON "domain_registration" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "domain_registration_providerDomainId_idx" ON "domain_registration" USING btree ("provider_domain_id");--> statement-breakpoint
CREATE INDEX "invoice_organizationId_idx" ON "invoice" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invoice_invoiceNumber_uidx" ON "invoice" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "invoice_status_idx" ON "invoice" USING btree ("status");--> statement-breakpoint
CREATE INDEX "object_storage_bucket_objectStorageOrderId_idx" ON "object_storage_bucket" USING btree ("object_storage_order_id");--> statement-breakpoint
CREATE INDEX "object_storage_key_objectStorageOrderId_idx" ON "object_storage_key" USING btree ("object_storage_order_id");--> statement-breakpoint
CREATE INDEX "object_storage_order_orderItemId_idx" ON "object_storage_order" USING btree ("order_item_id");--> statement-breakpoint
CREATE INDEX "object_storage_order_providerObjectStorageId_idx" ON "object_storage_order" USING btree ("provider_object_storage_id");--> statement-breakpoint
CREATE INDEX "object_storage_order_status_idx" ON "object_storage_order" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_organizationId_idx" ON "order" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "order_status_idx" ON "order" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_createdAt_idx" ON "order" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "order_item_orderId_idx" ON "order_item" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payment_organizationId_idx" ON "payment" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "payment_status_idx" ON "payment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payment_externalReference_idx" ON "payment" USING btree ("external_reference");--> statement-breakpoint
CREATE UNIQUE INDEX "product_slug_uidx" ON "product" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "product_supplierId_idx" ON "product" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "product_type_idx" ON "product" USING btree ("type");--> statement-breakpoint
CREATE INDEX "product_isActive_idx" ON "product" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "product_price_productId_idx" ON "product_price" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_price_recurringInterval_idx" ON "product_price" USING btree ("recurring_interval");--> statement-breakpoint
CREATE INDEX "product_price_isPromo_idx" ON "product_price" USING btree ("is_promo");--> statement-breakpoint
CREATE INDEX "ssl_order_orderItemId_idx" ON "ssl_order" USING btree ("order_item_id");--> statement-breakpoint
CREATE INDEX "ssl_order_providerSslOrderId_idx" ON "ssl_order" USING btree ("provider_ssl_order_id");--> statement-breakpoint
CREATE INDEX "ssl_order_status_idx" ON "ssl_order" USING btree ("status");--> statement-breakpoint
CREATE INDEX "supplier_type_idx" ON "supplier" USING btree ("type");--> statement-breakpoint
CREATE INDEX "supplier_isActive_idx" ON "supplier" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "tax_rate_countryCode_idx" ON "tax_rate" USING btree ("country_code");--> statement-breakpoint
CREATE INDEX "tax_rate_isActive_idx" ON "tax_rate" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "user_contact_userId_idx" ON "user_contact" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_contact_contactId_uidx" ON "user_contact" USING btree ("contact_id");