import { env } from "@tanisya/env/server";
import {
	APP_NAME,
	EMAIL_BUTTON_STYLE,
	EMAIL_OTP_EXPIRES_IN,
	EmailOtpType,
	EMAIL_VERIFICATION_EXPIRES_IN,
	formatDurationSeconds,
	MAGIC_LINK_EXPIRES_IN,
	RESET_PASSWORD_EXPIRES_IN,
	TWO_FACTOR_EMAIL_OTP_PERIOD,
} from "./constant";

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function renderActionButton(label: string, href: string): string {
	const safeLabel = escapeHtml(label);
	const safeHref = escapeHtml(href);

	return `
		<a href="${safeHref}" style="${EMAIL_BUTTON_STYLE}">
			${safeLabel}
		</a>
	`;
}

function renderFallbackLink(url: string, expiresText: string): string {
	const safeUrl = escapeHtml(url);
	const safeExpiresText = escapeHtml(expiresText);

	return `
		<p style="font-size:12px;margin-top:12px;color:#6b7280">
			Link ini berlaku selama <strong>${safeExpiresText}</strong>. Jika tombol tidak bisa diklik,
			salin dan tempel URL berikut ke browser:<br />
			<a href="${safeUrl}" style="color:#6b7280">${safeUrl}</a>
		</p>
	`;
}

function renderOtpBlock(otp: string): string {
	const safeOtp = escapeHtml(otp);

	return `
		<div style="margin:20px 0;padding:16px;background:#f3f4f6;border-radius:8px;text-align:center">
			<h1 style="letter-spacing:12px;font-size:32px;margin:0;font-family:monospace">${safeOtp}</h1>
		</div>
	`;
}

function emailTemplate({
	title,
	content,
}: {
	title: string;
	content: string;
}): string {
	return `
		<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;color:#111827">
			<h2 style="margin-bottom:16px">${escapeHtml(title)}</h2>
			${content}
			<hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb" />
			<p style="font-size:12px;color:#6b7280">
				Jika kamu tidak merasa melakukan tindakan ini, abaikan email ini.
				Email ini dikirim secara otomatis oleh <strong>${escapeHtml(APP_NAME)}</strong>.
			</p>
		</div>
	`;
}

export async function sendEmail({
	to,
	subject,
	html,
}: {
	to: string;
	subject: string;
	html: string;
}): Promise<void> {
	if (env.NODE_ENV === "development") {
		console.log(`[EMAIL DEV] → ${to} | ${subject}\n${html}`);
		return;
	}

	throw new Error(
		"[auth.sendEmail] Provider email production belum dikonfigurasi.",
	);
}

export function getEmailOtpCopy(type: EmailOtpType) {
	switch (type) {
		case "sign-in":
			return {
				subject: `Kode Login ${APP_NAME}`,
				title: "Kode Login",
				description: "Masukkan kode OTP berikut untuk melanjutkan login.",
			};
		case "email-verification":
			return {
				subject: `Kode Verifikasi Email ${APP_NAME}`,
				title: "Verifikasi Email",
				description: "Masukkan kode OTP berikut untuk memverifikasi email kamu.",
			};
		case "forget-password":
			return {
				subject: `Kode Reset Kata Sandi ${APP_NAME}`,
				title: "Reset Kata Sandi",
				description: "Masukkan kode OTP berikut untuk mereset kata sandi akunmu.",
			};
		case "change-email":
			return {
				subject: `Kode Perubahan Email ${APP_NAME}`,
				title: "Perubahan Email",
				description: "Masukkan kode OTP berikut untuk menyelesaikan perubahan email.",
			};
	}
}

export function renderResetPasswordEmail(userName: string, url: string): string {
	return emailTemplate({
		title: "Reset Kata Sandi",
		content: `
			<p>Halo <strong>${escapeHtml(userName)}</strong>,</p>
			<p>Kami menerima permintaan untuk mereset kata sandi akunmu.</p>
			<p>Klik tombol berikut untuk melanjutkan:</p>
			${renderActionButton("Reset Kata Sandi", url)}
			${renderFallbackLink(url, formatDurationSeconds(RESET_PASSWORD_EXPIRES_IN))}
		`,
	});
}

export function renderVerificationEmail(userName: string, url: string): string {
	return emailTemplate({
		title: "Verifikasi Email Kamu",
		content: `
			<p>Halo <strong>${escapeHtml(userName)}</strong>,</p>
			<p>Terima kasih telah mendaftar di ${escapeHtml(APP_NAME)}. Klik tombol berikut untuk verifikasi email:</p>
			${renderActionButton("Verifikasi Email", url)}
			${renderFallbackLink(url, formatDurationSeconds(EMAIL_VERIFICATION_EXPIRES_IN))}
		`,
	});
}

export function renderMagicLinkEmail(url: string): string {
	return emailTemplate({
		title: "Login Tanpa Password",
		content: `
			<p>Halo,</p>
			<p>Klik tombol berikut untuk masuk ke ${escapeHtml(APP_NAME)}. Link ini hanya dapat digunakan sekali.</p>
			${renderActionButton(`Masuk ke ${APP_NAME}`, url)}
			${renderFallbackLink(url, formatDurationSeconds(MAGIC_LINK_EXPIRES_IN))}
		`,
	});
}

export function renderEmailOtpEmail(type: EmailOtpType, otp: string): string {
	const copy = getEmailOtpCopy(type);

	return emailTemplate({
		title: copy.title,
		content: `
			<p>${escapeHtml(copy.description)}</p>
			${renderOtpBlock(otp)}
			<p style="font-size:12px;color:#6b7280">
				Kode berlaku selama <strong>${escapeHtml(formatDurationSeconds(EMAIL_OTP_EXPIRES_IN))}</strong>. Jangan bagikan kode ini kepada siapa pun.
			</p>
		`,
	});
}

export function renderTwoFactorOtpEmail(userName: string, otp: string): string {
	return emailTemplate({
		title: "Verifikasi Dua Langkah",
		content: `
			<p>Halo <strong>${escapeHtml(userName)}</strong>,</p>
			<p>Masukkan kode OTP berikut untuk menyelesaikan login:</p>
			${renderOtpBlock(otp)}
			<p style="font-size:12px;color:#6b7280">
				Kode berlaku selama <strong>${escapeHtml(formatDurationSeconds(TWO_FACTOR_EMAIL_OTP_PERIOD))}</strong>. Jangan bagikan kode ini kepada siapa pun,
				termasuk tim ${escapeHtml(APP_NAME)}.
			</p>
		`,
	});
}
