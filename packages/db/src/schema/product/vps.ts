import { pgTable, text, integer } from "drizzle-orm/pg-core";
import { productItem } from "./product";

export const productVps = pgTable("product_vps", {
  id: text("id").primaryKey(),
  productItemId: text("product_item_id")
    .notNull()
    .unique()
    .references(() => productItem.id, { onDelete: "cascade" }),
  cpuCores: integer("cpu_cores").notNull(),
  ramMb: integer("ram_mb").notNull(),
  diskGb: integer("disk_gb").notNull(),
  region: text("region").notNull(),
  virtualization: text("virtualization"),
});