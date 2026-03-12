import Link from "next/link";
import {
  ArrowRight,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Rocket,
  Shield,
  Sparkles,
  Target,
  Users,
  Zap,
  Globe,
  Code2,
  HeartHandshake,
  TrendingUp,
  Award,
  Coffee,
} from "lucide-react";
import { Button } from "@tanisya/ui/components/button";

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "2019", label: "Tahun Berdiri" },
  { value: "1rb+", label: "Pelanggan Aktif" },
  { value: "50+", label: "Tim & Kontributor" },
  { value: "99.9%", label: "Uptime SLA" },
];

const TIMELINE = [
  {
    year: "2019",
    title: "Lahir dari Kebutuhan Nyata",
    description:
      "Tanisya didirikan di Surabaya oleh dua developer yang frustasi dengan layanan hosting lokal yang lambat dan support yang tidak responsif. Kami memulai dengan 10 pelanggan pertama dari komunitas developer.",
  },
  {
    year: "2020",
    title: "Bertumbuh di Tengah Pandemi",
    description:
      "Pandemi mendorong banyak UMKM untuk go-digital. Kami hadir dengan paket terjangkau dan pendampingan penuh, membantu ratusan bisnis lokal bertransisi ke dunia online.",
  },
  {
    year: "2021",
    title: "Peluncuran Layanan Custom",
    description:
      "Merespons kebutuhan klien, kami membuka divisi pengembangan website custom. Tim desainer dan developer bergabung untuk menangani proyek dari skala UMKM hingga enterprise.",
  },
  {
    year: "2022",
    title: "Infrastruktur Naik Kelas",
    description:
      "Investasi besar di infrastruktur: data center tier III, CDN multi-region, dan sistem monitoring 24/7. Uptime kami mencapai 99.98% sepanjang tahun — terbaik di kelas kami.",
  },
  {
    year: "2023",
    title: "Instan Apps Diluncurkan",
    description:
      "Fitur andalan kami hadir: deploy 50+ aplikasi self-hosted dalam hitungan detik. n8n, Grafana, Typebot, dan puluhan lainnya — tanpa konfigurasi, langsung siap pakai.",
  },
  {
    year: "2024",
    title: "Open Source & Komunitas",
    description:
      "Kami mulai berkontribusi aktif ke ekosistem open source Indonesia. Tools dan template yang kami bangun kini digunakan oleh ribuan developer di seluruh Nusantara.",
  },
];

const VALUES = [
  {
    icon: Heart,
    title: "Pelanggan di Atas Segalanya",
    description:
      "Setiap keputusan produk dimulai dengan satu pertanyaan: apakah ini memudahkan hidup pelanggan kami? Support bukan sekadar departemen — ini adalah inti dari siapa kami.",
  },
  {
    icon: Shield,
    title: "Transparansi Tanpa Kompromi",
    description:
      "Tidak ada biaya tersembunyi, tidak ada kontrak yang menjebak. Kami percaya hubungan jangka panjang dibangun di atas kepercayaan, bukan keterpaksaan.",
  },
  {
    icon: Code2,
    title: "Teknologi yang Memberdayakan",
    description:
      "Kami bukan sekadar menjual hosting. Kami ingin teknologi menjadi akselerator bisnis Anda — bukan hambatan teknis yang menyita waktu dan pikiran.",
  },
  {
    icon: Globe,
    title: "Bangga Produk Indonesia",
    description:
      "Dibangun oleh orang Indonesia, untuk bisnis Indonesia. Kami paham konteks lokal, tantangan UMKM, dan ekosistem digital Nusantara dari dalam.",
  },
];

const TEAM = [
  {
    name: "Ahmad Fauzi",
    role: "Co-founder & CEO",
    avatar: "AF",
    color: "bg-primary",
    bio: "10 tahun di dunia infra & cloud. Ex-engineer di dua unicorn Indonesia sebelum membangun Tanisya.",
  },
  {
    name: "Rina Kusuma",
    role: "Co-founder & CTO",
    avatar: "RK",
    color: "bg-blue-500",
    bio: "Spesialis Kubernetes dan distributed systems. Arsitek di balik infrastruktur Tanisya yang reliabel.",
  },
  {
    name: "Dimas Prasetyo",
    role: "Head of Product",
    avatar: "DP",
    color: "bg-violet-500",
    bio: "Product builder dengan obsesi pada UX yang simpel. Instan Apps adalah visinya yang menjadi kenyataan.",
  },
  {
    name: "Siti Rahayu",
    role: "Head of Support",
    avatar: "SR",
    color: "bg-emerald-500",
    bio: "Membangun tim support terbaik di industri hosting Indonesia. NPS kami 72 — dan terus naik.",
  },
  {
    name: "Bima Arjuna",
    role: "Lead Engineer",
    avatar: "BA",
    color: "bg-amber-500",
    bio: "Full-stack developer yang juga contributes ke beberapa open source project populer.",
  },
  {
    name: "Nadia Putri",
    role: "Head of Design",
    avatar: "NP",
    color: "bg-pink-500",
    bio: "Desainer yang percaya bahwa produk teknis pun harus indah. Semua UI Tanisya lahir dari tangannya.",
  },
];

const PERKS = [
  { icon: Coffee, text: "Remote-first culture" },
  { icon: TrendingUp, text: "Saham & equity program" },
  { icon: Award, text: "Budget belajar Rp 5 juta/tahun" },
  { icon: Zap, text: "Hardware allowance" },
  { icon: HeartHandshake, text: "Asuransi kesehatan premium" },
  { icon: Sparkles, text: "Flexible working hours" },
];

const OFFICES = [
  {
    city: "Surabaya",
    label: "Kantor Pusat",
    address: "Jl. Raya Darmo No. 45, Surabaya 60241",
    flag: "🏢",
  },
  {
    city: "Jakarta",
    label: "Kantor Representative",
    address: "Gedung Menara Sudirman Lt. 12, Jakarta 10220",
    flag: "🌆",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <>
      <main className="w-full">
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative flex min-h-[70svh] items-center">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary/10 blur-[100px] sm:h-125 sm:w-125" />
            <div className="absolute right-0 top-1/4 h-40 w-40 rounded-full bg-blue-500/8 blur-[80px] sm:h-64 sm:w-64" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-violet-500/6 blur-[80px] sm:h-56 sm:w-56" />
          </div>

          <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-24 sm:px-6 sm:pt-36">
            <div className="flex flex-col items-center text-center">
              {/* Pill badge */}
              <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary sm:mb-6 sm:px-4 sm:text-sm">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Lahir di Surabaya · Melayani Seluruh Indonesia</span>
              </div>

              <h1 className="mb-4 text-[1.875rem] font-extrabold leading-[1.1] tracking-tight text-balance sm:mb-5 sm:text-5xl lg:text-[3.75rem]">
                Kami hadir karena{" "}
                <span className="relative inline-block">
                  <span className="bg-linear-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                    frustrasi yang sama
                  </span>
                  <span className="absolute -bottom-1 left-0 h-0.75 w-full rounded-full bg-linear-to-r from-primary to-blue-500 opacity-30" />
                </span>{" "}
                dengan Anda
              </h1>

              <p className="mb-7 max-w-sm text-sm leading-relaxed text-muted-foreground sm:max-w-xl sm:text-base lg:text-lg">
                Tanisya lahir dari pengalaman nyata sebagai developer yang lelah dengan hosting lambat,
                support robot, dan biaya tersembunyi. Kami membangun platform yang ingin kami gunakan
                sendiri — dan sekarang lebih dari seribu bisnis mempercayakannya kepada kami.
              </p>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link href="/contact" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="h-12 w-full gap-2 px-6 text-sm font-bold shadow-lg shadow-primary/20 sm:px-8 sm:text-base"
                  >
                    Kenali Tim Kami <Users className="h-4 w-4 shrink-0" />
                  </Button>
                </Link>
                <Link href="/hosting" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-full gap-2 px-6 text-sm sm:px-8 sm:text-base"
                  >
                    Mulai Pakai Tanisya <ArrowRight className="h-4 w-4 shrink-0" />
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-10 grid w-full grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/70 bg-border/25 sm:grid-cols-4">
                {STATS.map(({ value, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-0.5 bg-background/90 px-2 py-4 sm:px-6 sm:py-5"
                  >
                    <span className="text-xl font-extrabold tracking-tight sm:text-3xl">
                      {value}
                    </span>
                    <span className="text-[10px] text-muted-foreground sm:text-xs">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── MISI ─────────────────────────────────────────────────────────── */}
        <section className="border-y border-border/60 bg-muted/20 py-12 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                  Misi Kami
                </p>
                <h2 className="mb-4 text-xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                  Demokratisasi akses teknologi untuk bisnis Indonesia
                </h2>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Kami percaya setiap bisnis — dari warung online hingga perusahaan menengah — berhak
                  mendapatkan infrastruktur digital yang andal, terjangkau, dan mudah digunakan.
                  Teknologi tidak boleh menjadi privilege eksklusif perusahaan besar.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Dengan Tanisya, UMKM di Makassar mendapat uptime dan keamanan yang sama dengan
                  enterprise di Jakarta. Satu platform, satu standar, untuk semua.
                </p>
              </div>

              {/* Visual stat cards */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
                </div>
                <div className="relative grid grid-cols-2 gap-3">
                  {[
                    { icon: Rocket, label: "Deploy Kilat", sub: "Aktif dalam menit" },
                    { icon: Shield, label: "Keamanan Enterprise", sub: "SSL + WAF + DDoS" },
                    { icon: Target, label: "Support Manusia", sub: "24/7 via WhatsApp" },
                    { icon: Zap, label: "Infrastruktur Lokal", sub: "Data center Indonesia" },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div
                      key={label}
                      className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md sm:p-5"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-semibold sm:text-base">{label}</p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PERJALANAN ───────────────────────────────────────────────────── */}
        <section className="py-12 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-7 text-center sm:mb-12">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                Perjalanan Kami
              </p>
              <h2 className="text-xl font-extrabold tracking-tight sm:text-3xl">
                5 tahun membangun kepercayaan
              </h2>
            </div>

            <div className="relative mx-auto max-w-3xl">
              {/* Vertical line — hidden on mobile, visible on sm */}
              <div className="absolute left-0 top-0 hidden h-full w-px bg-border/60 sm:left-[7.5rem] sm:block" />

              <div className="flex flex-col gap-0">
                {TIMELINE.map(({ year, title, description }, i) => (
                  <div
                    key={year}
                    className="relative flex flex-col gap-1.5 pb-8 sm:flex-row sm:gap-0 sm:pb-10"
                  >
                    {/* Year — left column on sm */}
                    <div className="shrink-0 sm:w-28 sm:pt-0.5 sm:text-right sm:pr-8">
                      <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary sm:bg-transparent sm:p-0 sm:text-sm sm:font-extrabold sm:text-foreground">
                        {year}
                      </span>
                    </div>

                    {/* Dot on the line — sm only */}
                    <div className="absolute left-[7.5rem] top-1 hidden h-3 w-3 -translate-x-1/2 rounded-full border-2 border-primary bg-background sm:block" />

                    {/* Content */}
                    <div className="sm:pl-8">
                      <h3 className="mb-1 text-sm font-bold leading-tight sm:text-base">{title}</h3>
                      <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── NILAI ────────────────────────────────────────────────────────── */}
        <section className="border-y border-border/60 bg-muted/20 py-12 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-7 text-center sm:mb-12">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                Nilai-Nilai Kami
              </p>
              <h2 className="text-xl font-extrabold tracking-tight sm:text-3xl">
                Yang kami pegang teguh setiap harinya
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
              {VALUES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex items-start gap-4 rounded-2xl border border-border/60 bg-background p-5 transition-all hover:border-primary/30 hover:shadow-md sm:flex-col"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-bold leading-tight sm:text-base">{title}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TIM ──────────────────────────────────────────────────────────── */}
        <section className="py-12 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-7 text-center sm:mb-12">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                Tim Inti
              </p>
              <h2 className="text-xl font-extrabold tracking-tight sm:text-3xl">
                Orang-orang di balik Tanisya
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                Kami adalah tim kecil yang bergerak cepat, dengan semangat besar untuk
                membangun produk yang benar-benar berguna.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {TEAM.map(({ name, role, avatar, color, bio }) => (
                <div
                  key={name}
                  className="flex items-start gap-4 rounded-2xl border border-border/60 bg-background p-5 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${color} text-sm font-bold text-white`}
                  >
                    {avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold sm:text-base">{name}</p>
                    <p className="mb-2 text-xs font-semibold text-primary">{role}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BERGABUNG ────────────────────────────────────────────────────── */}
        <section className="py-12 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary/90 to-blue-600 text-primary-foreground shadow-xl shadow-primary/20 sm:rounded-3xl">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl sm:-right-24 sm:-top-24 sm:h-72 sm:w-72" />
              <div className="pointer-events-none absolute -bottom-8 left-1/3 h-28 w-28 rounded-full bg-white/8 blur-2xl" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />

              <div className="relative flex flex-col gap-7 p-6 sm:p-10 lg:flex-row lg:items-start lg:gap-12 lg:p-16">
                {/* Copy */}
                <div className="flex-1">
                  <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold">
                    <Sparkles className="h-3.5 w-3.5 shrink-0" /> WE ARE HIRING
                  </div>
                  <h2 className="mb-3 text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                    Bergabung bersama kami membangun masa depan
                  </h2>
                  <p className="mb-6 text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
                    Kami selalu mencari orang-orang yang passionate, driven, dan
                    ingin membuat dampak nyata di ekosistem digital Indonesia.
                    Remote-first, culture-first, growth-first.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link href="/life-at-tanisya" className="w-full sm:w-auto">
                      <Button
                        size="lg"
                        className="h-12 w-full gap-2 bg-white font-bold text-primary hover:bg-white/90 sm:w-auto"
                      >
                        Lihat Posisi Terbuka <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/contact" className="w-full sm:w-auto">
                      <Button
                        size="lg"
                        variant="ghost"
                        className="h-12 w-full gap-2 border border-white/20 text-primary-foreground hover:bg-white/10 sm:w-auto"
                      >
                        Kirim Lamaran Spontan <MessageCircle className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Perks list */}
                <div className="flex w-full flex-col gap-2 lg:w-72 lg:shrink-0">
                  {PERKS.map(({ icon: Icon, text }) => (
                    <div
                      key={text}
                      className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-medium"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-white/70" />
                      <span className="min-w-0 truncate">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── LOKASI ───────────────────────────────────────────────────────── */}
        <section className="border-t border-border/60 bg-muted/20 py-12 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-7 text-center sm:mb-12">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                Lokasi
              </p>
              <h2 className="text-xl font-extrabold tracking-tight sm:text-3xl">
                Temui kami di sini
              </h2>
            </div>

            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {OFFICES.map(({ city, label, address, flag }) => (
                <div
                  key={city}
                  className="flex items-start gap-4 rounded-2xl border border-border/60 bg-background p-5 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <span className="text-3xl">{flag}</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      {label}
                    </p>
                    <p className="text-sm font-bold sm:text-base">{city}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="border-t border-border/60 bg-muted/20 py-14 sm:py-24">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <h2 className="mb-4 text-2xl font-extrabold tracking-tight sm:text-4xl">
              Siap jadi bagian dari keluarga Tanisya?
            </h2>
            <p className="mb-8 text-sm text-muted-foreground sm:text-base">
              Bergabung dengan lebih dari seribu bisnis yang sudah mempercayakan
              infrastruktur digitalnya kepada kami. Mulai hari ini, tanpa risiko.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/hosting" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-12 w-full gap-2 px-8 font-bold shadow-lg shadow-primary/20 sm:w-auto"
                >
                  Mulai Gratis 14 Hari <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full gap-2 px-8 sm:w-auto"
                >
                  <Phone className="h-4 w-4" /> Hubungi Kami
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Tidak perlu kartu kredit · Setup instan · Support 24/7
            </p>
          </div>
        </section>
      </main>
    </>
  );
}