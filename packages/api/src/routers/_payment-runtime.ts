import { ORPCError } from "@orpc/server";
import { db } from "@tanisya/db";
import * as schema from "@tanisya/db/schema/index";
import { eq, or } from "drizzle-orm";

import {
	ensurePointWallet,
	ensureValue,
	makeId,
	stringifyJson,
} from "./_shared";
import {
	assertXenditWebhookToken,
	getDefaultXenditWebhookToken,
	mapXenditInvoiceStatus,
	pickInvoiceExpiry,
	pickInvoiceExternalId,
	pickInvoiceId,
	pickInvoicePaidAt,
	type XenditInvoiceLike,
	xenditExpireInvoice,
	xenditGetInvoiceById,
} from "./_xendit";

function toMoney(value: unknown, fieldName: string) {
	const amount = typeof value === "number" ? value : Number(value ?? 0);
	if (!Number.isFinite(amount)) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: `Nilai numerik ${fieldName} tidak valid.`,
		});
	}
	return amount;
}

async function findPaymentByInvoiceReference(input: {
	invoiceId?: string;
	externalId?: string;
}) {
	if (!input.invoiceId && !input.externalId) {
		return null;
	}

	const rows = await db
		.select()
		.from(schema.payments)
		.where(
			or(
				input.invoiceId ? eq(schema.payments.externalInvoiceId, input.invoiceId) : undefined,
				input.externalId ? eq(schema.payments.externalReferenceId, input.externalId) : undefined,
			),
		)
		.limit(1);

	return rows[0] ?? null;
}

async function findGatewayConfigById(gatewayConfigId: string | null) {
	if (!gatewayConfigId) return null;

	const rows = await db
		.select()
		.from(schema.organizationGatewayConfig)
		.where(eq(schema.organizationGatewayConfig.id, gatewayConfigId))
		.limit(1);

	return rows[0] ?? null;
}

export async function settleTopupPayment(params: {
	paymentId: string;
	actorUserId: string;
	providerPayload: unknown;
	localStatus: "paid" | "settled";
	paidAt?: Date;
}) {
	return await db.transaction(async (tx) => {
		const paymentRows = await tx
			.select()
			.from(schema.payments)
			.where(eq(schema.payments.id, params.paymentId))
			.limit(1);
		const payment = paymentRows[0];

		if (!payment) {
			throw new ORPCError("NOT_FOUND", { message: "Payment tidak ditemukan." });
		}

		const pointsRequested = toMoney(payment.pointsRequested, "payments.pointsRequested");
		const alreadyGranted = toMoney(payment.pointsGranted, "payments.pointsGranted") > 0;

		if (alreadyGranted) {
			const updatedRows = await tx
				.update(schema.payments)
				.set({
					status: params.localStatus,
					paidAt: params.paidAt ?? payment.paidAt,
					settledAt: payment.settledAt ?? new Date(),
					metadata: stringifyJson(params.providerPayload),
					updatedByUserId: params.actorUserId,
				})
				.where(eq(schema.payments.id, payment.id))
				.returning();

			return {
				payment: ensureValue(updatedRows[0], "Gagal memperbarui payment yang sudah settled."),
				credited: false,
			};
		}

		const wallet = await ensurePointWallet(payment.organizationId, tx);
		const balanceBefore = toMoney(wallet.balance, "point_wallet.balance");
		const balanceAfter = balanceBefore + pointsRequested;

		const updatedWalletRows = await tx
			.update(schema.pointWallet)
			.set({ balance: balanceAfter })
			.where(eq(schema.pointWallet.id, wallet.id))
			.returning();
		const updatedWallet = ensureValue(
			updatedWalletRows[0],
			"Gagal memperbarui balance point wallet.",
		);

		const ledgerRows = await tx
			.insert(schema.pointLedger)
			.values({
				id: makeId("pld"),
				walletId: wallet.id,
				organizationId: payment.organizationId,
				entryType: "credit",
				points: pointsRequested,
				balanceBefore,
				balanceAfter,
				sourceType: "payment_topup",
				sourceId: payment.id,
				description: `Top up points ${payment.paymentCode}`,
				metadata: stringifyJson(params.providerPayload),
				actorUserId: params.actorUserId,
			})
			.returning();
		const ledger = ensureValue(ledgerRows[0], "Gagal membuat point ledger top up.");

		const updatedPaymentRows = await tx
			.update(schema.payments)
			.set({
				status: params.localStatus,
				pointsGranted: pointsRequested,
				paidAt: params.paidAt ?? payment.paidAt ?? new Date(),
				settledAt: new Date(),
				metadata: stringifyJson(params.providerPayload),
				updatedByUserId: params.actorUserId,
			})
			.where(eq(schema.payments.id, payment.id))
			.returning();
		const updatedPayment = ensureValue(updatedPaymentRows[0], "Gagal memperbarui payment top up.");

		await tx.insert(schema.transactions).values({
			id: makeId("trx"),
			organizationId: payment.organizationId,
			customerUserId: payment.userId,
			paymentId: payment.id,
			pointLedgerId: ledger.id,
			providerCode: payment.provider ?? payment.gatewayCode ?? "xendit",
			transactionType: "deposit",
			direction: "credit",
			amount: pointsRequested,
			currency: payment.currency,
			description: `Top up points berhasil: ${payment.paymentCode}`,
			metadata: stringifyJson({ provider: params.providerPayload, wallet: updatedWallet }),
			actorUserId: params.actorUserId,
			occurredAt: params.paidAt ?? new Date(),
		});

		await tx.insert(schema.productProcessLog).values({
			id: makeId("log"),
			organizationId: payment.organizationId,
			actorUserId: params.actorUserId,
			entityType: "payment",
			entityId: payment.id,
			processType: "credit_points",
			status: "success",
			message: `Top up ${payment.paymentCode} berhasil dan points dikreditkan.`,
			requestPayload: stringifyJson({ paymentId: payment.id }),
			responsePayload: stringifyJson(params.providerPayload),
			externalReferenceId:
				payment.externalInvoiceId ?? payment.externalReferenceId ?? undefined,
		});

		return { payment: updatedPayment, credited: true };
	});
}

export async function syncPaymentWithProvider(params: {
	payment: typeof schema.payments.$inferSelect;
	actorUserId: string;
}) {
	if (!params.payment.externalInvoiceId) {
		return { payment: params.payment, provider: null, credited: false };
	}

	const gatewayConfig = await findGatewayConfigById(params.payment.gatewayConfigId);
	const invoice = await xenditGetInvoiceById(
		params.payment.externalInvoiceId,
		gatewayConfig?.secretKey ?? null,
	);
	const localStatus = mapXenditInvoiceStatus(invoice.status);

	if (localStatus === "paid" || localStatus === "settled") {
		return await settleTopupPayment({
			paymentId: params.payment.id,
			actorUserId: params.actorUserId,
			providerPayload: invoice,
			localStatus,
			paidAt: pickInvoicePaidAt(invoice),
		});
	}

	const updatedRows = await db
		.update(schema.payments)
		.set({
			status: localStatus,
			expiresAt: pickInvoiceExpiry(invoice) ?? params.payment.expiresAt,
			paidAt: pickInvoicePaidAt(invoice) ?? params.payment.paidAt,
			metadata: stringifyJson(invoice),
			updatedByUserId: params.actorUserId,
		})
		.where(eq(schema.payments.id, params.payment.id))
		.returning();

	return {
		payment: ensureValue(updatedRows[0], "Gagal memperbarui status payment dari provider."),
		provider: invoice,
		credited: false,
	};
}

export async function expirePaymentWithProvider(params: {
	payment: typeof schema.payments.$inferSelect;
	actorUserId: string;
}) {
	if (!params.payment.externalInvoiceId) {
		throw new ORPCError("BAD_REQUEST", {
			message: "Payment ini tidak memiliki invoice provider.",
		});
	}

	if (["paid", "settled", "cancelled", "expired", "failed"].includes(params.payment.status)) {
		throw new ORPCError("BAD_REQUEST", {
			message: `Payment dengan status ${params.payment.status} tidak bisa di-expire.`,
		});
	}

	const gatewayConfig = await findGatewayConfigById(params.payment.gatewayConfigId);
	const invoice = await xenditExpireInvoice(
		params.payment.externalInvoiceId,
		gatewayConfig?.secretKey ?? null,
	);

	const updatedRows = await db
		.update(schema.payments)
		.set({
			status: "expired",
			expiresAt: pickInvoiceExpiry(invoice) ?? new Date(),
			metadata: stringifyJson(invoice),
			updatedByUserId: params.actorUserId,
		})
		.where(eq(schema.payments.id, params.payment.id))
		.returning();

	return {
		payment: ensureValue(updatedRows[0], "Gagal meng-expire payment provider."),
		provider: invoice,
	};
}

export async function handleXenditInvoiceWebhook(input: {
	callbackToken: string | null;
	payload: XenditInvoiceLike;
}) {
	const invoiceId = pickInvoiceId(input.payload);
	const externalId = pickInvoiceExternalId(input.payload);

	if (!invoiceId && !externalId) {
		throw new ORPCError("BAD_REQUEST", {
			message: "Payload webhook Xendit tidak valid. invoiceId atau externalId wajib ada.",
		});
	}

	const payment = await findPaymentByInvoiceReference({ invoiceId, externalId });
	const gatewayConfig = payment
		? await findGatewayConfigById(payment.gatewayConfigId)
		: null;
	const expectedToken = gatewayConfig?.webhookSecret ?? getDefaultXenditWebhookToken();
	assertXenditWebhookToken(expectedToken, input.callbackToken);

	if (!payment) {
		return {
			acknowledged: true,
			ignored: true,
			reason: "payment_not_found",
		};
	}

	const localStatus = mapXenditInvoiceStatus(input.payload.status);
	if (localStatus === "paid" || localStatus === "settled") {
		const settled = await settleTopupPayment({
			paymentId: payment.id,
			actorUserId: payment.userId,
			providerPayload: input.payload,
			localStatus,
			paidAt: pickInvoicePaidAt(input.payload),
		});

		return {
			acknowledged: true,
			ignored: false,
			paymentId: settled.payment.id,
			status: settled.payment.status,
			credited: settled.credited,
		};
	}

	const updatedRows = await db
		.update(schema.payments)
		.set({
			status: localStatus,
			expiresAt: pickInvoiceExpiry(input.payload) ?? payment.expiresAt,
			paidAt: pickInvoicePaidAt(input.payload) ?? payment.paidAt,
			metadata: stringifyJson(input.payload),
			updatedByUserId: payment.userId,
		})
		.where(eq(schema.payments.id, payment.id))
		.returning();

	const updated = ensureValue(updatedRows[0], "Gagal memperbarui status payment dari webhook.");

	return {
		acknowledged: true,
		ignored: false,
		paymentId: updated.id,
		status: updated.status,
		credited: false,
	};
}
