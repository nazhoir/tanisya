import { db } from "@tanisya/db";
import { pointBalance } from "@tanisya/db/schema/billing/balance";
import { invoice, invoiceLog } from "@tanisya/db/schema/billing/invoice";
import { eq, sql, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { AdminApprovalSchema, type AdminApprovalInput } from "./types";
import { dispatchEvent } from "../event/event-service";

export const approveManualTopup = async (input: AdminApprovalInput) => {
  const validated = AdminApprovalSchema.parse(input);

  const finalResult = await db.transaction(async (tx) => {
    const [targetInvoice] = await tx.select().from(invoice)
      .where(and(eq(invoice.id, validated.invoiceId), eq(invoice.status, "pending")))
      .limit(1);

    if (!targetInvoice) throw new Error("Invoice tidak valid atau sudah diproses");

    // 1. Update Invoice -> Paid
    await tx.update(invoice).set({
      status: "paid",
      approvedById: validated.adminId,
      adminNotes: validated.notes,
      approvedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(invoice.id, validated.invoiceId));

    // 2. Atomic Upsert Saldo Poin
    await tx.insert(pointBalance).values({
      id: nanoid(),
      organizationId: targetInvoice.organizationId,
      balance: targetInvoice.pointsAdded,
      totalTopup: targetInvoice.pointsAdded,
      lastTopupAt: new Date(),
    }).onConflictDoUpdate({
      target: pointBalance.organizationId,
      set: {
        balance: sql`${pointBalance.balance} + ${targetInvoice.pointsAdded}`,
        totalTopup: sql`${pointBalance.totalTopup} + ${targetInvoice.pointsAdded}`,
        lastTopupAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 3. Catat Log
    await tx.insert(invoiceLog).values({
      id: nanoid(),
      invoiceId: validated.invoiceId,
      status: "paid",
      actionMethod: "admin_approval",
      actionById: validated.adminId,
      metadata: { notes: validated.notes, added: targetInvoice.pointsAdded },
    });

    return targetInvoice;
  });

  if (finalResult) {
    // Memberitahu layanan lain bahwa saldo bertambah dari topup
    await dispatchEvent("billing.invoice.paid", finalResult);
    await dispatchEvent("billing.balance.updated", { 
      organizationId: finalResult.organizationId,
      pointsAdded: finalResult.pointsAdded,
      sourceType: "topup",
      sourceId: finalResult.id
    });
  }

  return { success: true };
};

export const getBalance = async (organizationId: string) => {
  const result = await db.select().from(pointBalance)
    .where(eq(pointBalance.organizationId, organizationId))
    .limit(1);
  
  return result[0] ?? { balance: 0, totalTopup: 0, totalUsage: 0 };
};

/**
 * Adjustment Manual oleh Admin (Misal: Bonus Poin, Ganti Rugi, Kompensasi)
 */
export const adjustBalanceAdmin = async (organizationId: string, amount: number, adminId: string, reason: string) => {
  return await db.transaction(async (tx) => {
    const [updatedBalance] = await tx.update(pointBalance)
      .set({
        balance: sql`${pointBalance.balance} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(pointBalance.organizationId, organizationId))
      .returning();

    // Trigger Event 
    await dispatchEvent("billing.balance.adjusted", {
      organizationId,
      amount,
      adminId,
      reason
    });

    return updatedBalance;
  });
};