"use client";

import { ShieldCheck, Users, Zap } from "lucide-react";
import type * as React from "react";

const HERO_PERKS = [
	{ icon: ShieldCheck, text: "SSL & keamanan enterprise gratis" },
	{ icon: Zap, text: "Deploy dalam hitungan menit" },
	{ icon: Users, text: "Support manusia 24/7 via WhatsApp" },
] as const;

export default function LoginLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-4">
			<div className="overflow-hidden rounded-2xl border border-border/60 bg-background shadow-black/5 shadow-xl md:grid md:grid-cols-2">
				{/* ── Left: hero panel ────────────────────────────────────────── */}
				<div className="relative hidden overflow-hidden bg-linear-to-br from-primary via-primary/90 to-blue-600 p-8 text-primary-foreground md:flex md:flex-col md:justify-between">
					<div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
					<div className="pointer-events-none absolute -bottom-8 left-1/3 h-32 w-32 rounded-full bg-white/8 blur-2xl" />
					<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />

					<div className="relative">
						<p className="font-extrabold text-xl tracking-tight">Tanisya</p>
						<p className="font-semibold text-[11px] text-primary-foreground/60 uppercase tracking-[0.15em]">
							Solusi digital serba ada
						</p>
					</div>

					<div className="relative my-auto py-8">
						<h2 className="mb-3 font-extrabold text-2xl leading-tight tracking-tight">
							Semua yang dibutuhkan bisnis digitalmu ada di sini
						</h2>
						<p className="text-primary-foreground/75 text-sm leading-relaxed">
							Hosting, domain, SSL, template, hingga 50+ aplikasi siap deploy —
							dalam satu platform yang aman dan terpercaya.
						</p>
					</div>

					<div className="relative flex flex-col gap-2.5">
						{HERO_PERKS.map(({ icon: Icon, text }) => (
							<div key={text} className="flex items-center gap-2.5 text-sm">
								<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/15">
									<Icon className="h-3.5 w-3.5" />
								</span>
								<span className="text-primary-foreground/85">{text}</span>
							</div>
						))}
					</div>
				</div>

				{/* ── Right: form panel ───────────────────────────────────────── */}
				<div className="flex flex-col justify-center p-6 md:p-8">
					{children}
				</div>
			</div>

			{/* ── Legal footer ──────────────────────────────────────────────────── */}
			<p className="px-4 text-center text-muted-foreground text-xs">
				Dengan melanjutkan, Anda menyetujui{" "}
				<a
					href="/terms"
					className="font-semibold underline-offset-2 hover:text-primary hover:underline"
				>
					Syarat Layanan
				</a>{" "}
				dan{" "}
				<a
					href="/privacy"
					className="font-semibold underline-offset-2 hover:text-primary hover:underline"
				>
					Kebijakan Privasi
				</a>{" "}
				kami.
			</p>
		</div>
	);
}