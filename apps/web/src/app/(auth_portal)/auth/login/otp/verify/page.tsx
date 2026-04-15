"use client";

import { Button } from "@tanisya/ui/components/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@tanisya/ui/components/field";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@tanisya/ui/components/input-otp";
import { useForm } from "@tanstack/react-form";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowRight, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";

// ─── Validation schema ────────────────────────────────────────────────────────

const schema = z.object({
	code: z
		.string()
		.length(6, "Kode harus 6 digit")
		.regex(/^\d+$/, "Kode hanya boleh angka"),
});

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OtpVerifyPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const email = searchParams.get("email") ?? "";
	const [isSending, setIsSending] = useState(false);

	const form = useForm({
		defaultValues: { code: "" },
		validators: { onSubmit: schema },
		onSubmit: async ({ value }) => {
			const result = await authClient.signIn.emailOtp({
				email,
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

	const handleResend = async () => {
		if (!email) return;
		setIsSending(true);

		const result = await authClient.emailOtp.sendVerificationOtp({
			email,
			type: "sign-in",
		});

		setIsSending(false);

		if (result.error) {
			toast.error(result.error.message || "Gagal mengirim ulang kode OTP");
			return;
		}

		toast.success("Kode OTP telah dikirim ulang");
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
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
						<span className="font-semibold">{email}</span>. Berlaku selama
						3 menit.
					</p>
				</div>

				{/* Kode OTP */}
				<form.Field
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
									inputMode="numeric"
									maxLength={6}
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
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>

				{/* Submit */}
				<form.Subscribe
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
						onClick={handleResend}
						disabled={isSending}
						className="font-semibold text-primary underline-offset-2 hover:underline disabled:opacity-50"
					>
						{isSending ? "Mengirim..." : "Kirim ulang"}
					</button>
				</div>

				{/* Back */}
				<button
					type="button"
					onClick={() => router.back()}
					className="text-center text-muted-foreground text-xs underline-offset-2 hover:text-foreground hover:underline"
				>
					← Kembali
				</button>
			</FieldGroup>
		</form>
	);
}