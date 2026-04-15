import { ORPCError } from "@orpc/server";
import { db } from "@tanisya/db";
import * as schema from "@tanisya/db/schema/index";
import { and, desc, eq } from "drizzle-orm";
import z from "zod";

import { protectedProcedure, publicProcedure } from "../index";
import {
	ensureValue,
	makeId,
	requireActiveOrganizationId,
	requireAdminUser,
	requireSessionUser,
	stringifyJson,
} from "./_shared";
import {
	expirePaymentWithProvider,
	handleXenditInvoiceWebhook,
	syncPaymentWithProvider,
} from "./_payment-runtime";

const paymentStatusSchema = z.enum([
	"pending",
	"paid",
	"settled",
	"failed",
	"expired",
	"cancelled",
]);

const xenditInvoiceWebhookPayloadSchema = z
	.object({
		id: z.string().optional(),
		externalId: z.string().optional(),
		external_id: z.string().optional(),
		status: z.string().optional(),
		invoiceUrl: z.string().optional(),
		invoice_url: z.string().optional(),
		url: z.string().optional(),
		invoice_url_web: z.string().optional(),
		paidAt: z.string().optional(),
		paid_at: z.string().optional(),
		expiryDate: z.string().optional(),
		expiry_date: z.string().optional(),
		amount: z.number().optional(),
		paidAmount: z.number().optional(),
		paid_amount: z.number().optional(),
		currency: z.string().optional(),
	})
	.passthrough();

async function findPaymentForOrganization(paymentId: string, organizationId: string) {
	const rows = await db
		.select()
		.from(schema.payments)
		.where(
			and(
				eq(schema.payments.id, paymentId),
				eq(schema.payments.organizationId, organizationId),
			),
		)
		.limit(1);
	return rows[0] ?? null;
}

export const paymentRouter = {
	listAvailableMethods: protectedProcedure.handler(async ({ context }) => {
		const currentUser = await requireSessionUser(context);
		const organizationId = await requireActiveOrganizationId(context, currentUser.id);

		return await db
			.select()
			.from(schema.organizationPaymentMethod)
			.where(
				and(
					eq(schema.organizationPaymentMethod.organizationId, organizationId),
					eq(schema.organizationPaymentMethod.isActive, true),
				),
			)
			.orderBy(desc(schema.organizationPaymentMethod.isDefault));
	}),

	listMyPayments: protectedProcedure
		.input(
			z.object({
				status: paymentStatusSchema.optional(),
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
						input.status ? eq(schema.payments.status, input.status) : undefined,
					),
				)
				.orderBy(desc(schema.payments.createdAt))
				.limit(input.limit);
		}),

	adminListPayments: protectedProcedure
		.input(
			z.object({
				status: paymentStatusSchema.optional(),
				limit: z.number().int().positive().max(100).default(100),
			}),
		)
		.handler(async ({ context, input }) => {
			const adminUser = await requireAdminUser(context);
			const organizationId = await requireActiveOrganizationId(context, adminUser.id);

			return await db
				.select()
				.from(schema.payments)
				.where(
					and(
						eq(schema.payments.organizationId, organizationId),
						input.status ? eq(schema.payments.status, input.status) : undefined,
					),
				)
				.orderBy(desc(schema.payments.createdAt))
				.limit(input.limit);
		}),

	adminUpsertGatewayConfig: protectedProcedure
		.input(
			z.object({
				id: z.string().optional(),
				gatewayCode: z.string().min(1),
				gatewayName: z.string().min(1),
				environment: z.enum(["sandbox", "production"]).default("sandbox"),
				isActive: z.boolean().default(true),
				merchantId: z.string().optional(),
				publicKey: z.string().optional(),
				secretKey: z.string().optional(),
				webhookSecret: z.string().optional(),
				metadata: z.record(z.string(), z.unknown()).optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			const adminUser = await requireAdminUser(context);
			const organizationId = await requireActiveOrganizationId(context, adminUser.id);

			const existingGateway = (
				await db
					.select()
					.from(schema.paymentGateway)
					.where(eq(schema.paymentGateway.code, input.gatewayCode))
					.limit(1)
			)[0];

			const gateway = existingGateway
				? existingGateway
				: ensureValue(
					(
						await db
							.insert(schema.paymentGateway)
							.values({
								id: makeId("pgw"),
								code: input.gatewayCode,
								name: input.gatewayName,
								isActive: true,
							})
							.returning()
					)[0],
					"Gagal memastikan payment gateway tersedia.",
				);

			if (input.id) {
				const updatedRows = await db
					.update(schema.organizationGatewayConfig)
					.set({
						gatewayId: gateway.id,
						environment: input.environment,
						isActive: input.isActive,
						merchantId: input.merchantId,
						publicKey: input.publicKey,
						secretKey: input.secretKey,
						webhookSecret: input.webhookSecret,
						metadata: stringifyJson(input.metadata),
						updatedByUserId: adminUser.id,
					})
					.where(
						and(
							eq(schema.organizationGatewayConfig.id, input.id),
							eq(schema.organizationGatewayConfig.organizationId, organizationId),
						),
					)
					.returning();
				const updated = updatedRows[0] ?? null;
				if (!updated) {
					throw new ORPCError("NOT_FOUND", { message: "Gateway config tidak ditemukan." });
				}
				return updated;
			}

			const createdRows = await db
				.insert(schema.organizationGatewayConfig)
				.values({
					id: makeId("ogc"),
					organizationId,
					gatewayId: gateway.id,
					environment: input.environment,
					isActive: input.isActive,
					merchantId: input.merchantId,
					publicKey: input.publicKey,
					secretKey: input.secretKey,
					webhookSecret: input.webhookSecret,
					metadata: stringifyJson(input.metadata),
					createdByUserId: adminUser.id,
					updatedByUserId: adminUser.id,
				})
				.returning();

			const created = createdRows[0] ?? null;
			if (!created) {
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Gagal membuat gateway config.",
				});
			}
			return created;
		}),

	xenditWebhook: publicProcedure
		.input(
			z.object({
				callbackToken: z.string().nullable().optional(),
				payload: xenditInvoiceWebhookPayloadSchema,
			}),
		)
		.handler(async ({ input }) => {
			return await handleXenditInvoiceWebhook({
				callbackToken: input.callbackToken ?? null,
				payload: input.payload,
			});
		}),

	adminSyncPayment: protectedProcedure
		.input(z.object({ paymentId: z.string().min(1) }))
		.handler(async ({ context, input }) => {
			const adminUser = await requireAdminUser(context);
			const organizationId = await requireActiveOrganizationId(context, adminUser.id);
			const payment = await findPaymentForOrganization(input.paymentId, organizationId);
			if (!payment) {
				throw new ORPCError("NOT_FOUND", { message: "Payment tidak ditemukan." });
			}
			return await syncPaymentWithProvider({ payment, actorUserId: adminUser.id });
		}),

	adminExpirePayment: protectedProcedure
		.input(z.object({ paymentId: z.string().min(1) }))
		.handler(async ({ context, input }) => {
			const adminUser = await requireAdminUser(context);
			const organizationId = await requireActiveOrganizationId(context, adminUser.id);
			const payment = await findPaymentForOrganization(input.paymentId, organizationId);
			if (!payment) {
				throw new ORPCError("NOT_FOUND", { message: "Payment tidak ditemukan." });
			}
			return await expirePaymentWithProvider({ payment, actorUserId: adminUser.id });
		}),
};


export const paymentsRouter = paymentRouter;
