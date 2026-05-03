import { db } from "@tanisya/db";
import { webhookEndpoint } from "@tanisya/db/schema/webhook";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import type { GlobalEvent } from "./types";

/**
 * Membuat HMAC SHA256 Signature untuk keamanan Webhook
 */
const generateSignature = (payload: string, secret: string) => {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
};

export const dispatchEvent = async (eventName: string, data: Record<string, any>) => {
  // 1. Pastikan payload memiliki organizationId untuk routing
  const orgId = data.organizationId;
  if (!orgId) {
    console.warn(`[Event Dispatcher] Event ${eventName} diabaikan: Tidak ada organizationId di payload.`);
    return;
  }

  const payload: GlobalEvent = {
    event: eventName,
    data,
    timestamp: new Date().toISOString(),
  };

  const payloadString = JSON.stringify(payload);

  try {
    // 2. Ambil semua Webhook Endpoint milik organisasi tersebut yang sedang aktif
    const endpoints = await db.select()
      .from(webhookEndpoint)
      .where(
        and(
          eq(webhookEndpoint.organizationId, orgId),
          eq(webhookEndpoint.isActive, true)
        )
      );

    if (endpoints.length === 0) return; // Tidak ada webhook terdaftar, abaikan

    // 3. Filter endpoint berdasarkan event yang disubscribe
    const targetEndpoints = endpoints.filter((ep) => 
      ep.subscribedEvents.includes("*") || ep.subscribedEvents.includes(eventName)
    );

    // 4. Kirim HTTP POST ke masing-masing URL secara paralel
    const deliveryPromises = targetEndpoints.map(async (endpoint) => {
      const signature = generateSignature(payloadString, endpoint.secret);

      try {
        const response = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-tanisya-signature": signature,   // Header keamanan
            "x-tanisya-event": eventName,       // Identifikasi cepat
          },
          body: payloadString,
          // Timeout sangat penting agar tidak membebani server jika endpoint pelanggan mati
          signal: AbortSignal.timeout(5000) 
        });

        if (!response.ok) {
          console.error(`[Webhook Failed] Org: ${orgId} | URL: ${endpoint.url} | Status: ${response.status}`);
          // TODO: Simpan ke tabel webhook_delivery_log untuk fitur "Retry" di masa depan
        } else {
          console.log(`[Webhook Success] Org: ${orgId} | URL: ${endpoint.url}`);
        }
      } catch (error) {
        console.error(`[Webhook Network Error] Org: ${orgId} | URL: ${endpoint.url}`, error);
      }
    });

    // Jalankan semua request (Gunakan Promise.allSettled agar jika 1 gagal, yang lain tetap jalan)
    // Sebaiknya proses ini tidak di-await oleh caller utama agar tidak membuat lambat response API ke user.
    Promise.allSettled(deliveryPromises);

  } catch (error) {
    console.error(`[Event Dispatcher Fatal] Gagal memproses routing event ${eventName}`, error);
  }
};