import {
	boolean,
	index,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { bigint } from "drizzle-orm/pg-core";
import { organization, user } from "./base";

/**
 * Payment gateway hanya untuk top up points.
 */
export const paymentGateway = pgTable(
	"payment_gateway",
	{
		id: text("id").primaryKey(),
		code: text("code").notNull(),
		name: text("name").notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		metadata: text("metadata"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [uniqueIndex("payment_gateway_code_uidx").on(table.code)],
);

export const organizationGatewayConfig = pgTable(
	"organization_gateway_config",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),

		gatewayId: text("gateway_id")
			.notNull()
			.references(() => paymentGateway.id, { onDelete: "cascade" }),

		environment: text("environment").default("sandbox").notNull(),
		isActive: boolean("is_active").default(true).notNull(),

		merchantId: text("merchant_id"),
		publicKey: text("public_key"),
		secretKey: text("secret_key"),
		webhookSecret: text("webhook_secret"),

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
		uniqueIndex("organization_gateway_config_org_gateway_uidx").on(
			table.organizationId,
			table.gatewayId,
		),
		index("organization_gateway_config_org_idx").on(table.organizationId),
		index("organization_gateway_config_gateway_idx").on(table.gatewayId),
	],
);

export const organizationPaymentMethod = pgTable(
	"organization_payment_method",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),

		gatewayConfigId: text("gateway_config_id").references(
			() => organizationGatewayConfig.id,
			{ onDelete: "set null" },
		),

		code: text("code").notNull(),
		name: text("name").notNull(),

		/**
		 * bank_transfer, manual_transfer, qris, virtual_account,
		 * ewallet, card, retail_outlet, other
		 */
		type: text("type").notNull(),

		gatewayCode: text("gateway_code"),
		gatewayMethodCode: text("gateway_method_code"),
		provider: text("provider"),

		accountName: text("account_name"),
		accountNumber: text("account_number"),
		instructions: text("instructions"),

		isDefault: boolean("is_default").default(false).notNull(),
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
		uniqueIndex("organization_payment_method_org_code_uidx").on(
			table.organizationId,
			table.code,
		),
		index("organization_payment_method_org_idx").on(table.organizationId),
		index("organization_payment_method_gateway_cfg_idx").on(
			table.gatewayConfigId,
		),
		index("organization_payment_method_type_idx").on(table.type),
		index("organization_payment_method_gateway_code_idx").on(table.gatewayCode),
		index("organization_payment_method_gateway_method_idx").on(
			table.gatewayMethodCode,
		),
	],
);

/**
 * Payment hanya untuk top up points.
 */
export const payments = pgTable(
	"payments",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),

		/**
		 * user pemilik top up
		 */
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),

		organizationPaymentMethodId: text("organization_payment_method_id")
			.notNull()
			.references(() => organizationPaymentMethod.id, {
				onDelete: "restrict",
			}),

		gatewayConfigId: text("gateway_config_id").references(
			() => organizationGatewayConfig.id,
			{ onDelete: "set null" },
		),

		paymentCode: text("payment_code").notNull(),
		purpose: text("purpose").default("topup_points").notNull(),

		gatewayCode: text("gateway_code"),
		gatewayMethodCode: text("gateway_method_code"),
		provider: text("provider"),

		externalReferenceId: text("external_reference_id"),
		externalInvoiceId: text("external_invoice_id"),
		externalPaymentId: text("external_payment_id"),
		externalSessionId: text("external_session_id"),
		channelReference: text("channel_reference"),

		amount: bigint("amount", { mode: "number" }).notNull(),
		currency: text("currency").default("IDR").notNull(),

		pointsRequested: bigint("points_requested", { mode: "number" }).notNull(),
		pointsGranted: bigint("points_granted", { mode: "number" })
			.default(0)
			.notNull(),

		feeAmount: bigint("fee_amount", { mode: "number" }).default(0).notNull(),
		netAmount: bigint("net_amount", { mode: "number" }).default(0).notNull(),

		status: text("status").default("pending").notNull(),

		expiresAt: timestamp("expires_at"),
		paidAt: timestamp("paid_at"),
		settledAt: timestamp("settled_at"),
		failedAt: timestamp("failed_at"),

		failureCode: text("failure_code"),
		failureMessage: text("failure_message"),
		description: text("description"),
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
		uniqueIndex("payments_payment_code_uidx").on(table.paymentCode),
		index("payments_org_idx").on(table.organizationId),
		index("payments_user_idx").on(table.userId),
		index("payments_method_idx").on(table.organizationPaymentMethodId),
		index("payments_status_idx").on(table.status),
		index("payments_ext_ref_idx").on(table.externalReferenceId),
	],
);
