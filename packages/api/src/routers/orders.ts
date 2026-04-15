import { ORPCError } from "@orpc/server";
import { db } from "@tanisya/db";
import * as schema from "@tanisya/db/schema/index";
import { eq } from "drizzle-orm";
import z from "zod";

import { protectedProcedure } from "../index";
import {
	buildNameserverForm,
	ensureValue,
	extractProviderId,
	listLatestVerificationDocuments,
	makeId,
	normalizeDomainName,
	parseDomainSourceCredentials,
	requireActiveOrganizationId,
	requireLocalDomainOwnedByUser,
	requirePointWallet,
	requireSessionUser,
	resolveDomainPurchaseConfig,
	stringifyJson,
} from "./_shared";
import { rdashRequest } from "./_rdash";

function pickNumber(payload: unknown, keys: string[]) {
	if (!payload || typeof payload !== "object") return undefined;
	const source = payload as Record<string, unknown>;
	for (const key of keys) {
		const value = source[key];
		if (typeof value === "number" && Number.isFinite(value)) return value;
		if (typeof value === "string" && value.trim()) {
			const parsed = Number(value);
			if (Number.isFinite(parsed)) return parsed;
		}
	}
	if (source.data && typeof source.data === "object") {
		return pickNumber(source.data, keys);
	}
	return undefined;
}

function pickString(payload: unknown, keys: string[]) {
	if (!payload || typeof payload !== "object") return undefined;
	const source = payload as Record<string, unknown>;
	for (const key of keys) {
		const value = source[key];
		if (typeof value === "string" && value.trim()) return value;
	}
	if (source.data && typeof source.data === "object") {
		return pickString(source.data, keys);
	}
	return undefined;
}

function readDomainSnapshot(payload: unknown) {
	return {
		status: pickNumber(payload, ["status"]),
		verificationStatus: pickNumber(payload, ["verification_status"]),
		requiredDocument: pickNumber(payload, ["required_document"]),
		expiredAt: pickString(payload, ["expired_at", "expired_date", "expiration_date"]),
	};
}

const purchaseInput = z.object({
	productPriceId: z.string(),
	operation: z.enum(["register", "transfer"]),
	domainName: z.string().min(3),
	period: z.number().int().positive(),
	authCode: z.string().optional(),
	nameservers: z.array(z.string().min(1)).min(2).max(5).optional(),
	buyWhoisProtection: z.boolean().default(false),
	includePremiumDomains: z.boolean().default(false),
	overrideContactSetId: z.string().optional(),
	overridePolicyId: z.string().optional(),
	overrideSourceId: z.string().optional(),
});


async function refundSimpleDomainOperation(params: {
	organizationId: string;
	userId: string;
	walletId: string;
	points: number;
	domainId: string;
	domainName: string;
	tld: string;
	operation: "domain_renew" | "domain_restore";
	reason: unknown;
}) {
	await db.transaction(async (tx) => {
		const walletRows = await tx
			.select()
			.from(schema.pointWallet)
			.where(eq(schema.pointWallet.id, params.walletId))
			.limit(1);
		const wallet = walletRows[0];
		if (!wallet) return;

		const balanceBefore = wallet.balance;
		const balanceAfter = balanceBefore + params.points;

		await tx
			.update(schema.pointWallet)
			.set({ balance: balanceAfter })
			.where(eq(schema.pointWallet.id, wallet.id));

		const [ledger] = await tx
			.insert(schema.pointLedger)
			.values({
				id: makeId("pld"),
				walletId: wallet.id,
				organizationId: params.organizationId,
				entryType: "refund",
				points: params.points,
				balanceBefore,
				balanceAfter,
				sourceType: params.operation,
				sourceId: params.domainId,
				description: `Refund points untuk domain ${params.domainName}`,
				metadata: stringifyJson(params.reason),
				actorUserId: params.userId,
			})
			.returning();

		await tx.insert(schema.transactions).values({
			id: makeId("trx"),
			organizationId: params.organizationId,
			customerUserId: params.userId,
			pointLedgerId: ledger!.id,
			domainId: params.domainId,
			transactionType: "domain",
			direction: "credit",
			amount: params.points,
			currency: "IDR",
			tld: params.tld,
			description: `Refund points untuk domain ${params.domainName}`,
			metadata: stringifyJson(params.reason),
			actorUserId: params.userId,
		});
	});
}

async function refundFailedPurchase(params: {
	organizationId: string;
	userId: string;
	orderId: string;
	orderItemId: string;
	walletId: string;
	points: number;
	domainName: string;
	tld: string;
	reason: unknown;
}) {
	await db.transaction(async (tx) => {
		const walletRows = await tx
			.select()
			.from(schema.pointWallet)
			.where(eq(schema.pointWallet.id, params.walletId))
			.limit(1);
		const wallet = walletRows[0];
		if (!wallet) return;

		const balanceBefore = wallet.balance;
		const balanceAfter = balanceBefore + params.points;

		const [updatedWallet] = await tx
			.update(schema.pointWallet)
			.set({ balance: balanceAfter })
			.where(eq(schema.pointWallet.id, wallet.id))
			.returning();

		const [ledger] = await tx
			.insert(schema.pointLedger)
			.values({
				id: makeId("pld"),
				walletId: updatedWallet!.id,
				organizationId: params.organizationId,
				entryType: "refund",
				points: params.points,
				balanceBefore,
				balanceAfter,
				sourceType: "product_order",
				sourceId: params.orderId,
				description: `Refund points untuk domain ${params.domainName}`,
				metadata: stringifyJson(params.reason),
				actorUserId: params.userId,
			})
			.returning();

		await tx.insert(schema.transactions).values({
			id: makeId("trx"),
			organizationId: params.organizationId,
			customerUserId: params.userId,
			productOrderId: params.orderId,
			productOrderItemId: params.orderItemId,
			pointLedgerId: ledger!.id,
			transactionType: "domain",
			direction: "credit",
			amount: params.points,
			currency: "IDR",
			tld: params.tld,
			description: `Refund points untuk domain ${params.domainName}`,
			metadata: stringifyJson(params.reason),
			actorUserId: params.userId,
		});

		await tx
			.update(schema.productOrder)
			.set({ status: "failed", updatedByUserId: params.userId })
			.where(eq(schema.productOrder.id, params.orderId));

		await tx.insert(schema.productProcessLog).values({
			id: makeId("log"),
			organizationId: params.organizationId,
			actorUserId: params.userId,
			entityType: "product_order",
			entityId: params.orderId,
			processType: "refund_points",
			status: "success",
			message: `Refund points untuk domain ${params.domainName} setelah provider gagal.`,
			requestPayload: stringifyJson({ orderId: params.orderId }),
			responsePayload: stringifyJson(params.reason),
		});
	});
}

export const domainOrderRouter = {
	purchase: protectedProcedure
		.input(purchaseInput)
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);
			const normalizedDomainName = normalizeDomainName(input.domainName);

			if (input.operation === "transfer" && !input.authCode) {
				throw new ORPCError("BAD_REQUEST", {
					message: "authCode wajib diisi untuk transfer domain.",
				});
			}

			const resolved = await resolveDomainPurchaseConfig({
				organizationId,
				userId: currentUser.id,
				productPriceId: input.productPriceId,
				domainName: normalizedDomainName,
				overrideContactSetId: input.overrideContactSetId,
				overridePolicyId: input.overridePolicyId,
				overrideSourceId: input.overrideSourceId,
			});

			const totalPoints = Number(resolved.productPrice.pricePoints);
			const wallet = await requirePointWallet(organizationId);
			if (wallet.balance < totalPoints) {
				throw new ORPCError("BAD_REQUEST", {
					message: "Points tidak cukup untuk membeli domain ini.",
				});
			}

			const localPurchase = await db.transaction(async (tx) => {
				const balanceBefore = wallet.balance;
				const balanceAfter = balanceBefore - totalPoints;

				const [updatedWallet] = await tx
					.update(schema.pointWallet)
					.set({ balance: balanceAfter })
					.where(eq(schema.pointWallet.id, wallet.id))
					.returning();

				const [order] = await tx
					.insert(schema.productOrder)
					.values({
						id: makeId("ord"),
						organizationId,
						customerUserId: currentUser.id,
						code: makeId("ORD-DOM"),
						status: "paid_by_points",
						totalPoints,
						usedPoints: totalPoints,
						notes: `Pembelian domain ${normalizedDomainName}`,
						metadata: stringifyJson(input),
						actorUserId: currentUser.id,
						updatedByUserId: currentUser.id,
					})
					.returning();

				const [orderItem] = await tx
					.insert(schema.productOrderItem)
					.values({
						id: makeId("oit"),
						orderId: order!.id,
						productId: resolved.product.id,
						productPriceId: resolved.productPrice.id,
						productType: "domain",
						productCode: resolved.product.code,
						name: `${normalizedDomainName} (${input.operation})`,
						quantity: 1,
						unitPoints: totalPoints,
						totalPoints,
						status: "pending",
						metadata: stringifyJson(input),
					})
					.returning();

				const [domainOrder] = await tx
					.insert(schema.domainOrderItem)
					.values({
						id: makeId("doi"),
						productOrderItemId: orderItem!.id,
						customerUserId: currentUser.id,
						domainSourceAccountId: resolved.sourceAccount.id,
						domainTldPolicyId: resolved.policy?.id,
						domainContactSetId: resolved.contactSet.id,
						operation: input.operation,
						domainName: normalizedDomainName,
						tld: resolved.tld,
						period: input.period,
						authCode: input.authCode,
						buyWhoisProtection: input.buyWhoisProtection,
						includePremiumDomains: input.includePremiumDomains,
						adminContactId: resolved.contactSet.adminContactId,
						techContactId: resolved.contactSet.techContactId,
						billingContactId: resolved.contactSet.billingContactId,
						registrantContactId: resolved.contactSet.registrantContactId,
						metadata: stringifyJson(input),
						actorUserId: currentUser.id,
					})
					.returning();

				for (const [index, host] of (input.nameservers ?? []).slice(0, 5).entries()) {
					await tx.insert(schema.domainOrderItemNameserver).values({
						id: makeId("dns"),
						domainOrderItemId: domainOrder!.id,
						position: index,
						host: host.trim().toLowerCase(),
						actorUserId: currentUser.id,
					});
				}

				const [ledger] = await tx
					.insert(schema.pointLedger)
					.values({
						id: makeId("pld"),
						walletId: updatedWallet!.id,
						organizationId,
						entryType: "debit",
						points: totalPoints,
						balanceBefore,
						balanceAfter,
						sourceType: "product_order",
						sourceId: order!.id,
						description: `Pembelian domain ${normalizedDomainName}`,
						metadata: stringifyJson(input),
						actorUserId: currentUser.id,
					})
					.returning();

				const [transaction] = await tx
					.insert(schema.transactions)
					.values({
						id: makeId("trx"),
						organizationId,
						customerUserId: currentUser.id,
						productOrderId: order!.id,
						productOrderItemId: orderItem!.id,
						pointLedgerId: ledger!.id,
						transactionType: "domain",
						direction: "debit",
						amount: totalPoints,
						currency: "IDR",
						tld: resolved.tld,
						description: `Pembelian domain ${normalizedDomainName}`,
						metadata: stringifyJson(input),
						actorUserId: currentUser.id,
					})
					.returning();

				await tx.insert(schema.productProcessLog).values({
					id: makeId("log"),
					organizationId,
					actorUserId: currentUser.id,
					entityType: "product_order",
					entityId: order!.id,
					processType: "create_product_order",
					status: "success",
					message: `Order domain ${normalizedDomainName} dibuat dan points dipotong.`,
					requestPayload: stringifyJson(input),
					responsePayload: stringifyJson({ orderId: order!.id, transactionId: transaction!.id }),
				});

				return { order: order!, orderItem: orderItem!, domainOrder: domainOrder!, updatedWallet: updatedWallet! };
			});

			try {
				const providerResponse = await rdashRequest<Record<string, unknown>>({
					credentials: parseDomainSourceCredentials(resolved.sourceAccount.credentials),
					path: input.operation === "transfer" ? "/domains/transfer" : "/domains",
					method: "POST",
					form: {
						name: normalizedDomainName,
						period: input.period,
						customer_id: resolved.userProfile.externalCustomerId!,
						auth_code: input.operation === "transfer" ? input.authCode : undefined,
						buy_whois_protection: input.buyWhoisProtection,
						include_premium_domains: input.includePremiumDomains,
						registrant_contact_id:
							input.operation === "register"
								? resolved.contactSet.registrantContactId
								: undefined,
						...buildNameserverForm(input.nameservers),
					},
				});

				const externalDomainId = extractProviderId(providerResponse);
				let contactUpdateResponse: Record<string, unknown> | null = null;

				if (externalDomainId) {
					contactUpdateResponse = await rdashRequest<Record<string, unknown>>({
						credentials: parseDomainSourceCredentials(resolved.sourceAccount.credentials),
						path: `/domains/${externalDomainId}/contacts`,
						method: "PUT",
						form: {
							admin_contact_id: resolved.contactSet.adminContactId,
							tech_contact_id: resolved.contactSet.techContactId,
							billing_contact_id: resolved.contactSet.billingContactId,
							registrant_contact_id: resolved.contactSet.registrantContactId,
							customer_id: resolved.userProfile.externalCustomerId!,
						},
					});
				}

				const snapshot = readDomainSnapshot(providerResponse);
				const [localDomain] = await db
					.insert(schema.domain)
					.values({
						id: makeId("dom"),
						organizationId,
						customerUserId: currentUser.id,
						domainSourceAccountId: resolved.sourceAccount.id,
						domainTldPolicyId: resolved.policy?.id,
						domainContactSetId: resolved.contactSet.id,
						providerCode: resolved.sourceAccount.providerCode,
						externalDomainId,
						name: normalizedDomainName,
						tld: resolved.tld,
						operation: input.operation,
						period: input.period,
						authCode: input.authCode,
						adminContactId: resolved.contactSet.adminContactId,
						techContactId: resolved.contactSet.techContactId,
						billingContactId: resolved.contactSet.billingContactId,
						registrantContactId: resolved.contactSet.registrantContactId,
						status: snapshot.status ?? 0,
						verificationStatus: snapshot.verificationStatus ?? 0,
						requiredDocument: snapshot.requiredDocument ?? 0,
						buyWhoisProtection: input.buyWhoisProtection,
						includePremiumDomains: input.includePremiumDomains,
						expiredAt: snapshot.expiredAt ? new Date(snapshot.expiredAt) : null,
						metadata: stringifyJson({ register: providerResponse, updateContacts: contactUpdateResponse }),
						actorUserId: currentUser.id,
						updatedByUserId: currentUser.id,
					})
					.returning();

				for (const [index, host] of (input.nameservers ?? []).slice(0, 5).entries()) {
					await db.insert(schema.domainNameserver).values({
						id: makeId("dns"),
						domainId: localDomain!.id,
						position: index,
						host: host.trim().toLowerCase(),
						actorUserId: currentUser.id,
					});
				}

				await db.insert(schema.productProcessLog).values({
					id: makeId("log"),
					organizationId,
					actorUserId: currentUser.id,
					entityType: "domain",
					entityId: localDomain!.id,
					processType: input.operation === "transfer" ? "transfer_domain" : "register_domain",
					status: "success",
					message: `Domain ${normalizedDomainName} berhasil dikirim ke provider.`,
					requestPayload: stringifyJson(input),
					responsePayload: stringifyJson({ providerResponse, contactUpdateResponse }),
					externalReferenceId: externalDomainId ? String(externalDomainId) : undefined,
				});

				return {
					...localPurchase,
					localDomain,
					providerResponse,
					contactUpdateResponse,
					verificationDocuments: externalDomainId ? await listLatestVerificationDocuments(localDomain!.id) : [],
				};
			} catch (error) {
				await refundFailedPurchase({
					organizationId,
					userId: currentUser.id,
					orderId: localPurchase.order!.id,
					orderItemId: localPurchase.orderItem!.id,
					walletId: localPurchase.updatedWallet!.id,
					points: totalPoints,
					domainName: normalizedDomainName,
					tld: resolved.tld,
					reason: error,
				});
				throw error;
			}
		}),

	renew: protectedProcedure
		.input(
			z.object({
				domainId: z.string(),
				period: z.number().int().positive(),
				currentDate: z.string().min(10),
				buyWhoisProtection: z.boolean().optional(),
				pointsCost: z.number().int().positive(),
			}),
		)
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);
			const localDomain = await requireLocalDomainOwnedByUser(input.domainId, organizationId, currentUser.id);
			if (!localDomain.externalDomainId) {
				throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
			}

			const wallet = await requirePointWallet(organizationId);
			if (wallet.balance < input.pointsCost) {
				throw new ORPCError("BAD_REQUEST", { message: "Points tidak cukup untuk renew domain." });
			}

			const sourceRows = await db
				.select()
				.from(schema.domainSourceAccount)
				.where(eq(schema.domainSourceAccount.id, localDomain.domainSourceAccountId))
				.limit(1);
			const sourceAccount = sourceRows[0];
			if (!sourceAccount) {
				throw new ORPCError("BAD_REQUEST", { message: "Domain source account tidak ditemukan." });
			}

			const debitResult = await db.transaction(async (tx) => {
				const balanceBefore = wallet.balance;
				const balanceAfter = balanceBefore - input.pointsCost;
				const [updatedWallet] = await tx
					.update(schema.pointWallet)
					.set({ balance: balanceAfter })
					.where(eq(schema.pointWallet.id, wallet.id))
					.returning();

				const [ledger] = await tx
					.insert(schema.pointLedger)
					.values({
						id: makeId("pld"),
						walletId: wallet.id,
						organizationId,
						entryType: "debit",
						points: input.pointsCost,
						balanceBefore,
						balanceAfter,
						sourceType: "domain_renew",
						sourceId: localDomain.id,
						description: `Renew domain ${localDomain.name}`,
						metadata: stringifyJson(input),
						actorUserId: currentUser.id,
					})
					.returning();

				await tx.insert(schema.transactions).values({
					id: makeId("trx"),
					organizationId,
					customerUserId: currentUser.id,
					pointLedgerId: ledger!.id,
					domainId: localDomain!.id,
					transactionType: "domain",
					direction: "debit",
					amount: input.pointsCost,
					currency: "IDR",
					tld: localDomain.tld,
					description: `Renew domain ${localDomain.name}`,
					metadata: stringifyJson(input),
					actorUserId: currentUser.id,
				});

				return { updatedWallet };
			});

			try {
				const providerResponse = await rdashRequest<Record<string, unknown>>({
					credentials: parseDomainSourceCredentials(sourceAccount.credentials),
					path: `/domains/${localDomain.externalDomainId}/renew`,
					method: "POST",
					form: {
						period: input.period,
						current_date: input.currentDate,
						buy_whois_protection: input.buyWhoisProtection,
					},
				});

				await db.update(schema.domain).set({
					period: input.period,
					buyWhoisProtection: input.buyWhoisProtection ?? localDomain.buyWhoisProtection,
					updatedByUserId: currentUser.id,
					metadata: stringifyJson({ renew: providerResponse }),
				}).where(eq(schema.domain.id, localDomain.id));

				return { providerResponse, wallet: debitResult.updatedWallet! };
			} catch (error) {
				await refundSimpleDomainOperation({
					organizationId,
					userId: currentUser.id,
					walletId: wallet.id,
					points: input.pointsCost,
					domainId: localDomain!.id,
					domainName: localDomain.name,
					tld: localDomain.tld,
					operation: "domain_renew",
					reason: error,
				});
				throw error;
			}
		}),

	restore: protectedProcedure
		.input(z.object({ domainId: z.string(), pointsCost: z.number().int().positive() }))
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);
			const localDomain = await requireLocalDomainOwnedByUser(input.domainId, organizationId, currentUser.id);
			if (!localDomain.externalDomainId) {
				throw new ORPCError("BAD_REQUEST", { message: "externalDomainId belum tersedia pada domain lokal." });
			}
			const wallet = await requirePointWallet(organizationId);
			if (wallet.balance < input.pointsCost) {
				throw new ORPCError("BAD_REQUEST", { message: "Points tidak cukup untuk restore domain." });
			}
			const sourceRows = await db.select().from(schema.domainSourceAccount).where(eq(schema.domainSourceAccount.id, localDomain.domainSourceAccountId)).limit(1);
			const sourceAccount = sourceRows[0];
			if (!sourceAccount) throw new ORPCError("BAD_REQUEST", { message: "Domain source account tidak ditemukan." });

			const debitResult = await db.transaction(async (tx) => {
				const balanceBefore = wallet.balance;
				const balanceAfter = balanceBefore - input.pointsCost;
				await tx.update(schema.pointWallet).set({ balance: balanceAfter }).where(eq(schema.pointWallet.id, wallet.id));
				const [ledger] = await tx.insert(schema.pointLedger).values({
					id: makeId("pld"), walletId: wallet.id, organizationId, entryType: "debit", points: input.pointsCost,
					balanceBefore, balanceAfter, sourceType: "domain_restore", sourceId: localDomain.id,
					description: `Restore domain ${localDomain.name}`, metadata: stringifyJson(input), actorUserId: currentUser.id,
				}).returning();
				await tx.insert(schema.transactions).values({
					id: makeId("trx"), organizationId, customerUserId: currentUser.id, pointLedgerId: ledger!.id, domainId: localDomain!.id,
					transactionType: "domain", direction: "debit", amount: input.pointsCost, currency: "IDR", tld: localDomain.tld,
					description: `Restore domain ${localDomain.name}`, metadata: stringifyJson(input), actorUserId: currentUser.id,
				});
				return { ledger };
			});

			try {
				const providerResponse = await rdashRequest<Record<string, unknown>>({
					credentials: parseDomainSourceCredentials(sourceAccount.credentials),
					path: `/domains/${localDomain.externalDomainId}/restore`,
					method: "POST",
				});
				await db.update(schema.domain).set({ updatedByUserId: currentUser.id, metadata: stringifyJson({ restore: providerResponse }) }).where(eq(schema.domain.id, localDomain.id));
				return { providerResponse, debitResult };
			} catch (error) {
				await refundSimpleDomainOperation({
					organizationId,
					userId: currentUser.id,
					walletId: wallet.id,
					points: input.pointsCost,
					domainId: localDomain!.id,
					domainName: localDomain.name,
					tld: localDomain.tld,
					operation: "domain_restore",
					reason: error,
				});
				throw error;
			}
		}),
};
