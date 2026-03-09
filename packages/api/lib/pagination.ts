import type { AnyColumn } from "drizzle-orm";
import { asc, description, type SQL } from "drizzle-orm";
import { z } from "zod";

// ─── Schema ───────────────────────────────────────────────────────────────────

export const paginationSchema = z.object({
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(100).default(20),
	orderBy: z.string().optional(),
	direction: z.enum(["asc", "description"]).default("description"),
});

export const filterSchema = z.object({
	keyword: z.string().optional(),
	dateFrom: z.coerce.date().optional(),
	dateTo: z.coerce.date().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type FilterInput = z.infer<typeof filterSchema>;

// ─── Pagination helper ────────────────────────────────────────────────────────

export interface PaginationResult {
	skip: number;
	take: number;
	page: number;
	limit: number;
}

export function getPagination(
	input: Pick<PaginationInput, "page" | "limit">,
): PaginationResult {
	const page = Math.max(1, input.page);
	const limit = Math.min(100, Math.max(1, input.limit));
	return { skip: (page - 1) * limit, take: limit, page, limit };
}

// ─── Meta builder ─────────────────────────────────────────────────────────────

export interface PaginatedMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export function buildMeta(
	total: number,
	pagination: PaginationResult,
): PaginatedMeta {
	return {
		page: pagination.page,
		limit: pagination.limit,
		total,
		totalPages: Math.ceil(total / pagination.limit),
	};
}

// ─── Sort helper ──────────────────────────────────────────────────────────────

/**
 * Resolve sort column dari whitelist yang aman (cegah SQL injection via column name).
 *
 * @param input     Pagination input dari user
 * @param columns   Whitelist kolom yang diizinkan { [key]: drizzleColumn }
 * @param fallback  Kolom default jika input.orderBy tidak ada / tidak valid
 */
export function resolveSort<T extends Record<string, AnyColumn>>(
	input: Pick<PaginationInput, "orderBy" | "direction">,
	columns: T,
	fallback: AnyColumn,
): SQL {
	const col = (input.orderBy && columns[input.orderBy]) ?? fallback;
	return input.direction === "asc" ? asc(col as any) : description(col as any);
}
