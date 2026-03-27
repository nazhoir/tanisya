"use client";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@tanisya/ui/components/breadcrumb";
import { Button } from "@tanisya/ui/components/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from "@tanisya/ui/components/field";
import { Input } from "@tanisya/ui/components/input";
import { Separator } from "@tanisya/ui/components/separator";
import { SidebarTrigger } from "@tanisya/ui/components/sidebar";
import { cn } from "@tanisya/ui/lib/utils";
import { useMutation } from "@tanstack/react-query";
import {
	ArrowLeftRight,
	ArrowRight,
	ChevronLeft,
	Eye,
	EyeOff,
	Globe,
	Info,
	Loader2,
	Lock,
	ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense, useEffect } from "react";
import { orpc } from "@/utils/orpc";

// ─── SearchParams Reader ───────────────────────────────────────────────────────

function SearchParamsReader({ onDomain }: { onDomain: (d: string) => void }) {
	const searchParams = useSearchParams();
	useEffect(() => {
		const d = searchParams.get("domain");
		if (d) onDomain(d);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams, onDomain]);
	return null;
}

// ─── Steps indicator ──────────────────────────────────────────────────────────

const STEPS = ["Verifikasi Domain", "Auth Code", "Konfirmasi"];

function StepIndicator({ current }: { current: number }) {
	return (
		<div className="flex items-center gap-0">
			{STEPS.map((label, i) => {
				const done = i < current;
				const active = i === current;
				return (
					<React.Fragment key={label}>
						<div className="flex flex-col items-center gap-1.5">
							<div
								className={cn(
									"flex h-8 w-8 items-center justify-center rounded-full border-2 font-bold text-xs transition-all",
									done
										? "border-primary bg-primary text-primary-foreground"
										: active
											? "border-primary bg-primary/10 text-primary"
											: "border-border bg-muted/30 text-muted-foreground",
								)}
							>
								{done ? <ShieldCheck className="h-4 w-4" /> : i + 1}
							</div>
							<span
								className={cn(
									"whitespace-nowrap font-semibold text-[10px]",
									active ? "text-foreground" : "text-muted-foreground",
								)}
							>
								{label}
							</span>
						</div>
						{i < STEPS.length - 1 && (
							<div
								className={cn(
									"mb-5 h-px w-12 flex-shrink-0 transition-all sm:w-20",
									done ? "bg-primary" : "bg-border",
								)}
							/>
						)}
					</React.Fragment>
				);
			})}
		</div>
	);
}

// ─── Info box ────────────────────────────────────────────────────────────────

function InfoBox({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800/40 dark:bg-blue-950/30">
			<Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
			<p className="text-blue-700 text-xs leading-relaxed dark:text-blue-300">
				{children}
			</p>
		</div>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DomainTransferForm() {
	const [domain, setDomain] = React.useState("");
	const [authCode, setAuthCode] = React.useState("");
	const [showAuth, setShowAuth] = React.useState(false);
	const [step, setStep] = React.useState(0);
	const [domainError, setDomainError] = React.useState("");
	const [authError, setAuthError] = React.useState("");

	// ── Read from URL param ───────────────────────────────────────────────────
	const handleDomainFromUrl = React.useCallback((d: string) => {
		setDomain(d);
	}, []);

	// ── Mutation: verifyTransferDomain ────────────────────────────────────────
	const verifyMutation = useMutation(
		orpc.domain.verifyTransfer.mutationOptions({
			onSuccess: () => {
				setDomainError("");
				setStep(1);
			},
			onError: (err: Error) => {
				setDomainError(
					err.message ??
						"Domain tidak dapat ditransfer. Pastikan domain valid dan tidak dalam status lock.",
				);
			},
		}),
	);

	// ── Mutation: submitTransfer ──────────────────────────────────────────────
	const submitMutation = useMutation(
		// TODO
		orpc.domain.submitTransfer.mutationOptions({
			onSuccess: () => {
				setAuthError("");
				setStep(2);
			},
			onError: (err: Error) => {
				setAuthError(
					err.message ??
						"Auth Code tidak valid. Silakan periksa kembali kode dari registrar sebelumnya.",
				);
			},
		}),
	);

	// ── Handlers ──────────────────────────────────────────────────────────────

	const handleVerifyDomain = () => {
		const trimmed = domain.trim().toLowerCase();
		if (!trimmed) {
			setDomainError("Nama domain tidak boleh kosong.");
			return;
		}
		// Basic format check
		if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/.test(trimmed)) {
			setDomainError("Format domain tidak valid. Contoh: namadomain.com");
			return;
		}
		setDomainError("");
		// verifyMutation.mutate({ domain: trimmed });
	};

	const handleSubmitTransfer = () => {
		const code = authCode.trim();
		if (!code) {
			setAuthError("Auth Code / EPP Code tidak boleh kosong.");
			return;
		}
		setAuthError("");
		// submitMutation.mutate({
		// 	domain: domain.trim().toLowerCase(),
		// 	authCode: code,
		// });
	};

	const isVerifying = verifyMutation.isPending;
	const isSubmitting = submitMutation.isPending;

	// ── Derived ───────────────────────────────────────────────────────────────
	const tldPart = domain.includes(".")
		? domain.substring(domain.indexOf("."))
		: "";
	const namePart = domain.includes(".")
		? domain.substring(0, domain.indexOf("."))
		: domain;

	return (
		<>
			<Suspense fallback={null}>
				<SearchParamsReader onDomain={handleDomainFromUrl} />
			</Suspense>

			{/* ── Content ───────────────────────────────────────────────────── */}
			<div className="flex flex-1 flex-col gap-8 p-4 sm:p-6">
				{/* Back + heading */}
				<div>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/40">
							<ArrowLeftRight className="h-5 w-5 text-amber-600 dark:text-amber-400" />
						</div>
						<div>
							<h1 className="font-extrabold text-xl tracking-tight sm:text-2xl">
								Transfer Domain
							</h1>
							<p className="mt-0.5 text-muted-foreground text-sm">
								Pindahkan domain dari registrar lain ke layanan kami.
							</p>
						</div>
					</div>
				</div>

				{/* Step indicator */}
				<StepIndicator current={step} />

				{/* ── Step 0: Verifikasi Domain ──────────────────────────────── */}
				{step === 0 && (
					<div className="space-y-6">
						<InfoBox>
							Pastikan domain yang ingin ditransfer sudah{" "}
							<strong>tidak terkunci (unlocked)</strong> di registrar sebelumnya
							dan sudah berumur minimal <strong>60 hari</strong> sejak
							registrasi atau transfer terakhir.
						</InfoBox>

						<div className="space-y-6 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
							<div className="flex items-center gap-2 border-border/40 border-b pb-4">
								<Globe className="h-4 w-4 text-muted-foreground" />
								<p className="font-semibold text-sm">Informasi Domain</p>
							</div>

							<FieldSet>
								<FieldGroup>
									<Field>
										<FieldLabel htmlFor="domain-input">Nama Domain</FieldLabel>
										<div className="relative">
											<Input
												id="domain-input"
												type="text"
												placeholder="contoh: namadomain.com"
												value={domain}
												onChange={(e) => {
													setDomain(e.target.value);
													setDomainError("");
												}}
												onKeyDown={(e) =>
													e.key === "Enter" &&
													!isVerifying &&
													handleVerifyDomain()
												}
												className={cn(
													"pr-24 font-mono text-sm",
													domainError &&
														"border-destructive focus-visible:ring-destructive/30",
												)}
											/>
											{domain && (
												<div className="pointer-events-none absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1">
													{namePart && (
														<span className="rounded bg-muted px-1.5 py-0.5 font-semibold text-[10px] text-muted-foreground">
															{namePart}
														</span>
													)}
													{tldPart && (
														<span className="rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-[10px] text-primary">
															{tldPart}
														</span>
													)}
												</div>
											)}
										</div>
										{domainError ? (
											<p className="mt-1.5 text-destructive text-xs">
												{domainError}
											</p>
										) : (
											<FieldDescription>
												Masukkan nama domain lengkap beserta ekstensinya.
												Contoh: tokobaju.co.id
											</FieldDescription>
										)}
									</Field>
								</FieldGroup>
							</FieldSet>

							<Button
								className="w-full gap-2 font-semibold"
								disabled={!domain.trim() || isVerifying}
								onClick={handleVerifyDomain}
							>
								{isVerifying ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Memverifikasi...
									</>
								) : (
									<>
										Lanjut
										<ArrowRight className="h-4 w-4" />
									</>
								)}
							</Button>
						</div>
					</div>
				)}

				{/* ── Step 1: Auth Code ──────────────────────────────────────── */}
				{step === 1 && (
					<div className="space-y-6">
						{/* Domain confirmed pill */}
						<div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800/40 dark:bg-emerald-950/30">
							<ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
							<div className="min-w-0 flex-1">
								<p className="font-semibold text-emerald-700 text-xs dark:text-emerald-300">
									Domain terverifikasi
								</p>
								<p className="truncate font-bold text-emerald-800 text-sm dark:text-emerald-200">
									{domain}
								</p>
							</div>
							<button
								type="button"
								onClick={() => {
									setStep(0);
									setAuthCode("");
									setAuthError("");
								}}
								className="shrink-0 text-emerald-600 text-xs underline underline-offset-2 hover:text-emerald-700 dark:text-emerald-400"
							>
								Ubah
							</button>
						</div>

						<InfoBox>
							Auth Code (EPP Code) bisa ditemukan di panel kontrol registrar
							sebelumnya, biasanya di menu <strong>Domain Lock</strong> atau{" "}
							<strong>Auth Info</strong>. Jika tidak tersedia, hubungi support
							registrar untuk mendapatkan kode ini.
						</InfoBox>

						<div className="space-y-6 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
							<div className="flex items-center gap-2 border-border/40 border-b pb-4">
								<Lock className="h-4 w-4 text-muted-foreground" />
								<p className="font-semibold text-sm">Autentikasi Transfer</p>
							</div>

							<FieldSet>
								<FieldGroup>
									<Field>
										<FieldLabel htmlFor="auth-code">
											Auth Code / EPP Code
										</FieldLabel>
										<div className="relative">
											<Input
												id="auth-code"
												type={showAuth ? "text" : "password"}
												placeholder="Masukkan kode autentikasi"
												value={authCode}
												onChange={(e) => {
													setAuthCode(e.target.value);
													setAuthError("");
												}}
												onKeyDown={(e) =>
													e.key === "Enter" &&
													!isSubmitting &&
													handleSubmitTransfer()
												}
												className={cn(
													"pr-10 font-mono text-sm tracking-widest",
													authError &&
														"border-destructive focus-visible:ring-destructive/30",
												)}
											/>
											<button
												type="button"
												onClick={() => setShowAuth((v) => !v)}
												className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
												tabIndex={-1}
												aria-label={
													showAuth ? "Sembunyikan kode" : "Tampilkan kode"
												}
											>
												{showAuth ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</button>
										</div>
										{authError ? (
											<p className="mt-1.5 text-destructive text-xs">
												{authError}
											</p>
										) : (
											<FieldDescription>
												Kode ini bersifat rahasia. Jangan bagikan kepada
												siapapun selain registrar tujuan.
											</FieldDescription>
										)}
									</Field>
								</FieldGroup>
							</FieldSet>

							{/* Transfer summary */}
							<div className="space-y-2.5 rounded-xl border border-border/40 bg-muted/20 p-4">
								<p className="font-semibold text-muted-foreground text-xs uppercase tracking-widest">
									Ringkasan Transfer
								</p>
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">Domain</span>
									<span className="font-mono font-semibold">{domain}</span>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">
										Durasi perpanjang
									</span>
									<span className="font-semibold">+1 tahun</span>
								</div>
								<Separator className="my-1" />
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">Biaya transfer</span>
									<span className="font-extrabold text-base">
										{/* Price is resolved server-side; show placeholder until confirmed */}
										Rp —
									</span>
								</div>
								<p className="text-[11px] text-muted-foreground/70">
									Harga final akan dikonfirmasi setelah validasi Auth Code
									berhasil.
								</p>
							</div>

							<div className="flex gap-3">
								<Button
									variant="outline"
									className="flex-1"
									onClick={() => {
										setStep(0);
										setAuthCode("");
										setAuthError("");
									}}
									disabled={isSubmitting}
								>
									Kembali
								</Button>
								<Button
									className="flex-1 gap-2 font-semibold"
									disabled={!authCode.trim() || isSubmitting}
									onClick={handleSubmitTransfer}
								>
									{isSubmitting ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Memproses...
										</>
									) : (
										<>
											Mulai Transfer
											<ArrowRight className="h-4 w-4" />
										</>
									)}
								</Button>
							</div>
						</div>
					</div>
				)}

				{/* ── Step 2: Konfirmasi ─────────────────────────────────────── */}
				{step === 2 && (
					<div className="space-y-6">
						<div className="space-y-4 rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-8 text-center dark:border-emerald-800/30 dark:bg-emerald-950/20">
							<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
								<ShieldCheck className="h-8 w-8 text-emerald-500" />
							</div>
							<div>
								<p className="font-extrabold text-emerald-800 text-lg dark:text-emerald-200">
									Permintaan Transfer Dikirim!
								</p>
								<p className="mt-1 text-emerald-700/80 text-sm dark:text-emerald-300/80">
									Proses transfer untuk{" "}
									<strong className="font-mono">{domain}</strong> sedang dalam
									antrian.
								</p>
							</div>
						</div>

						<div className="space-y-4 rounded-2xl border border-border/60 bg-card p-6">
							<p className="font-semibold text-sm">Langkah Selanjutnya</p>
							<ol className="space-y-3">
								{[
									"Registrar sebelumnya akan mengirimkan email konfirmasi ke alamat email yang terdaftar di WHOIS domain.",
									"Setujui permintaan transfer melalui email tersebut dalam waktu 5 hari.",
									"Proses transfer biasanya selesai dalam 5–7 hari kerja.",
									"Anda akan mendapat notifikasi email setelah transfer berhasil.",
								].map((text, i) => (
									<li key={i} className="flex gap-3 text-sm">
										<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-[10px] text-primary">
											{i + 1}
										</span>
										<span className="text-muted-foreground leading-relaxed">
											{text}
										</span>
									</li>
								))}
							</ol>
						</div>

						{/* <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" asChild>
                                <Link href="/dashboard/domain">Ke Daftar Domain</Link>
                            </Button>
                            <Button className="flex-1 gap-2" asChild>
                                <Link href="/dashboard/domain/register">
                                    Daftarkan Domain Baru
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div> */}
					</div>
				)}
			</div>
		</>
	);
}
