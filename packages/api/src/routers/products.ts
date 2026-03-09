import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { protectedProcedure, o } from "../index";
import {
  listProducts,
  findProductById,
  createProductRecord,
  updateProductRecord,
  deleteProductRecord,
} from "@tanisya/db";

// ====================================
// ZOD SCHEMAS
// ====================================

const ProductTypeEnum = z.enum(["domain", "hosting", "vps", "digital", "physical"]);
const RecurringIntervalEnum = z.enum(["once", "monthly", "yearly"]);

const CreateProductInput = z.object({
  supplierId: z.string().min(1),
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/),
  type: ProductTypeEnum,
  description: z.string().min(1),
  isActive: z.boolean().default(true),
  isPremium: z.boolean().default(false),
  requiresVerification: z.boolean().default(false),
  stock: z.number().int().positive().optional(),
  taxCategoryId: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).default({}),
  prices: z.array(
    z.object({
      costPrice: z.number().int().nonnegative(),
      basePrice: z.number().int().positive(),
      currency: z.string().default("IDR"),
      recurringInterval: RecurringIntervalEnum,
      isPromo: z.boolean().default(false),
    })
  ).min(1),
});

const UpdateProductInput = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(200).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  isPremium: z.boolean().optional(),
  stock: z.number().int().positive().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const ListProductsInput = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});

const GetProductInput = z.object({ id: z.string().min(1) });
const DeleteProductInput = z.object({ id: z.string().min(1) });

// ====================================
// PERMISSION
// ====================================

function checkAdminPermission(role: string) {
  return ["owner", "admin"].includes(role);
}

async function getMemberRole(ctx: { session: NonNullable<any> }): Promise<string> {
  return (ctx.session as any).activeOrganizationRole ?? "member";
}

// ====================================
// ROUTER
// ====================================

export const productRouter = o.router({
  list: protectedProcedure
    .input(ListProductsInput)
    .handler(async ({ input }) => {
      return listProducts({ page: input.page, pageSize: input.pageSize, search: input.search });
    }),

  get: protectedProcedure
    .input(GetProductInput)
    .handler(async ({ input }) => {
      const row = await findProductById(input.id);
      if (!row) throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      return row;
    }),

  create: protectedProcedure
    .input(CreateProductInput)
    .handler(async ({ input, context }) => {
      const role = await getMemberRole(context);
      if (!checkAdminPermission(role)) {
        throw new ORPCError("FORBIDDEN", { message: "Only owners and admins can create products" });
      }

      return createProductRecord(
        {
          id: crypto.randomUUID(),
          supplierId: input.supplierId,
          name: input.name,
          slug: input.slug,
          type: input.type,
          description: input.description,
          isActive: input.isActive,
          isPremium: input.isPremium,
          requiresVerification: input.requiresVerification,
          stock: input.stock ?? null,
          taxCategoryId: input.taxCategoryId,
          metadata: input.metadata,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        input.prices.map((p) => ({
          id: crypto.randomUUID(),
          productId: "", // filled in createProductRecord
          costPrice: p.costPrice,
          basePrice: p.basePrice,
          currency: p.currency,
          recurringInterval: p.recurringInterval,
          isPromo: p.isPromo,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );
    }),

  update: protectedProcedure
    .input(UpdateProductInput)
    .handler(async ({ input, context }) => {
      const role = await getMemberRole(context);
      if (!checkAdminPermission(role)) {
        throw new ORPCError("FORBIDDEN", { message: "Only owners and admins can update products" });
      }

      const { id, ...rest } = input;
      const updated = await updateProductRecord(id, rest);
      if (!updated) throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      return updated;
    }),

  delete: protectedProcedure
    .input(DeleteProductInput)
    .handler(async ({ input, context }) => {
      const role = await getMemberRole(context);
      if (!checkAdminPermission(role)) {
        throw new ORPCError("FORBIDDEN", { message: "Only owners and admins can delete products" });
      }

      const deleted = await deleteProductRecord(input.id);
      if (!deleted) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Cannot delete product. Ensure it is deactivated first.",
        });
      }
      return { success: true };
    }),
});