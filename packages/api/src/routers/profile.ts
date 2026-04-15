import { ORPCError } from "@orpc/server";
import { db } from "@tanisya/db";
import * as schema from "@tanisya/db/schema/index";
import { and, eq } from "drizzle-orm";
import z from "zod";

import { protectedProcedure } from "../index";
import {
	ensureValue,
	makeId,
	parseDomainSourceCredentials,
	requireActiveOrganizationId,
	requireSessionUser,
	requireUserProfile,
	stringifyJson,
} from "./_shared";
import { extractProviderId, rdashRequest } from "./_rdash";

const userProfileInput = z.object({
	organizationName: z.string().min(1),
	street1: z.string().min(1),
	street2: z.string().optional(),
	city: z.string().min(1),
	state: z.string().min(1),
	countryCode: z.string().length(2),
	postalCode: z.string().min(1),
	voice: z.string().min(9).max(20),
	fax: z.string().optional(),
});

export const domainProfileRouter = {
	getMine: protectedProcedure.handler(async ({ context }) => {
		const currentUser = await requireSessionUser(context);

		const rows = await db
			.select()
			.from(schema.userProfile)
			.where(eq(schema.userProfile.userId, currentUser.id))
			.limit(1);

		return rows[0] ?? null;
	}),

	upsertLocal: protectedProcedure
		.input(userProfileInput)
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const existingRows = await db
				.select()
				.from(schema.userProfile)
				.where(eq(schema.userProfile.userId, currentUser.id))
				.limit(1);
			const existing = existingRows[0];

			if (existing) {
				const [updated] = await db
					.update(schema.userProfile)
					.set({
						organizationName: input.organizationName,
						street1: input.street1,
						street2: input.street2,
						city: input.city,
						state: input.state,
						countryCode: input.countryCode.toUpperCase(),
						postalCode: input.postalCode,
						voice: input.voice,
						fax: input.fax,
						updatedByUserId: currentUser.id,
					})
					.where(eq(schema.userProfile.id, existing.id))
					.returning();

				return updated;
			}

			const [created] = await db
				.insert(schema.userProfile)
				.values({
					id: makeId("upr"),
					userId: currentUser.id,
					organizationName: input.organizationName,
					street1: input.street1,
					street2: input.street2,
					city: input.city,
					state: input.state,
					countryCode: input.countryCode.toUpperCase(),
					postalCode: input.postalCode,
					voice: input.voice,
					fax: input.fax,
					createdByUserId: currentUser.id,
					updatedByUserId: currentUser.id,
				})
				.returning();

			return created;
		}),

	syncProviderCustomer: protectedProcedure
		.input(
			userProfileInput.extend({
				sourceAccountId: z.string().optional(),
				providerPassword: z.string().min(6).optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);

			const sourceRows = await db
				.select()
				.from(schema.domainSourceAccount)
				.where(
					input.sourceAccountId
						? and(
								eq(schema.domainSourceAccount.organizationId, organizationId),
								eq(schema.domainSourceAccount.id, input.sourceAccountId),
						  )
						: and(
								eq(schema.domainSourceAccount.organizationId, organizationId),
								eq(schema.domainSourceAccount.isDefault, true),
						  ),
				)
				.limit(1);

			const sourceAccount = sourceRows[0];
			if (!sourceAccount) {
				throw new ORPCError("BAD_REQUEST", {
					message: "Domain source account tidak ditemukan.",
				});
			}

			const localProfileRows = await db
				.select()
				.from(schema.userProfile)
				.where(eq(schema.userProfile.userId, currentUser.id))
				.limit(1);
			const localProfile = localProfileRows[0];

			const profile = ensureValue(
				localProfile
					? (
						await db
							.update(schema.userProfile)
							.set({
								organizationName: input.organizationName,
								street1: input.street1,
								street2: input.street2,
								city: input.city,
								state: input.state,
								countryCode: input.countryCode.toUpperCase(),
								postalCode: input.postalCode,
								voice: input.voice,
								fax: input.fax,
								updatedByUserId: currentUser.id,
							})
							.where(eq(schema.userProfile.id, localProfile.id))
							.returning()
					)[0]
					: (
						await db
							.insert(schema.userProfile)
							.values({
								id: makeId("upr"),
								userId: currentUser.id,
								organizationName: input.organizationName,
								street1: input.street1,
								street2: input.street2,
								city: input.city,
								state: input.state,
								countryCode: input.countryCode.toUpperCase(),
								postalCode: input.postalCode,
								voice: input.voice,
								fax: input.fax,
								createdByUserId: currentUser.id,
								updatedByUserId: currentUser.id,
							})
							.returning()
					)[0],
				"Gagal membuat atau memperbarui user profile sinkronisasi provider.",
			);

			const credentials = parseDomainSourceCredentials(sourceAccount.credentials);
			const baseForm = {
				name: currentUser.name ?? currentUser.email ?? "Tanisya User",
				email: currentUser.email ?? "",
				organization: input.organizationName,
				street_1: input.street1,
				street_2: input.street2,
				city: input.city,
				state: input.state,
				country_code: input.countryCode.toUpperCase(),
				postal_code: input.postalCode,
				voice: input.voice,
				fax: input.fax,
			};

			let providerResponse: Record<string, unknown>;
			if (profile.externalCustomerId) {
				providerResponse = await rdashRequest<Record<string, unknown>>({
					credentials,
					path: `/customers/${profile.externalCustomerId}`,
					method: "PUT",
					form: {
						...baseForm,
						password: input.providerPassword,
						password_confirmation: input.providerPassword,
					},
				});
			} else {
				if (!input.providerPassword) {
					throw new ORPCError("BAD_REQUEST", {
						message:
							"providerPassword wajib diisi saat pertama kali membuat customer provider.",
					});
				}

				providerResponse = await rdashRequest<Record<string, unknown>>({
					credentials,
					path: "/customers",
					method: "POST",
					form: {
						...baseForm,
						password: input.providerPassword,
						password_confirmation: input.providerPassword,
					},
				});
			}

			const externalCustomerId = extractProviderId(providerResponse) ?? profile.externalCustomerId;
			if (!externalCustomerId) {
				throw new ORPCError("BAD_GATEWAY", {
					message: "Provider tidak mengembalikan customer id yang valid.",
					data: providerResponse,
				});
			}

			const updatedProfileRows = await db
				.update(schema.userProfile)
				.set({
					providerCode: sourceAccount.providerCode,
					externalCustomerId,
					metadata: stringifyJson({
						sourceAccountId: sourceAccount.id,
						providerResponse,
					}),
					updatedByUserId: currentUser.id,
				})
				.where(eq(schema.userProfile.id, profile.id))
				.returning();

			const updatedProfile = ensureValue(updatedProfileRows[0], "Gagal menyimpan external customer id ke user profile.");

			return {
				profile: updatedProfile,
				providerResponse,
			};
		}),

	getProviderCustomer: protectedProcedure
		.input(z.object({ sourceAccountId: z.string().optional() }))
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);
			const profile = await requireUserProfile(currentUser.id);

			if (!profile.externalCustomerId) {
				throw new ORPCError("BAD_REQUEST", {
					message: "External customer id belum tersedia di user profile.",
				});
			}

			const sourceRows = await db
				.select()
				.from(schema.domainSourceAccount)
				.where(
					input.sourceAccountId
						? and(
								eq(schema.domainSourceAccount.organizationId, organizationId),
								eq(schema.domainSourceAccount.id, input.sourceAccountId),
						  )
						: and(
								eq(schema.domainSourceAccount.organizationId, organizationId),
								eq(schema.domainSourceAccount.isDefault, true),
						  ),
				)
				.limit(1);
			const sourceAccount = sourceRows[0];
			if (!sourceAccount) {
				throw new ORPCError("BAD_REQUEST", {
					message: "Domain source account tidak ditemukan.",
				});
			}

			return await rdashRequest<Record<string, unknown>>({
				credentials: parseDomainSourceCredentials(sourceAccount.credentials),
				path: `/customers/${profile.externalCustomerId}`,
			});
		}),
};
