import { env } from "@tanisya/env/server";

export type EmailOtpType =
	| "sign-in"
	| "email-verification"
	| "forget-password"
	| "change-email";

export const APP_NAME = "Tanisya";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
export const SESSION_UPDATE_AGE = 60 * 60 * 24;
export const SESSION_COOKIE_CACHE_MAX_AGE = 60 * 5;

export const RESET_PASSWORD_EXPIRES_IN = 60 * 60;
export const EMAIL_VERIFICATION_EXPIRES_IN = 60 * 60;
export const MAGIC_LINK_EXPIRES_IN = 60 * 5;
export const EMAIL_OTP_EXPIRES_IN = 60 * 3;
export const EMAIL_OTP_LENGTH = 6;

export const TOTP_DIGITS = 6;
export const TOTP_PERIOD = 30;
export const TWO_FACTOR_EMAIL_OTP_PERIOD = 60 * 3;

export const BACKUP_CODE_AMOUNT = 10;
export const BACKUP_CODE_LENGTH = 10;
export const IMPERSONATION_SESSION_DURATION = 60 * 60;

export const EMAIL_BUTTON_STYLE = [
	"display:inline-block",
	"padding:10px 20px",
	"background:#111827",
	"color:#ffffff",
	"text-decoration:none",
	"border-radius:6px",
	"margin:12px 0",
].join(";");


const ENV_RECORD = env as unknown as Record<string, string | undefined>;

function getOptionalEnv(key: string): string | undefined {
	const value = ENV_RECORD[key];
	if (typeof value !== "string") return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

function toOrigin(value: string): string | null {
	try {
		return new URL(value).origin;
	} catch {
		return null;
	}
}

function buildTrustedOrigins(): string[] {
	const candidates = [
		env.CORS_ORIGIN,
		env.BETTER_AUTH_URL,
		getOptionalEnv("NEXT_PUBLIC_APP_URL"),
	]
		.filter((value): value is string => Boolean(value))
		.map((value) => toOrigin(value) ?? value.trim())
		.filter(Boolean);

	return [...new Set(candidates)];
}

function parseAdminUserIds(): string[] {
	return (getOptionalEnv("BETTER_AUTH_ADMIN_USER_IDS") ?? "")
		.split(",")
		.map((value) => value.trim())
		.filter(Boolean);
}

export function formatDurationSeconds(seconds: number): string {
	if (seconds % 3600 === 0) {
		const hours = Math.floor(seconds / 3600);
		return hours === 1 ? "1 jam" : `${hours} jam`;
	}

	if (seconds % 60 === 0) {
		const minutes = Math.floor(seconds / 60);
		return minutes === 1 ? "1 menit" : `${minutes} menit`;
	}

	return `${seconds} detik`;
}

export const trustedOrigins = buildTrustedOrigins();
export const adminUserIds = parseAdminUserIds();
