import { bigint, index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { organization, user } from "./base";

/**
 * Wallet points di level organization.
 * 1 point = 1 rupiah.
 */
export const pointWallet = pgTable(
	"point_wallet",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),

		balance: bigint("balance", { mode: "number" }).default(0).notNull(),
		currency: text("currency").default("IDR").notNull(),
		metadata: text("metadata"),

		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [uniqueIndex("point_wallet_org_uidx").on(table.organizationId)],
);

export const pointLedger = pgTable(
	"point_ledger",
	{
		id: text("id").primaryKey(),
		walletId: text("wallet_id")
			.notNull()
			.references(() => pointWallet.id, { onDelete: "cascade" }),

		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),

		/**
		 * credit, debit, refund, adjustment, expiry
		 */
		entryType: text("entry_type").notNull(),

		points: bigint("points", { mode: "number" }).notNull(),
		balanceBefore: bigint("balance_before", { mode: "number" }).notNull(),
		balanceAfter: bigint("balance_after", { mode: "number" }).notNull(),

		sourceType: text("source_type"),
		sourceId: text("source_id"),
		description: text("description"),
		metadata: text("metadata"),

		actorUserId: text("actor_user_id").references(() => user.id, {
			onDelete: "set null",
		}),

		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("point_ledger_wallet_idx").on(table.walletId),
		index("point_ledger_org_idx").on(table.organizationId),
		index("point_ledger_actor_idx").on(table.actorUserId),
		index("point_ledger_source_idx").on(table.sourceType, table.sourceId),
	],
);
