import { pgTable, text, boolean, integer } from "drizzle-orm/pg-core";
import { productItem } from "./product";

export const productDomain = pgTable("product_domain", {
  id: text("id").primaryKey(),
  productItemId: text("product_item_id")
    .notNull()
    .unique()
    .references(() => productItem.id, { onDelete: "cascade" }),
  tld: text("tld").notNull().unique(),
  isTransferable: boolean("is_transferable").default(true).notNull(),
  minYears: integer("min_years").default(1).notNull(),
});