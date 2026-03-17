// app/blog/[slug]/page.tsx
"use client";

import { Badge } from "@tanisya/ui/components/badge";
import { Button } from "@tanisya/ui/components/button";
import { Card, CardContent, CardHeader } from "@tanisya/ui/components/card";
import { Input } from "@tanisya/ui/components/input";
import { Separator } from "@tanisya/ui/components/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@tanisya/ui/components/tooltip";
import {
	ArrowLeft,
	ArrowRight,
	BookOpen,
	CalendarDays,
	CheckCircle2,
	Clock,
	Copy,
	Facebook,
	Link2,
	Rss,
	Tag,
	Twitter,
	User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BlogPost {
	id: string;
	slug: string;
	category: string;
	categoryLabel: string;
	title: string;
	excerpt: string;
	author: string;
	authorRole: string;
	publishedAt: string;
	updatedAt?: string;
	readingTime: number;
	coverColor: string;
	tags: string[];
	content: ContentBlock[];
}

type ContentBlock =
	| { type: "paragraph"; text: string }
	| { type: "heading2"; text: string }
	| { type: "heading3"; text: string }
	| { type: "ul"; items: string[] }
	| { type: "ol"; items: string[] }
	| { type: "callout"; variant: "info" | "warning" | "tip"; text: string }
	| { type: "code"; lang: string; code: string };

interface RelatedPost {
	id: string;
	slug: string;
	title: string;
	categoryLabel: string;
	readingTime: number;
	publishedAt: string;
	coverColor: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const POST: BlogPost = {
	id: "1",
	slug: "cara-install-wordpress-cpanel",
	category: "tutorial",
	categoryLabel: "Tutorial",
	title: "Cara Install WordPress di cPanel dalam 5 Menit",
	excerpt:
		"Panduan lengkap instalasi WordPress melalui Softaculous di cPanel. Cocok untuk pemula yang baru pertama kali membuat website.",
	author: "Andi Pratama",
	authorRole: "Technical Writer",
	publishedAt: "2025-06-10",
	updatedAt: "2025-06-12",
	readingTime: 5,
	coverColor: "from-blue-500/20 to-cyan-500/20",
	tags: ["WordPress", "cPanel", "Pemula", "Softaculous"],
	content: [
		{
			type: "paragraph",
			text: "WordPress adalah CMS (Content Management System) paling populer di dunia, digunakan oleh lebih dari 43% website di internet. Dengan cPanel dan Softaculous, Anda bisa menginstalnya hanya dalam beberapa klik tanpa perlu pengetahuan teknis.",
		},
		{ type: "heading2", text: "Persiapan Sebelum Instalasi" },
		{
			type: "paragraph",
			text: "Sebelum mulai, pastikan Anda sudah memiliki hal-hal berikut:",
		},
		{
			type: "ul",
			items: [
				"Akun hosting aktif dengan akses cPanel",
				"Domain yang sudah diarahkan ke nameserver hosting",
				"Akun email untuk administrator WordPress",
				"Nama website dan deskripsi singkat",
			],
		},
		{
			type: "callout",
			variant: "tip",
			text: "Pastikan domain sudah propagasi penuh (biasanya 1–24 jam setelah pendaftaran) sebelum menginstal WordPress agar prosesnya berjalan lancar.",
		},
		{ type: "heading2", text: "Langkah-langkah Instalasi" },
		{ type: "heading3", text: "1. Masuk ke cPanel" },
		{
			type: "paragraph",
			text: "Buka browser dan akses cPanel Anda melalui alamat domain-anda.com/cpanel atau melalui link yang dikirim di email aktivasi hosting. Masukkan username dan password yang diberikan.",
		},
		{ type: "heading3", text: "2. Buka Softaculous Apps Installer" },
		{
			type: "paragraph",
			text: "Setelah masuk ke cPanel, scroll ke bagian Software dan klik Softaculous Apps Installer. Di panel Softaculous, cari WordPress di kolom pencarian atau klik ikon WordPress yang tersedia di halaman utama.",
		},
		{ type: "heading3", text: "3. Mulai Proses Instalasi" },
		{
			type: "ol",
			items: [
				"Klik tombol Install Now pada halaman WordPress di Softaculous",
				"Pilih protokol: https:// (pastikan SSL sudah aktif)",
				"Pilih domain tujuan instalasi dari dropdown",
				"Kosongkan kolom In Directory jika ingin install di root domain",
				"Isi Site Name dan Site Description sesuai website Anda",
				"Buat username dan password admin yang kuat",
				"Masukkan email admin yang valid",
				"Klik Install untuk memulai",
			],
		},
		{
			type: "callout",
			variant: "warning",
			text: "Jangan gunakan 'admin' sebagai username WordPress Anda karena mudah ditebak oleh penyerang. Gunakan kombinasi huruf dan angka yang unik.",
		},
		{ type: "heading3", text: "4. Tunggu Proses Selesai" },
		{
			type: "paragraph",
			text: "Softaculous akan mengunduh dan mengkonfigurasi WordPress secara otomatis. Proses ini biasanya memakan waktu 1–2 menit. Setelah selesai, Anda akan menerima notifikasi dan link ke website serta halaman admin WordPress.",
		},
		{ type: "heading2", text: "Mengakses Dashboard WordPress" },
		{
			type: "paragraph",
			text: "WordPress Anda kini sudah siap! Akses dashboard admin melalui domain-anda.com/wp-admin dan login dengan credential yang tadi dibuat.",
		},
		{
			type: "code",
			lang: "bash",
			code: "# URL Dashboard Admin\nhttps://domain-anda.com/wp-admin\n\n# Atau shortcut\nhttps://domain-anda.com/wp-login.php",
		},
		{
			type: "callout",
			variant: "info",
			text: "Setelah instalasi, segera pasang plugin keamanan seperti Wordfence atau iThemes Security dan aktifkan SSL untuk melindungi website Anda.",
		},
		{ type: "heading2", text: "Langkah Selanjutnya" },
		{
			type: "paragraph",
			text: "Selamat! WordPress Anda berhasil diinstal. Berikut beberapa langkah yang disarankan setelah instalasi:",
		},
		{
			type: "ul",
			items: [
				"Pilih dan pasang tema yang sesuai dari WordPress Theme Directory",
				"Install plugin SEO seperti Yoast SEO atau Rank Math",
				"Konfigurasi pengaturan permalink menjadi /%postname%/",
				"Buat halaman Beranda, Tentang, dan Kontak",
				"Aktifkan fitur backup otomatis dari cPanel",
			],
		},
	],
};

const RELATED: RelatedPost[] = [
	{
		id: "2",
		slug: "tips-keamanan-website-2025",
		title: "10 Tips Keamanan Website yang Wajib Diterapkan di 2025",
		categoryLabel: "Tips & Trik",
		readingTime: 8,
		publishedAt: "2025-06-05",
		coverColor: "from-rose-500/20 to-orange-500/20",
	},
	{
		id: "6",
		slug: "optimasi-kecepatan-wordpress",
		title: "7 Plugin WordPress Terbaik untuk Mempercepat Loading Website",
		categoryLabel: "Tips & Trik",
		readingTime: 7,
		publishedAt: "2025-05-15",
		coverColor: "from-sky-500/20 to-indigo-500/20",
	},
	{
		id: "3",
		slug: "perbedaan-shared-vps-dedicated",
		title: "Shared Hosting vs VPS vs Dedicated: Mana yang Tepat untuk Anda?",
		categoryLabel: "Panduan",
		readingTime: 10,
		publishedAt: "2025-05-28",
		coverColor: "from-violet-500/20 to-purple-500/20",
	},
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("id-ID", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

// ─── Content Renderer ─────────────────────────────────────────────────────────
function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
	const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

	function handleCopy(code: string, i: number) {
		navigator.clipboard.writeText(code);
		setCopiedIndex(i);
		setTimeout(() => setCopiedIndex(null), 2000);
	}

	return (
		// min-w-0 penting agar flex child tidak memaksa lebar meluber
		<div className="min-w-0 space-y-5">
			{blocks.map((block, i) => {
				if (block.type === "paragraph") {
					return (
						<p
							key={i}
							className="break-words text-foreground/90 text-sm leading-7"
						>
							{block.text}
						</p>
					);
				}

				if (block.type === "heading2") {
					return (
						<h2
							key={i}
							className="mt-8 mb-1 border-b pb-2 font-bold text-base tracking-tight sm:text-lg"
						>
							{block.text}
						</h2>
					);
				}

				if (block.type === "heading3") {
					return (
						<h3
							key={i}
							className="mt-5 mb-1 font-semibold text-sm sm:text-base"
						>
							{block.text}
						</h3>
					);
				}

				if (block.type === "ul") {
					return (
						<ul key={i} className="space-y-2">
							{block.items.map((item, j) => (
								<li
									key={j}
									className="flex items-start gap-2 text-foreground/90 text-sm"
								>
									<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
									<span className="min-w-0 break-words">{item}</span>
								</li>
							))}
						</ul>
					);
				}

				if (block.type === "ol") {
					return (
						<ol key={i} className="space-y-2">
							{block.items.map((item, j) => (
								<li
									key={j}
									className="flex items-start gap-2.5 text-foreground/90 text-sm"
								>
									<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-[11px] text-primary">
										{j + 1}
									</span>
									<span className="min-w-0 break-words">{item}</span>
								</li>
							))}
						</ol>
					);
				}

				if (block.type === "callout") {
					const styles = {
						info: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-200",
						warning:
							"bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200",
						tip: "bg-green-50 border-green-200 text-green-900 dark:bg-green-950/30 dark:border-green-800 dark:text-green-200",
					};
					const labels = {
						info: "ℹ Info",
						warning: "⚠ Perhatian",
						tip: "💡 Tips",
					};
					return (
						<div
							key={i}
							className={`rounded-lg border px-3 py-3 text-sm leading-relaxed sm:px-4 ${styles[block.variant]}`}
						>
							<span className="mr-1.5 font-semibold text-xs uppercase tracking-wide">
								{labels[block.variant]}
							</span>
							<span className="break-words">{block.text}</span>
						</div>
					);
				}

				if (block.type === "code") {
					return (
						// overflow-hidden di wrapper, overflow-x-auto di pre — kode bisa scroll horizontal di mobile
						<div key={i} className="overflow-hidden rounded-lg border bg-muted">
							<div className="flex items-center justify-between border-b bg-muted/80 px-3 py-2 sm:px-4">
								<span className="font-mono text-muted-foreground text-xs">
									{block.lang}
								</span>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												onClick={() => handleCopy(block.code, i)}
												className="flex items-center gap-1 rounded px-2 py-0.5 text-muted-foreground text-xs transition-colors hover:bg-background hover:text-foreground"
											>
												{copiedIndex === i ? (
													<CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
												) : (
													<Copy className="h-3.5 w-3.5" />
												)}
												<span className="hidden sm:inline">
													{copiedIndex === i ? "Tersalin" : "Salin"}
												</span>
											</button>
										</TooltipTrigger>
										<TooltipContent>Salin kode</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
							{/* overflow-x-auto agar kode panjang bisa di-scroll, tidak meluber */}
							<pre className="overflow-x-auto px-3 py-4 text-xs leading-6 sm:px-4">
								<code className="whitespace-pre font-mono">{block.code}</code>
							</pre>
						</div>
					);
				}

				return null;
			})}
		</div>
	);
}

// ─── Cover Placeholder ────────────────────────────────────────────────────────
function CoverPlaceholder({
	coverColor,
	className = "",
}: {
	coverColor: string;
	className?: string;
}) {
	return (
		<div
			className={`flex items-center justify-center bg-gradient-to-br ${coverColor} ${className}`}
		>
			<BookOpen className="h-12 w-12 text-foreground/10 sm:h-16 sm:w-16" />
		</div>
	);
}

// ─── Related Card ─────────────────────────────────────────────────────────────
function RelatedCard({ post }: { post: RelatedPost }) {
	return (
		<Link href={`/blog/${post.slug}`} className="block">
			<Card className="group transition-: overflow-hidden border-border">
				<div
					className={`flex h-20 items-center justify-center bg-gradient-to-br sm:h-24 ${post.coverColor}`}
				>
					<BookOpen className="h-7 w-7 text-foreground/20 sm:h-8 sm:w-8" />
				</div>
				<CardHeader className="px-3 pt-3 pb-3 sm:px-4">
					<Badge variant="secondary" className="mb-1 w-fit text-[10px]">
						{post.categoryLabel}
					</Badge>
					<h4 className="line-clamp-2 min-w-0 break-words font-semibold text-xs leading-snug transition-colors group-hover:text-primary">
						{post.title}
					</h4>
					<div className="mt-2 flex items-center justify-between gap-2">
						<span className="flex items-center gap-1 text-[10px] text-muted-foreground">
							<Clock className="h-3 w-3 shrink-0" />
							{post.readingTime} mnt
						</span>
						<span className="flex shrink-0 items-center gap-0.5 font-medium text-[10px] text-primary">
							Baca
							<ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
						</span>
					</div>
				</CardHeader>
			</Card>
		</Link>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BlogDetailPage() {
	const [copiedUrl, setCopiedUrl] = useState(false);

	function handleCopyUrl() {
		navigator.clipboard.writeText(window.location.href);
		setCopiedUrl(true);
		setTimeout(() => setCopiedUrl(false), 2000);
	}

	const toc = POST.content
		.filter(
			(b): b is { type: "heading2"; text: string } => b.type === "heading2",
		)
		.map((b) => b.text);

	return (
		// overflow-x-hidden pada root mencegah horizontal scroll di level halaman
		<div className="bg-background">
			{/* ── Cover ── */}
			<CoverPlaceholder
				coverColor={POST.coverColor}
				className="h-44 w-full sm:h-56 md:h-72 lg:h-80"
			/>

			{/* ── Main container ── */}
			<div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
				{/* overlap cover sedikit dengan -mt */}
				<div className="relative -mt-4 grid grid-cols-1 gap-6 sm:-mt-6 lg:grid-cols-[1fr_272px] lg:gap-8">
					{/* ── Article column ── */}
					{/* min-w-0 wajib agar grid child tidak memaksa lebar lebih dari kolom */}
					<article className="min-w-0">
						{/* ── Header Card ── */}
						<Card className="mb-5 overflow-hidden border-border">
							<CardHeader className="px-4 pt-5 pb-5 sm:px-6">
								{/* Back + Category */}
								<div className="mb-4 flex flex-wrap items-center gap-2">
									<Button
										variant="ghost"
										size="sm"
										className="h-7 gap-1.5 px-2 text-xs"
										asChild
									>
										<Link href="/blog">
											<ArrowLeft className="h-3.5 w-3.5" />
											Kembali ke Blog
										</Link>
									</Button>
									<Separator orientation="vertical" className="h-6" />
									<Badge variant="default" className="text-xs">
										{POST.categoryLabel}
									</Badge>
								</div>

								{/* Title */}
								<h1 className="wrap-break-word font-extrabold text-xl leading-tight tracking-tight sm:text-2xl md:text-3xl">
									{POST.title}
								</h1>

								{/* Excerpt */}
								<p className="wrap-break-word mt-2 text-muted-foreground text-sm leading-relaxed">
									{POST.excerpt}
								</p>

								<Separator className="my-4" />

								{/* Meta — wrap di mobile */}
								<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-xs">
									<span className="flex items-center gap-1">
										<CalendarDays className="h-3.5 w-3.5 shrink-0" />
										<span>{formatDate(POST.publishedAt)}</span>
									</span>

									{POST.updatedAt && POST.updatedAt !== POST.publishedAt && (
										<span className="text-[11px] text-muted-foreground/60">
											(diperbarui {formatDate(POST.updatedAt)})
										</span>
									)}

									<span className="flex items-center gap-1">
										<Clock className="h-3.5 w-3.5 shrink-0" />
										{POST.readingTime} menit baca
									</span>
								</div>

								{/* Tags */}
								<div className="mt-4 flex flex-wrap gap-1.5">
									{POST.tags.map((tag) => (
										<span
											key={tag}
											className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted/80"
										>
											<Tag className="h-2.5 w-2.5 shrink-0" />
											{tag}
										</span>
									))}
								</div>
							</CardHeader>
						</Card>

						{/* ── Content Card ── */}
						<Card className="overflow-hidden border-border">
							<CardContent className="px-4 py-5 sm:px-6 sm:py-6">
								<ContentRenderer blocks={POST.content} />
							</CardContent>
						</Card>

						{/* ── Share ── */}
						<div className="mt-5 rounded-lg border bg-muted/20 px-4 py-4">
							<p className="mb-3 font-medium text-sm">Bagikan artikel ini</p>
							{/* flex-wrap agar tidak overflow di layar kecil */}
							<div className="flex flex-wrap items-center gap-2">
								<Button size="sm" variant="outline" className="gap-1.5 text-xs">
									<Twitter className="h-3.5 w-3.5" />
									Twitter
								</Button>
								<Button size="sm" variant="outline" className="gap-1.5 text-xs">
									<Facebook className="h-3.5 w-3.5" />
									Facebook
								</Button>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												size="sm"
												variant="outline"
												className="gap-1.5 text-xs"
												onClick={handleCopyUrl}
											>
												{copiedUrl ? (
													<CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
												) : (
													<Link2 className="h-3.5 w-3.5" />
												)}
												{copiedUrl ? "Tersalin!" : "Salin Link"}
											</Button>
										</TooltipTrigger>
										<TooltipContent>Salin URL artikel</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</div>

						{/* ── Related Posts — mobile only (lg: tampil di sidebar) ── */}
						<div className="mt-8 lg:hidden">
							<h3 className="mb-4 font-bold text-base">Artikel Terkait</h3>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
								{RELATED.map((r) => (
									<RelatedCard key={r.id} post={r} />
								))}
							</div>
						</div>
					</article>

					{/* ── Sidebar — hanya desktop ── */}
					{/* min-w-0 dan w-0 min di kolom ini untuk mencegah overflow grid */}
					<aside className="hidden min-w-0 lg:block">
						<div className="sticky top-16 space-y-4">
							{/* Author */}
							<Card className="border-border">
								<CardHeader className="px-4 py-0">
									<p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
										Penulis
									</p>
								</CardHeader>
								<CardContent className="px-4 pb-4">
									<div className="flex items-center gap-3">
										<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
											<User className="h-4 w-4 text-primary" />
										</div>
										<div className="min-w-0">
											<p className="truncate font-semibold text-sm">
												{POST.author}
											</p>
											<p className="truncate text-muted-foreground text-xs">
												{POST.authorRole}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Table of Contents */}
							<Card className="border-border">
								<CardHeader className="px-4 py-0">
									<p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
										Daftar Isi
									</p>
								</CardHeader>
								<CardContent className="px-4 pb-4">
									<ol className="space-y-2">
										{toc.map((heading, i) => (
											<li key={i}>
												<button className="flex w-full items-start gap-2 text-left text-muted-foreground text-xs transition-colors hover:text-primary">
													<span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-[10px]">
														{i + 1}
													</span>
													<span className="min-w-0 break-words">{heading}</span>
												</button>
											</li>
										))}
									</ol>
								</CardContent>
							</Card>

							{/* Related */}
							<Card className="border-none!">
								<CardHeader className="px-4 py-0">
									<p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
										Artikel Terkait
									</p>
								</CardHeader>
								<CardContent className="flex flex-col gap-3 px-4 pt-0 pb-4">
									{RELATED.map((r) => (
										<RelatedCard key={r.id} post={r} />
									))}
								</CardContent>
							</Card>
						</div>
					</aside>
				</div>

				{/* ── Bottom Nav ── */}
				<div className="my-8 flex items-center justify-between gap-3 border-t pt-6 sm:my-10 sm:gap-4 sm:pt-8">
					<Button
						variant="outline"
						size="sm"
						className="gap-1.5 text-xs sm:text-sm"
						asChild
					>
						<Link href="/blog">
							<ArrowLeft className="h-4 w-4 shrink-0" />
							<span className="hidden sm:inline">Artikel Sebelumnya</span>
							<span className="sm:hidden">Sebelumnya</span>
						</Link>
					</Button>

					<Button
						variant="ghost"
						size="sm"
						className="shrink-0 text-muted-foreground text-xs"
						asChild
					>
						<Link href="/blog">
							<BookOpen className="mr-1.5 h-3.5 w-3.5" />
							<span className="hidden sm:inline">Semua Artikel</span>
						</Link>
					</Button>

					<Button
						variant="outline"
						size="sm"
						className="gap-1.5 text-xs sm:text-sm"
					>
						<span className="hidden sm:inline">Artikel Berikutnya</span>
						<span className="sm:hidden">Berikutnya</span>
						<ArrowRight className="h-4 w-4 shrink-0" />
					</Button>
				</div>
			</div>

			<Separator />

			{/* ── Newsletter CTA ── */}
			<section className="border-t bg-primary/5">
				<div className="mx-auto max-w-5xl px-4 py-10 text-center sm:px-6 md:py-12">
					<h2 className="mb-2 font-bold text-xl md:text-2xl">
						Artikel Seperti Ini Langsung di Inbox Anda
					</h2>
					<p className="mx-auto mb-6 max-w-md text-muted-foreground text-sm">
						Daftar newsletter dan dapatkan tips hosting, tutorial terbaru, dan
						promo eksklusif setiap minggu.
					</p>
					<div className="mx-auto flex max-w-sm flex-col gap-2 sm:flex-row">
						<Input
							placeholder="email@domain.com"
							type="email"
							className="text-sm"
						/>
						<Button className="shrink-0 gap-2">
							<Rss className="h-4 w-4" />
							Berlangganan
						</Button>
					</div>
					<p className="mt-3 text-muted-foreground text-xs">
						Gratis, bisa berhenti berlangganan kapan saja.
					</p>
				</div>
			</section>
		</div>
	);
}
