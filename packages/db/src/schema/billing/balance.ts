// packages/db/schema/billing/balance.ts
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { organization } from "../auth";

export const pointBalance = pgTable("point_balance", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .unique()
    .references(() => organization.id, { onDelete: "cascade" }),
  
  balance: integer("balance").default(0).notNull(),
  totalTopup: integer("total_topup").default(0).notNull(),
  totalUsage: integer("total_usage").default(0).notNull(),
  
  lastTopupAt: timestamp("last_topup_at"),
  lastUsageAt: timestamp("last_usage_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const pointBalanceRelations = relations(pointBalance, ({ one }) => ({
  organization: one(organization, {
    fields: [pointBalance.organizationId],
    references: [organization.id],
  }),
}));