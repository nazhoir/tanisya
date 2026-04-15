import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { organization, user } from "./base";
import { domainSourceAccount, domainTldPolicy } from "./domain-routing";
import { domainContactSet } from "./user-profile";
import { productOrderItem } from "./orders";

/**
 * Payload domain saat order dibuat.
 * Snapshot final semua contact ID provider disimpan sebagai integer.
 */
export const domainOrderItem = pgTable(
	"domain_order_item",
	{
		id: text("id").primaryKey(),
		productOrderItemId: text("product_order_item_id")
			.notNull()
			.references(() => productOrderItem.id, { onDelete: "cascade" }),

		customerUserId: text("customer_user_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),

		domainSourceAccountId: text("domain_source_account_id")
			.notNull()
			.references(() => domainSourceAccount.id, { onDelete: "restrict" }),

		domainTldPolicyId: text("domain_tld_policy_id").references(
			() => domainTldPolicy.id,
			{ onDelete: "set null" },
		),
		domainContactSetId: text("domain_contact_set_id").references(
			() => domainContactSet.id,
			{ onDelete: "set null" },
		),

		operation: text("operation").notNull(),
		domainName: text("domain_name").notNull(),
		tld: text("tld").notNull(),
		period: integer("period").notNull(),
		authCode: text("auth_code"),

		buyWhoisProtection: boolean("buy_whois_protection")
			.default(false)
			.notNull(),
		includePremiumDomains: boolean("include_premium_domains")
			.default(false)
			.notNull(),

		adminContactId: integer("admin_contact_id").notNull(),
		techContactId: integer("tech_contact_id").notNull(),
		billingContactId: integer("billing_contact_id").notNull(),
		registrantContactId: integer("registrant_contact_id").notNull(),

		metadata: text("metadata"),

		actorUserId: text("actor_user_id").references(() => user.id, {
			onDelete: "set null",
		}),

		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex("domain_order_item_order_item_uidx").on(table.productOrderItemId),
		index("domain_order_item_customer_idx").on(table.customerUserId),
		index("domain_order_item_source_idx").on(table.domainSourceAccountId),
		index("domain_order_item_policy_idx").on(table.domainTldPolicyId),
		index("domain_order_item_contact_set_idx").on(table.domainContactSetId),
		index("domain_order_item_name_idx").on(table.domainName),
		index("domain_order_item_tld_idx").on(table.tld),
	],
);

export const domainOrderItemNameserver = pgTable(
	"domain_order_item_nameserver",
	{
		id: text("id").primaryKey(),
		domainOrderItemId: text("domain_order_item_id")
			.notNull()
			.references(() => domainOrderItem.id, { onDelete: "cascade" }),

		position: integer("position").notNull(),
		host: text("host").notNull(),

		actorUserId: text("actor_user_id").references(() => user.id, {
			onDelete: "set null",
		}),

		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex("domain_order_item_nameserver_uidx").on(
			table.domainOrderItemId,
			table.position,
		),
		index("domain_order_item_nameserver_item_idx").on(table.domainOrderItemId),
	],
);

/**
 * Domain aktif yang berhasil dibuat pada provider.
 * Empat contact ID provider tetap disimpan sebagai integer final snapshot.
 */
export const domain = pgTable(
	"domain",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),

		customerUserId: text("customer_user_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),

		domainSourceAccountId: text("domain_source_account_id")
			.notNull()
			.references(() => domainSourceAccount.id, { onDelete: "restrict" }),

		domainTldPolicyId: text("domain_tld_policy_id").references(
			() => domainTldPolicy.id,
			{ onDelete: "set null" },
		),
		domainContactSetId: text("domain_contact_set_id").references(
			() => domainContactSet.id,
			{ onDelete: "set null" },
		),

		providerCode: text("provider_code").default("rdash").notNull(),
		externalDomainId: integer("external_domain_id"),

		name: text("name").notNull(),
		tld: text("tld").notNull(),

		operation: text("operation").default("register").notNull(),
		period: integer("period").default(1).notNull(),
		authCode: text("auth_code"),

		adminContactId: integer("admin_contact_id").notNull(),
		techContactId: integer("tech_contact_id").notNull(),
		billingContactId: integer("billing_contact_id").notNull(),
		registrantContactId: integer("registrant_contact_id").notNull(),

		/**
		 * 0 Pending
		 * 1 Active
		 * 2 Expired
		 * 3 Pending Delete
		 * 4 Deleted
		 * 5 Pending Transfer
		 * 6 Transferred Away
		 * 7 Suspended
		 * 8 Rejected
		 */
		status: integer("status").default(0).notNull(),

		/**
		 * 0 Waiting
		 * 1 Verifying
		 * 2 Document Validating
		 * 3 Active
		 */
		verificationStatus: integer("verification_status").default(0).notNull(),
		requiredDocument: integer("required_document").default(0).notNull(),

		buyWhoisProtection: boolean("buy_whois_protection")
			.default(false)
			.notNull(),
		includePremiumDomains: boolean("include_premium_domains")
			.default(false)
			.notNull(),

		registeredAt: timestamp("registered_at"),
		expiredAt: timestamp("expired_at"),

		metadata: text("metadata"),

		actorUserId: text("actor_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		updatedByUserId: text("updated_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),

		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex("domain_org_name_uidx").on(table.organizationId, table.name),
		uniqueIndex("domain_provider_source_external_uidx").on(
			table.providerCode,
			table.domainSourceAccountId,
			table.externalDomainId,
		),
		index("domain_org_idx").on(table.organizationId),
		index("domain_customer_idx").on(table.customerUserId),
		index("domain_source_idx").on(table.domainSourceAccountId),
		index("domain_policy_idx").on(table.domainTldPolicyId),
		index("domain_contact_set_idx").on(table.domainContactSetId),
		index("domain_tld_idx").on(table.tld),
		index("domain_status_idx").on(table.status),
		index("domain_verification_status_idx").on(table.verificationStatus),
		index("domain_required_document_idx").on(table.requiredDocument),
		index("domain_expired_idx").on(table.expiredAt),
	],
);

export const domainNameserver = pgTable(
	"domain_nameserver",
	{
		id: text("id").primaryKey(),
		domainId: text("domain_id")
			.notNull()
			.references(() => domain.id, { onDelete: "cascade" }),

		position: integer("position").notNull(),
		host: text("host").notNull(),

		actorUserId: text("actor_user_id").references(() => user.id, {
			onDelete: "set null",
		}),

		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex("domain_nameserver_domain_position_uidx").on(
			table.domainId,
			table.position,
		),
		index("domain_nameserver_domain_idx").on(table.domainId),
	],
);

/**
 * File verifikasi domain yang disimpan di object storage.
 * File disimpan dengan key unik namun tetap mudah dilacak.
 * Tabel ini menyimpan metadata file, URL publik, dan status submit ke provider.
 */
export const domainVerificationDocument = pgTable(
	"domain_verification_document",
	{
		id: text("id").primaryKey(),

		domainId: text("domain_id")
			.notNull()
			.references(() => domain.id, { onDelete: "cascade" }),

		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),

		customerUserId: text("customer_user_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),

		providerCode: text("provider_code").default("rdash").notNull(),
		externalDomainId: integer("external_domain_id"),

		documentType: text("document_type").default("verification").notNull(),
		originalFileName: text("original_file_name").notNull(),
		contentType: text("content_type").notNull(),
		sizeBytes: integer("size_bytes").notNull(),
		checksumSha256: text("checksum_sha256"),

		storageProvider: text("storage_provider").default("s3-compatible").notNull(),
		storageBucket: text("storage_bucket"),
		storageKey: text("storage_key").notNull(),
		publicUrl: text("public_url").notNull(),

		/**
		 * uploaded, archived, deleted
		 */
		uploadStatus: text("upload_status").default("uploaded").notNull(),

		/**
		 * pending, ready_for_admin, provider_link_requested,
		 * submitted_to_provider, approved, rejected
		 */
		verificationStatus: text("verification_status")
			.default("pending")
			.notNull(),

		providerUploadLink: text("provider_upload_link"),
		providerDocumentReference: text("provider_document_reference"),
		providerLinkRequestedAt: timestamp("provider_link_requested_at"),
		submittedToProviderAt: timestamp("submitted_to_provider_at"),

		notes: text("notes"),
		metadata: text("metadata"),

		uploadedByUserId: text("uploaded_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		updatedByUserId: text("updated_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),

		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex("domain_verification_document_storage_key_uidx").on(
			table.storageKey,
		),
		uniqueIndex("domain_verification_document_public_url_uidx").on(
			table.publicUrl,
		),
		index("domain_verification_document_domain_idx").on(table.domainId),
		index("domain_verification_document_org_idx").on(table.organizationId),
		index("domain_verification_document_customer_idx").on(
			table.customerUserId,
		),
		index("domain_verification_document_external_domain_idx").on(
			table.externalDomainId,
		),
		index("domain_verification_document_verification_status_idx").on(
			table.verificationStatus,
		),
		index("domain_verification_document_upload_status_idx").on(
			table.uploadStatus,
		),
	],
);
