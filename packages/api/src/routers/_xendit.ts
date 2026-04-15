import { timingSafeEqual } from "node:crypto";

import { ORPCError } from "@orpc/server";
import { Invoice as InvoiceClient } from "xendit-node";
import type { CreateInvoiceRequest } from "xendit-node/invoice/models";

import { getOptionalEnv } from "./_shared";

export type XenditDateLike = string | Date | null | undefined;

export type XenditInvoiceLike = {
	id?: string;
	externalId?: string;
	external_id?: string;
	status?: string;
	invoiceUrl?: string;
	invoice_url?: string;
	url?: string;
	invoice_url_web?: string;
	paidAt?: XenditDateLike;
	paid_at?: XenditDateLike;
	paymentDate?: XenditDateLike;
	expiryDate?: XenditDateLike;
	expiry_date?: XenditDateLike;
	expiresAt?: XenditDateLike;
	amount?: number | string;
	paidAmount?: number | string;
	paid_amount?: number | string;
	currency?: string;
	payerEmail?: string;
	payer_email?: string;
	paymentMethod?: string;
	payment_method?: string;
	paymentChannel?: string;
	payment_channel?: string;
};

function getXenditSecretKey(secretKeyOverride?: string | null) {
	const secretKey = secretKeyOverride ?? getOptionalEnv("XENDIT_SECRET_KEY") ?? null;
	if (!secretKey) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "XENDIT_SECRET_KEY belum dikonfigurasi.",
		});
	}
	return secretKey;
}

function getXenditBaseUrl() {
	return getOptionalEnv("XENDIT_API_URL") ?? undefined;
}

export function createXenditInvoiceClient(secretKeyOverride?: string | null) {
	const secretKey = getXenditSecretKey(secretKeyOverride);
	const xenditURL = getXenditBaseUrl();

	return new InvoiceClient({
		secretKey,
		...(xenditURL ? { xenditURL } : {}),
	});
}

export function safeEqualWebhookToken(expected: string | null, received: string | null) {
	if (!expected || !received) return false;

	const expectedBuffer = Buffer.from(expected, "utf8");
	const receivedBuffer = Buffer.from(received, "utf8");

	if (expectedBuffer.length !== receivedBuffer.length) return false;
	return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function assertXenditWebhookToken(expected: string | null, received: string | null) {
	if (!safeEqualWebhookToken(expected, received)) {
		throw new ORPCError("UNAUTHORIZED", {
			message: "Webhook token Xendit tidak valid.",
		});
	}
}

export async function xenditCreateInvoice(input: {
	secretKey?: string | null;
	externalId: string;
	amount: number;
	description: string;
	payerEmail?: string | null;
	invoiceDuration?: number;
	successRedirectUrl?: string;
	failureRedirectUrl?: string;
	currency?: "IDR";
	metadata?: Record<string, unknown>;
}) {
	const client = createXenditInvoiceClient(input.secretKey);

	const data: CreateInvoiceRequest = {
		externalId: input.externalId,
		amount: input.amount,
		description: input.description,
		currency: input.currency ?? "IDR",
		invoiceDuration: input.invoiceDuration ?? 60 * 60,
		reminderTime: 1,
		metadata: input.metadata,
		payerEmail: input.payerEmail ?? undefined,
		...(input.successRedirectUrl ? { successRedirectUrl: input.successRedirectUrl } : {}),
		...(input.failureRedirectUrl ? { failureRedirectUrl: input.failureRedirectUrl } : {}),
	};

	return await client.createInvoice({ data });
}

export async function xenditGetInvoiceById(invoiceId: string, secretKey?: string | null) {
	const client = createXenditInvoiceClient(secretKey);
	return await client.getInvoiceById({ invoiceId });
}

export async function xenditExpireInvoice(invoiceId: string, secretKey?: string | null) {
	const client = createXenditInvoiceClient(secretKey);
	return await client.expireInvoice({ invoiceId });
}

export function mapXenditInvoiceStatus(status: unknown) {
	const normalized = String(status ?? "").trim().toUpperCase();

	if (normalized === "PAID") return "paid" as const;
	if (normalized === "SETTLED" || normalized === "SUCCEEDED") return "settled" as const;
	if (normalized === "EXPIRED") return "expired" as const;
	if (normalized === "FAILED") return "failed" as const;
	if (normalized === "CANCELED" || normalized === "CANCELLED" || normalized === "VOIDED") {
		return "cancelled" as const;
	}

	return "pending" as const;
}

export function pickInvoiceUrl(payload: XenditInvoiceLike | null | undefined) {
	return payload?.invoiceUrl ?? payload?.invoice_url ?? payload?.url ?? payload?.invoice_url_web ?? undefined;
}

function toDate(value: unknown) {
	if (!value) return undefined;
	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? undefined : value;
	}
	const date = new Date(String(value));
	return Number.isNaN(date.getTime()) ? undefined : date;
}

export function pickInvoicePaidAt(payload: XenditInvoiceLike | null | undefined) {
	return toDate(payload?.paidAt ?? payload?.paid_at ?? payload?.paymentDate);
}

export function pickInvoiceExpiry(payload: XenditInvoiceLike | null | undefined) {
	return toDate(payload?.expiryDate ?? payload?.expiry_date ?? payload?.expiresAt);
}

export function pickInvoiceExternalId(payload: XenditInvoiceLike | null | undefined) {
	return payload?.externalId ?? payload?.external_id ?? undefined;
}

export function pickInvoiceId(payload: XenditInvoiceLike | null | undefined) {
	return payload?.id ?? undefined;
}

export function getDefaultXenditWebhookToken() {
	return getOptionalEnv("XENDIT_WEBHOOK_TOKEN") ?? null;
}
