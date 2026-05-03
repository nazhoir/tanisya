import { pgTable, text, integer } from "drizzle-orm/pg-core";
import { productItem } from "./product";

export const productHosting = pgTable("product_hosting", {
  id: text("id").primaryKey(),
  productItemId: text("product_item_id")
    .notNull()
    .unique()
    .references(() => productItem.id, { onDelete: "cascade" }),
  storageMb: integer("storage_mb").notNull(),
  bandwidthMb: integer("bandwidth_mb").notNull(),
  domainsLimit: integer("domains_limit").notNull(),
  databasesLimit: integer("databases_limit").notNull(),
});