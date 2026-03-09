// app/blog/page.tsx
"use client";

import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock,
  Rss,
  Search,
  Tag,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@tanisya/ui/components/badge";
import { Button } from "@tanisya/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@tanisya/ui/components/card";
import { Input } from "@tanisya/ui/components/input";
import { Separator } from "@tanisya/ui/components/separator";

// ─── Types ────────────────────────────────────────────────────────────────────
type BlogCategory = "all" | "tutorial" | "tips" | "berita" | "panduan";

interface BlogPost {
  id: string;
  slug: string;
  category: Exclude<BlogCategory, "all">;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readingTime: number;
  featured?: boolean;
  coverColor: string;
  tags: string[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const POSTS: BlogPost[] = [
  {
    id: "1",
    slug: "cara-install-wordpress-cpanel",
    category: "tutorial",
    title: "Cara Install WordPress di cPanel dalam 5 Menit",
    excerpt:
      "Panduan lengkap instalasi WordPress melalui Softaculous di cPanel. Cocok untuk pemula yang baru pertama kali membuat website.",
    author: "Andi Pratama",
    publishedAt: "2025-06-10",
    readingTime: 5,
    featured: true,
    coverColor: "from-blue-500/20 to-cyan-500/20",
    tags: ["WordPress", "cPanel", "Pemula"],
  },
  {
    id: "2",
    slug: "tips-keamanan-website-2025",
    category: "tips",
    title: "10 Tips Keamanan Website yang Wajib Diterapkan di 2025",
    excerpt:
      "Keamanan website sering diabaikan hingga terjadi serangan. Berikut 10 langkah praktis untuk melindungi website Anda dari ancaman siber.",
    author: "Sari Dewi",
    publishedAt: "2025-06-05",
    readingTime: 8,
    featured: true,
    coverColor: "from-rose-500/20 to-orange-500/20",
    tags: ["Keamanan", "SSL", "Firewall"],
  },
  {
    id: "3",
    slug: "perbedaan-shared-vps-dedicated",
    category: "panduan",
    title: "Shared Hosting vs VPS vs Dedicated: Mana yang Tepat untuk Anda?",
    excerpt:
      "Bingung memilih jenis hosting? Artikel ini membantu Anda memahami perbedaan, kelebihan, dan kekurangan masing-masing jenis hosting.",
    author: "Budi Santoso",
    publishedAt: "2025-05-28",
    readingTime: 10,
    coverColor: "from-violet-500/20 to-purple-500/20",
    tags: ["Hosting", "VPS", "Dedicated"],
  },
  {
    id: "4",
    slug: "update-php-8-3-cpanel",
    category: "tutorial",
    title: "Cara Update Versi PHP ke 8.3 di cPanel",
    excerpt:
      "PHP 8.3 membawa peningkatan performa signifikan. Pelajari cara mengubah versi PHP hosting Anda dengan aman tanpa downtime.",
    author: "Andi Pratama",
    publishedAt: "2025-05-20",
    readingTime: 6,
    coverColor: "from-green-500/20 to-teal-500/20",
    tags: ["PHP", "cPanel", "Performa"],
  },
  {
    id: "5",
    slug: "promo-hosting-murah-juni-2025",
    category: "berita",
    title: "Promo Hosting Terbesar Juni 2025 — Hemat hingga 70%",
    excerpt:
      "Jangan lewatkan promo hosting eksklusif bulan Juni! Dapatkan paket Business dengan harga Starter dan nikmati berbagai bonus menarik.",
    author: "Tim Marketing",
    publishedAt: "2025-06-01",
    readingTime: 3,
    coverColor: "from-amber-500/20 to-yellow-500/20",
    tags: ["Promo", "Diskon", "Hosting"],
  },
  {
    id: "6",
    slug: "optimasi-kecepatan-wordpress",
    category: "tips",
    title: "7 Plugin WordPress Terbaik untuk Mempercepat Loading Website",
    excerpt:
      "Website lambat bikin pengunjung kabur. Temukan 7 plugin caching dan optimasi yang terbukti meningkatkan Core Web Vitals skor Anda.",
    author: "Sari Dewi",
    publishedAt: "2025-05-15",
    readingTime: 7,
    coverColor: "from-sky-500/20 to-indigo-500/20",
    tags: ["WordPress", "Performa", "SEO"],
  },
  {
    id: "7",
    slug: "panduan-migrasi-hosting",
    category: "panduan",
    title: "Panduan Migrasi Hosting Tanpa Downtime: Langkah demi Langkah",
    excerpt:
      "Pindah hosting tidak harus menyebabkan website offline. Ikuti panduan migrasi profesional ini untuk proses yang mulus dan aman.",
    author: "Budi Santoso",
    publishedAt: "2025-05-08",
    readingTime: 12,
    coverColor: "from-fuchsia-500/20 to-pink-500/20",
    tags: ["Migrasi", "Hosting", "DNS"],
  },
  {
    id: "8",
    slug: "mengenal-ssl-tls-website",
    category: "panduan",
    title: "Mengenal SSL/TLS: Mengapa Website Anda Wajib Pakai HTTPS",
    excerpt:
      "Sertifikat SSL bukan sekadar gembok hijau di browser. Pelajari cara kerja enkripsi SSL/TLS dan dampaknya pada SEO serta kepercayaan pengguna.",
    author: "Andi Pratama",
    publishedAt: "2025-04-30",
    readingTime: 9,
    coverColor: "from-emerald-500/20 to-green-500/20",
    tags: ["SSL", "Keamanan", "HTTPS"],
  },
];

const CATEGORIES: { value: BlogCategory; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "tutorial", label: "Tutorial" },
  { value: "tips", label: "Tips & Trik" },
  { value: "panduan", label: "Panduan" },
  { value: "berita", label: "Berita" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Format pendek untuk mobile agar tidak meluber
function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const CATEGORY_LABEL: Record<Exclude<BlogCategory, "all">, string> = {
  tutorial: "Tutorial",
  tips: "Tips & Trik",
  panduan: "Panduan",
  berita: "Berita",
};

// ─── Cover Placeholder ────────────────────────────────────────────────────────
function CoverPlaceholder({
  coverColor,
  className = "",
}: {
  coverColor: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br ${coverColor} ${className}`}
    >
      <BookOpen className="h-8 w-8 text-foreground/20" />
    </div>
  );
}

// ─── Featured Card ────────────────────────────────────────────────────────────
// Mobile: cover atas, konten bawah (stacked)
// sm+: cover kiri (w-40), konten kanan (row)
function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block">
      <Card className="group overflow-hidden border-border transition-shadow hover:shadow-lg">
        <div className="flex flex-col sm:flex-row">
          {/* Cover */}
          <CoverPlaceholder
            coverColor={post.coverColor}
            className="h-40 w-full shrink-0 sm:h-auto sm:w-40 md:w-48"
          />
          {/* Content — min-w-0 wajib agar tidak overflow kolom flex */}
          <div className="flex min-w-0 flex-1 flex-col">
            <CardHeader className="px-4 pt-4 pb-2 sm:px-5 sm:pt-5">
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                <Badge variant="default" className="text-xs">
                  {CATEGORY_LABEL[post.category]}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Unggulan
                </Badge>
              </div>
              <h3 className="break-words font-bold text-sm leading-snug group-hover:text-primary transition-colors sm:text-base">
                {post.title}
              </h3>
              <p className="mt-1 line-clamp-2 break-words text-muted-foreground text-xs leading-relaxed">
                {post.excerpt}
              </p>
            </CardHeader>

            {/* Meta footer */}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 pb-4 sm:px-5 sm:pb-5">
              {/* Author + date + read time — stacked untuk mobile */}
              <div className="flex min-w-0 flex-col gap-0.5 text-muted-foreground text-xs">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3 shrink-0" />
                  <span className="truncate">{post.author}</span>
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3 shrink-0" />
                  <span>{formatDateShort(post.publishedAt)}</span>
                  <span className="text-muted-foreground/40">·</span>
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>{post.readingTime} mnt</span>
                </span>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary">
                Baca
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block h-full">
      <Card className="group flex h-full flex-col overflow-hidden border-border transition-shadow hover:shadow-lg">
        <CoverPlaceholder coverColor={post.coverColor} className="h-36 w-full" />

        <CardHeader className="px-4 pt-3 pb-2">
          <Badge variant="secondary" className="mb-1.5 w-fit text-xs">
            {CATEGORY_LABEL[post.category]}
          </Badge>
          <h3 className="break-words font-bold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="mt-1 line-clamp-2 break-words text-muted-foreground text-xs leading-relaxed">
            {post.excerpt}
          </p>
        </CardHeader>

        {/* Tags */}
        <CardContent className="px-4 pb-0">
          <div className="flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                <Tag className="h-2.5 w-2.5 shrink-0" />
                {tag}
              </span>
            ))}
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="mt-auto items-center justify-between px-4 py-3">
          <div className="flex min-w-0 flex-col gap-0.5 text-muted-foreground text-xs">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3 shrink-0" />
              <span className="truncate">{post.author}</span>
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3 shrink-0" />
              <span className="truncate">{formatDateShort(post.publishedAt)}</span>
              <span className="text-muted-foreground/40">·</span>
              <Clock className="h-3 w-3 shrink-0" />
              <span>{post.readingTime} mnt</span>
            </span>
          </div>
          <span className="flex shrink-0 items-center gap-1 self-end text-xs font-medium text-primary">
            Baca
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}

// ─── Category Filter — mobile-friendly pill buttons ───────────────────────────
// Menggantikan Tabs shadcn yang tidak bisa wrap di mobile
function CategoryFilter({
  value,
  onChange,
  counts,
}: {
  value: BlogCategory;
  onChange: (v: BlogCategory) => void;
  counts: Record<Exclude<BlogCategory, "all">, number>;
}) {
  return (
    // overflow-x-auto: tab bisa di-scroll horizontal di mobile tanpa meluber
    <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {CATEGORIES.map((c) => {
        const active = value === c.value;
        const count = c.value !== "all" ? counts[c.value as Exclude<BlogCategory, "all">] : null;
        return (
          <button
            key={c.value}
            onClick={() => onChange(c.value)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {c.label}
            {count !== null && (
              <span
                className={`flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                  active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BlogPage() {
  const [category, setCategory] = useState<BlogCategory>("all");
  const [query, setQuery] = useState("");

  const counts = CATEGORIES.slice(1).reduce(
    (acc, c) => {
      acc[c.value as Exclude<BlogCategory, "all">] = POSTS.filter(
        (p) => p.category === c.value
      ).length;
      return acc;
    },
    {} as Record<Exclude<BlogCategory, "all">, number>
  );

  const featured = POSTS.filter((p) => p.featured);

  const filtered = POSTS.filter((p) => {
    const matchCat = category === "all" || p.category === category;
    const matchQ =
      query === "" ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));
    return matchCat && matchQ;
  });

  const showFeatured = category === "all" && query === "";
  const regularPosts = showFeatured
    ? filtered.filter((p) => !p.featured)
    : filtered;

  return (
    // overflow-x-hidden di root cegah horizontal scroll seluruh halaman
    <div className="overflow-x-hidden bg-background">

      {/* ── Hero ── */}
      <section className="border-b bg-linear-to-b from-primary/10 to-background">
        <div className="mx-auto max-w-5xl px-4 py-10 text-center sm:px-6 md:pb-16 md:pt-32">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-xs">
            <Rss className="h-3.5 w-3.5" />
            Blog &amp; Artikel
          </div>
          <h1 className="mb-3 font-extrabold text-2xl tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
            Tips, Tutorial &amp; Berita
            <br className="hidden sm:block" /> Seputar Hosting
          </h1>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base md:text-lg">
            Temukan panduan praktis, tips optimasi, dan kabar terbaru untuk
            membantu website Anda tumbuh.
          </p>

          {/* Search */}
          <div className="mx-auto mt-6 flex max-w-md items-center gap-2 sm:mt-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari artikel..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuery("")}
                className="shrink-0 text-xs"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ── Category Filter ── */}
      <section className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CategoryFilter value={category} onChange={setCategory} counts={counts} />
          <p className="shrink-0 text-muted-foreground text-xs">
            {filtered.length} artikel ditemukan
          </p>
        </div>
      </section>

      <Separator />

      {/* ── Featured ── */}
      {showFeatured && featured.length > 0 && (
        <>
          <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:py-10">
            <h2 className="mb-4 font-bold text-base md:text-lg">
              Artikel Unggulan
            </h2>
            <div className="flex flex-col gap-3 sm:gap-4">
              {featured.map((p) => (
                <FeaturedCard key={p.id} post={p} />
              ))}
            </div>
          </section>
          <Separator />
        </>
      )}

      {/* ── All Posts ── */}
      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:py-10">
        {showFeatured && (
          <h2 className="mb-4 font-bold text-base md:text-lg">
            Artikel Terbaru
          </h2>
        )}

        {regularPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {regularPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed py-16 text-center">
            <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="font-medium text-sm">Artikel tidak ditemukan</p>
            <p className="mt-1 text-muted-foreground text-xs">
              Coba kata kunci atau kategori lain.
            </p>
          </div>
        )}

        {regularPosts.length > 0 && (
          <div className="mt-8 text-center sm:mt-10">
            <Button variant="outline" size="lg" className="gap-2">
              Muat Lebih Banyak
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </section>

      <Separator />

      {/* ── Newsletter CTA ── */}
      <section className="border-t bg-primary/5">
        <div className="mx-auto max-w-5xl px-4 py-10 text-center sm:px-6 md:py-12">
          <h2 className="mb-2 font-bold text-xl md:text-2xl">
            Jangan Lewatkan Artikel Terbaru
          </h2>
          <p className="mx-auto mb-6 max-w-md text-muted-foreground text-sm">
            Daftar newsletter dan dapatkan tips hosting, tutorial WordPress, dan
            promo eksklusif langsung di kotak masuk Anda.
          </p>
          <div className="mx-auto flex max-w-sm flex-col gap-2 sm:flex-row">
            <Input
              placeholder="email@domain.com"
              type="email"
              className="text-sm"
            />
            <Button className="shrink-0 gap-2">
              <Rss className="h-4 w-4" />
              Berlangganan
            </Button>
          </div>
          <p className="mt-3 text-muted-foreground text-xs">
            Gratis, bisa berhenti berlangganan kapan saja.
          </p>
        </div>
      </section>
    </div>
  );
}