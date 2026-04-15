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
import { ArrowRight, CheckCircle2, Info, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";

// ─── Validation schema ────────────────────────────────────────────────────────

const schema = z.object({
	email: z.string().email("Alamat email tidak valid"),
});

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VerifyEmailRequestPage() {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const [isSent, setIsSent] = useState(false);
	const [sentEmail, setSentEmail] = useState("");

	const form = useForm({
		defaultValues: {
			email: session?.user?.email ?? "",
		},
		validators: { onSubmit: schema },
		onSubmit: async ({ value }) => {
			// Cek dari session jika user sudah login dan email sudah terverifikasi
			if (session?.user?.email === value.email && session?.user?.emailVerified) {
				toast.info("Email kamu sudah terverifikasi, tidak perlu verifikasi ulang.", {
					icon: <Info className="h-4 w-4" />,
				});
				router.push("/dashboard");
				return;
			}

			const result = await authClient.sendVerificationEmail({
				email: value.email,
				callbackURL: "/dashboard",
			});

			if (result.error) {
				// Tangkap error jika email sudah terverifikasi dari sisi server
				const msg = result.error.message?.toLowerCase() ?? "";
				if (msg.includes("already verified") || msg.includes("sudah diverifikasi")) {
					toast.info("Email ini sudah terverifikasi, kamu bisa langsung masuk.", {
						icon: <Info className="h-4 w-4" />,
					});
					return;
				}
				toast.error(result.error.message || "Gagal mengirim email verifikasi");
				return;
			}

			setSentEmail(value.email);
			setIsSent(true);
		},
	});

	// ── State: email berhasil dikirim ─────────────────────────────────────────
	if (isSent) {
		return (
			<FieldGroup>
				<div className="flex flex-col items-center gap-4 py-4 text-center">
					<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
						<CheckCircle2 className="h-8 w-8 text-green-500" />
					</div>

					<div className="flex flex-col gap-1">
						<h1 className="font-extrabold text-2xl tracking-tight">
							Email Terkirim!
						</h1>
						<p className="text-muted-foreground text-sm">
							Link verifikasi telah dikirim ke{" "}
							<span className="font-semibold text-foreground">{sentEmail}</span>.
							Cek kotak masuk atau folder spam kamu.
						</p>
					</div>

					<Card className="w-full text-left">
						<CardHeader className="pb-2">
							<CardTitle className="text-sm">Langkah selanjutnya</CardTitle>
						</CardHeader>
						<CardContent>
							<ol className="flex flex-col gap-1 text-muted-foreground text-sm">
								<li>1. Buka email dari Tanisya</li>
								<li>2. Klik tombol "Verifikasi Email"</li>
								<li>3. Kamu akan diarahkan kembali ke dashboard</li>
							</ol>
						</CardContent>
					</Card>

					<div className="flex w-full flex-col gap-2">
						<Button
							type="button"
							variant="outline"
							className="h-10 w-full gap-2"
							onClick={async () => {
								const result = await authClient.sendVerificationEmail({
									email: sentEmail,
									callbackURL: "/dashboard",
								});
								if (result.error) {
									toast.error(
										result.error.message || "Gagal mengirim ulang email",
									);
								} else {
									toast.success("Email verifikasi telah dikirim ulang");
								}
							}}
						>
							<RefreshCw className="h-4 w-4" />
							Kirim ulang email
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
			</FieldGroup>
		);
	}

	// ── State: form input email ───────────────────────────────────────────────
	return (
		<Card>
			<CardHeader>
				<div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
					<Mail className="h-5 w-5 text-primary" />
				</div>
				<CardTitle className="font-extrabold text-2xl tracking-tight">
					Verifikasi Email
				</CardTitle>
				<CardDescription>
					Masukkan email yang terdaftar. Kami akan mengirim link verifikasi
					untuk mengaktifkan akun kamu.
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
											Kirim Link Verifikasi <ArrowRight className="h-4 w-4" />
										</>
									)}
								</Button>
							)}
						/>

						{/* Back to login */}
						<p className="text-center text-muted-foreground text-sm">
							Sudah verifikasi?{" "}
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