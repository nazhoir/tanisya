import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { db, product, productPrice, supplier } from "../index";

export type ProductWithRelations = Awaited<ReturnType<typeof findProductById>>;

export async function listProducts(opts: {
  page: number;
  pageSize: number;
  search?: string;
}) {
  const offset = (opts.page - 1) * opts.pageSize;
  const where = opts.search ? ilike(product.name, `%${opts.search}%`) : undefined;

  const [rows, countResult] = await Promise.all([
    db.query.product.findMany({
      where,
      with: { supplier: true, productPrices: true, taxCategory: true },
      orderBy: [desc(product.createdAt)],
      limit: opts.pageSize,
      offset,
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(product)
      .where(where),
  ]);

  return {
    data: rows,
    total: Number(countResult[0]?.count ?? 0),
    page: opts.page,
    pageSize: opts.pageSize,
  };
}

export async function findProductById(id: string) {
  return (
    (await db.query.product.findFirst({
      where: eq(product.id, id),
      with: { supplier: true, productPrices: true, taxCategory: true },
    })) ?? null
  );
}

export async function createProductRecord(
  data: typeof product.$inferInsert,
  prices: (typeof productPrice.$inferInsert)[]
) {
  return db.transaction(async (tx) => {
    const [created] = await tx.insert(product).values(data).returning();
    if (!created) throw new Error("Failed to create product");
    if (prices.length > 0) {
      await tx.insert(productPrice).values(prices.map((p) => ({ ...p, productId: created.id })));
    }
    return created;
  });
}

export async function updateProductRecord(
  id: string,
  data: Partial<typeof product.$inferInsert>
) {
  const [updated] = await db
    .update(product)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(product.id, id))
    .returning();
  return updated ?? null;
}

export async function deleteProductRecord(id: string) {
  const [deleted] = await db
    .delete(product)
    .where(and(eq(product.id, id), eq(product.isActive, false)))
    .returning();
  return deleted ?? null;
}