import { z } from "zod";
import { protectedProcedure } from "../index";

import {
  CreateTopupSchema,
  UploadReceiptSchema,
  AdminApprovalSchema,
} from "../services/billing/types";

import {
  createTopupRequest,
  rejectManualTopup,
  uploadPaymentReceipt,
  cancelInvoice,
  getInvoicesByOrg,
  getInvoiceById,
} from "../services/billing/invoice-service";

import {
  approveManualTopup,
  getBalance,
  adjustBalanceAdmin,
} from "../services/billing/point-service";

import {
  consumePoints,
  getTransactionHistory,
  getTransactionDetail,
} from "../services/billing/transaction-service";

export const billingRouter = {
  // ==========================================
  // INVOICE & TOP UP ROUTES
  // ==========================================

  createTopup: protectedProcedure
    .input(CreateTopupSchema.omit({ userId: true }))
    .handler(async ({ input, context }) => {
      return await createTopupRequest({
        ...input,
        userId: context.session.user.id,
      });
    }),

  uploadReceipt: protectedProcedure
    .input(UploadReceiptSchema.omit({ userId: true }))
    .handler(async ({ input, context }) => {
      return await uploadPaymentReceipt({
        ...input,
        userId: context.session.user.id,
      });
    }),

  cancelTopup: protectedProcedure
    .input(z.object({ invoiceId: z.string().min(1) }))
    .handler(async ({ input, context }) => {
      return await cancelInvoice(input.invoiceId, context.session.user.id);
    }),

  getInvoices: protectedProcedure
    .input(z.object({ 
      organizationId: z.string().min(1), 
      limit: z.number().default(10), 
      offset: z.number().default(0) 
    }))
    .handler(async ({ input }) => {
      return await getInvoicesByOrg(input.organizationId, input.limit, input.offset);
    }),

  getInvoiceDetail: protectedProcedure
    .input(z.object({ 
      invoiceId: z.string().min(1), 
      organizationId: z.string().min(1) 
    }))
    .handler(async ({ input }) => {
      return await getInvoiceById(input.invoiceId, input.organizationId);
    }),

  // ==========================================
  // ADMIN APPROVAL ROUTES
  // ==========================================

  approveTopup: protectedProcedure
    .input(AdminApprovalSchema.omit({ adminId: true }))
    .handler(async ({ input, context }) => {
      return await approveManualTopup({
        ...input,
        adminId: context.session.user.id,
      });
    }),

  rejectTopup: protectedProcedure
    .input(AdminApprovalSchema.omit({ adminId: true }))
    .handler(async ({ input, context }) => {
      return await rejectManualTopup({
        ...input,
        adminId: context.session.user.id,
      });
    }),

  adjustBalance: protectedProcedure
    .input(z.object({
      organizationId: z.string().min(1),
      amount: z.number(),
      reason: z.string().min(1),
    }))
    .handler(async ({ input, context }) => {
      return await adjustBalanceAdmin(
        input.organizationId, 
        input.amount, 
        context.session.user.id, 
        input.reason
      );
    }),

  // ==========================================
  // POINT BALANCE & TRANSACTION ROUTES
  // ==========================================

  getPointBalance: protectedProcedure
    .input(z.object({ organizationId: z.string().min(1) }))
    .handler(async ({ input }) => {
      return await getBalance(input.organizationId);
    }),

  consumePoints: protectedProcedure
    .input(z.object({
      organizationId: z.string().min(1),
      pointsCost: z.number().positive(),
      productItemId: z.string().min(1),
      metadata: z.record(z.string(), z.any()).default({}),
    }))
    .handler(async ({ input, context }) => {
      return await consumePoints({
        ...input,
        userId: context.session.user.id,
        description: ""
      });
    }),

  getTransactions: protectedProcedure
    .input(z.object({ 
      organizationId: z.string().min(1), 
      limit: z.number().default(10), 
      offset: z.number().default(0) 
    }))
    .handler(async ({ input }) => {
      return await getTransactionHistory(input.organizationId, input.limit, input.offset);
    }),

  getTransactionDetail: protectedProcedure
    .input(z.object({ 
      transactionId: z.string().min(1), 
      organizationId: z.string().min(1) 
    }))
    .handler(async ({ input }) => {
      return await getTransactionDetail(input.transactionId, input.organizationId);
    }),
};