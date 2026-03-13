"use client";

// app/domainsearch/domain-search-client.tsx
// Client Component — interaktivitas: search, filter, mutations, searchParams

import {
	AlertCircle,
	Layers,
	Search,
	SlidersHorizontal,
	TrendingUp,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@tanisya/ui/components/alert";
import { Badge } from "@tanisya/ui/components/badge";
import { Button } from "@tanisya/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@tanisya/ui/components/dropdown-menu";
import { Input } from "@tanisya/ui/components/input";
import { Separator } from "@tanisya/ui/components/separator";
import { Skeleton } from "@tanisya/ui/components/skeleton";
import { orpc } from "@/utils/orpc";
import {
	POPULAR_TLDS,
	PROMO_TLDS,
	QUICK_TLDS,
	getPriceByTld,
	getTld,
	type DomainSuggestion,
} from "../domain/domain-data";
import {
	CardSkeleton,
	DomainCard,
	DomainListRow,
	RowSkeleton,
	SORT_LABEL,
	type SortMode,
} from "./domain-search-ui";

// ─── Sort helper ──────────────────────────────────────────────────────────────
function applySort(items: DomainSuggestion[], mode: SortMode): DomainSuggestion[] {
	const available   = items.filter((s) => s.available === 1);
	const unavailable = items.filter((s) => s.available !== 1);

	const sorted = [...available].sort((a, b) => {
		const aTld   = getTld(a.name);
		const bTld   = getTld(b.name);
		const aPrice = getPriceByTld(aTld) ?? Infinity;
		const bPrice = getPriceByTld(bTld) ?? Infinity;

		if (mode === "price-asc")  return aPrice - bPrice;
		if (mode === "price-desc") return bPrice - aPrice;

		const aPromo   = PROMO_TLDS.indexOf(aTld);
		const bPromo   = PROMO_TLDS.indexOf(bTld);
		const aPopular = POPULAR_TLDS.indexOf(aTld);
		const bPopular = POPULAR_TLDS.indexOf(bTld);
		if (aPromo !== -1 && bPromo !== -1) return aPromo - bPromo;
		if (aPromo !== -1) return -1;
		if (bPromo !== -1) return 1;
		if (aPopular !== -1 && bPopular !== -1) return aPopular - bPopular;
		if (aPopular !== -1) return -1;
		if (bPopular !== -1) return 1;
		return 0;
	});

	return [...sorted, ...unavailable];
}

// ─── SearchParamsReader ───────────────────────────────────────────────────────
function SearchParamsReader({ onQuery }: { onQuery: (q: string) => void }) {
	const searchParams = useSearchParams();

	useEffect(() => {
		const q = searchParams.get("domainToCheck");
		if (q) onQuery(q);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return null;
}

// ─── Domain Search Client ─────────────────────────────────────────────────────
export function DomainSearchClient() {
	const router = useRouter();

	const [domainInput, setDomainInput] = useState("");
	const [lastDomain, setLastDomain]   = useState("");

	const [exactDomain, setExactDomain]         = useState<DomainSuggestion | null>(null);
	const [topRec, setTopRec]                   = useState<DomainSuggestion | null>(null);
	const [primaryList, setPrimaryList]         = useState<DomainSuggestion[]>([]);
	const [secondaryList, setSecondaryList]     = useState<DomainSuggestion[]>([]);
	const [secondaryLoaded, setSecondaryLoaded] = useState(false);

	const [sortMode, setSortMode]     = useState<SortMode>("popular");
	const [hasSearched, setHasSearched] = useState(false);
	const [errorMsg, setErrorMsg]       = useState("");

	// ── Mutation: checkByExtensions (menggantikan checkPrimary) ───────────────
	const primaryMutation = useMutation(
		orpc.domain.checkByExtensions.mutationOptions({
			onSuccess: (data) => {
				const raw = lastDomain;
				const all: DomainSuggestion[] = data.results;

				// Cari exact match: domain input cocok persis ATAU baseName + ekstensi asli
				const exactIdx = all.findIndex(
					(s) =>
						s.name === raw ||
						s.name === `${data.baseName}.${raw.split(".").slice(1).join(".")}`,
				);

				let exact: DomainSuggestion | null = null;
				let rest = [...all];

				if (exactIdx !== -1) {
					exact = all[exactIdx]!;
					rest  = all.filter((_, i) => i !== exactIdx);
				} else {
					[exact, ...rest] = all;
				}

				const sortedRest     = applySort(rest, "popular");
				const firstAvailable = sortedRest.find((s) => s.available === 1) ?? sortedRest[0];
				const remainingList  = sortedRest.filter((s) => s !== firstAvailable);

				setExactDomain(exact ?? null);
				setTopRec(firstAvailable ?? null);
				setPrimaryList(remainingList);
				setSecondaryList([]);
				setSecondaryLoaded(false);
				setErrorMsg("");
				setHasSearched(true);
			},
			onError: (err) => {
				setErrorMsg(
					err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.",
				);
				setExactDomain(null);
				setTopRec(null);
				setPrimaryList([]);
				setSecondaryList([]);
				setHasSearched(true);
			},
		}),
	);

	// ── Mutation: checkSecondaryPreset (menggantikan checkSecondary) ──────────
	const secondaryMutation = useMutation(
		orpc.domain.checkSecondaryPreset.mutationOptions({
			onSuccess: (data) => {
				setSecondaryList(data.results);
				setSecondaryLoaded(true);
			},
			onError: () => {
				setSecondaryLoaded(true);
			},
		}),
	);

	// ── Handlers ──────────────────────────────────────────────────────────────
	const runSearch = (domain: string) => {
		const raw = domain.trim().replace(/^https?:\/\//, "");
		if (!raw) return;
		setLastDomain(raw);
		setDomainInput(raw);
		setExactDomain(null);
		setTopRec(null);
		setPrimaryList([]);
		setSecondaryList([]);
		setSecondaryLoaded(false);
		setErrorMsg("");
		// Kirim domain + biarkan server fallback ke EXTENSIONS_PRIMARY
		primaryMutation.mutate({ domain: raw });
	};

	const handleSearch = () => {
		const raw = domainInput.trim().replace(/^https?:\/\//, "");
		if (!raw) return;
		router.replace(`/domainsearch?domainToCheck=${encodeURIComponent(raw)}`);
		runSearch(raw);
	};

	const handleLoadMore = () => {
		if (!lastDomain || secondaryMutation.isPending) return;
		// checkSecondaryPreset hanya butuh { domain: baseName }
		const baseName = lastDomain.split(".")[0] ?? lastDomain;
		secondaryMutation.mutate({ domain: baseName });
	};

	const handleQuickTld = (tld: string) => {
		const base =
			domainInput.trim().replace(/^https?:\/\//, "").split(".")[0] ?? "";
		setDomainInput(base ? `${base}${tld}` : tld);
	};

	// ── Derived state ─────────────────────────────────────────────────────────
	const isLoadingPrimary   = primaryMutation.isPending;
	const isLoadingSecondary = secondaryMutation.isPending;
	const mergedList         = [...primaryList, ...secondaryList];
	const sortedList         = applySort(mergedList, sortMode);
	const availableCount     = sortedList.filter((s) => s.available === 1).length;

	return (
		<>
			<Suspense fallback={null}>
				<SearchParamsReader onQuery={runSearch} />
			</Suspense>

			{/* ── Sticky search bar ── */}
			<div className="pt-3 sm:pt-8 sticky top-10 z-10 border-b bg-background">
				<div className="mx-auto max-w-5xl px-4 py-3">
					<div className="flex items-center gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" className="h-9 shrink-0 gap-1.5">
									<SlidersHorizontal className="h-3.5 w-3.5" />
									<span className="hidden sm:inline">Filter</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-52">
								<DropdownMenuLabel className="text-xs">
									Urutkan list domain
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuRadioGroup
									value={sortMode}
									onValueChange={(v) => setSortMode(v as SortMode)}
								>
									<DropdownMenuRadioItem value="popular" className="text-sm">
										<TrendingUp className="mr-2 h-3.5 w-3.5" />
										Paling Populer
									</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="price-asc" className="text-sm">
										Harga Terendah
									</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="price-desc" className="text-sm">
										Harga Tertinggi
									</DropdownMenuRadioItem>
								</DropdownMenuRadioGroup>
							</DropdownMenuContent>
						</DropdownMenu>

						<Input
							placeholder="Cari nama domain…"
							value={domainInput}
							onChange={(e) => setDomainInput(e.target.value)}
							onKeyDown={(e) =>
								e.key === "Enter" && !isLoadingPrimary && handleSearch()
							}
							className="h-9 flex-1"
							disabled={isLoadingPrimary}
						/>

						<Button
							onClick={handleSearch}
							disabled={isLoadingPrimary || !domainInput.trim()}
							className="h-9 shrink-0 gap-2"
						>
							{isLoadingPrimary ? (
								<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
							) : (
								<Search className="h-4 w-4" />
							)}
							<span className="hidden sm:inline">
								{isLoadingPrimary ? "Mengecek..." : "Cari"}
							</span>
						</Button>
					</div>

					{/* Quick TLD chips */}
					<div className="mt-2 flex flex-wrap gap-1.5">
						{QUICK_TLDS.map((tld) => (
							<button
								key={tld}
								type="button"
								onClick={() => handleQuickTld(tld)}
								className="rounded-full border bg-muted/50 px-2 py-0.5 font-mono text-[11px] transition-colors hover:bg-primary/10 hover:border-primary/40 hover:text-primary"
							>
								{tld}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* ── Body ── */}
			<div className="mx-auto max-w-5xl px-4 pb-8 pt-20 space-y-8">
				{/* Error */}
				{primaryMutation.isError && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription className="text-sm">{errorMsg}</AlertDescription>
					</Alert>
				)}

				{/* Loading */}
				{isLoadingPrimary && (
					<>
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
							<CardSkeleton />
							<CardSkeleton />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-32 rounded mb-1" />
							{[...Array(5)].map((_, i) => (
								<RowSkeleton key={i} />
							))}
						</div>
					</>
				)}

				{/* Results */}
				{!isLoadingPrimary && hasSearched && (exactDomain ?? topRec) && (
					<>
						<div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2">
							{exactDomain && (
								<DomainCard s={exactDomain} label="Domain yang Anda Cari" highlight />
							)}
							{topRec && <DomainCard s={topRec} label="Rekomendasi Terbaik" />}
						</div>

						{sortedList.length > 0 && (
							<div>
								<div className="mb-3 flex items-center justify-between">
									<div className="flex items-center gap-2">
										<h2 className="font-semibold text-sm">Domain Lainnya</h2>
										<Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
											{availableCount} tersedia
										</Badge>
									</div>
									<span className="text-[11px] text-muted-foreground">
										{SORT_LABEL[sortMode]}
									</span>
								</div>

								<div className="space-y-2">
									{sortedList.map((s) => (
										<DomainListRow key={s.name} s={s} />
									))}
								</div>

								{isLoadingSecondary && (
									<div className="mt-2 space-y-2">
										{[...Array(4)].map((_, i) => (
											<RowSkeleton key={`sec-${i}`} />
										))}
									</div>
								)}

								{!secondaryLoaded && !isLoadingSecondary && (
									<>
										<Separator className="my-4" />
										<Button
											variant="outline"
											className="w-full gap-2"
											onClick={handleLoadMore}
										>
											<Layers className="h-4 w-4" />
											Tampilkan Ekstensi Domain Lain
										</Button>
									</>
								)}
							</div>
						)}
					</>
				)}

				{/* Empty */}
				{!isLoadingPrimary &&
					hasSearched &&
					!exactDomain &&
					!topRec &&
					!primaryMutation.isError && (
						<div className="py-16 text-center">
							<p className="text-muted-foreground text-sm">
								Tidak ada hasil. Coba nama domain yang lain.
							</p>
						</div>
					)}

				{/* Initial state */}
				{!isLoadingPrimary && !hasSearched && (
					<div className="py-20 text-center">
						<Search className="mx-auto mb-3 h-12 w-12 text-muted-foreground/20" />
						<p className="font-medium text-muted-foreground">
							Ketik nama domain di atas untuk mulai mencari
						</p>
						<p className="mt-1 text-muted-foreground/60 text-sm">
							Contoh: tokobuku, tokobuku.com, atau mybrand.id
						</p>
					</div>
				)}
			</div>
		</>
	);
}