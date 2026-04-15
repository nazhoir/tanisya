import { bigint, index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { organization, user } from "./base";
import { product, productPrice } from "./catalog";

/**
 * Order produk.
 * Hanya dibayar dengan points.
 */
export const productOrder = pgTable(
	"product_order",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),

		customerUserId: text("customer_user_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),

		code: text("code").notNull(),

		/**
		 * pending, paid_by_points, processing, completed, failed, cancelled, refunded
		 */
		status: text("status").default("pending").notNull(),

		totalPoints: bigint("total_points", { mode: "number" }).notNull(),
		usedPoints: bigint("used_points", { mode: "number" }).default(0).notNull(),

		notes: text("notes"),
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
		uniqueIndex("product_order_code_uidx").on(table.code),
		index("product_order_org_idx").on(table.organizationId),
		index("product_order_customer_idx").on(table.customerUserId),
		index("product_order_status_idx").on(table.status),
	],
);

export const productOrderItem = pgTable(
	"product_order_item",
	{
		id: text("id").primaryKey(),
		orderId: text("order_id")
			.notNull()
			.references(() => productOrder.id, { onDelete: "cascade" }),

		productId: text("product_id").references(() => product.id, {
			onDelete: "set null",
		}),
		productPriceId: text("product_price_id").references(() => productPrice.id, {
			onDelete: "set null",
		}),

		productType: text("product_type").notNull(),
		productCode: text("product_code"),
		name: text("name").notNull(),

		quantity: integer("quantity").default(1).notNull(),
		unitPoints: bigint("unit_points", { mode: "number" }).notNull(),
		totalPoints: bigint("total_points", { mode: "number" }).notNull(),

		status: text("status").default("pending").notNull(),
		metadata: text("metadata"),

		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("product_order_item_order_idx").on(table.orderId),
		index("product_order_item_product_idx").on(table.productId),
		index("product_order_item_price_idx").on(table.productPriceId),
	],
);
