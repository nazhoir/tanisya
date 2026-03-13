"use client";

import * as React from "react";
import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@tanisya/ui/components/breadcrumb";
import { Button } from "@tanisya/ui/components/button";
import { Separator } from "@tanisya/ui/components/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@tanisya/ui/components/sidebar";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@tanisya/ui/components/field";
import { Input } from "@tanisya/ui/components/input";
import { orpc } from "@/utils/orpc";
import { cn } from "@tanisya/ui/lib/utils";

// ─── SearchParams Reader ───────────────────────────────────────────────────────

function SearchParamsReader({ onDomain }: { onDomain: (d: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const d = searchParams.get("domain");
    if (d) onDomain(d);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  return null;
}

// ─── Steps indicator ──────────────────────────────────────────────────────────

const STEPS = ["Verifikasi Domain", "Auth Code", "Konfirmasi"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
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
                  "text-[10px] font-semibold whitespace-nowrap",
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
      <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-300">{children}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DomainTransferPage() {
  const router = useRouter();

  const [domain, setDomain]       = React.useState("");
  const [authCode, setAuthCode]   = React.useState("");
  const [showAuth, setShowAuth]   = React.useState(false);
  const [step, setStep]           = React.useState(0);
  const [domainError, setDomainError]   = React.useState("");
  const [authError, setAuthError]       = React.useState("");

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
        setDomainError(err.message ?? "Domain tidak dapat ditransfer. Pastikan domain valid dan tidak dalam status lock.");
      },
    }),
  );

  // ── Mutation: submitTransfer ──────────────────────────────────────────────
  const submitMutation = useMutation(
    orpc.domain.submitTransfer.mutationOptions({
      onSuccess: () => {
        setAuthError("");
        setStep(2);
      },
      onError: (err: Error) => {
        setAuthError(err.message ?? "Auth Code tidak valid. Silakan periksa kembali kode dari registrar sebelumnya.");
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
    verifyMutation.mutate({ domain: trimmed });
  };

  const handleSubmitTransfer = () => {
    const code = authCode.trim();
    if (!code) {
      setAuthError("Auth Code / EPP Code tidak boleh kosong.");
      return;
    }
    setAuthError("");
    submitMutation.mutate({ domain: domain.trim().toLowerCase(), authCode: code });
  };

  const isVerifying  = verifyMutation.isPending;
  const isSubmitting = submitMutation.isPending;

  // ── Derived ───────────────────────────────────────────────────────────────
  const tldPart  = domain.includes(".") ? domain.substring(domain.indexOf(".")) : "";
  const namePart = domain.includes(".") ? domain.substring(0, domain.indexOf(".")) : domain;

  return (
    <SidebarProvider>
      <Suspense fallback={null}>
        <SearchParamsReader onDomain={handleDomainFromUrl} />
      </Suspense>
      <AppSidebar />
      <SidebarInset>

        {/* ── Header ────────────────────────────────────────────────────── */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ms-1" />
            <Separator
              orientation="vertical"
              className="me-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard/domain">Domain</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Transfer</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* ── Content ───────────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col gap-8 p-4 pt-0 sm:p-6 sm:pt-0">

          {/* Back + heading */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="mb-3 -ms-2 gap-1.5 text-muted-foreground"
              asChild
            >
              <Link href="/dashboard/domain">
                <ChevronLeft className="h-4 w-4" />
                Kembali
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/40">
                <ArrowLeftRight className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                  Transfer Domain
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
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
                Pastikan domain yang ingin ditransfer sudah <strong>tidak terkunci (unlocked)</strong> di registrar sebelumnya dan sudah berumur minimal <strong>60 hari</strong> sejak registrasi atau transfer terakhir.
              </InfoBox>

              <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-semibold">Informasi Domain</p>
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
                          onKeyDown={(e) => e.key === "Enter" && !isVerifying && handleVerifyDomain()}
                          className={cn(
                            "pr-24 font-mono text-sm",
                            domainError && "border-destructive focus-visible:ring-destructive/30",
                          )}
                        />
                        {domain && (
                          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {namePart && (
                              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                {namePart}
                              </span>
                            )}
                            {tldPart && (
                              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                {tldPart}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {domainError ? (
                        <p className="mt-1.5 text-xs text-destructive">{domainError}</p>
                      ) : (
                        <FieldDescription>
                          Masukkan nama domain lengkap beserta ekstensinya. Contoh: tokobaju.co.id
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
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    Domain terverifikasi
                  </p>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200 truncate">
                    {domain}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setStep(0); setAuthCode(""); setAuthError(""); }}
                  className="text-xs text-emerald-600 underline underline-offset-2 hover:text-emerald-700 dark:text-emerald-400 shrink-0"
                >
                  Ubah
                </button>
              </div>

              <InfoBox>
                Auth Code (EPP Code) bisa ditemukan di panel kontrol registrar sebelumnya, biasanya di menu <strong>Domain Lock</strong> atau <strong>Auth Info</strong>. Jika tidak tersedia, hubungi support registrar untuk mendapatkan kode ini.
              </InfoBox>

              <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-semibold">Autentikasi Transfer</p>
                </div>

                <FieldSet>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="auth-code">Auth Code / EPP Code</FieldLabel>
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
                          onKeyDown={(e) => e.key === "Enter" && !isSubmitting && handleSubmitTransfer()}
                          className={cn(
                            "pr-10 font-mono text-sm tracking-widest",
                            authError && "border-destructive focus-visible:ring-destructive/30",
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowAuth((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                          aria-label={showAuth ? "Sembunyikan kode" : "Tampilkan kode"}
                        >
                          {showAuth ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {authError ? (
                        <p className="mt-1.5 text-xs text-destructive">{authError}</p>
                      ) : (
                        <FieldDescription>
                          Kode ini bersifat rahasia. Jangan bagikan kepada siapapun selain registrar tujuan.
                        </FieldDescription>
                      )}
                    </Field>
                  </FieldGroup>
                </FieldSet>

                {/* Transfer summary */}
                <div className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Ringkasan Transfer
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Domain</span>
                    <span className="font-semibold font-mono">{domain}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Durasi perpanjang</span>
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
                    Harga final akan dikonfirmasi setelah validasi Auth Code berhasil.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setStep(0); setAuthCode(""); setAuthError(""); }}
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
              <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-8 text-center space-y-4 dark:border-emerald-800/30 dark:bg-emerald-950/20">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                  <ShieldCheck className="h-8 w-8 text-emerald-500" />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-emerald-800 dark:text-emerald-200">
                    Permintaan Transfer Dikirim!
                  </p>
                  <p className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-300/80">
                    Proses transfer untuk <strong className="font-mono">{domain}</strong> sedang dalam antrian.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
                <p className="text-sm font-semibold">Langkah Selanjutnya</p>
                <ol className="space-y-3">
                  {[
                    "Registrar sebelumnya akan mengirimkan email konfirmasi ke alamat email yang terdaftar di WHOIS domain.",
                    "Setujui permintaan transfer melalui email tersebut dalam waktu 5 hari.",
                    "Proses transfer biasanya selesai dalam 5–7 hari kerja.",
                    "Anda akan mendapat notifikasi email setelah transfer berhasil.",
                  ].map((text, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground leading-relaxed">{text}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/dashboard/domain">Ke Daftar Domain</Link>
                </Button>
                <Button className="flex-1 gap-2" asChild>
                  <Link href="/dashboard/domain/register">
                    Daftarkan Domain Baru
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          )}

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}