import { ORPCError } from "@orpc/server";
import { db } from "@tanisya/db";
import * as schema from "@tanisya/db/schema/index";
import { and, desc, eq } from "drizzle-orm";
import z from "zod";

import { protectedProcedure } from "../index";
import {
	buildNsUpdateForm,
	makeId,
	normalizeDomainName,
	parseDomainSourceCredentials,
	requireActiveOrganizationId,
	requireAdminUser,
	requireLocalDomainForAdmin,
	requireLocalDomainOwnedByUser,
	requireSessionUser,
	stringifyJson,
} from "./_shared";
import { rdashRequest } from "./_rdash";

async function getSourceAccountForDomain(localDomain: { domainSourceAccountId: string }) {
	const rows = await db
		.select()
		.from(schema.domainSourceAccount)
		.where(eq(schema.domainSourceAccount.id, localDomain.domainSourceAccountId))
		.limit(1);

	if (!rows[0]) {
		throw new ORPCError("BAD_REQUEST", {
			message: "Domain source account tidak ditemukan.",
		});
	}

	return rows[0];
}

async function clearAndReplaceLocalNameservers(domainId: string, nameservers: string[], actorUserId: string) {
	await db.delete(schema.domainNameserver).where(eq(schema.domainNameserver.domainId, domainId));
	for (const [index, host] of nameservers.slice(0, 5).entries()) {
		await db.insert(schema.domainNameserver).values({
			id: makeId("dns"),
			domainId,
			position: index,
			host: host.trim().toLowerCase(),
			actorUserId,
		});
	}
}

export const domainManagementRouter = {
	listLocalDomains: protectedProcedure
		.input(z.object({ limit: z.number().int().positive().max(100).default(50) }))
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);
			return await db
				.select()
				.from(schema.domain)
				.where(
					and(
						eq(schema.domain.organizationId, organizationId),
						eq(schema.domain.customerUserId, currentUser.id),
					),
				)
				.orderBy(desc(schema.domain.createdAt))
				.limit(input.limit);
		}),

	listRemoteDomains: protectedProcedure
		.input(
			z.object({
				sourceAccountId: z.string().optional(),
				customerId: z.number().int().positive().optional(),
				name: z.string().optional(),
				status: z.number().int().min(0).max(8).optional(),
				verificationStatus: z.number().int().min(0).max(3).optional(),
				requiredDocument: z.number().int().min(0).max(1).optional(),
				createdRange: z.string().optional(),
				expiredRange: z.string().optional(),
				page: z.number().int().positive().default(1),
				limit: z.number().int().positive().max(100).default(20),
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
			if (!sourceAccount) throw new ORPCError("BAD_REQUEST", { message: "Domain source account tidak ditemukan." });

			return await rdashRequest<Record<string, unknown>>({
				credentials: parseDomainSourceCredentials(sourceAccount.credentials),
				path: "/domains",
				query: {
					customer_id: input.customerId,
					name: input.name,
					status: input.status,
					verification_status: input.verificationStatus,
					required_document: input.requiredDocument,
					created_range: input.createdRange,
					expired_range: input.expiredRange,
					page: input.page,
					limit: input.limit,
				},
			});
		}),

	getRemoteDomainDetail: protectedProcedure
		.input(
			z.object({
				localDomainId: z.string().optional(),
				sourceAccountId: z.string().optional(),
				externalDomainId: z.number().int().positive().optional(),
				domainName: z.string().optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);

			if (input.localDomainId) {
				const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id);
				if (!localDomain.externalDomainId) {
					throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
				}
				const sourceAccount = await getSourceAccountForDomain(localDomain);
				return await rdashRequest<Record<string, unknown>>({
					credentials: parseDomainSourceCredentials(sourceAccount.credentials),
					path: `/domains/${localDomain.externalDomainId}`,
				});
			}

			if (input.externalDomainId && input.sourceAccountId) {
				const sourceRows = await db
					.select()
					.from(schema.domainSourceAccount)
					.where(
						and(
							eq(schema.domainSourceAccount.organizationId, organizationId),
							eq(schema.domainSourceAccount.id, input.sourceAccountId),
						),
					)
					.limit(1);
				const sourceAccount = sourceRows[0];
				if (!sourceAccount) throw new ORPCError("BAD_REQUEST", { message: "Domain source account tidak ditemukan." });
				return await rdashRequest<Record<string, unknown>>({
					credentials: parseDomainSourceCredentials(sourceAccount.credentials),
					path: `/domains/${input.externalDomainId}`,
				});
			}

			if (input.domainName && input.sourceAccountId) {
				const sourceRows = await db
					.select()
					.from(schema.domainSourceAccount)
					.where(
						and(
							eq(schema.domainSourceAccount.organizationId, organizationId),
							eq(schema.domainSourceAccount.id, input.sourceAccountId),
						),
					)
					.limit(1);
				const sourceAccount = sourceRows[0];
				if (!sourceAccount) throw new ORPCError("BAD_REQUEST", { message: "Domain source account tidak ditemukan." });
				return await rdashRequest<Record<string, unknown>>({
					credentials: parseDomainSourceCredentials(sourceAccount.credentials),
					path: "/domains/details",
					query: { domain_name: normalizeDomainName(input.domainName) },
				});
			}

			throw new ORPCError("BAD_REQUEST", {
				message: "Gunakan localDomainId atau pasangan sourceAccountId dengan externalDomainId/domainName.",
			});
		}),

	deleteRemoteDomain: protectedProcedure
		.input(z.object({ localDomainId: z.string() }))
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);
			const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id);
			if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
			const sourceAccount = await getSourceAccountForDomain(localDomain);

			const providerResponse = await rdashRequest<Record<string, unknown>>({
				credentials: parseDomainSourceCredentials(sourceAccount.credentials),
				path: `/domains/${localDomain.externalDomainId}`,
				method: "DELETE",
			});

			await db.update(schema.domain).set({ status: 4, updatedByUserId: currentUser.id, metadata: stringifyJson({ delete: providerResponse }) }).where(eq(schema.domain.id, localDomain.id));
			return providerResponse;
		}),

	updateContacts: protectedProcedure
		.input(z.object({ localDomainId: z.string(), adminContactId: z.number().int().positive(), techContactId: z.number().int().positive(), billingContactId: z.number().int().positive(), registrantContactId: z.number().int().positive(), customerId: z.number().int().positive().optional() }))
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);
			const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id);
			if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
			const sourceAccount = await getSourceAccountForDomain(localDomain);

			const providerResponse = await rdashRequest<Record<string, unknown>>({
				credentials: parseDomainSourceCredentials(sourceAccount.credentials),
				path: `/domains/${localDomain.externalDomainId}/contacts`,
				method: "PUT",
				form: {
					admin_contact_id: input.adminContactId,
					tech_contact_id: input.techContactId,
					billing_contact_id: input.billingContactId,
					registrant_contact_id: input.registrantContactId,
					customer_id: input.customerId,
				},
			});

			const [updatedDomain] = await db.update(schema.domain).set({
				adminContactId: input.adminContactId,
				techContactId: input.techContactId,
				billingContactId: input.billingContactId,
				registrantContactId: input.registrantContactId,
				updatedByUserId: currentUser.id,
				metadata: stringifyJson({ updateContacts: providerResponse }),
			}).where(eq(schema.domain.id, localDomain.id)).returning();

			return { providerResponse, updatedDomain };
		}),

	updateNameservers: protectedProcedure
		.input(z.object({ localDomainId: z.string(), customerId: z.number().int().positive().optional(), nameservers: z.array(z.string().min(1)).min(2).max(5) }))
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);
			const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id);
			if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
			const sourceAccount = await getSourceAccountForDomain(localDomain);

			const providerResponse = await rdashRequest<Record<string, unknown>>({
				credentials: parseDomainSourceCredentials(sourceAccount.credentials),
				path: `/domains/${localDomain.externalDomainId}/ns`,
				method: "PUT",
				form: {
					customer_id: input.customerId,
					...buildNsUpdateForm(input.nameservers),
				},
			});

			await clearAndReplaceLocalNameservers(localDomain.id, input.nameservers, currentUser.id);
			await db.update(schema.domain).set({ updatedByUserId: currentUser.id, metadata: stringifyJson({ updateNameservers: providerResponse }) }).where(eq(schema.domain.id, localDomain.id));
			return providerResponse;
		}),

	getAuthCode: protectedProcedure
		.input(z.object({ localDomainId: z.string() }))
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);
			const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id);
			if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
			const sourceAccount = await getSourceAccountForDomain(localDomain);
			return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/auth_code` });
		}),

	resetAuthCode: protectedProcedure
		.input(z.object({ localDomainId: z.string(), authCode: z.string().min(8) }))
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);
			const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id);
			if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
			const sourceAccount = await getSourceAccountForDomain(localDomain);
			const providerResponse = await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/auth_code`, method: "PUT", form: { auth_code: input.authCode } });
			await db.update(schema.domain).set({ authCode: input.authCode, updatedByUserId: currentUser.id }).where(eq(schema.domain.id, localDomain.id));
			return providerResponse;
		}),

	lockTransfer: protectedProcedure.input(z.object({ localDomainId: z.string(), reason: z.string().optional() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/locked`, method: "PUT", form: { reason: input.reason } });
	}),

	unlockTransfer: protectedProcedure.input(z.object({ localDomainId: z.string() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/locked`, method: "DELETE" });
	}),

	lockRegistrar: protectedProcedure.input(z.object({ localDomainId: z.string(), reason: z.string().optional() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/registrar-locked`, method: "PUT", form: { reason: input.reason } });
	}),

	unlockRegistrar: protectedProcedure.input(z.object({ localDomainId: z.string() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/registrar-locked`, method: "DELETE" });
	}),

	cancelTransfer: protectedProcedure.input(z.object({ localDomainId: z.string() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/transfer/cancel`, method: "POST" });
	}),

	resendVerification: protectedProcedure.input(z.object({ localDomainId: z.string() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/verification/resend`, method: "POST" });
	}),

	showWhoisProtection: protectedProcedure.input(z.object({ localDomainId: z.string() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/whois-protection` });
	}),

	buyWhoisProtection: protectedProcedure.input(z.object({ localDomainId: z.string() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		const providerResponse = await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/whois-protection`, method: "POST" });
		await db.update(schema.domain).set({ buyWhoisProtection: true, updatedByUserId: currentUser.id }).where(eq(schema.domain.id, localDomain.id));
		return providerResponse;
	}),

	enableWhoisProtection: protectedProcedure.input(z.object({ localDomainId: z.string() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		const providerResponse = await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/whois-protection`, method: "PUT" });
		await db.update(schema.domain).set({ buyWhoisProtection: true, updatedByUserId: currentUser.id }).where(eq(schema.domain.id, localDomain.id));
		return providerResponse;
	}),

	disableWhoisProtection: protectedProcedure.input(z.object({ localDomainId: z.string() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		const providerResponse = await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/whois-protection`, method: "DELETE" });
		await db.update(schema.domain).set({ buyWhoisProtection: false, updatedByUserId: currentUser.id }).where(eq(schema.domain.id, localDomain.id));
		return providerResponse;
	}),

	getDnsRecords: protectedProcedure.input(z.object({ localDomainId: z.string() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/dns` });
	}),

	replaceDnsZone: protectedProcedure.input(z.object({ localDomainId: z.string(), records: z.array(z.object({ name: z.string().min(1), type: z.enum(["A", "AAAA", "MXE", "MX", "CNAME", "SPF"]), content: z.string().min(1), ttl: z.number().int().positive() })).min(1) })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		const form: Record<string, string | number> = {};
		input.records.forEach((record, index) => {
			form[`records[${index}][name]`] = record.name;
			form[`records[${index}][type]`] = record.type;
			form[`records[${index}][content]`] = record.content;
			form[`records[${index}][ttl]`] = record.ttl;
		});
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/dns`, method: "POST", form });
	}),

	upsertDnsRecord: protectedProcedure.input(z.object({ localDomainId: z.string(), name: z.string().min(1), type: z.enum(["A", "AAAA", "MXE", "MX", "CNAME", "SPF"]), content: z.string().min(1), ttl: z.number().int().positive().optional() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/dns`, method: "PUT", form: { name: input.name, type: input.type, content: input.content, ttl: input.ttl } });
	}),

	deleteDnsZone: protectedProcedure.input(z.object({ localDomainId: z.string() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/dns`, method: "DELETE" });
	}),

	deleteDnsRecord: protectedProcedure.input(z.object({ localDomainId: z.string(), name: z.string().min(1), type: z.enum(["A", "AAAA", "MXE", "MX", "CNAME", "SPF"]), content: z.string().min(1) })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/dns/record`, method: "DELETE", form: { name: input.name, type: input.type, content: input.content } });
	}),

	enableDnssecManagement: protectedProcedure.input(z.object({ localDomainId: z.string() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/dns/sec`, method: "POST" });
	}),

	disableDnssecManagement: protectedProcedure.input(z.object({ localDomainId: z.string() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/dns/sec`, method: "DELETE" });
	}),

	listDnssec: protectedProcedure.input(z.object({ localDomainId: z.string(), keytag: z.number().optional(), algorithm: z.number().optional(), digesttype: z.number().optional(), digest: z.string().optional() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/dnssec`, query: { keytag: input.keytag, algorithm: input.algorithm, digesttype: input.digesttype, digest: input.digest } });
	}),

	addDnssec: protectedProcedure.input(z.object({ localDomainId: z.string(), keytag: z.number().int().min(0).max(65535), algorithm: z.number().int(), digesttype: z.number().int(), digest: z.string().min(1) })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/dnssec`, method: "POST", form: { keytag: input.keytag, algorithm: input.algorithm, digesttype: input.digesttype, digest: input.digest } });
	}),

	deleteDnssec: protectedProcedure.input(z.object({ localDomainId: z.string(), dnssecId: z.number().int().positive() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/dnssec/${input.dnssecId}`, method: "DELETE" });
	}),

	listForwarding: protectedProcedure.input(z.object({ localDomainId: z.string() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/forwarding` });
	}),

	upsertForwarding: protectedProcedure.input(z.object({ localDomainId: z.string(), from: z.string().min(1), to: z.string().url() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/forwarding`, method: "POST", form: { from: input.from, to: input.to } });
	}),

	deleteForwarding: protectedProcedure.input(z.object({ localDomainId: z.string(), forwardingId: z.number().int().positive() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/forwarding/${input.forwardingId}`, method: "DELETE" });
	}),

	listHosts: protectedProcedure.input(z.object({ localDomainId: z.string(), field: z.string().optional(), type: z.enum(["asc", "desc"]).optional(), hostname: z.string().optional() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/hosts`, query: { "f_params[orderBy][field]": input.field, "f_params[orderBy][type]": input.type, hostname: input.hostname } });
	}),

	createHost: protectedProcedure.input(z.object({ localDomainId: z.string(), hostname: z.string().min(1), ipAddress: z.string().min(1) })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/hosts`, method: "POST", form: { hostname: input.hostname, ip_address: input.ipAddress } });
	}),

	getHost: protectedProcedure.input(z.object({ localDomainId: z.string(), hostId: z.number().int().positive() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/hosts/${input.hostId}` });
	}),

	updateHost: protectedProcedure.input(z.object({ localDomainId: z.string(), hostId: z.number().int().positive(), hostname: z.string().optional(), ipAddress: z.string().optional() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/hosts/${input.hostId}`, method: "PUT", form: { hostname: input.hostname, ip_address: input.ipAddress } });
	}),

	deleteHost: protectedProcedure.input(z.object({ localDomainId: z.string(), hostId: z.number().int().positive() })).handler(async ({ context, input }) => {
		const currentUser = await requireSessionUser(context); const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/hosts/${input.hostId}`, method: "DELETE" });
	}),

	moveDomainToCustomer: protectedProcedure.input(z.object({ localDomainId: z.string(), customerId: z.number().int().positive() })).handler(async ({ context, input }) => {
		const adminUser = await requireAdminUser(context); const organizationId = await requireActiveOrganizationId(context, adminUser.id);
		const localDomain = await requireLocalDomainForAdmin(input.localDomainId, organizationId); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		return await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/move`, method: "POST", form: { customer_id: input.customerId } });
	}),

	suspend: protectedProcedure.input(z.object({ localDomainId: z.string(), type: z.number().int().positive(), reason: z.string().min(1) })).handler(async ({ context, input }) => {
		const adminUser = await requireAdminUser(context); const organizationId = await requireActiveOrganizationId(context, adminUser.id);
		const localDomain = await requireLocalDomainForAdmin(input.localDomainId, organizationId); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		const providerResponse = await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/suspended`, method: "PUT", form: { type: input.type, reason: input.reason } });
		await db.update(schema.domain).set({ status: 7, updatedByUserId: adminUser.id, metadata: stringifyJson({ suspend: providerResponse }) }).where(eq(schema.domain.id, localDomain.id));
		return providerResponse;
	}),

	unsuspend: protectedProcedure.input(z.object({ localDomainId: z.string() })).handler(async ({ context, input }) => {
		const adminUser = await requireAdminUser(context); const organizationId = await requireActiveOrganizationId(context, adminUser.id);
		const localDomain = await requireLocalDomainForAdmin(input.localDomainId, organizationId); if (!localDomain.externalDomainId) throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
		const sourceAccount = await getSourceAccountForDomain(localDomain);
		const providerResponse = await rdashRequest<Record<string, unknown>>({ credentials: parseDomainSourceCredentials(sourceAccount.credentials), path: `/domains/${localDomain.externalDomainId}/suspended`, method: "DELETE" });
		await db.update(schema.domain).set({ status: 1, updatedByUserId: adminUser.id, metadata: stringifyJson({ unsuspend: providerResponse }) }).where(eq(schema.domain.id, localDomain.id));
		return providerResponse;
	}),
};
