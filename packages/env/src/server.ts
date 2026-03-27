import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		CORS_ORIGIN: z.url(),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		RDASH_API_URL: z.url(),
		RDASH_RESELLER_ID: z.string().min(1),
		RDASH_API_KEY: z.string().min(1),
		STORAGE_ACCOUNT_ID: z.string().min(1),
		STORAGE_ACCESS_KEY_ID: z.string().min(1),
		STORAGE_SECRET_ACCESS_KEY: z.string().min(1),
		STORAGE_PUBLIC_URL: z.url().min(1),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
