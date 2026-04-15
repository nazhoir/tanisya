import { createHash, randomUUID } from "node:crypto";

import { ORPCError } from "@orpc/server";
import { db } from "@tanisya/db";
import * as schema from "@tanisya/db/schema/index";
import { env } from "@tanisya/env/server";
import { and, asc, desc, eq } from "drizzle-orm";

export type BetterAuthContext = {
	session?: {
		user?: {
			id?: string;
			email?: string | null;
			name?: string | null;
			role?: string | null;
		};
		session?: {
			activeOrganizationId?: string | null;
		};
		activeOrganizationId?: string | null;
	};
};

export function makeId(prefix: string) {
	return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}

export function normalizeDomainName(value: string) {
	return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function extractTldFromDomain(domainName: string) {
	const normalized = normalizeDomainName(domainName);
	const parts = normalized.split(".").filter(Boolean);

	if (parts.length < 2) {
		throw new ORPCError("BAD_REQUEST", {
			message: "Nama domain tidak valid.",
		});
	}

	if (parts.length >= 3 && parts.at(-2) === "co") {
		return `.${parts.at(-2)}.${parts.at(-1)}`;
	}

	if (parts.length >= 3 && parts.at(-2) === "or") {
		return `.${parts.at(-2)}.${parts.at(-1)}`;
	}

	return `.${parts.at(-1)}`;
}

export function stringifyJson(value: unknown) {
	return JSON.stringify(value ?? null);
}

export function parseJsonText<T>(raw: string | null | undefined, fallback: T): T {
	if (!raw) return fallback;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

const ENV_RECORD = env as unknown as Record<string, string | undefined>;

export function getOptionalEnv(key: string): string | undefined {
	const value = ENV_RECORD[key];
	if (typeof value !== "string") return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

export function parseAdminUserIds() {
	return (getOptionalEnv("BETTER_AUTH_ADMIN_USER_IDS") ?? "")
		.split(",")
		.map((value) => value.trim())
		.filter(Boolean);
}

export async function requireSessionUser(context: BetterAuthContext) {
	const userId = context.session?.user?.id;
	if (!userId) {
		throw new ORPCError("UNAUTHORIZED", {
			message: "Kamu harus login terlebih dahulu.",
		});
	}

	return {
		id: userId,
		email: context.session?.user?.email ?? null,
		name: context.session?.user?.name ?? null,
		role: context.session?.user?.role ?? null,
	};
}

export async function requireAdminUser(context: BetterAuthContext) {
	const currentUser = await requireSessionUser(context);
	const adminIds = parseAdminUserIds();

	const isEnvAdmin = adminIds.includes(currentUser.id);
	const isDbAdmin = currentUser.role === "admin";

	if (!isEnvAdmin && !isDbAdmin) {
		throw new ORPCError("FORBIDDEN", {
			message: "Aksi ini hanya untuk admin aplikasi.",
		});
	}

	return currentUser;
}

export async function requireActiveOrganizationId(context: BetterAuthContext, userId: string) {
	const activeOrganizationId =
		context.session?.session?.activeOrganizationId ??
		context.session?.activeOrganizationId ??
		null;

	if (activeOrganizationId) {
		const membership = await db
			.select({ organizationId: schema.member.organizationId })
			.from(schema.member)
			.where(
				and(
					eq(schema.member.userId, userId),
					eq(schema.member.organizationId, activeOrganizationId),
				),
			)
			.limit(1);

		if (membership[0]?.organizationId) {
			return membership[0].organizationId;
		}
	}

	const firstMembership = await db
		.select({ organizationId: schema.member.organizationId })
		.from(schema.member)
		.where(eq(schema.member.userId, userId))
		.orderBy(asc(schema.member.createdAt))
		.limit(1);

	if (!firstMembership[0]?.organizationId) {
		throw new ORPCError("FORBIDDEN", {
			message: "Kamu belum tergabung dalam organisasi mana pun.",
		});
	}

	return firstMembership[0].organizationId;
}

export async function requireUserProfile(userId: string) {
	const rows = await db
		.select()
		.from(schema.userProfile)
		.where(eq(schema.userProfile.userId, userId))
		.limit(1);

	if (!rows[0]) {
		throw new ORPCError("BAD_REQUEST", {
			message: "User profile provider belum tersedia untuk user ini.",
		});
	}

	return rows[0];
}

export async function requirePointWallet(organizationId: string) {
	const rows = await db
		.select()
		.from(schema.pointWallet)
		.where(eq(schema.pointWallet.organizationId, organizationId))
		.limit(1);

	if (!rows[0]) {
		throw new ORPCError("BAD_REQUEST", {
			message: "Point wallet organisasi belum tersedia.",
		});
	}

	return rows[0];
}

export type DomainSourceCredentials = {
	baseUrl?: string;
	resellerId: string;
	apiKey: string;
};

export function parseDomainSourceCredentials(raw: string | null | undefined) {
	const parsed = parseJsonText<Partial<DomainSourceCredentials>>(raw, {});
	const resellerId = parsed.resellerId ?? env.RDASH_RESELLER_ID ?? null;
	const apiKey = parsed.apiKey ?? env.RDASH_API_KEY ?? null;
	const baseUrl = parsed.baseUrl ?? env.RDASH_API_URL ?? "https://api.rdash.id/v1";

	if (!resellerId || !apiKey) {
		throw new ORPCError("BAD_REQUEST", {
			message:
				"Credentials domain source account tidak valid. Pastikan resellerId dan apiKey tersedia di credentials atau env server.",
		});
	}

	return {
		baseUrl,
		resellerId,
		apiKey,
	} satisfies DomainSourceCredentials;
}

export async function requireDomainSourceAccountForOrganization(
	organizationId: string,
	sourceAccountId?: string,
) {
	const rows = await db
		.select()
		.from(schema.domainSourceAccount)
		.where(
			sourceAccountId
				? and(
						eq(schema.domainSourceAccount.organizationId, organizationId),
						eq(schema.domainSourceAccount.id, sourceAccountId),
				  )
				: and(
						eq(schema.domainSourceAccount.organizationId, organizationId),
						eq(schema.domainSourceAccount.isDefault, true),
				  ),
		)
		.limit(1);

	if (!rows[0]) {
		throw new ORPCError("BAD_REQUEST", {
			message: sourceAccountId
				? "Domain source account tidak ditemukan."
				: "Domain source account default belum dikonfigurasi.",
		});
	}

	return rows[0];
}

export async function requireLocalDomainOwnedByUser(domainId: string, organizationId: string, userId: string) {
	const rows = await db
		.select()
		.from(schema.domain)
		.where(
			and(
				eq(schema.domain.id, domainId),
				eq(schema.domain.organizationId, organizationId),
				eq(schema.domain.customerUserId, userId),
			),
		)
		.limit(1);

	if (!rows[0]) {
		throw new ORPCError("NOT_FOUND", {
			message: "Domain lokal tidak ditemukan.",
		});
	}

	return rows[0];
}

export async function requireLocalDomainForAdmin(domainId: string, organizationId: string) {
	const rows = await db
		.select()
		.from(schema.domain)
		.where(
			and(
				eq(schema.domain.id, domainId),
				eq(schema.domain.organizationId, organizationId),
			),
		)
		.limit(1);

	if (!rows[0]) {
		throw new ORPCError("NOT_FOUND", {
			message: "Domain lokal tidak ditemukan.",
		});
	}

	return rows[0];
}

export async function requireDomainVerificationDocument(
	documentId: string,
	organizationId: string,
) {
	const rows = await db
		.select()
		.from(schema.domainVerificationDocument)
		.where(
			and(
				eq(schema.domainVerificationDocument.id, documentId),
				eq(schema.domainVerificationDocument.organizationId, organizationId),
			),
		)
		.limit(1);

	if (!rows[0]) {
		throw new ORPCError("NOT_FOUND", {
			message: "Dokumen verifikasi domain tidak ditemukan.",
		});
	}

	return rows[0];
}

export function extractProviderId(payload: unknown): number | undefined {
	if (!payload || typeof payload !== "object") return undefined;
	const source = payload as Record<string, unknown>;
	const candidates = [
		source.id,
		source.customer_id,
		source.contact_id,
		source.domain_id,
		source.price_id,
		typeof source.data === "object" && source.data
			? (source.data as Record<string, unknown>).id
			: undefined,
	];

	for (const candidate of candidates) {
		if (typeof candidate === "number" && Number.isFinite(candidate)) {
			return candidate;
		}
		if (typeof candidate === "string" && candidate.trim()) {
			const parsed = Number(candidate);
			if (Number.isFinite(parsed)) {
				return parsed;
			}
		}
	}

	return undefined;
}

export function buildNameserverForm(nameservers?: string[]) {
	const entries: Record<string, string> = {};
	(nameservers ?? []).slice(0, 5).forEach((host, index) => {
		if (host?.trim()) {
			entries[`nameserver[${index}]`] = host.trim().toLowerCase();
		}
	});
	return entries;
}

export function buildNsUpdateForm(nameservers: string[]) {
	const entries: Record<string, string> = {};
	nameservers.slice(0, 5).forEach((host, index) => {
		if (host?.trim()) {
			entries[`nameserver[${index}]`] = host.trim().toLowerCase();
		}
	});
	return entries;
}

export function sha256Hex(buffer: Buffer) {
	return createHash("sha256").update(buffer).digest("hex");
}

export function sanitizeFileName(name: string) {
	const trimmed = name.trim();
	const lastDot = trimmed.lastIndexOf(".");
	const baseName = lastDot > 0 ? trimmed.slice(0, lastDot) : trimmed;
	const extension = lastDot > 0 ? trimmed.slice(lastDot + 1).toLowerCase() : "bin";
	const safeBase = baseName
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 60);
	const safeExt = extension.replace(/[^a-z0-9]+/g, "").slice(0, 10) || "bin";
	return {
		base: safeBase || "file",
		extension: safeExt,
	};
}

export function decodeBase64File(input: string) {
	const raw = input.includes(",") ? input.split(",").pop() ?? "" : input;
	try {
		return Buffer.from(raw, "base64");
	} catch {
		throw new ORPCError("BAD_REQUEST", {
			message: "File base64 tidak valid.",
		});
	}
}

export function getStoragePublicBaseUrl() {
	if (!env.STORAGE_PUBLIC_URL) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "STORAGE_PUBLIC_URL belum dikonfigurasi.",
		});
	}
	return env.STORAGE_PUBLIC_URL.replace(/\/+$/, "");
}

export function inferStorageBucketFromPublicUrl() {
	const publicUrl = new URL(getStoragePublicBaseUrl());
	const firstPathSegment = publicUrl.pathname.split("/").filter(Boolean)[0];
	if (firstPathSegment) return firstPathSegment;

	const hostParts = publicUrl.hostname.split(".").filter(Boolean);
	if (hostParts.length > 0) {
		return hostParts[0];
	}

	throw new ORPCError("INTERNAL_SERVER_ERROR", {
		message:
			"Bucket storage tidak dapat diinfer dari STORAGE_PUBLIC_URL. Gunakan base URL bucket yang eksplisit.",
	});
}

export function makeVerificationStorageKey(input: {
	organizationId: string;
	domainId: string;
	domainName: string;
	originalFileName: string;
}) {
	const now = new Date();
	const yyyy = String(now.getUTCFullYear());
	const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
	const dd = String(now.getUTCDate()).padStart(2, "0");
	const { base, extension } = sanitizeFileName(input.originalFileName);
	const safeDomain = normalizeDomainName(input.domainName).replace(/[^a-z0-9.-]+/g, "-");
	const stamp = `${Date.now()}-${randomUUID().slice(0, 8)}`;
	return `domains/${input.organizationId}/${input.domainId}/verification/${yyyy}/${mm}/${dd}/${safeDomain}-${base}-${stamp}.${extension}`;
}

export function makePublicStorageUrl(key: string) {
	return `${getStoragePublicBaseUrl()}/${key}`;
}

export async function resolveDomainPurchaseConfig(input: {
	organizationId: string;
	userId: string;
	productPriceId: string;
	domainName: string;
	overrideContactSetId?: string;
	overridePolicyId?: string;
	overrideSourceId?: string;
}) {
	const userProfile = await requireUserProfile(input.userId);
	if (!userProfile.externalCustomerId) {
		throw new ORPCError("BAD_REQUEST", {
			message: "External customer id pada user profile belum tersedia.",
		});
	}

	const productPriceRows = await db
		.select()
		.from(schema.productPrice)
		.where(
			and(
				eq(schema.productPrice.organizationId, input.organizationId),
				eq(schema.productPrice.id, input.productPriceId),
			),
		)
		.limit(1);
	const productPrice = productPriceRows[0];
	if (!productPrice) {
		throw new ORPCError("NOT_FOUND", { message: "Product price tidak ditemukan." });
	}

	const productRows = await db
		.select()
		.from(schema.product)
		.where(eq(schema.product.id, productPrice.productId))
		.limit(1);
	const product = productRows[0];
	if (!product || product.type !== "domain") {
		throw new ORPCError("BAD_REQUEST", { message: "Produk ini bukan produk domain." });
	}

	const tld = productPrice.extension ?? extractTldFromDomain(input.domainName);
	const policyRows = await db
		.select()
		.from(schema.domainTldPolicy)
		.where(
			input.overridePolicyId
				? and(
						eq(schema.domainTldPolicy.organizationId, input.organizationId),
						eq(schema.domainTldPolicy.id, input.overridePolicyId),
				  )
				: and(
						eq(schema.domainTldPolicy.organizationId, input.organizationId),
						eq(schema.domainTldPolicy.tld, tld),
						eq(schema.domainTldPolicy.isActive, true),
				  ),
		)
		.limit(1);
	const policy = policyRows[0] ?? null;

	const sourceId = input.overrideSourceId ?? policy?.domainSourceAccountId;
	if (!sourceId) {
		throw new ORPCError("BAD_REQUEST", {
			message: `Domain source account untuk ${tld} belum dikonfigurasi.`,
		});
	}

	const sourceAccountRows = await db
		.select()
		.from(schema.domainSourceAccount)
		.where(
			and(
				eq(schema.domainSourceAccount.organizationId, input.organizationId),
				eq(schema.domainSourceAccount.id, sourceId),
			),
		)
		.limit(1);
	const sourceAccount = sourceAccountRows[0];
	if (!sourceAccount) {
		throw new ORPCError("BAD_REQUEST", {
			message: "Domain source account tidak ditemukan.",
		});
	}

	const contactSetId = input.overrideContactSetId ?? policy?.defaultDomainContactSetId;
	if (!contactSetId) {
		throw new ORPCError("BAD_REQUEST", {
			message: `Domain contact set untuk ${tld} belum dikonfigurasi.`,
		});
	}

	const contactSetRows = await db
		.select()
		.from(schema.domainContactSet)
		.where(eq(schema.domainContactSet.id, contactSetId))
		.limit(1);
	const contactSet = contactSetRows[0];
	if (!contactSet) {
		throw new ORPCError("BAD_REQUEST", {
			message: "Domain contact set tidak ditemukan.",
		});
	}

	return { userProfile, product, productPrice, tld, policy, sourceAccount, contactSet };
}

export async function listLatestVerificationDocuments(domainId: string, limit = 10) {
	return await db
		.select()
		.from(schema.domainVerificationDocument)
		.where(eq(schema.domainVerificationDocument.domainId, domainId))
		.orderBy(desc(schema.domainVerificationDocument.createdAt))
		.limit(limit);
}


export function ensureValue<T>(value: T | null | undefined, message: string): T {
	if (value === null || value === undefined) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", { message });
	}
	return value;
}

export async function ensurePointWallet(
	organizationId: string,
	tx: Pick<typeof db, "select" | "insert"> = db,
) {
	const existing = await tx
		.select()
		.from(schema.pointWallet)
		.where(eq(schema.pointWallet.organizationId, organizationId))
		.limit(1);
	if (existing[0]) return existing[0];
	const created = await tx
		.insert(schema.pointWallet)
		.values({
			id: makeId("pwa"),
			organizationId,
			balance: 0,
			currency: "IDR",
		})
		.returning();
	return ensureValue(created[0], "Gagal membuat point wallet organisasi.");
}

export async function requirePaymentMethodForOrganization(
	organizationId: string,
	paymentMethodId: string,
) {
	const rows = await db
		.select()
		.from(schema.organizationPaymentMethod)
		.where(
			and(
				eq(schema.organizationPaymentMethod.organizationId, organizationId),
				eq(schema.organizationPaymentMethod.id, paymentMethodId),
			),
		)
		.limit(1);
	return ensureValue(rows[0], "Payment method organisasi tidak ditemukan.");
}
