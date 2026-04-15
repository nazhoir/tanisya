import { NextResponse } from "next/server";

import { handleXenditInvoiceWebhook } from "@tanisya/api/webhooks/xendit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	const callbackToken = request.headers.get("x-callback-token");

	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json(
			{ success: false, message: "Payload webhook tidak valid." },
			{ status: 400 },
		);
	}

	try {
		const result = await handleXenditInvoiceWebhook({
			callbackToken,
			payload: payload as never,
		});

		return NextResponse.json({ success: true, ...result }, { status: 200 });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Webhook gagal diproses.";
		const status = message.toLowerCase().includes("token") ? 401 : 400;
		return NextResponse.json({ success: false, message }, { status });
	}
}

export function GET() {
	return NextResponse.json(
		{ success: false, message: "Method not allowed." },
		{ status: 405 },
	);
}
