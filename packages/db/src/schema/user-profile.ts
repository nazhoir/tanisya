import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./base";

/**
 * Profil customer provider.
 * Linked ke user, bukan ke organization.
 */
export const userProfile = pgTable(
	"user_profile",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),

		providerCode: text("provider_code").default("rdash").notNull(),
		externalCustomerId: integer("external_customer_id"),

		organizationName: text("organization_name").notNull(),
		street1: text("street_1").notNull(),
		street2: text("street_2"),
		city: text("city").notNull(),
		state: text("state").notNull(),
		countryCode: text("country_code").notNull(),
		postalCode: text("postal_code").notNull(),
		voice: text("voice").notNull(),
		fax: text("fax"),

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
		uniqueIndex("user_profile_user_uidx").on(table.userId),
		uniqueIndex("user_profile_provider_external_uidx").on(
			table.providerCode,
			table.externalCustomerId,
		),
		index("user_profile_city_idx").on(table.city),
		index("user_profile_voice_idx").on(table.voice),
	],
);

/**
 * Contact provider hasil create/update contact.
 * externalContactId wajib integer sesuai swagger provider.
 */
export const customerContact = pgTable(
	"customer_contact",
	{
		id: text("id").primaryKey(),
		userProfileId: text("user_profile_id")
			.notNull()
			.references(() => userProfile.id, { onDelete: "cascade" }),

		providerCode: text("provider_code").default("rdash").notNull(),
		externalContactId: integer("external_contact_id").notNull(),

		label: text("label").notNull(),
		name: text("name").notNull(),
		email: text("email").notNull(),
		organizationName: text("organization_name").notNull(),
		street1: text("street_1").notNull(),
		street2: text("street_2"),
		city: text("city").notNull(),
		state: text("state").notNull(),
		countryCode: text("country_code").notNull(),
		postalCode: text("postal_code").notNull(),
		voice: text("voice").notNull(),
		fax: text("fax"),
		reference: text("reference"),

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
		uniqueIndex("customer_contact_provider_external_uidx").on(
			table.providerCode,
			table.externalContactId,
		),
		index("customer_contact_profile_idx").on(table.userProfileId),
		index("customer_contact_label_idx").on(table.label),
		index("customer_contact_email_idx").on(table.email),
	],
);

/**
 * Satu user bisa punya banyak paket contact.
 * Contoh:
 * - set-com untuk .com
 * - set-id untuk .id
 *
 * Empat contact id disimpan sebagai integer snapshot
 * karena provider domain memerlukan integer contact id.
 */
export const domainContactSet = pgTable(
	"domain_contact_set",
	{
		id: text("id").primaryKey(),
		userProfileId: text("user_profile_id")
			.notNull()
			.references(() => userProfile.id, { onDelete: "cascade" }),

		code: text("code").notNull(),
		name: text("name").notNull(),
		isDefault: boolean("is_default").default(false).notNull(),
		isActive: boolean("is_active").default(true).notNull(),

		adminContactId: integer("admin_contact_id").notNull(),
		techContactId: integer("tech_contact_id").notNull(),
		billingContactId: integer("billing_contact_id").notNull(),
		registrantContactId: integer("registrant_contact_id").notNull(),

		notes: text("notes"),
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
		uniqueIndex("domain_contact_set_profile_code_uidx").on(
			table.userProfileId,
			table.code,
		),
		index("domain_contact_set_profile_idx").on(table.userProfileId),
		index("domain_contact_set_active_idx").on(table.isActive),
	],
);
