"use client";

import {
  BadgePercent,
  BookOpen,
  Building2,
  ChevronRight,
  FileText,
  Globe,
  GraduationCap,
  HardDrive,
  Heart,
  KeyRound,
  Layers,
  LayoutDashboard,
  LayoutTemplate,
  Lock,
  Mail,
  Menu,
  Monitor,
  Newspaper,
  PenTool,
  Phone,
  RefreshCw,
  Rocket,
  Server,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Users,
  Wallet,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { Badge } from "@tanisya/ui/components/badge";
import { Button } from "@tanisya/ui/components/button";
import { Separator } from "@tanisya/ui/components/separator";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@tanisya/ui/components/sheet";
import { cn } from "@tanisya/ui/lib/utils";
import Logo from "./logo";
import { PRODUCT_ITEMS } from "@/constant/products";
import { OSS_PROJECTS } from "@/constant/oss";
import { RESOURCES_CONTENTS } from "@/constant/resources-contents";


// ─── Shared atoms ─────────────────────────────────────────────────────────────

function NavBadge({ label }: { label: string }) {
  return (
    <Badge
      className={cn(
        "h-4 shrink-0 px-1.5 py-0 text-[9px] font-bold",
        label === "Promo" && "animate-pulse bg-primary",
        label === "Baru" && "bg-emerald-500 hover:bg-emerald-500",
        label === "BARU" && "bg-emerald-500 hover:bg-emerald-500",
        label === "Populer" && "bg-orange-500  hover:bg-orange-500",
        label === "Open Source" && "bg-violet-500  hover:bg-violet-500",
        label === "Segera" && "bg-muted text-muted-foreground hover:bg-muted",
      )}
    >
      {label}
    </Badge>
  );
}

function ColHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

function DropItem({
  to,
  label,
  icon: Icon,
  description,
  badge,
}: {
  to: string;
  label: string;
  icon: React.ElementType;
  description: string;
  badge?: string | null;
}) {
  return (
    <Link
      href={to as any}
      className="group flex items-start gap-3 rounded-xl p-2.5 outline-none transition-colors hover:bg-accent focus-visible:bg-accent"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="mb-0.5 flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-semibold leading-tight">{label}</span>
          {badge && <NavBadge label={badge} />}
        </span>
        <span className="line-clamp-1 block text-[11px] leading-snug text-muted-foreground">
          {description}
        </span>
      </span>
    </Link>
  );
}

function HighlightedProductCard({
  to,
  label,
  icon: Icon,
  description,
  badge,
}: {
  to: string;
  label: string;
  icon: React.ElementType;
  description: string;
  badge?: string | null;
  isHiglighted: boolean;
}) {
  return (
    <Link
      href={to as any}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary/90 to-primary/60 p-5 text-primary-foreground transition-all hover:shadow-xl hover:shadow-primary/20"
    >
      <span className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <span className="pointer-events-none absolute -bottom-4 left-0 h-16 w-16 rounded-full bg-white/10 blur-xl" />
      <span className="relative mb-auto">
        <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
          <Icon className="h-5 w-5" />
        </span>
        <span className="mb-1 flex items-center gap-2">
          <span className="font-extrabold text-base">{label}</span>
          {badge && (
            <span className="rounded-full bg-white/25 px-2 py-0.5 text-[9px] font-bold tracking-wide">
              {badge}
            </span>
          )}
        </span>
        <p className="text-[12px] leading-relaxed text-primary-foreground/80">
          {description}
        </p>
      </span>
      <span className="relative mt-4 inline-flex items-center gap-1.5 text-xs font-bold transition-all group-hover:gap-2.5">
        Selengkapnya <ChevronRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

// ─── Tabbed Product Panel ──────────────────────────────────────────────────────

function TabbedProductPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const activeCategory = PRODUCT_ITEMS[activeTab];
  const highlightedProduct = PRODUCT_ITEMS.map((cat) => cat.items)
    .flat()
    .find((item) => item.isHiglighted);

  // Icons for each category tab
  const categoryIcons = [Server, Layers, LayoutTemplate, Wrench];

  return (
    <div className="flex gap-0 min-h-80">
      {/* Left: Tab buttons */}
      <div className="flex flex-col gap-1 w-60 shrink-0 border-r border-border/60 pr-4 mr-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2">
          Kategori
        </p>
        {PRODUCT_ITEMS.map((cat, idx) => {
          const CatIcon = categoryIcons[idx] ?? Layers;
          return (
            <button
              key={cat.category}
              type="button"
              onMouseEnter={() => setActiveTab(idx)}
              onClick={() => setActiveTab(idx)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl font-semibold px-3 py-2.5 text-left text-sm transition-all outline-none",
                "hover:bg-accent hover:text-accent-foreground",
                activeTab === idx
                  ? "bg-primary/10 text-primary"
                  : "text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                  activeTab === idx
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <CatIcon className="h-3.5 w-3.5" />
              </span>
              <span className="leading-tight">{cat.category}</span>
              {activeTab === idx && (
                <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Right: Items grid */}
      <div className="flex flex-1 gap-6 min-w-0">
        <div className="flex-1 min-w-0">
          <ColHeading>{activeCategory.category}</ColHeading>
          <div className="grid grid-cols-2 gap-0.5">
            {activeCategory.items.map((item) => (
              <DropItem key={item.to} {...item} />
            ))}
          </div>
        </div>

        {/* Highlighted card — only shown if exists and current tab matches */}
        {highlightedProduct && (
          <div className="w-48 shrink-0">
            <HighlightedProductCard {...highlightedProduct} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dropdown system ──────────────────────────────────────────────────────────

type MenuKey = "produk" | "layanan" | "opensource" | "sumberdaya" | null;

function DropdownPanel({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute left-0 top-full z-50 w-screen border-b border-border/60 bg-background",
        "transition-all duration-200 origin-top",
        open
          ? "opacity-100 scale-y-100 pointer-events-auto"
          : "opacity-0 scale-y-95 pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
    </div>
  );
}

function NavTrigger({
  label,
  active,
  onClick,
  onMouseEnter,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        "inline-flex h-9 items-center gap-1 rounded-md px-4 py-2 text-sm font-medium outline-none transition-colors",
        "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent",
        active && "bg-accent text-accent-foreground",
      )}
    >
      {label}
      <ChevronRight
        className={cn(
          "h-3.5 w-3.5 rotate-90 transition-transform duration-200",
          active && "rotate-270",
        )}
      />
    </button>
  );
}

// ─── Mobile helpers ───────────────────────────────────────────────────────────

function MobileSection({ label }: { label: string }) {
  return (
    <p className="mb-1 mt-4 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      {label}
    </p>
  );
}

function MobileItem({
  to,
  label,
  icon: Icon,
  description,
  badge,
  onClose,
}: {
  to: string;
  label: string;
  icon: React.ElementType;
  description?: string;
  badge?: string | null;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === to;
  return (
    <Link
      href={to as any}
      onClick={onClose}
      className={cn(
        "flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-foreground hover:bg-muted",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          active
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-medium">{label}</span>
          {badge && <NavBadge label={badge} />}
        </span>
        {description && (
          <span className="block truncate text-[11px] text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </Link>
  );
}

// ─── Promo pill ───────────────────────────────────────────────────────────────

function PromoPill() {
  return (
    <Link
      href="/promo"
      className="group relative hidden xl:inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 text-xs font-bold text-primary transition-all hover:border-primary/60 hover:bg-primary/10"
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-linear-to-r from-transparent via-primary/10 to-transparent" />
      <BadgePercent className="h-3.5 w-3.5 shrink-0" />
      Promo Aktif
      <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export default function Header() {
  const [open, setOpen] = useState<MenuKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node))
        setOpen(null);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setOpen(null);
  }, [pathname]);

  const toggle = (key: MenuKey) =>
    setOpen((prev) => (prev === key ? null : key));
  const hover = (key: MenuKey) => {
    if (open !== null) setOpen(key);
  };
  const close = () => setMobileOpen(false);

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(250%);  }
        }
      `}</style>

      <header
        ref={headerRef}
        className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-background"
      >
        {/* Top bar */}
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2">
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-0.5">
            <Link
              href="/"
              className={cn(
                "inline-flex h-9 items-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === "/" && "text-primary font-semibold",
              )}
            >
              Beranda
            </Link>
            <NavTrigger
              label="Produk"
              active={open === "produk"}
              onClick={() => toggle("produk")}
              onMouseEnter={() => hover("produk")}
            />
            <NavTrigger
              label="Open Source"
              active={open === "opensource"}
              onClick={() => toggle("opensource")}
              onMouseEnter={() => hover("opensource")}
            />
            <NavTrigger
              label="Sumber Daya"
              active={open === "sumberdaya"}
              onClick={() => toggle("sumberdaya")}
              onMouseEnter={() => hover("sumberdaya")}
            />
          </nav>

          <div className="flex items-center gap-2">
            <PromoPill />
            <ModeToggle />
            <UserMenu />

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-9 w-9"
                  aria-label="Buka menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex w-75 flex-col p-0">
                <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
                  <Logo />
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </SheetClose>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                  <MobileItem
                    to="/"
                    label="Beranda"
                    icon={Star}
                    onClose={close}
                  />

                  {/* Produk — grouped by category */}
                  {PRODUCT_ITEMS.map((products) => (
                    <div key={products.category}>
                      <MobileSection label={products.category} />
                      {products.items.map((s) => (
                        <MobileItem key={s.to} {...s} onClose={close} />
                      ))}
                    </div>
                  ))}

                  {/* Open Source */}
                  <MobileSection label="Open Source" />
                  {OSS_PROJECTS[0]?.items.map((s) => (
                    <MobileItem
                      key={s.to}
                      {...s}
                      badge={s.badge}
                      onClose={close}
                    />
                  ))}
                  {
                    RESOURCES_CONTENTS.map((s) => {
                      return (
                        <>
                          <MobileSection label={s.category} />
                          {s.items.map((item) => (
                            <MobileItem
                              key={item.to}
                              to={item.to}
                              label={item.label}
                              icon={BookOpen}
                              description={item.description}
                              onClose={close}
                            />
                          ))}
                        </>
                      )
                    })
                  }

                </div>

                <div className="shrink-0 space-y-2 border-t p-3">
                  <Link href="/promo" onClick={close}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full gap-2 border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                    >
                      <BadgePercent className="h-3.5 w-3.5" /> Lihat Promo Aktif
                    </Button>
                  </Link>
                  <Link href="/contact" onClick={close}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                    >
                      <Phone className="h-3.5 w-3.5" /> Hubungi Sales
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            PANEL 1 — PRODUK (Tabbed)
        ══════════════════════════════════════════════════ */}
        <DropdownPanel open={open === "produk"}>
          <TabbedProductPanel />
        </DropdownPanel>

        {/* ══════════════════════════════════════════════════
            PANEL 2 — OPEN SOURCE
        ══════════════════════════════════════════════════ */}
        <DropdownPanel open={open === "opensource"}>
          <div className="grid grid-cols-[1fr_auto] gap-8">
            <div>
              <ColHeading>Proyek Open Source</ColHeading>
              <div className="grid grid-cols-2 gap-0.5">
                {OSS_PROJECTS[0]?.items.map((app) => (
                  <Link
                    key={app.to}
                    href={app.to as any}
                    className="group flex items-start gap-3 rounded-xl p-2.5 outline-none transition-colors hover:bg-accent focus-visible:bg-accent"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white dark:bg-violet-950 dark:text-violet-400">
                      <app.icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="mb-0.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-semibold leading-tight">
                          {app.label}
                        </span>
                       {app.badge && <NavBadge label={app.badge} />}
                        <span className="text-[10px] text-muted-foreground">
                          — {app.category}
                        </span>
                      </span>
                      <span className="line-clamp-1 block text-[11px] leading-snug text-muted-foreground">
                        {app.description}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                href="/oss"
                className="mt-3 flex items-center gap-1 px-2 text-[11px] font-semibold text-primary hover:underline"
              >
                Lihat semua proyek <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="w-52 shrink-0">
              <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/40">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
                  <Layers className="h-5 w-5" />
                </span>
                <p className="mb-1 font-bold text-sm">100% Open Source</p>
                <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
                  Semua proyek tersedia di GitHub — gratis, transparan, dan
                  terbuka untuk kontribusi.
                </p>
                <Link
                  href="https://github.com/tanisya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:underline"
                >
                  GitHub kami <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </DropdownPanel>

        {/* ══════════════════════════════════════════════════
            PANEL 3 — SUMBER DAYA
        ══════════════════════════════════════════════════ */}
        <DropdownPanel open={open === "sumberdaya"}>
          <div className="grid grid-cols-3 gap-8">
            {RESOURCES_CONTENTS.map((section) => (
              <div key={section.category}>
                <ColHeading>{section.category}</ColHeading>
                <div className="flex flex-col gap-0.5">
                  {section.items.map((item) => (
                    <DropItem key={item.to} {...item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DropdownPanel>
      </header>

      {/* Backdrop */}
      {open !== null && (
        <div
          className="fixed inset-0 z-40 bg-background/50 backdrop-blur-xl"
          onClick={() => setOpen(null)}
          aria-hidden
        />
      )}
    </>
  );
}

           
    