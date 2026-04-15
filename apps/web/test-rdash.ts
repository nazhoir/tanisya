import { env } from "../../packages/env/src/server";

async function run() {
	console.log("RDASH credentials from env:");
	console.log("URL:", env.RDASH_API_URL);
	console.log("RESELLER_ID:", env.RDASH_RESELLER_ID);
	console.log("API_KEY length:", env.RDASH_API_KEY?.length);

	let baseUrl = env.RDASH_API_URL.replace(/\/$/, "");
	if (!baseUrl.endsWith("/v1")) {
		baseUrl = `${baseUrl}/v1`;
	}

	const search = new URLSearchParams({ page: "1", limit: "15" });
	const url = `${baseUrl}/account/prices?${search.toString()}`;
	
	const auth = Buffer.from(
		`${env.RDASH_RESELLER_ID}:${env.RDASH_API_KEY}`
	).toString("base64");

	console.log("Fetching URL:", url);

	try {
		const response = await fetch(url, {
			method: "GET",
			headers: {
				Accept: "application/json",
				Authorization: `Basic ${auth}`,
			},
			cache: "no-store"
		});

		console.log("Status:", response.status, response.statusText);
		const body = await response.text();
		
		console.log("Response Body Prefix:", body.substring(0, 300));
		
		if (response.ok) {
			const json = JSON.parse(body);
			console.log("JSON parsed successfully. Top level keys:", Object.keys(json));
			if (json.data) console.log("Data size:", json.data.length);
		}
	} catch (e) {
		console.error("Error fetching:", e);
	}
}

run();
