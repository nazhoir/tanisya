"use client";

import { Button } from "@tanisya/ui/components/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@tanisya/ui/components/field";
import { Input } from "@tanisya/ui/components/input";
import { cn } from "@tanisya/ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import { ArrowRight, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

// ─── Validation ───────────────────────────────────────────────────────────────

const formSchema = z.object({
	otp: z
		.string()
		.length(6, "Kode OTP harus 6 digit")
		.regex(/^\d+$/, "Kode OTP hanya boleh berisi angka"),
});

// Resend cooldown in seconds
const RESEND_COOLDOWN = 60;

// ─── Component ────────────────────────────────────────────────────────────────

export default function VerifyOtpPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const email = searchParams.get("email") ?? "";

	// Resend cooldown timer
	const [resendTimer, setResendTimer] = React.useState(RESEND_COOLDOWN);
	const [isResending, setIsResending] = React.useState(false);

	React.useEffect(() => {
		if (resendTimer <= 0) return;
		const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
		return () => clearTimeout(timer);
	}, [resendTimer]);

	// Individual OTP digit refs for auto-advance
	const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

	// ── Form ──────────────────────────────────────────────────────────────────
	const form = useForm({
		defaultValues: { otp: "" },
		validators: { onSubmit: formSchema },
		onSubmit: async ({ value }) => {
			await authClient.emailOtp.verifyEmail(
				{ email, otp: value.otp },
				{
					onSuccess: () => {
						toast.success("Email berhasil diverifikasi!");
						router.replace("/dashboard");
					},
					onError: (error) => {
						toast.error(
							error.error.message ||
								"Kode OTP tidak valid atau sudah kadaluarsa",
						);
					},
				},
			);
		},
	});

	// ── Resend OTP ────────────────────────────────────────────────────────────
	async function handleResend() {
		if (resendTimer > 0 || isResending) return;
		setIsResending(true);
		try {
			await authClient.emailOtp.sendVerificationOtp(
				{ email, type: "email-verification" },
				{
					onSuccess: () => {
						toast.success("Kode OTP baru telah dikirim");
						setResendTimer(RESEND_COOLDOWN);
					},
					onError: (error) => {
						toast.error(error.error.message || "Gagal mengirim ulang OTP");
					},
				},
			);
		} finally {
			setIsResending(false);
		}
	}

	// ── OTP input auto-advance & backspace ────────────────────────────────────
	function handleOtpDigitChange(
		index: number,
		value: string,
		currentOtp: string,
		onChange: (val: string) => void,
	) {
		const digit = value.replace(/\D/g, "").slice(-1); // keep only last digit
		const otpArray = currentOtp.split("").concat(Array(6).fill("")).slice(0, 6);
		otpArray[index] = digit;
		const newOtp = otpArray.join("").slice(0, 6);
		onChange(newOtp);

		// Auto-advance to next input
		if (digit && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
	}

	function handleOtpKeyDown(
		index: number,
		e: React.KeyboardEvent<HTMLInputElement>,
		currentOtp: string,
		onChange: (val: string) => void,
	) {
		if (e.key === "Backspace") {
			const otpArray = currentOtp
				.split("")
				.concat(Array(6).fill(""))
				.slice(0, 6);
			otpArray[index] = "";
			onChange(otpArray.join(""));
			if (index > 0) inputRefs.current[index - 1]?.focus();
		}
	}

	function handleOtpPaste(
		e: React.ClipboardEvent,
		onChange: (val: string) => void,
	) {
		e.preventDefault();
		const pasted = e.clipboardData
			.getData("text")
			.replace(/\D/g, "")
			.slice(0, 6);
		onChange(pasted);
		// Focus last filled digit
		const focusIndex = Math.min(pasted.length, 5);
		inputRefs.current[focusIndex]?.focus();
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			{/* Background blobs */}
			<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute top-1/4 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />
				<div className="absolute right-0 bottom-0 h-48 w-48 rounded-full bg-blue-500/6 blur-[80px]" />
			</div>

			<div className="w-full max-w-md">
				{/* Card */}
				<div className="overflow-hidden rounded-2xl border border-border/60 bg-background shadow-black/5 shadow-xl">
					{/* Top gradient bar */}
					<div className="h-1 bg-linear-to-r from-primary via-blue-500 to-primary/60" />

					<div className="p-6 sm:p-8">
						{/* Header */}
						<div className="mb-6 flex flex-col items-center text-center">
							<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
								<ShieldCheck className="h-7 w-7" />
							</div>
							<h1 className="mb-1 font-extrabold text-2xl tracking-tight">
								Verifikasi Email
							</h1>
							<p className="text-muted-foreground text-sm leading-relaxed">
								Masukkan kode 6 digit yang dikirim ke
							</p>
							<div className="mt-1.5 flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-3 py-1">
								<Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
								<span className="max-w-[220px] truncate font-semibold text-xs">
									{email}
								</span>
							</div>
						</div>

						{/* Form */}
						<form
							id="verify-otp-form"
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
						>
							<FieldGroup>
								{/* ── OTP digit inputs ─────────────────────────────────────── */}
								<form.Field
									name="otp"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										const otpDigits = field.state.value
											.split("")
											.concat(Array(6).fill(""))
											.slice(0, 6);

										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel className="sr-only">Kode OTP</FieldLabel>
												<div
													className="flex justify-center gap-2 sm:gap-3"
													onPaste={(e) => handleOtpPaste(e, field.handleChange)}
												>
													{otpDigits.map((digit, index) => (
														<input
															key={index}
															ref={(el) => {
																inputRefs.current[index] = el;
															}}
															type="text"
															inputMode="numeric"
															maxLength={1}
															value={digit}
															aria-label={`Digit OTP ke-${index + 1}`}
															aria-invalid={isInvalid}
															onChange={(e) =>
																handleOtpDigitChange(
																	index,
																	e.target.value,
																	field.state.value,
																	field.handleChange,
																)
															}
															onKeyDown={(e) =>
																handleOtpKeyDown(
																	index,
																	e,
																	field.state.value,
																	field.handleChange,
																)
															}
															onFocus={(e) => e.target.select()}
															className={cn(
																"h-12 w-10 rounded-xl border bg-background text-center font-extrabold text-xl tracking-widest outline-none transition-all sm:h-14 sm:w-12 sm:text-2xl",
																"focus:border-primary focus:ring-2 focus:ring-primary/20",
																digit
																	? "border-primary/60"
																	: "border-border/60",
																isInvalid &&
																	"border-destructive focus:ring-destructive/20",
															)}
														/>
													))}
												</div>
												{isInvalid && (
													<div className="mt-1 text-center">
														<FieldError errors={field.state.meta.errors} />
													</div>
												)}
											</Field>
										);
									}}
								/>

								{/* ── Submit ─────────────────────────────────────────────── */}
								<form.Subscribe
									selector={(state) => [state.canSubmit, state.isSubmitting]}
									children={([canSubmit, isSubmitting]) => (
										<Button
											type="submit"
											form="verify-otp-form"
											size="lg"
											className="h-11 w-full gap-2 font-bold shadow-md shadow-primary/15"
											disabled={!canSubmit || isSubmitting}
										>
											{isSubmitting ? (
												<>
													<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
													Memverifikasi...
												</>
											) : (
												<>
													Verifikasi Email <ArrowRight className="h-4 w-4" />
												</>
											)}
										</Button>
									)}
								/>

								{/* ── Resend ─────────────────────────────────────────────── */}
								<div className="flex flex-col items-center gap-2 pt-1 text-center">
									<p className="text-muted-foreground text-sm">
										Tidak menerima kode?
									</p>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className={cn(
											"h-9 gap-1.5 font-semibold",
											resendTimer > 0 && "cursor-not-allowed opacity-50",
										)}
										disabled={resendTimer > 0 || isResending}
										onClick={handleResend}
									>
										{isResending ? (
											<>
												<span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
												Mengirim...
											</>
										) : resendTimer > 0 ? (
											<>
												<RefreshCw className="h-3.5 w-3.5" />
												Kirim ulang dalam {resendTimer}d
											</>
										) : (
											<>
												<RefreshCw className="h-3.5 w-3.5" />
												Kirim ulang kode
											</>
										)}
									</Button>
								</div>
							</FieldGroup>
						</form>
					</div>
				</div>

				{/* Footer note */}
				<p className="mt-4 px-4 text-center text-muted-foreground text-xs">
					Kode OTP berlaku selama{" "}
					<span className="font-semibold text-foreground">10 menit</span>.
					Pastikan kamu memasukkan kode yang paling baru jika sudah kirim ulang.
				</p>
			</div>
		</div>
	);
}
