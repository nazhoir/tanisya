// app/hosting/page.tsx
"use client";

import {
  CheckCircle2,
  Database,
  Globe,
  HardDrive,
  HeadphonesIcon,
  LayoutDashboard,
  Mail,
  RefreshCw,
  Server,
  ShieldCheck,
  Wifi,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";
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
import { formatIDR } from "@/lib/format-currency";

// ─── Types ────────────────────────────────────────────────────────────────────
type BillingCycle = "monthly" | "yearly";

interface HostingFeature {
  label: string;
  included: boolean;
  note?: string;
}

interface HostingPlan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  highlight?: boolean;
  badge?: string;
  storage: string;
  bandwidth: string;
  websites: string;
  email: string;
  databases: string;
  features: HostingFeature[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const PLANS: HostingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Cocok untuk website pertama Anda",
    monthlyPrice: 29000,
    yearlyPrice: 19000,
    storage: "5 GB SSD",
    bandwidth: "10 GB / bulan",
    websites: "1 website",
    email: "5 akun email",
    databases: "2 database",
    features: [
      { label: "SSL Gratis (Let's Encrypt)", included: true },
      { label: "cPanel Control Panel", included: true },
      { label: "Backup Mingguan", included: true },
      { label: "Subdomain Tak Terbatas", included: true },
      { label: "1-Click CMS Install", included: true },
      { label: "Backup Harian", included: false },
      { label: "Dedicated IP", included: false },
      { label: "Priority Support", included: false },
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "Untuk bisnis yang sedang berkembang",
    monthlyPrice: 59000,
    yearlyPrice: 39000,
    highlight: true,
    badge: "Paling Populer",
    storage: "20 GB SSD",
    bandwidth: "Unlimited",
    websites: "5 website",
    email: "25 akun email",
    databases: "10 database",
    features: [
      { label: "SSL Gratis (Let's Encrypt)", included: true },
      { label: "cPanel Control Panel", included: true },
      { label: "Backup Mingguan", included: true },
      { label: "Subdomain Tak Terbatas", included: true },
      { label: "1-Click CMS Install", included: true },
      { label: "Backup Harian", included: true },
      { label: "Dedicated IP", included: false },
      { label: "Priority Support", included: false },
    ],
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "Performa tinggi tanpa kompromi",
    monthlyPrice: 119000,
    yearlyPrice: 79000,
    storage: "50 GB SSD NVMe",
    bandwidth: "Unlimited",
    websites: "Unlimited",
    email: "Unlimited",
    databases: "Unlimited",
    features: [
      { label: "SSL Gratis (Let's Encrypt)", included: true },
      { label: "cPanel Control Panel", included: true },
      { label: "Backup Mingguan", included: true },
      { label: "Subdomain Tak Terbatas", included: true },
      { label: "1-Click CMS Install", included: true },
      { label: "Backup Harian", included: true },
      { label: "Dedicated IP", included: true },
      { label: "Priority Support", included: true },
    ],
  },
];

const FEATURES_OVERVIEW = [
  {
    icon: Zap,
    title: "Server Cepat",
    description:
      "Infrastruktur berbasis SSD NVMe dengan uptime tinggi untuk loading yang lebih responsif.",
  },
  {
    icon: ShieldCheck,
    title: "SSL Gratis",
    description:
      "Setiap paket sudah termasuk sertifikat SSL Let's Encrypt yang diperbarui otomatis.",
  },
  {
    icon: RefreshCw,
    title: "Auto Backup",
    description:
      "Data Anda dicadangkan secara berkala sehingga mudah dipulihkan kapan saja.",
  },
  {
    icon: HeadphonesIcon,
    title: "Support Responsif",
    description:
      "Tim teknis kami siap membantu melalui live chat dan tiket dukungan.",
  },
  {
    icon: LayoutDashboard,
    title: "cPanel Lengkap",
    description:
      "Kelola hosting Anda dengan mudah lewat cPanel yang sudah dikenal luas.",
  },
  {
    icon: Globe,
    title: "1-Click Install",
    description:
      "Pasang WordPress, Joomla, dan CMS populer lainnya hanya dengan satu klik.",
  },
];

const FAQS = [
  {
    q: "Apakah saya bisa upgrade paket nanti?",
    a: "Ya, Anda bisa upgrade ke paket yang lebih tinggi kapan saja. Perbedaan harga akan dihitung secara proporsional (prorata) sesuai sisa masa aktif.",
  },
  {
    q: "Apakah domain sudah termasuk dalam paket hosting?",
    a: "Domain tidak termasuk dalam paket hosting dan perlu didaftarkan secara terpisah. Anda bisa cek harga domain di halaman Daftar Harga Domain kami.",
  },
  {
    q: "Apa itu bandwidth unlimited?",
    a: "Bandwidth unlimited berarti tidak ada batasan data transfer bulanan. Namun penggunaan sumber daya server (CPU & RAM) tetap dibatasi sesuai fair use policy untuk menjaga stabilitas semua pengguna.",
  },
  {
    q: "Bagaimana cara memindahkan hosting saya ke sini?",
    a: "Tim support kami dapat membantu proses migrasi hosting dari provider lain secara gratis untuk paket Business dan Professional. Cukup buka tiket dukungan setelah mendaftar.",
  },
  {
    q: "Berapa lama proses aktivasi setelah pembayaran?",
    a: "Akun hosting diaktifkan otomatis dalam waktu kurang dari 5 menit setelah pembayaran dikonfirmasi. Anda akan menerima detail login melalui email.",
  },
];



// ─── Spec Row ─────────────────────────────────────────────────────────────────
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

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({
  plan,
  billing,
}: {
  plan: HostingPlan;
  billing: BillingCycle;
}) {
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
        <div className="absolute -top-3 left-1/2 z-99 -translate-x-1/2">
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
        {/* Specs */}
        <div className="mb-4 space-y-0.5">
          <SpecRow icon={HardDrive} label="Penyimpanan" value={plan.storage} />
          <SpecRow icon={Wifi} label="Bandwidth" value={plan.bandwidth} />
          <SpecRow icon={Globe} label="Website" value={plan.websites} />
          <SpecRow icon={Mail} label="Email" value={plan.email} />
          <SpecRow icon={Database} label="Database" value={plan.databases} />
        </div>

        <Separator className="my-3" />

        {/* Feature list */}
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
export default function HostingPage() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  return (
    <div className="bg-background">
      <section className="border-b bg-linear-to-b from-primary/10 to-background">
        <div className="mx-auto max-w-5xl px-4 text-center pb-16 pt-32">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-xs">
            <Server className="h-3.5 w-3.5" />
            Web Hosting Terjangkau
          </div>
          <h1 className="mb-3 font-extrabold text-3xl tracking-tight md:text-4xl lg:text-5xl">
            Hosting Cepat &amp; Andal
            <br className="hidden sm:block" /> untuk Website Anda
          </h1>
          <p className="mx-auto max-w-xl text-base text-muted-foreground md:text-lg">
            Mulai dari blog pribadi hingga toko online — pilih paket yang sesuai
            kebutuhan dan anggaran Anda.
          </p>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        {/* Billing Toggle */}
        <div className="mb-10 flex flex-col items-center gap-2">
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

        {/* Plan Cards */}
        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} billing={billing} />
          ))}
        </div>

        {/* Footnote */}
        <p className="mt-6 text-center text-muted-foreground text-xs">
          Semua paket sudah termasuk SSL gratis, cPanel, dan migrasi hosting
          gratis (untuk paket Business &amp; Professional). Harga belum termasuk
          PPN 11%.
        </p>
      </section>

      <Separator />

      {/* ── Features Overview ── */}
      <section className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <div className="mb-8 text-center">
          <h2 className="mb-2 font-bold text-xl md:text-2xl">
            Semua yang Anda Butuhkan
          </h2>
          <p className="mx-auto max-w-md text-muted-foreground text-sm">
            Setiap paket hosting dilengkapi dengan fitur-fitur penting tanpa
            biaya tambahan.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES_OVERVIEW.map((f) => (
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

      <Separator />

      {/* ── Comparison Table (desktop only) ── */}
      <section className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <div className="mb-8 text-center">
          <h2 className="mb-2 font-bold text-xl md:text-2xl">
            Perbandingan Paket
          </h2>
          <p className="text-muted-foreground text-sm">
            Detail lengkap fitur di setiap paket.
          </p>
        </div>

        {/* Mobile: stacked cards sudah cukup; tabel hanya di md+ */}
        <div className="hidden overflow-x-auto rounded-md border md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-56 px-5 py-3 text-left font-semibold">
                  Fitur
                </th>
                {PLANS.map((p) => (
                  <th
                    key={p.id}
                    className={`px-4 py-3 text-center font-semibold ${p.highlight ? "text-primary" : ""}`}
                  >
                    {p.name}
                    {p.highlight && (
                      <Badge className="ml-1.5 h-4 px-1.5 py-0 align-middle text-[10px]">
                        Terbaik
                      </Badge>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: "Penyimpanan",
                  icon: HardDrive,
                  key: "storage" as const,
                },
                { label: "Bandwidth", icon: Wifi, key: "bandwidth" as const },
                {
                  label: "Jumlah Website",
                  icon: Globe,
                  key: "websites" as const,
                },
                { label: "Akun Email", icon: Mail, key: "email" as const },
                {
                  label: "Database",
                  icon: Database,
                  key: "databases" as const,
                },
              ].map((row, i) => (
                <tr
                  key={row.key}
                  className={`border-b ${i % 2 === 0 ? "" : "bg-muted/20"}`}
                >
                  <td className="flex items-center gap-2 px-5 py-3 text-muted-foreground">
                    <row.icon className="h-3.5 w-3.5" />
                    {row.label}
                  </td>
                  {PLANS.map((p) => (
                    <td
                      key={p.id}
                      className="px-4 py-3 text-center font-medium"
                    >
                      {p[row.key]}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Feature rows */}
              {PLANS[0].features.map((feat, fi) => (
                <tr
                  key={feat.label}
                  className={`border-b last:border-0 ${fi % 2 === 0 ? "" : "bg-muted/20"}`}
                >
                  <td className="px-5 py-3 text-muted-foreground">
                    {feat.label}
                  </td>
                  {PLANS.map((p) => (
                    <td key={p.id} className="px-4 py-3 text-center">
                      {p.features[fi].included ? (
                        <CheckCircle2 className="mx-auto h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="mx-auto h-4 w-4 text-muted-foreground/30" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile notice */}
        <p className="mt-2 text-center text-muted-foreground text-xs md:hidden">
          Gulir ke atas untuk melihat detail fitur masing-masing paket.
        </p>
      </section>

      <Separator />

      {/* ── FAQ ── */}
      <section className="mx-auto max-w-2xl px-4 py-10 md:py-14">
        <div className="mb-8 text-center">
          <h2 className="mb-2 font-bold text-xl md:text-2xl">
            Pertanyaan Umum
          </h2>
          <p className="text-muted-foreground text-sm">
            Tidak menemukan jawaban yang dicari?{" "}
            <button className="text-primary underline underline-offset-2 hover:no-underline">
              Hubungi kami
            </button>
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-2">
          {FAQS.map((faq, i) => (
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

      {/* ── CTA Banner ── */}
      <section className="border-t bg-primary/5">
        <div className="mx-auto max-w-5xl px-4 py-10 text-center md:py-12">
          <h2 className="mb-2 font-bold text-xl md:text-2xl">Siap Memulai?</h2>
          <p className="mx-auto mb-6 max-w-md text-muted-foreground text-sm">
            Pilih paket yang sesuai dan aktifkan hosting Anda dalam hitungan
            menit.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto">
              Mulai Sekarang
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Hubungi Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
