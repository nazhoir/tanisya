import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  HeartHandshake,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@tanisya/ui/components/button";
import { Input } from "@tanisya/ui/components/input";
import { Textarea } from "@tanisya/ui/components/textarea";
import { Label } from "@tanisya/ui/components/label";

// ─── Data ─────────────────────────────────────────────────────────────────────

const CONTACT_CHANNELS = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    subtitle: "Respons paling cepat",
    value: "+62 812-3456-7890",
    href: "https://wa.me/6281234567890?text=Halo%20Tanisya%2C%20saya%20ingin%20bertanya%20tentang",
    badge: "Online sekarang",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    cta: "Chat WhatsApp",
    ctaVariant: "default" as const,
    note: "Senin–Sabtu, 08.00–22.00 WIB",
  },
  {
    icon: Mail,
    title: "Email",
    subtitle: "Untuk pertanyaan detail",
    value: "hello@tanisya.com",
    href: "mailto:hello@tanisya.com",
    badge: "< 24 jam",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    cta: "Kirim Email",
    ctaVariant: "outline" as const,
    note: "Direspons setiap hari kerja",
  },
  {
    icon: Phone,
    title: "Telepon",
    subtitle: "Untuk urusan mendesak",
    value: "(031) 1234-5678",
    href: "tel:+62311234567",
    badge: "Jam kerja",
    badgeColor: "bg-muted text-muted-foreground",
    cta: "Hubungi Sekarang",
    ctaVariant: "outline" as const,
    note: "Senin–Jumat, 09.00–17.00 WIB",
  },
];

const DEPARTMENTS = [
  {
    icon: Zap,
    title: "Sales & Konsultasi",
    email: "sales@tanisya.com",
    description: "Tanya soal produk, harga, atau minta demo. Tim sales kami siap membantu.",
  },
  {
    icon: Users,
    title: "Support Teknis",
    email: "support@tanisya.com",
    description: "Masalah hosting, domain, SSL, atau layanan aktif. SLA respons 2 jam.",
  },
  {
    icon: HeartHandshake,
    title: "Partnership & Afiliasi",
    email: "partnership@tanisya.com",
    description: "Program reseller, afiliasi, B2B, dan kerja sama non-profit.",
  },
  {
    icon: Building2,
    title: "Enterprise",
    email: "enterprise@tanisya.com",
    description: "Kebutuhan skala besar, SLA khusus, dan dedicated infrastructure.",
  },
];

const OFFICES = [
  {
    city: "Surabaya",
    label: "Kantor Pusat",
    address: "Jl. Raya Darmo No. 45",
    city2: "Surabaya 60241, Jawa Timur",
    flag: "🏢",
    maps: "https://maps.google.com",
  },
  {
    city: "Jakarta",
    label: "Kantor Representative",
    address: "Gedung Menara Sudirman Lt. 12",
    city2: "Jakarta 10220, DKI Jakarta",
    flag: "🌆",
    maps: "https://maps.google.com",
  },
];

const RESPONSE_TIMES = [
  { channel: "WhatsApp", time: "< 5 menit", icon: MessageCircle, color: "text-emerald-500" },
  { channel: "Live Chat", time: "< 10 menit", icon: Globe, color: "text-blue-500" },
  { channel: "Email", time: "< 24 jam", icon: Mail, color: "text-primary" },
  { channel: "Telepon", time: "Langsung", icon: Phone, color: "text-amber-500" },
];

const TOPICS = [
  "Hosting & Domain",
  "VPS & Dedicated Server",
  "Instan Apps",
  "Custom Website",
  "Billing & Pembayaran",
  "Migrasi Website",
  "Program Afiliasi",
  "Partnership B2B",
  "Lainnya",
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function ContactPage() {
  return (
    <>
      <main className="w-full">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative flex min-h-[50svh] items-center">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary/10 blur-[100px] sm:h-125 sm:w-125" />
            <div className="absolute right-0 top-1/4 h-40 w-40 rounded-full bg-blue-500/8 blur-[80px] sm:h-64 sm:w-64" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-emerald-500/6 blur-[80px] sm:h-56 sm:w-56" />
          </div>

          <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-24 sm:px-6 sm:pt-36">
            <div className="flex flex-col items-center text-center">
              <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary sm:mb-6 sm:px-4 sm:text-sm">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                  <span className="relative h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="truncate">Tim support aktif — rata-rata respons 5 menit</span>
              </div>

              <h1 className="mb-4 text-[1.875rem] font-extrabold leading-[1.1] tracking-tight text-balance sm:mb-5 sm:text-5xl lg:text-[3.75rem]">
                Ada yang bisa{" "}
                <span className="relative inline-block">
                  <span className="bg-linear-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                    kami bantu?
                  </span>
                  <span className="absolute -bottom-1 left-0 h-0.75 w-full rounded-full bg-linear-to-r from-primary to-blue-500 opacity-30" />
                </span>
              </h1>

              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:max-w-xl sm:text-base lg:text-lg">
                Tim Tanisya siap membantu kamu — dari konsultasi produk, pertanyaan teknis,
                hingga kerja sama bisnis. Pilih cara yang paling nyaman untukmu.
              </p>
            </div>
          </div>
        </section>

        {/* ── CHANNEL KONTAK ───────────────────────────────────────────────── */}
        <section className="border-y border-border/60 bg-muted/20 py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {CONTACT_CHANNELS.map(({ icon: Icon, title, subtitle, value, href, badge, badgeColor, cta, ctaVariant, note }) => (
                <div
                  key={title}
                  className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-background p-5 transition-all hover:border-primary/30 hover:shadow-md sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${badgeColor}`}>
                      {badge}
                    </span>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{subtitle}</p>
                    <h3 className="text-base font-extrabold">{title}</h3>
                    <p className="mt-0.5 text-sm font-semibold text-primary">{value}</p>
                  </div>

                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 shrink-0" /> {note}
                  </p>

                  <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="mt-auto">
                    <Button variant={ctaVariant} className="h-10 w-full gap-1.5 font-semibold">
                      {cta} <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              ))}
            </div>

            {/* Response time bar */}
            <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/70 bg-border/25 sm:grid-cols-4">
              {RESPONSE_TIMES.map(({ channel, time, icon: Icon, color }) => (
                <div key={channel} className="flex flex-col items-center gap-1 bg-background/90 px-3 py-4 sm:px-6">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-sm font-extrabold">{time}</span>
                  <span className="text-[10px] text-muted-foreground">{channel}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FORM + DEPARTEMEN ────────────────────────────────────────────── */}
        <section className="py-12 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">

              {/* Form */}
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                  Kirim Pesan
                </p>
                <h2 className="mb-1 text-xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                  Ceritakan kebutuhanmu
                </h2>
                <p className="mb-7 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Isi form di bawah dan tim kami akan menghubungimu dalam waktu 1×24 jam kerja.
                </p>

                <form className="flex flex-col gap-4">
                  {/* Nama + Email */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="name" className="text-xs font-semibold">Nama Lengkap <span className="text-destructive">*</span></Label>
                      <Input id="name" placeholder="Ahmad Fauzi" className="h-11" required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold">Email <span className="text-destructive">*</span></Label>
                      <Input id="email" type="email" placeholder="kamu@email.com" className="h-11" required />
                    </div>
                  </div>

                  {/* No HP */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold">Nomor WhatsApp <span className="text-muted-foreground font-normal">(opsional)</span></Label>
                    <Input id="phone" type="tel" placeholder="+62 812-xxxx-xxxx" className="h-11" />
                  </div>

                  {/* Topik */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold">Topik <span className="text-destructive">*</span></Label>
                    <div className="flex flex-wrap gap-2">
                      {TOPICS.map((topic) => (
                        <label
                          key={topic}
                          className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-semibold transition-all hover:border-primary/40 hover:bg-primary/5 has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-primary"
                        >
                          <input type="radio" name="topic" value={topic} className="sr-only" />
                          {topic}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Pesan */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="message" className="text-xs font-semibold">Pesan <span className="text-destructive">*</span></Label>
                    <Textarea
                      id="message"
                      placeholder="Ceritakan kebutuhan atau pertanyaanmu secara detail..."
                      className="min-h-[140px] resize-none"
                      required
                    />
                  </div>

                  {/* Consent */}
                  <label className="flex cursor-pointer items-start gap-2.5 text-xs text-muted-foreground">
                    <input type="checkbox" className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-primary" required />
                    <span>
                      Saya menyetujui{" "}
                      <Link href="/privacy" className="font-semibold text-primary underline-offset-2 hover:underline">
                        Kebijakan Privasi
                      </Link>{" "}
                      Tanisya dan bersedia dihubungi oleh tim kami.
                    </span>
                  </label>

                  <Button type="submit" size="lg" className="h-12 w-full gap-2 font-bold shadow-md shadow-primary/15 sm:w-auto">
                    Kirim Pesan <Send className="h-4 w-4" />
                  </Button>

                  <p className="text-[11px] text-muted-foreground">
                    Tidak ada spam. Data kamu aman dan tidak dibagikan ke pihak ketiga.
                  </p>
                </form>
              </div>

              {/* Right: Departemen + Kantor */}
              <div className="flex flex-col gap-8">
                {/* Departemen */}
                <div>
                  <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                    Hubungi Departemen Langsung
                  </p>
                  <div className="flex flex-col gap-3">
                    {DEPARTMENTS.map(({ icon: Icon, title, email, description }) => (
                      <a
                        key={title}
                        href={`mailto:${email}`}
                        className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-background p-4 transition-all hover:border-primary/30 hover:shadow-md"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex items-center justify-between gap-2">
                            <p className="text-sm font-bold">{title}</p>
                            <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                          <p className="text-xs font-semibold text-primary">{email}</p>
                          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{description}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Kantor */}
                <div>
                  <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                    Lokasi Kantor
                  </p>
                  <div className="flex flex-col gap-3">
                    {OFFICES.map(({ city, label, address, city2, flag, maps }) => (
                      <a
                        key={city}
                        href={maps}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-background p-4 transition-all hover:border-primary/30 hover:shadow-md"
                      >
                        <span className="text-2xl">{flag}</span>
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex items-center justify-between gap-2">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
                              <p className="text-sm font-bold">{city}</p>
                            </div>
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                          <p className="text-xs leading-snug text-muted-foreground">{address}<br />{city2}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Jam Operasional */}
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-5">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                    Jam Operasional
                  </p>
                  <div className="flex flex-col gap-2 text-sm">
                    {[
                      { day: "Senin – Jumat", hours: "09.00 – 17.00 WIB", note: "Kantor & telepon" },
                      { day: "Senin – Sabtu", hours: "08.00 – 22.00 WIB", note: "WhatsApp & live chat" },
                      { day: "Minggu & Libur", hours: "10.00 – 18.00 WIB", note: "WhatsApp saja" },
                    ].map(({ day, hours, note }) => (
                      <div key={day} className="flex items-start justify-between gap-4">
                        <span className="text-xs text-muted-foreground">{day}</span>
                        <div className="text-right">
                          <span className="text-xs font-semibold">{hours}</span>
                          <span className="ml-1.5 text-[10px] text-muted-foreground">({note})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
                      <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    Support teknis & darurat tersedia 24/7
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── BANNER KERJA SAMA ────────────────────────────────────────────── */}
        <section className="border-t border-border/60 bg-muted/20 py-12 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary/90 to-blue-600 text-primary-foreground shadow-xl shadow-primary/20 sm:rounded-3xl">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl sm:-right-24 sm:-top-24 sm:h-72 sm:w-72" />
              <div className="pointer-events-none absolute -bottom-8 left-1/3 h-28 w-28 rounded-full bg-white/8 blur-2xl" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />

              <div className="relative flex flex-col gap-7 p-6 sm:p-10 lg:flex-row lg:items-center lg:gap-12 lg:p-16">
                <div className="flex-1">
                  <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold">
                    <Sparkles className="h-3.5 w-3.5 shrink-0" /> KONSULTASI GRATIS
                  </div>
                  <h2 className="mb-3 text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                    Tidak yakin produk mana yang tepat?
                  </h2>
                  <p className="mb-6 text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
                    Tim teknis kami siap merekomendasikan solusi terbaik sesuai kebutuhan dan anggaran kamu —
                    gratis, tanpa komitmen, dan tanpa tekanan untuk langsung beli.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <a href="https://wa.me/6281234567890?text=Halo%2C%20saya%20ingin%20konsultasi%20gratis" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                      <Button size="lg" className="h-12 w-full gap-2 bg-white font-bold text-primary hover:bg-white/90 sm:w-auto">
                        Mulai Konsultasi <ArrowRight className="h-4 w-4" />
                      </Button>
                    </a>
                    <Link href="/affiliate" className="w-full sm:w-auto">
                      <Button size="lg" variant="ghost" className="h-12 w-full gap-2 border border-white/20 text-primary-foreground hover:bg-white/10 sm:w-auto">
                        Lihat Program Kerja Sama <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-2 lg:w-72 lg:shrink-0">
                  {[
                    { icon: CheckCircle2, text: "Gratis tanpa syarat apapun" },
                    { icon: CheckCircle2, text: "Tidak ada tekanan untuk beli" },
                    { icon: CheckCircle2, text: "Rekomendasi dari tim teknis berpengalaman" },
                    { icon: CheckCircle2, text: "Via WhatsApp, Zoom, atau tatap muka" },
                    { icon: CheckCircle2, text: "Jadwal fleksibel sesuai waktumu" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3 py-2.5 text-sm">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-white/70" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ SINGKAT ──────────────────────────────────────────────────── */}
        <section className="py-12 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="mb-7 text-center sm:mb-10">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">FAQ</p>
              <h2 className="text-xl font-extrabold tracking-tight sm:text-3xl">
                Pertanyaan yang sering ditanyakan
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {[
                {
                  q: "Berapa lama waktu respons support?",
                  a: "WhatsApp dan live chat direspons rata-rata dalam 5 menit di jam operasional. Email direspons dalam 1×24 jam kerja. Untuk isu kritis layanan aktif, tim on-call siap 24/7.",
                },
                {
                  q: "Apakah konsultasi benar-benar gratis?",
                  a: "Ya, konsultasi 100% gratis tanpa syarat apapun. Kamu tidak diwajibkan membeli setelah konsultasi. Kami justru senang jika kamu bisa membuat keputusan yang tepat setelah berdiskusi dengan kami.",
                },
                {
                  q: "Bagaimana jika saya butuh bantuan teknis di luar jam kerja?",
                  a: "Untuk pelanggan aktif, support teknis darurat tersedia 24/7 via WhatsApp atau email support@tanisya.com. Tim on-call kami memantau isu kritis setiap saat.",
                },
                {
                  q: "Apakah ada biaya untuk migrasi dari hosting lain?",
                  a: "Layanan migrasi website ke Tanisya gratis untuk semua paket baru. Tim teknis kami akan menangani proses migrasi tanpa downtime.",
                },
                {
                  q: "Bagaimana cara mengajukan kerja sama atau kemitraan?",
                  a: "Kirim email ke partnership@tanisya.com atau isi form di halaman Afiliasi. Tim partnership kami akan merespons dalam 2 hari kerja dengan proposal yang sesuai.",
                },
              ].map(({ q, a }) => (
                <div key={q} className="rounded-2xl border border-border/60 bg-background p-5">
                  <h3 className="mb-2 text-sm font-bold sm:text-base">{q}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">{a}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Masih ada pertanyaan lain?{" "}
              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline-offset-2 hover:underline">
                Tanya via WhatsApp
              </a>{" "}
              atau cek{" "}
              <a href="https://docs.tanisya.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline-offset-2 hover:underline">
                dokumentasi lengkap kami
              </a>
              .
            </p>
          </div>
        </section>

      </main>
    </>
  );
}