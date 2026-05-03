import { env } from "@tanisya/env/server";

export const createXenditSession = async (payload: any) => {
  const apiKey = env.XENDIT_SECRET_KEY;
  if (!apiKey) throw new Error("XENDIT_SECRET_KEY is missing");

  // Format Basic Auth: base64(apiKey:)
  const b64Token = Buffer.from(`${apiKey}:`).toString("base64");

  const response = await fetch("https://api.xendit.co/sessions", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Basic ${b64Token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("[Xendit API Error]:", errorData);
    throw new Error(errorData.message || `Xendit Error: ${response.status}`);
  }

  return response.json();
};