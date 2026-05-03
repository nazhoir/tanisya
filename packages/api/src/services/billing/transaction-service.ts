// services/billing/transaction-service.ts
import { db } from "@tanisya/db";
import { transaction } from "@tanisya/db/schema/billing/transaction";
import { pointBalance } from "@tanisya/db/schema/billing/balance";
import { eq, and, desc, sql } from "drizzle-orm";
import { customAlphabet } from "nanoid";

const generateTxId = customAlphabet("1234567890", 12);

export const createLedgerEntry = async (tx: any, input: {
  organizationId: string;
  userId: string;
  type: "purchase" | "usage";
  description: string;
  amount: number; 
  referenceId: string;
  productItemId?: string; 
}) => {
  await tx.insert(transaction).values({
    id: `TX-${generateTxId()}`,
    organizationId: input.organizationId,
    userId: input.userId,
    productItemId: input.productItemId || "INTERNAL_CREDIT", 
    pointsCost: input.amount, 
    status: "success",
    itemSnapshot: { 
      description: input.description, 
      type: input.type,
      reference: input.referenceId 
    },
    provisioningData: {}, 
    createdAt: new Date(),
  });

  await tx.update(pointBalance)
    .set({
      balance: sql`${pointBalance.balance} + ${input.amount}`,
      totalTopup: input.amount > 0 ? sql`${pointBalance.totalTopup} + ${input.amount}` : undefined,
      totalUsage: input.amount < 0 ? sql`${pointBalance.totalUsage} + ${Math.abs(input.amount)}` : undefined,
      lastTopupAt: input.amount > 0 ? new Date() : undefined,
      lastUsageAt: input.amount < 0 ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(pointBalance.organizationId, input.organizationId));
};

export const consumePoints = async (input: {
  organizationId: string;
  userId: string;
  pointsCost: number; 
  description: string;
  productItemId?: string;
  referenceId?: string;
}) => {
  return await db.transaction(async (tx) => {
    const currentBalance = await tx.query.pointBalance.findFirst({
      where: eq(pointBalance.organizationId, input.organizationId),
      columns: { balance: true }
    });

    if (!currentBalance || currentBalance.balance < input.pointsCost) {
      throw new Error("Saldo poin tidak mencukupi untuk melakukan transaksi ini.");
    }

    await createLedgerEntry(tx, {
      organizationId: input.organizationId,
      userId: input.userId,
      type: "usage",
      description: input.description,
      amount: -Math.abs(input.pointsCost), 
      referenceId: input.referenceId || `USAGE-${Date.now()}`,
      productItemId: input.productItemId || "INTERNAL_USAGE",
    });

    return { 
      success: true, 
      remainingBalance: currentBalance.balance - input.pointsCost 
    };
  });
};

export const getTransactionHistory = async (organizationId: string, limit = 10, offset = 0) => {
  return await db.query.transaction.findMany({
    where: eq(transaction.organizationId, organizationId),
    limit,
    offset,
    orderBy: [desc(transaction.createdAt)],
    with: { 
      user: { columns: { name: true, email: true } },
      productItem: { columns: { name: true } }
    }
  });
};

export const getTransactionDetail = async (id: string, organizationId: string) => {
  const data = await db.query.transaction.findFirst({
    where: and(eq(transaction.id, id), eq(transaction.organizationId, organizationId)),
    with: { 
      user: { columns: { name: true, email: true, image: true } },
      productItem: { columns: { name: true } },
      serviceAssets: true
    }
  });
  
  if (!data) throw new Error("Kuitansi / Transaksi tidak ditemukan.");
  return data;
};