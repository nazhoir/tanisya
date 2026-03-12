"use client";

import {
  BadgePercent,
  BookOpen,
  ChevronRight,
  Layers,
  Menu,
  Phone,
  Star,
  Wrench,
  LayoutTemplate,
  Server,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import Logo from "./logo";
import { Badge } from "@tanisya/ui/components/badge";
import { Button } from "@tanisya/ui/components/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@tanisya/ui/components/sheet";
import { cn } from "@tanisya/ui/lib/utils";
import { PRODUCT_ITEMS } from "@/constant/products";
import { OSS_PROJECTS } from "@/constant/oss";
import { RESOURCES_CONTENTS } from "@/constant/resources-contents";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type MenuKey = "produk" | "opensource" | "sumberdaya";

// ─────────────────────────────────────────────────────────────────────────────
// Small reusable atoms
// ─────────────────────────────────────────────────────────────────────────────

/** Colored pill badge shown next to nav items (Baru, Promo, Populer, …) */
function NavBadge({ label }: { label: string }) {
  return (
    <Badge
      className={cn(
        "h-4 shrink-0 px-1.5 py-0 text-[9px] font-bold",
        label === "Promo"       && "animate-pulse bg-primary",
        label === "Baru"        && "bg-emerald-500 hover:bg-emerald-500",
        label === "BARU"        && "bg-emerald-500 hover:bg-emerald-500",
        label === "Populer"     && "bg-orange-500  hover:bg-orange-500",
        label === "Open Source" && "bg-violet-500  hover:bg-violet-500",
        label === "Segera"      && "bg-muted text-muted-foreground hover:bg-muted",
      )}
    >
      {label}
    </Badge>
  );
}

/** Section heading inside dropdown panels */
function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

/** Single item row inside dropdown panel */
function DropdownItem({
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

/** Highlighted (gradient) product card in the product panel */
function HighlightedCard({
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
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary/90 to-primary/60 p-5 text-primary-foreground transition-all hover:shadow-xl hover:shadow-primary/20"
    >
      {/* decorative blobs */}
      <span className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <span className="pointer-events-none absolute -bottom-4 left-0 h-16 w-16 rounded-full bg-white/10 blur-xl" />

      <span className="relative mb-auto">
        <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
          <Icon className="h-5 w-5" />
        </span>
        <span className="mb-1 flex items-center gap-2">
          <span className="text-base font-extrabold">{label}</span>
          {badge && (
            <span className="rounded-full bg-white/25 px-2 py-0.5 text-[9px] font-bold tracking-wide">
              {badge}
            </span>
          )}
        </span>
        <p className="text-[12px] leading-relaxed text-primary-foreground/80">{description}</p>
      </span>

      <span className="relative mt-4 inline-flex items-center gap-1.5 text-xs font-bold transition-all group-hover:gap-2.5">
        Selengkapnya <ChevronRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tabbed product panel (Produk dropdown)
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_ICONS = [Server, Layers, LayoutTemplate, Wrench];

function ProductPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const activeCategory = PRODUCT_ITEMS[activeTab];

  // Find the single highlighted item to show in the right column
  const highlighted = PRODUCT_ITEMS.flatMap((c) => c.items).find((i) => i.isHiglighted);

  return (
    <div className="flex min-h-80 gap-0">
      {/* Left: category tabs */}
      <div className="mr-4 flex w-56 shrink-0 flex-col gap-1 border-r border-border/60 pr-4">
        <ColumnHeading>Kategori</ColumnHeading>
        {PRODUCT_ITEMS.map((cat, idx) => {
          const Icon = CATEGORY_ICONS[idx] ?? Layers;
          const isActive = activeTab === idx;
          return (
            <button
              key={cat.category}
              type="button"
              onMouseEnter={() => setActiveTab(idx)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold outline-none transition-all hover:bg-accent",
                isActive && "bg-primary/10 text-primary",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="leading-tight">{cat.category}</span>
              {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-primary" />}
            </button>
          );
        })}
      </div>

      {/* Right: items grid + highlighted card */}
      <div className="flex min-w-0 flex-1 gap-6">
        <div className="min-w-0 flex-1">
          <ColumnHeading>{activeCategory.category}</ColumnHeading>
          <div className="grid grid-cols-2 gap-0.5">
            {activeCategory.items.map((item) => (
              <DropdownItem key={item.to} {...item} />
            ))}
          </div>
        </div>

        {highlighted && (
          <div className="w-48 shrink-0">
            <HighlightedCard {...highlighted} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dropdown panel wrapper
// ─────────────────────────────────────────────────────────────────────────────

function DropdownPanel({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div
      aria-hidden={!open}
      className={cn(
        "absolute left-0 top-full z-50 w-screen border-b border-border/60 bg-background",
        "origin-top transition-all duration-200",
        open ? "pointer-events-auto scale-y-100 opacity-100" : "pointer-events-none scale-y-95 opacity-0",
      )}
    >
      <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Desktop nav trigger button
// ─────────────────────────────────────────────────────────────────────────────

function NavTrigger({
  label,
  isOpen,
  onMouseEnter,
  onMouseLeave,
}: {
  label: string;
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <button
      type="button"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "inline-flex h-9 items-center gap-1 rounded-md px-4 py-2 text-sm font-medium outline-none transition-colors",
        "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent",
        isOpen && "bg-accent text-accent-foreground",
      )}
    >
      {label}
      <ChevronRight
        className={cn(
          "h-3.5 w-3.5 rotate-90 transition-transform duration-200",
          isOpen && "-rotate-90",
        )}
      />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile helpers
// ─────────────────────────────────────────────────────────────────────────────

function MobileSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 mt-4 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

function MobileNavItem({
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
  const isActive = pathname === to;

  return (
    <Link
      href={to as any}
      onClick={onClose}
      className={cn(
        "flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors",
        isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
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
          <span className="block truncate text-[11px] text-muted-foreground">{description}</span>
        )}
      </span>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Promo animated pill
// ─────────────────────────────────────────────────────────────────────────────

function PromoPill() {
  return (
    <Link
      href="/promo"
      className="group relative hidden xl:inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 text-xs font-bold text-primary transition-all hover:border-primary/60 hover:bg-primary/10"
    >
      {/* shimmer sweep */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-linear-to-r from-transparent via-primary/10 to-transparent" />
      <BadgePercent className="h-3.5 w-3.5 shrink-0" />
      Promo Aktif
      <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Header
// ─────────────────────────────────────────────────────────────────────────────

export default function Header() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  // Which dropdown is currently open (desktop)
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);

  // Whether the user has scrolled down (drives bg transparency)
  const [scrolled, setScrolled] = useState(false);

  // Mobile sheet state
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Scroll detection ──────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Close dropdown when clicking outside header ───────────────────────────
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // ── Close dropdown on route change ───────────────────────────────────────
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  // ── Hover handlers for desktop nav ───────────────────────────────────────
  const openDropdown  = (key: MenuKey) => setOpenMenu(key);
  const closeDropdown = () => setOpenMenu(null);

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>

      <header
        ref={headerRef}
        className={cn(
          "fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300",
          // Transparent at top, solid background after scroll
          scrolled
            ? "border-border/50 bg-background/95 shadow-sm backdrop-blur-md"
            : "border-transparent bg-transparent",
        )}
      >
        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2">
          <Logo />

          {/* Desktop navigation */}
          <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
            <Link
              href="/"
              className={cn(
                "inline-flex h-9 items-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === "/" && "font-semibold text-primary",
              )}
            >
              Beranda
            </Link>

            {/* Each NavTrigger opens its panel on hover */}
            <NavTrigger
              label="Produk"
              isOpen={openMenu === "produk"}
              onMouseEnter={() => openDropdown("produk")}
              onMouseLeave={closeDropdown}
            />
            <NavTrigger
              label="Open Source"
              isOpen={openMenu === "opensource"}
              onMouseEnter={() => openDropdown("opensource")}
              onMouseLeave={closeDropdown}
            />
            <NavTrigger
              label="Sumber Daya"
              isOpen={openMenu === "sumberdaya"}
              onMouseEnter={() => openDropdown("sumberdaya")}
              onMouseLeave={closeDropdown}
            />
          </nav>

          <div className="flex items-center gap-2">
            <PromoPill />
            <ModeToggle />
            <UserMenu />

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden" aria-label="Buka menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex w-75 flex-col p-0">
                {/* Mobile sheet header */}
                <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
                  <Logo />
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </SheetClose>
                </div>

                {/* Mobile sheet body */}
                <div className="flex-1 overflow-y-auto p-3">
                  <MobileNavItem to="/" label="Beranda" icon={Star} onClose={() => setMobileOpen(false)} />

                  {/* Products grouped by category */}
                  {PRODUCT_ITEMS.map((group) => (
                    <div key={group.category}>
                      <MobileSectionLabel>{group.category}</MobileSectionLabel>
                      {group.items.map((item) => (
                        <MobileNavItem key={item.to} {...item} onClose={() => setMobileOpen(false)} />
                      ))}
                    </div>
                  ))}

                  {/* Open source */}
                  <MobileSectionLabel>Open Source</MobileSectionLabel>
                  {OSS_PROJECTS[0]?.items.map((item) => (
                    <MobileNavItem key={item.to} {...item} onClose={() => setMobileOpen(false)} />
                  ))}

                  {/* Resources */}
                  {RESOURCES_CONTENTS.map((section) => (
                    <div key={section.category}>
                      <MobileSectionLabel>{section.category}</MobileSectionLabel>
                      {section.items.map((item) => (
                        <MobileNavItem
                          key={item.to}
                          to={item.to}
                          label={item.label}
                          icon={BookOpen}
                          description={item.description}
                          onClose={() => setMobileOpen(false)}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Mobile sheet footer */}
                <div className="shrink-0 space-y-2 border-t p-3">
                  <Link href="/promo" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full gap-2 border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10">
                      <BadgePercent className="h-3.5 w-3.5" /> Lihat Promo Aktif
                    </Button>
                  </Link>
                  <Link href="/contact" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Phone className="h-3.5 w-3.5" /> Hubungi Sales
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* ── Dropdown panels ──────────────────────────────────────────────── */}

        {/*
          Each panel wraps its content in a <div> that has its own
          onMouseEnter/onMouseLeave so hovering the panel itself keeps it open.
        */}

        {/* Panel: Produk */}
        <div
          onMouseEnter={() => openDropdown("produk")}
          onMouseLeave={closeDropdown}
        >
          <DropdownPanel open={openMenu === "produk"}>
            <ProductPanel />
          </DropdownPanel>
        </div>

        {/* Panel: Open Source */}
        <div
          onMouseEnter={() => openDropdown("opensource")}
          onMouseLeave={closeDropdown}
        >
          <DropdownPanel open={openMenu === "opensource"}>
            <div className="grid grid-cols-[1fr_auto] gap-8">
              {/* Items grid */}
              <div>
                <ColumnHeading>Proyek Open Source</ColumnHeading>
                <div className="grid grid-cols-2 gap-0.5">
                  {OSS_PROJECTS[0]?.items.map((item) => (
                    <Link
                      key={item.to}
                      href={item.to as any}
                      className="group flex items-start gap-3 rounded-xl p-2.5 outline-none transition-colors hover:bg-accent focus-visible:bg-accent"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white dark:bg-violet-950 dark:text-violet-400">
                        <item.icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="mb-0.5 flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-semibold leading-tight">{item.label}</span>
                          {item.badge && <NavBadge label={item.badge} />}
                          <span className="text-[10px] text-muted-foreground">— {item.category}</span>
                        </span>
                        <span className="line-clamp-1 block text-[11px] leading-snug text-muted-foreground">
                          {item.description}
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

              {/* Callout card */}
              <div className="w-52 shrink-0">
                <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/40">
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
                    <Layers className="h-5 w-5" />
                  </span>
                  <p className="mb-1 text-sm font-bold">100% Open Source</p>
                  <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
                    Semua proyek tersedia di GitHub — gratis, transparan, dan terbuka untuk kontribusi.
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
        </div>

        {/* Panel: Sumber Daya */}
        <div
          onMouseEnter={() => openDropdown("sumberdaya")}
          onMouseLeave={closeDropdown}
        >
          <DropdownPanel open={openMenu === "sumberdaya"}>
            <div className="grid grid-cols-3 gap-8">
              {RESOURCES_CONTENTS.map((section) => (
                <div key={section.category}>
                  <ColumnHeading>{section.category}</ColumnHeading>
                  <div className="flex flex-col gap-0.5">
                    {section.items.map((item) => (
                      <DropdownItem key={item.to} {...item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DropdownPanel>
        </div>
      </header>

      {/* Backdrop — closes dropdown when clicking outside */}
      {openMenu !== null && (
        <div
          aria-hidden
          className="fixed inset-0 z-40 bg-background/50 backdrop-blur-xl"
          onClick={closeDropdown}
        />
      )}
    </>
  );
}