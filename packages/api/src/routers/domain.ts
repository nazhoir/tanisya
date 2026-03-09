import { env } from "@tanisya/env/server";
import z from "zod";

import { publicProcedure } from "../index";

/* ============================= */
/* 🔐 BASIC AUTH HEADER */
/* ============================= */
function getBasicAuthHeader() {
	const credentials = Buffer.from(
		`${env.RDASH_RESELLER_ID}:${env.RDASH_API_KEY}`,
	).toString("base64");

	return `Basic ${credentials}`;
}

/* ============================= */
/* 🌐 RDASH FETCH HELPER */
/* ============================= */
async function checkDomainAvailability(domain: string) {
	const res = await fetch(
		`${env.RDASH_API_URL}/domains/availability?domain=${domain}`,
		{
			headers: {
				Authorization: getBasicAuthHeader(),
			},
			cache: "no-store",
		},
	);

	if (!res.ok) {
		const errorText = await res.text();
		console.error("RDASH ERROR:", {
			status: res.status,
			statusText: res.statusText,
			body: errorText,
		});
		return {
			name: domain,
			available: 0 as const,
			message: `HTTP ${res.status}`,
		};
	}

	const data = await res.json();
	return (
		data.data?.[0] ?? {
			name: domain,
			available: 0 as const,
			message: "No data",
		}
	);
}

/* ============================= */
/* 📦 EXTENSION BATCHES */
/* ============================= */

// Batch 1: ditampilkan langsung saat user search
const EXTENSIONS_PRIMARY = ["com", "id", "co.id", "net", "org", "io", "dev", "app"];

// Batch 2: ditampilkan saat user klik "Domain Lain"
const EXTENSIONS_SECONDARY = [
	"co", "info", "biz", "tech", "shop", "store",
	"design", "art", "media", "studio", "cloud",
	"digital", "blog", "page", "market", "agency",
];

/* ============================= */
/* 🔧 HELPERS */
/* ============================= */
function buildDomainList(baseName: string, extensions: string[]): string[] {
	return extensions.map((ext) => `${baseName}.${ext}`);
}

function extractBaseName(input: string): { baseName: string; originalExt: string | null } {
	const clean = input.trim().toLowerCase();
	if (clean.includes(".")) {
		const parts = clean.split(".");
		return {
			baseName: parts[0],
			originalExt: parts.slice(1).join("."),
		};
	}
	return { baseName: clean, originalExt: null };
}

/* ============================= */
/* 🚀 DOMAIN ROUTER */
/* ============================= */
export const domainRouter = {
	/**
	 * Batch 1: cek domain utama + ekstensi populer.
	 * Dipanggil saat user pertama kali search.
	 */
	checkPrimary: publicProcedure
		.input(
			z.object({
				domain: z.string().min(1),
			}),
		)
		.handler(async ({ input }) => {
			const { baseName, originalExt } = extractBaseName(input.domain);

			// Selalu sertakan ekstensi yang diketik user (jika ada) di posisi pertama
			const exts = originalExt
				? [originalExt, ...EXTENSIONS_PRIMARY.filter((e) => e !== originalExt)]
				: EXTENSIONS_PRIMARY;

			const domains = buildDomainList(baseName, exts);

			const results = await Promise.all(
				domains.map((d) => checkDomainAvailability(d)),
			);

			return {
				baseName,
				total: results.length,
				results,
			};
		}),

	/**
	 * Batch 2: cek ekstensi tambahan.
	 * Dipanggil saat user klik tombol "Domain Lain".
	 */
	checkSecondary: publicProcedure
		.input(
			z.object({
				domain: z.string().min(1),
			}),
		)
		.handler(async ({ input }) => {
			const { baseName } = extractBaseName(input.domain);

			const domains = buildDomainList(baseName, EXTENSIONS_SECONDARY);

			const results = await Promise.all(
				domains.map((d) => checkDomainAvailability(d)),
			);

			return {
				baseName,
				total: results.length,
				results,
			};
		}),
};