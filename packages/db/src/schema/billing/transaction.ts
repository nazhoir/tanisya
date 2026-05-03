// packages/db/schema/billing/transaction.ts
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index, integer, jsonb } from "drizzle-orm/pg-core";
import { user, organization } from "../auth";
import { productItem } from "../product/product";

export const transaction = pgTable(
  "transaction",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "set null" }),
    productItemId: text("product_item_id").notNull().references(() => productItem.id, { onDelete: "restrict" }),
    
    pointsCost: integer("points_cost").notNull(),
    status: text("status").default("success").notNull(),
    
    itemSnapshot: jsonb("item_snapshot").notNull(),
    provisioningData: jsonb("provisioning_data").notNull(),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("transaction_organizationId_idx").on(table.organizationId),
    index("transaction_userId_idx").on(table.userId),
    index("transaction_productItemId_idx").on(table.productItemId),
    index("transaction_status_idx").on(table.status),
  ]
);

export const serviceAsset = pgTable(
  "service_asset",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
    productItemId: text("product_item_id").notNull().references(() => productItem.id, { onDelete: "restrict" }),
    transactionId: text("transaction_id").notNull().references(() => transaction.id, { onDelete: "restrict" }),
    
    name: text("name").notNull(),
    category: text("category").notNull(),
    status: text("status").default("active").notNull(),
    
    externalReferenceId: text("external_reference_id"), 
    config: jsonb("config"),
    
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    index("serviceAsset_organizationId_idx").on(table.organizationId),
    index("serviceAsset_category_idx").on(table.category),
    index("serviceAsset_status_idx").on(table.status),
    index("serviceAsset_externalRef_idx").on(table.externalReferenceId),
  ]
);

export const transactionRelations = relations(transaction, ({ one, many }) => ({
  organization: one(organization, { fields: [transaction.organizationId], references: [organization.id] }),
  user: one(user, { fields: [transaction.userId], references: [user.id] }),
  productItem: one(productItem, { fields: [transaction.productItemId], references: [productItem.id] }),
  serviceAssets: many(serviceAsset),
}));

export const serviceAssetRelations = relations(serviceAsset, ({ one }) => ({
  organization: one(organization, { fields: [serviceAsset.organizationId], references: [organization.id] }),
  productItem: one(productItem, { fields: [serviceAsset.productItemId], references: [productItem.id] }),
  originTransaction: one(transaction, { fields: [serviceAsset.transactionId], references: [transaction.id] }),
}));