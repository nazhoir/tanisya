// services/event/types.ts
import { z } from "zod";

// Skema dasar untuk payload event global
export const GlobalEventSchema = z.object({
  event: z.string().min(1, "Nama event tidak boleh kosong"),
  organizationId: z.string().optional(), // Opsional di level skema global, tapi penting untuk webhook routing
  data: z.record(z.string(), z.any()),
  timestamp: z.string().datetime(),
});

// Inferensi tipe untuk digunakan pada parameter fungsi
export type GlobalEvent = z.infer<typeof GlobalEventSchema>;

/**
 * Literal types untuk Autocomplete (Developer Experience)
 * Format (string & {}) memastikan kita masih bisa mengirim string kustom di luar daftar ini,
 * namun VSCode tetap akan memunculkan saran untuk string yang ada di daftar.
 */
export type KnownEventNames = 
  | "billing.invoice.created"
  | "billing.invoice.paid"
  | "billing.invoice.rejected"
  | "billing.balance.updated"
  | "billing.balance.adjusted"
  | "billing.transaction.created"
  | (string & {});