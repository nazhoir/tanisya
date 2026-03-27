"use client";

import { Badge } from "@tanisya/ui/components/badge";
import { Button } from "@tanisya/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@tanisya/ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@tanisya/ui/components/dialog";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@tanisya/ui/components/field";
import { Input } from "@tanisya/ui/components/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@tanisya/ui/components/input-otp";
import { Switch } from "@tanisya/ui/components/switch";
import { useForm } from "@tanstack/react-form";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
	Check,
	Copy,
	Eye,
	EyeOff,
	KeyRound,
	Lock,
	QrCode,
	RefreshCw,
	ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import * as z from "zod";
import { InputPassword } from "@/components/input-password";
import { authClient } from "@/lib/auth-client";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TwoFactorAuthenticationFormProps {
	twoFactorEnabled: boolean;
	email: string;
}

// ─── Step type untuk alur aktivasi ────────────────────────────────────────────

type EnableStep = "password" | "qr" | "verify" | "backup";
type DisableStep = "password";

// ─── Sub-component: OTP Input (6 digit) ───────────────────────────────────────

function OTPInput({
	id,
	name,
	value,
	onBlur,
	onChange,
	"aria-invalid": ariaInvalid,
}: {
	id: string;
	name: string;
	value: string;
	onBlur: () => void;
	onChange: (v: string) => void;
	"aria-invalid"?: boolean;
}) {
	return (
		<InputOTP
			id={id}
			name={name}
			type="text"
			inputMode="numeric"
			maxLength={6}
			value={value}
			placeholder="000000"
			onBlur={onBlur}
			onChange={(value) => onChange(value)}
			aria-invalid={ariaInvalid}
			pattern={REGEXP_ONLY_DIGITS}
		>
			<InputOTPGroup className="mx-auto *:data-[slot=input-otp-slot]:h-17 *:data-[slot=input-otp-slot]:w-17 *:data-[slot=input-otp-slot]:text-3xl">
				<InputOTPSlot index={0} />
				<InputOTPSlot index={1} />
				<InputOTPSlot index={2} />
				<InputOTPSlot index={3} />
				<InputOTPSlot index={4} />
				<InputOTPSlot index={5} />
			</InputOTPGroup>
		</InputOTP>
	);
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function TwoFactorAuthenticationForm({
	twoFactorEnabled: initialEnabled,
	email,
}: TwoFactorAuthenticationFormProps) {
	// ── State ────────────────────────────────────────────────────────────────
	const [isEnabled, setIsEnabled] = useState(initialEnabled);
	const [openEnable, setOpenEnable] = useState(false);
	const [openDisable, setOpenDisable] = useState(false);
	const [enableStep, setEnableStep] = useState<EnableStep>("password");
	const [totpURI, setTotpURI] = useState<string>("");
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [copiedCodes, setCopiedCodes] = useState(false);

	// ── Reset dialog states ───────────────────────────────────────────────────
	const resetEnableDialog = () => {
		setEnableStep("password");
		setTotpURI("");
		setBackupCodes([]);
		setCopiedCodes(false);
		enablePasswordForm.reset();
		enableVerifyForm.reset();
	};

	const resetDisableDialog = () => {
		disableForm.reset();
	};

	// ─────────────────────────────────────────────────────────────────────────
	// FORM 1: Konfirmasi password untuk aktifkan 2FA
	// ─────────────────────────────────────────────────────────────────────────
	const enablePasswordForm = useForm({
		defaultValues: { password: "" },
		validators: {
			onSubmit: z.object({
				password: z.string().min(1, "Kata sandi tidak boleh kosong"),
			}),
		},
		onSubmit: async ({ value }) => {
			const result = await authClient.twoFactor.enable({
				password: value.password,
				issuer: `Tanisya - ${email}`,
			});

			if (result.error) {
				toast.error(
					result.error.message || "Gagal mengaktifkan autentikasi dua faktor",
				);
				return;
			}

			setTotpURI(result.data.totpURI);
			setBackupCodes(result.data.backupCodes);
			setEnableStep("qr");
		},
	});

	// ─────────────────────────────────────────────────────────────────────────
	// FORM 2: Verifikasi TOTP pertama kali (konfirmasi scan berhasil)
	// ─────────────────────────────────────────────────────────────────────────
	const enableVerifyForm = useForm({
		defaultValues: { code: "" },
		validators: {
			onSubmit: z.object({
				code: z
					.string()
					.length(6, "Kode harus 6 digit")
					.regex(/^\d+$/, "Kode hanya boleh angka"),
			}),
		},
		onSubmit: async ({ value }) => {
			const result = await authClient.twoFactor.verifyTotp({
				code: value.code,
			});

			if (result.error) {
				toast.error(result.error.message || "Kode tidak valid");
				return;
			}

			setIsEnabled(true);
			setEnableStep("backup");
		},
	});

	// ─────────────────────────────────────────────────────────────────────────
	// FORM 3: Konfirmasi password untuk nonaktifkan 2FA
	// ─────────────────────────────────────────────────────────────────────────
	const disableForm = useForm({
		defaultValues: { password: "" },
		validators: {
			onSubmit: z.object({
				password: z.string().min(1, "Kata sandi tidak boleh kosong"),
			}),
		},
		onSubmit: async ({ value }) => {
			const result = await authClient.twoFactor.disable({
				password: value.password,
			});

			if (result.error) {
				toast.error(
					result.error.message || "Gagal menonaktifkan autentikasi dua faktor",
				);
				return;
			}

			setIsEnabled(false);
			setOpenDisable(false);
			resetDisableDialog();
			toast.success("Autentikasi dua faktor berhasil dinonaktifkan");
		},
	});

	// ── Copy backup codes ─────────────────────────────────────────────────────
	const handleCopyBackupCodes = async () => {
		await navigator.clipboard.writeText(backupCodes.join("\n"));
		setCopiedCodes(true);
		setTimeout(() => setCopiedCodes(false), 2000);
	};

	// ── Render ────────────────────────────────────────────────────────────────
	return (
		<>
			{/* ── Card utama ──────────────────────────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Autentikasi Dua Faktor</CardTitle>
					<CardDescription>
						Tambahkan lapisan keamanan ekstra pada akun kamu.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<div className="flex items-center gap-2">
								<p className="font-medium text-sm">Aplikasi Autentikator</p>
								<Badge
									variant={isEnabled ? "default" : "secondary"}
									className="text-xs"
								>
									{isEnabled ? "Aktif" : "Nonaktif"}
								</Badge>
							</div>
							<p className="text-muted-foreground text-xs">
								Gunakan aplikasi autentikator seperti Google Authenticator atau
								Authy.
							</p>
						</div>
						<Switch
							checked={isEnabled}
							onCheckedChange={(checked) => {
								if (checked) {
									resetEnableDialog();
									setOpenEnable(true);
								} else {
									resetDisableDialog();
									setOpenDisable(true);
								}
							}}
						/>
					</div>
				</CardContent>
			</Card>

			{/* ── Dialog: Aktifkan 2FA ─────────────────────────────────────────── */}
			<Dialog
				open={openEnable}
				onOpenChange={(open) => {
					if (!open) resetEnableDialog();
					// Jangan tutup saat submit sedang berjalan
					const isSubmitting =
						enablePasswordForm.state.isSubmitting ||
						enableVerifyForm.state.isSubmitting;
					if (!isSubmitting) setOpenEnable(open);
				}}
			>
				<DialogContent className="sm:max-w-md">
					{/* ── Step 1: Konfirmasi password ─────────────────────────── */}
					{enableStep === "password" && (
						<>
							<DialogHeader>
								<DialogTitle>Aktifkan Autentikasi Dua Faktor</DialogTitle>
								<DialogDescription>
									Masukkan kata sandi untuk melanjutkan.
								</DialogDescription>
							</DialogHeader>

							<form
								onSubmit={(e) => {
									e.preventDefault();
									enablePasswordForm.handleSubmit();
								}}
							>
								<FieldGroup className="py-2">
									<enablePasswordForm.Field
										name="password"
										children={(field) => {
											const isInvalid =
												field.state.meta.isTouched && !field.state.meta.isValid;
											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel htmlFor={field.name}>
														Kata Sandi
													</FieldLabel>
													<InputPassword
														id={field.name}
														name={field.name}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={field.handleChange}
														aria-invalid={isInvalid}
														icon={KeyRound}
													/>
													{isInvalid && (
														<FieldError errors={field.state.meta.errors} />
													)}
												</Field>
											);
										}}
									/>
								</FieldGroup>

								<DialogFooter className="mt-4 gap-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => setOpenEnable(false)}
										disabled={enablePasswordForm.state.isSubmitting}
									>
										Batal
									</Button>
									<Button
										type="submit"
										disabled={enablePasswordForm.state.isSubmitting}
									>
										{enablePasswordForm.state.isSubmitting
											? "Memproses..."
											: "Lanjutkan"}
									</Button>
								</DialogFooter>
							</form>
						</>
					)}

					{/* ── Step 2: Scan QR code ────────────────────────────────── */}
					{enableStep === "qr" && (
						<>
							<DialogHeader>
								<DialogTitle>Scan QR Code</DialogTitle>
								<DialogDescription>
									Buka aplikasi autentikator kamu, lalu scan kode di bawah ini.
								</DialogDescription>
							</DialogHeader>

							<div className="flex flex-col items-center gap-4 py-2">
								{/* QR Code */}
								<div className="rounded-lg border bg-white p-3">
									<QRCode value={totpURI} size={180} level="M" />
								</div>

								{/* TOTP URI untuk copy manual */}
								<details className="w-full">
									<summary className="cursor-pointer text-muted-foreground text-xs hover:text-foreground">
										Tidak bisa scan? Masukkan kode secara manual
									</summary>
									<div className="mt-2 flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
										<code className="flex-1 break-all text-xs">
											{new URL(totpURI).searchParams.get("secret")}
										</code>
										<button
											type="button"
											onClick={() => {
												const secret =
													new URL(totpURI).searchParams.get("secret") ?? "";
												navigator.clipboard.writeText(secret);
												toast.success("Secret disalin");
											}}
											className="shrink-0 text-muted-foreground hover:text-foreground"
										>
											<Copy className="h-3.5 w-3.5" />
										</button>
									</div>
								</details>
							</div>

							<DialogFooter className="gap-2">
								<Button
									variant="outline"
									onClick={() => setEnableStep("password")}
								>
									Kembali
								</Button>
								<Button onClick={() => setEnableStep("verify")}>
									Sudah Di-scan, Lanjutkan
								</Button>
							</DialogFooter>
						</>
					)}

					{/* ── Step 3: Verifikasi TOTP pertama ─────────────────────── */}
					{enableStep === "verify" && (
						<>
							<DialogHeader>
								<DialogTitle>Verifikasi Kode</DialogTitle>
								<DialogDescription>
									Masukkan kode 6 digit dari aplikasi autentikator untuk
									mengonfirmasi bahwa scan berhasil.
								</DialogDescription>
							</DialogHeader>

							<form
								onSubmit={(e) => {
									e.preventDefault();
									enableVerifyForm.handleSubmit();
								}}
							>
								<FieldGroup className="py-2">
									<enableVerifyForm.Field
										name="code"
										children={(field) => {
											const isInvalid =
												field.state.meta.isTouched && !field.state.meta.isValid;
											return (
												<Field data-invalid={isInvalid}>
													<OTPInput
														id={field.name}
														name={field.name}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={field.handleChange}
														aria-invalid={isInvalid}
													/>
													{isInvalid && (
														<FieldError errors={field.state.meta.errors} />
													)}
												</Field>
											);
										}}
									/>
								</FieldGroup>

								<DialogFooter className="mt-4 gap-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => setEnableStep("qr")}
										disabled={enableVerifyForm.state.isSubmitting}
									>
										Kembali
									</Button>
									<Button
										type="submit"
										disabled={enableVerifyForm.state.isSubmitting}
									>
										{enableVerifyForm.state.isSubmitting
											? "Memverifikasi..."
											: "Verifikasi"}
									</Button>
								</DialogFooter>
							</form>
						</>
					)}

					{/* ── Step 4: Simpan backup codes ─────────────────────────── */}
					{enableStep === "backup" && (
						<>
							<DialogHeader>
								<DialogTitle className="flex items-center gap-2">
									<ShieldCheck className="h-5 w-5 text-emerald-500" />
									2FA Berhasil Diaktifkan
								</DialogTitle>
								<DialogDescription>
									Simpan kode cadangan ini di tempat aman. Kode ini digunakan
									jika kamu kehilangan akses ke aplikasi autentikator.
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-2 py-2">
								<div className="grid grid-cols-2 gap-1.5 rounded-md border bg-muted/50 p-3">
									{backupCodes.map((code) => (
										<code
											key={code}
											className="text-center font-mono text-xs tracking-widest"
										>
											{code}
										</code>
									))}
								</div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="w-full"
									onClick={handleCopyBackupCodes}
								>
									{copiedCodes ? (
										<>
											<Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
											Disalin!
										</>
									) : (
										<>
											<Copy className="mr-1.5 h-3.5 w-3.5" />
											Salin Semua Kode
										</>
									)}
								</Button>
							</div>

							<DialogFooter>
								<Button
									onClick={() => {
										setOpenEnable(false);
										resetEnableDialog();
										toast.success("Autentikasi dua faktor berhasil diaktifkan");
									}}
								>
									Selesai
								</Button>
							</DialogFooter>
						</>
					)}
				</DialogContent>
			</Dialog>

			{/* ── Dialog: Nonaktifkan 2FA ──────────────────────────────────────── */}
			<Dialog
				open={openDisable}
				onOpenChange={(open) => {
					if (!disableForm.state.isSubmitting) {
						if (!open) resetDisableDialog();
						setOpenDisable(open);
					}
				}}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Nonaktifkan Autentikasi Dua Faktor</DialogTitle>
						<DialogDescription>
							Tindakan ini akan mengurangi keamanan akun kamu. Masukkan kata
							sandi untuk mengonfirmasi.
						</DialogDescription>
					</DialogHeader>

					<form
						onSubmit={(e) => {
							e.preventDefault();
							disableForm.handleSubmit();
						}}
					>
						<FieldGroup className="py-2">
							<disableForm.Field
								name="password"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Kata Sandi</FieldLabel>
											<InputPassword
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={field.handleChange}
												aria-invalid={isInvalid}
												icon={KeyRound}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>
						</FieldGroup>

						<DialogFooter className="mt-4 gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpenDisable(false)}
								disabled={disableForm.state.isSubmitting}
							>
								Batal
							</Button>
							<Button
								type="submit"
								variant="destructive"
								disabled={disableForm.state.isSubmitting}
							>
								{disableForm.state.isSubmitting
									? "Menonaktifkan..."
									: "Nonaktifkan 2FA"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
