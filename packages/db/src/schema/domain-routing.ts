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
import { domainContactSet } from "./user-profile";

/**
 * Akun registrar / upstream domain per organization.
 * Contoh:
 * - source-a
 * - source-b
 */
export const domainSourceAccount = pgTable(
	"domain_source_account",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),

		code: text("code").notNull(),
		name: text("name").notNull(),

		providerCode: text("provider_code").default("rdash").notNull(),
		externalAccountId: integer("external_account_id"),

		isDefault: boolean("is_default").default(false).notNull(),
		isActive: boolean("is_active").default(true).notNull(),

		credentials: text("credentials"),
		metadata: text("metadata"),

		createdByUserId: text("created_by_user_id").references(() => user.id, {
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
		uniqueIndex("domain_source_account_org_code_uidx").on(
			table.organizationId,
			table.code,
		),
		index("domain_source_account_org_idx").on(table.organizationId),
		index("domain_source_account_provider_idx").on(table.providerCode),
		index("domain_source_account_active_idx").on(table.isActive),
	],
);

/**
 * Policy per TLD.
 * Contoh:
 * - .com -> source-a + set-com
 * - .id  -> source-b + set-id
 */
export const domainTldPolicy = pgTable(
	"domain_tld_policy",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),

		tld: text("tld").notNull(),

		domainSourceAccountId: text("domain_source_account_id")
			.notNull()
			.references(() => domainSourceAccount.id, { onDelete: "restrict" }),

		defaultDomainContactSetId: text("default_domain_contact_set_id").references(
			() => domainContactSet.id,
			{ onDelete: "set null" },
		),

		isActive: boolean("is_active").default(true).notNull(),
		allowWhoisProtection: boolean("allow_whois_protection")
			.default(true)
			.notNull(),
		allowPremiumDomains: boolean("allow_premium_domains")
			.default(false)
			.notNull(),

		metadata: text("metadata"),

		createdByUserId: text("created_by_user_id").references(() => user.id, {
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
		uniqueIndex("domain_tld_policy_org_tld_uidx").on(
			table.organizationId,
			table.tld,
		),
		index("domain_tld_policy_org_idx").on(table.organizationId),
		index("domain_tld_policy_source_idx").on(table.domainSourceAccountId),
		index("domain_tld_policy_contact_set_idx").on(
			table.defaultDomainContactSetId,
		),
	],
);
