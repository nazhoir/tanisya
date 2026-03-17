import { Badge } from "@tanisya/ui/components/badge";
import { Button } from "@tanisya/ui/components/button";
import {
	ArrowRight,
	Award,
	BarChart3,
	Briefcase,
	Building2,
	ChevronRight,
	Clock,
	Code2,
	Coffee,
	Globe,
	Heart,
	HeartHandshake,
	MapPin,
	Megaphone,
	MessageCircle,
	Monitor,
	Palette,
	Phone,
	Rocket,
	Search,
	Shield,
	Sparkles,
	Star,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";

// ─── Data ─────────────────────────────────────────────────────────────────────

const HERO_STATS = [
	{ value: "50+", label: "Anggota Tim" },
	{ value: "100%", label: "Remote-Friendly" },
	{ value: "4.9/5", label: "Rating Glassdoor" },
	{ value: "92%", label: "Retensi Karyawan" },
];

const PERKS = [
	{
		icon: Monitor,
		title: "Remote-First",
		description:
			"Kerja dari mana saja di Indonesia. Kami percaya hasil kerja lebih penting dari lokasi dudukmu.",
	},
	{
		icon: TrendingUp,
		title: "Equity & Saham",
		description:
			"Setiap karyawan tetap mendapat opsi saham. Kamu ikut memiliki perusahaan yang kamu bangun.",
	},
	{
		icon: Award,
		title: "Budget Belajar",
		description:
			"Rp 5 juta per tahun untuk kursus, konferensi, buku, atau sertifikasi apapun yang kamu mau.",
	},
	{
		icon: Coffee,
		title: "Flexible Hours",
		description:
			"Tidak ada jam masuk kaku. Atur jadwalmu sendiri selama deliverable terpenuhi dan tim tetap sync.",
	},
	{
		icon: HeartHandshake,
		title: "Asuransi Premium",
		description:
			"BPJS Kesehatan + asuransi swasta premium untuk kamu dan keluarga inti, ditanggung penuh.",
	},
	{
		icon: Zap,
		title: "Hardware Allowance",
		description:
			"Rp 10 juta untuk setup workstation impianmu. Laptop, monitor, kursi — kami yang bayar.",
	},
	{
		icon: Globe,
		title: "Workcation Budget",
		description:
			"Rp 3 juta per kuartal untuk coworking space atau workcation bareng tim di manapun.",
	},
	{
		icon: Heart,
		title: "Mental Health Day",
		description:
			"4 hari libur tambahan per tahun khusus untuk istirahat mental, tanpa perlu alasan apapun.",
	},
];

const CULTURE_QUOTES = [
	{
		quote:
			"Di Tanisya saya bisa kerja dari Bali sambil tetap deliver fitur-fitur penting. Tim yang solid dan culture yang sehat — rare banget di industri ini.",
		name: "Fajar Nugroho",
		role: "Backend Engineer · 2 tahun",
		avatar: "FN",
		color: "bg-blue-500",
	},
	{
		quote:
			"Budget belajarnya beneran dipakai, bukan cuma di atas kertas. Tahun lalu saya ikut KubeCon pakai budget itu. Perusahaan yang serius invest di orang-orangnya.",
		name: "Layla Andriani",
		role: "DevOps Engineer · 1.5 tahun",
		avatar: "LA",
		color: "bg-violet-500",
	},
	{
		quote:
			"Saya single parent dan flexibility-nya luar biasa. Bisa antar jemput anak tanpa khawatir. Yang penting kerjaan beres dan komunikasi lancar.",
		name: "Hendra Wijaya",
		role: "Frontend Engineer · 3 tahun",
		avatar: "HW",
		color: "bg-emerald-500",
	},
];

const DEPARTMENTS = [
	{ icon: Code2, label: "Engineering", count: 8 },
	{ icon: Palette, label: "Design", count: 2 },
	{ icon: Megaphone, label: "Marketing", count: 3 },
	{ icon: BarChart3, label: "Product", count: 2 },
	{ icon: Shield, label: "Security & Infra", count: 4 },
	{ icon: Users, label: "Customer Success", count: 6 },
];

const JOB_LISTINGS = [
	// Engineering
	{
		id: "sr-backend-engineer",
		title: "Senior Backend Engineer",
		department: "Engineering",
		type: "Full-time",
		location: "Remote · Indonesia",
		level: "Senior",
		levelColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
		description:
			"Membangun dan memelihara API, layanan microservices, dan infrastruktur backend yang menopang ribuan pelanggan kami.",
		tags: ["Go", "PostgreSQL", "Redis", "Kubernetes"],
		hot: true,
	},
	{
		id: "frontend-engineer",
		title: "Frontend Engineer",
		department: "Engineering",
		type: "Full-time",
		location: "Remote · Indonesia",
		level: "Mid–Senior",
		levelColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
		description:
			"Membangun UI yang cepat, aksesibel, dan indah untuk platform Tanisya menggunakan Next.js dan design system kami.",
		tags: ["Next.js", "TypeScript", "Tailwind CSS", "React"],
		hot: false,
	},
	{
		id: "devops-engineer",
		title: "DevOps / Platform Engineer",
		department: "Engineering",
		type: "Full-time",
		location: "Remote · Indonesia",
		level: "Senior",
		levelColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
		description:
			"Mengelola infrastruktur cloud, CI/CD pipeline, monitoring, dan keandalan platform Instan Apps kami.",
		tags: ["Kubernetes", "Terraform", "Prometheus", "Docker"],
		hot: true,
	},
	{
		id: "mobile-engineer",
		title: "Mobile Engineer (React Native)",
		department: "Engineering",
		type: "Full-time",
		location: "Remote · Indonesia",
		level: "Mid",
		levelColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
		description:
			"Membangun aplikasi mobile Tanisya dari nol — dari client portal hingga notifikasi real-time.",
		tags: ["React Native", "TypeScript", "Expo", "REST API"],
		hot: false,
	},
	// Design
	{
		id: "product-designer",
		title: "Product Designer",
		department: "Design",
		type: "Full-time",
		location: "Remote · Indonesia",
		level: "Mid–Senior",
		levelColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
		description:
			"Mendesain experience untuk produk-produk Tanisya — dari onboarding baru hingga dashboard manajemen hosting.",
		tags: ["Figma", "UX Research", "Design System", "Prototyping"],
		hot: false,
	},
	// Product
	{
		id: "product-manager",
		title: "Product Manager",
		department: "Product",
		type: "Full-time",
		location: "Remote · Indonesia",
		level: "Senior",
		levelColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
		description:
			"Mendefinisikan roadmap, bekerja lintas tim, dan memastikan kami membangun produk yang benar-benar dibutuhkan pelanggan.",
		tags: ["Product Strategy", "OKR", "Data Analysis", "Agile"],
		hot: true,
	},
	// Marketing
	{
		id: "content-strategist",
		title: "Content & SEO Strategist",
		department: "Marketing",
		type: "Full-time",
		location: "Remote · Indonesia",
		level: "Mid",
		levelColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
		description:
			"Membangun otoritas SEO Tanisya melalui konten teknis berkualitas tinggi yang relevan untuk developer dan pemilik bisnis.",
		tags: ["SEO", "Technical Writing", "Content Strategy", "Analytics"],
		hot: false,
	},
	{
		id: "growth-marketer",
		title: "Growth Marketer",
		department: "Marketing",
		type: "Full-time",
		location: "Remote · Indonesia",
		level: "Mid–Senior",
		levelColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
		description:
			"Memimpin eksperimen akuisisi, conversion rate optimization, dan growth loop untuk mendorong pertumbuhan pelanggan.",
		tags: ["Performance Marketing", "CRO", "Analytics", "A/B Testing"],
		hot: false,
	},
	// Customer Success
	{
		id: "customer-success",
		title: "Customer Success Specialist",
		department: "Customer Success",
		type: "Full-time",
		location: "Remote · Indonesia",
		level: "Junior–Mid",
		levelColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
		description:
			"Menjadi wajah Tanisya untuk pelanggan — membantu onboarding, menyelesaikan masalah teknis, dan memastikan pelanggan sukses.",
		tags: ["Support", "Technical Knowledge", "Communication", "CRM"],
		hot: false,
	},
];

const PROCESS = [
	{
		step: "01",
		title: "Kirim Lamaran",
		description:
			"Isi form lamaran online. Tidak perlu cover letter panjang — ceritakan dirimu dengan ringkas dan jujur.",
	},
	{
		step: "02",
		title: "Review & Screening",
		description:
			"Tim kami mereview CV dan portfolio kamu dalam 3 hari kerja. Kami menghargai waktumu dengan memberi respons cepat.",
	},
	{
		step: "03",
		title: "Interview Teknis",
		description:
			"Satu sesi interview 60-90 menit dengan tim terkait. Tidak ada whiteboard test abstrak — kami fokus pada problem solving nyata.",
	},
	{
		step: "04",
		title: "Interview Kultur",
		description:
			"Ngobrol santai 30 menit dengan salah satu founder untuk memastikan kita cocok satu sama lain.",
	},
	{
		step: "05",
		title: "Offer & Onboarding",
		description:
			"Jika semua berjalan baik, offer letter dalam 2 hari kerja. Onboarding terstruktur selama 30 hari pertama.",
	},
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function LifeAtTanisyaPage() {
	return (
		<>
			<main className="w-full">
				{/* ── HERO ─────────────────────────────────────────────────────────── */}
				<section className="relative flex min-h-[70svh] items-center">
					<div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
						<div className="absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary/10 blur-[100px] sm:h-125 sm:w-125" />
						<div className="absolute top-1/4 right-0 h-40 w-40 rounded-full bg-violet-500/8 blur-[80px] sm:h-64 sm:w-64" />
						<div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-blue-500/6 blur-[80px] sm:h-56 sm:w-56" />
					</div>

					<div className="mx-auto w-full max-w-5xl px-4 pt-24 pb-14 sm:px-6 sm:pt-36">
						<div className="flex flex-col items-center text-center">
							<div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 font-semibold text-primary text-xs sm:mb-6 sm:px-4 sm:text-sm">
								<span className="relative flex h-2 w-2 shrink-0">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
									<span className="relative h-2 w-2 rounded-full bg-primary" />
								</span>
								<span className="truncate">
									{JOB_LISTINGS.length} posisi terbuka · Bergabung sekarang
								</span>
							</div>

							<h1 className="mb-4 text-balance font-extrabold text-[1.875rem] leading-[1.1] tracking-tight sm:mb-5 sm:text-5xl lg:text-[3.75rem]">
								Bangun karir yang{" "}
								<span className="relative inline-block">
									<span className="bg-linear-to-r from-primary to-blue-500 bg-clip-text text-transparent">
										bermakna
									</span>
									<span className="absolute -bottom-1 left-0 h-0.75 w-full rounded-full bg-linear-to-r from-primary to-blue-500 opacity-30" />
								</span>{" "}
								bersama kami
							</h1>

							<p className="mb-7 max-w-sm text-muted-foreground text-sm leading-relaxed sm:max-w-xl sm:text-base lg:text-lg">
								Di Tanisya, kamu bukan sekadar karyawan — kamu adalah bagian
								dari tim kecil yang membangun infrastruktur digital untuk ribuan
								bisnis Indonesia. Remote-first, ownership tinggi, dan dampak
								nyata setiap harinya.
							</p>

							<div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
								<a href="#lowongan" className="w-full sm:w-auto">
									<Button
										size="lg"
										className="h-12 w-full gap-2 px-6 font-bold text-sm shadow-lg shadow-primary/20 sm:px-8 sm:text-base"
									>
										Lihat Lowongan <Briefcase className="h-4 w-4 shrink-0" />
									</Button>
								</a>
								<Link href="/contact" className="w-full sm:w-auto">
									<Button
										size="lg"
										variant="outline"
										className="h-12 w-full gap-2 px-6 text-sm sm:px-8 sm:text-base"
									>
										Kirim CV Spontan{" "}
										<MessageCircle className="h-4 w-4 shrink-0" />
									</Button>
								</Link>
							</div>

							<p className="mt-3 text-muted-foreground text-xs">
								Tidak ada posisi cocok? · Kirim CV spontan · Kami selalu buka
								untuk talenta luar biasa
							</p>

							{/* Stats */}
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

				{/* ── PERKS ────────────────────────────────────────────────────────── */}
				<section className="border-border/60 border-y bg-muted/20 py-12 sm:py-20 lg:py-28">
					<div className="mx-auto max-w-7xl px-4 sm:px-6">
						<div className="mb-7 text-center sm:mb-12">
							<p className="mb-1.5 font-bold text-[11px] text-primary uppercase tracking-[0.15em]">
								Benefit & Fasilitas
							</p>
							<h2 className="font-extrabold text-xl tracking-tight sm:text-3xl">
								Kami investasi serius pada orang-orang kami
							</h2>
							<p className="mx-auto mt-2 max-w-xl text-muted-foreground text-sm sm:text-base">
								Bukan sekadar gaji — kami memastikan kamu punya semua yang
								dibutuhkan untuk berkembang dan bekerja dengan bahagia.
							</p>
						</div>

						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
							{PERKS.map(({ icon: Icon, title, description }) => (
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

				{/* ── CULTURE — SUARA KARYAWAN ──────────────────────────────────────── */}
				<section className="py-12 sm:py-20 lg:py-28">
					<div className="mx-auto max-w-7xl px-4 sm:px-6">
						<div className="mb-7 text-center sm:mb-12">
							<p className="mb-1.5 font-bold text-[11px] text-primary uppercase tracking-[0.15em]">
								Suara Karyawan
							</p>
							<h2 className="font-extrabold text-xl tracking-tight sm:text-3xl">
								Jangan percaya kami — dengar dari timnya langsung
							</h2>
						</div>

						<div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
							{CULTURE_QUOTES.map(({ quote, name, role, avatar, color }) => (
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
										"{quote}"
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

				{/* ── JOB LISTINGS ─────────────────────────────────────────────────── */}
				<section
					id="lowongan"
					className="border-border/60 border-t bg-muted/20 py-12 sm:py-20 lg:py-28"
				>
					<div className="mx-auto max-w-7xl px-4 sm:px-6">
						{/* Section header */}
						<div className="mb-7 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
							<div>
								<p className="mb-1.5 font-bold text-[11px] text-primary uppercase tracking-[0.15em]">
									Posisi Terbuka
								</p>
								<h2 className="font-extrabold text-xl tracking-tight sm:text-3xl">
									{JOB_LISTINGS.length} lowongan tersedia sekarang
								</h2>
							</div>
							{/* Department filter chips — mobile: horizontal scroll */}
							<div className="flex flex-wrap gap-2 sm:justify-end">
								{DEPARTMENTS.map(({ icon: Icon, label, count }) => (
									<div
										key={label}
										className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 font-semibold text-xs transition-all hover:border-primary/40 hover:bg-primary/5"
									>
										<Icon className="h-3 w-3 text-muted-foreground" />
										<span>{label}</span>
										<span className="rounded-full bg-muted px-1.5 py-0.5 font-bold text-[10px] text-muted-foreground">
											{count}
										</span>
									</div>
								))}
							</div>
						</div>

						{/* Job cards — grouped by department */}
						{(
							[
								"Engineering",
								"Design",
								"Product",
								"Marketing",
								"Customer Success",
							] as const
						).map((dept) => {
							const jobs = JOB_LISTINGS.filter((j) => j.department === dept);
							if (!jobs.length) return null;
							const DeptIcon =
								DEPARTMENTS.find((d) => d.label === dept)?.icon ?? Briefcase;
							return (
								<div key={dept} className="mb-8 last:mb-0">
									{/* Dept label */}
									<div className="mb-3 flex items-center gap-2">
										<DeptIcon className="h-4 w-4 text-muted-foreground" />
										<span className="font-bold text-muted-foreground text-xs uppercase tracking-[0.12em]">
											{dept}
										</span>
										<span className="rounded-full bg-muted px-2 py-0.5 font-bold text-[10px] text-muted-foreground">
											{jobs.length}
										</span>
									</div>

									<div className="flex flex-col gap-3">
										{jobs.map(
											({
												id,
												title,
												type,
												location,
												level,
												levelColor,
												description,
												tags,
												hot,
											}) => (
												<Link
													key={id}
													href={`/life-at-tanisya/${id}`}
													className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-background p-5 transition-all hover:border-primary/40 hover:shadow-md sm:flex-row sm:items-start sm:justify-between"
												>
													{/* Left: info */}
													<div className="min-w-0 flex-1">
														<div className="mb-1.5 flex flex-wrap items-center gap-2">
															<h3 className="font-bold text-sm leading-tight sm:text-base">
																{title}
															</h3>
															{hot && (
																<span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-bold text-[10px] text-primary">
																	<Sparkles className="h-2.5 w-2.5" /> Hot
																</span>
															)}
														</div>

														<div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
															<span className="flex items-center gap-1">
																<Building2 className="h-3 w-3" /> {type}
															</span>
															<span className="flex items-center gap-1">
																<MapPin className="h-3 w-3" /> {location}
															</span>
															<span className="flex items-center gap-1">
																<Clock className="h-3 w-3" />
																<span
																	className={`rounded-full px-2 py-0.5 font-semibold text-[10px] ${levelColor}`}
																>
																	{level}
																</span>
															</span>
														</div>

														<p className="mb-3 text-muted-foreground text-xs leading-relaxed sm:text-sm">
															{description}
														</p>

														<div className="flex flex-wrap gap-1.5">
															{tags.map((tag) => (
																<span
																	key={tag}
																	className="rounded-full border border-border/60 bg-muted/50 px-2.5 py-1 font-semibold text-[11px] text-muted-foreground"
																>
																	{tag}
																</span>
															))}
														</div>
													</div>

													{/* Right: CTA */}
													<div className="flex shrink-0 items-center sm:items-start sm:pt-1">
														<span className="flex items-center gap-1 font-semibold text-primary text-xs opacity-0 transition-opacity group-hover:opacity-100">
															Lihat detail{" "}
															<ChevronRight className="h-3.5 w-3.5" />
														</span>
													</div>
												</Link>
											),
										)}
									</div>
								</div>
							);
						})}
					</div>
				</section>

				{/* ── PROSES REKRUTMEN ─────────────────────────────────────────────── */}
				<section className="py-12 sm:py-20 lg:py-28">
					<div className="mx-auto max-w-7xl px-4 sm:px-6">
						<div className="mb-7 text-center sm:mb-12">
							<p className="mb-1.5 font-bold text-[11px] text-primary uppercase tracking-[0.15em]">
								Proses Rekrutmen
							</p>
							<h2 className="font-extrabold text-xl tracking-tight sm:text-3xl">
								Transparan, cepat, dan manusiawi
							</h2>
							<p className="mx-auto mt-2 max-w-xl text-muted-foreground text-sm sm:text-base">
								Kami menghormati waktumu. Seluruh proses selesai dalam 2 minggu
								— dan kamu selalu tahu posisimu di setiap tahap.
							</p>
						</div>

						{/* Process steps — horizontal on lg, vertical on mobile */}
						<div className="relative">
							{/* Connecting line — lg only */}
							<div className="absolute top-[2.75rem] right-0 left-0 hidden h-px bg-border/60 lg:block" />

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
								{PROCESS.map(({ step, title, description }, i) => (
									<div
										key={step}
										className="relative flex flex-col items-start gap-3 lg:items-center lg:px-4 lg:text-center"
									>
										{/* Mobile: left border line */}
										{i < PROCESS.length - 1 && (
											<div className="absolute top-12 left-5 h-full w-px bg-border/60 sm:hidden" />
										)}

										{/* Step circle */}
										<div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background font-extrabold text-primary text-sm shadow-sm">
											{step}
										</div>

										<div>
											<h3 className="mb-1 font-bold text-sm leading-tight sm:text-base">
												{title}
											</h3>
											<p className="text-muted-foreground text-xs leading-relaxed">
												{description}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</section>

				{/* ── OPEN APPLICATION BANNER ──────────────────────────────────────── */}
				<section className="border-border/60 border-t bg-muted/20 py-12 sm:py-20 lg:py-28">
					<div className="mx-auto max-w-7xl px-4 sm:px-6">
						<div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary/90 to-blue-600 text-primary-foreground shadow-primary/20 shadow-xl sm:rounded-3xl">
							<div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-3xl sm:-top-24 sm:-right-24 sm:h-72 sm:w-72" />
							<div className="pointer-events-none absolute -bottom-8 left-1/3 h-28 w-28 rounded-full bg-white/8 blur-2xl" />
							<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />

							<div className="relative flex flex-col gap-7 p-6 sm:p-10 lg:flex-row lg:items-center lg:gap-12 lg:p-16">
								<div className="flex-1">
									<div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-bold text-xs">
										<Rocket className="h-3.5 w-3.5 shrink-0" /> TIDAK ADA POSISI
										YANG COCOK?
									</div>
									<h2 className="mb-3 font-extrabold text-2xl leading-tight tracking-tight sm:text-4xl lg:text-5xl">
										Kirim lamaran spontan ke kami
									</h2>
									<p className="mb-6 text-primary-foreground/80 text-sm leading-relaxed sm:text-base">
										Kami selalu tertarik bertemu dengan orang-orang luar biasa —
										bahkan sebelum ada posisi terbuka. Kirim CV dan ceritakan
										apa yang ingin kamu bangun bersama kami.
									</p>
									<div className="flex flex-col gap-3 sm:flex-row">
										<Link
											href="/contact?ref=spontaneous"
											className="w-full sm:w-auto"
										>
											<Button
												size="lg"
												className="h-12 w-full gap-2 bg-white font-bold text-primary hover:bg-white/90 sm:w-auto"
											>
												Kirim CV Sekarang <ArrowRight className="h-4 w-4" />
											</Button>
										</Link>
										<a
											href="mailto:careers@tanisya.com"
											className="w-full sm:w-auto"
										>
											<Button
												size="lg"
												variant="ghost"
												className="h-12 w-full gap-2 border border-white/20 text-primary-foreground hover:bg-white/10 sm:w-auto"
											>
												careers@tanisya.com{" "}
												<MessageCircle className="h-3.5 w-3.5" />
											</Button>
										</a>
									</div>
								</div>

								{/* Right: tips */}
								<div className="flex w-full flex-col gap-2 lg:w-80 lg:shrink-0">
									{[
										"Sertakan portfolio atau link project-mu",
										"Ceritakan posisi ideal yang kamu inginkan",
										"Tunjukkan passion-mu terhadap produk Tanisya",
										"Tidak perlu cover letter yang formal dan kaku",
										"Respons dalam 5 hari kerja, dijamin",
									].map((tip) => (
										<div
											key={tip}
											className="flex items-start gap-2.5 rounded-xl bg-white/10 px-3 py-2.5 text-sm"
										>
											<Search className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/60" />
											<span className="leading-snug">{tip}</span>
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
							Siap membangun sesuatu yang bermakna?
						</h2>
						<p className="mb-8 text-muted-foreground text-sm sm:text-base">
							Gabung dengan tim yang peduli pada craft, kualitas, dan dampak
							nyata untuk ekosistem digital Indonesia.
						</p>
						<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
							<a href="#lowongan" className="w-full sm:w-auto">
								<Button
									size="lg"
									className="h-12 w-full gap-2 px-8 font-bold shadow-lg shadow-primary/20 sm:w-auto"
								>
									Lihat Semua Lowongan <Briefcase className="h-4 w-4" />
								</Button>
							</a>
							<Link href="/about" className="w-full sm:w-auto">
								<Button
									size="lg"
									variant="outline"
									className="h-12 w-full gap-2 px-8 sm:w-auto"
								>
									<Users className="h-4 w-4" /> Kenali Tim Kami
								</Button>
							</Link>
						</div>
						<p className="mt-4 text-muted-foreground text-xs">
							Pertanyaan? · careers@tanisya.com · Respons dalam 2 hari kerja
						</p>
					</div>
				</section>
			</main>
		</>
	);
}
