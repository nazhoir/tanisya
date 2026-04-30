import { createDb } from "@tanisya/db";
import * as schema from "@tanisya/db/schema/auth";
import { env } from "@tanisya/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP, organization, username } from "better-auth/plugins";

export function createAuth() {
  const db = createDb();

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",

      schema: schema,
    }),
    trustedOrigins: [env.CORS_ORIGIN],
    emailAndPassword: {
      enabled: true,
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      },
    },
    plugins: [
      username(),
      admin(),
      organization(),
      emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
          if (type === "sign-in") {
            // Send the OTP for sign in
          } else if (type === "email-verification") {

            console.log("email :", email)
            console.log("otp :", otp)
            // Send the OTP for email verification
          } else {
            // Send the OTP for password reset
          }
        },
      }),
    ],
  });
}

export const auth = createAuth();
