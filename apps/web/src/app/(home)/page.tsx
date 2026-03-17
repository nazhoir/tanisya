import { Button } from "@tanisya/ui/components/button";
import {
	ArrowRight,
	CheckCircle2,
	ChevronRight,
	ExternalLink,
	Layers,
	MessageCircle,
	PenTool,
	Phone,
	RefreshCw,
	ShieldCheck,
	Star,
	TrendingUp,
	Users,
	Wrench,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { OSS_PROJECTS } from "@/constant/oss";

// ─── Data ─────────────────────────────────────────────────────────────────────

const HERO_STATS = [
	{ value: "1rb+", label: "Aplikasi Dideploy" },
	{ value: "50+", label: "Template Instan Deploy" },
	{ value: "24/7", label: "Tim support" },
	{ value: "99.9%", label: "Uptime SLA" },
];

const FEATURES = [
	{
		icon: Zap,
		title: "Deploy Kilat",
		description:
			"Aktivasi instan — domain, hosting, hingga aplikasi aktif dalam hitungan menit, bukan hari.",
	},
	{
		icon: ShieldCheck,
		title: "Keamanan Enterprise",
		description:
			"SSL gratis, firewall WAF, DDoS protection, dan backup otomatis untuk setiap produk Anda.",
	},
	{
		icon: Users,
		title: "Support Manusia 24/7",
		description:
			"Tim support kami siap membantu kapanpun via WhatsApp, email, dan live chat — bukan bot.",
	},
	{
		icon: TrendingUp,
		title: "Skalabel Tanpa Batas",
		description:
			"Mulai dari shared hosting, upgrade ke VPS lalu dedicated — di platform yang sama tanpa kerumitan.",
	},
];

const TESTIMONIALS = [
	{
		name: "Rizky Fauzan",
		role: "Founder, Tokobaju.id",
		avatar: "RF",
		color: "bg-blue-500",
		text: "Sudah 3 tahun pakai hosting Tanisya. Uptime-nya konsisten dan tim supportnya cepat tanggap. Pindah ke sini adalah keputusan terbaik untuk toko online saya.",
	},
	{
		name: "Sari Dewi",
		role: "Digital Marketer",
		avatar: "SD",
		color: "bg-violet-500",
		text: "Template landing page-nya langsung bisa dipakai tanpa banyak modifikasi. Konversi campaign naik signifikan setelah ganti template dari Tanisya.",
	},
	{
		name: "Budi Santoso",
		role: "CTO, Startup Surabaya",
		avatar: "BS",
		color: "bg-emerald-500",
		text: "VPS-nya stabil dan Instan Apps sangat membantu tim dev kami. Deploy n8n dan Grafana dalam 2 menit. Luar biasa efisien untuk produktivitas tim.",
	},
];

const INSTAN_APPS = [
	"n8n — Workflow Automation",
	"Grafana — Monitoring & Analytics",
	"Typebot — Chatbot Builder",
	"Uptime Kuma — Status Page",
	"Mautic — Email Marketing",
	"Plausible — Web Analytics",
	"Metabase — Business Intelligence",
];

const CUSTOM_SERVICES = [
	{ icon: PenTool, text: "Custom Website — dari nol sesuai brief Anda" },
	{ icon: Wrench, text: "Perawatan Website — update, backup & optimasi rutin" },
	{ icon: RefreshCw, text: "Migrasi Website — pindah tanpa downtime" },
	{ icon: Phone, text: "Konsultasi Teknis — gratis & tanpa komitmen" },
];

const PORTFOLIO_TYPES = [
	{ emoji: "🛍️", label: "E-Commerce", sub: "120+ proyek" },
	{ emoji: "🏢", label: "Company Profile", sub: "80+ proyek" },
	{ emoji: "✨", label: "Portfolio", sub: "60+ proyek" },
	{ emoji: "🚀", label: "SaaS / App", sub: "40+ proyek" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomePage() {
	return (
		<>
			<main className="w-full">
				{/* ── HERO ─────────────────────────────────────────────────────────── */}
				<section className="relative flex min-h-svh items-center">
					<div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
						<div className="absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary/10 blur-[100px] sm:h-125 sm:w-125" />
						<div className="absolute top-1/4 right-0 h-40 w-40 rounded-full bg-blue-500/8 blur-[80px] sm:h-64 sm:w-64" />
						<div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-emerald-500/6 blur-[80px] sm:h-56 sm:w-56" />
					</div>

					<div className="mx-auto w-full max-w-5xl px-4 pt-24 pb-14 sm:px-6 sm:pt-36">
						<div className="flex flex-col items-center text-center">
							{/* Pill badge */}
							<div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 font-semibold text-primary text-xs sm:mb-6 sm:px-4 sm:text-sm">
								<span className="relative flex h-2 w-2 shrink-0">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
									<span className="relative h-2 w-2 rounded-full bg-primary" />
								</span>
								<span className="truncate">
									Solusi serba ada untuk bisnis Anda
								</span>
							</div>

							{/* Headline — starts at 2rem mobile, scales to 4rem desktop */}
							<h1 className="mb-4 text-balance font-extrabold text-[1.875rem] leading-[1.1] tracking-tight sm:mb-5 sm:text-5xl lg:text-[3.75rem]">
								Semua yang Anda butuhkan untuk{" "}
								<span className="relative inline-block">
									<span className="bg-linear-to-r from-primary to-blue-500 bg-clip-text text-transparent">
										dunia digital
									</span>
									<span className="absolute -bottom-1 left-0 h-0.75 w-full rounded-full bg-linear-to-r from-primary to-blue-500 opacity-30" />
								</span>{" "}
								ada di sini
							</h1>

							<p className="mb-7 max-w-sm text-muted-foreground text-sm leading-relaxed sm:max-w-xl sm:text-base lg:text-lg">
								Dari domain, hosting, SSL, email bisnis, template website,
								hingga layanan custom dan aplikasi siap pakai — Tanisya satu
								platform untuk semua kebutuhan Anda.
							</p>

							{/* Buttons — full-width stacked on mobile, side-by-side on sm */}
							<div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
								<Link href="/apps" className="w-full sm:w-auto">
									<Button
										size="lg"
										className="h-12 w-full gap-2 px-6 font-bold text-sm shadow-lg shadow-primary/20 sm:px-8 sm:text-base"
									>
										Mulai Sekarang <ArrowRight className="h-4 w-4 shrink-0" />
									</Button>
								</Link>
								<Link href="/contact" className="w-full sm:w-auto">
									<Button
										size="lg"
										variant="outline"
										className="h-12 w-full gap-2 px-6 text-sm sm:px-8 sm:text-base"
									>
										Konsultasi Gratis{" "}
										<MessageCircle className="h-4 w-4 shrink-0" />
									</Button>
								</Link>
							</div>

							<p className="mt-3 text-muted-foreground text-xs">
								Tidak perlu kartu kredit · Setup instan · Batalkan kapanpun
							</p>

							{/* Stats — 2×2 on mobile, 4 in a row on sm */}
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

				{/* ── INSTAN APPS ──────────────────────────────────────────────────── */}
				<section className="py-12 sm:py-20 lg:py-28">
					<div className="mx-auto max-w-7xl px-4 sm:px-6">
						<div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary/90 to-blue-600 text-primary-foreground shadow-primary/20 shadow-xl sm:rounded-3xl">
							<div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-3xl sm:-top-24 sm:-right-24 sm:h-72 sm:w-72" />
							<div className="pointer-events-none absolute -bottom-8 left-1/3 h-28 w-28 rounded-full bg-white/8 blur-2xl" />
							<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />

							<div className="relative flex flex-col gap-7 p-6 sm:p-10 lg:flex-row lg:items-start lg:gap-12 lg:p-16">
								{/* Copy */}
								<div className="flex-1">
									<div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-bold text-xs">
										<Layers className="h-3.5 w-3.5 shrink-0" /> INSTAN APPS —
										FITUR BARU
									</div>
									<h2 className="mb-3 font-extrabold text-2xl leading-tight tracking-tight sm:text-4xl lg:text-5xl">
										Deploy 50+ aplikasi dalam hitungan detik
									</h2>
									<p className="mb-6 text-primary-foreground/80 text-sm leading-relaxed sm:text-base">
										n8n, Grafana, Typebot, Uptime Kuma, Mautic, Plausible, dan
										masih banyak lagi — tanpa konfigurasi manual, langsung siap
										digunakan.
									</p>
									<div className="flex flex-col gap-3 sm:flex-row">
										<Link href="/apps" className="w-full sm:w-auto">
											<Button
												size="lg"
												className="h-12 w-full gap-2 bg-white font-bold text-primary hover:bg-white/90 sm:w-auto"
											>
												Jelajahi Apps <ArrowRight className="h-4 w-4" />
											</Button>
										</Link>
										<Link href="/apps" className="w-full sm:w-auto">
											<Button
												size="lg"
												variant="ghost"
												className="h-12 w-full gap-2 border border-white/20 text-primary-foreground hover:bg-white/10 sm:w-auto"
											>
												Lihat semua <ExternalLink className="h-3.5 w-3.5" />
											</Button>
										</Link>
									</div>
								</div>

								{/* App list */}
								<div className="flex w-full flex-col gap-2 lg:w-72 lg:shrink-0">
									{INSTAN_APPS.map((app) => (
										<div
											key={app}
											className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3 py-2.5 font-medium text-sm"
										>
											<CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-white/60" />
											<span className="min-w-0 truncate">{app}</span>
										</div>
									))}
									<p className="pt-1 text-center font-semibold text-white/60 text-xs">
										+ 43 aplikasi lainnya
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* ── FITUR ────────────────────────────────────────────────────────── */}
				<section className="border-border/60 border-y bg-muted/20 py-12 sm:py-20 lg:py-28">
					<div className="mx-auto max-w-7xl px-4 sm:px-6">
						<div className="mb-7 text-center sm:mb-12">
							<p className="mb-1.5 font-bold text-[11px] text-primary uppercase tracking-[0.15em]">
								Mengapa Tanisya?
							</p>
							<h2 className="font-extrabold text-xl tracking-tight sm:text-3xl">
								Dibangun untuk bisnis yang serius
							</h2>
						</div>

						{/* Horizontal card on mobile (icon left, text right), vertical on sm+ */}
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
							{FEATURES.map(({ icon: Icon, title, description }) => (
								<div
									key={title}
									className="flex items-start gap-4 rounded-2xl border border-border/60 bg-background p-5 transition-all hover:border-primary/30 hover:shadow-md sm:flex-col"
								>
									<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
										<Icon className="h-5 w-5" />
									</div>
									<div>
										<h3 className="mb-1 font-bold text-sm leading-tight sm:text-base">
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

				{/* ── LAYANAN CUSTOM ───────────────────────────────────────────────── */}
				<section className="py-12 sm:py-20 lg:py-28">
					<div className="mx-auto max-w-7xl px-4 sm:px-6">
						<div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
							<div>
								<p className="mb-2 font-bold text-[11px] text-primary uppercase tracking-[0.15em]">
									Layanan Custom
								</p>
								<h2 className="mb-4 font-extrabold text-xl leading-tight tracking-tight sm:text-3xl">
									Butuh website yang benar-benar unik?
								</h2>
								<p className="mb-6 text-muted-foreground text-sm leading-relaxed sm:text-base">
									Tim developer dan desainer kami siap membangun website custom
									sesuai kebutuhan spesifik bisnis Anda — dari brief hingga
									deployment, kami tangani semuanya.
								</p>

								<div className="mb-7 flex flex-col gap-3">
									{CUSTOM_SERVICES.map(({ icon: Icon, text }) => (
										<div key={text} className="flex items-start gap-3 text-sm">
											<div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
												<Icon className="h-3.5 w-3.5" />
											</div>
											<span>{text}</span>
										</div>
									))}
								</div>

								<div className="flex flex-col gap-3 sm:flex-row">
									<Link
										href="/services/custom-website"
										className="w-full sm:w-auto"
									>
										<Button className="h-11 w-full gap-2 font-semibold sm:w-auto">
											Mulai Proyek <ArrowRight className="h-4 w-4" />
										</Button>
									</Link>
									<Link
										href="/services/consultation"
										className="w-full sm:w-auto"
									>
										<Button
											variant="outline"
											className="h-11 w-full gap-2 sm:w-auto"
										>
											Konsultasi Gratis <MessageCircle className="h-4 w-4" />
										</Button>
									</Link>
								</div>
							</div>

							<div className="relative">
								<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
									<div className="h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
								</div>
								<div className="relative grid grid-cols-2 gap-3">
									{PORTFOLIO_TYPES.map(({ emoji, label, sub }) => (
										<div
											key={label}
											className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md sm:p-5"
										>
											<span className="text-2xl">{emoji}</span>
											<p className="font-semibold text-sm sm:text-base">
												{label}
											</p>
											<p className="text-muted-foreground text-xs">{sub}</p>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* ── OPEN SOURCE ──────────────────────────────────────────────────── */}
				<section className="border-border/60 border-t bg-muted/20 py-12 sm:py-20 lg:py-28">
					<div className="mx-auto max-w-7xl px-4 sm:px-6">
						<div className="mb-7 flex items-start justify-between gap-4 sm:mb-10 sm:items-end">
							<div>
								<div className="mb-2 flex flex-wrap items-center gap-2">
									<p className="font-bold text-[11px] text-violet-600 uppercase tracking-[0.15em] dark:text-violet-400">
										Open Source
									</p>
									<span className="rounded-full bg-violet-500/10 px-2 py-0.5 font-bold text-[10px] text-violet-600 dark:text-violet-400">
										Gratis selamanya
									</span>
								</div>
								<h2 className="font-extrabold text-xl tracking-tight sm:text-3xl">
									Kontribusi kami untuk komunitas Indonesia
								</h2>
							</div>
							<Link
								href="/oss"
								className="flex h-11 shrink-0 items-center gap-1 pl-4 font-semibold text-violet-600 text-xs hover:underline sm:text-sm dark:text-violet-400"
							>
								Semua <ChevronRight className="h-4 w-4" />
							</Link>
						</div>

						{/* Horizontal card on mobile, vertical on sm+ */}
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
							{OSS_PROJECTS[0].items.map(
								({ icon: Icon, badge, description, to, category, label }) => (
									<Link
										key={label}
										href={to as any}
										className="group flex items-start gap-4 rounded-2xl border border-violet-200/70 bg-background p-5 transition-all hover:border-violet-400/50 hover:shadow-md active:scale-[0.99] sm:flex-col sm:gap-4 dark:border-violet-900/60"
									>
										<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white dark:bg-violet-950 dark:text-violet-400">
											<Icon className="h-5 w-5" />
										</div>
										<div className="min-w-0 flex-1">
											<div className="mb-1 flex items-center gap-2">
												<span className="truncate font-bold text-sm sm:text-base">
													{label}
												</span>
											</div>
											<p className="text-muted-foreground text-xs sm:text-sm">
												{description}
											</p>
											<p className="mt-2 font-semibold text-[11px] text-violet-500">
												Kategori: {category}
											</p>
										</div>
									</Link>
								),
							)}
						</div>
					</div>
				</section>

				{/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
				<section className="py-12 sm:py-20 lg:py-28">
					<div className="mx-auto max-w-7xl px-4 sm:px-6">
						<div className="mb-7 text-center sm:mb-12">
							<p className="mb-1.5 font-bold text-[11px] text-primary uppercase tracking-[0.15em]">
								Testimoni
							</p>
							<h2 className="font-extrabold text-xl tracking-tight sm:text-3xl">
								Dipercaya ribuan bisnis Indonesia
							</h2>
						</div>

						<div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
							{TESTIMONIALS.map(({ name, role, avatar, color, text }) => (
								<div
									key={name}
									className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-background p-5"
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
							))}
						</div>
					</div>
				</section>

				{/* ── CTA ──────────────────────────────────────────────────────────── */}
				<section className="border-border/60 border-t bg-muted/20 py-14 sm:py-24">
					<div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
						<h2 className="mb-4 font-extrabold text-2xl tracking-tight sm:text-4xl">
							Siap membawa bisnis Anda ke level berikutnya?
						</h2>
						<p className="mb-8 text-muted-foreground text-sm sm:text-base">
							Mulai dengan produk apapun — tidak ada kontrak jangka panjang,
							tidak ada biaya tersembunyi. Bayar sesuai kebutuhan dan upgrade
							kapanpun.
						</p>
						<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
							<Link href="/hosting" className="w-full sm:w-auto">
								<Button
									size="lg"
									className="h-12 w-full gap-2 px-8 font-bold shadow-lg shadow-primary/20 sm:w-auto"
								>
									Mulai Gratis 14 Hari <ArrowRight className="h-4 w-4" />
								</Button>
							</Link>
							<Link href="/contact" className="w-full sm:w-auto">
								<Button
									size="lg"
									variant="outline"
									className="h-12 w-full gap-2 px-8 sm:w-auto"
								>
									<Phone className="h-4 w-4" /> Hubungi Sales
								</Button>
							</Link>
						</div>
						<p className="mt-4 text-muted-foreground text-xs">
							Tidak perlu kartu kredit · Setup instan · Support 24/7
						</p>
					</div>
				</section>
			</main>
		</>
	);
}
