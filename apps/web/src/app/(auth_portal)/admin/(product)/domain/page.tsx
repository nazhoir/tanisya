"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	CheckIcon,
	RefreshCwIcon,
	SearchIcon,
	ShieldCheckIcon,
	UploadIcon,
} from "lucide-react";
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
	FieldGroup,
	FieldLabel,
} from "@tanisya/ui/components/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@tanisya/ui/components/input-group";
import { Skeleton } from "@tanisya/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@tanisya/ui/components/table";

type ProviderFormState = {
	organizationId: string;
	productId: string;
	domainSourceAccountId: string;
};

type ProviderPriceItem = {
	id: number;
	registry_id: number | null;
	domain_extension: {
		id: number;
		extension: string;
		status: number;
		status_label: string;
		status_badge: string;
		sell_option: number;
		enable_whois_protection: number;
		enable_whois_protection_label: string;
		enable_whois_protection_badge: string;
		registry_id: number | null;
		registry_name: string | null;
	};
	currency: string;
	registration: Record<string, string | number>;
	renewal: Record<string, string | number>;
	transfer: string | number;
	redemption: string | number;
	proxy: string | number;
	promo_registration?: {
		registration: Record<string, string | number>;
		description: string;
	} | null;
};

type ProviderPriceListResult = {
	data: ProviderPriceItem[];
	links: {
		first: string | null;
		last: string | null;
		prev: string | null;
		next: string | null;
	};
	meta: {
		current_page: number;
		last_page: number;
		per_page: number;
		total: number;
	};
};

function toNumber(value: string | number | bigint | null | undefined) {
	if (typeof value === "number") return value;
	if (typeof value === "bigint") return Number(value);
	if (typeof value === "string") {
		const parsed = Number(value);
		return Number.isNaN(parsed) ? 0 : parsed;
	}
	return 0;
}

function formatCurrency(amount: string | number, currency: string) {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: currency || "IDR",
		maximumFractionDigits: 0,
	}).format(toNumber(amount));
}

function firstYearPrice(map: Record<string, string | number>) {
	return map["1"] ?? 0;
}

export default function Page() {
	const [form, setForm] = React.useState<ProviderFormState>({
		organizationId: "",
		productId: "",
		domainSourceAccountId: "",
	});

	const [validatedProviderId, setValidatedProviderId] = React.useState<
		string | null
	>(null);
	const [activeConfig, setActiveConfig] =
		React.useState<ProviderFormState | null>(null);
	const [page, setPage] = React.useState(1);
	const [selectedIds, setSelectedIds] = React.useState<number[]>([]);

	const isConfigReady =
		form.organizationId.trim() !== "" &&
		form.productId.trim() !== "" &&
		form.domainSourceAccountId.trim() !== "";

	const validateProviderMutation = useMutation({
		mutationFn: async (input: { domainSourceAccountId: string }) => {
			return await client.domain.catalog.validateProvider(input);
		},
		onSuccess: (result) => {
			setValidatedProviderId(result.providerId);
			toast.success(result.message);
		},
		onError: (error) => {
			setValidatedProviderId(null);
			toast.error(
				error instanceof Error
					? error.message
					: "Validasi provider gagal.",
			);
		},
	});

	const providerPricesQuery = useQuery<ProviderPriceListResult>({
		...orpc.domain.catalog.listProviderPrices.queryOptions({
			input: {
				domainSourceAccountId: activeConfig?.domainSourceAccountId ?? "",
				page,
				limit: 25,
			},
		}),
		enabled:
			Boolean(activeConfig?.domainSourceAccountId) &&
			validatedProviderId === activeConfig?.domainSourceAccountId,
	});

	const localPricesQuery = useQuery({
		...orpc.domain.catalog.listLocalPrices.queryOptions({
			input: {
				organizationId: activeConfig?.organizationId ?? "",
				productId: activeConfig?.productId ?? "",
				domainSourceAccountId: activeConfig?.domainSourceAccountId ?? "",
				limit: 100,
			},
		}),
		enabled:
			Boolean(activeConfig?.organizationId) &&
			Boolean(activeConfig?.productId) &&
			Boolean(activeConfig?.domainSourceAccountId) &&
			validatedProviderId === activeConfig?.domainSourceAccountId,
	});

	const saveSelectedMutation = useMutation({
		mutationFn: async (input: {
			organizationId: string;
			productId: string;
			domainSourceAccountId: string;
			selectedProviderPriceIds: number[];
		}) => {
			return await client.domain.catalog.saveSelectedProviderPrices(input);
		},
		onSuccess: async (result) => {
			toast.success(
				`${result.selectedDomainCount} domain dipilih berhasil disimpan. ${result.savedRowCount} baris harga diperbarui.`,
			);
			setSelectedIds([]);
			await localPricesQuery.refetch();
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Gagal menyimpan domain terpilih.",
			);
		},
	});

	const syncMutation = useMutation({
		mutationFn: async (input: {
			organizationId: string;
			productId: string;
			domainSourceAccountId: string;
		}) => {
			return await client.domain.catalog.syncProviderPrices(input);
		},
		onSuccess: async (result) => {
			toast.success(
				`Sinkronisasi selesai. ${result.domainCount} domain provider diproses dan ${result.updatedRowCount} baris harga diperbarui.`,
			);
			await localPricesQuery.refetch();
			await providerPricesQuery.refetch();
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Gagal sinkronisasi harga provider.",
			);
		},
	});

	const providerRows = providerPricesQuery.data?.data ?? [];
	const localRows = localPricesQuery.data ?? [];

	const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);

	const allVisibleSelected =
		providerRows.length > 0 &&
		providerRows.every((item) => selectedSet.has(item.id));

	function resetValidationState() {
		setValidatedProviderId(null);
		setActiveConfig(null);
		setPage(1);
		setSelectedIds([]);
	}

	function handleInputChange(
		key: keyof ProviderFormState,
		value: string,
	) {
		setForm((prev) => ({ ...prev, [key]: value }));
		resetValidationState();
	}

	function handleValidateProvider() {
		if (!form.domainSourceAccountId.trim()) {
			toast.error("Provider ID wajib diisi.");
			return;
		}

		validateProviderMutation.mutate({
			domainSourceAccountId: form.domainSourceAccountId.trim(),
		});
	}

	function handleLoadProviderDomains() {
		if (!isConfigReady) {
			toast.error("Organization ID, Product ID, dan Provider ID wajib diisi.");
			return;
		}

		if (validatedProviderId !== form.domainSourceAccountId.trim()) {
			toast.error("Validasi provider terlebih dahulu sebelum memuat data.");
			return;
		}

		setSelectedIds([]);
		setPage(1);
		setActiveConfig({
			organizationId: form.organizationId.trim(),
			productId: form.productId.trim(),
			domainSourceAccountId: form.domainSourceAccountId.trim(),
		});
	}

	function toggleRow(id: number) {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
		);
	}

	function toggleSelectAllVisible() {
		if (allVisibleSelected) {
			setSelectedIds((prev) =>
				prev.filter((id) => !providerRows.some((item) => item.id === id)),
			);
			return;
		}

		setSelectedIds((prev) => {
			const next = new Set(prev);
			for (const item of providerRows) next.add(item.id);
			return Array.from(next);
		});
	}

	function handleSaveSelected() {
		if (!activeConfig) {
			toast.error("Muat data provider terlebih dahulu.");
			return;
		}

		if (selectedIds.length === 0) {
			toast.error("Pilih minimal satu domain untuk disimpan.");
			return;
		}

		saveSelectedMutation.mutate({
			organizationId: activeConfig.organizationId,
			productId: activeConfig.productId,
			domainSourceAccountId: activeConfig.domainSourceAccountId,
			selectedProviderPriceIds: selectedIds,
		});
	}

	function handleSyncAll() {
		if (!activeConfig) {
			toast.error("Muat data provider terlebih dahulu.");
			return;
		}

		syncMutation.mutate({
			organizationId: activeConfig.organizationId,
			productId: activeConfig.productId,
			domainSourceAccountId: activeConfig.domainSourceAccountId,
		});
	}

	return (
		<>
			<SidebarPageHeader
				items={[
					{ label: "Manajemen", href: "/admin" },
					{ label: "Sinkronisasi Harga Domain" },
				]}
			/>

			<div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-bold tracking-tight">
						Sinkronisasi Provider dan Harga Domain
					</h1>
					<p className="text-sm text-muted-foreground">
						Validasi provider, muat daftar domain dari provider, pilih domain
						yang ingin disimpan, lalu update harga lokal sekali klik.
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Konfigurasi Sinkronisasi</CardTitle>
						<CardDescription>
							Provider harus sudah dibuat manual terlebih dahulu di database.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<FieldGroup>
							<div className="grid gap-4 md:grid-cols-3">
								<Field>
									<FieldLabel htmlFor="organizationId">
										Organization ID
									</FieldLabel>
									<InputGroup>
										<InputGroupInput
											id="organizationId"
											value={form.organizationId}
											onChange={(event) =>
												handleInputChange("organizationId", event.target.value)
											}
											placeholder="org_xxx"
										/>
									</InputGroup>
								</Field>

								<Field>
									<FieldLabel htmlFor="productId">Product ID</FieldLabel>
									<InputGroup>
										<InputGroupInput
											id="productId"
											value={form.productId}
											onChange={(event) =>
												handleInputChange("productId", event.target.value)
											}
											placeholder="prd_xxx"
										/>
									</InputGroup>
								</Field>

								<Field>
									<FieldLabel htmlFor="domainSourceAccountId">
										Provider ID
									</FieldLabel>
									<InputGroup>
										<InputGroupInput
											id="domainSourceAccountId"
											value={form.domainSourceAccountId}
											onChange={(event) =>
												handleInputChange(
													"domainSourceAccountId",
													event.target.value,
												)
											}
											placeholder="src_xxx"
										/>
										<InputGroupAddon>
											<ShieldCheckIcon />
										</InputGroupAddon>
									</InputGroup>
									<FieldDescription>
										Gunakan ID provider yang sudah dibuat manual di database.
									</FieldDescription>
								</Field>
							</div>

							<div className="flex flex-col gap-2 sm:flex-row">
								<Button
									type="button"
									variant="outline"
									onClick={handleValidateProvider}
									disabled={
										validateProviderMutation.isPending ||
										!form.domainSourceAccountId.trim()
									}
								>
									<ShieldCheckIcon data-icon="inline-start" />
									{validateProviderMutation.isPending
										? "Memvalidasi..."
										: "Validasi Provider"}
								</Button>

								<Button
									type="button"
									onClick={handleLoadProviderDomains}
									disabled={
										!isConfigReady ||
										validatedProviderId !== form.domainSourceAccountId.trim()
									}
								>
									<SearchIcon data-icon="inline-start" />
									Load Domain dari Provider
								</Button>

								<Button
									type="button"
									variant="outline"
									onClick={handleSyncAll}
									disabled={
										!activeConfig ||
										syncMutation.isPending ||
										saveSelectedMutation.isPending
									}
								>
									<RefreshCwIcon
										data-icon="inline-start"
										className={syncMutation.isPending ? "animate-spin" : undefined}
									/>
									{syncMutation.isPending ? "Mengupdate..." : "Update Harga"}
								</Button>
							</div>

							{validatedProviderId === form.domainSourceAccountId.trim() ? (
								<div className="rounded-lg border px-4 py-3">
									<div className="flex items-center gap-2 text-sm font-medium">
										<CheckIcon />
										Provider valid dan siap digunakan
									</div>
								</div>
							) : null}
						</FieldGroup>
					</CardContent>
				</Card>

				<div className="grid gap-4 lg:grid-cols-3">
					<Card>
						<CardHeader className="pb-3">
							<CardDescription>Domain Provider di Halaman Ini</CardDescription>
							<CardTitle className="text-3xl">
								{providerRows.length}
							</CardTitle>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardDescription>Dipilih untuk Disimpan</CardDescription>
							<CardTitle className="text-3xl">{selectedIds.length}</CardTitle>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardDescription>Baris Harga Lokal</CardDescription>
							<CardTitle className="text-3xl">{localRows.length}</CardTitle>
						</CardHeader>
					</Card>
				</div>

				<Card>
					<CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<div className="flex flex-col gap-1">
							<CardTitle>Daftar Domain dari Provider</CardTitle>
							<CardDescription>
								Pilih domain yang ingin disimpan ke database lokal.
							</CardDescription>
						</div>

						<div className="flex flex-col gap-2 sm:flex-row">
							<Button
								type="button"
								variant="outline"
								onClick={toggleSelectAllVisible}
								disabled={providerRows.length === 0}
							>
								{allVisibleSelected ? "Batal Pilih Semua" : "Pilih Semua Halaman"}
							</Button>

							<Button
								type="button"
								onClick={handleSaveSelected}
								disabled={
									selectedIds.length === 0 ||
									saveSelectedMutation.isPending ||
									syncMutation.isPending
								}
							>
								<UploadIcon data-icon="inline-start" />
								{saveSelectedMutation.isPending
									? "Menyimpan..."
									: "Simpan Domain Terpilih"}
							</Button>
						</div>
					</CardHeader>

					<CardContent>
						{providerPricesQuery.isPending ? (
							<div className="flex flex-col gap-3">
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-10 w-full" />
							</div>
						) : providerPricesQuery.isError ? (
							<div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-destructive px-6 text-center">
								<h2 className="text-base font-semibold text-destructive">
									Gagal Memuat Domain dari Provider
								</h2>
								<p className="mt-1 max-w-md text-sm text-muted-foreground">
									{(providerPricesQuery.error instanceof Error ? providerPricesQuery.error.message : "Terjadi kesalahan yang tidak diketahui.").replace("INTERNAL_SERVER_ERROR:", "").trim()}
								</p>
								<Button 
									variant="outline" 
									size="sm" 
									className="mt-4"
									onClick={() => providerPricesQuery.refetch()}
								>
									Coba Lagi
								</Button>
							</div>
						) : providerRows.length === 0 ? (
							<div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed px-6 text-center">
								<h2 className="text-base font-semibold">
									Belum ada domain provider yang dimuat
								</h2>
								<p className="mt-1 max-w-md text-sm text-muted-foreground">
									Validasi provider terlebih dahulu lalu klik Load Domain dari
									Provider.
								</p>
							</div>
						) : (
							<div className="overflow-hidden rounded-lg border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-12">
												<input
													type="checkbox"
													checked={allVisibleSelected}
													onChange={toggleSelectAllVisible}
												/>
											</TableHead>
											<TableHead>Ekstensi</TableHead>
											<TableHead>Registry</TableHead>
											<TableHead>Registrasi 1 Tahun</TableHead>
											<TableHead>Renewal 1 Tahun</TableHead>
											<TableHead>Transfer</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Promo</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{providerRows.map((item) => (
											<TableRow key={item.id}>
												<TableCell>
													<input
														type="checkbox"
														checked={selectedSet.has(item.id)}
														onChange={() => toggleRow(item.id)}
													/>
												</TableCell>
												<TableCell>
													<div className="flex flex-col gap-1">
														<span className="font-medium">
															{item.domain_extension.extension}
														</span>
														<span className="text-xs text-muted-foreground">
															Provider ID: {item.id}
														</span>
													</div>
												</TableCell>
												<TableCell>
													{item.domain_extension.registry_name ?? "-"}
												</TableCell>
												<TableCell>
													{formatCurrency(
														firstYearPrice(item.registration),
														item.currency,
													)}
												</TableCell>
												<TableCell>
													{formatCurrency(
														firstYearPrice(item.renewal),
														item.currency,
													)}
												</TableCell>
												<TableCell>
													{formatCurrency(item.transfer, item.currency)}
												</TableCell>
												<TableCell>
													<Badge
														variant={
															item.domain_extension.status === 1
																? "default"
																: "secondary"
														}
													>
														{item.domain_extension.status_label}
													</Badge>
												</TableCell>
												<TableCell>
													{item.promo_registration ? (
														<Badge variant="outline">Promo</Badge>
													) : (
														<Badge variant="secondary">Normal</Badge>
													)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}

						{providerPricesQuery.data ? (
							<div className="mt-4 flex items-center justify-between gap-4">
								<p className="text-sm text-muted-foreground">
									Halaman {providerPricesQuery.data.meta.current_page} dari{" "}
									{providerPricesQuery.data.meta.last_page} · Total{" "}
									{providerPricesQuery.data.meta.total} domain
								</p>

								<div className="flex gap-2">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => setPage((prev) => Math.max(1, prev - 1))}
										disabled={
											page <= 1 || providerPricesQuery.isFetching
										}
									>
										Sebelumnya
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() =>
											setPage((prev) =>
												Math.min(
													providerPricesQuery.data.meta.last_page,
													prev + 1,
												),
											)
										}
										disabled={
											page >= providerPricesQuery.data.meta.last_page ||
											providerPricesQuery.isFetching
										}
									>
										Berikutnya
									</Button>
								</div>
							</div>
						) : null}
					</CardContent>
				</Card>
			</div>
		</>
	);
}