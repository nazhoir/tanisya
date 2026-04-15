"use client";

import { Button } from "@tanisya/ui/components/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@tanisya/ui/components/field";
import { Input } from "@tanisya/ui/components/input";
import { useForm } from "@tanstack/react-form";
import { ArrowRight, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";

// ─── Validation schema ────────────────────────────────────────────────────────

const schema = z.object({
	code: z.string().min(1, "Kode cadangan tidak boleh kosong"),
});

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BackupCodePage() {
	const router = useRouter();
	const [isSendingOTP, setIsSendingOTP] = useState(false);

	const form = useForm({
		defaultValues: { code: "" },
		validators: { onSubmit: schema },
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

	const switchToEmailOTP = async () => {
		setIsSendingOTP(true);
		const result = await authClient.twoFactor.sendOtp();
		setIsSendingOTP(false);

		if (result.error) {
			toast.error(result.error.message || "Gagal mengirim kode OTP");
			return;
		}

		toast.success("Kode OTP telah dikirim ke email kamu");
		router.push("/auth/login/2fa/email");
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
					<div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
						<KeyRound className="h-5 w-5 text-amber-500" />
					</div>
					<h1 className="font-extrabold text-2xl tracking-tight">
						Kode Cadangan
					</h1>
					<p className="text-muted-foreground text-sm">
						Masukkan salah satu kode cadangan yang kamu simpan saat mengaktifkan
						2FA. Setiap kode hanya bisa digunakan sekali.
					</p>
				</div>

				{/* Backup code */}
				<form.Field
					name="code"
					children={(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Kode Cadangan</FieldLabel>
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

				{/* Opsi lain */}
				<div className="flex justify-center gap-3 text-center text-muted-foreground text-xs">
					<button
						type="button"
						onClick={() => router.push("/auth/login/2fa")}
						className="font-semibold text-primary underline-offset-2 hover:underline"
					>
						Gunakan app autentikator
					</button>
					<span>·</span>
					<button
						type="button"
						onClick={switchToEmailOTP}
						disabled={isSendingOTP}
						className="font-semibold text-primary underline-offset-2 hover:underline disabled:opacity-50"
					>
						Kirim kode via email
					</button>
				</div>

				{/* Kembali */}
				<button
					type="button"
					onClick={() => router.push("/auth/login")}
					className="text-center text-muted-foreground text-xs underline-offset-2 hover:text-foreground hover:underline"
				>
					← Kembali ke halaman masuk
				</button>
			</FieldGroup>
		</form>
	);
}