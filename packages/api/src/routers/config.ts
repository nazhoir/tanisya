import { db } from "@tanisya/db";
import * as schema from "@tanisya/db/schema/index";
import { and, eq } from "drizzle-orm";
import z from "zod";

import { protectedProcedure } from "../index";
import {
	makeId,
	requireActiveOrganizationId,
	requireAdminUser,
	stringifyJson,
} from "./_shared";

const sourceCredentialsInput = z.object({
	resellerId: z.string().min(1),
	apiKey: z.string().min(1),
	baseUrl: z.string().url().optional(),
});

export const domainConfigRouter = {
	listSourceAccounts: protectedProcedure.handler(async ({ context }) => {
		const currentUser = await requireAdminUser(context);
		const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		return await db
			.select()
			.from(schema.domainSourceAccount)
			.where(eq(schema.domainSourceAccount.organizationId, organizationId));
	}),

	upsertSourceAccount: protectedProcedure
		.input(
			z.object({
				id: z.string().optional(),
				code: z.string().min(1),
				name: z.string().min(1),
				providerCode: z.string().default("rdash"),
				externalAccountId: z.number().int().positive().optional(),
				isDefault: z.boolean().default(false),
				isActive: z.boolean().default(true),
				credentials: sourceCredentialsInput,
				metadata: z.record(z.string(), z.unknown()).optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			const currentUser = await requireAdminUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);

			if (input.isDefault) {
				await db
					.update(schema.domainSourceAccount)
					.set({ isDefault: false, updatedByUserId: currentUser.id })
					.where(eq(schema.domainSourceAccount.organizationId, organizationId));
			}

			if (input.id) {
				const [updated] = await db
					.update(schema.domainSourceAccount)
					.set({
						code: input.code,
						name: input.name,
						providerCode: input.providerCode,
						externalAccountId: input.externalAccountId,
						isDefault: input.isDefault,
						isActive: input.isActive,
						credentials: stringifyJson(input.credentials),
						metadata: stringifyJson(input.metadata),
						updatedByUserId: currentUser.id,
					})
					.where(
						and(
							eq(schema.domainSourceAccount.id, input.id),
							eq(schema.domainSourceAccount.organizationId, organizationId),
						),
					)
					.returning();
				return updated;
			}

			const [created] = await db
				.insert(schema.domainSourceAccount)
				.values({
					id: makeId("dsa"),
					organizationId,
					code: input.code,
					name: input.name,
					providerCode: input.providerCode,
					externalAccountId: input.externalAccountId,
					isDefault: input.isDefault,
					isActive: input.isActive,
					credentials: stringifyJson(input.credentials),
					metadata: stringifyJson(input.metadata),
					createdByUserId: currentUser.id,
					updatedByUserId: currentUser.id,
				})
				.returning();
			return created;
		}),

	deleteSourceAccount: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ context, input }) => {
			const currentUser = await requireAdminUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);
			await db
				.delete(schema.domainSourceAccount)
				.where(
					and(
						eq(schema.domainSourceAccount.id, input.id),
						eq(schema.domainSourceAccount.organizationId, organizationId),
					),
				);
			return { success: true };
		}),

	listTldPolicies: protectedProcedure.handler(async ({ context }) => {
		const currentUser = await requireAdminUser(context);
		const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		return await db
			.select()
			.from(schema.domainTldPolicy)
			.where(eq(schema.domainTldPolicy.organizationId, organizationId));
	}),

	upsertTldPolicy: protectedProcedure
		.input(
			z.object({
				id: z.string().optional(),
				tld: z.string().min(2),
				domainSourceAccountId: z.string(),
				defaultDomainContactSetId: z.string().optional(),
				isActive: z.boolean().default(true),
				allowWhoisProtection: z.boolean().default(true),
				allowPremiumDomains: z.boolean().default(false),
				metadata: z.record(z.string(), z.unknown()).optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			const currentUser = await requireAdminUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);

			const tld = input.tld.startsWith(".") ? input.tld.toLowerCase() : `.${input.tld.toLowerCase()}`;

			if (input.id) {
				const [updated] = await db
					.update(schema.domainTldPolicy)
					.set({
						tld,
						domainSourceAccountId: input.domainSourceAccountId,
						defaultDomainContactSetId: input.defaultDomainContactSetId,
						isActive: input.isActive,
						allowWhoisProtection: input.allowWhoisProtection,
						allowPremiumDomains: input.allowPremiumDomains,
						metadata: stringifyJson(input.metadata),
						updatedByUserId: currentUser.id,
					})
					.where(
						and(
							eq(schema.domainTldPolicy.id, input.id),
							eq(schema.domainTldPolicy.organizationId, organizationId),
						),
					)
					.returning();
				return updated;
			}

			const [created] = await db
				.insert(schema.domainTldPolicy)
				.values({
					id: makeId("dtp"),
					organizationId,
					tld,
					domainSourceAccountId: input.domainSourceAccountId,
					defaultDomainContactSetId: input.defaultDomainContactSetId,
					isActive: input.isActive,
					allowWhoisProtection: input.allowWhoisProtection,
					allowPremiumDomains: input.allowPremiumDomains,
					metadata: stringifyJson(input.metadata),
					createdByUserId: currentUser.id,
					updatedByUserId: currentUser.id,
				})
				.returning();
			return created;
		}),

	deleteTldPolicy: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ context, input }) => {
			const currentUser = await requireAdminUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);
			await db
				.delete(schema.domainTldPolicy)
				.where(
					and(
						eq(schema.domainTldPolicy.id, input.id),
						eq(schema.domainTldPolicy.organizationId, organizationId),
					),
				);
			return { success: true };
		}),
};
