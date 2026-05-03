import { createDb } from "@tanisya/db";
import * as schema from "@tanisya/db/schema/auth";
import { env } from "@tanisya/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP, organization, username } from "better-auth/plugins";
import { eq, desc } from "drizzle-orm";



// Fungsi helper untuk mengambil organisasi pertama user
async function getInitialOrganization(db: ReturnType<typeof createDb>, userId: string) {
  const res = await db
    .select({ id: schema.member.organizationId })
    .from(schema.member)
    .where(eq(schema.member.userId, userId))
    .orderBy(desc(schema.member.createdAt))
    .limit(1);

  return res[0] ?? null;
}

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
    user: {
      additionalFields: {
        onboardingStatus: {
          type: "string",
          required: true,
          defaultValue: "pending_organization",
        },
      },
    },
    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            // Memanggil fungsi yang sebelumnya missing
            const initialOrg = await getInitialOrganization(db, session.userId);
            
            return {
              data: {
                ...session,
                activeOrganizationId: initialOrg?.id,
              },
            };
          },
        },
      },
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
      organization({}),
      emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
          if (type === "sign-in") {
            // logic
          } else if (type === "email-verification") {
            console.log("email :", email);
            console.log("otp :", otp);
          } else {
            // logic
          }
        },
      }),
    ],
  });
}

export const auth = createAuth();