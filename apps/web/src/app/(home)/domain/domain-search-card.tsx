"use client";

import { Button } from "@tanisya/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@tanisya/ui/components/card";
import { Input } from "@tanisya/ui/components/input";
import { Search } from "lucide-react";
// app/domain/domain-search-card.tsx
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { QUICK_TLDS } from "./domain-data";

export function DomainSearchCard() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [domainInput, setDomainInput] = useState("");

	useEffect(() => {
		const q = searchParams.get("domainToCheck");
		if (q) setDomainInput(q);
	}, [searchParams]);

	const handleSearch = () => {
		const raw = domainInput.trim().replace(/^https?:\/\//, "");
		if (!raw) return;
		router.push(`/domainsearch?domainToCheck=${encodeURIComponent(raw)}`);
	};

	const handleQuickTld = (tld: string) => {
		const base =
			domainInput
				.trim()
				.replace(/^https?:\/\//, "")
				.split(".")[0] || "";
		setDomainInput(base ? `${base}${tld}` : tld);
	};

	return (
		<Card className="mx-auto max-w-2xl shadow-md">
			<CardHeader className="px-5 pt-5 pb-2">
				<CardTitle className="flex items-center gap-2 font-semibold text-sm">
					<Search className="h-4 w-4 text-primary" />
					Cek Ketersediaan Domain
				</CardTitle>
				<CardDescription className="text-xs">
					Ketik nama brand Anda — kami akan cek ketersediaannya di berbagai
					ekstensi
				</CardDescription>
			</CardHeader>

			<CardContent className="px-5 pb-5">
				<div className="flex flex-col gap-2 sm:flex-row">
					<Input
						placeholder="Contoh: tokobuku atau tokobuku.com"
						value={domainInput}
						onChange={(e) => setDomainInput(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleSearch()}
						className="h-10 flex-1"
					/>
					<Button
						onClick={handleSearch}
						disabled={!domainInput.trim()}
						className="h-10 w-full shrink-0 gap-2 sm:w-auto"
					>
						<Search className="h-4 w-4" />
						Cek Sekarang
					</Button>
				</div>

				<div className="mt-3 flex flex-wrap gap-1.5">
					<span className="self-center text-[11px] text-muted-foreground">
						Ekstensi populer:
					</span>
					{QUICK_TLDS.map((tld) => (
						<button
							key={tld}
							type="button"
							onClick={() => handleQuickTld(tld)}
							className="rounded-full border bg-muted/50 px-2 py-0.5 font-mono text-[11px] transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
						>
							{tld}
						</button>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
