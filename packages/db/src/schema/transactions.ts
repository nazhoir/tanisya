import { bigint, index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { organization, user } from "./base";
import { payments } from "./payments";
import { pointLedger } from "./points";
import { domain } from "./domains";
import { productOrder, productOrderItem } from "./orders";

/**
 * Histori transaksi akun.
 * Nilai transactionType mengikuti swagger:
 * deposit, domain, ssl, object-storage, note
 */
export const transactions = pgTable(
	"transactions",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),

		customerUserId: text("customer_user_id").references(() => user.id, {
			onDelete: "set null",
		}),

		productOrderId: text("product_order_id").references(() => productOrder.id, {
			onDelete: "set null",
		}),
		productOrderItemId: text("product_order_item_id").references(
			() => productOrderItem.id,
			{ onDelete: "set null" },
		),
		paymentId: text("payment_id").references(() => payments.id, {
			onDelete: "set null",
		}),
		pointLedgerId: text("point_ledger_id").references(() => pointLedger.id, {
			onDelete: "set null",
		}),
		domainId: text("domain_id").references(() => domain.id, {
			onDelete: "set null",
		}),

		providerCode: text("provider_code").default("rdash").notNull(),
		externalTransactionId: integer("external_transaction_id"),

		transactionType: text("transaction_type").notNull(),
		direction: text("direction").notNull(),

		amount: bigint("amount", { mode: "number" }).notNull(),
		currency: text("currency").default("IDR").notNull(),
		tld: text("tld"),
		description: text("description"),
		metadata: text("metadata"),

		actorUserId: text("actor_user_id").references(() => user.id, {
			onDelete: "set null",
		}),

		occurredAt: timestamp("occurred_at").defaultNow().notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex("transactions_provider_external_uidx").on(
			table.providerCode,
			table.externalTransactionId,
		),
		index("transactions_org_idx").on(table.organizationId),
		index("transactions_customer_idx").on(table.customerUserId),
		index("transactions_order_idx").on(table.productOrderId),
		index("transactions_item_idx").on(table.productOrderItemId),
		index("transactions_payment_idx").on(table.paymentId),
		index("transactions_point_idx").on(table.pointLedgerId),
		index("transactions_domain_idx").on(table.domainId),
		index("transactions_type_idx").on(table.transactionType),
		index("transactions_tld_idx").on(table.tld),
		index("transactions_actor_idx").on(table.actorUserId),
		index("transactions_occurred_idx").on(table.occurredAt),
	],
);

/**
 * Log proses bisnis.
 * Semua proses terkait product, domain, payment, dan points dicatat di sini.
 */
export const productProcessLog = pgTable(
	"product_process_log",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),

		actorUserId: text("actor_user_id").references(() => user.id, {
			onDelete: "set null",
		}),

		entityType: text("entity_type").notNull(),
		entityId: text("entity_id").notNull(),

		processType: text("process_type").notNull(),
		status: text("status").default("success").notNull(),

		message: text("message"),
		requestPayload: text("request_payload"),
		responsePayload: text("response_payload"),
		externalReferenceId: text("external_reference_id"),

		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("product_process_log_org_idx").on(table.organizationId),
		index("product_process_log_actor_idx").on(table.actorUserId),
		index("product_process_log_entity_idx").on(table.entityType, table.entityId),
		index("product_process_log_process_idx").on(table.processType),
	],
);
