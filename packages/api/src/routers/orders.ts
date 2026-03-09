import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { protectedProcedure, o } from "../index";
import {
  listOrders,
  findOrderById,
  createOrderRecord,
  updateOrderStatus,
  deleteOrderRecord,
  payOrderTransaction,
} from "@tanisya/db";

// ====================================
// ZOD SCHEMAS
// ====================================

const OrderStatusEnum = z.enum(["draft", "pending_payment", "awaiting_verification", "paid", "cancelled", "expired"]);

const CreateOrderInput = z.object({
  productId: z.string().min(1),
  supplierId: z.string().min(1),
  productNameSnapshot: z.string().min(1),
  productTypeSnapshot: z.enum(["domain", "hosting", "vps", "digital", "physical"]),
  supplierNameSnapshot: z.string().min(1),
  quantity: z.number().int().positive(),
  costPriceSnapshot: z.number().int().nonnegative(),
  unitPrice: z.number().int().positive(),
  discountAmount: z.number().int().nonnegative().default(0),
  taxRateSnapshot: z.number().int().nonnegative(),
  taxAmount: z.number().int().nonnegative(),
  totalAmount: z.number().int().positive(),
  currency: z.string().default("IDR"),
  metadata: z.record(z.string(), z.unknown()).default({}),
  invoiceId: z.string().min(1),
});

const ListOrdersInput = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
});

const GetOrderInput = z.object({
  id: z.string().min(1),
});

const UpdateOrderStatusInput = z.object({
  id: z.string().min(1),
  status: OrderStatusEnum,
});

const DeleteOrderInput = z.object({
  id: z.string().min(1),
});

const PayOrderInput = z.object({
  orderId: z.string().min(1),
  method: z.enum(["bank_transfer", "stripe", "midtrans", "xendit", "manual"]),
  externalReference: z.string().optional(),
});

// ====================================
// PERMISSION HELPERS
// ====================================

const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ["pending_payment", "cancelled"],
  pending_payment: ["awaiting_verification", "cancelled", "expired"],
  awaiting_verification: ["paid", "cancelled"],
  paid: [],
  cancelled: [],
  expired: [],
};

function canTransition(from: string, to: string): boolean {
  return ALLOWED_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

function checkPermission(role: string, action: "create" | "view" | "manage" | "delete" | "pay") {
  const permissions: Record<string, string[]> = {
    owner: ["create", "view", "manage", "delete", "pay"],
    admin: ["create", "view", "manage", "pay"],
    member: ["create", "view"],
  };
  return permissions[role]?.includes(action) ?? false;
}

async function getMemberRole(ctx: { session: NonNullable<any> }): Promise<string> {
  // Read role from session's active organization membership
  // In real app: query member table. Here we read from session.
  return (ctx.session as any).activeOrganizationRole ?? "member";
}

// ====================================
// ROUTER
// ====================================

export const orderRouter = o.router({
  list: protectedProcedure
    .input(ListOrdersInput)
    .handler(async ({ input, context }) => {
      const orgId = (context.session as any).session?.activeOrganizationId;
      if (!orgId) throw new ORPCError("FORBIDDEN", { message: "No active organization" });

      return listOrders(orgId, { page: input.page, pageSize: input.pageSize });
    }),

  get: protectedProcedure
    .input(GetOrderInput)
    .handler(async ({ input, context }) => {
      const orgId = (context.session as any).session?.activeOrganizationId;
      if (!orgId) throw new ORPCError("FORBIDDEN", { message: "No active organization" });

      const row = await findOrderById(input.id, orgId);
      if (!row) throw new ORPCError("NOT_FOUND", { message: "Order not found" });

      return row;
    }),

  create: protectedProcedure
    .input(CreateOrderInput)
    .handler(async ({ input, context }) => {
      const session = context.session as any;
      const orgId = session.session?.activeOrganizationId;
      const userId = session.user?.id;
      if (!orgId) throw new ORPCError("FORBIDDEN", { message: "No active organization" });

      const role = await getMemberRole(context);
      if (!checkPermission(role, "create")) {
        throw new ORPCError("FORBIDDEN", { message: "Insufficient permissions" });
      }

      const orderId = crypto.randomUUID();
      const subtotal = input.unitPrice * input.quantity;
      const grandTotal = subtotal - input.discountAmount + input.taxAmount;

      const newOrder = await createOrderRecord(
        {
          id: orderId,
          organizationId: orgId,
          orderedByUserId: userId,
          invoiceId: input.invoiceId,
          status: "pending_payment",
          subtotal,
          discountTotal: input.discountAmount,
          taxTotal: input.taxAmount,
          grandTotal,
          currency: input.currency,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        [
          {
            id: crypto.randomUUID(),
            orderId,
            productId: input.productId,
            supplierId: input.supplierId,
            productNameSnapshot: input.productNameSnapshot,
            productTypeSnapshot: input.productTypeSnapshot,
            supplierNameSnapshot: input.supplierNameSnapshot,
            quantity: input.quantity,
            costPriceSnapshot: input.costPriceSnapshot,
            unitPrice: input.unitPrice,
            discountAmount: input.discountAmount,
            taxRateSnapshot: input.taxRateSnapshot,
            taxAmount: input.taxAmount,
            totalAmount: input.totalAmount,
            metadata: input.metadata,
            createdAt: new Date(),
          },
        ]
      );

      return newOrder;
    }),

  updateStatus: protectedProcedure
    .input(UpdateOrderStatusInput)
    .handler(async ({ input, context }) => {
      const session = context.session as any;
      const orgId = session.session?.activeOrganizationId;
      if (!orgId) throw new ORPCError("FORBIDDEN", { message: "No active organization" });

      const role = await getMemberRole(context);
      if (!checkPermission(role, "manage")) {
        throw new ORPCError("FORBIDDEN", { message: "Insufficient permissions" });
      }

      const existing = await findOrderById(input.id, orgId);
      if (!existing) throw new ORPCError("NOT_FOUND", { message: "Order not found" });

      if (!canTransition(existing.status, input.status)) {
        throw new ORPCError("BAD_REQUEST", {
          message: `Cannot transition order from "${existing.status}" to "${input.status}"`,
        });
      }

      const updated = await updateOrderStatus(input.id, orgId, input.status);
      if (!updated) throw new ORPCError("NOT_FOUND", { message: "Order not found" });

      return updated;
    }),

  delete: protectedProcedure
    .input(DeleteOrderInput)
    .handler(async ({ input, context }) => {
      const session = context.session as any;
      const orgId = session.session?.activeOrganizationId;
      if (!orgId) throw new ORPCError("FORBIDDEN", { message: "No active organization" });

      const role = await getMemberRole(context);
      if (!checkPermission(role, "delete")) {
        throw new ORPCError("FORBIDDEN", { message: "Insufficient permissions" });
      }

      const existing = await findOrderById(input.id, orgId);
      if (!existing) throw new ORPCError("NOT_FOUND", { message: "Order not found" });

      if (existing.status !== "draft") {
        throw new ORPCError("BAD_REQUEST", { message: "Only draft orders can be deleted" });
      }

      const deleted = await deleteOrderRecord(input.id, orgId);
      if (!deleted) throw new ORPCError("BAD_REQUEST", { message: "Cannot delete order" });

      return { success: true };
    }),

  pay: protectedProcedure
    .input(PayOrderInput)
    .handler(async ({ input, context }) => {
      const session = context.session as any;
      const orgId = session.session?.activeOrganizationId;
      if (!orgId) throw new ORPCError("FORBIDDEN", { message: "No active organization" });

      const role = await getMemberRole(context);
      if (!checkPermission(role, "pay")) {
        throw new ORPCError("FORBIDDEN", { message: "Insufficient permissions" });
      }

      const existing = await findOrderById(input.orderId, orgId);
      if (!existing) throw new ORPCError("NOT_FOUND", { message: "Order not found" });

      if (existing.status !== "pending_payment") {
        throw new ORPCError("BAD_REQUEST", {
          message: `Order must be in "pending_payment" status to pay. Current: "${existing.status}"`,
        });
      }

      try {
        const result = await payOrderTransaction(input.orderId, orgId, {
          invoiceId: existing.invoiceId,
          organizationId: orgId,
          method: input.method,
          status: "waiting_confirmation",
          amount: existing.grandTotal,
          currency: existing.currency,
          externalReference: input.externalReference ?? null,
          gatewayResponse: null,
          paidAt: null,
          verifiedByAdminId: null,
          verifiedAt: null,
          expiresAt: null,
          orderId: ""
        });
        return result;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Payment failed";
        throw new ORPCError("BAD_REQUEST", { message: msg });
      }
    }),
});