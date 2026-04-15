import { ORPCError } from "@orpc/server";
import { db } from "@tanisya/db";
import * as schema from "@tanisya/db/schema/index";
import { and, desc, eq } from "drizzle-orm";
import z from "zod";

import { protectedProcedure } from "../index";
import {
	ensureValue,
	listLatestVerificationDocuments,
	makeId,
	parseDomainSourceCredentials,
	requireActiveOrganizationId,
	requireAdminUser,
	requireDomainVerificationDocument,
	requireLocalDomainForAdmin,
	requireLocalDomainOwnedByUser,
	requireSessionUser,
	stringifyJson,
} from "./_shared";
import { rdashRequest } from "./_rdash";
import { deleteVerificationFileFromStorage, uploadVerificationFileToStorage } from "./_storage";

async function getSourceAccountForDomain(localDomain: { domainSourceAccountId: string }) {
	const rows = await db
		.select()
		.from(schema.domainSourceAccount)
		.where(eq(schema.domainSourceAccount.id, localDomain.domainSourceAccountId))
		.limit(1);
	if (!rows[0]) {
		throw new ORPCError("BAD_REQUEST", { message: "Domain source account tidak ditemukan." });
	}
	return rows[0];
}

export const domainVerificationRouter = {
	listMyDocuments: protectedProcedure
		.input(z.object({ localDomainId: z.string(), limit: z.number().int().positive().max(50).default(20) }))
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);
			const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id);
			return await listLatestVerificationDocuments(localDomain.id, input.limit);
		}),

	uploadMyDocument: protectedProcedure
		.input(
			z.object({
				localDomainId: z.string(),
				fileName: z.string().min(1),
				contentType: z.string().min(1),
				fileBase64: z.string().min(1),
				documentType: z.string().default("verification"),
				notes: z.string().optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);
			const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id);

			if (localDomain.requiredDocument !== 1) {
				throw new ORPCError("BAD_REQUEST", {
					message: "Domain ini saat ini tidak ditandai membutuhkan dokumen verifikasi.",
				});
			}

			const storage = await uploadVerificationFileToStorage({
				organizationId,
				domainId: localDomain.id,
				domainName: localDomain.name,
				fileName: input.fileName,
				contentType: input.contentType,
				fileBase64: input.fileBase64,
			});

			const documentRows = await db
				.insert(schema.domainVerificationDocument)
				.values({
					id: makeId("dvd"),
					domainId: localDomain.id,
					organizationId,
					customerUserId: currentUser.id,
					providerCode: localDomain.providerCode,
					externalDomainId: localDomain.externalDomainId,
					documentType: input.documentType,
					originalFileName: input.fileName,
					contentType: input.contentType,
					sizeBytes: storage.sizeBytes,
					checksumSha256: storage.checksumSha256,
					storageBucket: storage.bucket,
					storageKey: storage.key,
					publicUrl: storage.publicUrl,
					uploadStatus: "uploaded",
					verificationStatus: "ready_for_admin",
					notes: input.notes,
					metadata: stringifyJson({ source: "app-upload" }),
					uploadedByUserId: currentUser.id,
					updatedByUserId: currentUser.id,
				})
				.returning();

			const createdDocument = ensureValue(documentRows[0], "Gagal membuat dokumen verifikasi domain.");

			await db.insert(schema.productProcessLog).values({
				id: makeId("log"),
				organizationId,
				actorUserId: currentUser.id,
				entityType: "domain_verification_document",
				entityId: createdDocument.id,
				processType: "upload_verification_document",
				status: "success",
				message: `Dokumen verifikasi diunggah untuk domain ${localDomain.name}.`,
				requestPayload: stringifyJson({ fileName: input.fileName, contentType: input.contentType }),
				responsePayload: stringifyJson({ publicUrl: storage.publicUrl, storageKey: storage.key }),
			});

			return createdDocument;
		}),

	deleteMyDocument: protectedProcedure
		.input(z.object({ localDomainId: z.string(), documentId: z.string() }))
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);
			const localDomain = await requireLocalDomainOwnedByUser(input.localDomainId, organizationId, currentUser.id);
			const verificationDocument = await requireDomainVerificationDocument(input.documentId, organizationId);

			if (verificationDocument.domainId !== localDomain.id || verificationDocument.customerUserId !== currentUser.id) {
				throw new ORPCError("FORBIDDEN", { message: "Kamu tidak dapat menghapus dokumen ini." });
			}
			if (verificationDocument.verificationStatus === "submitted_to_provider") {
				throw new ORPCError("BAD_REQUEST", {
					message: "Dokumen yang sudah disubmit ke provider tidak bisa dihapus user.",
				});
			}

			await deleteVerificationFileFromStorage(verificationDocument.storageKey);
			await db.delete(schema.domainVerificationDocument).where(eq(schema.domainVerificationDocument.id, verificationDocument.id));
			return { success: true };
		}),

	adminListPendingDocuments: protectedProcedure
		.input(z.object({ limit: z.number().int().positive().max(100).default(50) }))
		.handler(async ({ context, input }) => {
			const adminUser = await requireAdminUser(context);
			const organizationId = await requireActiveOrganizationId(context, adminUser.id);
			return await db
				.select()
				.from(schema.domainVerificationDocument)
				.where(
					and(
						eq(schema.domainVerificationDocument.organizationId, organizationId),
						eq(schema.domainVerificationDocument.uploadStatus, "uploaded"),
					),
				)
				.orderBy(desc(schema.domainVerificationDocument.createdAt))
				.limit(input.limit);
		}),

	adminRequestProviderUploadLink: protectedProcedure
		.input(z.object({ localDomainId: z.string(), documentId: z.string().optional() }))
		.handler(async ({ context, input }) => {
			const adminUser = await requireAdminUser(context);
			const organizationId = await requireActiveOrganizationId(context, adminUser.id);
			const localDomain = await requireLocalDomainForAdmin(input.localDomainId, organizationId);
			if (!localDomain.externalDomainId) {
				throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
			}
			if (localDomain.requiredDocument !== 1) {
				throw new ORPCError("BAD_REQUEST", { message: "Domain ini tidak membutuhkan dokumen verifikasi." });
			}

			const selectedDocument = input.documentId
				? await requireDomainVerificationDocument(input.documentId, organizationId)
				: (
					await db
						.select()
						.from(schema.domainVerificationDocument)
						.where(eq(schema.domainVerificationDocument.domainId, localDomain.id))
						.orderBy(desc(schema.domainVerificationDocument.createdAt))
						.limit(1)
				)[0];

			if (!selectedDocument) {
				throw new ORPCError("NOT_FOUND", {
					message: "Belum ada dokumen verifikasi yang diunggah untuk domain ini.",
				});
			}

			const sourceAccount = await getSourceAccountForDomain(localDomain);
			const providerResponse = await rdashRequest<Record<string, unknown>>({
				credentials: parseDomainSourceCredentials(sourceAccount.credentials),
				path: `/domains/${localDomain.externalDomainId}/documents/link`,
				method: "POST",
			});

			const providerUploadLink =
				(typeof providerResponse.url === "string" && providerResponse.url) ||
				(typeof providerResponse.link === "string" && providerResponse.link) ||
				(typeof (providerResponse.data as Record<string, unknown> | undefined)?.url === "string"
					? ((providerResponse.data as Record<string, unknown>).url as string)
					: undefined);

			const updatedDocumentRows = await db
				.update(schema.domainVerificationDocument)
				.set({
					verificationStatus: "provider_link_requested",
					providerUploadLink,
					providerLinkRequestedAt: new Date(),
					updatedByUserId: adminUser.id,
					metadata: stringifyJson({
						...(selectedDocument.metadata ? { previous: selectedDocument.metadata } : {}),
						providerLinkResponse: providerResponse,
					}),
				})
				.where(eq(schema.domainVerificationDocument.id, selectedDocument.id))
				.returning();

			const updatedDocument = ensureValue(updatedDocumentRows[0], "Gagal memperbarui dokumen verifikasi domain.");

			await db.insert(schema.productProcessLog).values({
				id: makeId("log"),
				organizationId,
				actorUserId: adminUser.id,
				entityType: "domain_verification_document",
				entityId: updatedDocument.id,
				processType: "request_provider_upload_link",
				status: "success",
				message: `Link upload dokumen provider diminta untuk domain ${localDomain.name}.`,
				requestPayload: stringifyJson({ domainId: localDomain.id, documentId: selectedDocument.id }),
				responsePayload: stringifyJson(providerResponse),
			});

			return {
				document: updatedDocument,
				providerResponse,
			};
		}),

	adminMarkSubmittedToProvider: protectedProcedure
		.input(
			z.object({
				documentId: z.string(),
				providerDocumentReference: z.string().optional(),
				notes: z.string().optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			const adminUser = await requireAdminUser(context);
			const organizationId = await requireActiveOrganizationId(context, adminUser.id);
			const verificationDocument = await requireDomainVerificationDocument(input.documentId, organizationId);
			const updatedDocumentRows = await db
				.update(schema.domainVerificationDocument)
				.set({
					verificationStatus: "submitted_to_provider",
					providerDocumentReference: input.providerDocumentReference,
					submittedToProviderAt: new Date(),
					notes: input.notes ?? verificationDocument.notes,
					updatedByUserId: adminUser.id,
				})
				.where(eq(schema.domainVerificationDocument.id, verificationDocument.id))
				.returning();
			const updatedDocument = ensureValue(updatedDocumentRows[0], "Gagal menandai dokumen sebagai submitted.");
			return updatedDocument;
		}),
};
