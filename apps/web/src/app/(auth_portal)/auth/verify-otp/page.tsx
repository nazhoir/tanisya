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
import { Suspense } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

/* ===================================================== */
/* VALIDATION */
/* ===================================================== */

const formSchema = z.object({
	otp: z
		.string()
		.length(6, "Kode OTP harus 6 digit")
		.regex(/^\d+$/, "Kode OTP hanya boleh berisi angka"),
});

const RESEND_COOLDOWN = 60;

/* ===================================================== */
/* WRAPPER (Suspense Fix) */
/* ===================================================== */

export default function VerifyOtpPage() {
	return (
		<Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
			<VerifyOtpContent />
		</Suspense>
	);
}

/* ===================================================== */
/* MAIN CONTENT (uses useSearchParams) */
/* ===================================================== */

function VerifyOtpContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const email = searchParams.get("email") ?? "";

	const [resendTimer, setResendTimer] = React.useState(RESEND_COOLDOWN);
	const [isResending, setIsResending] = React.useState(false);

	React.useEffect(() => {
		if (resendTimer <= 0) return;
		const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
		return () => clearTimeout(timer);
	}, [resendTimer]);

	const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

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

	function handleOtpDigitChange(
		index: number,
		value: string,
		currentOtp: string,
		onChange: (val: string) => void,
	) {
		const digit = value.replace(/\D/g, "").slice(-1);
		const otpArray = currentOtp.split("").concat(Array(6).fill("")).slice(0, 6);

		otpArray[index] = digit;
		onChange(otpArray.join("").slice(0, 6));

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

		const focusIndex = Math.min(pasted.length, 5);
		inputRefs.current[focusIndex]?.focus();
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<div className="w-full max-w-md">
				<div className="rounded-2xl border bg-background p-8 shadow-xl">
					<div className="mb-6 text-center">
						<div className="mb-4 flex justify-center">
							<ShieldCheck className="h-8 w-8 text-primary" />
						</div>

						<h1 className="font-bold text-2xl">Verifikasi Email</h1>

						<div className="mt-2 flex justify-center gap-2 text-muted-foreground text-sm">
							<Mail className="h-4 w-4" />
							<span>{email}</span>
						</div>
					</div>

					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<FieldGroup>
							<form.Field
								name="otp"
								children={(field) => {
									const otpDigits = field.state.value
										.split("")
										.concat(Array(6).fill(""))
										.slice(0, 6);

									return (
										<Field>
											<FieldLabel className="sr-only">Kode OTP</FieldLabel>

											<div
												className="flex justify-center gap-3"
												onPaste={(e) => handleOtpPaste(e, field.handleChange)}
											>
												{otpDigits.map((digit, index) => (
													<input
														key={index}
														type="text"
														inputMode="numeric"
														maxLength={1}
														value={digit}
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
														className="h-12 w-12 rounded-lg border text-center font-bold text-xl focus:border-primary focus:ring-2 focus:ring-primary/20"
													/>
												))}
											</div>

											<FieldError errors={field.state.meta.errors} />
										</Field>
									);
								}}
							/>

							<Button type="submit" className="w-full">
								Verifikasi Email <ArrowRight className="h-4 w-4" />
							</Button>

							<Button
								type="button"
								variant="ghost"
								className="w-full"
								disabled={resendTimer > 0 || isResending}
								onClick={handleResend}
							>
								{resendTimer > 0
									? `Kirim ulang dalam ${resendTimer}s`
									: "Kirim ulang kode"}
							</Button>
						</FieldGroup>
					</form>
				</div>
			</div>
		</div>
	);
}
