import { apiKey } from "@better-auth/api-key";
import { db } from "@tanisya/db";
import * as schema from "@tanisya/db/schema/index";
import { env } from "@tanisya/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
	admin,
	emailOTP,
	magicLink,
	organization,
	twoFactor,
	username,
} from "better-auth/plugins";
import {
	adminUserIds,
	APP_NAME,
	BACKUP_CODE_AMOUNT,
	BACKUP_CODE_LENGTH,
	EMAIL_OTP_EXPIRES_IN,
	EMAIL_OTP_LENGTH,
	EMAIL_VERIFICATION_EXPIRES_IN,
	IMPERSONATION_SESSION_DURATION,
	MAGIC_LINK_EXPIRES_IN,
	RESET_PASSWORD_EXPIRES_IN,
	SESSION_COOKIE_CACHE_MAX_AGE,
	SESSION_MAX_AGE,
	SESSION_UPDATE_AGE,
	TOTP_DIGITS,
	TOTP_PERIOD,
	trustedOrigins,
	TWO_FACTOR_EMAIL_OTP_PERIOD,
} from "./constant";
import {
	getEmailOtpCopy,
	renderEmailOtpEmail,
	renderMagicLinkEmail,
	renderResetPasswordEmail,
	renderTwoFactorOtpEmail,
	renderVerificationEmail,
	sendEmail,
} from "./email";

export const auth = betterAuth({
	appName: APP_NAME,
	baseURL: env.BETTER_AUTH_URL,
	secret: env.BETTER_AUTH_SECRET,
	trustedOrigins,

	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),

	advanced: {
		useSecureCookies: env.NODE_ENV === "production",
	},

	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
		maxPasswordLength: 128,
		requireEmailVerification: false,
		revokeSessionsOnPasswordReset: true,
		resetPasswordTokenExpiresIn: RESET_PASSWORD_EXPIRES_IN,
		sendResetPassword: async ({ user, token }) => {
			const url = `${env.BETTER_AUTH_URL}/auth/reset-password?token=${encodeURIComponent(token)}`;

			await sendEmail({
				to: user.email,
				subject: `Reset Kata Sandi ${APP_NAME}`,
				html: renderResetPasswordEmail(user.name, url),
			});
		},
	},

	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		expiresIn: EMAIL_VERIFICATION_EXPIRES_IN,
		sendVerificationEmail: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				subject: `Verifikasi Email ${APP_NAME}`,
				html: renderVerificationEmail(user.name, url),
			});
		},
	},

	session: {
		expiresIn: SESSION_MAX_AGE,
		updateAge: SESSION_UPDATE_AGE,
		cookieCache: {
			enabled: true,
			maxAge: SESSION_COOKIE_CACHE_MAX_AGE,
		},
	},

	account: {
		accountLinking: {
			enabled: true,
		},
	},

	plugins: [
		admin({
			impersonationSessionDuration: IMPERSONATION_SESSION_DURATION,
			adminUserIds,
		}),

		apiKey({
			startingCharactersConfig: {
				shouldStore: true,
				charactersLength: 8,
			},
		}),

		magicLink({
			expiresIn: MAGIC_LINK_EXPIRES_IN,
			sendMagicLink: async ({ email, url }) => {
				await sendEmail({
					to: email,
					subject: `Link Login ${APP_NAME}`,
					html: renderMagicLinkEmail(url),
				});
			},
		}),

		emailOTP({
			changeEmail: { enabled: false },
			otpLength: EMAIL_OTP_LENGTH,
			expiresIn: EMAIL_OTP_EXPIRES_IN,
			async sendVerificationOTP({ email, otp, type }) {
				await sendEmail({
					to: email,
					subject: getEmailOtpCopy(type).subject,
					html: renderEmailOtpEmail(type, otp),
				});
			},
		}),

		username({
			minUsernameLength: 3,
			maxUsernameLength: 30,
			usernameValidator: (value) => /^[a-zA-Z0-9_]+$/.test(value),
		}),

		organization({
			allowUserToCreateOrganization: async (currentUser) =>
				Boolean(currentUser.emailVerified),
		}),

		twoFactor({
			issuer: APP_NAME,
			totpOptions: {
				digits: TOTP_DIGITS,
				period: TOTP_PERIOD,
			},
			otpOptions: {
				digits: EMAIL_OTP_LENGTH,
				period: TWO_FACTOR_EMAIL_OTP_PERIOD,
				async sendOTP({ user, otp }) {
					await sendEmail({
						to: user.email,
						subject: `Kode OTP Verifikasi 2FA ${APP_NAME}`,
						html: renderTwoFactorOtpEmail(user.name, otp),
					});
				},
			},
			backupCodeOptions: {
				amount: BACKUP_CODE_AMOUNT,
				length: BACKUP_CODE_LENGTH,
			},
		}),

		nextCookies(),
	],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
