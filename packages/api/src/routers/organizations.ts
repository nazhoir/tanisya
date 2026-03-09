import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { protectedProcedure, o } from "../index";
import {
  findOrganizationById,
  updateOrganizationRecord,
  listOrganizationMembers,
} from "@tanisya/db";

// ====================================
// ZOD SCHEMAS
// ====================================

const UpdateOrganizationInput = z.object({
  name: z.string().min(2).max(100).optional(),
  logo: z.string().url().optional(),
  metadata: z.string().optional(),
});

// ====================================
// PERMISSION
// ====================================

async function getMemberRole(ctx: { session: NonNullable<any> }): Promise<string> {
  return (ctx.session as any).activeOrganizationRole ?? "member";
}

// ====================================
// ROUTER
// ====================================

export const organizationRouter = o.router({
  get: protectedProcedure
    .handler(async ({ context }) => {
      const orgId = (context.session as any).session?.activeOrganizationId;
      if (!orgId) throw new ORPCError("FORBIDDEN", { message: "No active organization" });

      const org = await findOrganizationById(orgId);
      if (!org) throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
      return org;
    }),

  update: protectedProcedure
    .input(UpdateOrganizationInput)
    .handler(async ({ input, context }) => {
      const orgId = (context.session as any).session?.activeOrganizationId;
      if (!orgId) throw new ORPCError("FORBIDDEN", { message: "No active organization" });

      const role = await getMemberRole(context);
      if (!["owner", "admin"].includes(role)) {
        throw new ORPCError("FORBIDDEN", { message: "Only owners and admins can update organization" });
      }

      const updated = await updateOrganizationRecord(orgId, input);
      if (!updated) throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
      return updated;
    }),

  members: protectedProcedure
    .handler(async ({ context }) => {
      const orgId = (context.session as any).session?.activeOrganizationId;
      if (!orgId) throw new ORPCError("FORBIDDEN", { message: "No active organization" });
      return listOrganizationMembers(orgId);
    }),
});