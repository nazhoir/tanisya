"use client";

import { Button } from "@tanisya/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@tanisya/ui/components/card";
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
import { ArrowRight, CheckCircle2, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";

// ─── Validation schema ────────────────────────────────────────────────────────

const schema = z.object({
	email: z.string().email("Alamat email tidak valid"),
});

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
	const [isSent, setIsSent] = useState(false);
	const [sentEmail, setSentEmail] = useState("");
	const [isResending, setIsResending] = useState(false);

	const form = useForm({
		defaultValues: { email: "" },
		validators: { onSubmit: schema },
		onSubmit: async ({ value }) => {
			const result = await authClient.requestPasswordReset({
				email: value.email,
				redirectTo: "/auth/reset-password",
			});

			if (result.error) {
				toast.error(result.error.message || "Gagal mengirim email reset password");
				return;
			}

			setSentEmail(value.email);
			setIsSent(true);
		},
	});

	const handleResend = async () => {
		setIsResending(true);
		const result = await authClient.requestPasswordReset({
			email: sentEmail,
			redirectTo: "/auth/reset-password",
		});
		setIsResending(false);

		if (result.error) {
			toast.error(result.error.message || "Gagal mengirim ulang email");
			return;
		}

		toast.success("Email reset password telah dikirim ulang");
	};

	// ── State: email berhasil dikirim ─────────────────────────────────────────
	if (isSent) {
		return (
			<Card className="mx-auto w-full max-w-md">
				<CardContent className="pt-6">
					<div className="flex flex-col items-center gap-4 text-center">
						<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
							<CheckCircle2 className="h-8 w-8 text-green-500" />
						</div>

						<div className="flex flex-col gap-1">
							<h1 className="font-extrabold text-2xl tracking-tight">
								Cek Email Kamu
							</h1>
							<p className="text-muted-foreground text-sm">
								Link reset password telah dikirim ke{" "}
								<span className="font-semibold text-foreground">{sentEmail}</span>.
								Berlaku selama 1 jam.
							</p>
						</div>

						<Card className="w-full text-left">
							<CardHeader className="pb-2">
								<CardTitle className="text-sm">Langkah selanjutnya</CardTitle>
							</CardHeader>
							<CardContent>
								<ol className="flex flex-col gap-1 text-muted-foreground text-sm">
									<li>1. Buka email dari Tanisya</li>
									<li>2. Klik tombol "Reset Password"</li>
									<li>3. Buat password baru kamu</li>
								</ol>
							</CardContent>
						</Card>

						<div className="flex w-full flex-col gap-2">
							<Button
								type="button"
								variant="outline"
								className="h-10 w-full gap-2"
								onClick={handleResend}
								disabled={isResending}
							>
								<RefreshCw className={`h-4 w-4 ${isResending ? "animate-spin" : ""}`} />
								{isResending ? "Mengirim..." : "Kirim ulang email"}
							</Button>

							<button
								type="button"
								onClick={() => setIsSent(false)}
								className="text-center text-muted-foreground text-xs underline-offset-2 hover:text-foreground hover:underline"
							>
								← Ganti alamat email
							</button>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	// ── State: form input email ───────────────────────────────────────────────
	return (
		<Card className="mx-auto w-full max-w-md">
			<CardHeader>
				<div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
					<Mail className="h-5 w-5 text-primary" />
				</div>
				<CardTitle className="font-extrabold text-2xl tracking-tight">
					Lupa Password?
				</CardTitle>
				<CardDescription>
					Masukkan email yang terdaftar. Kami akan mengirim link untuk mereset
					password kamu.
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<FieldGroup>
						{/* Email */}
						<form.Field
							name="email"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Alamat Email</FieldLabel>
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
											Kirim Link Reset <ArrowRight className="h-4 w-4" />
										</>
									)}
								</Button>
							)}
						/>

						{/* Back to login */}
						<p className="text-center text-muted-foreground text-sm">
							Ingat password?{" "}
							<Link
								href="/auth/login"
								className="font-semibold text-primary underline-offset-2 hover:underline"
							>
								Masuk sekarang
							</Link>
						</p>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}