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
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@tanisya/ui/components/field";
import { Input } from "@tanisya/ui/components/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@tanisya/ui/components/input-group";
import { useForm } from "@tanstack/react-form";
import { Mail, User } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";

// ─── Props ────────────────────────────────────────────────────────────────────

interface PersonalInformationProps {
	userId: string;
	name: string;
	username: string;
	email: string;
	emailVerified: boolean;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
	name: z
		.string("Nama wajib diisi")
		.trim()
		.min(3, "Nama minimal 3 karakter")
		.max(100, "Nama maksimal 100 karakter")
		.regex(
			/^(?!\.)([A-Za-z\s'.-]*[A-Za-z\s'-])$/,
			"Nama tidak boleh diawali atau diakhiri titik",
		),
	username: z
		.string("Username wajib diisi")
		.trim()
		.min(3, "Username minimal 3 karakter")
		.max(30, "Username maksimal 30 karakter")
		.regex(
			/^[a-z][a-z0-9_]*$/,
			"Username harus diawali huruf kecil dan hanya boleh huruf kecil, angka dan uderscore (_)",
		),
	email: z
		.email("Alamat email tidak valid")
		.max(100, "Email terlalu panjang")
		.toLowerCase(),
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function FormPersonalInformation({
	userId,
	name,
	username,
	email,
	emailVerified,
}: PersonalInformationProps) {
	const form = useForm({
		defaultValues: { name, email, username },
		validators: { onSubmit: schema },
		onSubmit: async ({ value }) => {
			await authClient.updateUser(
				{ name: value.name, username: value.username },
				{
					onError: ({ error }) => {
						toast.error(error.message || "Gagal memperbarui informasi pribadi");
					},
					onSuccess: () => {
						toast.success("Informasi pribadi berhasil diperbarui");
					},
				},
			);
		},
	});

	return (
		<form
			id="update-user-personal-information-form"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Informasi Pribadi</CardTitle>
					<CardDescription>
						Perbarui detail pribadi kamu di sini.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<FieldGroup>
						{/* Nama */}
						<form.Field
							name="name"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Nama</FieldLabel>

										<InputGroup>
											<InputGroupInput
												id={field.name}
												name={field.name}
												type="text"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="Username kamu"
											/>
											<InputGroupAddon>
												<User />
											</InputGroupAddon>
										</InputGroup>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>

						{/* Username */}
						<form.Field
							name="username"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Username</FieldLabel>
										<InputGroup>
											<InputGroupInput
												id={field.name}
												name={field.name}
												type="text"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="Username kamu"
											/>
											<InputGroupAddon>
												<User />
											</InputGroupAddon>
										</InputGroup>

										<FieldDescription>
											Pilih username unik untuk akun anda
										</FieldDescription>

										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>

						{/* Email */}
						<form.Field
							name="email"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Alamat Email
											<Badge
												variant={emailVerified ? "secondary" : "default"}
												className="w-fit"
											>
												{emailVerified ? (
													"Email terverifikasi"
												) : (
													<>
														Belum terverifikasi —{" "}
														<a href="/auth/verify-email" className="underline">
															klik di sini
														</a>
													</>
												)}
											</Badge>
										</FieldLabel>

										<InputGroup>
											<InputGroupInput
												id={field.name}
												name={field.name}
												type="email"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												disabled
											/>
											<InputGroupAddon>
												<User />
											</InputGroupAddon>
										</InputGroup>
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
									onClick={() => form.reset()}
								>
									Batal
								</Button>
								<Button type="submit" disabled={!isDirty || isSubmitting}>
									{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
								</Button>
							</>
						)}
					/>
				</CardFooter>
			</Card>
		</form>
	);
}
