import { env } from "@tanisya/env/server";
import { ORPCError } from "@orpc/server";

import type { DomainSourceCredentials } from "./_shared";
export { extractProviderId } from "./_shared";

type QueryValue = string | number | boolean | null | undefined;
type FormValue = string | number | boolean | null | undefined;

function buildBasicAuthHeader(credentials: DomainSourceCredentials) {
	return `Basic ${Buffer.from(`${credentials.resellerId}:${credentials.apiKey}`).toString("base64")}`;
}

function buildBaseUrl(baseUrl: string) {
	return baseUrl.replace(/\/+$/, "");
}

function appendQuery(url: URL, query?: Record<string, QueryValue>) {
	if (!query) return;
	for (const [key, value] of Object.entries(query)) {
		if (value === undefined || value === null || value === "") continue;
		url.searchParams.set(key, String(value));
	}
}

function buildFormBody(form?: Record<string, FormValue>) {
	const body = new URLSearchParams();
	if (!form) return body;

	for (const [key, value] of Object.entries(form)) {
		if (value === undefined || value === null || value === "") continue;
		body.set(key, String(value));
	}

	return body;
}

async function parseResponseBody(response: Response) {
	const contentType = response.headers.get("content-type") ?? "";
	if (contentType.includes("application/json")) {
		return await response.json();
	}
	return await response.text();
}

export async function rdashRequest<T>(input: {
	credentials: DomainSourceCredentials;
	path: string;
	method?: "GET" | "POST" | "PUT" | "DELETE";
	query?: Record<string, QueryValue>;
	form?: Record<string, FormValue>;
}) {
	const url = new URL(`${buildBaseUrl(input.credentials.baseUrl ?? env.RDASH_API_URL ?? "https://api.rdash.id/v1")}${input.path}`);
	appendQuery(url, input.query);

	const method = input.method ?? "GET";
	const isFormMethod = method === "POST" || method === "PUT" || method === "DELETE";

	const response = await fetch(url, {
		method,
		headers: {
			Authorization: buildBasicAuthHeader(input.credentials),
			Accept: "application/json",
			...(isFormMethod
				? { "Content-Type": "application/x-www-form-urlencoded" }
				: {}),
		},
		body: isFormMethod ? buildFormBody(input.form) : undefined,
	});

	const body = await parseResponseBody(response);
	if (!response.ok) {
		throw new ORPCError("BAD_GATEWAY", {
			message: `RDash request gagal: ${method} ${input.path}`,
			data: body,
		});
	}

	return body as T;
}
