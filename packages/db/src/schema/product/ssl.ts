import { pgTable, text, boolean } from "drizzle-orm/pg-core";
import { productItem } from "./product";

export const productSsl = pgTable("product_ssl", {
  id: text("id").primaryKey(),
  productItemId: text("product_item_id")
    .notNull()
    .unique()
    .references(() => productItem.id, { onDelete: "cascade" }),
  validationType: text("validation_type").notNull(),
  isWildcard: boolean("is_wildcard").default(false).notNull(),
  issuedBy: text("issued_by").notNull(),
});