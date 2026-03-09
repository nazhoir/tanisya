// app/domain-pricing/page.tsx
"use client";

import {
	AlertCircle,
	ArrowRight,
	CheckCircle2,
	Clock,
	Globe,
	HeadphonesIcon,
	Search,
	ShieldCheck,
	ShoppingCart,
	Sparkles,
	Star,
	Tag,
	XCircle,
	Zap,
} from "lucide-react";
import { useState } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@tanisya/ui/components/accordion";
import { Alert, AlertDescription } from "@tanisya/ui/components/alert";
import { Badge } from "@tanisya/ui/components/badge";
import { Button } from "@tanisya/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@tanisya/ui/components/card";
import { Input } from "@tanisya/ui/components/input";
import { Separator } from "@tanisya/ui/components/separator";
import { Skeleton } from "@tanisya/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@tanisya/ui/components/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tanisya/ui/components/tabs";
import { formatIDR } from "@/lib/format-currency";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DomainPrice {
	tld: string;
	register: number;
	renew: number;
	transfer: number;
	popular?: boolean;
	sale?: boolean;
}

interface DomainSuggestion {
	name: string;
	available: 0 | 1;
	message: string;
	is_premium_name?: boolean;
	premium_registration_price?: number | null;
}

interface CheckApiResponse {
	success: boolean;
	total: number;
	suggestions: DomainSuggestion[];
}

type CheckStatus = "idle" | "loading" | "success" | "error";

// ─── Data ─────────────────────────────────────────────────────────────────────
const DOMAIN_PRICES: Record<string, DomainPrice[]> = {
	popular: [
		{
			tld: ".com",
			register: 149000,
			renew: 189000,
			transfer: 149000,
			popular: true,
		},
		{
			tld: ".net",
			register: 169000,
			renew: 199000,
			transfer: 169000,
			popular: true,
		},
		{
			tld: ".org",
			register: 159000,
			renew: 189000,
			transfer: 159000,
			popular: true,
		},
		{
			tld: ".id",
			register: 350000,
			renew: 399000,
			transfer: 350000,
			popular: true,
		},
		{
			tld: ".co.id",
			register: 250000,
			renew: 299000,
			transfer: 250000,
			popular: true,
		},
		{ tld: ".io", register: 699000, renew: 799000, transfer: 699000 },
		{ tld: ".co", register: 399000, renew: 449000, transfer: 399000 },
		{
			tld: ".info",
			register: 99000,
			renew: 149000,
			transfer: 99000,
			sale: true,
		},
	],
	business: [
		{ tld: ".biz", register: 189000, renew: 219000, transfer: 189000 },
		{ tld: ".company", register: 249000, renew: 279000, transfer: 249000 },
		{ tld: ".business", register: 299000, renew: 329000, transfer: 299000 },
		{
			tld: ".shop",
			register: 199000,
			renew: 249000,
			transfer: 199000,
			sale: true,
		},
		{ tld: ".store", register: 299000, renew: 349000, transfer: 299000 },
		{ tld: ".market", register: 349000, renew: 399000, transfer: 349000 },
		{ tld: ".agency", register: 379000, renew: 419000, transfer: 379000 },
		{ tld: ".consulting", register: 449000, renew: 499000, transfer: 449000 },
	],
	technology: [
		{ tld: ".tech", register: 499000, renew: 549000, transfer: 499000 },
		{ tld: ".app", register: 299000, renew: 349000, transfer: 299000 },
		{ tld: ".dev", register: 249000, renew: 299000, transfer: 249000 },
		{ tld: ".cloud", register: 349000, renew: 399000, transfer: 349000 },
		{ tld: ".digital", register: 299000, renew: 349000, transfer: 299000 },
		{ tld: ".software", register: 449000, renew: 499000, transfer: 449000 },
		{ tld: ".network", register: 379000, renew: 419000, transfer: 379000 },
		{ tld: ".systems", register: 399000, renew: 449000, transfer: 399000 },
	],
	creative: [
		{ tld: ".design", register: 449000, renew: 499000, transfer: 449000 },
		{ tld: ".art", register: 299000, renew: 349000, transfer: 299000 },
		{ tld: ".media", register: 349000, renew: 399000, transfer: 349000 },
		{ tld: ".studio", register: 379000, renew: 419000, transfer: 379000 },
		{ tld: ".photo", register: 399000, renew: 449000, transfer: 399000 },
		{ tld: ".video", register: 449000, renew: 499000, transfer: 449000 },
		{
			tld: ".blog",
			register: 249000,
			renew: 299000,
			transfer: 249000,
			sale: true,
		},
		{ tld: ".page", register: 199000, renew: 249000, transfer: 199000 },
	],
};

// TLD priority order: promo first, then popular
const PROMO_TLDS = [".com", ".id", ".co.id", ".net"];
const POPULAR_TLDS = [
	".com",
	".net",
	".org",
	".id",
	".co.id",
	".io",
	".co",
	".info",
];

const PROMOS = [
	{
		tld: ".com",
		originalPrice: 149000,
		promoPrice: 99000,
		label: "Flash Sale",
		color: "bg-rose-500",
		until: "31 Maret 2025",
		icon: Zap,
	},
	{
		tld: ".id",
		originalPrice: 350000,
		promoPrice: 199000,
		label: "Promo Nasional",
		color: "bg-blue-600",
		until: "30 April 2025",
		icon: Star,
	},
	{
		tld: ".co.id",
		originalPrice: 250000,
		promoPrice: 149000,
		label: "Harga Spesial",
		color: "bg-violet-600",
		until: "30 April 2025",
		icon: Tag,
	},
	{
		tld: ".net",
		originalPrice: 169000,
		promoPrice: 89000,
		label: "Limited",
		color: "bg-amber-500",
		until: "15 April 2025",
		icon: Clock,
	},
];

const ALL_DOMAINS = Object.values(DOMAIN_PRICES).flat();

const FAQS = [
	{
		q: "Apa itu domain dan kenapa saya membutuhkannya?",
		a: "Domain adalah alamat unik yang digunakan untuk mengakses website Anda di internet, seperti namatoko.com. Tanpa domain, pengunjung tidak dapat menemukan website Anda dengan mudah. Domain juga membangun kredibilitas dan identitas brand Anda secara online.",
	},
	{
		q: "Berapa lama proses aktivasi domain setelah pembayaran?",
		a: "Domain diaktifkan secara otomatis dalam waktu kurang dari 5 menit setelah pembayaran dikonfirmasi. Anda akan menerima informasi DNS dan panel manajemen domain melalui email yang terdaftar.",
	},
	{
		q: "Apakah domain .id dan .co.id berbeda?",
		a: ".id adalah domain tingkat atas untuk Indonesia yang bisa digunakan siapa saja. Sementara .co.id diperuntukkan khusus bagi badan usaha atau perusahaan yang terdaftar di Indonesia, dan memerlukan dokumen verifikasi saat pendaftaran.",
	},
	{
		q: "Bisakah saya mentransfer domain dari registrar lain?",
		a: "Ya, Anda bisa mentransfer domain yang sudah ada ke layanan kami. Prosesnya membutuhkan kode EPP/Auth Code dari registrar lama dan biasanya memakan waktu 5–7 hari kerja. Harga transfer sama dengan harga registrasi, dan masa aktif domain akan diperpanjang 1 tahun.",
	},
	{
		q: "Apa yang terjadi jika domain saya habis masa aktifnya?",
		a: "Domain yang tidak diperpanjang akan masuk masa grace period selama 30 hari, di mana Anda masih bisa memperpanjang dengan harga normal. Setelah itu, domain masuk masa redemption selama 30 hari berikutnya dengan biaya pemulihan tambahan. Jika tetap tidak diperpanjang, domain akan dilepas ke publik.",
	},
	{
		q: "Apakah harga yang tertera sudah termasuk pajak?",
		a: "Harga yang ditampilkan belum termasuk PPN 11%. Pajak akan dihitung dan ditampilkan secara transparan saat proses checkout sebelum Anda melakukan pembayaran.",
	},
];



const getTld = (domainName: string) =>
	"." + domainName.split(".").slice(1).join(".");

const getPriceByTld = (tld: string): number | undefined =>
	ALL_DOMAINS.find((d) => d.tld === tld)?.register;

const discountPercent = (original: number, promo: number) =>
	Math.round(((original - promo) / original) * 100);

/**
 * Sort suggestions:
 * 1. If the input already contains an extension → that exact domain first
 * 2. Available before unavailable
 * 3. Among available: promo TLDs first, then popular TLDs, then the rest
 */
function sortSuggestions(
	suggestions: DomainSuggestion[],
	inputHasExtension: boolean,
	exactDomain: string,
): DomainSuggestion[] {
	return [...suggestions].sort((a, b) => {
		// Exact match always first
		if (inputHasExtension) {
			if (a.name === exactDomain) return -1;
			if (b.name === exactDomain) return 1;
		}

		// Available before unavailable
		if (a.available !== b.available) return b.available - a.available;

		// Among available: promo → popular → rest
		if (a.available === 1) {
			const aTld = getTld(a.name);
			const bTld = getTld(b.name);
			const aPromo = PROMO_TLDS.indexOf(aTld);
			const bPromo = PROMO_TLDS.indexOf(bTld);
			const aPopular = POPULAR_TLDS.indexOf(aTld);
			const bPopular = POPULAR_TLDS.indexOf(bTld);

			// Both in promo list
			if (aPromo !== -1 && bPromo !== -1) return aPromo - bPromo;
			if (aPromo !== -1) return -1;
			if (bPromo !== -1) return 1;

			// Both in popular list
			if (aPopular !== -1 && bPopular !== -1) return aPopular - bPopular;
			if (aPopular !== -1) return -1;
			if (bPopular !== -1) return 1;
		}

		return 0;
	});
}

// ─── Skeleton for checker results ─────────────────────────────────────────────
function ResultSkeleton() {
	return (
		<div className="mt-4 space-y-2">
			{[...Array(6)].map((_, i) => (
				<div
					key={i}
					className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5"
				>
					<div className="flex flex-1 items-center gap-2">
						<Skeleton className="h-4 w-4 shrink-0 rounded-full" />
						<Skeleton className="h-4 w-36 rounded" />
						<Skeleton className="h-4 w-16 rounded-full" />
					</div>
					<Skeleton className="h-7 w-20 rounded" />
				</div>
			))}
		</div>
	);
}

// ─── Skeleton for price table ──────────────────────────────────────────────────
function TableSkeleton() {
	return (
		<div className="overflow-hidden rounded-md border">
			{/* header */}
			<div className="grid grid-cols-5 gap-4 bg-muted/50 px-5 py-3">
				{[140, 120, 130, 120, 80].map((w, i) => (
					<Skeleton key={i} className={"h-4 rounded"} style={{ width: w }} />
				))}
			</div>
			{/* rows */}
			{[...Array(8)].map((_, i) => (
				<div
					key={i}
					className={`grid grid-cols-5 gap-4 border-t px-5 py-3.5 ${i % 2 === 1 ? "bg-muted/20" : ""}`}
				>
					<div className="flex items-center gap-2">
						<Skeleton className="h-4 w-12 rounded" />
						{i % 3 === 0 && <Skeleton className="h-4 w-14 rounded-full" />}
					</div>
					<Skeleton className="h-4 w-24 rounded" />
					<Skeleton className="h-4 w-24 rounded" />
					<Skeleton className="h-4 w-20 rounded" />
					<div className="flex justify-end">
						<Skeleton className="h-7 w-20 rounded" />
					</div>
				</div>
			))}
		</div>
	);
}

// ─── Mobile skeleton ──────────────────────────────────────────────────────────
function CardsSkeleton() {
	return (
		<div className="space-y-3">
			{[...Array(5)].map((_, i) => (
				<Card key={i}>
					<CardContent className="p-4">
						<div className="mb-3 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Skeleton className="h-6 w-14 rounded" />
								<Skeleton className="h-4 w-16 rounded-full" />
							</div>
							<Skeleton className="h-7 w-20 rounded" />
						</div>
						<div className="grid grid-cols-3 gap-2">
							{[0, 1, 2].map((j) => (
								<div key={j} className="space-y-1.5 rounded bg-muted/50 p-2">
									<Skeleton className="h-3 w-full rounded" />
									<Skeleton className="mx-auto h-3 w-3/4 rounded" />
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

// ─── Price Table ──────────────────────────────────────────────────────────────
function DomainCard({ d }: { d: DomainPrice }) {
	return (
		<Card>
			<CardContent className="p-4">
				<div className="mb-3 flex items-center justify-between">
					<div className="flex flex-wrap items-center gap-2">
						<span className="font-bold font-mono text-lg text-primary">
							{d.tld}
						</span>
						{d.popular && (
							<Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
								<Star className="mr-0.5 h-2.5 w-2.5" />
								Populer
							</Badge>
						)}
						{d.sale && (
							<Badge className="h-4 bg-rose-500 px-1.5 text-[10px] hover:bg-rose-500">
								SALE
							</Badge>
						)}
					</div>
					<Button
						size="sm"
						variant="outline"
						className="h-7 shrink-0 gap-1 text-xs"
					>
						<ShoppingCart className="h-3 w-3" />
						Daftar
					</Button>
				</div>
				<div className="grid grid-cols-3 gap-2 text-xs">
					{[
						{ label: "Registrasi", value: d.register, highlight: d.sale },
						{ label: "Perpanjangan", value: d.renew },
						{ label: "Transfer", value: d.transfer },
					].map((col) => (
						<div
							key={col.label}
							className="rounded bg-muted/50 p-2 text-center"
						>
							<p className="mb-0.5 text-muted-foreground">{col.label}</p>
							<p
								className={`font-semibold text-[11px] ${col.highlight ? "text-rose-600" : ""}`}
							>
								{formatIDR(col.value)}
							</p>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function PriceTable({
	items,
	loading = false,
}: {
	items: DomainPrice[];
	loading?: boolean;
}) {
	if (loading) {
		return (
			<>
				<div className="hidden md:block">
					<TableSkeleton />
				</div>
				<div className="md:hidden">
					<CardsSkeleton />
				</div>
			</>
		);
	}

	return (
		<>
			{/* Desktop */}
			<div className="hidden rounded-md border md:block">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/50">
							<TableHead className="w-44 font-semibold">Ekstensi</TableHead>
							<TableHead className="font-semibold">Registrasi / thn</TableHead>
							<TableHead className="font-semibold">
								Perpanjangan / thn
							</TableHead>
							<TableHead className="font-semibold">Transfer</TableHead>
							<TableHead className="text-right font-semibold">Aksi</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.map((d) => (
							<TableRow
								key={d.tld}
								className="transition-colors hover:bg-muted/30"
							>
								<TableCell>
									<div className="flex items-center gap-2">
										<span className="font-bold font-mono text-primary">
											{d.tld}
										</span>
										{d.popular && (
											<Badge
												variant="secondary"
												className="h-4 px-1.5 text-[10px]"
											>
												<Star className="mr-0.5 h-2.5 w-2.5" />
												Populer
											</Badge>
										)}
										{d.sale && (
											<Badge className="h-4 bg-rose-500 px-1.5 text-[10px] hover:bg-rose-500">
												SALE
											</Badge>
										)}
									</div>
								</TableCell>
								<TableCell>
									<span
										className={`font-semibold ${d.sale ? "text-rose-600" : ""}`}
									>
										{formatIDR(d.register)}
									</span>
								</TableCell>
								<TableCell className="text-muted-foreground">
									{formatIDR(d.renew)}
								</TableCell>
								<TableCell className="text-muted-foreground">
									{formatIDR(d.transfer)}
								</TableCell>
								<TableCell className="text-right">
									<Button
										size="sm"
										variant="outline"
										className="h-7 gap-1 text-xs"
									>
										<ShoppingCart className="h-3 w-3" />
										Daftar
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Mobile */}
			<div className="space-y-3 md:hidden">
				{items.map((d) => (
					<DomainCard key={d.tld} d={d} />
				))}
			</div>
		</>
	);
}

// ─── Promo skeleton ───────────────────────────────────────────────────────────
function PromoSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{[...Array(4)].map((_, i) => (
				<Card key={i} className="overflow-hidden">
					<Skeleton className="h-9 w-full rounded-none" />
					<CardContent className="space-y-3 p-4">
						<Skeleton className="h-8 w-16 rounded" />
						<Skeleton className="h-6 w-28 rounded" />
						<Skeleton className="h-3 w-20 rounded" />
						<Skeleton className="h-3 w-32 rounded" />
						<Skeleton className="h-8 w-full rounded" />
					</CardContent>
				</Card>
			))}
		</div>
	);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DomainPricingPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [domainInput, setDomainInput] = useState("");
	const [suggestions, setSuggestions] = useState<DomainSuggestion[]>([]);
	const [checkStatus, setCheckStatus] = useState<CheckStatus>("idle");
	const [errorMsg, setErrorMsg] = useState("");
	const [promoLoaded, setPromoLoaded] = useState(true); // flip to false if you lazy-load
	const [tableLoaded, setTableLoaded] = useState(true); // flip to false if you lazy-load

	const handleCheck = async () => {
		const raw = domainInput.trim().replace(/^https?:\/\//, "");
		if (!raw) return;

		setCheckStatus("loading");
		setSuggestions([]);
		setErrorMsg("");

		try {
			const res = await fetch(`/api/domain/check?domain=${raw}`, {
				method: "GET",
			});

			if (!res.ok) throw new Error(`Server error: ${res.status}`);

			const data: CheckApiResponse = await res.json();
			if (!data.success) throw new Error("Respons server tidak valid.");

			const inputHasExt = raw.includes(".");
			const exactDomain = raw;
			const sorted = sortSuggestions(
				data.suggestions,
				inputHasExt,
				exactDomain,
			);

			setSuggestions(sorted);
			setCheckStatus("success");
		} catch (err) {
			setErrorMsg(
				err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.",
			);
			setCheckStatus("error");
		}
	};

	const isFiltering = searchQuery.length > 0;
	const filteredDomains = isFiltering
		? ALL_DOMAINS.filter((d) =>
				d.tld.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		: null;

	return (
		<div className="bg-background">
			<section className="border-b bg-linear-to-b from-primary/10 to-background">
				<div className="mx-auto max-w-5xl px-4 text-center pb-16 pt-32">
					<div className="mb-8 text-center md:mb-10">
						<div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-xs">
							<Globe className="h-3.5 w-3.5" />
							Daftar Harga Domain Terbaru
						</div>
						<h1 className="mb-3 font-extrabold text-3xl tracking-tight md:text-4xl lg:text-5xl">
							Cari Domain untuk
							<br className="hidden sm:block" /> Website Anda
						</h1>
						<p className="mx-auto max-w-lg text-base text-muted-foreground md:text-lg">
							Temukan dan daftarkan nama domain impian Anda dengan harga
							terjangkau.
						</p>
					</div>

					{/* Checker Card */}
					<Card className="mx-auto max-w-2xl shadow-md">
						<CardHeader className="px-5 pt-5 pb-2">
							<CardTitle className="flex items-center gap-2 font-semibold text-sm">
								<Search className="h-4 w-4 text-primary" />
								Cek Ketersediaan Domain
							</CardTitle>
							<CardDescription className="text-xs">
								Ketik nama brand Anda — kami akan cek ketersediaannya di
								berbagai ekstensi
							</CardDescription>
						</CardHeader>

						<CardContent className="px-5 pb-5">
							{/* Input row */}
							<div className="flex flex-col gap-2 sm:flex-row">
								<Input
									placeholder="Contoh: tokobuku atau tokobuku.com"
									value={domainInput}
									onChange={(e) => setDomainInput(e.target.value)}
									onKeyDown={(e) =>
										e.key === "Enter" &&
										checkStatus !== "loading" &&
										handleCheck()
									}
									className="h-10 flex-1"
									disabled={checkStatus === "loading"}
								/>
								<Button
									onClick={handleCheck}
									disabled={checkStatus === "loading" || !domainInput.trim()}
									className="h-10 w-full shrink-0 gap-2 sm:w-auto"
								>
									{checkStatus === "loading" ? (
										<>
											<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
											Mengecek...
										</>
									) : (
										<>
											<Search className="h-4 w-4" />
											Cek Sekarang
										</>
									)}
								</Button>
							</div>

							{/* Error */}
							{checkStatus === "error" && (
								<Alert variant="destructive" className="mt-3">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription className="text-xs">
										{errorMsg}
									</AlertDescription>
								</Alert>
							)}

							{/* Loading skeleton */}
							{checkStatus === "loading" && <ResultSkeleton />}

							{/* Results */}
							{checkStatus === "success" && suggestions.length > 0 && (
								<div className="mt-4 space-y-2">
									{suggestions.map((s, idx) => {
										const isAvailable = s.available === 1;
										const tld = getTld(s.name);
										const price =
											s.is_premium_name && s.premium_registration_price
												? s.premium_registration_price
												: getPriceByTld(tld);
										const isPromo = PROMO_TLDS.includes(tld);
										const promoData = PROMOS.find((p) => p.tld === tld);
										const isFirst = idx === 0;

										return (
											<div
												key={s.name}
												className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 transition-colors ${
													isAvailable
														? isFirst
															? "border-green-300 bg-green-50 ring-1 ring-green-300 dark:border-green-700 dark:bg-green-950/40"
															: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
														: "border-border bg-muted/40"
												}`}
											>
												{/* Left: status + name + badges */}
												<div className="flex min-w-0 flex-wrap items-center gap-2">
													{isAvailable ? (
														<CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
													) : (
														<XCircle className="h-4 w-4 shrink-0 text-muted-foreground/50" />
													)}

													<span className="truncate font-mono font-semibold text-sm">
														{s.name}
													</span>

													{isAvailable && (
														<Badge className="h-4 shrink-0 bg-green-600 px-1.5 text-[10px] hover:bg-green-600">
															Tersedia
														</Badge>
													)}
													{!isAvailable && (
														<Badge
															variant="secondary"
															className="h-4 shrink-0 px-1.5 text-[10px]"
														>
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
													{isAvailable &&
														isPromo &&
														promoData &&
														!s.is_premium_name && (
															<Badge className="h-4 shrink-0 bg-rose-500 px-1.5 text-[10px] hover:bg-rose-500">
																Promo
															</Badge>
														)}
												</div>

												{/* Right: price + button */}
												{isAvailable && (
													<div className="flex shrink-0 items-center gap-2">
														<div className="hidden text-right sm:block">
															{isPromo && promoData && !s.is_premium_name ? (
																<>
																	<p className="font-bold text-rose-600 text-xs leading-none">
																		{formatIDR(promoData.promoPrice)}/thn
																	</p>
																	<p className="mt-0.5 text-[10px] text-muted-foreground leading-none line-through">
																		{formatIDR(promoData.originalPrice)}
																	</p>
																</>
															) : price ? (
																<p className="font-semibold text-green-700 text-xs leading-none dark:text-green-400">
																	{formatIDR(price)}/thn
																</p>
															) : null}
														</div>
														<Button
															size="sm"
															className={`h-7 gap-1 text-xs ${
																s.is_premium_name
																	? "bg-amber-500 hover:bg-amber-600"
																	: isPromo
																		? "bg-rose-500 hover:bg-rose-600"
																		: "bg-green-600 hover:bg-green-700"
															}`}
														>
															<ShoppingCart className="h-3 w-3" />
															<span className="xs:inline hidden">Daftar</span>
														</Button>
													</div>
												)}
											</div>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</section>

			{/* ══════════════════════════════
          PROMO DOMAIN
      ══════════════════════════════ */}
			<section className="border-b bg-muted/20">
				<div className="mx-auto max-w-5xl px-4 py-10 md:py-12">
					<div className="mb-6 flex items-center gap-3">
						<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/40">
							<Sparkles className="h-4 w-4 text-rose-500" />
						</div>
						<div>
							<h2 className="font-bold text-lg md:text-xl">
								Promo Domain Terbatas
							</h2>
							<p className="text-muted-foreground text-xs">
								Harga spesial untuk waktu terbatas. Daftarkan sekarang sebelum
								kehabisan.
							</p>
						</div>
					</div>

					{!promoLoaded ? (
						<PromoSkeleton />
					) : (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
							{PROMOS.map((promo) => (
								<Card
									key={promo.tld}
									className="overflow-hidden pt-0 transition-shadow hover:shadow-md"
								>
									<div
										className={`${promo.color} flex items-center justify-between px-4 py-2`}
									>
										<div className="flex items-center gap-1.5 font-semibold text-white text-xs">
											<promo.icon className="h-3.5 w-3.5" />
											{promo.label}
										</div>
										<Badge className="border-0 bg-white/20 px-1.5 text-[10px] text-white hover:bg-white/20">
											-{discountPercent(promo.originalPrice, promo.promoPrice)}%
										</Badge>
									</div>
									<CardContent className="p-4">
										<p className="mb-1 font-extrabold font-mono text-2xl text-primary">
											{promo.tld}
										</p>
										<div className="mb-0.5 flex items-baseline gap-1.5">
											<span className="font-bold text-xl">
												{formatIDR(promo.promoPrice)}
											</span>
											<span className="text-muted-foreground text-xs">
												/thn
											</span>
										</div>
										<p className="mb-3 text-muted-foreground text-xs line-through">
											{formatIDR(promo.originalPrice)}
										</p>
										<div className="mb-4 flex items-center gap-1 text-[11px] text-muted-foreground">
											<Clock className="h-3 w-3 shrink-0" />
											<span>Berlaku s/d {promo.until}</span>
										</div>
										<Button size="sm" className="h-8 w-full gap-1 text-xs">
											<ShoppingCart className="h-3 w-3" />
											Daftar Sekarang
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>
			</section>

			{/* ══════════════════════════════
          PRICE LIST
      ══════════════════════════════ */}
			<section className="mx-auto max-w-5xl px-4 py-10">
				<div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<div>
						<h2 className="font-bold text-xl md:text-2xl">
							Daftar Harga Domain
						</h2>
						<p className="mt-0.5 text-muted-foreground text-sm">
							Harga dalam Rupiah (IDR), per tahun. Belum termasuk PPN.
						</p>
					</div>
					<div className="relative w-full sm:w-64">
						<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Filter: .com, .id, .shop…"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="h-9 pl-9 text-sm"
						/>
					</div>
				</div>

				{/* Filtered or Tabbed */}
				{isFiltering ? (
					filteredDomains!.length === 0 ? (
						<p className="py-8 text-center text-muted-foreground text-sm">
							Tidak ada ekstensi yang cocok dengan &ldquo;{searchQuery}&rdquo;
						</p>
					) : (
						<PriceTable items={filteredDomains!} loading={!tableLoaded} />
					)
				) : (
					<Tabs defaultValue="popular">
						<TabsList className="mb-5 grid h-auto w-full grid-cols-4 sm:flex sm:w-auto">
							<TabsTrigger value="popular" className="gap-1 text-xs sm:text-sm">
								<Star className="hidden h-3 w-3 shrink-0 sm:block" />
								Populer
							</TabsTrigger>
							<TabsTrigger value="business" className="text-xs sm:text-sm">
								Bisnis
							</TabsTrigger>
							<TabsTrigger value="technology" className="text-xs sm:text-sm">
								Teknologi
							</TabsTrigger>
							<TabsTrigger value="creative" className="text-xs sm:text-sm">
								Kreatif
							</TabsTrigger>
						</TabsList>
						{Object.entries(DOMAIN_PRICES).map(([cat, items]) => (
							<TabsContent key={cat} value={cat}>
								<PriceTable items={items} loading={!tableLoaded} />
							</TabsContent>
						))}
					</Tabs>
				)}

				<Separator className="my-8" />
				<div className="grid grid-cols-1 gap-4 text-muted-foreground text-xs sm:grid-cols-2">
					<div className="flex items-start gap-2">
						<span className="mt-0.5 text-base">📌</span>
						<p>
							<strong className="text-foreground">Catatan Harga:</strong> Harga
							berlaku untuk 1 tahun pertama dan dapat berubah sewaktu-waktu.
							Harga perpanjangan mungkin berbeda dari harga registrasi awal.
						</p>
					</div>
					<div className="flex items-start gap-2">
						<span className="mt-0.5 text-base">💳</span>
						<p>
							<strong className="text-foreground">Metode Pembayaran:</strong>{" "}
							Transfer bank, kartu kredit/debit, QRIS, dan dompet digital.
							Transaksi diamankan SSL 256-bit.
						</p>
					</div>
				</div>
			</section>

			<Separator />

			{/* ══════════════════════════════
          VALUE PROPS
      ══════════════════════════════ */}
			<section className="mx-auto max-w-5xl px-4 py-10">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					{[
						{
							icon: Zap,
							title: "Aktivasi Instan",
							description: "Domain aktif dalam hitungan menit setelah pembayaran dikonfirmasi.",
						},
						{
							icon: ShieldCheck,
							title: "Keamanan Terjamin",
							description: "Privasi data terlindungi dengan enkripsi SSL dan WHOIS protection.",
						},
						{
							icon: HeadphonesIcon,
							title: "Dukungan Teknis",
							description: "Tim support siap membantu kapanpun Anda membutuhkan bantuan.",
						},
					].map((f) => (
						<div
							key={f.title}
							className="flex items-start gap-3 rounded-lg border bg-muted/20 p-4"
						>
							<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
								<f.icon className="h-4 w-4 text-primary" />
							</div>
							<div>
								<p className="mb-0.5 font-semibold text-sm">{f.title}</p>
								<p className="text-muted-foreground text-xs leading-relaxed">
									{f.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</section>

			<Separator />

			{/* ══════════════════════════════
          FAQ
      ══════════════════════════════ */}
			<section className="mx-auto max-w-2xl px-4 py-10 md:py-14">
				<div className="mb-8 text-center">
					<h2 className="mb-2 font-bold text-xl md:text-2xl">
						Pertanyaan Umum
					</h2>
					<p className="text-muted-foreground text-sm">
						Tidak menemukan jawaban yang dicari?{" "}
						<button className="text-primary underline underline-offset-2 hover:no-underline">
							Hubungi kami
						</button>
					</p>
				</div>

				<Accordion type="single" collapsible className="w-full space-y-2">
					{FAQS.map((faq, i) => (
						<AccordionItem
							key={i}
							value={`faq-${i}`}
							className="rounded-lg border px-4 data-[state=open]:bg-muted/20"
						>
							<AccordionTrigger className="py-4 text-left font-medium text-sm hover:no-underline">
								{faq.q}
							</AccordionTrigger>
							<AccordionContent className="pb-4 text-muted-foreground text-sm leading-relaxed">
								{faq.a}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</section>

			<Separator />

			{/* ══════════════════════════════
          CTA BANNER
      ══════════════════════════════ */}
			<section className="bg-primary text-primary-foreground">
				<div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
					<div className="flex flex-col items-center justify-between gap-6 md:flex-row">
						<div className="text-center md:text-left">
							<h2 className="mb-2 font-extrabold text-2xl md:text-3xl">
								Siap Memiliki Domain Sendiri?
							</h2>
							<p className="max-w-md text-primary-foreground/80 text-sm md:text-base">
								Jangan biarkan nama domain impian Anda diambil orang lain.
								Daftarkan sekarang dan mulai bangun identitas online Anda.
							</p>
						</div>
						<div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row md:w-auto">
							<Button
								size="lg"
								variant="secondary"
								className="w-full gap-2 font-semibold sm:w-auto"
								onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
							>
								<Search className="h-4 w-4" />
								Cek Domain Saya
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="w-full gap-2 border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
							>
								Lihat Semua Promo
								<ArrowRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
