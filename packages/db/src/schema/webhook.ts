import { pgTable, text, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { organization } from "./auth"; // Asumsi relasi ke auth.ts

export const webhookEndpoint = pgTable(
  "webhook_endpoint",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
    
    url: text("url").notNull(),
    secret: text("secret").notNull(), // Digunakan untuk HMAC signature agar client tahu ini asli dari sistem kita
    description: text("description"),
    
    // Array event yang di-subscribe, misal: ["billing.invoice.paid", "billing.balance.updated"]
    // Gunakan ["*"] untuk menerima semua event
    subscribedEvents: jsonb("subscribed_events").$type<string[]>().notNull(),
    
    isActive: boolean("is_active").default(true).notNull(),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    index("webhook_orgId_idx").on(table.organizationId),
  ]
);