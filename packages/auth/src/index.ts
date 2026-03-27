import { apiKey } from "@better-auth/api-key";
import { db } from "@tanisya/db";
import * as schema from "@tanisya/db/schema/auth";
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

/* ─────────────────────────────────────────────────────────────── */
/*                          EMAIL LAYER                            */
/* ─────────────────────────────────────────────────────────────── */

async function sendEmail({
	to,
	subject,
	html,
}: {
	to: string;
	subject: string;
	html: string;
}) {
	if (env.NODE_ENV === "development") {
		console.log(`[EMAIL DEV] → ${to} | ${subject}\n${html}`);
		return;
	}

	// TODO: Integrasikan dengan provider email production (Resend, SES, dll)
	// Contoh Resend:
	// await resend.emails.send({
	//   from: "Tanisya <noreply@tanisya.com>",
	//   to,
	//   subject,
	//   html,
	// });

	throw new Error("[sendEmail] Production email provider belum dikonfigurasi.");
}

/**
 * Template email HTML dasar dengan branding Tanisya.
 */
function emailTemplate({ title, content }: { title: string; content: string }) {
	return `
		<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
			<h2 style="margin-bottom:16px">${title}</h2>
			${content}
			<hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb"/>
			<p style="font-size:12px;color:#6b7280">
				Jika kamu tidak merasa melakukan tindakan ini, abaikan email ini.
				Email ini dikirim secara otomatis oleh <strong>Tanisya</strong>.
			</p>
		</div>
	`;
}

/* ─────────────────────────────────────────────────────────────── */
/*                          AUTH CONFIG                            */
/* ─────────────────────────────────────────────────────────────── */

export const auth = betterAuth({
	appName: "Tanisya",

	/* ───────── DATABASE ───────── */
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),

	/* ───────── CORE ───────── */
	baseURL: env.BETTER_AUTH_URL,
	secret: env.BETTER_AUTH_SECRET,
	trustedOrigins: [env.CORS_ORIGIN],

	/* ───────── EMAIL & PASSWORD ───────── */
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
		maxPasswordLength: 128,
		requireEmailVerification: false,
		revokeSessionsOnPasswordReset: true,

		sendResetPassword: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				subject: "Reset Kata Sandi Tanisya",
				html: emailTemplate({
					title: "Reset Kata Sandi",
					content: `
						<p>Halo <strong>${user.name}</strong>,</p>
						<p>Kami menerima permintaan untuk mereset kata sandi akunmu.</p>
						<p>Klik tombol berikut untuk melanjutkan:</p>
						<a href="${url}"
							style="display:inline-block;padding:10px 20px;background:#111827;color:white;text-decoration:none;border-radius:6px;margin:12px 0">
							Reset Kata Sandi
						</a>
						<p style="font-size:12px;margin-top:12px;color:#6b7280">
							Link ini berlaku selama <strong>1 jam</strong>. Jika tidak bisa klik tombol di atas,
							salin dan tempel URL berikut ke browser:<br/>
							<a href="${url}" style="color:#6b7280">${url}</a>
						</p>
					`,
				}),
			});
		},
	},

	/* ───────── EMAIL VERIFICATION ───────── */
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		// Token berlaku 1 jam
		expiresIn: 60 * 60,

		sendVerificationEmail: async ({ user, url }) => {
			// `url` sudah berisi URL verifikasi lengkap yang dibangun oleh better-auth
			await sendEmail({
				to: user.email,
				subject: "Verifikasi Email Tanisya",
				html: emailTemplate({
					title: "Verifikasi Email Kamu",
					content: `
						<p>Halo <strong>${user.name}</strong>,</p>
						<p>Terima kasih telah mendaftar di Tanisya! Klik tombol berikut untuk verifikasi email:</p>
						<a href="${url}"
							style="display:inline-block;padding:10px 20px;background:#111827;color:white;text-decoration:none;border-radius:6px;margin:12px 0">
							Verifikasi Email
						</a>
						<p style="font-size:12px;margin-top:12px;color:#6b7280">
							Link ini berlaku selama <strong>1 jam</strong>. Jika tidak bisa klik tombol di atas,
							salin dan tempel URL berikut ke browser:<br/>
							<a href="${url}" style="color:#6b7280">${url}</a>
						</p>
					`,
				}),
			});
		},
	},

	/* ───────── SESSION ───────── */
	session: {
		// Sesi berlaku 30 hari
		expiresIn: 60 * 60 * 24 * 30,
		// Perpanjang sesi setiap 24 jam aktivitas
		updateAge: 60 * 60 * 24,
		cookieCache: {
			enabled: true,
			// Cache cookie di client selama 5 menit
			maxAge: 60 * 5,
		},
	},

	/* ───────── ACCOUNT ───────── */
	account: {
		accountLinking: {
			enabled: true,
		},
	},

	/* ───────── PLUGINS ───────── */
	plugins: [
		/* ───────── ADMIN ───────── */
		admin({
			// Sesi impersonation berlaku 1 jam
			impersonationSessionDuration: 60 * 60,
			adminUserIds: ["8jAUlCMVqovtS91llm8TtwCpHFvfsjgJ"],
		}),

		/* ───────── API KEY ───────── */
		apiKey({
			startingCharactersConfig: {
				shouldStore: true,
				charactersLength: 8,
			},
		}),

		/* ───────── MAGIC LINK ───────── */
		magicLink({
			// Link berlaku 5 menit
			expiresIn: 60 * 5,

			sendMagicLink: async ({ email, url }) => {
				await sendEmail({
					to: email,
					subject: "Link Login Tanisya",
					html: emailTemplate({
						title: "Login Tanpa Password",
						content: `
							<p>Halo,</p>
							<p>Klik tombol berikut untuk masuk ke Tanisya. Link ini hanya dapat digunakan sekali.</p>
							<a href="${url}"
								style="display:inline-block;padding:10px 20px;background:#111827;color:white;text-decoration:none;border-radius:6px;margin:12px 0">
								Masuk ke Tanisya
							</a>
							<p style="font-size:12px;margin-top:12px;color:#6b7280">
								Link ini berlaku selama <strong>5 menit</strong>. Jika tidak bisa klik tombol di atas,
								salin dan tempel URL berikut ke browser:<br/>
								<a href="${url}" style="color:#6b7280">${url}</a>
							</p>
						`,
					}),
				});
			},
		}),

		/* ───────── EMAIL OTP ───────── */
		emailOTP({
			// Nonaktifkan fitur ganti email via OTP (gunakan flow terpisah jika perlu)
			changeEmail: { enabled: false },

			// OTP berlaku 3 menit (180 detik)
			otpLength: 6,
			expiresIn: 60 * 3,

			async sendVerificationOTP({ email, otp, type }) {
				const subjects: Record<typeof type, string> = {
					"sign-in": "Kode Login Tanisya",
					"email-verification": "Kode Verifikasi Email",
					"forget-password": "Kode Reset Kata Sandi",
					"change-email": "",
				};

				const titles: Record<typeof type, string> = {
					"sign-in": "Kode Login",
					"email-verification": "Verifikasi Email",
					"forget-password": "Reset Kata Sandi",
					"change-email": "",
				};

				await sendEmail({
					to: email,
					subject: subjects[type] ?? "Kode Verifikasi",
					html: emailTemplate({
						title: titles[type] ?? "Kode Verifikasi",
						content: `
							<p>Masukkan kode OTP berikut:</p>
							<div style="margin:20px 0;padding:16px;background:#f3f4f6;border-radius:8px;text-align:center">
								<h1 style="letter-spacing:12px;font-size:32px;margin:0;font-family:monospace">${otp}</h1>
							</div>
							<p style="font-size:12px;color:#6b7280">
								Kode berlaku selama <strong>3 menit</strong>. Jangan bagikan kode ini kepada siapapun.
							</p>
						`,
					}),
				});
			},
		}),

		/* ───────── USERNAME ───────── */
		username({
			minUsernameLength: 3,
			maxUsernameLength: 30,
			// Hanya huruf, angka, dan underscore
			usernameValidator: (name) => /^[a-zA-Z0-9_]+$/.test(name),
		}),

		/* ───────── ORGANIZATION ───────── */
		organization({
			// Hanya user dengan email terverifikasi yang bisa membuat organisasi
			allowUserToCreateOrganization: async (user) => user.emailVerified,
		}),

		/* ───────── TWO FACTOR ───────── */
		twoFactor({
			issuer: "Tanisya",

			totpOptions: {
				digits: 6,
				// Periode TOTP 30 detik (standar RFC 6238)
				period: 30,
			},

			otpOptions: {
				digits: 6,
				// OTP via email berlaku 3 menit (180 detik)
				period: 60 * 3,

				async sendOTP({ user, otp }) {
					await sendEmail({
						to: user.email,
						subject: "Kode OTP Verifikasi 2FA",
						html: emailTemplate({
							title: "Verifikasi Dua Langkah",
							content: `
								<p>Halo <strong>${user.name}</strong>,</p>
								<p>Masukkan kode OTP berikut untuk menyelesaikan login:</p>
								<div style="margin:20px 0;padding:16px;background:#f3f4f6;border-radius:8px;text-align:center">
									<h1 style="letter-spacing:12px;font-size:32px;margin:0;font-family:monospace">${otp}</h1>
								</div>
								<p style="font-size:12px;color:#6b7280">
									Kode berlaku selama <strong>3 menit</strong>. Jangan bagikan kode ini kepada siapapun,
									termasuk tim Tanisya.
								</p>
							`,
						}),
					});
				},
			},

			backupCodeOptions: {
				amount: 10,
				length: 10,
			},
		}),

		/* ───────── NEXT.JS COOKIES ───────── */
		nextCookies(),
	],
});

/* ─────────────────────────────────────────────────────────────── */
/*                         TYPE EXPORTS                            */
/* ─────────────────────────────────────────────────────────────── */

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
