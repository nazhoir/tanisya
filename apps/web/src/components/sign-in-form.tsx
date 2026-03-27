"use client";

import { Button } from "@tanisya/ui/components/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@tanisya/ui/components/field";
import { Input } from "@tanisya/ui/components/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@tanisya/ui/components/input-group";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@tanisya/ui/components/input-otp";
import { cn } from "@tanisya/ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import { REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import {
	ArrowRight,
	Eye,
	EyeOff,
	KeyRound,
	Lock,
	Mail,
	ShieldCheck,
	Sparkles,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";
import { InputPassword } from "./input-password";
import Loader from "./loader";

// ─── Validation schemas ───────────────────────────────────────────────────────

const signInSchema = z.object({
	identifier: z.string().min(1, "Email/username tidak boleh kosong"),
	password: z.string().min(8, "Password minimal 8 karakter"),
});

const otpSignInSchema = z.object({
	email: z.string().email("Alamat email tidak valid"),
});

const magicLinkSchema = z.object({
	email: z.string().email("Alamat email tidak valid"),
});

const verifyOtpSchema = z.object({
	code: z
		.string()
		.length(6, "Kode harus 6 digit")
		.regex(/^\d+$/, "Kode hanya boleh angka"),
});

const totpSchema = z.object({
	code: z
		.string()
		.length(6, "Kode harus 6 digit")
		.regex(/^\d+$/, "Kode hanya boleh angka"),
});

// ─── Static data ──────────────────────────────────────────────────────────────

const HERO_PERKS = [
	{ icon: ShieldCheck, text: "SSL & keamanan enterprise gratis" },
	{ icon: Zap, text: "Deploy dalam hitungan menit" },
	{ icon: Users, text: "Support manusia 24/7 via WhatsApp" },
] as const;

const SOCIAL_PROVIDERS = [
	{
		id: "apple",
		label: "Apple",
		path: "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701",
	},
	{
		id: "google",
		label: "Google",
		path: "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z",
	},
	{
		id: "meta",
		label: "Meta",
		path: "M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z",
	},
] as const;

// ─── Login methods ────────────────────────────────────────────────────────────

type LoginMethod = "credentials" | "otp" | "magic-link";
type TwoFactorStep = "totp" | "otp-2fa" | "backup";
type Step = LoginMethod | "verify-otp" | TwoFactorStep;

// ─── Component ────────────────────────────────────────────────────────────────

export default function SignInForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter();
	const { isPending } = authClient.useSession();

	// ── Step & method state ───────────────────────────────────────────────────
	const [step, setStep] = useState<Step>("credentials");
	const [loginMethod, setLoginMethod] = useState<LoginMethod>("credentials");
	const [isSendingOTP, setIsSendingOTP] = useState(false);
	const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
	const [pendingEmail, setPendingEmail] = useState("");

	// ─────────────────────────────────────────────────────────────────────────
	// FORM 1: Credentials (Email/Username + Password)
	// ─────────────────────────────────────────────────────────────────────────
	const credentialsForm = useForm({
		defaultValues: { identifier: "", password: "" },
		validators: { onSubmit: signInSchema },
		onSubmit: async ({ value }) => {
			// Deteksi apakah identifier adalah email atau username
			const isEmail = value.identifier.includes("@");

			const result = isEmail
				? await authClient.signIn.email({
						email: value.identifier,
						password: value.password,
					})
				: await authClient.signIn.username({
						username: value.identifier,
						password: value.password,
					});

			if (result.error) {
				toast.error(result.error.message || result.error.statusText);
				return;
			}

			// Jika server mengembalikan twoFactorRedirect: true
			if ((result.data as { twoFactorRedirect?: boolean })?.twoFactorRedirect) {
				setStep("totp");
				return;
			}

			// Login berhasil
			toast.success("Berhasil masuk");
			router.push("/dashboard");
		},
	});

	// ─────────────────────────────────────────────────────────────────────────
	// FORM 2: OTP Sign-In (kirim OTP ke email)
	// ─────────────────────────────────────────────────────────────────────────
	const otpSignInForm = useForm({
		defaultValues: { email: "" },
		validators: { onSubmit: otpSignInSchema },
		onSubmit: async ({ value }) => {
			setIsSendingOTP(true);
			setPendingEmail(value.email);

			const result = await authClient.emailOtp.sendVerificationOtp({
				email: value.email,
				type: "sign-in",
			});

			setIsSendingOTP(false);

			if (result.error) {
				toast.error(result.error.message || "Gagal mengirim kode OTP");
				return;
			}

			toast.success("Kode OTP telah dikirim ke email kamu");
			setStep("verify-otp");
		},
	});

	// ─────────────────────────────────────────────────────────────────────────
	// FORM 3: Verify OTP (verifikasi kode OTP untuk sign-in)
	// ─────────────────────────────────────────────────────────────────────────
	const verifyOtpForm = useForm({
		defaultValues: { code: "" },
		validators: { onSubmit: verifyOtpSchema },
		onSubmit: async ({ value }) => {
			const result = await authClient.signIn.emailOtp({
				email: pendingEmail,
				otp: value.code,
			});

			if (result.error) {
				toast.error(result.error.message || "Kode tidak valid");
				return;
			}

			toast.success("Berhasil masuk");
			router.push("/dashboard");
		},
	});

	// ─────────────────────────────────────────────────────────────────────────
	// FORM 4: Magic Link
	// ─────────────────────────────────────────────────────────────────────────
	const magicLinkForm = useForm({
		defaultValues: { email: "" },
		validators: { onSubmit: magicLinkSchema },
		onSubmit: async ({ value }) => {
			setIsSendingMagicLink(true);

			const result = await authClient.signIn.magicLink({
				email: value.email,
			});

			setIsSendingMagicLink(false);

			if (result.error) {
				toast.error(result.error.message || "Gagal mengirim magic link");
				return;
			}

			toast.success("Magic link telah dikirim ke email kamu");
		},
	});

	// ─────────────────────────────────────────────────────────────────────────
	// FORM 5: Verifikasi TOTP (2FA dengan app autentikator)
	// ─────────────────────────────────────────────────────────────────────────
	const totpForm = useForm({
		defaultValues: { code: "" },
		validators: { onSubmit: totpSchema },
		onSubmit: async ({ value }) => {
			const result = await authClient.twoFactor.verifyTotp({
				code: value.code,
				trustDevice: false,
			});

			if (result.error) {
				toast.error(result.error.message || "Kode tidak valid");
				return;
			}

			toast.success("Berhasil masuk");
			router.push("/dashboard");
		},
	});

	// ─────────────────────────────────────────────────────────────────────────
	// FORM 6: Verifikasi OTP 2FA via email
	// ─────────────────────────────────────────────────────────────────────────
	const otp2faForm = useForm({
		defaultValues: { code: "" },
		validators: { onSubmit: verifyOtpSchema },
		onSubmit: async ({ value }) => {
			const result = await authClient.twoFactor.verifyOtp({
				code: value.code,
			});

			if (result.error) {
				toast.error(result.error.message || "Kode tidak valid");
				return;
			}

			toast.success("Berhasil masuk");
			router.push("/dashboard");
		},
	});

	// ─────────────────────────────────────────────────────────────────────────
	// FORM 7: Verifikasi backup code
	// ─────────────────────────────────────────────────────────────────────────
	const backupForm = useForm({
		defaultValues: { code: "" },
		validators: {
			onSubmit: z.object({
				code: z.string().min(1, "Kode cadangan tidak boleh kosong"),
			}),
		},
		onSubmit: async ({ value }) => {
			const result = await authClient.twoFactor.verifyBackupCode({
				code: value.code,
			});

			if (result.error) {
				toast.error(result.error.message || "Kode cadangan tidak valid");
				return;
			}

			toast.success("Berhasil masuk");
			router.push("/dashboard");
		},
	});

	// ── Helper functions ──────────────────────────────────────────────────────
	const handleSend2faOTP = async () => {
		setIsSendingOTP(true);
		const result = await authClient.twoFactor.sendOtp();
		if (result.error) {
			toast.error(result.error.message || "Gagal mengirim kode OTP");
		} else {
			toast.success("Kode OTP telah dikirim ke email kamu");
		}
		setIsSendingOTP(false);
	};

	const switchTo2faOTP = async () => {
		setStep("otp-2fa");
		await handleSend2faOTP();
	};

	const handleResendOTP = async () => {
		if (!pendingEmail) return;
		setIsSendingOTP(true);

		const result = await authClient.signIn.emailOtp({
			email: pendingEmail,
		});

		setIsSendingOTP(false);

		if (result.error) {
			toast.error(result.error.message || "Gagal mengirim kode OTP");
			return;
		}

		toast.success("Kode OTP telah dikirim ulang");
	};

	if (isPending) return <Loader />;

	return (
		<div className={cn("flex flex-col gap-4", className)} {...props}>
			{/* ── Main card ─────────────────────────────────────────────────────── */}
			<div className="overflow-hidden rounded-2xl border border-border/60 bg-background shadow-black/5 shadow-xl md:grid md:grid-cols-2">
				{/* ── Left: hero panel ──────────────────────────────────────────── */}
				<div className="relative hidden overflow-hidden bg-linear-to-br from-primary via-primary/90 to-blue-600 p-8 text-primary-foreground md:flex md:flex-col md:justify-between">
					<div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
					<div className="pointer-events-none absolute -bottom-8 left-1/3 h-32 w-32 rounded-full bg-white/8 blur-2xl" />
					<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />

					<div className="relative">
						<p className="font-extrabold text-xl tracking-tight">Tanisya</p>
						<p className="font-semibold text-[11px] text-primary-foreground/60 uppercase tracking-[0.15em]">
							Solusi digital serba ada
						</p>
					</div>

					<div className="relative my-auto py-8">
						<h2 className="mb-3 font-extrabold text-2xl leading-tight tracking-tight">
							Semua yang dibutuhkan bisnis digitalmu ada di sini
						</h2>
						<p className="text-primary-foreground/75 text-sm leading-relaxed">
							Hosting, domain, SSL, template, hingga 50+ aplikasi siap deploy —
							dalam satu platform yang aman dan terpercaya.
						</p>
					</div>

					<div className="relative flex flex-col gap-2.5">
						{HERO_PERKS.map(({ icon: Icon, text }) => (
							<div key={text} className="flex items-center gap-2.5 text-sm">
								<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/15">
									<Icon className="h-3.5 w-3.5" />
								</span>
								<span className="text-primary-foreground/85">{text}</span>
							</div>
						))}
					</div>
				</div>

				{/* ── Right: form panel ─────────────────────────────────────────── */}
				<div className="flex flex-col justify-center p-6 md:p-8">
					{/* ══════════════════════════════════════════════════════════
					    STEP: credentials — email/username + password
					    ══════════════════════════════════════════════════════════ */}
					{step === "credentials" && (
						<form
							id="credentials-form"
							onSubmit={(e) => {
								e.preventDefault();
								credentialsForm.handleSubmit();
							}}
						>
							<FieldGroup>
								<div className="mb-2 flex flex-col gap-1">
									<h1 className="font-extrabold text-2xl tracking-tight">
										Selamat Datang Kembali
									</h1>
									<p className="text-muted-foreground text-sm">
										Masuk ke akun Anda untuk melanjutkan
									</p>
								</div>

								{/* Email/Username */}
								<credentialsForm.Field
									name="identifier"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>
													Email atau Username
												</FieldLabel>

												<InputGroup>
													<InputGroupInput
														id={field.name}
														name={field.name}
														type="text"
														placeholder="nama@contoh.com atau username"
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														aria-invalid={isInvalid}
														autoComplete="username"
													/>
													<InputGroupAddon>
														<Mail />
													</InputGroupAddon>
												</InputGroup>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								{/* Password */}
								<credentialsForm.Field
									name="password"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<div className="flex items-center justify-between">
													<FieldLabel htmlFor={field.name}>Password</FieldLabel>
													<Link
														href="/auth/forgot-password"
														className="font-semibold text-primary text-xs underline-offset-2 hover:underline"
													>
														Lupa password?
													</Link>
												</div>
												<InputPassword
													id={field.name}
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={field.handleChange}
													aria-invalid={isInvalid}
													icon={Lock}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								{/* Submit */}
								<credentialsForm.Subscribe
									selector={(s) => [s.canSubmit, s.isSubmitting] as const}
									children={([canSubmit, isSubmitting]) => (
										<Button
											type="submit"
											size="lg"
											className="h-11 w-full gap-2 font-bold shadow-md shadow-primary/15"
											disabled={!canSubmit || isSubmitting}
										>
											{isSubmitting ? (
												<>
													<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
													Memproses...
												</>
											) : (
												<>
													Masuk <ArrowRight className="h-4 w-4" />
												</>
											)}
										</Button>
									)}
								/>

								{/* Alternative login methods */}
								<div className="flex flex-col gap-2">
									<Button
										type="button"
										variant="outline"
										className="h-10 w-full gap-2"
										onClick={() => setStep("otp")}
									>
										<Sparkles className="h-4 w-4" />
										Masuk dengan Kode OTP
									</Button>
									<Button
										type="button"
										variant="outline"
										className="h-10 w-full gap-2"
										onClick={() => setStep("magic-link")}
									>
										<Mail className="h-4 w-4" />
										Kirim Magic Link
									</Button>
								</div>

								{/* Social divider */}
								<FieldSeparator className="*:data-[slot=field-separator-content]:bg-background">
									<span className="text-muted-foreground text-xs">
										Atau lanjutkan dengan
									</span>
								</FieldSeparator>

								{/* Social buttons */}
								<Field
									orientation="horizontal"
									className="grid grid-cols-3 gap-3"
								>
									{SOCIAL_PROVIDERS.map(({ id, label, path }) => (
										<Button
											key={id}
											type="button"
											variant="outline"
											className="h-10 w-full"
											aria-label={`Masuk dengan ${label}`}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												className="h-4 w-4"
												aria-hidden
											>
												<path d={path} fill="currentColor" />
											</svg>
										</Button>
									))}
								</Field>

								{/* Register link */}
								<p className="text-center text-muted-foreground text-sm">
									Belum punya akun?{" "}
									<Link
										href="/auth/register"
										className="font-semibold text-primary underline-offset-2 hover:underline"
									>
										Daftar sekarang
									</Link>
								</p>
							</FieldGroup>
						</form>
					)}

					{/* ══════════════════════════════════════════════════════════
					    STEP: otp — kirim kode OTP ke email untuk login
					    ══════════════════════════════════════════════════════════ */}
					{step === "otp" && (
						<form
							id="otp-signin-form"
							onSubmit={(e) => {
								e.preventDefault();
								otpSignInForm.handleSubmit();
							}}
						>
							<FieldGroup>
								<div className="mb-2 flex flex-col gap-1">
									<div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
										<Sparkles className="h-5 w-5 text-primary" />
									</div>
									<h1 className="font-extrabold text-2xl tracking-tight">
										Masuk dengan Kode OTP
									</h1>
									<p className="text-muted-foreground text-sm">
										Masukkan email kamu, kami akan kirim kode verifikasi untuk
										login tanpa password.
									</p>
								</div>

								{/* Email */}
								<otpSignInForm.Field
									name="email"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Email</FieldLabel>
												<InputGroup>
													<InputGroupInput
														id={field.name}
														name={field.name}
														type="email"
														placeholder="nama@contoh.com"
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														aria-invalid={isInvalid}
														autoComplete="email"
														autoFocus
													/>
													<InputGroupAddon>
														<Mail />
													</InputGroupAddon>
												</InputGroup>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								{/* Submit */}
								<otpSignInForm.Subscribe
									selector={(s) => [s.canSubmit, s.isSubmitting] as const}
									children={([canSubmit, isSubmitting]) => (
										<Button
											type="submit"
											size="lg"
											className="h-11 w-full gap-2 font-bold"
											disabled={!canSubmit || isSubmitting}
										>
											{isSubmitting ? (
												<>
													<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
													Mengirim...
												</>
											) : (
												<>
													Kirim Kode OTP <ArrowRight className="h-4 w-4" />
												</>
											)}
										</Button>
									)}
								/>

								{/* Back */}
								<button
									type="button"
									onClick={() => setStep("credentials")}
									className="text-center text-muted-foreground text-xs underline-offset-2 hover:text-foreground hover:underline"
								>
									← Kembali ke halaman masuk
								</button>
							</FieldGroup>
						</form>
					)}

					{/* ══════════════════════════════════════════════════════════
					    STEP: verify-otp — verifikasi kode OTP untuk login
					    ══════════════════════════════════════════════════════════ */}
					{step === "verify-otp" && (
						<form
							id="verify-otp-form"
							onSubmit={(e) => {
								e.preventDefault();
								verifyOtpForm.handleSubmit();
							}}
						>
							<FieldGroup>
								<div className="mb-2 flex flex-col gap-1">
									<div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
										<Mail className="h-5 w-5 text-primary" />
									</div>
									<h1 className="font-extrabold text-2xl tracking-tight">
										Cek Email Kamu
									</h1>
									<p className="text-muted-foreground text-sm">
										Kode verifikasi telah dikirim ke{" "}
										<span className="font-semibold">{pendingEmail}</span>.
										Berlaku selama 3 menit.
									</p>
								</div>

								{/* Kode OTP */}
								<verifyOtpForm.Field
									name="code"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Kode OTP</FieldLabel>
												<InputOTP
													id={field.name}
													name={field.name}
													type="text"
													inputMode="numeric"
													maxLength={6}
													placeholder="000000"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(value) => field.handleChange(value)}
													aria-invalid={isInvalid}
													autoComplete="one-time-code"
													autoFocus
													pattern={REGEXP_ONLY_DIGITS}
												>
													<InputOTPGroup className="mx-auto *:data-[slot=input-otp-slot]:h-11 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:text-3xl *:data-[slot=input-otp-slot]:sm:w-14 *:data-[slot=input-otp-slot]:md:w-16">
														<InputOTPSlot index={0} />
														<InputOTPSlot index={1} />
														<InputOTPSlot index={2} />
														<InputOTPSlot index={3} />
														<InputOTPSlot index={4} />
														<InputOTPSlot index={5} />
													</InputOTPGroup>
												</InputOTP>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								{/* Submit */}
								<verifyOtpForm.Subscribe
									selector={(s) => [s.canSubmit, s.isSubmitting] as const}
									children={([canSubmit, isSubmitting]) => (
										<Button
											type="submit"
											size="lg"
											className="h-11 w-full gap-2 font-bold"
											disabled={!canSubmit || isSubmitting}
										>
											{isSubmitting ? (
												<>
													<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
													Memverifikasi...
												</>
											) : (
												<>
													Verifikasi <ArrowRight className="h-4 w-4" />
												</>
											)}
										</Button>
									)}
								/>

								{/* Resend */}
								<div className="text-center text-muted-foreground text-xs">
									<span>Tidak menerima kode? </span>
									<button
										type="button"
										onClick={handleResendOTP}
										disabled={isSendingOTP}
										className="font-semibold text-primary underline-offset-2 hover:underline disabled:opacity-50"
									>
										{isSendingOTP ? "Mengirim..." : "Kirim ulang"}
									</button>
								</div>

								{/* Back */}
								<button
									type="button"
									onClick={() => {
										setStep("otp");
										setPendingEmail("");
									}}
									className="text-center text-muted-foreground text-xs underline-offset-2 hover:text-foreground hover:underline"
								>
									← Kembali
								</button>
							</FieldGroup>
						</form>
					)}

					{/* ══════════════════════════════════════════════════════════
					    STEP: magic-link — kirim magic link ke email
					    ══════════════════════════════════════════════════════════ */}
					{step === "magic-link" && (
						<form
							id="magic-link-form"
							onSubmit={(e) => {
								e.preventDefault();
								magicLinkForm.handleSubmit();
							}}
						>
							<FieldGroup>
								<div className="mb-2 flex flex-col gap-1">
									<div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
										<Sparkles className="h-5 w-5 text-primary" />
									</div>
									<h1 className="font-extrabold text-2xl tracking-tight">
										Masuk dengan Magic Link
									</h1>
									<p className="text-muted-foreground text-sm">
										Masukkan email kamu, kami akan kirim link untuk login
										langsung tanpa password.
									</p>
								</div>

								{/* Email */}
								<magicLinkForm.Field
									name="email"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Email</FieldLabel>
												<InputGroup>
													<InputGroupInput
														id={field.name}
														name={field.name}
														type="email"
														placeholder="nama@contoh.com"
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														aria-invalid={isInvalid}
														autoComplete="email"
														autoFocus
													/>
													<InputGroupAddon>
														<Mail />
													</InputGroupAddon>
												</InputGroup>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								{/* Submit */}
								<magicLinkForm.Subscribe
									selector={(s) => [s.canSubmit, s.isSubmitting] as const}
									children={([canSubmit, isSubmitting]) => (
										<Button
											type="submit"
											size="lg"
											className="h-11 w-full gap-2 font-bold"
											disabled={!canSubmit || isSubmitting}
										>
											{isSubmitting ? (
												<>
													<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
													Mengirim...
												</>
											) : (
												<>
													Kirim Magic Link <ArrowRight className="h-4 w-4" />
												</>
											)}
										</Button>
									)}
								/>

								{/* Info */}
								<p className="text-center text-muted-foreground text-xs">
									Link akan dikirim ke email dan berlaku selama 5 menit.
								</p>

								{/* Back */}
								<button
									type="button"
									onClick={() => setStep("credentials")}
									className="text-center text-muted-foreground text-xs underline-offset-2 hover:text-foreground hover:underline"
								>
									← Kembali ke halaman masuk
								</button>
							</FieldGroup>
						</form>
					)}

					{/* ══════════════════════════════════════════════════════════
					    STEP: totp — verifikasi 2FA dengan app autentikator
					    ══════════════════════════════════════════════════════════ */}
					{step === "totp" && (
						<form
							id="totp-form"
							onSubmit={(e) => {
								e.preventDefault();
								totpForm.handleSubmit();
							}}
						>
							<FieldGroup>
								<div className="mb-2 flex flex-col gap-1">
									<div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
										<ShieldCheck className="h-5 w-5 text-primary" />
									</div>
									<h1 className="font-extrabold text-2xl tracking-tight">
										Verifikasi Dua Faktor
									</h1>
									<p className="text-muted-foreground text-sm">
										Masukkan kode 6 digit dari aplikasi autentikator kamu.
									</p>
								</div>

								{/* Kode TOTP */}
								<totpForm.Field
									name="code"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>
													Kode Autentikator
												</FieldLabel>
												<InputOTP
													id={field.name}
													name={field.name}
													type="text"
													inputMode="numeric"
													maxLength={6}
													placeholder="000000"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(value) => field.handleChange(value)}
													aria-invalid={isInvalid}
													autoComplete="one-time-code"
													autoFocus
													pattern={REGEXP_ONLY_DIGITS}
												>
													<InputOTPGroup className="mx-auto *:data-[slot=input-otp-slot]:h-11 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:text-3xl *:data-[slot=input-otp-slot]:sm:w-14 *:data-[slot=input-otp-slot]:md:w-16">
														<InputOTPSlot index={0} />
														<InputOTPSlot index={1} />
														<InputOTPSlot index={2} />
														<InputOTPSlot index={3} />
														<InputOTPSlot index={4} />
														<InputOTPSlot index={5} />
													</InputOTPGroup>
												</InputOTP>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								{/* Submit */}
								<totpForm.Subscribe
									selector={(s) => [s.canSubmit, s.isSubmitting] as const}
									children={([canSubmit, isSubmitting]) => (
										<Button
											type="submit"
											size="lg"
											className="h-11 w-full gap-2 font-bold"
											disabled={!canSubmit || isSubmitting}
										>
											{isSubmitting ? (
												<>
													<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
													Memverifikasi...
												</>
											) : (
												<>
													Verifikasi <ArrowRight className="h-4 w-4" />
												</>
											)}
										</Button>
									)}
								/>

								{/* Opsi alternatif */}
								<div className="flex flex-col gap-1.5 text-center text-muted-foreground text-xs">
									<span>Tidak bisa akses aplikasi autentikator?</span>
									<div className="flex justify-center gap-3">
										<button
											type="button"
											onClick={switchTo2faOTP}
											disabled={isSendingOTP}
											className="font-semibold text-primary underline-offset-2 hover:underline disabled:opacity-50"
										>
											{isSendingOTP ? "Mengirim..." : "Kirim kode via email"}
										</button>
										<span>·</span>
										<button
											type="button"
											onClick={() => setStep("backup")}
											className="font-semibold text-primary underline-offset-2 hover:underline"
										>
											Gunakan kode cadangan
										</button>
									</div>
								</div>

								{/* Kembali */}
								<button
									type="button"
									onClick={() => setStep("credentials")}
									className="text-center text-muted-foreground text-xs underline-offset-2 hover:text-foreground hover:underline"
								>
									← Kembali ke halaman masuk
								</button>
							</FieldGroup>
						</form>
					)}

					{/* ══════════════════════════════════════════════════════════
					    STEP: otp-2fa — verifikasi 2FA dengan OTP via email
					    ══════════════════════════════════════════════════════════ */}
					{step === "otp-2fa" && (
						<form
							id="otp-2fa-form"
							onSubmit={(e) => {
								e.preventDefault();
								otp2faForm.handleSubmit();
							}}
						>
							<FieldGroup>
								<div className="mb-2 flex flex-col gap-1">
									<div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
										<Mail className="h-5 w-5 text-primary" />
									</div>
									<h1 className="font-extrabold text-2xl tracking-tight">
										Cek Email Kamu
									</h1>
									<p className="text-muted-foreground text-sm">
										Kode verifikasi telah dikirim ke email kamu. Berlaku selama
										3 menit.
									</p>
								</div>

								{/* Kode OTP */}
								<otp2faForm.Field
									name="code"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Kode OTP</FieldLabel>
												<InputOTP
													id={field.name}
													name={field.name}
													type="text"
													inputMode="numeric"
													maxLength={6}
													placeholder="000000"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(value) => field.handleChange(value)}
													aria-invalid={isInvalid}
													autoComplete="one-time-code"
													autoFocus
													pattern={REGEXP_ONLY_DIGITS}
												>
													<InputOTPGroup className="mx-auto *:data-[slot=input-otp-slot]:h-11 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:text-3xl *:data-[slot=input-otp-slot]:sm:w-14 *:data-[slot=input-otp-slot]:md:w-16">
														<InputOTPSlot index={0} />
														<InputOTPSlot index={1} />
														<InputOTPSlot index={2} />
														<InputOTPSlot index={3} />
														<InputOTPSlot index={4} />
														<InputOTPSlot index={5} />
													</InputOTPGroup>
												</InputOTP>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								{/* Submit */}
								<otp2faForm.Subscribe
									selector={(s) => [s.canSubmit, s.isSubmitting] as const}
									children={([canSubmit, isSubmitting]) => (
										<Button
											type="submit"
											size="lg"
											className="h-11 w-full gap-2 font-bold"
											disabled={!canSubmit || isSubmitting}
										>
											{isSubmitting ? (
												<>
													<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
													Memverifikasi...
												</>
											) : (
												<>
													Verifikasi <ArrowRight className="h-4 w-4" />
												</>
											)}
										</Button>
									)}
								/>

								{/* Kirim ulang + opsi lain */}
								<div className="flex flex-col gap-1.5 text-center text-muted-foreground text-xs">
									<span>Tidak menerima kode?</span>
									<div className="flex justify-center gap-3">
										<button
											type="button"
											onClick={handleSend2faOTP}
											disabled={isSendingOTP}
											className="font-semibold text-primary underline-offset-2 hover:underline disabled:opacity-50"
										>
											{isSendingOTP ? "Mengirim..." : "Kirim ulang"}
										</button>
										<span>·</span>
										<button
											type="button"
											onClick={() => setStep("totp")}
											className="font-semibold text-primary underline-offset-2 hover:underline"
										>
											Gunakan app autentikator
										</button>
									</div>
								</div>

								{/* Kembali */}
								<button
									type="button"
									onClick={() => setStep("credentials")}
									className="text-center text-muted-foreground text-xs underline-offset-2 hover:text-foreground hover:underline"
								>
									← Kembali ke halaman masuk
								</button>
							</FieldGroup>
						</form>
					)}

					{/* ══════════════════════════════════════════════════════════
					    STEP: backup — kode cadangan
					    ══════════════════════════════════════════════════════════ */}
					{step === "backup" && (
						<form
							id="backup-form"
							onSubmit={(e) => {
								e.preventDefault();
								backupForm.handleSubmit();
							}}
						>
							<FieldGroup>
								<div className="mb-2 flex flex-col gap-1">
									<div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
										<KeyRound className="h-5 w-5 text-amber-500" />
									</div>
									<h1 className="font-extrabold text-2xl tracking-tight">
										Kode Cadangan
									</h1>
									<p className="text-muted-foreground text-sm">
										Masukkan salah satu kode cadangan yang kamu simpan saat
										mengaktifkan 2FA. Setiap kode hanya bisa digunakan sekali.
									</p>
								</div>

								{/* Backup code */}
								<backupForm.Field
									name="code"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>
													Kode Cadangan
												</FieldLabel>
												<Input
													id={field.name}
													name={field.name}
													type="text"
													placeholder="xxxxxxxxxx"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													autoComplete="off"
													autoFocus
													className="text-center font-mono text-lg tracking-wider"
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								{/* Submit */}
								<backupForm.Subscribe
									selector={(s) => [s.canSubmit, s.isSubmitting] as const}
									children={([canSubmit, isSubmitting]) => (
										<Button
											type="submit"
											size="lg"
											className="h-11 w-full gap-2 font-bold"
											disabled={!canSubmit || isSubmitting}
										>
											{isSubmitting ? (
												<>
													<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
													Memverifikasi...
												</>
											) : (
												<>
													Verifikasi <ArrowRight className="h-4 w-4" />
												</>
											)}
										</Button>
									)}
								/>

								{/* Opsi lain */}
								<div className="flex justify-center gap-3 text-center text-muted-foreground text-xs">
									<button
										type="button"
										onClick={() => setStep("totp")}
										className="font-semibold text-primary underline-offset-2 hover:underline"
									>
										Gunakan app autentikator
									</button>
									<span>·</span>
									<button
										type="button"
										onClick={switchTo2faOTP}
										disabled={isSendingOTP}
										className="font-semibold text-primary underline-offset-2 hover:underline disabled:opacity-50"
									>
										Kirim kode via email
									</button>
								</div>

								{/* Kembali */}
								<button
									type="button"
									onClick={() => setStep("credentials")}
									className="text-center text-muted-foreground text-xs underline-offset-2 hover:text-foreground hover:underline"
								>
									← Kembali ke halaman masuk
								</button>
							</FieldGroup>
						</form>
					)}
				</div>
			</div>

			{/* ── Legal footer ──────────────────────────────────────────────────────── */}
			{(step === "credentials" || step === "otp" || step === "magic-link") && (
				<p className="px-4 text-center text-muted-foreground text-xs">
					Dengan melanjutkan, Anda menyetujui{" "}
					<a
						href="/terms"
						className="font-semibold underline-offset-2 hover:text-primary hover:underline"
					>
						Syarat Layanan
					</a>{" "}
					dan{" "}
					<a
						href="/privacy"
						className="font-semibold underline-offset-2 hover:text-primary hover:underline"
					>
						Kebijakan Privasi
					</a>{" "}
					kami.
				</p>
			)}
		</div>
	);
}
