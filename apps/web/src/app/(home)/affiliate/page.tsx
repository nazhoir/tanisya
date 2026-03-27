import { Button } from "@tanisya/ui/components/button";
import {
	ArrowRight,
	BadgePercent,
	BarChart3,
	Building2,
	CheckCircle2,
	ChevronRight,
	Clock,
	CreditCard,
	Gift,
	Globe,
	HandCoins,
	Heart,
	HeartHandshake,
	Landmark,
	LayoutDashboard,
	Link2,
	MessageCircle,
	Phone,
	Rocket,
	Shield,
	ShoppingBag,
	Sparkles,
	Star,
	TrendingUp,
	Users,
	Wallet,
	Zap,
} from "lucide-react";
import Link from "next/link";

// ─── Data ─────────────────────────────────────────────────────────────────────

const HERO_STATS = [
	{ value: "Rp 15rb", label: "Daftar + Beli Pertama" },
	{ value: "Rp 5rb", label: "Per Pembelian Produk" },
	{ value: "500+", label: "Mitra Aktif" },
	{ value: "14 hari", label: "Siklus Pembayaran" },
];

// Flat commission — two reward cards (no tiers)
const COMMISSION_CARDS = [
	{
		id: "signup",
		icon: Users,
		label: "Referral Pendaftar Baru + Pembelian",
		amount: "Rp 15.000",
		amountSub: "saldo akun per referral yang beli",
		color: "border-primary/60 shadow-lg shadow-primary/10",
		accentBg: "bg-primary/5",
		accentText: "text-primary",
		iconBg: "bg-primary/10 text-primary",
		description:
			"Saldo Rp 15.000 diberikan ketika referralmu mendaftar akun baru via link-mu, lalu melakukan pembelian produk apapun. Kedua syarat harus terpenuhi agar komisi ini cair.",
		perks: [
			"Syarat 1 — referral daftar akun via link afiliasimu",
			"Syarat 2 — referral melakukan pembelian produk apapun",
			"Saldo masuk otomatis setelah transaksi pertama berhasil",
			"Tidak ada batas jumlah referral yang bisa didaftarkan",
		],
	},
	{
		id: "purchase",
		icon: ShoppingBag,
		label: "Referral Pembelian Produk",
		amount: "Rp 5.000",
		amountSub: "per transaksi produk apapun",
		color: "border-amber-400/60 shadow-lg shadow-amber-400/10",
		accentBg: "bg-amber-50 dark:bg-amber-500/5",
		accentText: "text-amber-600 dark:text-amber-400",
		iconBg:
			"bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
		description:
			"Setiap kali seseorang membeli produk apapun di Tanisya menggunakan link afiliasimu, kamu mendapat Rp 5.000 flat — berlaku untuk hosting, domain, VPS, template, dan semua layanan lainnya.",
		perks: [
			"Flat Rp 5.000 untuk semua kategori produk",
			"Berlaku juga untuk perpanjangan langganan",
			"Cookie tracking 90 hari setelah klik link",
			"Komisi bisa menumpuk tanpa batas atas",
		],
	},
];

const HOW_IT_WORKS = [
	{
		step: "01",
		icon: Link2,
		title: "Daftar & Dapatkan Link",
		description:
			"Daftar program afiliasi gratis dalam 2 menit. Kamu langsung mendapat link referral unik dan akses ke dashboard.",
	},
	{
		step: "02",
		icon: Users,
		title: "Bagikan ke Audiensmu",
		description:
			"Promosikan Tanisya ke komunitasmu — konten blog, media sosial, grup WhatsApp, atau rekomendasi langsung.",
	},
	{
		step: "03",
		icon: BarChart3,
		title: "Pantau & Optimalkan",
		description:
			"Lacak klik, konversi, dan komisi secara real-time dari dashboard afiliasi. Data lengkap untuk optimalkan strategi.",
	},
	{
		step: "04",
		icon: Wallet,
		title: "Terima Komisimu",
		description:
			"Komisi dicairkan otomatis ke rekening BCA, Mandiri, atau e-wallet setiap 14 hari. Minimum pencairan Rp 100 ribu.",
	},
];

const AFFILIATE_FEATURES = [
	{
		icon: LayoutDashboard,
		title: "Dashboard Real-Time",
		description:
			"Pantau klik, konversi, dan earnings langsung dari satu dashboard yang clean dan intuitif.",
	},
	{
		icon: CreditCard,
		title: "Pencairan Fleksibel",
		description:
			"Transfer bank (BCA, Mandiri, BRI, BNI) atau GoPay & OVO. Tidak ada biaya admin pencairan.",
	},
	{
		icon: Gift,
		title: "Bonus Milestone",
		description:
			"Bonus tambahan setiap mencapai milestone referral. Semakin aktif, semakin besar bonusmu.",
	},
	{
		icon: Shield,
		title: "Cookie 90 Hari",
		description:
			"Tracking cookie berlaku 90 hari. Jika referralmu beli 3 bulan setelah klik, kamu tetap dapat komisi.",
	},
	{
		icon: Globe,
		title: "Materi Promosi Lengkap",
		description:
			"Banner, caption siap pakai, video penjelasan, dan studi kasus — semua tersedia untuk kamu download.",
	},
	{
		icon: TrendingUp,
		title: "Komisi Recurring",
		description:
			"Untuk mitra Pro, komisi terus mengalir setiap kali pelanggan referralmu memperpanjang layanan.",
	},
];

const AFFILIATE_TESTIMONIALS = [
	{
		name: "Andi Firmansyah",
		role: "Tech Blogger · 45rb followers",
		avatar: "AF",
		color: "bg-blue-500",
		earning: "Rp 2.4 juta / bulan",
		text: "Saya nulis review jujur tentang Tanisya di blog. Dalam 3 bulan sudah masuk tier Growth. Konversinya tinggi karena produknya memang bagus — jualan jadi mudah.",
	},
	{
		name: "Maya Setiawati",
		role: "Digital Agency Owner",
		avatar: "MS",
		color: "bg-violet-500",
		earning: "Rp 1.8 juta / bulan",
		text: "Klien agensi saya butuh hosting — saya rekomendasikan Tanisya sambil dapat komisi. Win-win. Dashboard afiliasinya super mudah dilacak.",
	},
	{
		name: "Reza Mahendra",
		role: "YouTuber Tech · 120rb subs",
		avatar: "RM",
		color: "bg-emerald-500",
		earning: "Rp 4.1 juta / bulan",
		text: "Dari satu video review, komisi mengalir selama berbulan-bulan karena cookie 90 hari. Di tier Pro sekarang dan ada dedicated manager yang supportif banget.",
	},
];

// B2B
const B2B_PLANS = [
	{
		icon: Building2,
		title: "Reseller",
		tag: "Mulai dari nol",
		tagColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
		description:
			"Jual layanan Tanisya dengan brand sendiri. Dapatkan harga reseller eksklusif dan margin keuntungan yang kompetitif untuk dibanderol ke klienmu.",
		benefits: [
			"Harga reseller hingga 40% di bawah harga publik",
			"White-label panel manajemen klien",
			"Billing dan invoice otomatis",
			"Dukungan teknis via channel khusus reseller",
			"Modul training untuk timmu",
		],
		cta: "Daftar Reseller",
	},
	{
		icon: Rocket,
		title: "Technology Partner",
		tag: "Integrasi mendalam",
		tagColor: "bg-primary/10 text-primary",
		description:
			"Integrasikan layanan Tanisya ke dalam produk atau platform kamu. Cocok untuk SaaS, tools developer, atau platform manajemen bisnis.",
		benefits: [
			"Akses API dan webhook penuh",
			"Sandbox environment untuk development",
			"Joint go-to-market campaign",
			"Co-branding di website & materi Tanisya",
			"Revenue sharing model yang fleksibel",
		],
		cta: "Diskusi Integrasi",
	},
	{
		icon: Users,
		title: "Agency Partner",
		tag: "Untuk agensi digital",
		tagColor: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
		description:
			"Program khusus untuk agensi digital, web developer freelance, dan konsultan IT yang ingin menawarkan hosting premium ke kliennya.",
		benefits: [
			"Komisi lebih tinggi dari program afiliasi biasa",
			"Priority onboarding untuk klien referral",
			"Dedicated account manager",
			"Bundling dengan layanan custom website Tanisya",
			"Akses lead sharing dua arah",
		],
		cta: "Gabung Agency Partner",
	},
];

const B2B_STATS = [
	{ value: "40%", label: "Diskon reseller maks." },
	{ value: "200+", label: "Mitra B2B aktif" },
	{ value: "< 48j", label: "Respons aplikasi" },
	{ value: "0", label: "Biaya pendaftaran" },
];

// Non-profit
const NONPROFIT_TIERS = [
	{
		org: "Yayasan & LSM",
		icon: Heart,
		discount: "50%",
		description:
			"Diskon 50% untuk yayasan dan LSM yang terdaftar secara legal di Indonesia.",
		requirements: [
			"Akta pendirian yayasan",
			"NPWP yayasan",
			"Surat keterangan aktif kegiatan",
		],
	},
	{
		org: "Komunitas & Forum",
		icon: Users,
		discount: "30%",
		description:
			"Diskon 30% untuk komunitas belajar, forum diskusi, dan kelompok kepentingan publik.",
		requirements: [
			"Deskripsi komunitas & aktivitas",
			"Bukti keaktifan (media sosial / grup)",
			"Minimal 50 anggota aktif",
		],
	},
	{
		org: "Lembaga Pendidikan",
		icon: Landmark,
		discount: "40%",
		description:
			"Diskon 40% untuk sekolah, universitas, pesantren, dan lembaga kursus non-komersial.",
		requirements: [
			"NPSN atau izin operasional",
			"Surat keterangan instansi",
			"Peruntukan non-komersial",
		],
	},
];

const NONPROFIT_BENEFITS = [
	{
		icon: HandCoins,
		title: "Diskon Hingga 50%",
		description:
			"Tidak ada persyaratan kontrak jangka panjang. Bayar bulanan dengan harga khusus.",
	},
	{
		icon: HeartHandshake,
		title: "Support Diprioritaskan",
		description:
			"Mitra non-profit mendapat prioritas support yang sama dengan pelanggan enterprise.",
	},
	{
		icon: Sparkles,
		title: "Konsultasi Teknis Gratis",
		description:
			"Sesi konsultasi setup 2 jam bersama tim teknis kami, gratis untuk mitra non-profit baru.",
	},
	{
		icon: Zap,
		title: "Perpanjangan Otomatis",
		description:
			"Kami kirimkan notifikasi perpanjangan 30 hari sebelumnya agar tidak ada gangguan layanan.",
	},
];

const NONPROFIT_TESTIMONIALS = [
	{
		name: "Komunitas Belajar Coding ID",
		role: "Komunitas Developer · 8.000+ anggota",
		avatar: "CB",
		color: "bg-emerald-500",
		text: "Sebagai komunitas non-profit, anggaran kami terbatas. Program non-profit Tanisya membantu kami mengelola server untuk platform belajar dengan biaya yang sangat terjangkau.",
	},
	{
		name: "Yayasan Literasi Digital",
		role: "Yayasan Pendidikan",
		avatar: "YL",
		color: "bg-blue-500",
		text: "Tidak hanya dapat diskon 50%, kami juga mendapat bantuan setup server dari tim teknis Tanisya. Sangat membantu misi kami menjangkau lebih banyak pelajar.",
	},
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AffiliatePage() {
	return (
		<>
			<main className="w-full">
				{/* ── HERO ─────────────────────────────────────────────────────────── */}
				<section className="relative flex min-h-[70svh] items-center">
					<div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
						<div className="absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary/10 blur-[100px] sm:h-125 sm:w-125" />
						<div className="absolute top-1/4 right-0 h-40 w-40 rounded-full bg-amber-500/8 blur-[80px] sm:h-64 sm:w-64" />
						<div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-emerald-500/6 blur-[80px] sm:h-56 sm:w-56" />
					</div>

					<div className="mx-auto w-full max-w-5xl px-4 pt-24 pb-14 sm:px-6 sm:pt-36">
						<div className="flex flex-col items-center text-center">
							<div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 font-semibold text-primary text-xs sm:mb-6 sm:px-4 sm:text-sm">
								<BadgePercent className="h-3.5 w-3.5 shrink-0" />
								<span className="truncate">
									Program Afiliasi · Partner B2B · Mitra Non-Profit
								</span>
							</div>

							<h1 className="mb-4 text-balance font-extrabold text-[1.875rem] leading-[1.1] tracking-tight sm:mb-5 sm:text-5xl lg:text-[3.75rem]">
								Tumbuh bersama Tanisya,{" "}
								<span className="relative inline-block">
									<span className="bg-linear-to-r from-primary to-blue-500 bg-clip-text text-transparent">
										raih penghasilan nyata
									</span>
									<span className="absolute -bottom-1 left-0 h-0.75 w-full rounded-full bg-linear-to-r from-primary to-blue-500 opacity-30" />
								</span>
							</h1>

							<p className="mb-7 max-w-sm text-muted-foreground text-sm leading-relaxed sm:max-w-xl sm:text-base lg:text-lg">
								Rekomendasikan Tanisya dan dapatkan saldo akun otomatis —{" "}
								<strong className="text-foreground">Rp 15.000</strong> ketika
								referralmu daftar lalu beli produk pertamanya, ditambah{" "}
								<strong className="text-foreground">Rp 5.000</strong> flat untuk
								setiap transaksi berikutnya via link afiliasimu. Atau kolaborasi
								lebih dalam sebagai mitra B2B dan non-profit.
							</p>

							<div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
								<a href="#afiliasi" className="w-full sm:w-auto">
									<Button
										size="lg"
										className="h-12 w-full gap-2 px-6 font-bold text-sm shadow-lg shadow-primary/20 sm:px-8 sm:text-base"
									>
										Mulai Afiliasi <BadgePercent className="h-4 w-4 shrink-0" />
									</Button>
								</a>
								<a href="#kerjasama" className="w-full sm:w-auto">
									<Button
										size="lg"
										variant="outline"
										className="h-12 w-full gap-2 px-6 text-sm sm:px-8 sm:text-base"
									>
										Program Kerja Sama{" "}
										<ChevronRight className="h-4 w-4 shrink-0" />
									</Button>
								</a>
							</div>

							<p className="mt-3 text-muted-foreground text-xs">
								Daftar gratis · Tidak ada target wajib · Cairkan kapanpun
							</p>

							<div className="mt-10 grid w-full grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/70 bg-border/25 sm:grid-cols-4">
								{HERO_STATS.map(({ value, label }) => (
									<div
										key={label}
										className="flex flex-col items-center gap-0.5 bg-background/90 px-2 py-4 sm:px-6 sm:py-5"
									>
										<span className="font-extrabold text-xl tracking-tight sm:text-3xl">
											{value}
										</span>
										<span className="text-[10px] text-muted-foreground sm:text-xs">
											{label}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</section>

				{/* ── CARA KERJA ───────────────────────────────────────────────────── */}
				<section className="border-border/60 border-y bg-muted/20 py-12 sm:py-20 lg:py-28">
					<div className="mx-auto max-w-7xl px-4 sm:px-6">
						<div className="mb-7 text-center sm:mb-12">
							<p className="mb-1.5 font-bold text-[11px] text-primary uppercase tracking-[0.15em]">
								Cara Kerja
							</p>
							<h2 className="font-extrabold text-xl tracking-tight sm:text-3xl">
								Mulai dapat komisi dalam 4 langkah
							</h2>
							<p className="mx-auto mt-2 max-w-lg text-muted-foreground text-sm sm:text-base">
								Tidak perlu keahlian teknis khusus. Siapapun bisa jadi afiliasi
								Tanisya.
							</p>
						</div>

						<div className="relative">
							<div className="absolute top-[2.75rem] right-0 left-0 hidden h-px bg-border/60 lg:block" />
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
								{HOW_IT_WORKS.map(
									({ step, icon: Icon, title, description }) => (
										<div
											key={step}
											className="relative flex flex-col items-start gap-3 lg:items-center lg:px-6 lg:text-center"
										>
											<div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background font-extrabold text-primary text-sm shadow-sm">
												{step}
											</div>
											<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
												<Icon className="h-4 w-4" />
											</div>
											<div>
												<h3 className="mb-1 font-bold text-sm sm:text-base">
													{title}
												</h3>
												<p className="text-muted-foreground text-xs leading-relaxed">
													{description}
												</p>
											</div>
										</div>
									),
								)}
							</div>
						</div>
					</div>
				</section>

				{/* ── STRUKTUR KOMISI (FLAT) ────────────────────────────────────── */}
				<section id="afiliasi" className="py-12 sm:py-20 lg:py-28">
					<div className="mx-auto max-w-7xl px-4 sm:px-6">
						<div className="mb-7 text-center sm:mb-12">
							<p className="mb-1.5 font-bold text-[11px] text-primary uppercase tracking-[0.15em]">
								Struktur Komisi
							</p>
							<h2 className="font-extrabold text-xl tracking-tight sm:text-3xl">
								Sederhana, flat, dan transparan
							</h2>
							<p className="mx-auto mt-2 max-w-lg text-muted-foreground text-sm sm:text-base">
								Tidak ada tier rumit, tidak ada syarat minimum. Kamu dapat saldo
								akun otomatis untuk setiap referral yang berhasil.
							</p>
						</div>

						{/* Two commission cards side by side */}
						<div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
							{COMMISSION_CARDS.map(
								({
									id,
									icon: Icon,
									label,
									amount,
									amountSub,
									color,
									accentBg,
									accentText,
									iconBg,
									description,
									perks,
								}) => (
									<div
										key={id}
										className={`relative flex flex-col rounded-2xl border-2 bg-background p-6 ${color}`}
									>
										{/* Header */}
										<div className="mb-5 flex items-center gap-3">
											<div
												className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
											>
												<Icon className="h-5 w-5" />
											</div>
											<h3 className="font-extrabold text-sm leading-tight sm:text-base">
												{label}
											</h3>
										</div>

										{/* Amount highlight */}
										<div className={`mb-5 rounded-xl p-5 ${accentBg}`}>
											<div
												className={`font-extrabold text-5xl tracking-tight ${accentText}`}
											>
												{amount}
											</div>
											<p className="mt-1 text-muted-foreground text-xs">
												{amountSub}
											</p>
										</div>

										{/* Description */}
										<p className="mb-5 text-muted-foreground text-xs leading-relaxed sm:text-sm">
											{description}
										</p>

										{/* Perks */}
										<ul className="mb-6 flex flex-1 flex-col gap-2.5">
											{perks.map((perk) => (
												<li
													key={perk}
													className="flex items-start gap-2 text-xs sm:text-sm"
												>
													<CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
													<span>{perk}</span>
												</li>
											))}
										</ul>
									</div>
								),
							)}
						</div>

						{/* Combined CTA below both cards */}
						<div className="mx-auto mt-5 max-w-4xl rounded-2xl border border-border/60 bg-muted/30 p-5 text-center sm:p-6">
							<p className="mb-1 font-bold text-sm sm:text-base">
								Keduanya berlaku bersamaan — satu link, dua sumber komisi
							</p>
							<p className="mb-5 text-muted-foreground text-xs sm:text-sm">
								Jika referralmu mendaftar lalu langsung beli produk, kamu dapat{" "}
								<strong className="text-foreground">
									Rp 15.000 (bonus daftar+beli) + Rp 5.000 (komisi transaksi) =
									Rp 20.000
								</strong>{" "}
								sekaligus.
							</p>
							<a href="/affiliate/daftar">
								<Button className="h-10 gap-1.5 px-8 font-semibold shadow-md shadow-primary/15">
									Daftar Afiliasi Sekarang — Gratis{" "}
									<ArrowRight className="h-3.5 w-3.5" />
								</Button>
							</a>
						</div>
					</div>
				</section>

				{/* ── FITUR AFILIASI ───────────────────────────────────────────────── */}
				<section className="border-border/60 border-y bg-muted/20 py-12 sm:py-20 lg:py-28">
					<div className="mx-auto max-w-7xl px-4 sm:px-6">
						<div className="mb-7 text-center sm:mb-12">
							<p className="mb-1.5 font-bold text-[11px] text-primary uppercase tracking-[0.15em]">
								Fitur Program
							</p>
							<h2 className="font-extrabold text-xl tracking-tight sm:text-3xl">
								Semua yang kamu butuhkan untuk sukses
							</h2>
						</div>

						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
							{AFFILIATE_FEATURES.map(({ icon: Icon, title, description }) => (
								<div
									key={title}
									className="flex items-start gap-4 rounded-2xl border border-border/60 bg-background p-5 transition-all hover:border-primary/30 hover:shadow-md"
								>
									<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
										<Icon className="h-5 w-5" />
									</div>
									<div>
										<h3 className="mb-1 font-bold text-sm sm:text-base">
											{title}
										</h3>
										<p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
											{description}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* ── TESTIMONI AFILIASI ───────────────────────────────────────────── */}
				<section className="py-12 sm:py-20 lg:py-28">
					<div className="mx-auto max-w-7xl px-4 sm:px-6">
						<div className="mb-7 text-center sm:mb-12">
							<p className="mb-1.5 font-bold text-[11px] text-primary uppercase tracking-[0.15em]">
								Kisah Sukses Afiliasi
							</p>
							<h2 className="font-extrabold text-xl tracking-tight sm:text-3xl">
								Mereka sudah membuktikannya
							</h2>
						</div>

						<div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
							{AFFILIATE_TESTIMONIALS.map(
								({ name, role, avatar, color, earning, text }) => (
									<div
										key={name}
										className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-background p-5"
									>
										<div
											className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 font-bold text-xs ${color} text-white`}
										>
											<TrendingUp className="h-3 w-3" /> {earning}
										</div>
										<p className="flex-1 text-muted-foreground text-sm leading-relaxed">
											"{text}"
										</p>
										<div className="flex items-center gap-3 border-border/50 border-t pt-4">
											<div
												className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color} font-bold text-white text-xs`}
											>
												{avatar}
											</div>
											<div className="min-w-0">
												<p className="truncate font-semibold text-sm">{name}</p>
												<p className="truncate text-[11px] text-muted-foreground">
													{role}
												</p>
											</div>
										</div>
									</div>
								),
							)}
						</div>
					</div>
				</section>

				{/* ── KERJA SAMA B2B ───────────────────────────────────────────────── */}
				<section
					id="kerjasama"
					className="border-border/60 border-t bg-muted/20 py-12 sm:py-20 lg:py-28"
				>
					<div className="mx-auto max-w-7xl px-4 sm:px-6">
						<div className="mb-7 text-center sm:mb-12">
							<p className="mb-1.5 font-bold text-[11px] text-primary uppercase tracking-[0.15em]">
								Program B2B
							</p>
							<h2 className="font-extrabold text-xl tracking-tight sm:text-3xl">
								Kerja sama yang saling menguntungkan
							</h2>
							<p className="mx-auto mt-2 max-w-xl text-muted-foreground text-sm sm:text-base">
								Lebih dari sekadar afiliasi — bangun bisnis bersama Tanisya
								sebagai mitra strategis dengan akses eksklusif, margin lebih
								tinggi, dan dukungan penuh.
							</p>
						</div>

						{/* B2B Stats */}
						<div className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/70 bg-border/25 sm:grid-cols-4">
							{B2B_STATS.map(({ value, label }) => (
								<div
									key={label}
									className="flex flex-col items-center gap-0.5 bg-background/90 px-2 py-4 sm:px-6 sm:py-5"
								>
									<span className="font-extrabold text-xl tracking-tight sm:text-3xl">
										{value}
									</span>
									<span className="text-[10px] text-muted-foreground sm:text-xs">
										{label}
									</span>
								</div>
							))}
						</div>

						{/* B2B Plans */}
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
							{B2B_PLANS.map(
								({
									icon: Icon,
									title,
									tag,
									tagColor,
									description,
									benefits,
									cta,
								}) => (
									<div
										key={title}
										className="flex flex-col rounded-2xl border border-border/60 bg-background p-6 transition-all hover:border-primary/30 hover:shadow-md"
									>
										<div className="mb-4 flex items-start justify-between gap-3">
											<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
												<Icon className="h-5 w-5" />
											</div>
											<span
												className={`rounded-full px-2.5 py-1 font-bold text-[10px] ${tagColor}`}
											>
												{tag}
											</span>
										</div>

										<h3 className="mb-2 font-extrabold text-base sm:text-lg">
											{title}
										</h3>
										<p className="mb-4 text-muted-foreground text-xs leading-relaxed sm:text-sm">
											{description}
										</p>

										<ul className="mb-6 flex flex-1 flex-col gap-2.5">
											{benefits.map((b) => (
												<li
													key={b}
													className="flex items-start gap-2 text-xs sm:text-sm"
												>
													<CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
													<span>{b}</span>
												</li>
											))}
										</ul>

										<Link href="/contact?ref=b2b">
											<Button
												variant="outline"
												className="h-10 w-full gap-1.5 font-semibold"
											>
												{cta} <ArrowRight className="h-3.5 w-3.5" />
											</Button>
										</Link>
									</div>
								),
							)}
						</div>
					</div>
				</section>

				{/* ── NON-PROFIT ───────────────────────────────────────────────────── */}
				<section id="nonprofit" className="py-12 sm:py-20 lg:py-28">
					<div className="mx-auto max-w-7xl px-4 sm:px-6">
						{/* Header */}
						<div className="mb-7 grid grid-cols-1 gap-8 lg:mb-12 lg:grid-cols-2 lg:items-end">
							<div>
								<div className="mb-2 flex flex-wrap items-center gap-2">
									<p className="font-bold text-[11px] text-emerald-600 uppercase tracking-[0.15em] dark:text-emerald-400">
										Program Non-Profit
									</p>
									<span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-bold text-[10px] text-emerald-600 dark:text-emerald-400">
										Gratis untuk mendaftar
									</span>
								</div>
								<h2 className="font-extrabold text-xl tracking-tight sm:text-3xl">
									Teknologi untuk semua — termasuk mereka yang melayani tanpa
									keuntungan
								</h2>
							</div>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								Kami percaya bahwa komunitas, yayasan, dan lembaga pendidikan
								adalah tulang punggung masyarakat. Program Non-Profit Tanisya
								hadir sebagai bentuk kontribusi nyata kami untuk mendukung misi
								sosial yang berarti.
							</p>
						</div>

						{/* Benefits */}
						<div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
							{NONPROFIT_BENEFITS.map(({ icon: Icon, title, description }) => (
								<div
									key={title}
									className="flex items-start gap-4 rounded-2xl border border-emerald-200/70 bg-background p-5 transition-all hover:border-emerald-400/50 hover:shadow-md sm:flex-col dark:border-emerald-900/60"
								>
									<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
										<Icon className="h-5 w-5" />
									</div>
									<div>
										<h3 className="mb-1 font-bold text-sm sm:text-base">
											{title}
										</h3>
										<p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
											{description}
										</p>
									</div>
								</div>
							))}
						</div>

						{/* Tier diskon */}
						<div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
							{NONPROFIT_TIERS.map(
								({ org, icon: Icon, discount, description, requirements }) => (
									<div
										key={org}
										className="flex flex-col rounded-2xl border border-emerald-200/70 bg-background p-6 dark:border-emerald-900/60"
									>
										<div className="mb-4 flex items-center gap-3">
											<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
												<Icon className="h-5 w-5" />
											</div>
											<div>
												<p className="text-muted-foreground text-xs">
													Diskon untuk
												</p>
												<h3 className="font-extrabold text-sm sm:text-base">
													{org}
												</h3>
											</div>
										</div>

										<div className="mb-4 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-500/5">
											<div className="font-extrabold text-4xl text-emerald-600 tracking-tight dark:text-emerald-400">
												{discount}
											</div>
											<p className="text-muted-foreground text-xs">
												dari harga normal
											</p>
										</div>

										<p className="mb-4 text-muted-foreground text-xs leading-relaxed sm:text-sm">
											{description}
										</p>

										<div className="mb-5 flex-1">
											<p className="mb-2 font-bold text-[11px] text-muted-foreground uppercase tracking-[0.1em]">
												Persyaratan:
											</p>
											<ul className="flex flex-col gap-2">
												{requirements.map((req) => (
													<li
														key={req}
														className="flex items-start gap-2 text-muted-foreground text-xs sm:text-sm"
													>
														<CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
														<span>{req}</span>
													</li>
												))}
											</ul>
										</div>

										<Link href="/contact?ref=nonprofit">
											<Button
												variant="outline"
												className="h-10 w-full gap-1.5 border-emerald-300 font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950"
											>
												Ajukan Permohonan <ArrowRight className="h-3.5 w-3.5" />
											</Button>
										</Link>
									</div>
								),
							)}
						</div>

						{/* Non-profit testimonials */}
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
							{NONPROFIT_TESTIMONIALS.map(
								({ name, role, avatar, color, text }) => (
									<div
										key={name}
										className="flex flex-col gap-4 rounded-2xl border border-emerald-200/70 bg-background p-5 dark:border-emerald-900/60"
									>
										<div className="flex gap-0.5">
											{Array.from({ length: 5 }).map((_, i) => (
												<Star
													key={i}
													className="h-4 w-4 fill-amber-400 text-amber-400"
												/>
											))}
										</div>
										<p className="flex-1 text-muted-foreground text-sm leading-relaxed">
											"{text}"
										</p>
										<div className="flex items-center gap-3 border-border/50 border-t pt-4">
											<div
												className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color} font-bold text-white text-xs`}
											>
												{avatar}
											</div>
											<div className="min-w-0">
												<p className="truncate font-semibold text-sm">{name}</p>
												<p className="truncate text-[11px] text-muted-foreground">
													{role}
												</p>
											</div>
										</div>
									</div>
								),
							)}
						</div>
					</div>
				</section>

				{/* ── BANNER UTAMA ─────────────────────────────────────────────────── */}
				<section className="border-border/60 border-t bg-muted/20 py-12 sm:py-20 lg:py-28">
					<div className="mx-auto max-w-7xl px-4 sm:px-6">
						<div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary/90 to-blue-600 text-primary-foreground shadow-primary/20 shadow-xl sm:rounded-3xl">
							<div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-3xl sm:-top-24 sm:-right-24 sm:h-72 sm:w-72" />
							<div className="pointer-events-none absolute -bottom-8 left-1/3 h-28 w-28 rounded-full bg-white/8 blur-2xl" />
							<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />

							<div className="relative flex flex-col gap-7 p-6 sm:p-10 lg:flex-row lg:items-start lg:gap-12 lg:p-16">
								<div className="flex-1">
									<div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-bold text-xs">
										<Sparkles className="h-3.5 w-3.5 shrink-0" /> PILIH PROGRAM
										YANG TEPAT UNTUKMU
									</div>
									<h2 className="mb-3 font-extrabold text-2xl leading-tight tracking-tight sm:text-4xl lg:text-5xl">
										Ada program untuk semua tipe kolaborator
									</h2>
									<p className="mb-6 text-primary-foreground/80 text-sm leading-relaxed sm:text-base">
										Dari kreator konten, agensi digital, perusahaan teknologi,
										hingga yayasan sosial — Tanisya punya jalur kemitraan yang
										sesuai dengan misi dan kapasitasmu.
									</p>
									<div className="flex flex-col gap-3 sm:flex-row">
										<Link href="/affiliate" className="w-full sm:w-auto">
											<Button
												size="lg"
												className="h-12 w-full gap-2 bg-white font-bold text-primary hover:bg-white/90 sm:w-auto"
											>
												Daftar Afiliasi <ArrowRight className="h-4 w-4" />
											</Button>
										</Link>
										<Link
											href="/contact?ref=partner"
											className="w-full sm:w-auto"
										>
											<Button
												size="lg"
												variant="ghost"
												className="h-12 w-full gap-2 border border-white/20 text-primary-foreground hover:bg-white/10 sm:w-auto"
											>
												Diskusi Kemitraan{" "}
												<MessageCircle className="h-3.5 w-3.5" />
											</Button>
										</Link>
									</div>
								</div>

								<div className="flex w-full flex-col gap-2 lg:w-72 lg:shrink-0">
									{[
										{
											icon: BadgePercent,
											label: "Afiliasi",
											sub: "Rp 15rb daftar · Rp 5rb per beli, flat",
										},
										{
											icon: Building2,
											label: "Reseller / B2B",
											sub: "Margin s.d. 40%, white-label",
										},
										{
											icon: Globe,
											label: "Tech Partner",
											sub: "API, integrasi, co-marketing",
										},
										{
											icon: Heart,
											label: "Non-Profit",
											sub: "Diskon 30–50%, tanpa syarat ribet",
										},
									].map(({ icon: Icon, label, sub }) => (
										<div
											key={label}
											className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5"
										>
											<Icon className="h-4 w-4 shrink-0 text-white/70" />
											<div className="min-w-0">
												<p className="font-semibold text-sm leading-tight">
													{label}
												</p>
												<p className="text-[11px] text-white/60">{sub}</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* ── CTA ──────────────────────────────────────────────────────────── */}
				<section className="border-border/60 border-t py-14 sm:py-24">
					<div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
						<h2 className="mb-4 font-extrabold text-2xl tracking-tight sm:text-4xl">
							Pertanyaan seputar program kemitraan?
						</h2>
						<p className="mb-8 text-muted-foreground text-sm sm:text-base">
							Tim partnership kami siap membantu kamu memilih program yang
							paling sesuai dan menjawab pertanyaan apapun — tanpa tekanan,
							tanpa commitment.
						</p>
						<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
							<Link href="/contact?ref=affiliate" className="w-full sm:w-auto">
								<Button
									size="lg"
									className="h-12 w-full gap-2 px-8 font-bold shadow-lg shadow-primary/20 sm:w-auto"
								>
									Hubungi Tim Partnership <ArrowRight className="h-4 w-4" />
								</Button>
							</Link>
							<a
								href="https://wa.me/6281234567890?text=Halo, saya tertarik dengan program kemitraan Tanisya"
								target="_blank"
								rel="noopener noreferrer"
								className="w-full sm:w-auto"
							>
								<Button
									size="lg"
									variant="outline"
									className="h-12 w-full gap-2 px-8 sm:w-auto"
								>
									<Phone className="h-4 w-4" /> Chat via WhatsApp
								</Button>
							</a>
						</div>
						<p className="mt-4 text-muted-foreground text-xs">
							partnership@tanisya.com · Respons dalam 1×24 jam kerja
						</p>
					</div>
				</section>
			</main>
		</>
	);
}
