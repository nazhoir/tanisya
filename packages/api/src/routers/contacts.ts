import { ORPCError } from "@orpc/server";
import { db } from "@tanisya/db";
import * as schema from "@tanisya/db/schema/index";
import { and, eq } from "drizzle-orm";
import z from "zod";

import { protectedProcedure } from "../index";
import {
	makeId,
	parseDomainSourceCredentials,
	requireActiveOrganizationId,
	requireSessionUser,
	requireUserProfile,
	stringifyJson,
} from "./_shared";
import { extractProviderId, rdashRequest } from "./_rdash";

const providerContactInput = z.object({
	sourceAccountId: z.string().optional(),
	label: z.enum(["Default", "Admin", "Technical", "Billing", "Registrant"]),
	name: z.string().min(1),
	email: z.string().email(),
	organizationName: z.string().min(1),
	street1: z.string().min(1),
	street2: z.string().optional(),
	city: z.string().min(1),
	state: z.string().min(1),
	countryCode: z.string().length(2),
	postalCode: z.string().min(1),
	voice: z.string().min(9).max(20),
	fax: z.string().optional(),
	reference: z.string().optional(),
});

async function requireSourceCredentials(organizationId: string, sourceAccountId?: string) {
	const sourceRows = await db
		.select()
		.from(schema.domainSourceAccount)
		.where(
			sourceAccountId
				? and(
						eq(schema.domainSourceAccount.organizationId, organizationId),
						eq(schema.domainSourceAccount.id, sourceAccountId),
				  )
				: and(
						eq(schema.domainSourceAccount.organizationId, organizationId),
						eq(schema.domainSourceAccount.isDefault, true),
				  ),
		)
		.limit(1);

	const sourceAccount = sourceRows[0];
	if (!sourceAccount) {
		throw new ORPCError("BAD_REQUEST", { message: "Domain source account tidak ditemukan." });
	}

	return {
		sourceAccount,
		credentials: parseDomainSourceCredentials(sourceAccount.credentials),
	};
}

export const domainContactRouter = {
	listProviderContacts: protectedProcedure
		.input(
			z.object({
				sourceAccountId: z.string().optional(),
				name: z.string().optional(),
				email: z.string().optional(),
				organization: z.string().optional(),
				city: z.string().optional(),
				page: z.number().int().positive().default(1),
				limit: z.number().int().positive().max(100).default(20),
			}),
		)
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);
			const profile = await requireUserProfile(currentUser.id);
			if (!profile.externalCustomerId) {
				throw new ORPCError("BAD_REQUEST", { message: "External customer id belum tersedia." });
			}

			const { credentials } = await requireSourceCredentials(organizationId, input.sourceAccountId);

			return await rdashRequest<Record<string, unknown>>({
				credentials,
				path: `/customers/${profile.externalCustomerId}/contacts`,
				query: {
					name: input.name,
					email: input.email,
					organization: input.organization,
					city: input.city,
					page: input.page,
					limit: input.limit,
				},
			});
		}),

	createProviderContact: protectedProcedure
		.input(providerContactInput)
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);
			const profile = await requireUserProfile(currentUser.id);
			if (!profile.externalCustomerId) {
				throw new ORPCError("BAD_REQUEST", { message: "External customer id belum tersedia." });
			}

			const { sourceAccount, credentials } = await requireSourceCredentials(
				organizationId,
				input.sourceAccountId,
			);

			const providerResponse = await rdashRequest<Record<string, unknown>>({
				credentials,
				path: `/customers/${profile.externalCustomerId}/contacts`,
				method: "POST",
				form: {
					label: input.label,
					name: input.name,
					email: input.email,
					organization: input.organizationName,
					street_1: input.street1,
					street_2: input.street2,
					city: input.city,
					state: input.state,
					country_code: input.countryCode.toUpperCase(),
					postal_code: input.postalCode,
					voice: input.voice,
					fax: input.fax,
					reference: input.reference,
				},
			});

			const externalContactId = extractProviderId(providerResponse);
			if (!externalContactId) {
				throw new ORPCError("BAD_GATEWAY", {
					message: "Provider tidak mengembalikan contact id yang valid.",
					data: providerResponse,
				});
			}

			const existingLocal = await db
				.select()
				.from(schema.customerContact)
				.where(eq(schema.customerContact.externalContactId, externalContactId))
				.limit(1);

			const localContact = existingLocal[0]
				? (
					await db
						.update(schema.customerContact)
						.set({
							providerCode: sourceAccount.providerCode,
							label: input.label,
							name: input.name,
							email: input.email,
							organizationName: input.organizationName,
							street1: input.street1,
							street2: input.street2,
							city: input.city,
							state: input.state,
							countryCode: input.countryCode.toUpperCase(),
							postalCode: input.postalCode,
							voice: input.voice,
							fax: input.fax,
							reference: input.reference,
							metadata: stringifyJson(providerResponse),
							updatedByUserId: currentUser.id,
						})
						.where(eq(schema.customerContact.id, existingLocal[0].id))
						.returning()
				)[0]
				: (
					await db
						.insert(schema.customerContact)
						.values({
							id: makeId("cct"),
							userProfileId: profile.id,
							providerCode: sourceAccount.providerCode,
							externalContactId,
							label: input.label,
							name: input.name,
							email: input.email,
							organizationName: input.organizationName,
							street1: input.street1,
							street2: input.street2,
							city: input.city,
							state: input.state,
							countryCode: input.countryCode.toUpperCase(),
							postalCode: input.postalCode,
							voice: input.voice,
							fax: input.fax,
							reference: input.reference,
							metadata: stringifyJson(providerResponse),
							createdByUserId: currentUser.id,
							updatedByUserId: currentUser.id,
						})
						.returning()
				)[0];

			return { providerResponse, localContact };
		}),

	updateProviderContact: protectedProcedure
		.input(providerContactInput.extend({ contactId: z.number().int().positive() }))
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);
			const profile = await requireUserProfile(currentUser.id);
			if (!profile.externalCustomerId) {
				throw new ORPCError("BAD_REQUEST", { message: "External customer id belum tersedia." });
			}

			const { sourceAccount, credentials } = await requireSourceCredentials(
				organizationId,
				input.sourceAccountId,
			);

			const providerResponse = await rdashRequest<Record<string, unknown>>({
				credentials,
				path: `/customers/${profile.externalCustomerId}/contacts/${input.contactId}`,
				method: "PUT",
				form: {
					label: input.label,
					name: input.name,
					email: input.email,
					organization: input.organizationName,
					street_1: input.street1,
					street_2: input.street2,
					city: input.city,
					state: input.state,
					country_code: input.countryCode.toUpperCase(),
					postal_code: input.postalCode,
					voice: input.voice,
					fax: input.fax,
				},
			});

			const localRows = await db
				.select()
				.from(schema.customerContact)
				.where(eq(schema.customerContact.externalContactId, input.contactId))
				.limit(1);

			const localContact = localRows[0]
				? (
					await db
						.update(schema.customerContact)
						.set({
							providerCode: sourceAccount.providerCode,
							label: input.label,
							name: input.name,
							email: input.email,
							organizationName: input.organizationName,
							street1: input.street1,
							street2: input.street2,
							city: input.city,
							state: input.state,
							countryCode: input.countryCode.toUpperCase(),
							postalCode: input.postalCode,
							voice: input.voice,
							fax: input.fax,
							metadata: stringifyJson(providerResponse),
							updatedByUserId: currentUser.id,
						})
						.where(eq(schema.customerContact.id, localRows[0].id))
						.returning()
				)[0]
				: null;

			return { providerResponse, localContact };
		}),

	deleteProviderContact: protectedProcedure
		.input(
			z.object({
				sourceAccountId: z.string().optional(),
				contactId: z.number().int().positive(),
			}),
		)
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);
			const profile = await requireUserProfile(currentUser.id);
			if (!profile.externalCustomerId) {
				throw new ORPCError("BAD_REQUEST", { message: "External customer id belum tersedia." });
			}

			const { credentials } = await requireSourceCredentials(organizationId, input.sourceAccountId);
			const providerResponse = await rdashRequest<Record<string, unknown>>({
				credentials,
				path: `/customers/${profile.externalCustomerId}/contacts/${input.contactId}`,
				method: "DELETE",
			});

			const localRows = await db
				.select()
				.from(schema.customerContact)
				.where(eq(schema.customerContact.externalContactId, input.contactId))
				.limit(1);
			if (localRows[0]) {
				await db.delete(schema.customerContact).where(eq(schema.customerContact.id, localRows[0].id));
			}

			return providerResponse;
		}),

	listLocalContactSets: protectedProcedure.handler(async ({ context }) => {
		const currentUser = await requireSessionUser(context);
		const profile = await requireUserProfile(currentUser.id);

		return await db
			.select()
			.from(schema.domainContactSet)
			.where(eq(schema.domainContactSet.userProfileId, profile.id));
	}),

	upsertLocalContactSet: protectedProcedure
		.input(
			z.object({
				id: z.string().optional(),
				code: z.string().min(1),
				name: z.string().min(1),
				isDefault: z.boolean().default(false),
				isActive: z.boolean().default(true),
				adminContactId: z.number().int().positive(),
				techContactId: z.number().int().positive(),
				billingContactId: z.number().int().positive(),
				registrantContactId: z.number().int().positive(),
				notes: z.string().optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const profile = await requireUserProfile(currentUser.id);

			if (input.isDefault) {
				await db
					.update(schema.domainContactSet)
					.set({ isDefault: false, updatedByUserId: currentUser.id })
					.where(eq(schema.domainContactSet.userProfileId, profile.id));
			}

			if (input.id) {
				const [updated] = await db
					.update(schema.domainContactSet)
					.set({
						code: input.code,
						name: input.name,
						isDefault: input.isDefault,
						isActive: input.isActive,
						adminContactId: input.adminContactId,
						techContactId: input.techContactId,
						billingContactId: input.billingContactId,
						registrantContactId: input.registrantContactId,
						notes: input.notes,
						updatedByUserId: currentUser.id,
					})
					.where(
						and(
							eq(schema.domainContactSet.id, input.id),
							eq(schema.domainContactSet.userProfileId, profile.id),
						),
					)
					.returning();
				return updated;
			}

			const [created] = await db
				.insert(schema.domainContactSet)
				.values({
					id: makeId("dcs"),
					userProfileId: profile.id,
					code: input.code,
					name: input.name,
					isDefault: input.isDefault,
					isActive: input.isActive,
					adminContactId: input.adminContactId,
					techContactId: input.techContactId,
					billingContactId: input.billingContactId,
					registrantContactId: input.registrantContactId,
					notes: input.notes,
					createdByUserId: currentUser.id,
					updatedByUserId: currentUser.id,
				})
				.returning();

			return created;
		}),

	deleteLocalContactSet: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const profile = await requireUserProfile(currentUser.id);
			await db
				.delete(schema.domainContactSet)
				.where(
					and(
						eq(schema.domainContactSet.id, input.id),
						eq(schema.domainContactSet.userProfileId, profile.id),
					),
				);
			return { success: true };
		}),
};
