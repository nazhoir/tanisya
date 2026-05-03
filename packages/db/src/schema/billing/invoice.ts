// packages/db/schema/billing/invoice.ts
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { user, organization } from "../auth";

export const invoiceStatusEnum = pgEnum("invoice_status", ["pending", "paid", "rejected", "cancelled"]);
export const invoiceTypeEnum = pgEnum("invoice_type", ["topup_gateway", "topup_manual", "admin_adjustment"]);

export const invoice = pgTable(
  "invoice",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "set null" }),
    
    type: text("type").notNull().default("topup_gateway"), 
    amount: integer("amount").notNull(),
    currency: text("currency").default("IDR").notNull(),
    pointsAdded: integer("points_added").notNull(),
    status: text("status").default("pending").notNull(), 
    
    paymentProvider: text("payment_provider").notNull(), 
    paymentChannel: text("payment_channel").notNull(),   
    
    checkoutUrl: text("checkout_url"),
    paymentProviderReference: text("payment_provider_reference"), 
    paymentReceiptUrl: text("payment_receipt_url"), 
    customerSnapshot: jsonb("customer_snapshot"), 
    
    approvalMethod: text("approval_method"), 
    approvedById: text("approved_by_id").references(() => user.id, { onDelete: "set null" }),
    adminNotes: text("admin_notes"),
    approvedAt: timestamp("approved_at"),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
    dueDate: timestamp("due_date"),
  },
  (table) => [
    index("invoice_organizationId_idx").on(table.organizationId),
    index("invoice_userId_idx").on(table.userId),
    index("invoice_approvedById_idx").on(table.approvedById),
    index("invoice_type_idx").on(table.type),
    index("invoice_status_idx").on(table.status),
  ],
);

export const invoiceLog = pgTable(
  "invoice_log",
  {
    id: text("id").primaryKey(),
    invoiceId: text("invoice_id").notNull().references(() => invoice.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    actionMethod: text("action_method").notNull(),
    actionById: text("action_by_id").references(() => user.id, { onDelete: "set null" }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("invoice_log_invoiceId_idx").on(table.invoiceId)],
);

export const invoiceRelations = relations(invoice, ({ one, many }) => ({
  organization: one(organization, { fields: [invoice.organizationId], references: [organization.id] }),
  user: one(user, { fields: [invoice.userId], references: [user.id], relationName: "userInvoices" }),
  approvedBy: one(user, { fields: [invoice.approvedById], references: [user.id], relationName: "adminApprovedInvoices" }),
  logs: many(invoiceLog),
}));

export const invoiceLogRelations = relations(invoiceLog, ({ one }) => ({
  invoice: one(invoice, { fields: [invoiceLog.invoiceId], references: [invoice.id] }),
  actionBy: one(user, { fields: [invoiceLog.actionById], references: [user.id] }),
}));