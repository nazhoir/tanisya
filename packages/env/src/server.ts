import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    XENDIT_WEBHOOK_VERIFICATION_TOKEN:z.string(),
    XENDIT_SECRET_KEY:z.string(),

RDASH_API_URL:z.string(),
RDASH_RESELLER_ID:z.string(),
RDASH_API_KEY:z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
