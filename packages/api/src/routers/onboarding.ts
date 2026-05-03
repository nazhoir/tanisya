import { db } from "@tanisya/db";
import { user } from "@tanisya/db/schema/auth";
import { eq } from "drizzle-orm";
import z from "zod";

import { publicProcedure } from "../index";
import { onboardingLog } from "@tanisya/db/schema/onboarding";

export const onboardingRouter = {
  getStatus: publicProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .handler(async ({ input }) => {
      const [result] = await db
        .select({ status: user.onboardingStatus })
        .from(user)
        .where(eq(user.id, input.userId))
        .limit(1);

      if (!result) {
        throw new Error("User not found");
      }

      return result;
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        status: z.enum(["pending_organization", "pending_topup", "completed", "skipped_topup"]),
        metadata: z.record(z.string(), z.any()).optional(), // Perbaikan Zod
      })
    )
    .handler(async ({ input }) => {
      return await db.transaction(async (tx) => {
        // 1. Update status pada tabel user
        await tx
          .update(user)
          .set({ onboardingStatus: input.status })
          .where(eq(user.id, input.userId));

        // 2. Catat riwayat perubahan ke onboarding_log
        const [log] = await tx
          .insert(onboardingLog)
          .values({
            id: crypto.randomUUID(), // Perbaikan Drizzle
            userId: input.userId,
            status: input.status,
            metadata: input.metadata ?? null,
          })
          .returning();

        return { success: true, log };
      });
    }),
};