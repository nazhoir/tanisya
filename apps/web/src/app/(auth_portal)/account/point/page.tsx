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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@tanisya/ui/components/dialog";
import { Input } from "@tanisya/ui/components/input";
import { Label } from "@tanisya/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@tanisya/ui/components/select";
import { Separator as Sep } from "@tanisya/ui/components/separator";
import {
	ArrowDownLeft,
	ArrowUpRight,
	CheckCircle2,
	CreditCard,
	Landmark,
	Plus,
	Smartphone,
	Star,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { AccountHeader } from "@/components/account-header";

// ─── Types ────────────────────────────────────────────────────────────────────

type TxType = "topup" | "used" | "refund";

interface WalletTx {
	id: string;
	label: string;
	date: string;
	amount: number;
	type: TxType;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const balance = 185000;

const history: WalletTx[] = [
	{
		id: "1",
		label: "Top Up via GoPay",
		date: "20 Apr 2025",
		amount: 100000,
		type: "topup",
	},
	{
		id: "2",
		label: "Paket Pro – Apr 2025",
		date: "15 Apr 2025",
		amount: -79000,
		type: "used",
	},
	{
		id: "3",
		label: "Refund Tambahan Seat",
		date: "10 Apr 2025",
		amount: 25000,
		type: "refund",
	},
	{
		id: "4",
		label: "Top Up via Transfer Bank",
		date: "1 Apr 2025",
		amount: 200000,
		type: "topup",
	},
	{
		id: "5",
		label: "Paket Pro – Mar 2025",
		date: "15 Mar 2025",
		amount: -79000,
		type: "used",
	},
	{
		id: "6",
		label: "Top Up via OVO",
		date: "1 Mar 2025",
		amount: 50000,
		type: "topup",
	},
	{
		id: "7",
		label: "Tambahan Penyimpanan",
		date: "5 Feb 2025",
		amount: -32000,
		type: "used",
	},
];

const topupPackages = [
	{ value: "50000", label: "Rp 50.000" },
	{ value: "100000", label: "Rp 100.000" },
	{ value: "200000", label: "Rp 200.000" },
	{ value: "500000", label: "Rp 500.000" },
];

const paymentMethods = [
	{ value: "gopay", label: "GoPay", icon: <Smartphone className="h-4 w-4" /> },
	{ value: "ovo", label: "OVO", icon: <Smartphone className="h-4 w-4" /> },
	{
		value: "bank",
		label: "Transfer Bank",
		icon: <Landmark className="h-4 w-4" />,
	},
	{
		value: "card",
		label: "Kartu Kredit/Debit",
		icon: <CreditCard className="h-4 w-4" />,
	},
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatIDR(amount: number) {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(Math.abs(amount));
}

const txConfig: Record<
	TxType,
	{ color: string; icon: React.ReactNode; sign: string }
> = {
	topup: {
		color: "text-emerald-600",
		icon: <ArrowDownLeft className="h-4 w-4 text-emerald-600" />,
		sign: "+",
	},
	refund: {
		color: "text-blue-600",
		icon: <ArrowDownLeft className="h-4 w-4 text-blue-600" />,
		sign: "+",
	},
	used: {
		color: "text-muted-foreground",
		icon: <ArrowUpRight className="h-4 w-4 text-muted-foreground" />,
		sign: "−",
	},
};

// ─── Top Up Modal ─────────────────────────────────────────────────────────────

function TopUpDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
}) {
	const [step, setStep] = useState<"form" | "confirm" | "success">("form");
	const [amount, setAmount] = useState("100000");
	const [customAmount, setCustomAmount] = useState("");
	const [method, setMethod] = useState("gopay");

	const finalAmount =
		amount === "custom"
			? Number.parseInt(customAmount.replace(/\D/g, "") || "0")
			: Number.parseInt(amount);

	const selectedMethod = paymentMethods.find((m) => m.value === method);

	function handleClose(v: boolean) {
		if (!v) {
			setStep("form");
			setAmount("100000");
			setCustomAmount("");
			setMethod("gopay");
		}
		onOpenChange(v);
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				{/* ── Step: Form ── */}
				{step === "form" && (
					<>
						<DialogHeader>
							<DialogTitle>Top Up Poin</DialogTitle>
							<DialogDescription>
								Pilih nominal dan metode pembayaran.
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-5 py-1">
							{/* Nominal */}
							<div className="space-y-2">
								<Label>Nominal</Label>
								<div className="grid grid-cols-2 gap-2">
									{topupPackages.map((pkg) => (
										<button
											key={pkg.value}
											onClick={() => setAmount(pkg.value)}
											className={`rounded-lg border px-4 py-2.5 text-left font-medium text-sm transition-colors ${
												amount === pkg.value
													? "border-primary bg-primary/5 text-primary"
													: "hover:border-muted-foreground/40 hover:bg-muted/50"
											}`}
										>
											{pkg.label}
										</button>
									))}
									<button
										onClick={() => setAmount("custom")}
										className={`col-span-2 rounded-lg border px-4 py-2.5 text-left font-medium text-sm transition-colors ${
											amount === "custom"
												? "border-primary bg-primary/5 text-primary"
												: "hover:border-muted-foreground/40 hover:bg-muted/50"
										}`}
									>
										Nominal lain...
									</button>
								</div>

								{amount === "custom" && (
									<div className="relative mt-1">
										<span className="absolute top-2.5 left-3 text-muted-foreground text-sm">
											Rp
										</span>
										<Input
											className="pl-8"
											placeholder="0"
											value={customAmount}
											onChange={(e) => {
												const raw = e.target.value.replace(/\D/g, "");
												setCustomAmount(
													raw
														? Number.parseInt(raw).toLocaleString("id-ID")
														: "",
												);
											}}
										/>
									</div>
								)}
							</div>

							{/* Metode */}
							<div className="space-y-2">
								<Label htmlFor="method">Metode Pembayaran</Label>
								<Select value={method} onValueChange={setMethod}>
									<SelectTrigger id="method">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{paymentMethods.map((m) => (
											<SelectItem key={m.value} value={m.value}>
												<div className="flex items-center gap-2">
													{m.icon}
													{m.label}
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<DialogFooter>
							<Button variant="outline" onClick={() => handleClose(false)}>
								Batal
							</Button>
							<Button
								disabled={amount === "custom" && finalAmount < 10000}
								onClick={() => setStep("confirm")}
							>
								Lanjutkan
							</Button>
						</DialogFooter>
					</>
				)}

				{/* ── Step: Confirm ── */}
				{step === "confirm" && (
					<>
						<DialogHeader>
							<DialogTitle>Konfirmasi Top Up</DialogTitle>
							<DialogDescription>
								Pastikan detail berikut sudah benar.
							</DialogDescription>
						</DialogHeader>

						<div className="my-1 space-y-3 rounded-xl border bg-muted/30 p-4">
							{[
								{ label: "Nominal", value: formatIDR(finalAmount) },
								{ label: "Metode", value: selectedMethod?.label ?? "-" },
								{
									label: "Poin setelah top up",
									value: formatIDR(balance + finalAmount),
								},
							].map((row) => (
								<div
									key={row.label}
									className="flex items-center justify-between"
								>
									<span className="text-muted-foreground text-sm">
										{row.label}
									</span>
									<span className="font-semibold text-sm">{row.value}</span>
								</div>
							))}
						</div>

						<DialogFooter>
							<Button variant="outline" onClick={() => setStep("form")}>
								Kembali
							</Button>
							<Button onClick={() => setStep("success")}>
								Konfirmasi Pembayaran
							</Button>
						</DialogFooter>
					</>
				)}

				{/* ── Step: Success ── */}
				{step === "success" && (
					<>
						<DialogHeader>
							<DialogTitle>Top Up Berhasil 🎉</DialogTitle>
							<DialogDescription>
								Poin kamu telah berhasil ditambahkan.
							</DialogDescription>
						</DialogHeader>

						<div className="flex flex-col items-center gap-3 py-4">
							<div className="rounded-full bg-emerald-100 p-4">
								<CheckCircle2 className="h-8 w-8 text-emerald-600" />
							</div>
							<p className="font-bold text-3xl">{formatIDR(finalAmount)}</p>
							<p className="text-muted-foreground text-sm">
								via {selectedMethod?.label}
							</p>
						</div>

						<DialogFooter>
							<Button className="w-full" onClick={() => handleClose(false)}>
								Selesai
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PointPage() {
	const [topUpOpen, setTopUpOpen] = useState(false);

	const totalIn = history
		.filter((t) => t.amount > 0)
		.reduce((s, t) => s + t.amount, 0);
	const totalOut = history
		.filter((t) => t.amount < 0)
		.reduce((s, t) => s + Math.abs(t.amount), 0);

	return (
		<>
			<AccountHeader page="Poin Saya" />

			<div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 pt-4 md:p-6">
				{/* Balance card */}
				<Card className="relative overflow-hidden">
					<div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent" />
					<CardContent className="p-6">
						<div className="flex flex-wrap items-start justify-between gap-4">
							<div className="space-y-1">
								<div className="flex items-center gap-2 text-muted-foreground">
									<Star className="h-4 w-4" />
									<span className="font-medium text-sm">Poin Tersedia</span>
								</div>
								<p className="font-bold text-4xl tracking-tight">
									{formatIDR(balance)}
								</p>
								<p className="text-muted-foreground text-xs">
									Diperbarui hari ini
								</p>
							</div>
							<Button
								onClick={() => setTopUpOpen(true)}
								className="shrink-0 gap-2"
							>
								<Plus className="h-4 w-4" />
								Top Up
							</Button>
						</div>

						<Sep className="my-4" />

						{/* Stats */}
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="mb-0.5 text-muted-foreground text-xs">
									Total Masuk
								</p>
								<p className="font-semibold text-base text-emerald-600">
									+{formatIDR(totalIn)}
								</p>
							</div>
							<div>
								<p className="mb-0.5 text-muted-foreground text-xs">
									Total Keluar
								</p>
								<p className="font-semibold text-base text-muted-foreground">
									−{formatIDR(totalOut)}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Quick top up chips */}
				<div className="flex flex-wrap items-center gap-2">
					<p className="mr-1 text-muted-foreground text-sm">Top up cepat:</p>
					{topupPackages.map((pkg) => (
						<button
							key={pkg.value}
							onClick={() => setTopUpOpen(true)}
							className="rounded-full border px-3 py-1 font-medium text-xs transition-colors hover:bg-muted/60"
						>
							{pkg.label}
						</button>
					))}
				</div>

				{/* History */}
				<Card className="overflow-hidden">
					<CardHeader className="px-4 pt-4 pb-0">
						<CardTitle className="text-base">Riwayat Transaksi</CardTitle>
						<CardDescription className="mt-0.5">
							Semua aktivitas transaksi Poin kamu.
						</CardDescription>
					</CardHeader>
					<CardContent className="mt-3 p-0">
						<div className="divide-y">
							{history.map((tx) => {
								const cfg = txConfig[tx.type];
								const isIn = tx.amount > 0;
								return (
									<div
										key={tx.id}
										className="flex items-center gap-3 px-4 py-3.5"
									>
										{/* Icon */}
										<div className="shrink-0 rounded-lg bg-muted p-2.5">
											{tx.type === "used" ? (
												<Zap className="h-4 w-4 text-muted-foreground" />
											) : (
												<Star className="h-4 w-4 text-muted-foreground" />
											)}
										</div>

										{/* Info */}
										<div className="min-w-0 flex-1">
											<div className="flex items-center justify-between gap-2">
												<p className="truncate font-medium text-sm">
													{tx.label}
												</p>
												<span
													className={`shrink-0 font-semibold text-sm ${cfg.color}`}
												>
													{cfg.sign}
													{formatIDR(tx.amount)}
												</span>
											</div>
											<div className="mt-0.5 flex items-center justify-between gap-2">
												<p className="text-muted-foreground text-xs">
													{tx.date}
												</p>
												<Badge
													variant="outline"
													className={`gap-1 text-[11px] ${
														tx.type === "topup"
															? "border-emerald-300 bg-emerald-50 text-emerald-600"
															: tx.type === "refund"
																? "border-blue-300 bg-blue-50 text-blue-600"
																: "text-muted-foreground"
													}`}
												>
													{cfg.icon}
													{tx.type === "topup"
														? "Top Up"
														: tx.type === "refund"
															? "Refund"
															: "Terpakai"}
												</Badge>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Modal Top Up */}
			<TopUpDialog open={topUpOpen} onOpenChange={setTopUpOpen} />
		</>
	);
}
