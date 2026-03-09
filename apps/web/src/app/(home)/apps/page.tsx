// app/apps/page.tsx
"use client";

import {
  ExternalLink,
  Github,
  Globe,
  Monitor,
  Search,
  SlidersHorizontal,
  Star,
  X,
  Grid3X3,
  List,
  ArrowRight,
  Zap,
  Server,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@tanisya/ui/components/badge";
import { Button } from "@tanisya/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader } from "@tanisya/ui/components/card";
import { Input } from "@tanisya/ui/components/input";
import { Separator } from "@tanisya/ui/components/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@tanisya/ui/components/sheet";
import { Toggle } from "@tanisya/ui/components/toggle";
import { ScrollArea } from "@tanisya/ui/components/scroll-area";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AppTemplate {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  priceLabel: string;
  logo: string;
  github: string;
  website: string;
  demo: string;
  preview: string;
  accentColor: string;
  stars: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "All",
  "Business",
  "Productivity",
  "Communication",
  "Entertainment",
  "DevOps",
  "Monitoring",
];

const TAGS_ALL = [
  "Automation",
  "Integration",
  "Open Source",
  "Self-hosted",
  "WhatsApp API",
  "Messaging",
  "Deployment",
  "Monitoring",
  "Chatbot",
  "No-code",
  "Analytics",
  "Database",
];

const TEMPLATES: AppTemplate[] = [
  {
    id: 1,
    slug: "n8n",
    name: "n8n",
    tagline: "Workflow automation with 200+ integrations",
    description:
      "Extendable workflow automation tool. With a fair-code distribution model, n8n will always have visible source code, and you can self-host it.",
    category: "Productivity",
    tags: ["Automation", "Integration", "Self-hosted"],
    price: 15000,
    priceLabel: "Rp 15.000",
    logo: "https://avatars.githubusercontent.com/u/45487711?s=200&v=4",
    github: "https://github.com/n8n-io/n8n",
    website: "https://n8n.io",
    demo: "https://n8n.io",
    preview: "https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-screenshot.png",
    accentColor: "hsl(var(--primary))",
    stars: "44k",
  },
  {
    id: 2,
    slug: "activepieces",
    name: "Activepieces",
    tagline: "Open source alternative to Zapier",
    description:
      "Open source workflow automation tool with hundreds of integrations. An alternative to Zapier, Make, and Tray.",
    category: "Productivity",
    tags: ["Automation", "Integration", "Open Source"],
    price: 85000,
    priceLabel: "Rp 85.000",
    logo: "https://avatars.githubusercontent.com/u/96545600?s=200&v=4",
    github: "https://github.com/activepieces/activepieces",
    website: "https://www.activepieces.com",
    demo: "https://cloud.activepieces.com",
    preview: "https://www.activepieces.com/og.png",
    accentColor: "hsl(var(--primary))",
    stars: "9k",
  },
  {
    id: 3,
    slug: "waha-plus",
    name: "WAHA Plus",
    tagline: "WhatsApp HTTP API for unlimited sessions",
    description:
      "Self-hosted WhatsApp HTTP API (REST API) for unlimited sessions, multimedia messages, webhooks and more.",
    category: "Communication",
    tags: ["WhatsApp API", "Messaging", "Self-hosted"],
    price: 20000,
    priceLabel: "Rp 20.000",
    logo: "https://waha.devlike.pro/images/logo.png",
    github: "https://github.com/devlikeapro/waha",
    website: "https://waha.devlike.pro",
    demo: "https://waha.devlike.pro",
    preview: "https://waha.devlike.pro/images/logo.png",
    accentColor: "hsl(var(--primary))",
    stars: "2.3k",
  },
  {
    id: 4,
    slug: "coolify",
    name: "Coolify",
    tagline: "Self-hostable Heroku & Vercel alternative",
    description:
      "An open-source & self-hostable alternative to Heroku / Netlify / Vercel. Deploy anything to any VPS.",
    category: "DevOps",
    tags: ["Self-hosted", "Deployment", "Open Source"],
    price: 10000,
    priceLabel: "Rp 10.000",
    logo: "https://avatars.githubusercontent.com/u/88363897?s=200&v=4",
    github: "https://github.com/coollabsio/coolify",
    website: "https://coolify.io",
    demo: "https://app.coolify.io",
    preview: "https://coolify.io/og.png",
    accentColor: "hsl(var(--primary))",
    stars: "33k",
  },
  {
    id: 5,
    slug: "uptime-kuma",
    name: "Uptime Kuma",
    tagline: "Fancy self-hosted monitoring tool",
    description:
      "Monitor uptime for HTTP(s), TCP, DNS records and more. Get notified via Telegram, Slack, Discord & 90+ services.",
    category: "Monitoring",
    tags: ["Monitoring", "Self-hosted", "Open Source"],
    price: 12000,
    priceLabel: "Rp 12.000",
    logo: "https://avatars.githubusercontent.com/u/1336778?s=200&v=4",
    github: "https://github.com/louislam/uptime-kuma",
    website: "https://uptime.kuma.pet",
    demo: "https://demo.uptime.kuma.pet",
    preview: "https://uptime.kuma.pet/img/kuma.jpg",
    accentColor: "hsl(var(--primary))",
    stars: "56k",
  },
  {
    id: 6,
    slug: "typebot",
    name: "Typebot",
    tagline: "Conversational apps & chatbot builder",
    description:
      "Open-source no-code chatbot builder. Create powerful chatbots for your website with a drag-and-drop interface.",
    category: "Communication",
    tags: ["Chatbot", "No-code", "Open Source"],
    price: 18000,
    priceLabel: "Rp 18.000",
    logo: "https://avatars.githubusercontent.com/u/97338012?s=200&v=4",
    github: "https://github.com/baptisteArno/typebot.io",
    website: "https://typebot.io",
    demo: "https://app.typebot.io",
    preview: "https://typebot.io/og.png",
    accentColor: "hsl(var(--primary))",
    stars: "7.5k",
  },
  {
    id: 7,
    slug: "grafana",
    name: "Grafana",
    tagline: "Operational dashboards & analytics",
    description:
      "The open and composable observability and data visualization platform. Visualize metrics, logs, and traces.",
    category: "Monitoring",
    tags: ["Analytics", "Monitoring", "Open Source"],
    price: 25000,
    priceLabel: "Rp 25.000",
    logo: "https://avatars.githubusercontent.com/u/7195757?s=200&v=4",
    github: "https://github.com/grafana/grafana",
    website: "https://grafana.com",
    demo: "https://play.grafana.org",
    preview: "https://grafana.com/static/img/screenshots/grafana_8_dashboard.png",
    accentColor: "hsl(var(--primary))",
    stars: "64k",
  },
  {
    id: 8,
    slug: "appwrite",
    name: "Appwrite",
    tagline: "Backend-as-a-Service platform",
    description:
      "Open-source backend server for web, mobile & Flutter developers. Auth, database, storage, cloud functions in one platform.",
    category: "Business",
    tags: ["Database", "Self-hosted", "Open Source"],
    price: 30000,
    priceLabel: "Rp 30.000",
    logo: "https://avatars.githubusercontent.com/u/25003669?s=200&v=4",
    github: "https://github.com/appwrite/appwrite",
    website: "https://appwrite.io",
    demo: "https://cloud.appwrite.io",
    preview: "https://appwrite.io/og.png",
    accentColor: "hsl(var(--primary))",
    stars: "44k",
  },
];

const TAG_COLORS: Record<string, string> = {
  Automation: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  Integration: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
  "Open Source": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  "Self-hosted": "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  "WhatsApp API": "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  Messaging: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800",
  Deployment: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
  Monitoring: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
  Chatbot: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
  "No-code": "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800",
  Analytics: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800",
  Database: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function TagPill({
  tag,
  active,
  onClick,
}: {
  tag: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const color = TAG_COLORS[tag] ?? "bg-muted text-muted-foreground border-border";
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all
        ${active ? "bg-primary text-primary-foreground border-primary" : color}
        ${onClick ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
    >
      {tag}
    </button>
  );
}

function AppLogo({ src, name }: { src: string; name: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
        {name[0]}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setErr(true)}
      className="h-11 w-11 shrink-0 rounded-xl border border-border bg-background object-cover"
    />
  );
}

function PreviewThumb({ src, name, demo }: { src: string; name: string; demo: string }) {
  const [err, setErr] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative h-36 shrink-0 overflow-hidden bg-muted/30 sm:h-40"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {err ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
          <Monitor className="h-8 w-8 opacity-30" />
          <span className="text-xs opacity-50">{name}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={`${name} preview`}
          onError={() => setErr(true)}
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
      )}
      {/* Hover overlay — must be <button>, not <a>, because this is nested inside a <Link> (<a>) */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity duration-200 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(demo, "_blank", "noopener,noreferrer");
          }}
          className="flex items-center gap-1.5 rounded-xl bg-background px-4 py-2 text-xs font-semibold text-foreground shadow hover:bg-muted transition-colors"
        >
          <Globe className="h-3.5 w-3.5" /> Lihat Demo
        </button>
      </div>
    </div>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────────────
function TemplateCard({ t }: { t: AppTemplate }) {
  return (
    <Link href={`/apps/${t.slug}`} className="group block">
      <Card className="flex h-full flex-col overflow-hidden border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
        {/* Preview */}
        <div className="relative overflow-hidden">
          <PreviewThumb src={t.preview} name={t.name} demo={t.demo} />
          <span className="absolute right-2.5 top-2.5 rounded-full border border-border bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-foreground shadow-sm backdrop-blur-sm">
            {t.category}
          </span>
        </div>

        {/* Body */}
        <CardHeader className="px-4 pb-2 pt-4">
          <div className="flex items-start gap-3">
            <AppLogo src={t.logo} name={t.name} />
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-bold text-sm text-foreground">{t.name}</h3>
              <p className="truncate text-[11px] text-muted-foreground mt-0.5">{t.tagline}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 px-4 pb-3">
          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {t.description}
          </p>
          <div className="flex flex-wrap gap-1">
            {t.tags.map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="flex items-center justify-between px-4 py-3">
          <div>
            <span className="font-extrabold text-sm text-foreground">{t.priceLabel}</span>
            <span className="ml-1 text-[11px] text-muted-foreground">/bln</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(t.github, "_blank", "noopener,noreferrer");
              }}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="GitHub"
            >
              <Github className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(t.website, "_blank", "noopener,noreferrer");
              }}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Website Resmi"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
            <Button size="sm" className="h-7 gap-1 rounded-lg px-3 text-[11px]">
              Deploy <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

// ─── List Item ────────────────────────────────────────────────────────────────
function TemplateListItem({ t }: { t: AppTemplate }) {
  return (
    <Link href={`/apps/${t.slug}`} className="group block">
      <Card className="overflow-hidden border-border transition-all duration-200 hover:shadow-md">
        <div className="flex flex-col sm:flex-row">
          {/* Thumb */}
          <div className="relative h-36 sm:h-auto sm:w-48 shrink-0 overflow-hidden">
            <PreviewThumb src={t.preview} name={t.name} demo={t.demo} />
          </div>
          {/* Content */}
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <AppLogo src={t.logo} name={t.name} />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-sm text-foreground">{t.name}</h3>
                    <Badge variant="secondary" className="h-4 px-1.5 py-0 text-[10px]">
                      {t.category}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{t.tagline}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                <div>
                  <span className="font-extrabold text-sm text-foreground">{t.priceLabel}</span>
                  <span className="ml-1 text-[10px] text-muted-foreground">/bln</span>
                </div>
                <Button size="sm" className="h-7 gap-1 rounded-lg px-3 text-[11px] whitespace-nowrap">
                  Deploy Now <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <p className="hidden text-xs leading-relaxed text-muted-foreground line-clamp-1 sm:block">
              {t.description}
            </p>

            <div className="flex flex-wrap gap-1">
              {t.tags.map((tag) => (
                <TagPill key={tag} tag={tag} />
              ))}
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(t.github, "_blank", "noopener,noreferrer");
                }}
                className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground font-medium"
              >
                <Github className="h-3 w-3" /> GitHub
              </button>
              <span className="text-border">|</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(t.website, "_blank", "noopener,noreferrer");
                }}
                className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground font-medium"
              >
                <ExternalLink className="h-3 w-3" /> Website Resmi
              </button>
              <span className="text-border">|</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(t.demo, "_blank", "noopener,noreferrer");
                }}
                className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium transition-colors"
              >
                <Globe className="h-3 w-3" /> Live Demo
              </button>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// ─── Sidebar Content ──────────────────────────────────────────────────────────
function SidebarContent({
  activeCategory,
  setActiveCategory,
  activeTags,
  toggleTag,
  priceRange,
  setPriceRange,
  onClear,
}: {
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  activeTags: string[];
  toggleTag: (t: string) => void;
  priceRange: number;
  setPriceRange: (n: number) => void;
  onClear: () => void;
}) {
  const hasFilter =
    activeCategory !== "All" || activeTags.length > 0 || priceRange < 100000;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="font-bold text-sm text-foreground uppercase tracking-wide">Filter</p>
        {hasFilter && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <X className="h-3 w-3" /> Reset
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Kategori
        </p>
        <div className="flex flex-col gap-0.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Tags */}
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Tags
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TAGS_ALL.map((tag) => (
            <TagPill
              key={tag}
              tag={tag}
              active={activeTags.includes(tag)}
              onClick={() => toggleTag(tag)}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* Price */}
      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Harga Maks.
        </p>
        <input
          type="range"
          min={10000}
          max={100000}
          step={5000}
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="mt-1.5 flex justify-between">
          <span className="text-xs text-muted-foreground">Rp 10.000</span>
          <span className="text-xs font-bold text-primary">
            Rp {priceRange.toLocaleString("id-ID")}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AppsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState(100000);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const toggleTag = (tag: string) =>
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const clearFilters = () => {
    setActiveCategory("All");
    setActiveTags([]);
    setPriceRange(100000);
  };

  const filtered = TEMPLATES.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tagline.toLowerCase().includes(q);
    const matchCat = activeCategory === "All" || t.category === activeCategory;
    const matchTags =
      activeTags.length === 0 || activeTags.every((tag) => t.tags.includes(tag));
    const matchPrice = t.price <= priceRange;
    return matchSearch && matchCat && matchTags && matchPrice;
  });

  const activeCount =
    (activeCategory !== "All" ? 1 : 0) +
    activeTags.length +
    (priceRange < 100000 ? 1 : 0);

  return (
    <div className="bg-background">
      {/* ── Hero ── */}
      <section className="border-b bg-linear-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-5xl px-4 text-center pb-16 pt-32">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Layers className="h-3.5 w-3.5" />
            Application Templates
          </div>
          <h1 className="mb-3 font-extrabold text-3xl tracking-tight md:text-4xl lg:text-5xl">
            Deploy Aplikasi
            <br className="hidden sm:block" /> dalam Hitungan Detik
          </h1>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground md:text-base">
            Pilih dari koleksi template aplikasi siap pakai. Satu klik untuk
            deploy ke infrastruktur Anda.
          </p>
        </div>
      </section>

      {/* ── Sticky search bar ── */}
      <div className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          {/* Mobile filter sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="relative flex shrink-0 items-center gap-2 rounded-xl lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter
                {activeCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {activeCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-5">
              <SheetHeader className="mb-5">
                <SheetTitle className="text-left">Filter Templates</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-100px)] pr-2">
                <SidebarContent
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  activeTags={activeTags}
                  toggleTag={toggleTag}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  onClear={clearFilters}
                />
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari template aplikasi..."
              className="h-10 rounded-xl pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex shrink-0 items-center gap-0.5 rounded-xl bg-muted p-1">
            <Toggle
              pressed={viewMode === "grid"}
              onPressedChange={() => setViewMode("grid")}
              className="h-8 w-8 rounded-lg p-0 data-[state=on]:bg-background data-[state=on]:shadow-sm"
              aria-label="Grid view"
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </Toggle>
            <Toggle
              pressed={viewMode === "list"}
              onPressedChange={() => setViewMode("list")}
              className="h-8 w-8 rounded-lg p-0 data-[state=on]:bg-background data-[state=on]:shadow-sm"
              aria-label="List view"
            >
              <List className="h-3.5 w-3.5" />
            </Toggle>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Active filter pills */}
        {activeCount > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Aktif:</span>
            {activeCategory !== "All" && (
              <button
                onClick={() => setActiveCategory("All")}
                className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                {activeCategory} <X className="h-3 w-3" />
              </button>
            )}
            {activeTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
              >
                {tag} <X className="h-3 w-3" />
              </button>
            ))}
            {priceRange < 100000 && (
              <button
                onClick={() => setPriceRange(100000)}
                className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
              >
                ≤ Rp {priceRange.toLocaleString("id-ID")} <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        <div className="flex gap-6 items-start">
          {/* ── Desktop sidebar ── */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-5 shadow-sm">
              <SidebarContent
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                activeTags={activeTags}
                toggleTag={toggleTag}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                onClear={clearFilters}
              />
            </div>
          </aside>

          {/* ── Results ── */}
          <main className="min-w-0 flex-1">
            <p className="mb-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
              template ditemukan
            </p>

            {filtered.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">
                <Search className="mx-auto mb-3 h-10 w-10 opacity-20" />
                <p className="text-sm font-medium">Tidak ada template yang cocok.</p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Reset semua filter
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((t) => (
                  <TemplateCard key={t.id} t={t} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((t) => (
                  <TemplateListItem key={t.id} t={t} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <section className="mt-10 border-t bg-primary/5">
        <div className="mx-auto max-w-5xl px-4 py-10 text-center md:py-12">
          <h2 className="mb-2 font-bold text-xl md:text-2xl">
            Tidak menemukan yang Anda cari?
          </h2>
          <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
            Hubungi tim kami dan kami akan membantu menyiapkan template khusus
            sesuai kebutuhan Anda.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto">
              Request Template
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