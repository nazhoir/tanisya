"use client";

import { Badge } from "@tanisya/ui/components/badge";
import { Button } from "@tanisya/ui/components/button";
import { Input } from "@tanisya/ui/components/input";
import { cn } from "@tanisya/ui/lib/utils";
import {
	Globe,
	Instagram,
	Mail,
	MapPin,
	MessageCircle,
	Send,
	ShieldCheck,
	Star,
	Twitter,
	Users,
	Youtube,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { OSS_PROJECTS } from "@/constant/oss";
import { PAYMENT_METHODS } from "@/constant/payment-methods";
import { PRODUCT_ITEMS } from "@/constant/products";
import { RESOURCES_CONTENTS } from "@/constant/resources-contents";
import Logo from "./logo";

// ─── Payment data ─────────────────────────────────────────────────────────────

const SOCIALS = [
	{
		icon: Instagram,
		label: "Instagram",
		href: "https://instagram.com/tanisya",
		color: "hover:text-pink-500",
	},
	{
		icon: Twitter,
		label: "X/Twitter",
		href: "https://twitter.com/tanisya",
		color: "hover:text-sky-400",
	},
	{
		icon: Youtube,
		label: "YouTube",
		href: "https://youtube.com/@tanisya",
		color: "hover:text-red-500",
	},
	{
		icon: MessageCircle,
		label: "WhatsApp",
		href: "https://wa.me/6281234567890",
		color: "hover:text-green-500",
	},
];

const TRUST_BADGES = [
	{
		icon: ShieldCheck,
		label: "SSL Terenkripsi",
		description: "Transaksi aman 256-bit",
	},
	{ icon: Star, label: "4.9/5 Rating", description: "Dari 2.400+ ulasan" },
	{
		icon: Users,
		label: "50.000+ Pelanggan",
		description: "Aktif di seluruh Indonesia",
	},
	{ icon: Zap, label: "Uptime 99.9%", description: "SLA terjamin" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function MenuBadge({ label }: { label: string }) {
	return (
		<span
			className={cn(
				"ml-1.5 inline-flex items-center rounded px-1 py-0 font-bold text-[9px] leading-4 tracking-wide",
				label === "Promo" && "bg-primary/15 text-primary",
				label === "Baru" &&
					"bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
				label === "Populer" &&
					"bg-orange-500/15 text-orange-600 dark:text-orange-400",
				label === "OSS" &&
					"bg-violet-500/15 text-violet-600 dark:text-violet-400",
			)}
		>
			{label}
		</span>
	);
}

function PaymentLogo({ name, url }: { name: string; url: string }) {
	const [err, setErr] = useState(false);
	if (err) {
		return (
			<div className="flex h-9 min-w-13 items-center justify-center rounded-lg border border-border bg-muted px-2 font-bold text-[10px] text-muted-foreground hover:bg-white hover:text-black">
				{name}
			</div>
		);
	}
	return (
		<div
			title={name}
			className="flex h-9 min-w-13 items-center justify-center rounded-lg border border-border/60 bg-background px-2.5 grayscale transition-all hover:border-primary/30 hover:bg-white hover:shadow-sm hover:grayscale-0"
		>
			<img
				src={url}
				alt={name}
				onError={() => setErr(true)}
				className="h-4 max-w-15 object-contain"
			/>
		</div>
	);
}

function NewsletterForm() {
	const [email, setEmail] = useState("");
	const [sent, setSent] = useState(false);

	if (sent) {
		return (
			<div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-3 font-medium text-primary text-sm">
				<ShieldCheck className="h-4 w-4 shrink-0" />
				Terima kasih! Anda akan segera menerima info terbaru.
			</div>
		);
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				if (email) setSent(true);
			}}
			className="flex gap-2"
		>
			<Input
				type="email"
				placeholder="email@domain.com"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				required
				className="h-9 bg-background text-sm"
			/>
			<Button type="submit" size="sm" className="h-9 shrink-0 gap-1.5">
				<Send className="h-3.5 w-3.5" />
				<span className="hidden sm:inline">Langganan</span>
			</Button>
		</form>
	);
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export default function Footer() {
	const year = new Date().getFullYear();
	const MENUS = [...PRODUCT_ITEMS, ...OSS_PROJECTS, ...RESOURCES_CONTENTS];

	return (
		<footer className="border-border border-t">
			{/* ══════════════════════════════════════════════════════════
          SECTION 1 — BRAND / LOGO / KONTAK / NEWSLETTER
      ══════════════════════════════════════════════════════════ */}
			<div className="bg-muted/40">
				<div className="mx-auto max-w-7xl px-6 py-10">
					<div className="grid grid-cols-1 gap-10 md:grid-cols-2">
						{/* Logo + tagline */}
						<div className="flex flex-col gap-5">
							<Logo />
							<p className="max-w-lg text-muted-foreground text-sm leading-relaxed">
								Solusi digital terpercaya untuk bisnis Anda — hosting, server,
								produk digital, template, dan layanan custom website
								profesional.
							</p>
							<div className="flex flex-col gap-1.5">
								<a
									href="mailto:halo@tanisya.com"
									className="inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
								>
									<Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
									halo@tanisya.com
								</a>
								<a
									href="https://wa.me/6281234567890"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
								>
									<MessageCircle className="h-3.5 w-3.5 shrink-0 text-primary" />
									+62 812-3456-7890
								</a>
								<span className="inline-flex items-start gap-2 text-muted-foreground text-sm">
									<MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
									Jakarta, Indonesia
								</span>
							</div>
							{/* Social icons */}
							<div className="flex items-center gap-1.5">
								{SOCIALS.map(({ icon: Icon, label, href, color }) => (
									<a
										key={label}
										href={href}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={label}
										className={cn(
											"flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary/30 hover:bg-accent",
											color,
										)}
									>
										<Icon className="h-3.5 w-3.5" />
									</a>
								))}
							</div>
						</div>

						{/* Newsletter */}
						<div className="flex flex-col content-start gap-3">
							<div>
								<p className="font-semibold text-sm">
									Dapatkan promo &amp; update
								</p>
								<p className="mt-0.5 text-muted-foreground text-xs">
									Info terbaru, tips teknis, dan penawaran eksklusif langsung ke
									inbox Anda.
								</p>
							</div>
							<NewsletterForm />
						</div>
					</div>
				</div>
			</div>

			{/* ══════════════════════════════════════════════════════════
          SECTION 2 — MENU GRID 
      ══════════════════════════════════════════════════════════ */}
			<div className="border-border/60 border-t">
				<div className="mx-auto max-w-7xl px-6 py-10">
					<div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:grid-cols-4">
						{MENUS.map(({ category, items }) => (
							<div key={category}>
								<h3 className="mb-3 font-bold text-[10px] text-foreground uppercase tracking-[0.12em]">
									{category}
								</h3>
								<ul className="flex flex-col gap-2">
									{items.map(({ label, to, badge }) => (
										<Link
											href={to as any}
											key={to}
											className="text-muted-foreground text-sm transition-colors hover:text-foreground"
										>
											{label}
											{badge && <MenuBadge label={badge} />}
										</Link>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* ══════════════════════════════════════════════════════════
          SECTION 3 — PAYMENT METHODS
      ══════════════════════════════════════════════════════════ */}
			<div className="border-border/60 border-t bg-muted/20">
				<div className="mx-auto max-w-7xl px-6 py-8">
					{/* Header row */}
					<div className="mb-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="font-bold text-[10px] text-foreground uppercase tracking-[0.12em]">
								Metode Pembayaran
							</p>
							<p className="mt-0.5 text-muted-foreground text-xs">
								Berbagai pilihan tersedia untuk kemudahan transaksi Anda
							</p>
						</div>
						<div className="mx-auto flex flex-wrap items-center gap-2 sm:mx-0">
							<div className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 dark:border-green-900 dark:bg-green-950/30">
								<ShieldCheck className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
								<span className="font-semibold text-[11px] text-green-700 dark:text-green-400">
									SSL Secured
								</span>
							</div>
							<div className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 dark:border-blue-900 dark:bg-blue-950/30">
								<Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
								<span className="font-semibold text-[11px] text-blue-700 dark:text-blue-400">
									ICANN Accredited
								</span>
							</div>
						</div>
					</div>

					{/* Grouped rows */}
					<div className="flex flex-col divide-y divide-border/40">
						{PAYMENT_METHODS.map((group) => (
							<div
								key={group.category}
								className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
							>
								{/* Category label */}
								<div className="w-28 shrink-0">
									<span className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
										{group.category}
									</span>
								</div>
								{/* Logos */}
								<div className="flex flex-wrap gap-1.5">
									{group.logos.map((p) => (
										<PaymentLogo key={p.name} name={p.name} url={p.url} />
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* ══════════════════════════════════════════════════════════
          SECTION 4 — COPYRIGHT / BOTTOM BAR
      ══════════════════════════════════════════════════════════ */}
			<div className="border-border/60 border-t bg-background">
				<div className="mx-auto max-w-7xl px-6 py-4">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-center text-muted-foreground text-xs sm:text-left">
							© {year}{" "}
							<Link
								href="/"
								className="font-semibold text-foreground transition-colors hover:text-primary"
							>
								Tanisya
							</Link>
							. Seluruh hak cipta dilindungi.
						</p>
						<div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 sm:justify-end">
							{[
								{ label: "Kebijakan Privasi", href: "/privacy" },
								{ label: "Syarat & Ketentuan", href: "/terms" },
								{ label: "Kebijakan Cookie", href: "/cookies" },
								{ label: "Status Sistem", href: "https://status.tanisya.com" },
							].map(({ label, href }) => (
								<Link
									key={href}
									href={href as any}
									className="text-muted-foreground text-xs transition-colors hover:text-foreground"
								>
									{label}
								</Link>
							))}
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
