import { db } from "@tanisya/db";
import * as schema from "@tanisya/db/schema/auth";
import { env } from "@tanisya/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
  organization,
  admin,
  twoFactor,
  username,
  openAPI,
} from "better-auth/plugins";
import { apiKey } from "@better-auth/api-key";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    openAPI(),
    organization({
      // User yang membuat org otomatis jadi owner
      creatorRole: "owner",
      // Role yang tersedia di dalam org
      memberRoles: ["owner", "admin", "billing", "technical", "support", "member"],
    }),
    apiKey(),
    admin(),
    twoFactor(),
    username(),
    nextCookies(),
  ],
});
