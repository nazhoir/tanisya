import { and, desc, eq, sql } from "drizzle-orm";
import { db, order, orderItem, payment, invoice, product } from "../index";

const generateId = () => crypto.randomUUID();

export type OrderWithRelations = Awaited<ReturnType<typeof findOrderById>>;
export type OrderListItem = Awaited<ReturnType<typeof listOrders>>["data"][number];

export async function listOrders(
  organizationId: string,
  opts: { page: number; pageSize: number }
) {
  const offset = (opts.page - 1) * opts.pageSize;

  const [rows, countResult] = await Promise.all([
    db.query.order.findMany({
      where: eq(order.organizationId, organizationId),
      with: {
        orderItems: { with: { product: true } },
        invoice: true,
      },
      orderBy: [desc(order.createdAt)],
      limit: opts.pageSize,
      offset,
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(order)
      .where(eq(order.organizationId, organizationId)),
  ]);

  return {
    data: rows,
    total: Number(countResult[0]?.count ?? 0),
    page: opts.page,
    pageSize: opts.pageSize,
  };
}

export async function findOrderById(id: string, organizationId: string) {
  const row = await db.query.order.findFirst({
    where: and(eq(order.id, id), eq(order.organizationId, organizationId)),
    with: {
      orderItems: { with: { product: true, supplier: true } },
      invoice: true,
      payments: true,
      orderedByUser: true,
    },
  });
  return row ?? null;
}

export async function createOrderRecord(
  data: typeof order.$inferInsert,
  items: (typeof orderItem.$inferInsert)[]
) {
  return db.transaction(async (tx) => {
    const [created] = await tx.insert(order).values(data).returning();
    if (!created) throw new Error("Failed to create order");

    const itemsWithOrderId = items.map((item) => ({
      ...item,
      orderId: created.id,
    }));
    await tx.insert(orderItem).values(itemsWithOrderId);

    return created;
  });
}

export async function updateOrderStatus(
  id: string,
  organizationId: string,
  status: typeof order.$inferSelect["status"]
) {
  const [updated] = await db
    .update(order)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(order.id, id), eq(order.organizationId, organizationId)))
    .returning();
  return updated ?? null;
}

export async function deleteOrderRecord(id: string, organizationId: string) {
  const [deleted] = await db
    .delete(order)
    .where(
      and(
        eq(order.id, id),
        eq(order.organizationId, organizationId),
        eq(order.status, "draft")
      )
    )
    .returning();
  return deleted ?? null;
}

export async function payOrderTransaction(
  orderId: string,
  organizationId: string,
  paymentData: Omit<typeof payment.$inferInsert, "id" | "createdAt" | "updatedAt">
) {
  return db.transaction(async (tx) => {
    const [existingOrder] = await tx
      .select()
      .from(order)
      .where(and(eq(order.id, orderId), eq(order.organizationId, organizationId)))
      .limit(1);

    if (!existingOrder) throw new Error("ORDER_NOT_FOUND");
    if (existingOrder.status !== "pending_payment") throw new Error("ORDER_NOT_PENDING");

    const paymentId = crypto.randomUUID();
        const [createdPayment] = await tx
          .insert(payment)
          .values({ id: paymentId, ...paymentData, organizationId })
          .returning();

    if (!createdPayment) throw new Error("Failed to create payment");

    const [updatedOrder] = await tx
      .update(order)
      .set({ status: "paid", updatedAt: new Date() })
      .where(eq(order.id, orderId))
      .returning();

    await tx
      .update(invoice)
      .set({ status: "paid", paidAt: new Date(), updatedAt: new Date() })
      .where(eq(invoice.id, existingOrder.invoiceId));

    return { payment: createdPayment, order: updatedOrder! };
  });
}