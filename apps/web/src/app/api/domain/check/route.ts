import { auth } from "@tanisya/auth";
import { env } from "@tanisya/env/server";
import { type NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/auth-client";

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
/* 🧠 DOMAIN SUGGESTION GENERATOR */
/* ============================= */
function generateSuggestions(input: string) {
	const extensions = ["id", "com", "co.id", "net", "org"];
	const prefixes = ["get", "my"];

	let baseName = input.trim().toLowerCase();
	let originalExt = "";

	if (baseName.includes(".")) {
		const parts = baseName.split(".");
		baseName = parts[0];
		originalExt = parts.slice(1).join(".");
	}

	const suggestions = new Set<string>();

	// 1️⃣ masukkan domain asli dulu kalau ada extension
	if (originalExt) {
		suggestions.add(`${baseName}.${originalExt}`);
	}

	// 2️⃣ extension utama
	extensions.forEach((ext) => {
		suggestions.add(`${baseName}.${ext}`);
	});

	// 3️⃣ prefix variation
	prefixes.forEach((prefix) => {
		extensions.forEach((ext) => {
			suggestions.add(`${prefix}${baseName}.${ext}`);
		});
	});

	// batasi supaya tidak terlalu banyak request
	return Array.from(suggestions).slice(0, 10);
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
			available: 0,
			message: `HTTP ${res.status}`,
		};
	}

	const data = await res.json();
	return (
		data.data?.[0] ?? {
			name: domain,
			available: 0,
			message: "No data",
		}
	);
}

/* ============================= */
/* 🚀 API HANDLER */
/* ============================= */
export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const domain = searchParams.get("domain");
	const onlyAvailable = searchParams.get("available") === "true";

	if (!domain) {
		return NextResponse.json({ error: "Domain is required" }, { status: 400 });
	}

	try {
		const suggestions = generateSuggestions(domain);

		const results = await Promise.all(
			suggestions.map((d) => checkDomainAvailability(d)),
		);

		// sort: available di atas
		const sorted = results.sort((a, b) => b.available - a.available);

		// filter jika diminta
		const finalResults = onlyAvailable
			? sorted.filter((d) => d.available === 1)
			: sorted;
		const ipCheck = await fetch("https://api.ipify.org?format=json");
		const ipData = await ipCheck.json();

		console.log("OUTGOING IP:", ipData);
		return NextResponse.json({
			success: true,
			total: finalResults.length,
			suggestions: finalResults,
		});
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch RDASH API" },
			{ status: 500 },
		);
	}
}
