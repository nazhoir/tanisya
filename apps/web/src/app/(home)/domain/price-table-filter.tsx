"use client";

// app/domain/price-table-filter.tsx
// Client component untuk filter + tab di price list
// Tidak mengandung useSearchParams, jadi tidak perlu Suspense

import { Badge } from "@tanisya/ui/components/badge";
import { Button } from "@tanisya/ui/components/button";
import { Card, CardContent } from "@tanisya/ui/components/card";
import { Input } from "@tanisya/ui/components/input";
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
import { Search, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { formatIDR } from "@/lib/format-currency";
import type { DomainPrice } from "./domain-data";

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

interface Props {
	allDomains: DomainPrice[];
	domainPrices: Record<string, DomainPrice[]>;
}

export function PriceTableFilter({ allDomains, domainPrices }: Props) {
	const [searchQuery, setSearchQuery] = useState("");

	const isFiltering = searchQuery.length > 0;
	const filteredDomains = isFiltering
		? allDomains.filter((d) =>
				d.tld.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		: null;

	return (
		<>
			<div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h2 className="font-bold text-xl md:text-2xl">Daftar Harga Domain</h2>
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

			{isFiltering ? (
				filteredDomains!.length === 0 ? (
					<p className="py-8 text-center text-muted-foreground text-sm">
						Tidak ada ekstensi yang cocok dengan &ldquo;{searchQuery}&rdquo;
					</p>
				) : (
					<PriceTable items={filteredDomains!} />
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
					{Object.entries(domainPrices).map(([cat, items]) => (
						<TabsContent key={cat} value={cat}>
							<PriceTable items={items} />
						</TabsContent>
					))}
				</Tabs>
			)}
		</>
	);
}
