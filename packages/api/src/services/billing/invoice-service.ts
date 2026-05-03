// services/billing/invoice-service.ts
import { db } from "@tanisya/db"; 
import { invoice, invoiceLog } from "@tanisya/db/schema/billing/invoice";
import { eq, and, desc } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { 
  CreateTopupSchema, 
  UploadReceiptSchema, 
  AdminApprovalSchema,
  type CreateTopupInput, 
  type UploadReceiptInput,
  type AdminApprovalInput 
} from "./types";
import { createLedgerEntry } from "./transaction-service";

const generateId = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);

export const createTopupRequest = async (input: CreateTopupInput) => {
  const validated = CreateTopupSchema.parse(input);
  const invoiceId = `INV-${generateId()}`;

  return await db.transaction(async (tx) => {
    const isManual = validated.paymentProvider === "MANUAL";
    
    const [newInvoice] = await tx.insert(invoice).values({
      id: invoiceId,
      organizationId: validated.organizationId,
      userId: validated.userId,
      amount: validated.amount,
      pointsAdded: validated.pointsAdded,
      paymentProvider: validated.paymentProvider,
      paymentChannel: validated.paymentChannel,
      type: isManual ? "topup_manual" : "topup_gateway",
      status: "pending",
      dueDate: validated.customDueDate,
    }).returning();

    await tx.insert(invoiceLog).values({
      id: `LOG-${generateId()}`,
      invoiceId: invoiceId,
      status: "pending",
      actionMethod: "system_generate_invoice",
      actionById: validated.userId,
    });

    return newInvoice;
  });
};

export const uploadPaymentReceipt = async (input: UploadReceiptInput) => {
  const validated = UploadReceiptSchema.parse(input);

  return await db.transaction(async (tx) => {
    const paymentDetails = {
      senderName: validated.senderName,
      senderAccount: validated.senderAccount,
      transferDate: validated.transferDate,
    };

    const [updatedInvoice] = await tx.update(invoice)
      .set({ 
        paymentReceiptUrl: validated.receiptUrl, 
        customerSnapshot: paymentDetails,
        updatedAt: new Date() 
      })
      .where(and(eq(invoice.id, validated.invoiceId), eq(invoice.userId, validated.userId), eq(invoice.status, "pending")))
      .returning();

    if (!updatedInvoice) throw new Error("Invoice tidak ditemukan atau status tidak valid.");

    await tx.insert(invoiceLog).values({
      id: `LOG-${generateId()}`,
      invoiceId: validated.invoiceId,
      status: "pending",
      actionMethod: "user_upload_receipt",
      actionById: validated.userId,
      metadata: paymentDetails,
    });

    return updatedInvoice;
  });
};

export const approveManualTopup = async (input: AdminApprovalInput) => {
  const validated = AdminApprovalSchema.parse(input);

  return await db.transaction(async (tx) => {
    const [data] = await tx.update(invoice)
      .set({ 
        status: "paid", 
        approvedAt: new Date(),
        approvedById: validated.adminId,
        adminNotes: validated.notes,
        updatedAt: new Date(),
      })
      .where(and(eq(invoice.id, validated.invoiceId), eq(invoice.status, "pending")))
      .returning();

    if (!data) throw new Error("Invoice tidak ditemukan atau bukan berstatus pending.");

    await createLedgerEntry(tx, {
      organizationId: data.organizationId,
      userId: data.userId,
      type: "purchase",
      description: `Credit purchase: ${data.pointsAdded} credits`,
      amount: data.pointsAdded,
      referenceId: data.id, 
    });

    await tx.insert(invoiceLog).values({
      id: `LOG-${generateId()}`,
      invoiceId: validated.invoiceId,
      status: "paid",
      actionMethod: "admin_approval",
      actionById: validated.adminId,
      metadata: { reason: validated.notes },
    });

    return data;
  });
};

export const rejectManualTopup = async (input: AdminApprovalInput) => {
  const validated = AdminApprovalSchema.parse(input);

  return await db.transaction(async (tx) => {
    const [data] = await tx.update(invoice)
      .set({ 
        status: "rejected", 
        approvedAt: new Date(),
        approvedById: validated.adminId,
        adminNotes: validated.notes,
        updatedAt: new Date(),
      })
      .where(and(eq(invoice.id, validated.invoiceId), eq(invoice.status, "pending")))
      .returning();

    if (!data) throw new Error("Invoice tidak valid atau tidak bisa ditolak.");

    await tx.insert(invoiceLog).values({
      id: `LOG-${generateId()}`,
      invoiceId: validated.invoiceId,
      status: "rejected",
      actionMethod: "admin_rejection",
      actionById: validated.adminId,
      metadata: { reason: validated.notes },
    });

    return data;
  });
};

export const cancelInvoice = async (invoiceId: string, userId: string) => {
  return await db.transaction(async (tx) => {
    const [updated] = await tx.update(invoice)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(and(eq(invoice.id, invoiceId), eq(invoice.userId, userId), eq(invoice.status, "pending")))
      .returning();

    if (!updated) throw new Error("Tidak dapat membatalkan invoice.");

    await tx.insert(invoiceLog).values({
      id: `LOG-${generateId()}`,
      invoiceId: invoiceId,
      status: "cancelled",
      actionMethod: "user_cancel",
      actionById: userId,
    });
    
    return updated;
  });
};

export const getInvoicesByOrg = async (organizationId: string, limit = 10, offset = 0) => {
  return await db.query.invoice.findMany({
    where: eq(invoice.organizationId, organizationId),
    limit,
    offset,
    orderBy: [desc(invoice.createdAt)],
    with: { user: { columns: { name: true, email: true } }, logs: true }
  });
};

export const getInvoiceById = async (id: string, organizationId: string) => {
  const data = await db.query.invoice.findFirst({
    where: and(eq(invoice.id, id), eq(invoice.organizationId, organizationId)),
    with: { 
      user: { columns: { name: true, email: true, image: true } },
      approvedBy: { columns: { name: true } },
      logs: { orderBy: [desc(invoiceLog.createdAt)] }
    }
  });
  if (!data) throw new Error("Data tagihan tidak ditemukan.");
  return data;
};