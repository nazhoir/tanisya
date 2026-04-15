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
import { useForm } from "@tanstack/react-form";
import { AlertCircle, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";
import { InputPassword } from "@/components/input-password";

// ─── Validation schema ────────────────────────────────────────────────────────

const schema = z
	.object({
		password: z
			.string()
			.min(8, "Password minimal 8 karakter")
			.regex(/[A-Z]/, "Harus mengandung minimal 1 huruf kapital")
			.regex(/[0-9]/, "Harus mengandung minimal 1 angka"),
		confirmPassword: z.string().min(1, "Konfirmasi password tidak boleh kosong"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Password tidak cocok",
		path: ["confirmPassword"],
	});

// ─── Password strength indicator ─────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
	const checks = [
		{ label: "Minimal 8 karakter", pass: password.length >= 8 },
		{ label: "Huruf kapital (A-Z)", pass: /[A-Z]/.test(password) },
		{ label: "Angka (0-9)", pass: /[0-9]/.test(password) },
	];

	const passed = checks.filter((c) => c.pass).length;
	const strength = passed === 0 ? 0 : passed === 1 ? 33 : passed === 2 ? 66 : 100;
	const color =
		strength === 0
			? "bg-muted"
			: strength <= 33
				? "bg-red-500"
				: strength <= 66
					? "bg-amber-500"
					: "bg-green-500";

	if (!password) return null;

	return (
		<div className="flex flex-col gap-2">
			{/* Progress bar */}
			<div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
				<div
					className={`h-full rounded-full transition-all duration-300 ${color}`}
					style={{ width: `${strength}%` }}
				/>
			</div>
			{/* Checklist */}
			<div className="flex flex-col gap-1">
				{checks.map(({ label, pass }) => (
					<div
						key={label}
						className={`flex items-center gap-1.5 text-xs transition-colors ${
							pass ? "text-green-600" : "text-muted-foreground"
						}`}
					>
						<CheckCircle2
							className={`h-3.5 w-3.5 shrink-0 transition-colors ${pass ? "text-green-500" : "text-muted-foreground/40"}`}
						/>
						{label}
					</div>
				))}
			</div>
		</div>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const [isSuccess, setIsSuccess] = useState(false);
	const [passwordValue, setPasswordValue] = useState("");

	const form = useForm({
		defaultValues: { password: "", confirmPassword: "" },
		validators: { onSubmit: schema },
		onSubmit: async ({ value }) => {
			if (!token) {
				toast.error("Token tidak valid atau sudah kadaluarsa");
				return;
			}

			const result = await authClient.resetPassword({
				newPassword: value.password,
				token,
			});

			if (result.error) {
				toast.error(result.error.message || "Gagal mereset password");
				return;
			}

			setIsSuccess(true);
		},
	});

	// ── Token tidak ada di URL ────────────────────────────────────────────────
	if (!token) {
		return (
			<Card className="mx-auto w-full max-w-md">
				<CardContent className="pt-6">
					<div className="flex flex-col items-center gap-4 text-center">
						<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
							<AlertCircle className="h-8 w-8 text-destructive" />
						</div>
						<div className="flex flex-col gap-1">
							<h1 className="font-extrabold text-2xl tracking-tight">
								Link Tidak Valid
							</h1>
							<p className="text-muted-foreground text-sm">
								Link reset password tidak valid atau sudah kadaluarsa. Silakan
								minta link baru.
							</p>
						</div>
						<Link
							href="/auth/forgot-password"
							className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 font-bold text-primary-foreground text-sm transition-colors hover:bg-primary/90"
						>
							Minta Link Baru
						</Link>
					</div>
				</CardContent>
			</Card>
		);
	}

	// ── State: password berhasil direset ──────────────────────────────────────
	if (isSuccess) {
		return (
			<Card className="mx-auto w-full max-w-md">
				<CardContent className="pt-6">
					<div className="flex flex-col items-center gap-4 text-center">
						<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
							<CheckCircle2 className="h-8 w-8 text-green-500" />
						</div>
						<div className="flex flex-col gap-1">
							<h1 className="font-extrabold text-2xl tracking-tight">
								Password Berhasil Direset!
							</h1>
							<p className="text-muted-foreground text-sm">
								Password kamu telah diperbarui. Silakan masuk dengan password
								baru kamu.
							</p>
						</div>
						<Button
							type="button"
							size="lg"
							className="h-11 w-full gap-2 font-bold"
							onClick={() => router.push("/auth/login")}
						>
							Masuk Sekarang
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	// ── State: form reset password ────────────────────────────────────────────
	return (
		<Card className="mx-auto w-full max-w-md">
			<CardHeader>
				<div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
					<ShieldCheck className="h-5 w-5 text-primary" />
				</div>
				<CardTitle className="font-extrabold text-2xl tracking-tight">
					Buat Password Baru
				</CardTitle>
				<CardDescription>
					Buat password baru yang kuat untuk akunmu. Pastikan mudah diingat
					namun sulit ditebak.
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
						{/* Password baru */}
						<form.Field
							name="password"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Password Baru</FieldLabel>
										<InputPassword
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(v) => {
												field.handleChange(v);
												setPasswordValue(v);
											}}
											aria-invalid={isInvalid}
											
											
											icon={Lock}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
										<PasswordStrength password={passwordValue} />
									</Field>
								);
							}}
						/>

						{/* Konfirmasi password */}
						<form.Field
							name="confirmPassword"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Konfirmasi Password
										</FieldLabel>
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
											Menyimpan...
										</>
									) : (
										<>
											Simpan Password Baru
											<ShieldCheck className="h-4 w-4" />
										</>
									)}
								</Button>
							)}
						/>

						{/* Back to login */}
						<p className="text-center text-muted-foreground text-sm">
							Ingat password lama?{" "}
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