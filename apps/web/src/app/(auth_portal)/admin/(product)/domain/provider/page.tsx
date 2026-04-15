"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoaderCircleIcon, PlusIcon, TrashIcon, EditIcon } from "lucide-react";
import { toast } from "sonner";

import { SidebarPageHeader } from "@/components/sidebar-page-header";
import { client, orpc } from "@/utils/orpc";
import { Badge } from "@tanisya/ui/components/badge";
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
	FieldDescription,
	FieldLabel,
} from "@tanisya/ui/components/field";
import { Input } from "@tanisya/ui/components/input";
import { Skeleton } from "@tanisya/ui/components/skeleton";
import { Switch } from "@tanisya/ui/components/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@tanisya/ui/components/table";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@tanisya/ui/components/sheet";

export default function DomainProviderManagementPage() {
	const [isSheetOpen, setIsSheetOpen] = React.useState(false);
	
	const defaultFormState = {
		id: "",
		code: "",
		name: "",
		providerCode: "rdash",
		isDefault: false,
		isActive: true,
		resellerId: "",
		apiKey: "",
		baseUrl: "",
	};

	const [form, setForm] = React.useState(defaultFormState);
	
	const providersQuery = useQuery({
		...orpc.domain.config.listSourceAccounts.queryOptions(),
	});

	const upsertMutation = useMutation({
		mutationFn: async (payload: typeof form) => {
			return await client.domain.config.upsertSourceAccount({
				id: payload.id || undefined,
				code: payload.code.trim(),
				name: payload.name.trim(),
				providerCode: payload.providerCode.trim() || "rdash",
				isDefault: payload.isDefault,
				isActive: payload.isActive,
				credentials: {
					resellerId: payload.resellerId.trim(),
					apiKey: payload.apiKey.trim(),
					baseUrl: payload.baseUrl.trim() || undefined,
				},
			});
		},
		onSuccess: () => {
			toast.success("Provider berhasil disimpan.");
			setIsSheetOpen(false);
			providersQuery.refetch();
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Gagal menyimpan akun provider.",
			);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			return await client.domain.config.deleteSourceAccount({ id });
		},
		onSuccess: () => {
			toast.success("Provider berhasil dihapus.");
			providersQuery.refetch();
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Gagal menghapus akun provider.",
			);
		},
	});

	function handleEdit(provider: any) {
		let creds = { resellerId: "", apiKey: "", baseUrl: "" };
		try {
			if (provider.credentials) creds = JSON.parse(provider.credentials);
		} catch {}

		setForm({
			id: provider.id,
			code: provider.code,
			name: provider.name,
			providerCode: provider.providerCode,
			isDefault: provider.isDefault,
			isActive: provider.isActive,
			resellerId: creds.resellerId || "",
			apiKey: creds.apiKey || "",
			baseUrl: creds.baseUrl || "",
		});
		setIsSheetOpen(true);
	}

	function handleAdd() {
		setForm(defaultFormState);
		setIsSheetOpen(true);
	}

	return (
		<div className="flex flex-1 flex-col pb-16">
			<SidebarPageHeader items={[
				{ label: "Admin", href: "/admin" },
				{ label: "Domain", href: "/admin/domain" },
				{ label: "Provider" }
			]} />
			<div className="container-main mt-4 flex flex-col gap-6">
				<Card>
					<CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<div>
							<CardTitle>Daftar Provider API</CardTitle>
							<CardDescription className="mt-1">
								Atur penyedia (*Domain Source Account*) untuk sinkronisasi harga produk domain secara dinamis.
							</CardDescription>
						</div>
						<Button onClick={handleAdd}>
							<PlusIcon className="me-2 size-4" /> Tambah Provider
						</Button>
					</CardHeader>

					<CardContent>
						{providersQuery.isPending ? (
							<div className="flex flex-col gap-3">
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-10 w-full" />
							</div>
						) : providersQuery.isError ? (
							<div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-destructive px-6 text-center">
								<h2 className="text-base font-semibold text-destructive">
									Gagal Memuat Data Provider
								</h2>
								<p className="mt-1 text-sm text-muted-foreground">
									{providersQuery.error?.message}
								</p>
							</div>
						) : providersQuery.data?.length === 0 ? (
							<div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed px-6 text-center">
								<h2 className="text-base font-semibold">
									Belum ada akun provider
								</h2>
								<p className="mt-1 max-w-md text-sm text-muted-foreground">
									Daftarkan setidaknya satu provider agar produk domain dapat di-sinkronisasikan harganya.
								</p>
							</div>
						) : (
							<div className="overflow-hidden rounded-lg border">
								<Table>
									<TableHeader className="bg-muted">
										<TableRow>
											<TableHead className="w-16">No</TableHead>
											<TableHead>Kode Pemasok</TableHead>
											<TableHead>Nama Provider</TableHead>
											<TableHead>Tipe</TableHead>
											<TableHead>Status</TableHead>
											<TableHead className="text-right">Aksi</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{providersQuery.data?.map((item, i) => (
											<TableRow key={item.id}>
												<TableCell>{i + 1}</TableCell>
												<TableCell className="font-medium whitespace-nowrap">
													<div className="flex items-center gap-2">
														{item.code}
														{item.isDefault && (
															<Badge variant="default" className="text-[10px] px-1.5 py-0">
																Default
															</Badge>
														)}
													</div>
													<div className="text-xs text-muted-foreground font-mono mt-1">
														{item.id}
													</div>
												</TableCell>
												<TableCell>{item.name}</TableCell>
												<TableCell className="uppercase">{item.providerCode}</TableCell>
												<TableCell>
													<Badge
														variant={item.isActive ? "default" : "secondary"}
													>
														{item.isActive ? "Aktif" : "Nonaktif"}
													</Badge>
												</TableCell>
												<TableCell className="text-right">
													<div className="flex items-center justify-end gap-2">
														<Button
															variant="outline"
															size="icon-sm"
															onClick={() => handleEdit(item)}
														>
															<EditIcon />
														</Button>
														<Button
															variant="destructive"
															size="icon-sm"
															disabled={deleteMutation.isPending}
															onClick={() => {
																if (confirm("Hapus akun provider ini?")) {
																	deleteMutation.mutate(item.id);
																}
															}}
														>
															<TrashIcon />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
				<SheetContent className="flex flex-col h-full bg-background overflow-y-auto sm:max-w-md">
					<SheetHeader className="pb-4 border-b">
						<SheetTitle>
							{form.id ? "Edit Provider" : "Daftarkan Provider Baru"}
						</SheetTitle>
						<SheetDescription>
							Informasi API untuk {form.code || "provider baru"}
						</SheetDescription>
					</SheetHeader>

					<div className="flex flex-col gap-6 px-4 py-6 flex-1 overflow-y-auto">
						<Field>
							<FieldLabel>Kode Pemasok (Unik)</FieldLabel>
							<Input
								placeholder="contoh: rdash-primary"
								value={form.code}
								onChange={(e) =>
									setForm({ ...form, code: e.target.value })
								}
								disabled={upsertMutation.isPending}
							/>
							<FieldDescription>Identifier ringkas untuk API provider.</FieldDescription>
						</Field>

						<Field>
							<FieldLabel>Nama Tampilan Provider</FieldLabel>
							<Input
								placeholder="contoh: R-Dash Utama Backend"
								value={form.name}
								onChange={(e) =>
									setForm({ ...form, name: e.target.value })
								}
								disabled={upsertMutation.isPending}
							/>
						</Field>

						<div className="grid grid-cols-2 gap-4">
							<Field className="flex items-center justify-between rounded-lg border p-3 border-border">
								<div className="space-y-0.5">
									<FieldLabel className="text-sm">Default</FieldLabel>
								</div>
								<Switch
									checked={form.isDefault}
									onCheckedChange={(checked) =>
										setForm({ ...form, isDefault: checked })
									}
									disabled={upsertMutation.isPending}
								/>
							</Field>
							<Field className="flex items-center justify-between rounded-lg border p-3 border-border">
								<div className="space-y-0.5">
									<FieldLabel className="text-sm">Aktif</FieldLabel>
								</div>
								<Switch
									checked={form.isActive}
									onCheckedChange={(checked) =>
										setForm({ ...form, isActive: checked })
									}
									disabled={upsertMutation.isPending}
								/>
							</Field>
						</div>

						<div className="w-full h-px bg-border my-2" />

						<Field>
							<FieldLabel>Reseller ID API</FieldLabel>
							<Input
								placeholder="Reseller ID dari dashboard"
								value={form.resellerId}
								onChange={(e) =>
									setForm({ ...form, resellerId: e.target.value })
								}
								disabled={upsertMutation.isPending}
							/>
						</Field>

						<Field>
							<FieldLabel>API Key</FieldLabel>
							<Input
								type="password"
								placeholder="Masukkan secret API Key"
								value={form.apiKey}
								onChange={(e) =>
									setForm({ ...form, apiKey: e.target.value })
								}
								disabled={upsertMutation.isPending}
							/>
						</Field>

						<Field>
							<FieldLabel>Custom Base URL API</FieldLabel>
							<Input
								placeholder="Default: https://api.rdash.id/v1"
								value={form.baseUrl}
								onChange={(e) =>
									setForm({ ...form, baseUrl: e.target.value })
								}
								disabled={upsertMutation.isPending}
							/>
							<FieldDescription>Kosongkan untuk menggunakan base URL API default rDash.</FieldDescription>
						</Field>
					</div>

					<div className="border-t p-4 flex gap-3 justify-end mt-auto bg-muted">
						<Button
							variant="outline"
							onClick={() => setIsSheetOpen(false)}
							disabled={upsertMutation.isPending}
						>
							Batal
						</Button>
						<Button
							onClick={() => upsertMutation.mutate(form)}
							disabled={
								!form.code ||
								!form.name ||
								!form.resellerId ||
								!form.apiKey ||
								upsertMutation.isPending
							}
						>
							{upsertMutation.isPending ? (
								<LoaderCircleIcon className="animate-spin" />
							) : (
								"Simpan Provider"
							)}
						</Button>
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
