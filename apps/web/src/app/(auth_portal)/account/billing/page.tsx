"use client";

import { Badge } from "@tanisya/ui/components/badge";
import { Button } from "@tanisya/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@tanisya/ui/components/card";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@tanisya/ui/components/drawer";
import { Separator as Sep } from "@tanisya/ui/components/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@tanisya/ui/components/sheet";
import { Tabs, TabsList, TabsTrigger } from "@tanisya/ui/components/tabs";
import { useMediaQuery } from "@tanisya/ui/hooks/use-media-query";
import {
	ArrowDownToLine,
	CheckCircle2,
	ChevronRight,
	Clock,
	CreditCard,
	XCircle,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { AccountHeader } from "@/components/account-header";

// ─── Types ───────────────────────────────────────────────────────────────────

type TxStatus = "paid" | "pending" | "failed";

interface Transaction {
	id: string;
	invoice: string;
	description: string;
	amount: number;
	date: string;
	dueDate?: string;
	status: TxStatus;
	method: string;
	items: { label: string; amount: number }[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const transactions: Transaction[] = [
	{
		id: "1",
		invoice: "INV-2025-0042",
		description: "Paket Pro – Bulanan",
		amount: 299000,
		date: "15 Mar 2025",
		status: "paid",
		method: "Kartu Kredit •••• 4242",
		items: [
			{ label: "Paket Pro (1 bulan)", amount: 279000 },
			{ label: "PPN 11%", amount: 20000 },
		],
	},
	{
		id: "2",
		invoice: "INV-2025-0041",
		description: "Paket Pro – Bulanan",
		amount: 299000,
		date: "20 Apr 2025",
		dueDate: "25 Apr 2025",
		status: "pending",
		method: "Transfer Bank",
		items: [
			{ label: "Paket Pro (1 bulan)", amount: 279000 },
			{ label: "PPN 11%", amount: 20000 },
		],
	},
	{
		id: "3",
		invoice: "INV-2025-0040",
		description: "Tambahan Penyimpanan 50GB",
		amount: 49000,
		date: "10 Feb 2025",
		status: "paid",
		method: "GoPay",
		items: [
			{ label: "Penyimpanan 50GB", amount: 44000 },
			{ label: "PPN 11%", amount: 5000 },
		],
	},
	{
		id: "4",
		invoice: "INV-2025-0039",
		description: "Paket Pro – Bulanan",
		amount: 299000,
		date: "15 Jan 2025",
		status: "failed",
		method: "Kartu Kredit •••• 4242",
		items: [
			{ label: "Paket Pro (1 bulan)", amount: 279000 },
			{ label: "PPN 11%", amount: 20000 },
		],
	},
	{
		id: "5",
		invoice: "INV-2024-0038",
		description: "Paket Pro – Bulanan",
		amount: 299000,
		date: "15 Des 2024",
		status: "paid",
		method: "OVO",
		items: [
			{ label: "Paket Pro (1 bulan)", amount: 279000 },
			{ label: "PPN 11%", amount: 20000 },
		],
	},
	{
		id: "6",
		invoice: "INV-2024-0037",
		description: "Tambahan Pengguna (5 seat)",
		amount: 125000,
		date: "1 Des 2024",
		status: "paid",
		method: "GoPay",
		items: [
			{ label: "5 Seat Tambahan", amount: 112500 },
			{ label: "PPN 11%", amount: 12500 },
		],
	},
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatIDR(amount: number) {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(amount);
}

const statusConfig: Record<
	TxStatus,
	{
		label: string;
		variant: "default" | "secondary" | "destructive" | "outline";
		icon: React.ReactNode;
		color: string;
	}
> = {
	paid: {
		label: "Lunas",
		variant: "outline",
		icon: <CheckCircle2 className="h-3.5 w-3.5" />,
		color: "text-emerald-600 border-emerald-300 bg-emerald-50",
	},
	pending: {
		label: "Menunggu",
		variant: "outline",
		icon: <Clock className="h-3.5 w-3.5" />,
		color: "text-amber-600 border-amber-300 bg-amber-50",
	},
	failed: {
		label: "Gagal",
		variant: "outline",
		icon: <XCircle className="h-3.5 w-3.5" />,
		color: "text-red-600 border-red-300 bg-red-50",
	},
};

// ─── Detail Content ───────────────────────────────────────────────────────────

function BillingDetail({ tx }: { tx: Transaction }) {
	const s = statusConfig[tx.status];
	return (
		<div className="flex flex-col gap-5 p-1">
			{/* Status */}
			<div className="flex items-center justify-between">
				<span className="text-muted-foreground text-sm">Status</span>
				<Badge
					variant="outline"
					className={`gap-1.5 font-medium text-xs ${s.color}`}
				>
					{s.icon}
					{s.label}
				</Badge>
			</div>

			<Sep />

			{/* Invoice info */}
			<div className="space-y-3">
				{[
					{ label: "Nomor Invoice", value: tx.invoice },
					{ label: "Tanggal", value: tx.date },
					...(tx.dueDate ? [{ label: "Jatuh Tempo", value: tx.dueDate }] : []),
					{ label: "Metode Pembayaran", value: tx.method },
				].map((row) => (
					<div key={row.label} className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">{row.label}</span>
						<span className="font-medium text-sm">{row.value}</span>
					</div>
				))}
			</div>

			<Sep />

			{/* Items */}
			<div className="space-y-2">
				<p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
					Rincian
				</p>
				{tx.items.map((item) => (
					<div key={item.label} className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">{item.label}</span>
						<span className="text-sm">{formatIDR(item.amount)}</span>
					</div>
				))}
				<Sep className="my-1" />
				<div className="flex items-center justify-between">
					<span className="font-semibold text-sm">Total</span>
					<span className="font-bold text-sm">{formatIDR(tx.amount)}</span>
				</div>
			</div>

			{/* Actions */}
			<div className="flex flex-col gap-2 pt-2">
				{tx.status === "pending" && (
					<Button className="w-full gap-2">
						<CreditCard className="h-4 w-4" />
						Bayar Sekarang
					</Button>
				)}
				{tx.status === "failed" && (
					<Button className="w-full gap-2" variant="destructive">
						<Zap className="h-4 w-4" />
						Coba Lagi
					</Button>
				)}
				<Button variant="outline" className="w-full gap-2">
					<ArrowDownToLine className="h-4 w-4" />
					Unduh Invoice
				</Button>
			</div>
		</div>
	);
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function TransactionRow({
	tx,
	onClick,
}: {
	tx: Transaction;
	onClick: () => void;
}) {
	const s = statusConfig[tx.status];
	return (
		<button
			onClick={onClick}
			className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
		>
			{/* Icon */}
			<div className="shrink-0 rounded-lg bg-muted p-2.5">
				<CreditCard className="h-4 w-4 text-muted-foreground" />
			</div>

			{/* Info */}
			<div className="min-w-0 flex-1">
				<div className="flex items-center justify-between gap-2">
					<p className="truncate font-medium text-sm">{tx.description}</p>
					<span className="shrink-0 font-semibold text-sm">
						{formatIDR(tx.amount)}
					</span>
				</div>
				<div className="mt-0.5 flex items-center justify-between gap-2">
					<p className="truncate text-muted-foreground text-xs">
						{tx.invoice} · {tx.date}
					</p>
					<Badge
						variant="outline"
						className={`shrink-0 gap-1 font-medium text-[11px] ${s.color}`}
					>
						{s.icon}
						{s.label}
					</Badge>
				</div>
			</div>

			<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
		</button>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingPage() {
	const [selected, setSelected] = useState<Transaction | null>(null);
	const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
	const isDesktop = useMediaQuery("(min-width: 768px)");

	const filtered = transactions.filter((tx) => {
		if (filter === "active") return tx.status === "pending";
		if (filter === "inactive")
			return tx.status === "paid" || tx.status === "failed";
		return true;
	});

	const detailContent = selected ? <BillingDetail tx={selected} /> : null;

	return (
		<>
			<AccountHeader page="Tagihan" />

			{/* Content */}
			<div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 pt-4 md:p-6">
				{/* Title */}
				<div>
					<h1 className="font-semibold text-2xl tracking-tight">Tagihan</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Kelola transaksi dan tagihan akun kamu.
					</p>
				</div>

				{/* Summary cards */}
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					<Card className="p-4">
						<p className="mb-1 text-muted-foreground text-xs">
							Total Transaksi
						</p>
						<p className="font-bold text-2xl">{transactions.length}</p>
					</Card>
					<Card className="p-4">
						<p className="mb-1 text-muted-foreground text-xs">Menunggu Bayar</p>
						<p className="font-bold text-2xl text-amber-600">
							{transactions.filter((t) => t.status === "pending").length}
						</p>
					</Card>
					<Card className="col-span-2 p-4 sm:col-span-1">
						<p className="mb-1 text-muted-foreground text-xs">Total Dibayar</p>
						<p className="font-bold text-emerald-600 text-lg">
							{formatIDR(
								transactions
									.filter((t) => t.status === "paid")
									.reduce((s, t) => s + t.amount, 0),
							)}
						</p>
					</Card>
				</div>

				{/* Transaction list */}
				<Card className="overflow-hidden">
					<CardHeader className="px-4 pt-4 pb-0">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div>
								<CardTitle className="text-base">Riwayat Transaksi</CardTitle>
								<CardDescription className="mt-0.5">
									Klik baris untuk melihat detail tagihan.
								</CardDescription>
							</div>
							<Tabs
								value={filter}
								onValueChange={(v) => setFilter(v as typeof filter)}
							>
								<TabsList className="h-8 text-xs">
									<TabsTrigger value="all" className="h-6 px-3 text-xs">
										Semua
									</TabsTrigger>
									<TabsTrigger value="active" className="h-6 px-3 text-xs">
										Aktif
									</TabsTrigger>
									<TabsTrigger value="inactive" className="h-6 px-3 text-xs">
										Selesai
									</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>
					</CardHeader>

					<CardContent className="mt-3 p-0">
						{filtered.length === 0 ? (
							<div className="py-12 text-center text-muted-foreground text-sm">
								Tidak ada transaksi.
							</div>
						) : (
							<div className="divide-y">
								{filtered.map((tx) => (
									<TransactionRow
										key={tx.id}
										tx={tx}
										onClick={() => setSelected(tx)}
									/>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* ── Desktop: Sheet from right ── */}
			{isDesktop && (
				<Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
					<SheetContent className="w-[380px] overflow-y-auto sm:w-[420px]">
						<SheetHeader className="mb-4">
							<SheetTitle>{selected?.description ?? ""}</SheetTitle>
							<SheetDescription>{selected?.invoice ?? ""}</SheetDescription>
						</SheetHeader>
						{detailContent}
					</SheetContent>
				</Sheet>
			)}

			{/* ── Mobile: Drawer from bottom ── */}
			{!isDesktop && (
				<Drawer open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
					<DrawerContent className="max-h-[90svh]">
						<DrawerHeader className="text-left">
							<DrawerTitle>{selected?.description ?? ""}</DrawerTitle>
							<DrawerDescription>{selected?.invoice ?? ""}</DrawerDescription>
						</DrawerHeader>
						<div className="overflow-y-auto px-4 pb-6">{detailContent}</div>
					</DrawerContent>
				</Drawer>
			)}
		</>
	);
}
