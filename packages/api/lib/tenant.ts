import { ORPCError } from "@orpc/server";
import type { Context } from "../src/context";

/**
 * Tidak ada tabel organization/tenant.
 * Scope data = userId dari session.
 * User adalah "tenant" mereka sendiri.
 */
export function getUserId(context: Context): string {
  const userId = context.session?.user?.id;

  if (!userId) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return userId;
}