// app/domain/page.tsx
// Server Component — tidak ada "use client"
// useSearchParams hanya ada di DomainSearchCard yang dibungkus <Suspense>

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@tanisya/ui/components/accordion";
import { Badge } from "@tanisya/ui/components/badge";
import { Button } from "@tanisya/ui/components/button";
import { Card, CardContent } from "@tanisya/ui/components/card";
import { Input } from "@tanisya/ui/components/input";
import { Separator } from "@tanisya/ui/components/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@tanisya/ui/components/table";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@tanisya/ui/components/tabs";
import {
	ArrowRight,
	Clock,
	Globe,
	HeadphonesIcon,
	Search,
	ShieldCheck,
	ShoppingCart,
	Sparkles,
	Star,
	Zap,
} from "lucide-react";
import { Suspense } from "react";
import { formatIDR } from "@/lib/format-currency";
import {
	ALL_DOMAINS,
	DOMAIN_PRICES,
	type DomainPrice,
	discountPercent,
	PROMOS,
} from "./domain-data";
import { DomainSearchCard } from "./domain-search-card";

// ─── FAQS ─────────────────────────────────────────────────────────────────────
const FAQS = [
	{
		q: "Apa itu domain dan kenapa saya membutuhkannya?",
		a: "Domain adalah alamat unik yang digunakan untuk mengakses website Anda di internet, seperti namatoko.com. Tanpa domain, pengunjung tidak dapat menemukan website Anda dengan mudah.",
	},
	{
		q: "Berapa lama proses aktivasi domain setelah pembayaran?",
		a: "Domain diaktifkan secara otomatis dalam waktu kurang dari 5 menit setelah pembayaran dikonfirmasi.",
	},
	{
		q: "Apakah domain .id dan .co.id berbeda?",
		a: ".id adalah domain tingkat atas untuk Indonesia yang bisa digunakan siapa saja. Sementara .co.id diperuntukkan khusus bagi badan usaha yang terdaftar di Indonesia.",
	},
	{
		q: "Bisakah saya mentransfer domain dari registrar lain?",
		a: "Ya, Anda bisa mentransfer domain yang sudah ada ke layanan kami dengan kode EPP/Auth Code dari registrar lama.",
	},
	{
		q: "Apakah harga yang tertera sudah termasuk pajak?",
		a: "Harga yang ditampilkan belum termasuk PPN 11%. Pajak akan ditampilkan secara transparan saat proses checkout.",
	},
];

// ─── Price Table (pure server-safe, no state) ─────────────────────────────────
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
							<Badge className="h-4 bg-primary/80 px-1.5 text-[10px] text-primary-foreground hover:bg-primary/80">
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
								className={`font-semibold text-[11px] ${col.highlight ? "text-primary" : ""}`}
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

function PriceTable({ items }: { items: DomainPrice[] }) {
	return (
		<>
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
											<Badge className="h-4 bg-primary/80 px-1.5 text-[10px] text-primary-foreground hover:bg-primary/80">
												SALE
											</Badge>
										)}
									</div>
								</TableCell>
								<TableCell>
									<span
										className={`font-semibold ${d.sale ? "text-primary" : ""}`}
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
			<div className="space-y-3 md:hidden">
				{items.map((d) => (
					<DomainCard key={d.tld} d={d} />
				))}
			</div>
		</>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DomainPricingPage() {
	return (
		<div className="bg-background">
			{/* ── Hero / Search ── */}
			<section className="border-b bg-linear-to-b from-primary/10 to-background">
				<div className="mx-auto max-w-5xl px-4 pt-32 pb-16 text-center">
					<div className="mb-8 md:mb-10">
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

					{/*
					  ✅ Suspense wajib di sini karena DomainSearchCard
					  menggunakan useSearchParams() di dalamnya.
					  Fallback: skeleton card dengan tinggi sama
					*/}
					<Suspense
						fallback={
							<div className="mx-auto h-40 max-w-2xl animate-pulse rounded-xl border bg-card" />
						}
					>
						<DomainSearchCard />
					</Suspense>
				</div>
			</section>

			{/* ── Promo ── */}
			<section className="border-b bg-muted/20">
				<div className="mx-auto max-w-5xl px-4 py-10 md:py-12">
					<div className="mb-6 flex items-center gap-3">
						<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
							<Sparkles className="h-4 w-4 text-primary" />
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
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{PROMOS.map((promo) => (
							<Card
								key={promo.tld}
								className="overflow-hidden pt-0 transition-shadow hover:shadow-md"
							>
								<div
									className={`${promo.color} flex items-center justify-between px-4 py-2`}
								>
									<span className="font-semibold text-white text-xs">
										{promo.label}
									</span>
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
										<span className="text-muted-foreground text-xs">/thn</span>
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
				</div>
			</section>

			{/* ── Price List ── */}
			{/*
			  Filter + Tabs butuh useState, tapi TIDAK butuh useSearchParams.
			  Cukup jadikan client component terpisah tanpa perlu Suspense.
			  Di sini kita keep static tabs karena ALL_DOMAINS & DOMAIN_PRICES
			  adalah data statis — tidak ada interaktivitas filter di page ini.
			  Jika ingin filter aktif, bisa extract ke PriceTableClient.
			*/}
			<section className="mx-auto max-w-5xl px-4 py-10">
				<div className="mb-6">
					<h2 className="font-bold text-xl md:text-2xl">Daftar Harga Domain</h2>
					<p className="mt-0.5 text-muted-foreground text-sm">
						Harga dalam Rupiah (IDR), per tahun. Belum termasuk PPN.
					</p>
				</div>

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
							<PriceTable items={items} />
						</TabsContent>
					))}
				</Tabs>

				<Separator className="my-8" />
				<div className="grid grid-cols-1 gap-4 text-muted-foreground text-xs sm:grid-cols-2">
					<div className="flex items-start gap-2">
						<span className="mt-0.5 text-base">📌</span>
						<p>
							<strong className="text-foreground">Catatan Harga:</strong> Harga
							berlaku untuk 1 tahun pertama dan dapat berubah sewaktu-waktu.
						</p>
					</div>
					<div className="flex items-start gap-2">
						<span className="mt-0.5 text-base">💳</span>
						<p>
							<strong className="text-foreground">Metode Pembayaran:</strong>{" "}
							Transfer bank, kartu kredit/debit, QRIS, dan dompet digital.
						</p>
					</div>
				</div>
			</section>

			<Separator />

			{/* ── Value Props ── */}
			<section className="mx-auto max-w-5xl px-4 py-10">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					{[
						{
							icon: Zap,
							title: "Aktivasi Instan",
							description:
								"Domain aktif dalam hitungan menit setelah pembayaran dikonfirmasi.",
						},
						{
							icon: ShieldCheck,
							title: "Keamanan Terjamin",
							description:
								"Privasi data terlindungi dengan enkripsi SSL dan WHOIS protection.",
						},
						{
							icon: HeadphonesIcon,
							title: "Dukungan Teknis",
							description:
								"Tim support siap membantu kapanpun Anda membutuhkan bantuan.",
						},
					].map((f) => (
						<div
							key={f.title}
							className="flex items-start gap-3 rounded-lg border bg-muted/20 p-4 transition-colors hover:bg-muted/40"
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

			{/* ── FAQ ── */}
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

			{/* ── CTA ── */}
			<section className="bg-primary text-primary-foreground">
				<div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
					<div className="flex flex-col items-center justify-between gap-6 md:flex-row">
						<div className="text-center md:text-left">
							<h2 className="mb-2 font-extrabold text-2xl md:text-3xl">
								Siap Memiliki Domain Sendiri?
							</h2>
							<p className="max-w-md text-primary-foreground/80 text-sm md:text-base">
								Jangan biarkan nama domain impian Anda diambil orang lain.
							</p>
						</div>
						<div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row md:w-auto">
							<Button
								size="lg"
								variant="secondary"
								className="w-full gap-2 font-semibold sm:w-auto"
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
