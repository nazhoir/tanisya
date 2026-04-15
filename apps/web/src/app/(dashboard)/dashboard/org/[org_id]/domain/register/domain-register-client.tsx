"use client";

import { Badge } from "@tanisya/ui/components/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@tanisya/ui/components/breadcrumb";
import { Button } from "@tanisya/ui/components/button";
import { Separator } from "@tanisya/ui/components/separator";
import { SidebarTrigger } from "@tanisya/ui/components/sidebar";
import { cn } from "@tanisya/ui/lib/utils";
import { useMutation } from "@tanstack/react-query";
import {
	ArrowLeftRight,
	ArrowRight,
	CheckCircle2,
	ChevronLeft,
	Globe,
	List,
	Loader2,
	Search,
	ShoppingCart,
	X,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense, useEffect } from "react";
import { orpc } from "@/utils/orpc";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DomainSuggestion {
	name: string;
	available: 1 | 0;
	price?: string;
	priceRenew?: string;
}

type SortMode = "popular" | "price-asc" | "price-desc";
type SearchMode = "by-extensions" | "batch";

interface TldResult {
	tld: string;
	name: string;
	price: string;
	priceRenew: string;
	available: boolean;
	popular?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TLD_GROUPS = [
	{
		label: "Indonesia",
		tlds: [
			".id",
			".co.id",
			".my.id",
			".web.id",
			".biz.id",
			".or.id",
			".ac.id",
			".sch.id",
			".ponpes.id",
		],
	},
	{
		label: "Global",
		tlds: [
			".com",
			".net",
			".org",
			".info",
			".biz",
			".io",
			".co",
			".xyz",
			".online",
			".site",
			".store",
			".tech",
		],
	},
];

const TLD_PRICES: Record<string, { reg: string; renew: string }> = {
	".id": { reg: "Rp 150.000", renew: "Rp 150.000" },
	".co.id": { reg: "Rp 150.000", renew: "Rp 150.000" },
	".my.id": { reg: "Rp 25.000", renew: "Rp 25.000" },
	".web.id": { reg: "Rp 25.000", renew: "Rp 25.000" },
	".biz.id": { reg: "Rp 25.000", renew: "Rp 25.000" },
	".or.id": { reg: "Rp 150.000", renew: "Rp 150.000" },
	".ac.id": { reg: "Rp 150.000", renew: "Rp 150.000" },
	".sch.id": { reg: "Rp 150.000", renew: "Rp 150.000" },
	".ponpes.id": { reg: "Rp 150.000", renew: "Rp 150.000" },
	".com": { reg: "Rp 195.000", renew: "Rp 225.000" },
	".net": { reg: "Rp 215.000", renew: "Rp 240.000" },
	".org": { reg: "Rp 205.000", renew: "Rp 230.000" },
	".info": { reg: "Rp 180.000", renew: "Rp 210.000" },
	".biz": { reg: "Rp 185.000", renew: "Rp 215.000" },
	".io": { reg: "Rp 650.000", renew: "Rp 700.000" },
	".co": { reg: "Rp 480.000", renew: "Rp 500.000" },
	".xyz": { reg: "Rp 75.000", renew: "Rp 150.000" },
	".online": { reg: "Rp 85.000", renew: "Rp 180.000" },
	".site": { reg: "Rp 80.000", renew: "Rp 175.000" },
	".store": { reg: "Rp 95.000", renew: "Rp 200.000" },
	".tech": { reg: "Rp 290.000", renew: "Rp 320.000" },
};

const POPULAR_TLDS = [".com", ".id", ".co.id", ".net", ".io", ".xyz"];
const PROMO_TLDS = [".my.id", ".web.id", ".biz.id", ".xyz", ".online", ".site"];
const DEFAULT_EXTENSIONS = ".com,.net,.id,.co.id,.my.id,.xyz";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTld(fullName: string): string {
	const parts = fullName.split(".");
	return `.${parts.slice(1).join(".")}`;
}

function toTldResult(s: DomainSuggestion): TldResult {
	const tld = getTld(s.name);
	return {
		tld,
		name: s.name,
		price: s.price ?? TLD_PRICES[tld]?.reg ?? "—",
		priceRenew: s.priceRenew ?? TLD_PRICES[tld]?.renew ?? "—",
		available: s.available === 1,
		popular: POPULAR_TLDS.includes(tld),
	};
}

function applySort(items: TldResult[], mode: SortMode): TldResult[] {
	const avail = items.filter((r) => r.available);
	const unavail = items.filter((r) => !r.available);

	const sorted = [...avail].sort((a, b) => {
		const aPrice = TLD_PRICES[a.tld]?.reg
			? Number.parseInt(TLD_PRICES[a.tld].reg.replace(/\D/g, ""), 10)
			: Number.POSITIVE_INFINITY;
		const bPrice = TLD_PRICES[b.tld]?.reg
			? Number.parseInt(TLD_PRICES[b.tld].reg.replace(/\D/g, ""), 10)
			: Number.POSITIVE_INFINITY;

		if (mode === "price-asc") return aPrice - bPrice;
		if (mode === "price-desc") return bPrice - aPrice;

		const aPromo = PROMO_TLDS.indexOf(a.tld);
		const bPromo = PROMO_TLDS.indexOf(b.tld);
		const aPopular = POPULAR_TLDS.indexOf(a.tld);
		const bPopular = POPULAR_TLDS.indexOf(b.tld);
		if (aPromo !== -1 && bPromo !== -1) return aPromo - bPromo;
		if (aPromo !== -1) return -1;
		if (bPromo !== -1) return 1;
		if (aPopular !== -1 && bPopular !== -1) return aPopular - bPopular;
		if (aPopular !== -1) return -1;
		if (bPopular !== -1) return 1;
		return 0;
	});

	return [...sorted, ...unavail];
}

function detectSearchMode(input: string): SearchMode {
	const parts = input
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	if (parts.length > 1 && parts.every((p) => p.includes("."))) return "batch";
	return "by-extensions";
}

// ─── SearchParams reader ──────────────────────────────────────────────────────

function SearchParamsReader({ onQuery }: { onQuery: (q: string) => void }) {
	const searchParams = useSearchParams();
	useEffect(() => {
		const q = searchParams.get("domain");
		if (q) onQuery(q);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);
	return null;
}

// ─── TLD Selector ─────────────────────────────────────────────────────────────

function TldSelector({
	selected,
	onChange,
}: {
	selected: string[];
	onChange: (tlds: string[]) => void;
}) {
	const toggle = (tld: string) => {
		onChange(
			selected.includes(tld)
				? selected.filter((t) => t !== tld)
				: [...selected, tld],
		);
	};

	return (
		<div className="space-y-4">
			{TLD_GROUPS.map((group) => (
				<div key={group.label}>
					<p className="mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-widest">
						{group.label}
					</p>
					<div className="flex flex-wrap gap-1.5">
						{group.tlds.map((tld) => {
							const active = selected.includes(tld);
							return (
								<button
									key={tld}
									type="button"
									onClick={() => toggle(tld)}
									className={cn(
										"rounded-lg border px-2.5 py-1 font-medium text-xs transition-all",
										active
											? "border-primary bg-primary/10 text-primary"
											: "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
									)}
								>
									{tld}
									{POPULAR_TLDS.includes(tld) && (
										<span className="ml-1 text-primary/60">·</span>
									)}
								</button>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
}

// ─── Transfer Button ──────────────────────────────────────────────────────────

function TransferButton({
	domainName,
	baseUrl,
}: {
	domainName: string;
	baseUrl: string;
}) {
	return (
		<Button
			size="sm"
			variant="outline"
			className="h-8 gap-1.5 border-amber-400/50 font-semibold text-amber-600 text-xs hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/40 dark:text-amber-400 dark:hover:bg-amber-950/30 dark:hover:text-amber-300"
			asChild
		>
			<Link
				href={
					`${baseUrl}/domain/transfer?domain=${encodeURIComponent(domainName)}` as any
				}
			>
				<ArrowLeftRight className="h-3.5 w-3.5" />
				Transfer
			</Link>
		</Button>
	);
}

// ─── Result Row ───────────────────────────────────────────────────────────────

function ResultRow({
	domainName,
	result,
	inCart,
	onToggleCart,
	label,
	highlight,
	baseUrl,
}: {
	domainName: string;
	result: TldResult;
	inCart: boolean;
	onToggleCart: () => void;
	label?: string;
	highlight?: boolean;
	baseUrl: string;
}) {
	const available = result.available;

	return (
		<div
			className={cn(
				"flex flex-col rounded-xl border transition-all",
				highlight && "ring-1 ring-primary/30",
				available
					? inCart
						? "border-primary/40 bg-primary/5"
						: "border-border/60 bg-background hover:border-primary/20"
					: "border-border/40 bg-muted/20",
			)}
		>
			{label && (
				<div className="border-border/40 border-b px-4 py-1.5">
					<span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-widest">
						{label}
					</span>
				</div>
			)}
			<div className="flex items-center gap-3 px-4 py-3">
				{available ? (
					<CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
				) : (
					<XCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
				)}

				<div className="min-w-0 flex-1">
					<span
						className={cn("font-semibold text-sm", !available && "opacity-60")}
					>
						{domainName}
					</span>
					<span
						className={cn(
							"text-muted-foreground text-sm",
							!available && "opacity-60",
						)}
					>
						{result.tld}
					</span>
					{POPULAR_TLDS.includes(result.tld) && (
						<Badge
							variant="outline"
							className="ml-2 h-4 border-primary/30 bg-primary/8 px-1.5 text-[10px] text-primary"
						>
							Populer
						</Badge>
					)}
					{!available && (
						<Badge
							variant="outline"
							className="ml-2 h-4 border-amber-400/40 bg-amber-50 px-1.5 text-[10px] text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
						>
							Sudah terdaftar
						</Badge>
					)}
				</div>

				<div className="flex items-center gap-3">
					{available && (
						<div className="hidden text-right sm:block">
							<p className="font-bold text-sm">
								{result.price}
								<span className="font-normal text-muted-foreground">/thn</span>
							</p>
							<p className="text-muted-foreground text-xs">
								Perpanjang {result.priceRenew}
							</p>
						</div>
					)}

					{available ? (
						<Button
							size="sm"
							variant={inCart ? "outline" : "default"}
							className={cn(
								"h-8 gap-1.5 font-semibold text-xs",
								inCart &&
									"border-primary/30 text-primary hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive",
							)}
							onClick={onToggleCart}
						>
							{inCart ? (
								<>
									<X className="h-3.5 w-3.5" /> Hapus
								</>
							) : (
								<>
									<ShoppingCart className="h-3.5 w-3.5" /> Pilih
								</>
							)}
						</Button>
					) : (
						<TransferButton domainName={result.name} baseUrl={baseUrl} />
					)}
				</div>
			</div>
		</div>
	);
}

// ─── Batch Result Row ─────────────────────────────────────────────────────────

function BatchResultRow({
	result,
	inCart,
	onToggleCart,
	baseUrl,
}: {
	result: TldResult;
	inCart: boolean;
	onToggleCart: () => void;
	baseUrl: string;
}) {
	const available = result.available;
	const parts = result.name.split(".");
	const baseName = parts[0]!;
	const tldPart = `.${parts.slice(1).join(".")}`;

	return (
		<div
			className={cn(
				"flex items-center gap-3 rounded-xl border px-4 py-3 transition-all",
				available
					? inCart
						? "border-primary/40 bg-primary/5"
						: "border-border/60 bg-background hover:border-primary/20"
					: "border-border/40 bg-muted/20",
			)}
		>
			{available ? (
				<CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
			) : (
				<XCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
			)}

			<div className="min-w-0 flex-1">
				<span
					className={cn("font-semibold text-sm", !available && "opacity-60")}
				>
					{baseName}
				</span>
				<span
					className={cn(
						"text-muted-foreground text-sm",
						!available && "opacity-60",
					)}
				>
					{tldPart}
				</span>
				{!available && (
					<Badge
						variant="outline"
						className="ml-2 h-4 border-amber-400/40 bg-amber-50 px-1.5 text-[10px] text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
					>
						Sudah terdaftar
					</Badge>
				)}
			</div>

			<div className="flex items-center gap-3">
				{available && (
					<div className="hidden text-right sm:block">
						<p className="font-bold text-sm">
							{result.price}
							<span className="font-normal text-muted-foreground">/thn</span>
						</p>
						<p className="text-muted-foreground text-xs">
							Perpanjang {result.priceRenew}
						</p>
					</div>
				)}

				{available ? (
					<Button
						size="sm"
						variant={inCart ? "outline" : "default"}
						className={cn(
							"h-8 gap-1.5 font-semibold text-xs",
							inCart &&
								"border-primary/30 text-primary hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive",
						)}
						onClick={onToggleCart}
					>
						{inCart ? (
							<>
								<X className="h-3.5 w-3.5" /> Hapus
							</>
						) : (
							<>
								<ShoppingCart className="h-3.5 w-3.5" /> Pilih
							</>
						)}
					</Button>
				) : (
					<TransferButton domainName={result.name} baseUrl={baseUrl} />
				)}
			</div>
		</div>
	);
}

// ─── Cart Summary ─────────────────────────────────────────────────────────────

function CartSummary({
	cart,
	onRemove,
	baseUrl,
}: {
	cart: { domain: string; tld: string; price: string }[];
	onRemove: (key: string) => void;
	baseUrl: string;
}) {
	if (cart.length === 0) return null;

	const total = cart.reduce(
		(sum, item) => sum + Number.parseInt(item.price.replace(/\D/g, ""), 10),
		0,
	);

	return (
		<div className="space-y-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
			<div className="flex items-center gap-2">
				<ShoppingCart className="h-4 w-4 text-primary" />
				<p className="font-semibold text-primary text-sm">
					Keranjang ({cart.length})
				</p>
			</div>

			<div className="space-y-1.5">
				{cart.map((item) => (
					<div
						key={`${item.domain}${item.tld}`}
						className="flex items-center justify-between text-sm"
					>
						<span>
							<span className="font-medium">{item.domain}</span>
							<span className="text-muted-foreground">{item.tld}</span>
						</span>
						<div className="flex items-center gap-3">
							<span className="font-semibold">{item.price}</span>
							<button
								type="button"
								onClick={() => onRemove(`${item.domain}${item.tld}`)}
								className="text-muted-foreground transition-colors hover:text-destructive"
							>
								<X className="h-3.5 w-3.5" />
							</button>
						</div>
					</div>
				))}
			</div>

			<Separator className="bg-primary/10" />

			<div className="flex items-center justify-between">
				<span className="text-muted-foreground text-sm">Total per tahun</span>
				<span className="font-extrabold">
					Rp {total.toLocaleString("id-ID")}
				</span>
			</div>

			<Button
				className="w-full gap-2 font-bold shadow shadow-primary/20"
				asChild
			>
				<Link href={`${baseUrl}/domain/checkout` as any}>
					Lanjut ke Pembayaran
					<ArrowRight className="h-4 w-4" />
				</Link>
			</Button>
		</div>
	);
}

// ─── Mode Toggle ──────────────────────────────────────────────────────────────

function ModeToggle({
	mode,
	onChange,
}: {
	mode: SearchMode;
	onChange: (m: SearchMode) => void;
}) {
	return (
		<div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5">
			<button
				type="button"
				onClick={() => onChange("by-extensions")}
				className={cn(
					"flex items-center gap-1.5 rounded-md px-3 py-1.5 font-semibold text-xs transition-all",
					mode === "by-extensions"
						? "bg-background text-foreground shadow-sm"
						: "text-muted-foreground hover:text-foreground",
				)}
			>
				<Globe className="h-3.5 w-3.5" />
				Satu Nama
			</button>
			<button
				type="button"
				onClick={() => onChange("batch")}
				className={cn(
					"flex items-center gap-1.5 rounded-md px-3 py-1.5 font-semibold text-xs transition-all",
					mode === "batch"
						? "bg-background text-foreground shadow-sm"
						: "text-muted-foreground hover:text-foreground",
				)}
			>
				<List className="h-3.5 w-3.5" />
				Banyak Domain
			</button>
		</div>
	);
}

// ─── Client Component ─────────────────────────────────────────────────────────

export function DomainRegisterClient({ orgId }: { orgId: string }) {
	const baseUrl = `/dashboard/org/${orgId}`;
	const router = useRouter();

	const [searchMode, setSearchMode] =
		React.useState<SearchMode>("by-extensions");
	const [query, setQuery] = React.useState("");
	const [extensions, setExtensions] = React.useState(DEFAULT_EXTENSIONS);
	const [selectedTlds, setSelectedTlds] = React.useState<string[]>(
		DEFAULT_EXTENSIONS.split(",").map((e) => e.trim()),
	);
	const [showTldPicker, setShowTldPicker] = React.useState(false);
	const [batchQuery, setBatchQuery] = React.useState("");
	const [domainName, setDomainName] = React.useState("");
	const [exactDomain, setExactDomain] = React.useState<TldResult | null>(null);
	const [topRec, setTopRec] = React.useState<TldResult | null>(null);
	const [primaryList, setPrimaryList] = React.useState<TldResult[]>([]);
	const [secondaryList, setSecondaryList] = React.useState<TldResult[]>([]);
	const [secondaryLoaded, setSecondaryLoaded] = React.useState(false);
	const [sortMode, setSortMode] = React.useState<SortMode>("popular");
	const [hasSearched, setHasSearched] = React.useState(false);
	const [batchResults, setBatchResults] = React.useState<TldResult[]>([]);
	const [cart, setCart] = React.useState<
		{ domain: string; tld: string; price: string }[]
	>([]);

	const inputRef = React.useRef<HTMLInputElement>(null);

	const byExtMutation = useMutation(
		orpc.domain.checkByExtensions.mutationOptions({
			onSuccess: (data: { baseName: string; results: DomainSuggestion[] }) => {
				const all = data.results.map(toTldResult);
				const exactIdx = all.findIndex(
					(r) => r.name === query.trim().toLowerCase(),
				);
				let exact: TldResult | null = null;
				let rest = [...all];
				if (exactIdx !== -1) {
					exact = all[exactIdx]!;
					rest = all.filter((_, i) => i !== exactIdx);
				} else {
					[exact, ...rest] = all;
				}
				const sortedRest = applySort(rest, "popular");
				const firstAvailable =
					sortedRest.find((r) => r.available) ?? sortedRest[0];
				const remaining = sortedRest.filter((r) => r !== firstAvailable);
				setExactDomain(exact ?? null);
				setTopRec(firstAvailable ?? null);
				setPrimaryList(remaining);
				setSecondaryList([]);
				setSecondaryLoaded(false);
				setHasSearched(true);
				setBatchResults([]);
				setCart([]);
			},
			onError: () => {
				setExactDomain(null);
				setTopRec(null);
				setPrimaryList([]);
				setSecondaryList([]);
				setHasSearched(true);
			},
		}),
	);

	const secondaryMutation = useMutation(
		orpc.domain.checkSecondaryPreset.mutationOptions({
			onSuccess: (data: { results: DomainSuggestion[] }) => {
				setSecondaryList(data.results.map(toTldResult));
				setSecondaryLoaded(true);
			},
			onError: () => setSecondaryLoaded(true),
		}),
	);

	const batchMutation = useMutation(
		orpc.domain.checkBatch.mutationOptions({
			onSuccess: (data: { results: DomainSuggestion[] }) => {
				setBatchResults(data.results.map(toTldResult));
				setExactDomain(null);
				setTopRec(null);
				setPrimaryList([]);
				setSecondaryList([]);
				setHasSearched(true);
				setCart([]);
			},
			onError: () => {
				setBatchResults([]);
				setHasSearched(true);
			},
		}),
	);

	const runByExtensions = React.useCallback(
		(rawInput: string, exts?: string) => {
			const raw = rawInput.trim().replace(/^https?:\/\//, "");
			if (!raw) return;
			const baseName = raw.split(".")[0]!;
			setDomainName(baseName);
			setQuery(raw);
			setHasSearched(false);
			byExtMutation.mutate({ domain: raw, extensions: exts ?? extensions });
			// eslint-disable-next-line react-hooks/exhaustive-deps
		},
		[extensions],
	);

	const runBatch = React.useCallback((rawInput: string) => {
		const raw = rawInput.trim();
		if (!raw) return;
		setBatchQuery(raw);
		setHasSearched(false);
		batchMutation.mutate({ domains: raw });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSearch = () => {
		if (searchMode === "batch") {
			if (!batchQuery.trim() || batchMutation.isPending) return;
			router.replace(
				`${baseUrl}/domain/register?domain=${encodeURIComponent(batchQuery.trim())}&mode=batch` as any,
			);
			runBatch(batchQuery);
		} else {
			const raw = query.trim().replace(/^https?:\/\//, "");
			if (!raw || byExtMutation.isPending) return;
			router.replace(
				`${baseUrl}/domain/register?domain=${encodeURIComponent(raw)}` as any,
			);
			runByExtensions(raw);
		}
	};

	const handleQueryFromUrl = React.useCallback((q: string) => {
		const mode = detectSearchMode(q);
		setSearchMode(mode);
		if (mode === "batch") {
			setBatchQuery(q);
			runBatch(q);
		} else {
			setQuery(q);
			runByExtensions(q);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleLoadMore = () => {
		if (!domainName || secondaryMutation.isPending) return;
		secondaryMutation.mutate({ domain: domainName });
	};

	const toggleCart = (result: TldResult) => {
		if (!result.available) return;
		const key = result.name;
		setCart((prev) => {
			const exists = prev.some((i) => `${i.domain}${i.tld}` === key);
			if (exists) return prev.filter((i) => `${i.domain}${i.tld}` !== key);
			const parts = result.name.split(".");
			const domain = parts[0]!;
			const tld = `.${parts.slice(1).join(".")}`;
			return [...prev, { domain, tld, price: result.price }];
		});
	};

	const isInCart = (result: TldResult) =>
		cart.some((i) => `${i.domain}${i.tld}` === result.name);

	const isLoadingPrimary = byExtMutation.isPending;
	const isLoadingBatch = batchMutation.isPending;
	const isLoadingSecondary = secondaryMutation.isPending;
	const isLoading = isLoadingPrimary || isLoadingBatch;
	const mergedList = [...primaryList, ...secondaryList];
	const sortedList = applySort(mergedList, sortMode);
	const availableCount = sortedList.filter((r) => r.available).length;
	const batchAvailCount = batchResults.filter((r) => r.available).length;

	return (
		<>
			<Suspense fallback={null}>
				<SearchParamsReader onQuery={handleQueryFromUrl} />
			</Suspense>

			{/* Content */}
			<div className="flex max-w-5xl flex-1 flex-col gap-6 p-4 sm:p-6">
				<div>
					<h1 className="font-extrabold text-xl tracking-tight sm:text-2xl">
						Daftarkan Domain Baru
					</h1>
					<p className="mt-0.5 text-muted-foreground text-sm">
						Cari nama domain yang kamu inginkan dan pilih ekstensi yang sesuai.
					</p>
				</div>

				{/* Mode toggle */}
				<div className="flex items-center gap-3">
					<ModeToggle
						mode={searchMode}
						onChange={(m) => {
							setSearchMode(m);
							setHasSearched(false);
							setExactDomain(null);
							setTopRec(null);
							setPrimaryList([]);
							setSecondaryList([]);
							setBatchResults([]);
						}}
					/>
					<p className="text-muted-foreground text-xs">
						{searchMode === "by-extensions"
							? "Satu nama dengan banyak ekstensi"
							: "Banyak domain sekaligus (pisahkan dengan koma)"}
					</p>
				</div>

				{/* Search bar: by-extensions */}
				{searchMode === "by-extensions" && (
					<div className="relative">
						<div className="flex gap-2">
							<div className="relative flex-1">
								<Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
								<input
									ref={inputRef}
									type="text"
									value={query}
									placeholder="Ketik nama domain, misal: tokobaju"
									onChange={(e) => setQuery(e.target.value)}
									onKeyDown={(e) =>
										e.key === "Enter" && !isLoading && handleSearch()
									}
									className={cn(
										"h-12 w-full rounded-xl border border-border bg-background pr-4 pl-11 font-medium text-sm shadow-sm transition-all",
										"placeholder:text-muted-foreground/60",
										"focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
									)}
								/>
								{query && (
									<button
										type="button"
										onClick={() => {
											setQuery("");
											setExactDomain(null);
											setTopRec(null);
											setPrimaryList([]);
											setSecondaryList([]);
											setHasSearched(false);
											router.replace(`${baseUrl}/domain/register` as any);
											inputRef.current?.focus();
										}}
										className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
									>
										<X className="h-4 w-4" />
									</button>
								)}
							</div>

							<Button
								variant="outline"
								size="sm"
								className={cn(
									"h-12 gap-1.5 rounded-xl px-4 font-semibold text-sm",
									showTldPicker &&
										"border-primary/40 bg-primary/5 text-primary",
								)}
								onClick={() => setShowTldPicker((v) => !v)}
							>
								<Globe className="h-4 w-4" />
								<span className="hidden sm:inline">Ekstensi</span>
								<Badge
									variant="outline"
									className="border-current bg-transparent px-1.5 text-xs"
								>
									{selectedTlds.length}
								</Badge>
							</Button>

							<Button
								size="default"
								className="h-12 rounded-xl px-6 font-semibold"
								disabled={!query.trim() || isLoading}
								onClick={handleSearch}
							>
								{isLoadingPrimary ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									"Cari"
								)}
							</Button>
						</div>

						{showTldPicker && (
							<div className="absolute top-14 right-0 z-20 w-full max-w-md rounded-2xl border border-border/60 bg-background p-4 shadow-xl">
								<div className="mb-3 flex items-center justify-between">
									<p className="font-semibold text-sm">
										Pilih Ekstensi ({selectedTlds.length} dipilih)
									</p>
									<button
										type="button"
										onClick={() => setShowTldPicker(false)}
										className="text-muted-foreground hover:text-foreground"
									>
										<X className="h-4 w-4" />
									</button>
								</div>
								<TldSelector
									selected={selectedTlds}
									onChange={(tlds) => {
										setSelectedTlds(tlds);
										setExtensions(tlds.join(","));
									}}
								/>
								<div className="mt-3 flex gap-2">
									<Button
										size="sm"
										variant="outline"
										className="h-8 flex-1 text-xs"
										onClick={() => {
											setSelectedTlds([]);
											setExtensions("");
										}}
									>
										Hapus Semua
									</Button>
									<Button
										size="sm"
										className="h-8 flex-1 text-xs"
										onClick={() => {
											setShowTldPicker(false);
											if (query.trim())
												runByExtensions(query, selectedTlds.join(","));
										}}
									>
										Terapkan
									</Button>
								</div>
							</div>
						)}
					</div>
				)}

				{/* Search bar: batch */}
				{searchMode === "batch" && (
					<div className="flex gap-2">
						<div className="relative flex-1">
							<List className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
							<input
								type="text"
								value={batchQuery}
								placeholder="ahmad.sch.id, muhammad.co.id, budi.net"
								onChange={(e) => setBatchQuery(e.target.value)}
								onKeyDown={(e) =>
									e.key === "Enter" && !isLoading && handleSearch()
								}
								className={cn(
									"h-12 w-full rounded-xl border border-border bg-background pr-4 pl-11 font-medium text-sm shadow-sm transition-all",
									"placeholder:text-muted-foreground/60",
									"focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
								)}
							/>
							{batchQuery && (
								<button
									type="button"
									onClick={() => {
										setBatchQuery("");
										setBatchResults([]);
										setHasSearched(false);
										router.replace(`${baseUrl}/domain/register` as any);
									}}
									className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
								>
									<X className="h-4 w-4" />
								</button>
							)}
						</div>
						<Button
							size="default"
							className="h-12 rounded-xl px-6 font-semibold"
							disabled={!batchQuery.trim() || isLoading}
							onClick={handleSearch}
						>
							{isLoadingBatch ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Cek Semua"
							)}
						</Button>
					</div>
				)}

				{/* Loading skeleton */}
				{isLoading && (
					<div className="space-y-2">
						{[0, 1, 2, 3, 4, 5].map((i) => (
							<div
								key={i}
								className="h-14 animate-pulse rounded-xl bg-muted/50"
							/>
						))}
					</div>
				)}

				{/* Results: by-extensions */}
				{!isLoading &&
					hasSearched &&
					searchMode === "by-extensions" &&
					(exactDomain ?? topRec) && (
						<div className="grid gap-6">
							<div className="space-y-6">
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									{exactDomain && (
										<ResultRow
											domainName={domainName}
											result={exactDomain}
											inCart={isInCart(exactDomain)}
											onToggleCart={() => toggleCart(exactDomain)}
											label="Domain yang Anda Cari"
											highlight
											baseUrl={baseUrl}
										/>
									)}
									{topRec && (
										<ResultRow
											domainName={domainName}
											result={topRec}
											inCart={isInCart(topRec)}
											onToggleCart={() => toggleCart(topRec)}
											label="Rekomendasi Terbaik"
											baseUrl={baseUrl}
										/>
									)}
								</div>

								{sortedList.length > 0 && (
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<p className="flex items-center gap-2 font-semibold text-muted-foreground text-xs uppercase tracking-widest">
												Domain Lainnya
												<Badge
													variant="secondary"
													className="h-4 px-1.5 text-[10px] normal-case tracking-normal"
												>
													{availableCount} tersedia
												</Badge>
											</p>
											<select
												value={sortMode}
												onChange={(e) =>
													setSortMode(e.target.value as SortMode)
												}
												className="h-7 rounded-md border border-border bg-background px-2 text-muted-foreground text-xs"
											>
												<option value="popular">Paling Populer</option>
												<option value="price-asc">Harga Terendah</option>
												<option value="price-desc">Harga Tertinggi</option>
											</select>
										</div>

										{sortedList.map((r) => (
											<ResultRow
												key={r.tld}
												domainName={domainName}
												result={r}
												inCart={isInCart(r)}
												onToggleCart={() => toggleCart(r)}
												baseUrl={baseUrl}
											/>
										))}

										{isLoadingSecondary && (
											<div className="space-y-2 pt-1">
												{[0, 1, 2, 3].map((i) => (
													<div
														key={i}
														className="h-12 animate-pulse rounded-xl bg-muted/50"
													/>
												))}
											</div>
										)}

										{!secondaryLoaded && !isLoadingSecondary && (
											<>
												<Separator className="my-2" />
												<Button
													variant="outline"
													className="w-full gap-2 text-sm"
													onClick={handleLoadMore}
												>
													Tampilkan Ekstensi Domain Lain
												</Button>
											</>
										)}
									</div>
								)}
							</div>

							<CartSummary
								cart={cart}
								onRemove={(key) =>
									setCart((prev) =>
										prev.filter((i) => `${i.domain}${i.tld}` !== key),
									)
								}
								baseUrl={baseUrl}
							/>
						</div>
					)}

				{/* Results: batch */}
				{!isLoading &&
					hasSearched &&
					searchMode === "batch" &&
					batchResults.length > 0 && (
						<div className="grid gap-6">
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<p className="flex items-center gap-2 font-semibold text-muted-foreground text-xs uppercase tracking-widest">
										Hasil Pengecekan
										<Badge
											variant="secondary"
											className="h-4 px-1.5 text-[10px] normal-case tracking-normal"
										>
											{batchAvailCount} tersedia dari {batchResults.length}
										</Badge>
									</p>
									<select
										value={sortMode}
										onChange={(e) => setSortMode(e.target.value as SortMode)}
										className="h-7 rounded-md border border-border bg-background px-2 text-muted-foreground text-xs"
									>
										<option value="popular">Default</option>
										<option value="price-asc">Harga Terendah</option>
										<option value="price-desc">Harga Tertinggi</option>
									</select>
								</div>

								{applySort(batchResults, sortMode).map((r) => (
									<BatchResultRow
										key={r.name}
										result={r}
										inCart={isInCart(r)}
										onToggleCart={() => toggleCart(r)}
										baseUrl={baseUrl}
									/>
								))}
							</div>

							<CartSummary
								cart={cart}
								onRemove={(key) =>
									setCart((prev) =>
										prev.filter((i) => `${i.domain}${i.tld}` !== key),
									)
								}
								baseUrl={baseUrl}
							/>
						</div>
					)}

				{/* Idle state */}
				{!isLoading && !hasSearched && (
					<div className="rounded-2xl border border-border/60 border-dashed bg-muted/10 px-6 py-12 text-center">
						<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
							{searchMode === "batch" ? (
								<List className="h-6 w-6 text-primary" />
							) : (
								<Globe className="h-6 w-6 text-primary" />
							)}
						</div>
						<p className="font-semibold">
							{searchMode === "batch"
								? "Cek banyak domain sekaligus"
								: "Cari nama domain kamu"}
						</p>
						<p className="mt-1 text-muted-foreground text-sm">
							{searchMode === "batch"
								? "Masukkan domain lengkap dipisahkan koma. Contoh: ahmad.sch.id, budi.co.id"
								: "Ketik nama yang kamu inginkan untuk mengecek ketersediaannya di berbagai ekstensi sekaligus."}
						</p>
					</div>
				)}
			</div>
		</>
	);
}
