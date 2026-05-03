import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const onboardingLog = pgTable(
  "onboarding_log",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("onboarding_log_userId_idx").on(table.userId)],
);

export const onboardingLogRelations = relations(onboardingLog, ({ one }) => ({
  user: one(user, {
    fields: [onboardingLog.userId],
    references: [user.id],
  }),
}));