import { db } from "@tanisya/db";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export interface AuditLogInput {
  userId:    string;
  action:    AuditAction;
  entity:    string;
  entityId:  string | number;
  before?:   Record<string, unknown> | null;
  after?:    Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
}

type TxClient = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function auditLog(
  input: AuditLogInput,
  tx?: TxClient
): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.log("[AUDIT]", {
      timestamp: new Date().toISOString(),
      ...input,
    });
  }

  // TODO: insert ke tabel audit_logs setelah tabel dibuat
}