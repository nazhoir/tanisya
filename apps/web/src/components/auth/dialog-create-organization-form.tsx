"use client";

import { useUploadFiles } from "@better-upload/client";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@tanisya/ui/components/avatar";
import { Button } from "@tanisya/ui/components/button";
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
import { useForm, useStore } from "@tanstack/react-form";
import { Building2, ImagePlus, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { UploadDropzone } from "@/components/upload-dropzone";
import { UploadProgress } from "@/components/upload-progress";
import { authClient } from "@/lib/auth-client";

// ─── Schema ───────────────────────────────────────────────────────────────────

const createOrgSchema = z.object({
	name: z.string().min(2, "Nama organisasi minimal 2 karakter"),
	slug: z
		.string()
		.min(2, "Slug minimal 2 karakter")
		.max(50, "Slug maksimal 50 karakter")
		.regex(
			/^[a-z0-9-]+$/,
			"Slug hanya boleh huruf kecil, angka, dan tanda hubung",
		),
});

// ─── Helper: generate slug dari nama ─────────────────────────────────────────

function toSlug(name: string) {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

export function DialogCreateOrganization({
	open,
	onOpenChange,
	onCreated,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreated: () => void;
}) {
	// ── Logo upload state ─────────────────────────────────────────────────
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [logoUrl, setLogoUrl] = useState<string | null>(null);
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [showLogoUpload, setShowLogoUpload] = useState(false);

	// Tandai apakah user sudah mengedit slug secara manual
	// Jika belum, slug mengikuti nama secara otomatis
	const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

	const {
		control,
		upload,
		isPending: isUploading,
	} = useUploadFiles({
		route: "images",
		onError: (error) => {
			toast.error(error.message ?? "Terjadi kesalahan saat upload logo");
		},
		onUploadFail: ({ failedFiles }) => {
			toast.error(`${failedFiles.length} file gagal diupload.`);
		},
		onUploadComplete: async ({ metadata }) => {
			const urls = metadata?.urls as string[] | undefined;
			const uploadedUrl = urls?.[0];
			if (!uploadedUrl) {
				toast.error("Gagal mendapatkan URL logo");
				return;
			}
			setLogoUrl(uploadedUrl);
			setLogoPreview(uploadedUrl);
			setShowLogoUpload(false);
			setSelectedFiles([]);
			toast.success("Logo berhasil diupload");
		},
	});

	const handleUploadLogo = () => {
		if (selectedFiles.length === 0) return;
		upload(selectedFiles);
	};

	const handleRemoveLogo = () => {
		setLogoUrl(null);
		setLogoPreview(null);
		setSelectedFiles([]);
		control.reset();
		setShowLogoUpload(false);
	};

	// ── Form ──────────────────────────────────────────────────────────────
	const form = useForm({
		defaultValues: { name: "", slug: "" },
		validators: { onSubmit: createOrgSchema },
		onSubmit: async ({ value }) => {
			const result = await authClient.organization.create({
				name: value.name,
				slug: value.slug,
				logo: logoUrl ?? undefined,
			});

			if (result.error) {
				toast.error(result.error.message || "Gagal membuat organisasi");
				return;
			}

			toast.success(`Organisasi "${value.name}" berhasil dibuat`);
			// Tutup dialog dan refresh list
			handleClose();
			onCreated();
		},
	});

	// ── Reset & close ─────────────────────────────────────────────────────
	const handleClose = () => {
		if (form.state.isSubmitting || isUploading) return;
		form.reset();
		setLogoUrl(null);
		setLogoPreview(null);
		setSelectedFiles([]);
		setShowLogoUpload(false);
		setSlugManuallyEdited(false);
		control.reset();
		onOpenChange(false);
	};

	const isSubmitting = form.state.isSubmitting;

	// Subscribe name & slug untuk preview avatar dan badge slug
	const nameValue = useStore(form.store, (s) => s.values.name);
	const slugValue = useStore(form.store, (s) => s.values.slug);
	const initials = nameValue?.slice(0, 2).toUpperCase() || "ORG";

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				if (!o) handleClose();
			}}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Buat Organisasi Baru</DialogTitle>
					<DialogDescription>
						Isi detail organisasi kamu. Slug digunakan sebagai identitas unik di
						URL.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<FieldGroup className="py-1">
						{/* ── Logo organisasi ─────────────────────────────────── */}
						<div className="flex items-center gap-4">
							<div className="relative shrink-0">
								<Avatar className="h-16 w-16 rounded-xl">
									<AvatarImage src={logoPreview ?? undefined} alt="Logo" />
									<AvatarFallback className="font-semibold">
										{initials}
									</AvatarFallback>
								</Avatar>
								{logoPreview && (
									<button
										type="button"
										aria-label="Hapus logo"
										onClick={handleRemoveLogo}
										className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
									>
										<X className="h-3 w-3" />
									</button>
								)}
							</div>

							<div className="flex flex-col gap-1.5">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setShowLogoUpload((p) => !p)}
									disabled={isUploading}
								>
									<ImagePlus className="mr-1.5 h-3.5 w-3.5" />
									{logoPreview ? "Ganti Logo" : "Upload Logo"}
								</Button>
								<p className="text-muted-foreground text-xs">
									PNG, JPG, atau GIF. Maks 2 MB.
								</p>
							</div>
						</div>

						{/* Area upload logo */}
						{showLogoUpload && (
							<div className="space-y-2 rounded-md border p-3">
								<UploadDropzone
									control={control}
									accept="image/jpeg,image/png,image/gif"
								/>
								{(isUploading || control.isSettled) && (
									<UploadProgress control={control} />
								)}
								<div className="flex justify-end gap-2">
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => {
											setShowLogoUpload(false);
											setSelectedFiles([]);
											control.reset();
										}}
										disabled={isUploading}
									>
										Batal
									</Button>
									<Button
										type="button"
										size="sm"
										onClick={handleUploadLogo}
										disabled={selectedFiles.length === 0 || isUploading}
									>
										{isUploading ? "Mengupload..." : "Upload"}
									</Button>
								</div>
							</div>
						)}

						{/* ── Nama organisasi ─────────────────────────────────── */}
						<form.Field
							name="name"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Nama Organisasi
										</FieldLabel>
										<div className="relative">
											<Building2 className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<Input
												id={field.name}
												name={field.name}
												type="text"
												placeholder="Contoh: Tanisya Digital"
												className="h-11 pl-9"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => {
													const newName = e.target.value;
													field.handleChange(newName);

													// Auto-generate slug dari nama HANYA jika user
													// belum pernah mengedit slug secara manual
													if (!slugManuallyEdited) {
														form.setFieldValue("slug", toSlug(newName));
													}
												}}
												aria-invalid={isInvalid}
											/>
										</div>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>

						{/* ── Slug ────────────────────────────────────────────── */}
						<form.Field
							name="slug"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<div className="flex items-center justify-between">
											<FieldLabel htmlFor={field.name}>Slug</FieldLabel>
											{/* Tombol reset ke auto-generate */}
											{slugManuallyEdited && (
												<button
													type="button"
													onClick={() => {
														setSlugManuallyEdited(false);
														form.setFieldValue("slug", toSlug(nameValue));
													}}
													className="text-primary text-xs underline-offset-2 hover:underline"
												>
													Reset otomatis
												</button>
											)}
										</div>

										{/* Preview URL lengkap */}
										{slugValue && (
											<p className="mb-1 truncate rounded-md bg-muted px-2.5 py-1.5 font-mono text-muted-foreground text-xs">
												tanisya.com/
												<span className="font-semibold text-foreground">
													{slugValue}
												</span>
											</p>
										)}

										<div className="relative">
											<span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 select-none text-muted-foreground text-sm">
												/
											</span>
											<Input
												id={field.name}
												name={field.name}
												type="text"
												placeholder="tanisya-digital"
												className="h-11 pl-6"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => {
													// Saat user mengetik slug manual, tandai sebagai manual
													setSlugManuallyEdited(true);
													field.handleChange(
														e.target.value
															.toLowerCase()
															.replace(/[^a-z0-9-]/g, "-")
															.replace(/-+/g, "-"),
													);
												}}
												aria-invalid={isInvalid}
											/>
										</div>

										{isInvalid ? (
											<FieldError errors={field.state.meta.errors} />
										) : (
											<p className="text-muted-foreground text-xs">
												Tidak bisa diubah setelah organisasi dibuat.
											</p>
										)}
									</Field>
								);
							}}
						/>
					</FieldGroup>

					<DialogFooter className="mt-5 gap-2 sm:gap-0">
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isSubmitting || isUploading}
						>
							Batal
						</Button>
						<Button type="submit" disabled={isSubmitting || isUploading}>
							{isSubmitting ? (
								<>
									<span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
									Membuat...
								</>
							) : (
								<>
									<Plus className="mr-1.5 h-4 w-4" />
									Buat Organisasi
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
