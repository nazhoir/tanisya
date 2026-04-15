"use client";

import { Button } from "@tanisya/ui/components/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@tanisya/ui/components/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@tanisya/ui/components/input-group";
import { useForm } from "@tanstack/react-form";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";

// ─── Validation schema ────────────────────────────────────────────────────────

const schema = z.object({
	email: z.string().email("Alamat email tidak valid"),
});

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OtpLoginPage() {
	const router = useRouter();

	const form = useForm({
		defaultValues: { email: "" },
		validators: { onSubmit: schema },
		onSubmit: async ({ value }) => {
			const result = await authClient.emailOtp.sendVerificationOtp({
				email: value.email,
				type: "sign-in",
			});

			if (result.error) {
				toast.error(result.error.message || "Gagal mengirim kode OTP");
				return;
			}

			toast.success("Kode OTP telah dikirim ke email kamu");
			router.push(`/auth/login/otp/verify?email=${encodeURIComponent(value.email)}`);
		},
	});

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
						<Sparkles className="h-5 w-5 text-primary" />
					</div>
					<h1 className="font-extrabold text-2xl tracking-tight">
						Masuk dengan Kode OTP
					</h1>
					<p className="text-muted-foreground text-sm">
						Masukkan email kamu, kami akan kirim kode verifikasi untuk login
						tanpa password.
					</p>
				</div>

				{/* Email */}
				<form.Field
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
					onClick={() => router.back()}
					className="text-center text-muted-foreground text-xs underline-offset-2 hover:text-foreground hover:underline"
				>
					← Kembali ke halaman masuk
				</button>
			</FieldGroup>
		</form>
	);
}