// app/promo/page.tsx
"use client";

import {
  ArrowRight,
  BadgePercent,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  Gift,
  Layers,
  Rocket,
  Sparkles,
  Tag,
  Zap,
} from "lucide-react";
import { useState } from "react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@tanisya/ui/components/tooltip";

// ─── Types ────────────────────────────────────────────────────────────────────
type StatusFilter = "all" | "active" | "inactive";
type CategoryFilter = "all" | "deploy" | "bundle" | "referral";

interface PromoItem {
  id: string;
  category: Exclude<CategoryFilter, "all">;
  title: string;
  description: string;
  discount: string;
  originalPrice?: string;
  finalPrice?: string;
  code?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary";
  highlight?: boolean;
  expiresAt?: string;
  terms: string[];
  icon: React.ElementType;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const TODAY = new Date();

const PROMOS: PromoItem[] = [
  {
    id: "launch-deal",
    category: "deploy",
    title: "Launch Deal — Deploy Pertama Gratis",
    description:
      "Deploy satu app instan pilihan Anda tanpa biaya apapun. Cocok untuk mencoba platform kami sebelum berlangganan.",
    discount: "100%",
    originalPrice: "Rp 49.000",
    finalPrice: "Rp 0",
    code: "FIRSTDEPLOY",
    badge: "Terbaik",
    badgeVariant: "default",
    highlight: true,
    expiresAt: "2025-09-30",
    terms: [
      "Satu kali per akun baru",
      "Berlaku semua template app",
      "Masa aktif deploy 14 hari",
      "Tidak dapat digabung promo lain",
    ],
    icon: Rocket,
  },
  {
    id: "annual-save",
    category: "deploy",
    title: "Hemat 40% Langganan Tahunan",
    description:
      "Bayar satu tahun penuh dan nikmati semua fitur deploy unlimited dengan harga jauh lebih hemat.",
    discount: "40%",
    code: "ANNUAL40",
    badge: "Populer",
    badgeVariant: "secondary",
    terms: [
      "Berlaku semua paket",
      "Tagihan dibayar di muka",
      "Renewal harga sama",
      "Bisa digabung kode referral",
    ],
    icon: CalendarDays,
  },
  {
    id: "bundle-3app",
    category: "bundle",
    title: "Bundle 3 App — Bayar 2",
    description:
      "Deploy tiga app sekaligus dan hanya bayar dua. Ideal untuk tim yang ingin meluncurkan stack lengkap.",
    discount: "Gratis 1 App",
    originalPrice: "Rp 147.000",
    finalPrice: "Rp 98.000",
    code: "BUNDLE3",
    badge: "Terbaik",
    badgeVariant: "default",
    expiresAt: "2025-08-15",
    terms: [
      "Minimal deploy 3 app berbeda",
      "App termurah digratiskan",
      "Berlaku sekali per akun",
      "Masa aktif masing-masing 30 hari",
    ],
    icon: Layers,
  },
  {
    id: "flash-sale",
    category: "deploy",
    title: "Flash Sale — 70% Off Semua Template",
    description:
      "Penawaran kilat terbatas! Semua template app premium diskon 70% hanya untuk 200 pembeli pertama.",
    discount: "70%",
    originalPrice: "Rp 99.000",
    finalPrice: "Rp 29.700",
    code: "FLASH70",
    badge: "Terbatas",
    badgeVariant: "secondary",
    highlight: true,
    expiresAt: "2025-06-20",
    terms: [
      "Hanya 200 slot tersedia",
      "Berlaku semua template premium",
      "Tidak berlaku untuk paket langganan",
      "Satu kode per transaksi",
    ],
    icon: Zap,
  },
  {
    id: "referral",
    category: "referral",
    title: "Referral — Dapat Kredit Rp 75.000",
    description:
      "Ajak developer lain bergabung. Dapatkan Rp 75.000 kredit setiap teman yang berhasil deploy app pertamanya.",
    discount: "Rp 75.000",
    badge: "Berlaku Terus",
    badgeVariant: "secondary",
    terms: [
      "Tidak ada batas jumlah referral",
      "Kredit masuk setelah teman deploy",
      "Kredit bisa dipakai kapan saja",
      "Teman juga dapat diskon 15%",
    ],
    icon: Sparkles,
  },
  {
    id: "student",
    category: "deploy",
    title: "Diskon Pelajar & Mahasiswa 50%",
    description:
      "Tunjukkan kartu pelajar atau email institusi akademik Anda dan nikmati diskon 50% seumur hidup akun.",
    discount: "50%",
    code: "EDU50",
    badge: "Berlaku Terus",
    badgeVariant: "secondary",
    terms: [
      "Wajib verifikasi email .ac.id",
      "Berlaku selama status aktif pelajar",
      "Satu akun per NIM/NIS",
      "Tidak berlaku untuk paket Enterprise",
    ],
    icon: Gift,
  },
  {
    id: "early-bird-2024",
    category: "deploy",
    title: "Early Bird 2024 — Sudah Berakhir",
    description:
      "Promo khusus peluncuran platform kami di awal tahun. Terima kasih kepada semua early adopters!",
    discount: "60%",
    badge: "Berakhir",
    badgeVariant: "secondary",
    expiresAt: "2024-12-31",
    terms: [
      "Promo sudah tidak berlaku",
      "Pelanggan lama tetap menikmati harga terkunci",
    ],
    icon: Tag,
  },
  {
    id: "xmas-bundle",
    category: "bundle",
    title: "Holiday Bundle — Desember 2024",
    description:
      "Paket spesial akhir tahun dengan bonus domain .app gratis dan setup fee dihapuskan.",
    discount: "Bonus Domain",
    badge: "Berakhir",
    badgeVariant: "secondary",
    expiresAt: "2024-12-25",
    terms: [
      "Promo sudah tidak berlaku",
      "Domain bonus tetap aktif hingga masa langganan habis",
    ],
    icon: Gift,
  },
];

const CATEGORIES: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "deploy", label: "Deploy" },
  { value: "bundle", label: "Bundle" },
  { value: "referral", label: "Referral" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isActive(promo: PromoItem): boolean {
  if (!promo.expiresAt) return true;
  return new Date(promo.expiresAt) >= TODAY;
}

function daysRemaining(dateStr: string): number {
  return Math.ceil(
    (new Date(dateStr).getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24)
  );
}

// ─── Expiry Label ─────────────────────────────────────────────────────────────
function ExpiryLabel({ promo }: { promo: PromoItem }) {
  if (!promo.expiresAt) {
    return (
      <span className="flex items-center gap-1 text-muted-foreground text-xs">
        <Sparkles className="h-3 w-3" />
        Berlaku terus
      </span>
    );
  }
  const days = daysRemaining(promo.expiresAt);
  if (days <= 0) {
    return (
      <span className="flex items-center gap-1 text-muted-foreground text-xs">
        <Clock className="h-3 w-3" />
        Promo berakhir
      </span>
    );
  }
  if (days <= 7) {
    return (
      <span className="flex items-center gap-1 font-medium text-destructive text-xs">
        <Clock className="h-3 w-3" />
        Berakhir {days} hari lagi
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-muted-foreground text-xs">
      <CalendarDays className="h-3 w-3" />
      s/d{" "}
      {new Date(promo.expiresAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}
    </span>
  );
}

// ─── Promo Card ───────────────────────────────────────────────────────────────
function PromoCard({ promo }: { promo: PromoItem }) {
  const [copied, setCopied] = useState(false);
  const active = isActive(promo);

  function handleCopy() {
    if (!promo.code || !active) return;
    navigator.clipboard.writeText(promo.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card
      className={`relative flex flex-col overflow-visible transition-shadow ${
        !active
          ? "opacity-60"
          : promo.highlight
            ? "border-primary shadow-md ring-1 ring-primary hover:shadow-lg"
            : "border-border hover:shadow-lg"
      }`}
    >
      {promo.badge && (
        <div className="absolute -top-3 left-4 z-10">
          <Badge
            variant={promo.badgeVariant ?? "secondary"}
            className="px-3 py-0.5 text-xs shadow-sm"
          >
            {promo.badge}
          </Badge>
        </div>
      )}

      <CardHeader className="px-5 pt-6 pb-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              active ? "bg-primary/10" : "bg-muted"
            }`}
          >
            <promo.icon
              className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`}
            />
          </div>
          <span
            className={`font-extrabold text-2xl tracking-tight ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {promo.discount}
          </span>
        </div>

        <h3 className="font-bold text-base leading-snug">{promo.title}</h3>
        <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
          {promo.description}
        </p>

        {(promo.originalPrice || promo.finalPrice) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {promo.originalPrice && (
              <span className="text-muted-foreground text-sm line-through">
                {promo.originalPrice}
              </span>
            )}
            {promo.finalPrice && (
              <span className="font-bold text-base text-green-600">
                {promo.finalPrice}
              </span>
            )}
          </div>
        )}
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 px-5 py-4">
        {promo.code && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleCopy}
                  disabled={!active}
                  className={`mb-4 flex w-full items-center justify-between rounded-md border border-dashed px-3 py-2 transition-colors ${
                    active
                      ? "border-primary/50 bg-primary/5 hover:bg-primary/10 cursor-pointer"
                      : "border-border bg-muted/30 cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`font-mono font-semibold text-sm tracking-widest ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {promo.code}
                  </span>
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy
                      className={`h-4 w-4 ${active ? "text-primary/60" : "text-muted-foreground/40"}`}
                    />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {!active
                  ? "Promo sudah tidak aktif"
                  : copied
                    ? "Tersalin!"
                    : "Klik untuk salin kode"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <ul className="space-y-1.5">
          {promo.terms.map((t) => (
            <li key={t} className="flex items-start gap-2 text-xs">
              <CheckCircle2
                className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                  active ? "text-green-600" : "text-muted-foreground/40"
                }`}
              />
              <span className="text-muted-foreground">{t}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <Separator />

      <CardFooter className="flex-col items-stretch gap-3 px-5 pb-5 pt-4">
        <Button
          size="lg"
          variant={promo.highlight && active ? "default" : "outline"}
          disabled={!active}
          className="w-full gap-2 text-sm font-semibold"
        >
          {active ? "Klaim Promo" : "Promo Tidak Aktif"}
          {active && <ArrowRight className="h-4 w-4" />}
        </Button>
        <div className="flex justify-center">
          <ExpiryLabel promo={promo} />
        </div>
      </CardFooter>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PromoPage() {
  const [status, setStatus] = useState<StatusFilter>("active");
  const [category, setCategory] = useState<CategoryFilter>("all");

  const activeCount = PROMOS.filter(isActive).length;
  const inactiveCount = PROMOS.filter((p) => !isActive(p)).length;

  const filtered = PROMOS.filter((p) => {
    const matchStatus =
      status === "all" ? true : status === "active" ? isActive(p) : !isActive(p);
    const matchCat = category === "all" ? true : p.category === category;
    return matchStatus && matchCat;
  });

  return (
    <div className="bg-background">
      {/* ── Hero ── */}
      <section className="border-b bg-linear-to-b from-primary/10 to-background">
        <div className="mx-auto max-w-5xl px-4 text-center pb-16 pt-32">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-xs">
            <BadgePercent className="h-3.5 w-3.5" />
            Promo &amp; Penawaran Spesial
          </div>
          <h1 className="mb-3 font-extrabold text-3xl tracking-tight md:text-4xl lg:text-5xl">
            Lebih Hemat
            <br /> dengan Kode Promo
          </h1>
          <p className="mx-auto max-w-xl text-base text-muted-foreground md:text-lg">
            Kumpulan promo eksklusif bagi
            pengguna baru maupun <br /> pelanggan setia.
          </p>

        
        </div>
      </section>

      {/* ── Filters ── */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between">
          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Status Promo
            </p>
            <Tabs value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
              <TabsList className="h-9">
                <TabsTrigger value="all" className="px-4 text-sm">
                  Semua
                  <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 py-0 text-[10px]">
                    {PROMOS.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="active" className="px-4 text-sm">
                  Aktif
                  <Badge variant="default" className="ml-1.5 h-4 px-1.5 py-0 text-[10px]">
                    {activeCount}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="inactive" className="px-4 text-sm">
                  Berakhir
                  <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 py-0 text-[10px]">
                    {inactiveCount}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Kategori
            </p>
            <Tabs value={category} onValueChange={(v) => setCategory(v as CategoryFilter)}>
              <TabsList className="h-9">
                {CATEGORIES.map((c) => (
                  <TabsTrigger key={c.value} value={c.value} className="px-4 text-sm">
                    {c.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        <p className="mt-4 text-muted-foreground text-xs">
          Menampilkan{" "}
          <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          promo
        </p>
      </section>

      <Separator />

      {/* ── Cards ── */}
      <section className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((promo) => (
              <PromoCard key={promo.id} promo={promo} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed py-20 text-center">
            <BadgePercent className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="font-medium text-sm">Tidak ada promo ditemukan</p>
            <p className="mt-1 text-muted-foreground text-xs">
              Coba ubah filter di atas.
            </p>
          </div>
        )}

        <p className="mt-8 text-center text-muted-foreground text-xs">
          Semua harga belum termasuk PPN 11%. Syarat &amp; ketentuan berlaku
          untuk setiap promo. Promo dapat berakhir sewaktu-waktu.
        </p>
      </section>

      <Separator />

      {/* ── CTA ── */}
      <section className="border-t bg-primary/5">
        <div className="mx-auto max-w-5xl px-4 py-10 text-center md:py-12">
          <h2 className="mb-2 font-bold text-xl md:text-2xl">
            Ada Kode Promo dari Kami?
          </h2>
          <p className="mx-auto mb-6 max-w-md text-muted-foreground text-sm">
            Masukkan kode saat checkout dan diskon diterapkan otomatis. Belum
            dapat kode? Daftar newsletter kami.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto gap-2">
              <Rocket className="h-4 w-4" />
              Deploy App Sekarang
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Daftar Newsletter
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}