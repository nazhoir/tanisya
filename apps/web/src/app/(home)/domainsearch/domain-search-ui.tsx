// app/domainsearch/domain-search-ui.tsx
// Server Component — tidak ada "use client", tidak ada hooks
// Berisi: DomainCard, DomainListRow, CardSkeleton, RowSkeleton, helpers

import {
	ArrowLeftRight,
	CheckCircle2,
	ShoppingCart,
	Sparkles,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@tanisya/ui/components/badge";
import { Button } from "@tanisya/ui/components/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@tanisya/ui/components/card";
import { Separator } from "@tanisya/ui/components/separator";
import { Skeleton } from "@tanisya/ui/components/skeleton";
import { formatIDR } from "@/lib/format-currency";
import {
	PROMO_TLDS,
	PROMOS,
	getPriceByTld,
	getTld,
	type DomainSuggestion,
} from "../domain/domain-data";

// ─── Types (re-export agar bisa dipakai di client) ────────────────────────────
export type SortMode = "popular" | "price-asc" | "price-desc";

export const SORT_LABEL: Record<SortMode, string> = {
	popular: "Paling Populer",
	"price-asc": "Harga Terendah",
	"price-desc": "Harga Tertinggi",
};

// ─── Domain info helper ───────────────────────────────────────────────────────
export function getDomainInfo(s: DomainSuggestion) {
	const tld = getTld(s.name);
	const isPromo = PROMO_TLDS.includes(tld);
	const promoData = PROMOS.find((p) => p.tld === tld);
	const price =
		s.is_premium_name && s.premium_registration_price
			? s.premium_registration_price
			: getPriceByTld(tld);
	return { tld, isPromo, promoData, price };
}

// ─── Skeletons ────────────────────────────────────────────────────────────────
export function CardSkeleton() {
	return (
		<Card>
			<CardContent className="p-5 space-y-3">
				<Skeleton className="h-3 w-28 rounded" />
				<div className="flex items-center gap-2">
					<Skeleton className="h-5 w-5 rounded-full shrink-0" />
					<Skeleton className="h-5 w-40 rounded" />
				</div>
				<div className="flex gap-1.5">
					<Skeleton className="h-4 w-16 rounded-full" />
				</div>
				<Skeleton className="h-8 w-24 rounded" />
				<Skeleton className="h-9 w-full rounded" />
			</CardContent>
		</Card>
	);
}

export function RowSkeleton() {
	return (
		<div className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
			<div className="flex flex-1 items-center gap-3">
				<Skeleton className="h-4 w-4 rounded-full shrink-0" />
				<Skeleton className="h-4 w-40 rounded" />
				<Skeleton className="h-4 w-14 rounded-full" />
			</div>
			<div className="flex items-center gap-2">
				<Skeleton className="hidden h-4 w-20 rounded sm:block" />
				<Skeleton className="h-8 w-20 rounded" />
			</div>
		</div>
	);
}

// ─── Domain Card ──────────────────────────────────────────────────────────────
export function DomainCard({
	s,
	label,
	highlight = false,
}: {
	s: DomainSuggestion;
	label: string;
	highlight?: boolean;
}) {
	const isAvailable = s.available === 1;
	const { isPromo, promoData, price } = getDomainInfo(s);

	return (
		<Card
			className={`relative flex flex-col overflow-visible transition-shadow hover:shadow-lg ${
				highlight
					? "border-primary shadow-md ring-3 ring-primary"
					: "border-border"
			}`}
		>
			{highlight && (
				<div className="absolute -top-3 z-auto left-1/2 -translate-x-1/2">
					<Badge className="bg-primary px-6 py-4 text-primary-foreground text-xl font-bold shadow">
						Pilihan Anda
					</Badge>
				</div>
			)}

			<CardHeader className="px-5 pt-6 pb-3">
				<div className="mb-1 flex items-center justify-between">
					<p className="text-[11px] font-medium tracking-wide text-muted-foreground">
						{label}
					</p>
					{!highlight && isAvailable && (
						<Sparkles className="h-14 w-14 text-green-500 absolute right-6" />
					)}
				</div>

				<div className="flex flex-wrap items-center gap-2 mt-1">
					{isAvailable ? (
						<CheckCircle2
							className={`h-5 w-5 shrink-0 ${highlight ? "text-primary" : "text-green-600"}`}
						/>
					) : (
						<XCircle className="h-5 w-5 shrink-0 text-muted-foreground/40" />
					)}
					<span className="font-bold text-4xl tracking-tight break-all">{s.name}</span>
				</div>

				<div className="flex flex-wrap gap-1.5 mt-2">
					{isAvailable ? (
						<Badge className="bg-green-600 hover:bg-green-600 text-[10px] h-4 px-1.5">
							Tersedia
						</Badge>
					) : (
						<Badge variant="secondary" className="text-[10px] h-4 px-1.5">
							Sudah Diambil
						</Badge>
					)}
					{s.is_premium_name && (
						<Badge
							variant="secondary"
							className="border border-amber-400 text-amber-600 text-[10px] h-4 px-1.5"
						>
							Premium
						</Badge>
					)}
					{isAvailable && isPromo && promoData && !s.is_premium_name && (
						<Badge className="bg-primary/80 hover:bg-primary/80 text-primary-foreground text-[10px] h-4 px-1.5">
							Promo
						</Badge>
					)}
				</div>
			</CardHeader>

			<Separator />

			<CardContent className="flex-1 px-5 py-4">
				{isAvailable ? (
					isPromo && promoData && !s.is_premium_name ? (
						<div>
							<div className="flex items-end gap-1">
								<span className="font-extrabold text-3xl tracking-tight">
									{formatIDR(promoData.promoPrice)}
								</span>
								<span className="mb-1 text-muted-foreground text-sm">/thn</span>
							</div>
							<p className="mt-0.5 text-muted-foreground text-xl line-through">
								{formatIDR(promoData.originalPrice)}/thn
							</p>
							<p className="mt-0.5 font-bold text-green-600 text-xl">
								Hemat {formatIDR(promoData.originalPrice - promoData.promoPrice)}
							</p>
						</div>
					) : price ? (
						<div className="flex items-end gap-1">
							<span className="font-extrabold text-3xl tracking-tight">
								{formatIDR(price)}
							</span>
							<span className="mb-1 text-muted-foreground text-sm">/thn</span>
						</div>
					) : null
				) : (
					// ── Domain tidak tersedia: info transfer ──────────────────────
					<div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-800/40 dark:bg-amber-950/30">
						<ArrowLeftRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
						<p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300">
							Domain ini sudah terdaftar. Anda dapat memindahkannya ke layanan kami melalui proses transfer.
						</p>
					</div>
				)}
			</CardContent>

			<CardFooter className="px-5 pb-5">
				{isAvailable ? (
					<Button
						className="w-full gap-2"
						variant={highlight ? "default" : "outline"}
						size="lg"
					>
						<ShoppingCart className="h-4 w-4" />
						Daftar Sekarang
					</Button>
				) : (
					// ── Tombol Transfer ───────────────────────────────────────────
					<Button
						className="w-full gap-2 border-amber-400/50 text-amber-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-400 dark:border-amber-500/40 dark:text-amber-400 dark:hover:bg-amber-950/30 dark:hover:text-amber-300"
						variant="outline"
						size="lg"
						asChild
					>
						<Link
							href={`/dashboard/domain/transfer?domain=${encodeURIComponent(s.name)}`}
						>
							<ArrowLeftRight className="h-4 w-4" />
							Transfer Domain
						</Link>
					</Button>
				)}
			</CardFooter>
		</Card>
	);
}

// ─── Domain List Row ──────────────────────────────────────────────────────────
export function DomainListRow({ s }: { s: DomainSuggestion }) {
	const isAvailable = s.available === 1;
	const { isPromo, promoData, price } = getDomainInfo(s);

	return (
		<div
			className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors ${
				isAvailable
					? "border-border bg-card hover:bg-muted/30"
					: "border-border bg-muted/20"
			}`}
		>
			<div className="flex min-w-0 flex-wrap items-center gap-2">
				{isAvailable ? (
					<CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
				) : (
					<XCircle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
				)}
				<span
					className={`truncate font-mono font-semibold text-xl ${
						!isAvailable ? "text-muted-foreground" : ""
					}`}
				>
					{s.name}
				</span>
				{isAvailable && (
					<Badge className="h-4 shrink-0 bg-green-600 px-1.5 text-[10px] hover:bg-green-600">
						Tersedia
					</Badge>
				)}
				{!isAvailable && (
					<Badge variant="secondary" className="h-4 shrink-0 px-1.5 text-[10px]">
						Sudah Diambil
					</Badge>
				)}
				{s.is_premium_name && (
					<Badge
						variant="secondary"
						className="h-4 shrink-0 border border-amber-400 px-1.5 text-[10px] text-amber-600"
					>
						Premium
					</Badge>
				)}
				{isAvailable && isPromo && promoData && !s.is_premium_name && (
					<Badge className="h-4 shrink-0 bg-primary/80 px-1.5 text-[10px] text-primary-foreground hover:bg-primary/80">
						Promo
					</Badge>
				)}
			</div>

			{/* ── Sisi kanan: harga + aksi ─────────────────────────────────── */}
			<div className="flex shrink-0 items-center gap-3">
				{isAvailable ? (
					<>
						<div className="hidden text-right sm:block">
							{isPromo && promoData && !s.is_premium_name ? (
								<>
									<p className="font-semibold text-xl leading-none">
										{formatIDR(promoData.promoPrice)}/thn
									</p>
									<p className="mt-0.5 text-[10px] text-muted-foreground leading-none line-through">
										{formatIDR(promoData.originalPrice)}
									</p>
								</>
							) : price ? (
								<p className="font-semibold text-xl leading-none">
									{formatIDR(price)}/thn
								</p>
							) : null}
						</div>
						<Button className="h-8 gap-1.5" variant="outline">
							<ShoppingCart className="h-3.5 w-3.5" />
							Daftar
						</Button>
					</>
				) : (
					// ── Tombol Transfer (row) ─────────────────────────────────
					<Button
						className="h-8 gap-1.5 border-amber-400/50 text-amber-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-400 dark:border-amber-500/40 dark:text-amber-400 dark:hover:bg-amber-950/30 dark:hover:text-amber-300"
						variant="outline"
						size="sm"
						asChild
					>
						<Link
							href={`/dashboard/domain/transfer?domain=${encodeURIComponent(s.name)}`}
						>
							<ArrowLeftRight className="h-3.5 w-3.5" />
							Transfer
						</Link>
					</Button>
				)}
			</div>
		</div>
	);
}