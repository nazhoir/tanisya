import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { productVps } from "./vps";
import { productDomain } from "./domain";
import { productHosting } from "./hosting";
import { productSsl } from "./ssl";

export const provider = pgTable("provider", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  config: jsonb("config"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const product = pgTable(
  "product",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [index("product_category_idx").on(table.category)]
);

export const productItem = pgTable(
  "product_item",
  {
    id: text("id").primaryKey(),
    productId: text("product_id").notNull().references(() => product.id, { onDelete: "cascade" }),
    providerId: text("provider_id").references(() => provider.id, { onDelete: "set null" }),
    
    sku: text("sku").notNull().unique(),
    providerProductId: text("provider_product_id"),
    
    name: text("name").notNull(),
    basePointsCost: integer("base_points_cost").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    index("productItem_productId_idx").on(table.productId),
    index("productItem_providerId_idx").on(table.providerId),
  ]
);

export const providerRelations = relations(provider, ({ many }) => ({
  productItems: many(productItem),
}));

export const productRelations = relations(product, ({ many }) => ({
  items: many(productItem),
}));

export const productItemRelations = relations(productItem, ({ one }) => ({
  product: one(product, { fields: [productItem.productId], references: [product.id] }),
  provider: one(provider, { fields: [productItem.providerId], references: [provider.id] }),
  vpsConfig: one(productVps, { fields: [productItem.id], references: [productVps.productItemId] }),
  domainConfig: one(productDomain, { fields: [productItem.id], references: [productDomain.productItemId] }),
  hostingConfig: one(productHosting, { fields: [productItem.id], references: [productHosting.productItemId] }),
  sslConfig: one(productSsl, { fields: [productItem.id], references: [productSsl.productItemId] }),
}));