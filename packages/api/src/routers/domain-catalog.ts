import { ORPCError } from "@orpc/server";
import { db } from "@tanisya/db";
import { product, productPrice } from "@tanisya/db/schema/catalog";
import { domainSourceAccount } from "@tanisya/db/schema/domain-routing";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";
import { parseDomainSourceCredentials } from "./_shared";

const recordOrEmptyArray = z.preprocess(
	(val) => {
		if (Array.isArray(val) && val.length === 0) return {};
		return val;
	},
	z.record(z.string(), z.union([z.string(), z.number(), z.null()]))
);

const providerDomainExtensionSchema = z.object({
	id: z.coerce.number().int(),
	extension: z.string().min(1),
	status: z.coerce.number().int(),
	status_label: z.string().nullable().optional(),
	status_badge: z.string().nullable().optional(),
	sell_option: z.coerce.number().int().optional(),
	enable_whois_protection: z.coerce.number().int().optional(),
	enable_whois_protection_label: z.string().nullable().optional(),
	enable_whois_protection_badge: z.string().nullable().optional(),
	registry_id: z.coerce.number().int().nullable().optional(),
	registry_name: z.string().nullable().optional(),
});

const providerPromoRegistrationSchema = z.object({
	registration: recordOrEmptyArray.optional(),
	description: z.string().nullable().optional(),
});

const stringOrNumber = z.union([z.string(), z.number()]);

const providerPriceItemSchema = z.object({
	id: z.coerce.number().int(),
	registry_id: z.coerce.number().int().nullable().optional(),
	domain_extension: providerDomainExtensionSchema,
	currency: z.string().min(1).default("IDR"),
	registration: recordOrEmptyArray,
	renewal: recordOrEmptyArray,
	transfer: z.union([stringOrNumber, z.null()]).optional(),
	redemption: z.union([stringOrNumber, z.null()]).optional(),
	proxy: z.union([stringOrNumber, z.null()]).optional(),
	promo_registration: providerPromoRegistrationSchema.nullable().optional(),
});

const providerPriceListResponseSchema = z.preprocess(
	(val: any) => {
		if (Array.isArray(val)) {
			return {
				data: val,
				meta: { current_page: 1, last_page: 1, per_page: Math.max(25, val.length), total: val.length }
			};
		}
		if (typeof val !== "object" || val === null) return val;
		// Jika API mengembalikan data paginasi di level root (LengthAwarePaginator Laravel biasa)
		if (val.current_page !== undefined && !val.meta) {
			return {
				...val,
				meta: {
					current_page: val.current_page,
					last_page: val.last_page,
					per_page: val.per_page,
					total: val.total,
				},
			};
		}
		// Jika meta bernilai null, set default fallback
		if (!val.meta) {
			val.meta = { current_page: 1, last_page: 1, per_page: 25, total: 0 };
		}
		return val;
	},
	z.object({
		data: z.array(providerPriceItemSchema).default([]),
		links: z
			.object({
				first: z.string().nullable().optional(),
				last: z.string().nullable().optional(),
				prev: z.string().nullable().optional(),
				next: z.string().nullable().optional(),
			})
			.passthrough()
			.nullable()
			.optional(),
		meta: z
			.object({
				current_page: z.coerce.number().int(),
				last_page: z.coerce.number().int(),
				per_page: z.coerce.number().int(),
				total: z.coerce.number().int(),
			})
			.passthrough(),
	})
);

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

function toNumber(value: string | number | null | undefined) {
	if (value === null || value === undefined || value === "") return 0;
	if (typeof value === "number") return value;

	const parsed = Number(value);
	if (Number.isNaN(parsed)) {
		return 0; // fallback safer
	}

	return parsed;
}

async function requireProvider(domainSourceAccountId: string) {
	const rows = await db
		.select({
			id: domainSourceAccount.id,
			credentials: domainSourceAccount.credentials,
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

function buildProviderUrl(baseUrlInput: string, pathname: string, search: URLSearchParams) {
	let baseUrl = baseUrlInput.replace(/\/$/, "");
	if (!baseUrl.endsWith("/v1")) {
		baseUrl = `${baseUrl}/v1`;
	}
	const query = search.toString();
	return query ? `${baseUrl}${pathname}?${query}` : `${baseUrl}${pathname}`;
}

async function fetchProviderPricesPage(input: {
	credentialsText: string | null;
	page: number;
	limit: number;
}) {
	const creds = parseDomainSourceCredentials(input.credentialsText);
	const auth = Buffer.from(
		`${creds.resellerId}:${creds.apiKey}`,
	).toString("base64");

	const search = new URLSearchParams({
		page: String(input.page),
		limit: String(input.limit),
	});

	const response = await fetch(buildProviderUrl(creds.baseUrl ?? "https://api.rdash.id/v1", "/account/prices", search), {
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
	const parsed = providerPriceListResponseSchema.safeParse(json);
	
	if (!parsed.success) {
		console.error("fetchProviderPricesPage Zod Error:", JSON.stringify(parsed.error.issues, null, 2));
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: `Gagal memvalidasi response provider: ${parsed.error.issues[0]?.message} di ${parsed.error.issues[0]?.path?.join(".")}`,
		});
	}
	
	return parsed.data;
}

async function fetchAllProviderPrices(credentialsText: string | null) {
	const firstPage = await fetchProviderPricesPage({ credentialsText, page: 1, limit: 100 });
	const items = [...firstPage.data];

	const lastPage = firstPage.meta?.last_page || 1;
	for (let page = 2; page <= lastPage; page += 1) {
		const nextPage = await fetchProviderPricesPage({ credentialsText, page, limit: 100 });
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
		priceAmount: toNumber(item.transfer ?? 0),
		pricePoints: toNumber(item.transfer ?? 0),
	});

	rows.push({
		id: makeId("ppr"),
		...common,
		priceType: "redemption",
		period: 0,
		isPromo: false,
		priceAmount: toNumber(item.redemption ?? 0),
		pricePoints: toNumber(item.redemption ?? 0),
	});

	rows.push({
		id: makeId("ppr"),
		...common,
		priceType: "proxy",
		period: 0,
		isPromo: false,
		priceAmount: toNumber(item.proxy ?? 0),
		pricePoints: toNumber(item.proxy ?? 0),
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
			const provider = await requireProvider(input.domainSourceAccountId);

			return await fetchProviderPricesPage({
				credentialsText: provider.credentials,
				page: input.page,
				limit: input.limit,
			});
		}),

	saveSelectedProviderPrices: protectedProcedure
		.input(saveSelectedProviderPricesInputSchema)
		.handler(async ({ input }) => {
			const provider = await requireProvider(input.domainSourceAccountId);
			await requireProductInOrganization(input.organizationId, input.productId);

			const providerItems = await fetchAllProviderPrices(provider.credentials);
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
			const provider = await requireProvider(input.domainSourceAccountId);
			await requireProductInOrganization(input.organizationId, input.productId);

			const providerItems = await fetchAllProviderPrices(provider.credentials);

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