import { serve } from "@hono/node-server";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { createContext } from "@tanisya/api/context";
import { appRouter } from "@tanisya/api/routers/index";

import { auth } from "@tanisya/auth";
import { env } from "@tanisya/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

// 1. GLOBAL MIDDLEWARES
app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "x-callback-token"],
    credentials: true,
  }),
);

// 2. AUTHENTICATION ROUTE (Better Auth)
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

/**
 * 3. XENDIT WEBHOOK HANDLER
 * Sesuai panduan keamanan Xendit:
 * - Menggunakan Server-side handling.
 * - Verifikasi x-callback-token.
 * - Memberikan Quick Acknowledgement (2xx).
 */
app.post("/api/webhooks/xendit", async (c) => {
  const callbackToken = c.req.header("x-callback-token");

  // Authenticate sender
  if (callbackToken !== env.XENDIT_WEBHOOK_VERIFICATION_TOKEN) {
    console.error("[Security Alert] Unauthorized Xendit Webhook attempt.");
    return c.json({ message: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();

    console.log(body)
    

    // Selalu balas 200 jika format benar agar Xendit tidak terus melakukan retry
    return c.json({ 
      status: "success", 
      // processed: result.success,
      // message: result.message 
    }, 200);
  } catch (err) {
    console.error("[Webhook Critical Error]:", err);
    // Balas 500 jika server error agar Xendit melakukan retry otomatis
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

// 4. oRPC & OPENAPI HANDLERS CONFIG
export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

/**
 * 5. oRPC & API REFERENCE MIDDLEWARE (Catch-all)
 */
app.use("/*", async (c, next) => {
  const context = await createContext({ context: c });

  // Handle oRPC requests
  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  // Handle Swagger/OpenAPI Reference requests
  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api-reference",
    context: context,
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

// 6. HEALTH CHECK
app.get("/", (c) => {
  return c.text("Tanisya API Engine: OK");
});

// 7. START SERVER
serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`🚀 Server is running on http://localhost:${info.port}`);
    console.log(`🔗 Webhook endpoint: http://localhost:${info.port}/api/webhooks/xendit`);
  },
);