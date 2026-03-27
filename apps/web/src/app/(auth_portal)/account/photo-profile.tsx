"use client";

import { useUploadFiles } from "@better-upload/client";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@tanisya/ui/components/avatar";
import { Button } from "@tanisya/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
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
import { Camera, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UploadDropzone } from "@/components/upload-dropzone";
import { UploadProgress } from "@/components/upload-progress";
import { authClient } from "@/lib/auth-client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PhotoProfileProps {
	userId: string;
	image?: string | null;
	name: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PhotoProfile({
	userId,
	image,
	name,
}: PhotoProfileProps) {
	const [preview, setPreview] = useState<string | null>(image ?? null);
	const [openDialog, setOpenDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Menyimpan file yang dipilih user sebelum di-upload
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

	// ─── Upload handler ──────────────────────────────────────────────────────
	// useUploadFiles selalu generic T=true (multi-file), sehingga:
	// - upload(input: File[] | FileList) — wajib ada argumen
	// - onUploadComplete: data.files adalah FileUploadInfo<'complete'>[]
	// - tidak ada .url, gunakan objectInfo.key atau URL dari server metadata
	const { control, upload, isPending } = useUploadFiles({
		route: "images",

		onError: (error) => {
			toast.error(error.message ?? "Terjadi kesalahan saat upload");
		},

		onUploadFail: ({ failedFiles }) => {
			toast.error(
				`${failedFiles.length} file gagal diupload. Silakan coba lagi.`,
			);
		},

		onUploadComplete: async ({ files, metadata }) => {
			// Server mengembalikan array URL publik via onAfterSignedUrl → metadata.urls
			const urls = metadata?.urls as string[] | undefined;
			const uploadedUrl = urls?.[0];

			if (!uploadedUrl) {
				toast.error("Gagal mendapatkan URL foto yang diupload");
				return;
			}

			await authClient.updateUser(
				{ image: uploadedUrl },
				{
					onSuccess: () => {
						setPreview(uploadedUrl);
						setSelectedFiles([]);
						setOpenDialog(false);
						toast.success("Foto profil berhasil diperbarui");
					},
					onError: (error) => {
						toast.error(error.error.message ?? error.error.statusText);
					},
				},
			);
		},
	});

	// ─── Trigger upload dengan file yang sudah dipilih ───────────────────────
	const handleUpload = () => {
		if (selectedFiles.length === 0) return;
		// upload() butuh File[] | FileList sebagai argumen pertama
		upload(selectedFiles);
	};

	// ─── Reset state dialog saat ditutup ─────────────────────────────────────
	const handleDialogOpenChange = (open: boolean) => {
		if (isPending) return; // blokir tutup dialog saat upload berjalan
		if (!open) {
			setSelectedFiles([]);
			control.reset();
		}
		setOpenDialog(open);
	};

	// ─── Delete handler ──────────────────────────────────────────────────────
	const handleDelete = async () => {
		setIsDeleting(true);
		await authClient.updateUser(
			{ image: "" },
			{
				onSuccess: () => {
					setPreview(null);
					toast.success("Foto profil berhasil dihapus");
				},
				onError: (error) => {
					toast.error(error.error.message ?? error.error.statusText);
				},
			},
		);
		setIsDeleting(false);
	};

	// ─── Derived state ───────────────────────────────────────────────────────
	const hasFilesSelected = selectedFiles.length > 0;
	const initials = name.slice(0, 2).toUpperCase();

	// ─── Render ──────────────────────────────────────────────────────────────
	return (
		<>
			{/* ── Card utama ─────────────────────────────────────────────────── */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Foto Profil</CardTitle>
					<CardDescription>
						Foto ini akan ditampilkan di profil dan seluruh platform.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<div className="flex items-center gap-6">
						{/* Avatar + tombol kamera */}
						<div className="relative shrink-0">
							<Avatar className="h-20 w-20">
								<AvatarImage src={preview ?? undefined} alt={name} />
								<AvatarFallback className="font-semibold text-lg">
									{initials}
								</AvatarFallback>
							</Avatar>

							<button
								type="button"
								aria-label="Ganti foto profil"
								onClick={() => setOpenDialog(true)}
								className="absolute right-0 bottom-0 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								<Camera className="h-3.5 w-3.5" />
							</button>
						</div>

						{/* Tombol aksi & keterangan */}
						<div className="flex flex-col gap-2">
							<div className="flex flex-wrap gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setOpenDialog(true)}
								>
									<Upload className="mr-1.5 h-3.5 w-3.5" />
									Upload Foto
								</Button>

								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="text-destructive hover:text-destructive"
									onClick={handleDelete}
									disabled={!preview || isDeleting}
								>
									<Trash2 className="mr-1.5 h-3.5 w-3.5" />
									{isDeleting ? "Menghapus..." : "Hapus"}
								</Button>
							</div>

							<p className="text-muted-foreground text-xs">
								JPG, GIF atau PNG. Maks 2 MB.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* ── Dialog upload ───────────────────────────────────────────────── */}
			<Dialog open={openDialog} onOpenChange={handleDialogOpenChange}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Unggah Foto Profil</DialogTitle>
						<DialogDescription>
							Pilih atau seret foto ke area di bawah. JPG, GIF, atau PNG — maks
							2 MB.
						</DialogDescription>
					</DialogHeader>

					{/*
					  UploadDropzone adalah komponen lokal. Sesuaikan prop onFilesSelected
					  (atau nama prop lain sesuai implementasimu) agar file yang dipilih
					  disimpan ke state selectedFiles — sehingga bisa diteruskan ke upload().
					*/}
					<UploadDropzone
						control={control}
						accept="image/jpeg,image/png,image/gif"
					/>

					{/* Progress — tampil hanya saat upload berjalan */}
					{(isPending || control.isSettled) && (
						<UploadProgress control={control} />
					)}

					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							type="button"
							variant="outline"
							onClick={() => handleDialogOpenChange(false)}
							disabled={isPending}
						>
							Batal
						</Button>

						<Button
							type="button"
							onClick={handleUpload}
							disabled={!hasFilesSelected || isPending}
						>
							{isPending ? "Mengupload..." : "Upload"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
