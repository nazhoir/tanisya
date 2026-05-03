import { z } from "zod";

export const CreateTopupSchema = z.object({
  organizationId: z.string(),
  userId: z.string(),
  amount: z.number().min(50000),
  pointsAdded: z.number(),
  paymentProvider: z.enum(["MANUAL", "XENDIT", "MIDTRANS", "STRIPE"]),
  paymentChannel: z.string(),
  customDueDate: z.coerce.date().optional(),
});
export type CreateTopupInput = z.infer<typeof CreateTopupSchema>;

export const UploadReceiptSchema = z.object({
  invoiceId: z.string(),
  userId: z.string(),
  receiptUrl: z.string().url(),
  senderName: z.string().min(1, "Nama pengirim wajib diisi"),
  senderAccount: z.string().min(1, "Nomor rekening wajib diisi"),
  transferDate: z.string().min(1, "Tanggal transfer wajib diisi"),
});
export type UploadReceiptInput = z.infer<typeof UploadReceiptSchema>;

export const AdminApprovalSchema = z.object({
  invoiceId: z.string(),
  adminId: z.string(),
  notes: z.string().optional(),
});
export type AdminApprovalInput = z.infer<typeof AdminApprovalSchema>;