"use client";

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
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@tanisya/ui/components/field";
import { Input } from "@tanisya/ui/components/input";
import { useForm } from "@tanstack/react-form";
import { Check, Eye, EyeOff, KeyRound, Lock, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import {
	InputPassword,
	InputPasswordChecklist,
	PASSWORD_RULES,
} from "@/components/input-password";
import { authClient } from "@/lib/auth-client";

// ─── Schema ───────────────────────────────────────────────────────────────────

const passwordStrengthSchema = z
	.string()
	.min(8, "Kata sandi minimal 8 karakter")
	.regex(/[A-Z]/, "Harus mengandung huruf besar")
	.regex(/[a-z]/, "Harus mengandung huruf kecil")
	.regex(/[0-9]/, "Harus mengandung angka")
	.regex(/[^A-Za-z0-9]/, "Harus mengandung karakter khusus");

const schema = z
	.object({
		currentPassword: z
			.string()
			.min(1, "Kata sandi saat ini tidak boleh kosong"),
		newPassword: passwordStrengthSchema,
		confirmPassword: z
			.string()
			.min(1, "Konfirmasi kata sandi tidak boleh kosong"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Konfirmasi kata sandi tidak cocok",
		path: ["confirmPassword"],
	});

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChangePasswordForm() {
	// Kontrol kapan checklist ditampilkan (hanya saat field newPassword fokus)
	const [showChecklist, setShowChecklist] = useState(false);

	const form = useForm({
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
		validators: { onSubmit: schema },
		onSubmit: async ({ value }) => {
			await authClient.changePassword(
				{
					currentPassword: value.currentPassword,
					newPassword: value.newPassword,
				},
				{
					onError: ({ error }) => {
						toast.error(error.message || "Gagal memperbarui kata sandi");
					},
					onSuccess: () => {
						toast.success("Kata sandi berhasil diperbarui");
						form.reset();
						setShowChecklist(false);
					},
				},
			);
		},
	});

	return (
		<form
			id="change-password-form"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Ganti Kata Sandi</CardTitle>
					<CardDescription>
						Gunakan kata sandi yang kuat dan unik.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<FieldGroup>
						{/* ── Kata Sandi Saat Ini ───────────────────────────────── */}
						<form.Field
							name="currentPassword"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Kata Sandi Saat Ini
										</FieldLabel>
										<InputPassword
											id={field.name}
											name={field.name}
											value={field.state.value}
											placeholder="••••••••"
											onBlur={field.handleBlur}
											onChange={field.handleChange}
											icon={Lock}
											aria-invalid={isInvalid}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>

						{/* ── Kata Sandi Baru ───────────────────────────────────── */}
						<form.Field
							name="newPassword"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Kata Sandi Baru
										</FieldLabel>
										<InputPassword
											id={field.name}
											name={field.name}
											value={field.state.value}
											placeholder="••••••••"
											onFocus={() => setShowChecklist(true)}
											onBlur={() => {
												field.handleBlur();
												// Sembunyikan checklist hanya jika semua syarat sudah terpenuhi
												const allPassed = PASSWORD_RULES.every((r) =>
													r.test(field.state.value),
												);
												setShowChecklist(false);
											}}
											onChange={field.handleChange}
											icon={KeyRound}
											aria-invalid={isInvalid}
										/>

										{/* Checklist realtime — muncul saat fokus */}
										{showChecklist && (
											<InputPasswordChecklist value={field.state.value} />
										)}

										{isInvalid && !showChecklist && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>

						{/* ── Konfirmasi Kata Sandi Baru ────────────────────────── */}
						<form.Field
							name="confirmPassword"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Konfirmasi Kata Sandi Baru
										</FieldLabel>
										<InputPassword
											id={field.name}
											name={field.name}
											value={field.state.value}
											placeholder="••••••••"
											onBlur={field.handleBlur}
											onChange={field.handleChange}
											icon={KeyRound}
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
				</CardContent>

				<CardFooter className="flex justify-end gap-2">
					<form.Subscribe
						selector={(s) => [s.isSubmitting, s.isDirty] as const}
						children={([isSubmitting, isDirty]) => (
							<>
								<Button
									type="button"
									variant="outline"
									disabled={!isDirty || isSubmitting}
									onClick={() => {
										form.reset();
										setShowChecklist(false);
									}}
								>
									Batal
								</Button>
								<Button type="submit" disabled={!isDirty || isSubmitting}>
									{isSubmitting ? "Menyimpan..." : "Perbarui Kata Sandi"}
								</Button>
							</>
						)}
					/>
				</CardFooter>
			</Card>
		</form>
	);
}
