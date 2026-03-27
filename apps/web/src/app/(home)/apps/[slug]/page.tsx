// app/apps/[slug]/page.tsx
"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@tanisya/ui/components/accordion";
import { Badge } from "@tanisya/ui/components/badge";
import { Button } from "@tanisya/ui/components/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@tanisya/ui/components/card";
import { Separator } from "@tanisya/ui/components/separator";
import { Tabs, TabsList, TabsTrigger } from "@tanisya/ui/components/tabs";
import {
	ArrowLeft,
	CheckCircle2,
	Database,
	ExternalLink,
	// Github,
	Globe,
	HardDrive,
	HeadphonesIcon,
	LayoutDashboard,
	Monitor,
	RefreshCw,
	Server,
	ShieldCheck,
	Star,
	Tag,
	Terminal,
	Users,
	XCircle,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { formatIDR } from "@/lib/format-currency";

// ─── Types ────────────────────────────────────────────────────────────────────
type BillingCycle = "monthly" | "yearly";

interface AppPlan {
	id: string;
	name: string;
	tagline: string;
	monthlyPrice: number;
	yearlyPrice: number;
	highlight?: boolean;
	badge?: string;
	vcpu: string;
	ram: string;
	storage: string;
	bandwidth: string;
	features: { label: string; included: boolean }[];
}

interface AppDetail {
	slug: string;
	name: string;
	tagline: string;
	description: string;
	longDescription: string;
	category: string;
	tags: string[];
	logo: string;
	github: string;
	website: string;
	demo: string;
	preview: string;
	stars: string;
	version: string;
	license: string;
	plans: AppPlan[];
	features: { icon: React.ElementType; title: string; description: string }[];
	faqs: { q: string; a: string }[];
	requirements: string[];
}

// ─── App DB (in real app, fetch from API / CMS) ───────────────────────────────
const APPS: Record<string, AppDetail> = {
	n8n: {
		slug: "n8n",
		name: "n8n",
		tagline: "Workflow Automation dengan 200+ Integrasi",
		description:
			"Platform otomasi workflow open-source yang powerful. Hubungkan layanan favorit Anda dan buat alur kerja otomatis tanpa coding.",
		longDescription:
			"n8n adalah platform otomasi workflow yang memungkinkan Anda menghubungkan berbagai aplikasi dan layanan untuk mengotomatiskan tugas-tugas berulang. Dengan antarmuka visual yang intuitif, Anda dapat membangun alur kerja kompleks tanpa harus menulis kode. n8n mendukung lebih dari 200 integrasi termasuk Google Workspace, Slack, GitHub, Notion, dan banyak lagi.",
		category: "Productivity",
		tags: ["Automation", "Integration", "Self-hosted"],
		logo: "https://avatars.githubusercontent.com/u/45487711?s=200&v=4",
		github: "https://github.com/n8n-io/n8n",
		website: "https://n8n.io",
		demo: "https://n8n.io",
		preview:
			"https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-screenshot.png",
		stars: "44k",
		version: "1.28.0",
		license: "Fair-code (Apache 2.0 + Commons Clause)",
		plans: [
			{
				id: "starter",
				name: "Starter",
				tagline: "Untuk eksperimen dan penggunaan pribadi",
				monthlyPrice: 15000,
				yearlyPrice: 10000,
				vcpu: "0.5 vCPU",
				ram: "512 MB RAM",
				storage: "5 GB SSD",
				bandwidth: "10 GB / bln",
				features: [
					{ label: "SSL Gratis", included: true },
					{ label: "Custom Domain", included: true },
					{ label: "Backup Mingguan", included: true },
					{ label: "Auto Update", included: true },
					{ label: "Backup Harian", included: false },
					{ label: "Priority Support", included: false },
					{ label: "Dedicated IP", included: false },
				],
			},
			{
				id: "business",
				name: "Business",
				tagline: "Untuk tim dan bisnis berkembang",
				monthlyPrice: 45000,
				yearlyPrice: 30000,
				highlight: true,
				badge: "Paling Populer",
				vcpu: "2 vCPU",
				ram: "2 GB RAM",
				storage: "20 GB SSD",
				bandwidth: "Unlimited",
				features: [
					{ label: "SSL Gratis", included: true },
					{ label: "Custom Domain", included: true },
					{ label: "Backup Mingguan", included: true },
					{ label: "Auto Update", included: true },
					{ label: "Backup Harian", included: true },
					{ label: "Priority Support", included: false },
					{ label: "Dedicated IP", included: false },
				],
			},
			{
				id: "professional",
				name: "Professional",
				tagline: "Performa maksimal tanpa batas",
				monthlyPrice: 89000,
				yearlyPrice: 59000,
				vcpu: "4 vCPU",
				ram: "8 GB RAM",
				storage: "50 GB SSD NVMe",
				bandwidth: "Unlimited",
				features: [
					{ label: "SSL Gratis", included: true },
					{ label: "Custom Domain", included: true },
					{ label: "Backup Mingguan", included: true },
					{ label: "Auto Update", included: true },
					{ label: "Backup Harian", included: true },
					{ label: "Priority Support", included: true },
					{ label: "Dedicated IP", included: true },
				],
			},
		],
		features: [
			{
				icon: Zap,
				title: "Visual Workflow Builder",
				description:
					"Buat alur kerja kompleks dengan drag-and-drop yang mudah dipahami.",
			},
			{
				icon: Globe,
				title: "200+ Integrasi",
				description:
					"Hubungkan dengan Google, Slack, GitHub, Notion, dan ratusan layanan lainnya.",
			},
			{
				icon: ShieldCheck,
				title: "Self-hosted & Privat",
				description:
					"Data Anda sepenuhnya di server Anda. Tidak ada data yang keluar.",
			},
			{
				icon: RefreshCw,
				title: "Auto Eksekusi",
				description:
					"Jadwalkan workflow untuk berjalan otomatis berdasarkan trigger atau waktu.",
			},
			{
				icon: LayoutDashboard,
				title: "Dashboard Lengkap",
				description:
					"Pantau semua eksekusi workflow dengan log dan monitoring real-time.",
			},
			{
				icon: HeadphonesIcon,
				title: "Komunitas Aktif",
				description:
					"Didukung komunitas open-source yang besar dengan ribuan template siap pakai.",
			},
		],
		faqs: [
			{
				q: "Apakah n8n bisa digunakan tanpa coding?",
				a: "Ya! n8n dirancang untuk digunakan oleh siapa saja. Antarmuka drag-and-drop memudahkan pembuatan workflow tanpa pengetahuan programming. Namun jika Anda developer, tersedia node Code untuk logika kustom.",
			},
			{
				q: "Berapa banyak workflow yang bisa saya buat?",
				a: "Tidak ada batasan jumlah workflow. Semua paket mengizinkan pembuatan workflow tak terbatas. Perbedaan utama antar paket adalah sumber daya server (CPU & RAM) yang mempengaruhi kecepatan eksekusi.",
			},
			{
				q: "Apakah data saya aman?",
				a: "Karena n8n berjalan di server Anda sendiri (self-hosted), semua data workflow dan kredensial tersimpan di infrastruktur Anda. Kami tidak memiliki akses ke data Anda.",
			},
			{
				q: "Bagaimana cara update ke versi terbaru?",
				a: "Paket Business dan Professional mendukung auto-update. Untuk paket Starter, Anda bisa melakukan update manual melalui panel kontrol kami kapan saja.",
			},
		],
		requirements: [
			"Node.js 18+ (sudah terinstall otomatis)",
			"Minimal 512 MB RAM",
			"Database: SQLite (default) atau PostgreSQL",
			"Akses internet untuk webhook",
		],
	},
	activepieces: {
		slug: "activepieces",
		name: "Activepieces",
		tagline: "Alternatif Open Source untuk Zapier",
		description:
			"Platform otomasi workflow open-source dengan ratusan integrasi. Alternatif terbaik untuk Zapier, Make, dan Tray.",
		longDescription:
			"Activepieces adalah platform otomasi bisnis open-source yang memungkinkan tim non-teknis untuk mengotomatiskan pekerjaan berulang. Dengan lebih dari 100 integrasi dan antarmuka yang ramah pengguna, Activepieces menjadi pilihan ideal untuk bisnis yang ingin kontrol penuh atas data mereka.",
		category: "Productivity",
		tags: ["Automation", "Integration", "Open Source"],
		logo: "https://avatars.githubusercontent.com/u/96545600?s=200&v=4",
		github: "https://github.com/activepieces/activepieces",
		website: "https://www.activepieces.com",
		demo: "https://cloud.activepieces.com",
		preview: "https://www.activepieces.com/og.png",
		stars: "9k",
		version: "0.20.3",
		license: "MIT",
		plans: [
			{
				id: "starter",
				name: "Starter",
				tagline: "Untuk eksperimen dan penggunaan pribadi",
				monthlyPrice: 85000,
				yearlyPrice: 57000,
				vcpu: "1 vCPU",
				ram: "1 GB RAM",
				storage: "10 GB SSD",
				bandwidth: "20 GB / bln",
				features: [
					{ label: "SSL Gratis", included: true },
					{ label: "Custom Domain", included: true },
					{ label: "Backup Mingguan", included: true },
					{ label: "Auto Update", included: true },
					{ label: "Backup Harian", included: false },
					{ label: "Priority Support", included: false },
					{ label: "Dedicated IP", included: false },
				],
			},
			{
				id: "business",
				name: "Business",
				tagline: "Untuk tim kecil hingga menengah",
				monthlyPrice: 150000,
				yearlyPrice: 100000,
				highlight: true,
				badge: "Paling Populer",
				vcpu: "2 vCPU",
				ram: "4 GB RAM",
				storage: "30 GB SSD",
				bandwidth: "Unlimited",
				features: [
					{ label: "SSL Gratis", included: true },
					{ label: "Custom Domain", included: true },
					{ label: "Backup Mingguan", included: true },
					{ label: "Auto Update", included: true },
					{ label: "Backup Harian", included: true },
					{ label: "Priority Support", included: false },
					{ label: "Dedicated IP", included: false },
				],
			},
			{
				id: "professional",
				name: "Professional",
				tagline: "Skala enterprise tanpa batas",
				monthlyPrice: 250000,
				yearlyPrice: 167000,
				vcpu: "4 vCPU",
				ram: "8 GB RAM",
				storage: "100 GB SSD NVMe",
				bandwidth: "Unlimited",
				features: [
					{ label: "SSL Gratis", included: true },
					{ label: "Custom Domain", included: true },
					{ label: "Backup Mingguan", included: true },
					{ label: "Auto Update", included: true },
					{ label: "Backup Harian", included: true },
					{ label: "Priority Support", included: true },
					{ label: "Dedicated IP", included: true },
				],
			},
		],
		features: [
			{
				icon: Zap,
				title: "Flow Builder Visual",
				description: "Bangun otomasi dengan antarmuka visual tanpa kode.",
			},
			{
				icon: Globe,
				title: "100+ Konektor",
				description: "Integrasi dengan aplikasi bisnis populer.",
			},
			{
				icon: ShieldCheck,
				title: "100% Self-hosted",
				description: "Kontrol penuh atas data dan privasi bisnis Anda.",
			},
			{
				icon: Users,
				title: "Kolaborasi Tim",
				description: "Kelola akses dan buat folder bersama untuk tim.",
			},
			{
				icon: RefreshCw,
				title: "Monitoring Real-time",
				description: "Pantau eksekusi dan error secara langsung.",
			},
			{
				icon: Terminal,
				title: "Kode Kustom",
				description: "Tambahkan logika kustom dengan JavaScript atau Python.",
			},
		],
		faqs: [
			{
				q: "Apa bedanya Activepieces dengan Zapier?",
				a: "Activepieces adalah self-hosted dan open-source, artinya data Anda di server Anda sendiri. Tidak ada biaya per-task seperti Zapier, dan Anda bebas memodifikasi sesuai kebutuhan.",
			},
			{
				q: "Apakah mendukung webhook?",
				a: "Ya, Activepieces mendukung webhook sebagai trigger untuk memulai otomasi. Setiap flow bisa memiliki endpoint webhook unik.",
			},
			{
				q: "Apakah bisa digunakan oleh banyak pengguna?",
				a: "Ya, Activepieces mendukung multi-user dengan sistem role dan permission. Paket Business ke atas mendukung unlimited users dalam satu instance.",
			},
		],
		requirements: [
			"Docker (sudah terinstall otomatis)",
			"Minimal 1 GB RAM",
			"Database: PostgreSQL (termasuk dalam paket)",
			"Redis untuk queue (termasuk dalam paket)",
		],
	},
};

// Fallback: generate minimal detail for slugs not in APPS
function getFallbackApp(slug: string): AppDetail {
	return {
		slug,
		name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " "),
		tagline: "Template Aplikasi Siap Deploy",
		description:
			"Aplikasi siap pakai yang dapat di-deploy dalam hitungan menit.",
		longDescription: "Detail aplikasi ini sedang disiapkan.",
		category: "General",
		tags: ["Self-hosted", "Open Source"],
		logo: "",
		github: "#",
		website: "#",
		demo: "#",
		preview: "",
		stars: "—",
		version: "latest",
		license: "Open Source",
		plans: [],
		features: [],
		faqs: [],
		requirements: [],
	};
}

const TAG_COLORS: Record<string, string> = {
	Automation: "bg-blue-50 text-blue-700 border-blue-200",
	Integration: "bg-violet-50 text-violet-700 border-violet-200",
	"Open Source": "bg-emerald-50 text-emerald-700 border-emerald-200",
	"Self-hosted": "bg-orange-50 text-orange-700 border-orange-200",
	"WhatsApp API": "bg-green-50 text-green-700 border-green-200",
	Messaging: "bg-teal-50 text-teal-700 border-teal-200",
	Deployment: "bg-sky-50 text-sky-700 border-sky-200",
	Monitoring: "bg-yellow-50 text-yellow-700 border-yellow-200",
	Chatbot: "bg-purple-50 text-purple-700 border-purple-200",
	"No-code": "bg-pink-50 text-pink-700 border-pink-200",
	Analytics: "bg-indigo-50 text-indigo-700 border-indigo-200",
	Database: "bg-red-50 text-red-700 border-red-200",
};

function SpecRow({
	icon: Icon,
	label,
	value,
}: {
	icon: React.ElementType;
	label: string;
	value: string;
}) {
	return (
		<div className="flex items-center gap-2 py-1.5 text-sm">
			<Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
			<span className="text-muted-foreground">{label}</span>
			<span className="ml-auto text-right font-medium">{value}</span>
		</div>
	);
}

function AppLogoLarge({ src, name }: { src: string; name: string }) {
	const [err, setErr] = useState(false);
	if (err || !src) {
		return (
			<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 font-bold text-2xl text-primary">
				{name[0]}
			</div>
		);
	}
	return (
		<img
			src={src}
			alt={name}
			onError={() => setErr(true)}
			className="h-16 w-16 rounded-2xl border border-border bg-background object-cover shadow-sm"
		/>
	);
}

function PreviewImage({ src, name }: { src: string; name: string }) {
	const [err, setErr] = useState(false);
	if (err || !src) {
		return (
			<div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-muted/30 text-muted-foreground">
				<Monitor className="h-12 w-12 opacity-20" />
				<span className="text-sm opacity-40">{name} Preview</span>
			</div>
		);
	}
	return (
		<img
			src={src}
			alt={`${name} preview`}
			onError={() => setErr(true)}
			className="h-full w-full object-cover object-top"
		/>
	);
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({ plan, billing }: { plan: AppPlan; billing: BillingCycle }) {
	const price = billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
	const saving = plan.monthlyPrice - plan.yearlyPrice;

	return (
		<Card
			className={`relative flex flex-col overflow-visible transition-shadow hover:shadow-lg ${
				plan.highlight
					? "border-primary shadow-md ring-1 ring-primary"
					: "border-border"
			}`}
		>
			{plan.badge && (
				<div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
					<Badge className="bg-primary px-3 py-0.5 text-primary-foreground text-xs shadow">
						{plan.badge}
					</Badge>
				</div>
			)}

			<CardHeader className="px-5 pt-6 pb-4">
				<div className="mb-1 flex items-center justify-between">
					<h3 className="font-bold text-base">{plan.name}</h3>
					<Server
						className={`h-4 w-4 ${plan.highlight ? "text-primary" : "text-muted-foreground"}`}
					/>
				</div>
				<p className="text-muted-foreground text-xs">{plan.tagline}</p>

				<div className="mt-4">
					<div className="flex items-end gap-1">
						<span className="font-extrabold text-3xl tracking-tight">
							{formatIDR(price)}
						</span>
						<span className="mb-1 text-muted-foreground text-sm">/bln</span>
					</div>
					{billing === "yearly" && (
						<p className="mt-0.5 font-medium text-green-600 text-xs">
							Hemat {formatIDR(saving * 12)}/tahun
						</p>
					)}
					{billing === "monthly" && (
						<p className="mt-0.5 text-muted-foreground text-xs">
							atau {formatIDR(plan.yearlyPrice)}/bln jika bayar tahunan
						</p>
					)}
				</div>
			</CardHeader>

			<Separator />

			<CardContent className="flex-1 px-5 py-4">
				<div className="mb-4 space-y-0.5">
					<SpecRow icon={Zap} label="vCPU" value={plan.vcpu} />
					<SpecRow icon={Database} label="RAM" value={plan.ram} />
					<SpecRow icon={HardDrive} label="Storage" value={plan.storage} />
					<SpecRow icon={Globe} label="Bandwidth" value={plan.bandwidth} />
				</div>

				<Separator className="my-3" />

				<ul className="space-y-2">
					{plan.features.map((f) => (
						<li key={f.label} className="flex items-start gap-2 text-xs">
							{f.included ? (
								<CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
							) : (
								<XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
							)}
							<span
								className={
									f.included
										? "text-foreground"
										: "text-muted-foreground/60 line-through"
								}
							>
								{f.label}
							</span>
						</li>
					))}
				</ul>
			</CardContent>

			<CardFooter className="px-5 pb-5">
				<Button
					className="w-full"
					variant={plan.highlight ? "default" : "outline"}
					size="sm"
				>
					Pilih Paket {plan.name}
				</Button>
			</CardFooter>
		</Card>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AppDetailPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = use(params);
	const app = APPS[slug] ?? getFallbackApp(slug);
	const [billing, setBilling] = useState<BillingCycle>("monthly");

	return (
		<div className="bg-background">
			{/* ── Hero ── */}
			<section className="border-b bg-linear-to-b from-primary/5 to-background">
				<div className="mx-auto max-w-5xl px-4 pt-24 pb-16">
					{/* Breadcrumb */}
					<div className="mb-6">
						<Link
							href="/apps"
							className="inline-flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
						>
							<ArrowLeft className="h-4 w-4" />
							Kembali ke Daftar Aplikasi
						</Link>
					</div>

					<div className="flex flex-col gap-6 sm:flex-row sm:items-start">
						{/* Logo + info */}
						<div className="flex flex-1 items-start gap-4">
							<AppLogoLarge src={app.logo} name={app.name} />
							<div className="min-w-0 flex-1">
								<div className="mb-2 flex flex-wrap items-center gap-2">
									<h1 className="font-extrabold text-2xl tracking-tight md:text-3xl">
										{app.name}
									</h1>
									<Badge variant="secondary">{app.category}</Badge>
									<span className="flex items-center gap-1 rounded-full border border-yellow-200 bg-yellow-50 px-2 py-0.5 font-semibold text-[11px] text-yellow-700">
										<Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
										{app.stars} stars
									</span>
								</div>
								<p className="mb-3 text-muted-foreground text-sm md:text-base">
									{app.description}
								</p>
								<div className="flex flex-wrap gap-1.5">
									{app.tags.map((tag) => (
										<span
											key={tag}
											className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium text-[11px] ${
												TAG_COLORS[tag] ??
												"border-border bg-muted text-muted-foreground"
											}`}
										>
											{tag}
										</span>
									))}
								</div>
							</div>
						</div>

						{/* Meta links */}
						<div className="flex shrink-0 flex-wrap gap-2 sm:flex-col">
							<div className="flex flex-wrap gap-2">
								<a href={app.github} target="_blank" rel="noopener noreferrer">
									<Button variant="outline" size="sm" className="gap-1.5">
										{/* <Github className="h-3.5 w-3.5" /> GitHub */}
									</Button>
								</a>
								<a href={app.website} target="_blank" rel="noopener noreferrer">
									<Button variant="outline" size="sm" className="gap-1.5">
										<ExternalLink className="h-3.5 w-3.5" /> Website
									</Button>
								</a>
								<a href={app.demo} target="_blank" rel="noopener noreferrer">
									<Button
										variant="outline"
										size="sm"
										className="gap-1.5 border-primary/40 text-primary hover:bg-primary/5"
									>
										<Globe className="h-3.5 w-3.5" /> Demo
									</Button>
								</a>
							</div>
							<div className="flex flex-wrap gap-x-4 gap-y-1 rounded-xl bg-muted/50 px-3 py-2 text-muted-foreground text-xs">
								<span className="flex items-center gap-1">
									<Tag className="h-3 w-3" /> v{app.version}
								</span>
								<span className="flex items-center gap-1">
									<ShieldCheck className="h-3 w-3" /> {app.license}
								</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ── Preview Screenshot ── */}
			{app.preview && (
				<section className="mx-auto max-w-5xl px-4 py-8">
					<div className="overflow-hidden rounded-xl border border-border shadow-md">
						<div className="flex items-center gap-1.5 border-b bg-muted/50 px-4 py-2.5">
							<div className="h-2.5 w-2.5 rounded-full bg-red-400" />
							<div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
							<div className="h-2.5 w-2.5 rounded-full bg-green-400" />
							<span className="ml-2 flex-1 rounded bg-background px-3 py-0.5 text-[11px] text-muted-foreground">
								{app.demo}
							</span>
						</div>
						<div className="h-64 overflow-hidden bg-muted/30 sm:h-80 md:h-96">
							<PreviewImage src={app.preview} name={app.name} />
						</div>
					</div>
				</section>
			)}

			{/* ── About ── */}
			{app.longDescription && (
				<section className="mx-auto max-w-5xl px-4 pb-8">
					<h2 className="mb-3 font-bold text-lg md:text-xl">
						Tentang {app.name}
					</h2>
					<p className="max-w-3xl text-muted-foreground text-sm leading-relaxed md:text-base">
						{app.longDescription}
					</p>
					{app.requirements.length > 0 && (
						<div className="mt-5 rounded-xl border border-border bg-muted/20 p-4">
							<p className="mb-2 flex items-center gap-2 font-semibold text-sm">
								<Terminal className="h-4 w-4 text-primary" />
								System Requirements
							</p>
							<ul className="space-y-1">
								{app.requirements.map((req) => (
									<li
										key={req}
										className="flex items-center gap-2 text-muted-foreground text-xs"
									>
										<CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
										{req}
									</li>
								))}
							</ul>
						</div>
					)}
				</section>
			)}

			<Separator />

			{/* ── Pricing ── */}
			{app.plans.length > 0 && (
				<section className="mx-auto max-w-5xl px-4 py-10 md:py-14">
					{/* Billing toggle */}
					<div className="mb-10 flex flex-col items-center gap-2">
						<h2 className="mb-3 font-bold text-xl md:text-2xl">Pilih Paket</h2>
						<Tabs
							value={billing}
							onValueChange={(v) => setBilling(v as BillingCycle)}
							className="w-auto"
						>
							<TabsList className="h-10">
								<TabsTrigger value="monthly" className="px-5 text-sm">
									Bulanan
								</TabsTrigger>
								<TabsTrigger value="yearly" className="px-5 text-sm">
									Tahunan
									<Badge className="ml-2 h-4 bg-green-600 px-1.5 py-0 text-[10px] hover:bg-green-600">
										Hemat s/d 35%
									</Badge>
								</TabsTrigger>
							</TabsList>
						</Tabs>
						{billing === "yearly" && (
							<p className="text-muted-foreground text-xs">
								Harga ditampilkan per bulan, ditagih sekaligus untuk 12 bulan.
							</p>
						)}
					</div>

					<div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{app.plans.map((plan) => (
							<PlanCard key={plan.id} plan={plan} billing={billing} />
						))}
					</div>

					<p className="mt-6 text-center text-muted-foreground text-xs">
						Semua paket sudah termasuk SSL gratis dan auto-deploy. Harga belum
						termasuk PPN 11%.
					</p>
				</section>
			)}

			{app.features.length > 0 && <Separator />}

			{/* ── Features ── */}
			{app.features.length > 0 && (
				<section className="mx-auto max-w-5xl px-4 py-10 md:py-14">
					<div className="mb-8 text-center">
						<h2 className="mb-2 font-bold text-xl md:text-2xl">
							Fitur Unggulan
						</h2>
						<p className="mx-auto max-w-md text-muted-foreground text-sm">
							Semua yang Anda butuhkan sudah tersedia dalam satu platform.
						</p>
					</div>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{app.features.map((f) => (
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
			)}

			{app.faqs.length > 0 && <Separator />}

			{/* ── FAQ ── */}
			{app.faqs.length > 0 && (
				<section className="mx-auto max-w-2xl px-4 py-10 md:py-14">
					<div className="mb-8 text-center">
						<h2 className="mb-2 font-bold text-xl md:text-2xl">
							Pertanyaan Umum
						</h2>
						<p className="text-muted-foreground text-sm">
							Tidak menemukan jawaban?{" "}
							<button className="text-primary underline underline-offset-2 hover:no-underline">
								Hubungi kami
							</button>
						</p>
					</div>
					<Accordion type="single" collapsible className="w-full space-y-2">
						{app.faqs.map((faq, i) => (
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
			)}

			{/* ── CTA ── */}
			<section className="border-t bg-primary/5">
				<div className="mx-auto max-w-5xl px-4 py-10 text-center md:py-12">
					<h2 className="mb-2 font-bold text-xl md:text-2xl">
						Siap Deploy {app.name}?
					</h2>
					<p className="mx-auto mb-6 max-w-md text-muted-foreground text-sm">
						Aktifkan {app.name} di server Anda dalam hitungan menit. Tanpa
						konfigurasi manual.
					</p>
					<div className="flex flex-col justify-center gap-3 sm:flex-row">
						<Button size="lg" className="w-full sm:w-auto">
							Deploy Sekarang
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="w-full gap-2 sm:w-auto"
						>
							<Globe className="h-4 w-4" /> Lihat Demo
						</Button>
					</div>
				</div>
			</section>
		</div>
	);
}
