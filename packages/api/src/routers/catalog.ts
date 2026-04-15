import { ORPCError } from "@orpc/server";
import { db } from "@tanisya/db";
import { product, productPrice } from "@tanisya/db/schema/catalog";
import { domainSourceAccount } from "@tanisya/db/schema/domain-routing";
import { env } from "@tanisya/env/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";

const providerDomainExtensionSchema = z.object({
	id: z.number().int().positive(),
	extension: z.string().min(1),
	status: z.number().int(),
	status_label: z.string(),
	status_badge: z.string(),
	sell_option: z.number().int(),
	enable_whois_protection: z.number().int(),
	enable_whois_protection_label: z.string(),
	enable_whois_protection_badge: z.string(),
	registry_id: z.number().int().nullable(),
	registry_name: z.string().nullable(),
});

const providerPromoRegistrationSchema = z.object({
	registration: z.record(z.string(), z.union([z.string(), z.number()])),
	description: z.string(),
});

const providerPriceItemSchema = z.object({
	id: z.number().int().positive(),
	registry_id: z.number().int().nullable(),
	domain_extension: providerDomainExtensionSchema,
	currency: z.string().min(1),
	registration: z.record(z.string(), z.union([z.string(), z.number()])),
	renewal: z.record(z.string(), z.union([z.string(), z.number()])),
	transfer: z.union([z.string(), z.number()]),
	redemption: z.union([z.string(), z.number()]),
	proxy: z.union([z.string(), z.number()]),
	promo_registration: providerPromoRegistrationSchema.nullable().optional(),
});

const providerPriceListResponseSchema = z.object({
	data: z.array(providerPriceItemSchema),
	links: z
		.object({
			first: z.string().nullable(),
			last: z.string().nullable(),
			prev: z.string().nullable(),
			next: z.string().nullable(),
		})
		.passthrough(),
	meta: z
		.object({
			current_page: z.number().int(),
			last_page: z.number().int(),
			per_page: z.number().int(),
			total: z.number().int(),
		})
		.passthrough(),
});

const validateProviderInputSchema = z.object({
	domainSourceAccountId: z.string().min(1),
});

const listProviderPricesInputSchema = z.object({
	domainSourceAccountId: z.string().min(1),
	page: z.number().int().positive().default(1),
	limit: z.number().int().positive().max(100).default(25),
});

const saveSelectedProviderPricesInputSchema = z.object({
	organizationId: z.string().min(1),
	productId: z.string().min(1),
	domainSourceAccountId: z.string().min(1),
	selectedProviderPriceIds: z.array(z.number().int().positive()).min(1),
});

const syncProviderPricesInputSchema = z.object({
	organizationId: z.string().min(1),
	productId: z.string().min(1),
	domainSourceAccountId: z.string().min(1),
});

function makeId(prefix: string) {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function stringifyJson(value: unknown) {
	return JSON.stringify(value);
}

function toNumber(value: string | number) {
	if (typeof value === "number") return value;

	const parsed = Number(value);
	if (Number.isNaN(parsed)) {
		throw new ORPCError("BAD_REQUEST", {
			message: `Nilai angka tidak valid: ${value}`,
		});
	}

	return parsed;
}

async function requireProvider(domainSourceAccountId: string) {
	const rows = await db
		.select({
			id: domainSourceAccount.id,
		})
		.from(domainSourceAccount)
		.where(eq(domainSourceAccount.id, domainSourceAccountId))
		.limit(1);

	if (!rows[0]) {
		throw new ORPCError("BAD_REQUEST", {
			message:
				"Provider belum ada di database. Provider harus dibuat manual terlebih dahulu.",
		});
	}

	return rows[0];
}

async function requireProductInOrganization(
	organizationId: string,
	productId: string,
) {
	const rows = await db
		.select({
			id: product.id,
		})
		.from(product)
		.where(
			and(eq(product.id, productId), eq(product.organizationId, organizationId)),
		)
		.limit(1);

	if (!rows[0]) {
		throw new ORPCError("NOT_FOUND", {
			message: "Produk domain tidak ditemukan pada organization yang diberikan.",
		});
	}

	return rows[0];
}

function buildProviderUrl(pathname: string, search: URLSearchParams) {
	const baseUrl = env.RDASH_API_URL.replace(/\/$/, "");
	const query = search.toString();
	return query ? `${baseUrl}${pathname}?${query}` : `${baseUrl}${pathname}`;
}

async function fetchProviderPricesPage(input: {
	page: number;
	limit: number;
}) {
	const auth = Buffer.from(
		`${env.RDASH_RESELLER_ID}:${env.RDASH_API_KEY}`,
	).toString("base64");

	const search = new URLSearchParams({
		page: String(input.page),
		limit: String(input.limit),
	});

	const response = await fetch(buildProviderUrl("/account/prices", search), {
		method: "GET",
		headers: {
			Accept: "application/json",
			Authorization: `Basic ${auth}`,
		},
		cache: "no-store",
	});

	if (!response.ok) {
		const body = await response.text();

		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: `Gagal mengambil harga provider. ${body || response.statusText}`,
		});
	}

	const json = await response.json();
	return providerPriceListResponseSchema.parse(json);
}

async function fetchAllProviderPrices() {
	const firstPage = await fetchProviderPricesPage({ page: 1, limit: 100 });
	const items = [...firstPage.data];

	for (let page = 2; page <= firstPage.meta.last_page; page += 1) {
		const nextPage = await fetchProviderPricesPage({ page, limit: 100 });
		items.push(...nextPage.data);
	}

	return items;
}

function flattenProviderItemToRows(params: {
	organizationId: string;
	productId: string;
	domainSourceAccountId: string;
	item: z.infer<typeof providerPriceItemSchema>;
}) {
	const item = params.item;

	const common = {
		organizationId: params.organizationId,
		productId: params.productId,
		domainSourceAccountId: params.domainSourceAccountId,
		providerCode: "rdash",
		externalPriceId: item.id,
		registryId: item.registry_id ?? item.domain_extension.registry_id ?? null,
		domainExtensionId: item.domain_extension.id,
		extension: item.domain_extension.extension,
		currency: item.currency,
		isActive: item.domain_extension.status === 1,
		metadata: stringifyJson({
			domain_extension: item.domain_extension,
			promo_registration: item.promo_registration ?? null,
		}),
	};

	const rows: Array<typeof productPrice.$inferInsert> = [];

	for (const [period, amount] of Object.entries(item.registration)) {
		rows.push({
			id: makeId("ppr"),
			...common,
			priceType: "registration",
			period: Number(period),
			isPromo: false,
			priceAmount: toNumber(amount),
			pricePoints: toNumber(amount),
		});
	}

	for (const [period, amount] of Object.entries(item.renewal)) {
		rows.push({
			id: makeId("ppr"),
			...common,
			priceType: "renewal",
			period: Number(period),
			isPromo: false,
			priceAmount: toNumber(amount),
			pricePoints: toNumber(amount),
		});
	}

	rows.push({
		id: makeId("ppr"),
		...common,
		priceType: "transfer",
		period: 0,
		isPromo: false,
		priceAmount: toNumber(item.transfer),
		pricePoints: toNumber(item.transfer),
	});

	rows.push({
		id: makeId("ppr"),
		...common,
		priceType: "redemption",
		period: 0,
		isPromo: false,
		priceAmount: toNumber(item.redemption),
		pricePoints: toNumber(item.redemption),
	});

	rows.push({
		id: makeId("ppr"),
		...common,
		priceType: "proxy",
		period: 0,
		isPromo: false,
		priceAmount: toNumber(item.proxy),
		pricePoints: toNumber(item.proxy),
	});

	if (item.promo_registration?.registration) {
		for (const [period, amount] of Object.entries(
			item.promo_registration.registration,
		)) {
			if (amount === "" || amount === null || amount === undefined) continue;

			rows.push({
				id: makeId("ppr"),
				...common,
				priceType: "registration",
				period: Number(period),
				isPromo: true,
				priceAmount: toNumber(amount),
				pricePoints: toNumber(amount),
				metadata: stringifyJson({
					domain_extension: item.domain_extension,
					promo_registration: item.promo_registration,
				}),
			});
		}
	}

	return rows;
}

async function upsertPriceRows(rows: Array<typeof productPrice.$inferInsert>) {
	return await db.transaction(async (tx) => {
		for (const row of rows) {
			await tx
				.insert(productPrice)
				.values(row)
				.onConflictDoUpdate({
					target: [
						productPrice.organizationId,
						productPrice.productId,
						productPrice.domainSourceAccountId,
						productPrice.providerCode,
						productPrice.externalPriceId,
						productPrice.priceType,
						productPrice.period,
						productPrice.isPromo,
					],
					set: {
						registryId: row.registryId ?? null,
						domainExtensionId: row.domainExtensionId ?? null,
						extension: row.extension,
						currency: row.currency,
						isActive: row.isActive ?? true,
						priceAmount: row.priceAmount,
						pricePoints: row.pricePoints,
						metadata: row.metadata ?? null,
						updatedAt: new Date(),
					},
				});
		}
	});
}

export const domainCatalogRouter = {
	validateProvider: protectedProcedure
		.input(validateProviderInputSchema)
		.handler(async ({ input }) => {
			const provider = await requireProvider(input.domainSourceAccountId);

			return {
				valid: true,
				providerId: provider.id,
				message: "Provider ditemukan dan siap digunakan.",
			};
		}),

	listProviderPrices: protectedProcedure
		.input(listProviderPricesInputSchema)
		.handler(async ({ input }) => {
			await requireProvider(input.domainSourceAccountId);

			return await fetchProviderPricesPage({
				page: input.page,
				limit: input.limit,
			});
		}),

	saveSelectedProviderPrices: protectedProcedure
		.input(saveSelectedProviderPricesInputSchema)
		.handler(async ({ input }) => {
			await requireProvider(input.domainSourceAccountId);
			await requireProductInOrganization(input.organizationId, input.productId);

			const providerItems = await fetchAllProviderPrices();
			const selectedSet = new Set(input.selectedProviderPriceIds);

			const selectedItems = providerItems.filter((item) => selectedSet.has(item.id));

			if (selectedItems.length === 0) {
				throw new ORPCError("BAD_REQUEST", {
					message: "Tidak ada domain provider yang cocok dengan pilihan admin.",
				});
			}

			const rows = selectedItems.flatMap((item) =>
				flattenProviderItemToRows({
					organizationId: input.organizationId,
					productId: input.productId,
					domainSourceAccountId: input.domainSourceAccountId,
					item,
				}),
			);

			await upsertPriceRows(rows);

			return {
				success: true,
				selectedDomainCount: selectedItems.length,
				savedRowCount: rows.length,
			};
		}),

	syncProviderPrices: protectedProcedure
		.input(syncProviderPricesInputSchema)
		.handler(async ({ input }) => {
			await requireProvider(input.domainSourceAccountId);
			await requireProductInOrganization(input.organizationId, input.productId);

			const providerItems = await fetchAllProviderPrices();

			const rows = providerItems.flatMap((item) =>
				flattenProviderItemToRows({
					organizationId: input.organizationId,
					productId: input.productId,
					domainSourceAccountId: input.domainSourceAccountId,
					item,
				}),
			);

			await upsertPriceRows(rows);

			return {
				success: true,
				domainCount: providerItems.length,
				updatedRowCount: rows.length,
			};
		}),

	listLocalPrices: protectedProcedure
		.input(
			z.object({
				organizationId: z.string().min(1),
				productId: z.string().min(1),
				domainSourceAccountId: z.string().min(1),
				limit: z.number().int().positive().max(200).default(100),
			}),
		)
		.handler(async ({ input }) => {
			await requireProvider(input.domainSourceAccountId);
			await requireProductInOrganization(input.organizationId, input.productId);

			return await db
				.select()
				.from(productPrice)
				.where(
					and(
						eq(productPrice.organizationId, input.organizationId),
						eq(productPrice.productId, input.productId),
						eq(productPrice.domainSourceAccountId, input.domainSourceAccountId),
					),
				)
				.orderBy(
					desc(productPrice.updatedAt),
					desc(productPrice.externalPriceId),
				)
				.limit(input.limit);
		}),
};