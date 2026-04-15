import {
	bigint,
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

/**
 * Produk yang dijual.
 * Pembelian produk selalu menggunakan points.
 */
export const product = pgTable(
	"product",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),

		/**
		 * domain, ssl, object-storage, other
		 */
		type: text("type").notNull(),
		code: text("code").notNull(),
		name: text("name").notNull(),
		description: text("description"),
		isActive: boolean("is_active").default(true).notNull(),

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
		uniqueIndex("product_org_code_uidx").on(table.organizationId, table.code),
		index("product_org_idx").on(table.organizationId),
		index("product_type_idx").on(table.type),
	],
);

/**
 * Harga produk domain hasil sinkronisasi provider.
 *
 * Penyesuaian teknis:
 * - priceType: membedakan registration / renewal / transfer / redemption / proxy
 * - period: memakai 0 untuk harga non-period agar upsert unik stabil
 * - registryId dan domainExtensionId: helper mapping dari payload provider
 *
 * metadata menyimpan snapshot tambahan dari provider bila diperlukan.
 */
export const productPrice = pgTable(
	"product_price",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),

		productId: text("product_id")
			.notNull()
			.references(() => product.id, { onDelete: "cascade" }),

		domainSourceAccountId: text("domain_source_account_id").references(
			() => domainSourceAccount.id,
			{ onDelete: "set null" },
		),
		domainTldPolicyId: text("domain_tld_policy_id").references(
			() => domainTldPolicy.id,
			{ onDelete: "set null" },
		),

		providerCode: text("provider_code").default("rdash").notNull(),
		externalPriceId: integer("external_price_id"),

		/**
		 * helper mapping dari payload provider
		 */
		registryId: integer("registry_id"),
		domainExtensionId: integer("domain_extension_id"),

		/**
		 * registration, renewal, transfer, redemption, proxy
		 */
		priceType: text("price_type").notNull(),

		/**
		 * domain specific
		 */
		extension: text("extension").notNull(),

		/**
		 * 1..10 untuk harga period-based
		 * 0 untuk transfer/redemption/proxy
		 */
		period: integer("period").default(0).notNull(),

		isPromo: boolean("is_promo").default(false).notNull(),
		isActive: boolean("is_active").default(true).notNull(),

		priceAmount: bigint("price_amount", { mode: "number" }).notNull(),
		pricePoints: bigint("price_points", { mode: "number" }).notNull(),
		currency: text("currency").default("IDR").notNull(),

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
		uniqueIndex("product_price_sync_variant_uidx").on(
			table.organizationId,
			table.productId,
			table.domainSourceAccountId,
			table.providerCode,
			table.externalPriceId,
			table.priceType,
			table.period,
			table.isPromo,
		),
		index("product_price_org_idx").on(table.organizationId),
		index("product_price_product_idx").on(table.productId),
		index("product_price_source_idx").on(table.domainSourceAccountId),
		index("product_price_policy_idx").on(table.domainTldPolicyId),
		index("product_price_extension_idx").on(table.extension),
		index("product_price_type_idx").on(table.priceType),
		index("product_price_registry_idx").on(table.registryId),
		index("product_price_domain_extension_id_idx").on(table.domainExtensionId),
	],
);