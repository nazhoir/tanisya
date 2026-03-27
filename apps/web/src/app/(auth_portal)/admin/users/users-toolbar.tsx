"use client";

import { Badge } from "@tanisya/ui/components/badge";
import { Button } from "@tanisya/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@tanisya/ui/components/dropdown-menu";
import { Input } from "@tanisya/ui/components/input";
import { Label } from "@tanisya/ui/components/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@tanisya/ui/components/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@tanisya/ui/components/select";
import { Separator } from "@tanisya/ui/components/separator";
import {
	ArrowUpDown,
	ChevronLeft,
	ChevronRight,
	Loader2,
	Search,
	SlidersHorizontal,
	Users,
	X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import type { SearchParams } from "./page";

type Props = {
	total: number;
	currentParams: SearchParams;
	limit: number;
	offset: number;
};

// ─── Hook: push URL params ────────────────────────────────────────────────────

function useUpdateParams() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useSearchParams();
	const [pending, startTransition] = useTransition();

	const update = useCallback(
		(updates: Record<string, string | undefined>) => {
			const next = new URLSearchParams(params.toString());

			for (const [key, val] of Object.entries(updates)) {
				if (val === undefined || val === "") {
					next.delete(key);
				} else {
					next.set(key, val);
				}
			}

			// Reset offset setiap kali filter/search berubah (kecuali offset sendiri)
			if (!("offset" in updates)) next.delete("offset");

			startTransition(() => {
				router.push(`${pathname}?${next.toString()}` as any);
			});
		},
		[router, pathname, params],
	);

	return { update, pending };
}

// ─── UsersToolbar ─────────────────────────────────────────────────────────────

export function UsersToolbar({ total, currentParams, limit, offset }: Props) {
	const { update, pending } = useUpdateParams();

	// Local state untuk input search (debounce manual)
	const [searchDraft, setSearchDraft] = useState(currentParams.q ?? "");
	const [filterOpen, setFilterOpen] = useState(false);

	// Filter local state (sebelum di-apply)
	const [filterField, setFilterField] = useState(
		currentParams.filterField ?? "email",
	);
	const [filterValue, setFilterValue] = useState(
		currentParams.filterValue ?? "",
	);
	const [filterOperator, setFilterOperator] = useState(
		currentParams.filterOperator ?? "eq",
	);

	// ── Search (Enter / blur)
	const applySearch = () => {
		update({
			q: searchDraft || undefined,
			searchField: currentParams.searchField,
		});
	};

	// ── Clear semua filter
	const clearAll = () => {
		setSearchDraft("");
		setFilterField("email");
		setFilterValue("");
		setFilterOperator("eq");
		update({
			q: undefined,
			searchField: undefined,
			filterField: undefined,
			filterValue: undefined,
			filterOperator: undefined,
			sortBy: undefined,
			sortDirection: undefined,
			offset: undefined,
		});
	};

	// ── Apply filter
	const applyFilter = () => {
		update({
			filterField: filterValue ? filterField : undefined,
			filterValue: filterValue || undefined,
			filterOperator: filterValue ? filterOperator : undefined,
		});
		setFilterOpen(false);
	};

	// ── Pagination
	const page = Math.floor(offset / limit) + 1;
	const totalPages = Math.ceil(total / limit);
	const hasPrev = offset > 0;
	const hasNext = offset + limit < total;

	const hasActiveFilter = !!(currentParams.q || currentParams.filterValue);

	return (
		<div className="flex flex-col gap-3">
			{/* Row 1: search + sort + filter */}
			<div className="flex flex-wrap items-center gap-2">
				{/* Search input */}
				<div className="relative min-w-48 max-w-sm flex-1">
					<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					{pending && (
						<Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
					)}
					<Input
						placeholder="Cari pengguna..."
						className="pr-9 pl-9"
						value={searchDraft}
						onChange={(e) => setSearchDraft(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && applySearch()}
						onBlur={applySearch}
					/>
				</div>

				{/* Search field toggle */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm" className="shrink-0 gap-1.5">
							<span className="text-muted-foreground text-xs">di:</span>
							<span className="font-medium capitalize">
								{currentParams.searchField === "email" ? "Email" : "Nama"}
							</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start">
						<DropdownMenuLabel>Cari berdasarkan</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuRadioGroup
							value={currentParams.searchField ?? "name"}
							onValueChange={(v) =>
								update({ searchField: v, q: searchDraft || undefined })
							}
						>
							<DropdownMenuRadioItem value="name">Nama</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="email">Email</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>

				<Separator orientation="vertical" className="hidden h-6 sm:block" />

				{/* Filter popover */}
				<Popover open={filterOpen} onOpenChange={setFilterOpen}>
					<PopoverTrigger asChild>
						<Button
							variant={currentParams.filterValue ? "default" : "outline"}
							size="sm"
							className="shrink-0 gap-2"
						>
							<SlidersHorizontal className="h-4 w-4" />
							Filter
							{currentParams.filterValue && (
								<Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
									1
								</Badge>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-80" align="start">
						<div className="space-y-4">
							<div>
								<h4 className="font-semibold text-sm">Filter Pengguna</h4>
								<p className="mt-0.5 text-muted-foreground text-xs">
									Saring pengguna berdasarkan field tertentu
								</p>
							</div>

							<div className="space-y-3">
								{/* Filter field */}
								<div className="space-y-1.5">
									<Label className="text-xs">Field</Label>
									<Select
										value={filterField}
										onValueChange={(v) => setFilterField(v as any)}
									>
										<SelectTrigger className="h-8 text-sm">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="email">Email</SelectItem>
											<SelectItem value="role">Role</SelectItem>
											<SelectItem value="emailVerified">
												Status Verifikasi
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Operator */}
								<div className="space-y-1.5">
									<Label className="text-xs">Operator</Label>
									<Select
										value={filterOperator}
										onValueChange={(v) => setFilterOperator(v as any)}
									>
										<SelectTrigger className="h-8 text-sm">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="eq">Sama dengan (=)</SelectItem>
											<SelectItem value="contains">Mengandung</SelectItem>
											<SelectItem value="starts_with">
												Dimulai dengan
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Value */}
								<div className="space-y-1.5">
									<Label className="text-xs">Nilai</Label>
									{filterField === "emailVerified" ? (
										<Select value={filterValue} onValueChange={setFilterValue}>
											<SelectTrigger className="h-8 text-sm">
												<SelectValue placeholder="Pilih status..." />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="true">Terverifikasi</SelectItem>
												<SelectItem value="false">
													Belum Terverifikasi
												</SelectItem>
											</SelectContent>
										</Select>
									) : (
										<Input
											className="h-8 text-sm"
											placeholder={`Masukkan ${filterField}...`}
											value={filterValue}
											onChange={(e) => setFilterValue(e.target.value)}
											onKeyDown={(e) => e.key === "Enter" && applyFilter()}
										/>
									)}
								</div>
							</div>

							<div className="flex gap-2 pt-1">
								<Button
									variant="ghost"
									size="sm"
									className="flex-1"
									onClick={() => {
										setFilterValue("");
										update({
											filterField: undefined,
											filterValue: undefined,
											filterOperator: undefined,
										});
										setFilterOpen(false);
									}}
								>
									Reset
								</Button>
								<Button size="sm" className="flex-1" onClick={applyFilter}>
									Terapkan
								</Button>
							</div>
						</div>
					</PopoverContent>
				</Popover>

				{/* Sort */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant={currentParams.sortBy ? "default" : "outline"}
							size="sm"
							className="shrink-0 gap-2"
						>
							<ArrowUpDown className="h-4 w-4" />
							Urutkan
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-52">
						<DropdownMenuLabel>Urutkan berdasarkan</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{(
							[
								["name", "Nama"],
								["email", "Email"],
								["createdAt", "Tanggal Bergabung"],
							] as const
						).map(([val, label]) => (
							<DropdownMenu key={val}>
								<DropdownMenuTrigger asChild>
									<DropdownMenuItem className="cursor-pointer justify-between">
										{label}
										{currentParams.sortBy === val && (
											<span className="text-muted-foreground text-xs">
												{currentParams.sortDirection === "desc" ? "↓" : "↑"}
											</span>
										)}
									</DropdownMenuItem>
								</DropdownMenuTrigger>
							</DropdownMenu>
						))}
						<DropdownMenuSeparator />
						{/* Sort field + direction combined */}
						{(
							[
								["name", "asc", "Nama A–Z"],
								["name", "desc", "Nama Z–A"],
								["email", "asc", "Email A–Z"],
								["email", "desc", "Email Z–A"],
								["createdAt", "desc", "Terbaru"],
								["createdAt", "asc", "Terlama"],
							] as const
						).map(([field, dir, label]) => (
							<DropdownMenuRadioGroup
								key={`${field}-${dir}`}
								value={`${currentParams.sortBy}-${currentParams.sortDirection}`}
								onValueChange={() =>
									update({ sortBy: field, sortDirection: dir })
								}
							>
								<DropdownMenuRadioItem value={`${field}-${dir}`}>
									{label}
								</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
						))}
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() =>
								update({ sortBy: undefined, sortDirection: undefined })
							}
							className="text-muted-foreground text-xs"
						>
							Reset urutan
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				{/* Clear all */}
				{hasActiveFilter && (
					<Button
						variant="ghost"
						size="sm"
						onClick={clearAll}
						className="shrink-0 gap-1.5 text-muted-foreground"
					>
						<X className="h-3.5 w-3.5" /> Hapus Filter
					</Button>
				)}

				{/* Total count */}
				<Badge
					variant="secondary"
					className="ml-auto shrink-0 gap-1.5 font-normal"
				>
					<Users className="h-3.5 w-3.5" />
					{total.toLocaleString("id-ID")} pengguna
				</Badge>
			</div>

			{/* Active filter badges */}
			{hasActiveFilter && (
				<div className="flex flex-wrap gap-2">
					{currentParams.q && (
						<Badge
							variant="outline"
							className="gap-1.5 pr-1 font-normal text-xs"
						>
							Cari "{currentParams.q}"
							<button
								onClick={() => {
									setSearchDraft("");
									update({ q: undefined });
								}}
								className="ml-1 transition-colors hover:text-destructive"
							>
								<X className="h-3 w-3" />
							</button>
						</Badge>
					)}
					{currentParams.filterValue && (
						<Badge
							variant="outline"
							className="gap-1.5 pr-1 font-normal text-xs"
						>
							{currentParams.filterField} {currentParams.filterOperator} "
							{currentParams.filterValue}"
							<button
								onClick={() =>
									update({
										filterField: undefined,
										filterValue: undefined,
										filterOperator: undefined,
									})
								}
								className="ml-1 transition-colors hover:text-destructive"
							>
								<X className="h-3 w-3" />
							</button>
						</Badge>
					)}
				</div>
			)}

			{/* Row 2: Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between text-muted-foreground text-sm">
					<span>
						Menampilkan {offset + 1}–{Math.min(offset + limit, total)} dari{" "}
						{total.toLocaleString("id-ID")} pengguna
					</span>
					<div className="flex items-center gap-1">
						<Button
							variant="outline"
							size="icon"
							className="h-7 w-7"
							disabled={!hasPrev || pending}
							onClick={() => update({ offset: String(offset - limit) })}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<span className="px-2 text-xs">
							{page} / {totalPages}
						</span>
						<Button
							variant="outline"
							size="icon"
							className="h-7 w-7"
							disabled={!hasNext || pending}
							onClick={() => update({ offset: String(offset + limit) })}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
