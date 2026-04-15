import { ORPCError } from "@orpc/server";
import { db } from "@tanisya/db";
import * as schema from "@tanisya/db/schema/index";
import { and, desc, eq } from "drizzle-orm";
import z from "zod";

import { protectedProcedure } from "../index";
import {
	ensurePointWallet,
	ensureValue,
	makeId,
	requireActiveOrganizationId,
	requirePaymentMethodForOrganization,
	requireSessionUser,
	stringifyJson,
} from "./_shared";
import { expirePaymentWithProvider, syncPaymentWithProvider } from "./_payment-runtime";
import {
	pickInvoiceExpiry,
	pickInvoiceUrl,
	xenditCreateInvoice,
} from "./_xendit";

const topupStatusSchema = z
	.enum(["pending", "paid", "settled", "expired", "failed", "cancelled"])
	.optional();

export const pointsRouter = {
	getBalance: protectedProcedure.handler(async ({ context }) => {
		const currentUser = await requireSessionUser(context);
		const organizationId = await requireActiveOrganizationId(context, currentUser.id);
		const wallet = await ensurePointWallet(organizationId);

		return {
			organizationId,
			balance: Number(wallet.balance),
			currency: wallet.currency,
		};
	}),

	getLedger: protectedProcedure
		.input(z.object({ limit: z.number().int().positive().max(100).default(50) }))
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);
			const wallet = await ensurePointWallet(organizationId);

			return await db
				.select()
				.from(schema.pointLedger)
				.where(eq(schema.pointLedger.walletId, wallet.id))
				.orderBy(desc(schema.pointLedger.createdAt))
				.limit(input.limit);
		}),

	listMyTopups: protectedProcedure
		.input(
			z.object({
				status: topupStatusSchema,
				limit: z.number().int().positive().max(100).default(50),
			}),
		)
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);

			return await db
				.select()
				.from(schema.payments)
				.where(
					and(
						eq(schema.payments.organizationId, organizationId),
						eq(schema.payments.userId, currentUser.id),
						eq(schema.payments.purpose, "topup_points"),
						input.status ? eq(schema.payments.status, input.status) : undefined,
					),
				)
				.orderBy(desc(schema.payments.createdAt))
				.limit(input.limit);
		}),

	createTopupPaymentLink: protectedProcedure
		.input(
			z.object({
				paymentMethodId: z.string().min(1),
				amount: z.number().int().positive().max(100_000_000),
				description: z.string().max(255).optional(),
				invoiceDuration: z.number().int().positive().max(60 * 60 * 24 * 7).default(60 * 60),
				successRedirectUrl: z.string().url().optional(),
				failureRedirectUrl: z.string().url().optional(),
			})
		)
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);
			await ensurePointWallet(organizationId);

			const method = await requirePaymentMethodForOrganization(
				organizationId,
				input.paymentMethodId,
			);
			if (!method.isActive) {
				throw new ORPCError("BAD_REQUEST", { message: "Payment method tidak aktif." });
			}

			const gatewayConfig = method.gatewayConfigId
				? (
					await db
						.select()
						.from(schema.organizationGatewayConfig)
						.where(eq(schema.organizationGatewayConfig.id, method.gatewayConfigId))
						.limit(1)
				)[0] ?? null
				: null;

			const paymentCode = makeId("pay");
			const description = input.description ?? `Top up points ${paymentCode}`;
			const invoice = await xenditCreateInvoice({
				secretKey: gatewayConfig?.secretKey ?? null,
				externalId: paymentCode,
				amount: input.amount,
				description,
				payerEmail: currentUser.email,
				invoiceDuration: input.invoiceDuration,
				successRedirectUrl: input.successRedirectUrl,
				failureRedirectUrl: input.failureRedirectUrl,
				metadata: {
					organizationId,
					userId: currentUser.id,
					paymentMethodId: method.id,
				},
			});

			const invoiceId = typeof invoice.id === "string" ? invoice.id : null;
			const paymentLink = pickInvoiceUrl(invoice);
			if (!invoiceId || !paymentLink) {
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Xendit tidak mengembalikan invoice id atau payment link.",
				});
			}

			const createdRows = await db
				.insert(schema.payments)
				.values({
					id: makeId("paydb"),
					organizationId,
					userId: currentUser.id,
					organizationPaymentMethodId: method.id,
					gatewayConfigId: method.gatewayConfigId,
					paymentCode,
					purpose: "topup_points",
					gatewayCode: method.gatewayCode ?? (gatewayConfig ? "xendit" : null),
					gatewayMethodCode: method.gatewayMethodCode,
					provider: method.provider ?? "xendit",
					externalReferenceId: paymentCode,
					externalInvoiceId: invoiceId,
					channelReference: paymentLink,
					amount: input.amount,
					currency: "IDR",
					pointsRequested: input.amount,
					feeAmount: 0,
					netAmount: input.amount,
					status: "pending",
					expiresAt: pickInvoiceExpiry(invoice),
					description,
					metadata: stringifyJson(invoice),
					actorUserId: currentUser.id,
					updatedByUserId: currentUser.id,
				})
				.returning();

			const payment = ensureValue(createdRows[0], "Gagal membuat record payment top up.");

			return {
				payment,
				paymentLink,
				checkoutUrl: paymentLink,
				invoiceId,
				invoiceStatus: String(invoice.status ?? "PENDING"),
				expiresAt: pickInvoiceExpiry(invoice),
				provider: {
					name: "xendit",
					type: "payment_link",
					invoiceId,
					paymentLink,
					status: invoice.status,
					expiresAt: pickInvoiceExpiry(invoice),
					invoice,
				},
			};
		}),

	syncMyTopup: protectedProcedure
		.input(z.object({ paymentId: z.string().min(1) }))
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);

			const rows = await db
				.select()
				.from(schema.payments)
				.where(
					and(
						eq(schema.payments.id, input.paymentId),
						eq(schema.payments.organizationId, organizationId),
						eq(schema.payments.userId, currentUser.id),
					),
				)
				.limit(1);
			const payment = rows[0];
			if (!payment) {
				throw new ORPCError("NOT_FOUND", { message: "Payment tidak ditemukan." });
			}

			return await syncPaymentWithProvider({ payment, actorUserId: currentUser.id });
		}),

	expireMyTopup: protectedProcedure
		.input(z.object({ paymentId: z.string().min(1) }))
		.handler(async ({ context, input }) => {
			const currentUser = await requireSessionUser(context);
			const organizationId = await requireActiveOrganizationId(context, currentUser.id);

			const rows = await db
				.select()
				.from(schema.payments)
				.where(
					and(
						eq(schema.payments.id, input.paymentId),
						eq(schema.payments.organizationId, organizationId),
						eq(schema.payments.userId, currentUser.id),
					),
				)
				.limit(1);
			const payment = rows[0];
			if (!payment) {
				throw new ORPCError("NOT_FOUND", { message: "Payment tidak ditemukan." });
			}

			return await expirePaymentWithProvider({ payment, actorUserId: currentUser.id });
		}),
};
