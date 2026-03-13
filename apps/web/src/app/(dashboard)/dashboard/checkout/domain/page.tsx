"use client";

import * as React from "react";
import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Globe,
  Info,
  Lock,
  Package,
  Receipt,
  Shield,
  ShieldCheck,
  ShieldOff,
  ShoppingCart,
  Tag,
  Trash2,
  X,
  CreditCard,
  User,
  Mail,
  Phone,
  Server,
  Zap,
  Cloud,
  Plus,
  Minus,
  Settings,
  Copy,
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
import { Checkbox } from "@tanisya/ui/components/checkbox";
import { Label } from "@tanisya/ui/components/label";
import { Separator } from "@tanisya/ui/components/separator";
import { Switch } from "@tanisya/ui/components/switch";
import { Textarea } from "@tanisya/ui/components/textarea";
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
import { Badge } from "@tanisya/ui/components/badge";
import { orpc } from "@/utils/orpc";
import { formatIDR } from "@/lib/format-currency";
import { cn } from "@tanisya/ui/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = 1 | 2 | 3 | 5;
type ProductType = "domain" | "hosting" | "vps" | "ssl" | "email";

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  useAccountInfo: boolean;
}

interface DomainItem {
  type: "domain";
  id: string;
  domain: string;
  tld: string;
  price: number;
  priceRenew?: number;
  period: Period;
  whoisEnabled: boolean;
  sslPremium: boolean;
  contact: ContactInfo;
}

interface GenericItem {
  type: ProductType;
  id: string;
  name: string;
  description: string;
  price: number;
  period: Period;
  quantity: number;
}

type CartItem = DomainItem | GenericItem;

// ─── Mock account info ────────────────────────────────────────────────────────
const ACCOUNT_INFO = {
  name: "Budi Santoso",
  email: "budi@example.com",
  phone: "+62 812 3456 7890",
};

// ─── Xendit Fee Definitions ───────────────────────────────────────────────────

interface PaymentFee {
  pct: number;
  flat: number;
  vatInclusive: boolean;
  note?: string;
}

interface PaymentMethod {
  id: string;
  category: string;
  name: string;
  logoUrl: string;
  fee: PaymentFee;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "bca_va",
    category: "Virtual Accounts",
    name: "BCA",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg",
    fee: { pct: 0, flat: 4_000, vatInclusive: false, note: "Biaya admin Rp 4.000" },
  },
  {
    id: "bni_va",
    category: "Virtual Accounts",
    name: "BNI",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Bank_Negara_Indonesia_logo_%282004%29.svg/1920px-Bank_Negara_Indonesia_logo_%282004%29.svg.png",
    fee: { pct: 0, flat: 4_000, vatInclusive: false, note: "Biaya admin Rp 4.000" },
  },
  {
    id: "bri_va",
    category: "Virtual Accounts",
    name: "BRI",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/68/BANK_BRI_logo.svg",
    fee: { pct: 0, flat: 4_000, vatInclusive: false, note: "Biaya admin Rp 4.000" },
  },
  {
    id: "mandiri_va",
    category: "Virtual Accounts",
    name: "Mandiri",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg",
    fee: { pct: 0, flat: 4_000, vatInclusive: false, note: "Biaya admin Rp 4.000" },
  },
  {
    id: "bsi_va",
    category: "Virtual Accounts",
    name: "BSI",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Bank_Syariah_Indonesia.svg/1920px-Bank_Syariah_Indonesia.svg.png",
    fee: { pct: 0, flat: 4_000, vatInclusive: false, note: "Biaya admin Rp 4.000" },
  },
  {
    id: "cimb_va",
    category: "Virtual Accounts",
    name: "CIMB Niaga",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/CIMB_Niaga_logo.svg/1920px-CIMB_Niaga_logo.svg.png",
    fee: { pct: 0, flat: 4_000, vatInclusive: false, note: "Biaya admin Rp 4.000" },
  },
  {
    id: "permata_va",
    category: "Virtual Accounts",
    name: "PermataBank",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Permata_Bank_%282024%29.svg/1920px-Permata_Bank_%282024%29.svg.png",
    fee: { pct: 0, flat: 4_000, vatInclusive: false, note: "Biaya admin Rp 4.000" },
  },
  {
    id: "bjb_va",
    category: "Virtual Accounts",
    name: "Bank BJB",
    logoUrl: "https://upload.wikimedia.org/wikipedia/id/thumb/4/41/Bank_BJB_logo.svg/960px-Bank_BJB_logo.svg.png",
    fee: { pct: 0, flat: 4_000, vatInclusive: false, note: "Biaya admin Rp 4.000" },
  },
  {
    id: "sampoerna_va",
    category: "Virtual Accounts",
    name: "Bank Sampoerna",
    logoUrl: "https://upload.wikimedia.org/wikipedia/id/1/14/Bank_Sahabat_Sampoerna_logo.png",
    fee: { pct: 0, flat: 4_000, vatInclusive: false, note: "Biaya admin Rp 4.000" },
  },
  {
    id: "linkaja",
    category: "E-Wallet",
    name: "LinkAja",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/85/LinkAja.svg",
    fee: { pct: 1.5, flat: 0, vatInclusive: false, note: "MDR 1,5% + PPN 11%" },
  },
  {
    id: "ovo",
    category: "E-Wallet",
    name: "OVO",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg",
    fee: { pct: 1.5, flat: 0, vatInclusive: false, note: "MDR 1,5% + PPN 11%" },
  },
  {
    id: "shopeepay",
    category: "E-Wallet",
    name: "ShopeePay",
    logoUrl: "https://shopeepay.co.id/src/pages/home/assets/images/new-homepage/new-spp-logo.svg",
    fee: { pct: 1.8, flat: 0, vatInclusive: true, note: "MDR 1,8% (sudah inklusif PPN)" },
  },
  {
    id: "dana",
    category: "E-Wallet",
    name: "DANA",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg",
    fee: { pct: 1.5, flat: 0, vatInclusive: false, note: "MDR 1,5% + PPN 11%" },
  },
  {
    id: "gopay",
    category: "E-Wallet",
    name: "GoPay",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg",
    fee: { pct: 1.5, flat: 0, vatInclusive: false, note: "MDR 1,5% + PPN 11%" },
  },
  {
    id: "qris",
    category: "QR Code",
    name: "QRIS",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg",
    fee: { pct: 0.63, flat: 0, vatInclusive: true, note: "MDR 0,63% (sudah inklusif PPN)" },
  },
  {
    id: "indomaret",
    category: "Retail",
    name: "Indomaret",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Indomaret.svg/1920px-Indomaret.svg.png",
    fee: { pct: 0, flat: 8_325, vatInclusive: true, note: "Biaya Rp 7.500 + PPN 11%" },
  },
  {
    id: "alfamart",
    category: "Retail",
    name: "Alfamart",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Alfamart_logo.svg/1920px-Alfamart_logo.svg.png",
    fee: { pct: 0, flat: 8_325, vatInclusive: true, note: "Biaya Rp 7.500 + PPN 11%" },
  },
  {
    id: "visa",
    category: "Kartu Kredit",
    name: "Visa",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Visa_Inc._logo_%282021%E2%80%93present%29.svg/1920px-Visa_Inc._logo_%282021%E2%80%93present%29.svg.png",
    fee: { pct: 3.33, flat: 4_995, vatInclusive: true, note: "3% + Rp 4.500 (sudah inklusif PPN)" },
  },
  {
    id: "mastercard",
    category: "Kartu Kredit",
    name: "Mastercard",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1920px-Mastercard-logo.svg.png",
    fee: { pct: 3.33, flat: 4_995, vatInclusive: true, note: "3% + Rp 4.500 (sudah inklusif PPN)" },
  },
  {
    id: "jcb",
    category: "Kartu Kredit",
    name: "JCB",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/JCB_logo.svg/1920px-JCB_logo.svg.png",
    fee: { pct: 3.33, flat: 4_995, vatInclusive: true, note: "3% + Rp 4.500 (sudah inklusif PPN)" },
  },
  {
    id: "amex",
    category: "Kartu Kredit",
    name: "American Express",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1920px-American_Express_logo_%282018%29.svg.png",
    fee: { pct: 4.44, flat: 4_995, vatInclusive: true, note: "4% + Rp 4.500 (sudah inklusif PPN)" },
  },
];

const PAYMENT_CATEGORIES = ["Virtual Accounts", "E-Wallet", "QR Code", "Retail", "Kartu Kredit"];

// ─── Constants ────────────────────────────────────────────────────────────────

const WHOIS_UNSUPPORTED_TLDS = [
  ".id", ".co.id", ".my.id", ".web.id", ".biz.id",
  ".or.id", ".ac.id", ".sch.id", ".ponpes.id", ".go.id", ".mil.id",
];

const PERIOD_OPTIONS: { value: Period; label: string; discount?: string }[] = [
  { value: 1, label: "1 Tahun" },
  { value: 2, label: "2 Tahun", discount: "Hemat 5%" },
  { value: 3, label: "3 Tahun", discount: "Hemat 10%" },
  { value: 5, label: "5 Tahun", discount: "Hemat 15%" },
];

const PERIOD_DISCOUNT: Record<Period, number> = { 1: 0, 2: 0.05, 3: 0.10, 5: 0.15 };
const WHOIS_PROTECTION_PRICE = 25_000;
const SSL_PREMIUM_PRICE = 150_000;
const PPN_RATE = 0.11;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTld(fullName: string): string {
  const idx = fullName.indexOf(".");
  return idx !== -1 ? fullName.substring(idx) : "";
}
function supportsWhois(tld: string): boolean { return !WHOIS_UNSUPPORTED_TLDS.includes(tld); }
function parsePrice(raw: string): number { return parseInt(raw.replace(/\D/g, ""), 10) || 0; }

function calcTotalFee(method: PaymentMethod, subtotal: number): number {
  const rawFee = Math.ceil((subtotal * method.fee.pct) / 100) + method.fee.flat;
  if (method.fee.vatInclusive) return rawFee;
  return Math.ceil(rawFee * (1 + 0.11));
}

function calcDomainSubtotal(item: DomainItem): number {
  const discount   = PERIOD_DISCOUNT[item.period];
  const base       = item.price * item.period;
  const discounted = Math.round(base * (1 - discount));
  const whoisAmt   = supportsWhois(item.tld) && item.whoisEnabled ? WHOIS_PROTECTION_PRICE * item.period : 0;
  const sslAmt     = item.sslPremium ? SSL_PREMIUM_PRICE * item.period : 0;
  return discounted + whoisAmt + sslAmt;
}

function calcGenericSubtotal(item: GenericItem): number {
  const discount   = PERIOD_DISCOUNT[item.period];
  const base       = item.price * item.period * item.quantity;
  return Math.round(base * (1 - discount));
}

function getItemSubtotal(item: CartItem): number {
  if (item.type === "domain") return calcDomainSubtotal(item);
  return calcGenericSubtotal(item as GenericItem);
}

function productTypeIcon(type: ProductType): React.ReactNode {
  switch (type) {
    case "domain":  return <Globe className="h-4 w-4" />;
    case "hosting": return <Server className="h-4 w-4" />;
    case "vps":     return <Zap className="h-4 w-4" />;
    case "ssl":     return <Shield className="h-4 w-4" />;
    case "email":   return <Mail className="h-4 w-4" />;
    case "cloud":   return <Cloud className="h-4 w-4" />;
    default:        return <Package className="h-4 w-4" />;
  }
}

function productTypeBadgeColor(type: ProductType): string {
  switch (type) {
    case "domain":  return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";
    case "hosting": return "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400";
    case "vps":     return "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400";
    case "ssl":     return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400";
    case "email":   return "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400";
    default:        return "bg-gray-100 text-gray-700 dark:bg-gray-950/40 dark:text-gray-400";
  }
}

// ─── SearchParams Reader ──────────────────────────────────────────────────────

function SearchParamsReader({ onCart }: { onCart: (items: CartItem[]) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const raw = searchParams.get("cart");
    if (!raw) return;
    const items: CartItem[] = raw.split(",").map((entry) => {
      const [full, priceStr] = entry.split(":");
      if (!full || !priceStr) return null;
      const tld = getTld(full);
      const domain = full.substring(0, full.indexOf("."));
      return {
        type: "domain", id: full, domain, tld,
        price: parsePrice(priceStr), period: 1,
        whoisEnabled: false, sslPremium: false,
        contact: { name: "", email: "", phone: "", useAccountInfo: true },
      } as DomainItem;
    }).filter(Boolean) as CartItem[];
    if (items.length > 0) onCart(items);
  }, [searchParams]);
  return null;
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ icon, title, children, className }: {
  icon: React.ReactNode; title: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border/60 bg-card shadow-sm", className)}>
      <div className="flex items-center gap-2.5 border-b border-border/40 px-5 py-3.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Compact Period Selector ──────────────────────────────────────────────────

function CompactPeriodSelector({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PERIOD_OPTIONS.map((opt) => (
        <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
          className={cn(
            "flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all",
            value === opt.value
              ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/30"
              : "border-border bg-background hover:border-primary/30 hover:bg-muted/40",
          )}>
          {opt.label}
          {opt.discount && (
            <span className={cn(
              "rounded-full px-1 text-[9px] font-bold",
              value === opt.value ? "bg-primary/20 text-primary" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
            )}>{opt.discount}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Domain Contact Panel ─────────────────────────────────────────────────────

function DomainContactPanel({ contact, onChange }: {
  contact: ContactInfo;
  onChange: (c: ContactInfo) => void;
}) {
  const [open, setOpen] = React.useState(false);

  const handleUseAccount = (v: boolean) => {
    if (v) {
      onChange({ name: ACCOUNT_INFO.name, email: ACCOUNT_INFO.email, phone: ACCOUNT_INFO.phone, useAccountInfo: true });
    } else {
      onChange({ ...contact, useAccountInfo: false });
    }
  };

  const effectiveName  = contact.useAccountInfo ? ACCOUNT_INFO.name  : contact.name;
  const effectiveEmail = contact.useAccountInfo ? ACCOUNT_INFO.email : contact.email;
  const effectivePhone = contact.useAccountInfo ? ACCOUNT_INFO.phone : contact.phone;

  return (
    <div className="rounded-lg border border-border/40 bg-background overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2.5 hover:bg-muted/20 transition-colors">
        <div className="flex items-center gap-2 min-w-0">
          <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 text-left">
            <p className="text-xs font-semibold truncate">{effectiveName || "Informasi Kontak"}</p>
            <p className="text-[10px] text-muted-foreground truncate">{effectiveEmail || "Belum diisi"}</p>
          </div>
        </div>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="border-t border-border/30 p-3 space-y-3">
          {/* Use account switch */}
          <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold">Gunakan info akun</p>
                <p className="text-[10px] text-muted-foreground">{ACCOUNT_INFO.name} · {ACCOUNT_INFO.email}</p>
              </div>
            </div>
            <Switch checked={contact.useAccountInfo} onCheckedChange={handleUseAccount} />
          </div>

          {!contact.useAccountInfo && (
            <div className="space-y-2">
              <div>
                <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Nama Lengkap</Label>
                <Input type="text" placeholder="Nama registrant" value={contact.name}
                  onChange={(e) => onChange({ ...contact, name: e.target.value })}
                  className="mt-1 h-8 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Email</Label>
                  <Input type="email" placeholder="email@domain.com" value={contact.email}
                    onChange={(e) => onChange({ ...contact, email: e.target.value })}
                    className="mt-1 h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Telepon</Label>
                  <Input type="tel" placeholder="+62 812..." value={contact.phone}
                    onChange={(e) => onChange({ ...contact, phone: e.target.value })}
                    className="mt-1 h-8 text-xs" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Domain Item Card ─────────────────────────────────────────────────────────

function DomainItemCard({ item, onChange, onRemove }: {
  item: DomainItem;
  onChange: (updated: DomainItem) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = React.useState(true);
  const tldOk    = supportsWhois(item.tld);
  const discount = PERIOD_DISCOUNT[item.period];
  const base     = item.price * item.period;
  const discounted = Math.round(base * (1 - discount));
  const whoisAmt = tldOk && item.whoisEnabled ? WHOIS_PROTECTION_PRICE * item.period : 0;
  const sslAmt   = item.sslPremium ? SSL_PREMIUM_PRICE * item.period : 0;
  const subtotal = discounted + whoisAmt + sslAmt;

  return (
    <div className="rounded-xl border border-border/50 bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
          <Globe className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">
            <span>{item.domain}</span>
            <span className="text-muted-foreground">{item.tld}</span>
          </p>
          <p className="text-[11px] text-muted-foreground">Registrasi baru · {item.period} tahun</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <p className="text-sm font-bold">{formatIDR(subtotal)}</p>
          <button type="button" onClick={() => setExpanded((v) => !v)}
            className="text-muted-foreground hover:text-foreground transition-colors">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button type="button" onClick={onRemove}
            className="text-muted-foreground/50 hover:text-destructive transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expandable settings */}
      {expanded && (
        <div className="border-t border-border/30 px-4 py-3 space-y-3 bg-muted/10">

          {/* Period */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Periode</p>
            <CompactPeriodSelector value={item.period} onChange={(p) => onChange({ ...item, period: p })} />
            {discount > 0 && (
              <p className="mt-1 text-[11px] text-emerald-600">
                Hemat {formatIDR(Math.round(base * discount))} dari harga normal {formatIDR(base)}
              </p>
            )}
          </div>

          {/* Add-ons */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Add-on</p>
            <div className="space-y-2">
              {/* WHOIS Protection */}
              <div className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2.5 gap-3 transition-colors",
                !tldOk ? "border-border/30 bg-muted/20 opacity-60"
                  : item.whoisEnabled ? "border-primary/30 bg-primary/5" : "border-border/40 bg-background",
              )}>
                <div className="flex items-center gap-2 min-w-0">
                  {tldOk
                    ? (item.whoisEnabled ? <Shield className="h-4 w-4 shrink-0 text-primary" /> : <ShieldOff className="h-4 w-4 shrink-0 text-muted-foreground" />)
                    : <ShieldOff className="h-4 w-4 shrink-0 text-muted-foreground" />}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">
                      WHOIS Protection
                      {!tldOk && (
                        <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          Tidak tersedia untuk {item.tld}
                        </span>
                      )}
                    </p>
                    {tldOk
                      ? <p className="text-[11px] text-muted-foreground">Sembunyikan data WHOIS · <span className="font-medium">+{formatIDR(WHOIS_PROTECTION_PRICE)}/thn</span></p>
                      : <p className="text-[11px] text-muted-foreground">Registry {item.tld} mewajibkan data WHOIS publik</p>}
                  </div>
                </div>
                <Switch checked={tldOk && item.whoisEnabled}
                  onCheckedChange={tldOk ? (v) => onChange({ ...item, whoisEnabled: v }) : undefined}
                  disabled={!tldOk} />
              </div>

              {/* SSL Premium */}
              <div className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2.5 gap-3 transition-colors",
                item.sslPremium ? "border-emerald-300/50 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-950/20" : "border-border/40 bg-background",
              )}>
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className={cn("h-4 w-4 shrink-0", item.sslPremium ? "text-emerald-600" : "text-muted-foreground")} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">SSL Premium</p>
                    <p className="text-[11px] text-muted-foreground">Sertifikat SSL DV tervalidasi · <span className="font-medium">+{formatIDR(SSL_PREMIUM_PRICE)}/thn</span></p>
                  </div>
                </div>
                <Switch checked={item.sslPremium} onCheckedChange={(v) => onChange({ ...item, sslPremium: v })} />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Informasi Kontak Registrant</p>
            <DomainContactPanel contact={item.contact}
              onChange={(c) => onChange({ ...item, contact: c })} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Generic Item Card ────────────────────────────────────────────────────────

function GenericItemCard({ item, onChange, onRemove }: {
  item: GenericItem;
  onChange: (updated: GenericItem) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const subtotal = calcGenericSubtotal(item);
  const discount = PERIOD_DISCOUNT[item.period];

  return (
    <div className="rounded-xl border border-border/50 bg-background overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", productTypeBadgeColor(item.type))}>
          {productTypeIcon(item.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{item.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Quantity control */}
          <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/20">
            <button type="button" onClick={() => item.quantity > 1 && onChange({ ...item, quantity: item.quantity - 1 })}
              className="flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              disabled={item.quantity <= 1}>
              <Minus className="h-3 w-3" />
            </button>
            <span className="min-w-[20px] text-center text-xs font-bold">{item.quantity}</span>
            <button type="button" onClick={() => onChange({ ...item, quantity: item.quantity + 1 })}
              className="flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <p className="text-sm font-bold">{formatIDR(subtotal)}</p>
          <button type="button" onClick={() => setExpanded((v) => !v)}
            className="text-muted-foreground hover:text-foreground transition-colors">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button type="button" onClick={onRemove}
            className="text-muted-foreground/50 hover:text-destructive transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/30 px-4 py-3 bg-muted/10">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Periode</p>
          <CompactPeriodSelector value={item.period} onChange={(p) => onChange({ ...item, period: p })} />
          {discount > 0 && (
            <p className="mt-1 text-[11px] text-emerald-600">
              Diskon {Math.round(discount * 100)}% untuk periode {item.period} tahun diterapkan
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Promo Code ───────────────────────────────────────────────────────────────

function PromoCode({ applied, onApply, onRemove }: {
  applied: { code: string; discount: number } | null;
  onApply: (c: string) => void;
  onRemove: () => void;
}) {
  const [input, setInput] = React.useState("");
  const [open, setOpen]   = React.useState(false);
  const [error, setError] = React.useState("");

  const tryApply = (code: string) => {
    if (code.trim().toUpperCase() === "HEMAT10") {
      onApply(code.trim().toUpperCase());
      setError(""); setInput(""); setOpen(false);
    } else {
      setError("Kode promo tidak valid.");
    }
  };

  return (
    <div className="space-y-2">
      {applied ? (
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 dark:border-emerald-800/40 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-emerald-600" />
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              {applied.code}<span className="ml-1.5 font-normal">−{applied.discount}% diterapkan</span>
            </p>
          </div>
          <button type="button" onClick={onRemove} className="text-emerald-600 hover:text-destructive transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div>
          <button type="button" onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Tag className="h-3.5 w-3.5" />Punya kode promo?
            <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
          </button>
          {open && (
            <div className="mt-2 flex gap-2">
              <Input type="text" placeholder="Masukkan kode promo" value={input}
                onChange={(e) => { setInput(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && tryApply(input)}
                className={cn("h-8 flex-1 text-xs uppercase tracking-widest", error && "border-destructive")} />
              <Button size="sm" variant="outline" className="h-8 px-3 text-xs"
                disabled={!input.trim()} onClick={() => tryApply(input)}>
                Terapkan
              </Button>
            </div>
          )}
          {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Payment Method Selector ──────────────────────────────────────────────────

function PaymentMethodSelector({ selected, onChange }: {
  selected: string | null;
  onChange: (id: string) => void;
}) {
  const [openCat, setOpenCat] = React.useState<string>("Virtual Accounts");

  const grouped = PAYMENT_CATEGORIES.map((cat) => ({
    cat, methods: PAYMENT_METHODS.filter((m) => m.category === cat),
  }));

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === selected) ?? null;

  const catIcon: Record<string, React.ReactNode> = {
    "Virtual Accounts": <span className="text-[10px] font-extrabold">VA</span>,
    "E-Wallet":         <span className="text-[10px] font-extrabold">EW</span>,
    "QR Code":          <span className="text-[10px] font-extrabold">QR</span>,
    "Retail":           <span className="text-[10px] font-extrabold">RT</span>,
    "Kartu Kredit":     <CreditCard className="h-3 w-3" />,
  };

  return (
    <div className="space-y-3">
      {selectedMethod && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <div className="flex h-9 w-16 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-white px-2">
            <img src={selectedMethod.logoUrl} alt={selectedMethod.name}
              className="h-5 w-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{selectedMethod.name}</p>
            {/* <p className="text-xs text-muted-foreground">{selectedMethod.fee.note}</p> */}
          </div>
          <Badge variant="secondary" className="shrink-0 text-[10px]">Dipilih</Badge>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border/50 divide-y divide-border/40">
        {grouped.map(({ cat, methods }) => {
          const isOpen = openCat === cat;
          return (
            <div key={cat}>
              <button type="button" onClick={() => setOpenCat(isOpen ? "" : cat)}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-3 text-left transition-colors",
                  isOpen ? "bg-muted/40" : "bg-background hover:bg-muted/20",
                )}>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">{catIcon[cat]}</span>
                  <span className="text-sm font-semibold">{cat}</span>
                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">{methods.length}</Badge>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
              </button>

              {isOpen && (
                <div className="grid grid-cols-1 gap-px bg-border/30 sm:grid-cols-2">
                  {methods.map((method) => {
                    const isSelected = selected === method.id;
                    return (
                      <button key={method.id} type="button" onClick={() => onChange(method.id)}
                        className={cn(
                          "flex items-center gap-3 bg-card px-4 py-3 text-left transition-all hover:bg-muted/30",
                          isSelected && "bg-primary/5 ring-inset ring-1 ring-primary/30",
                        )}>
                        <div className="flex h-8 w-14 shrink-0 items-center justify-center rounded-md border border-border/40 bg-white px-1.5">
                          <img src={method.logoUrl} alt={method.name}
                            className="h-5 w-full object-contain"
                            onError={(e) => {
                              const t = e.target as HTMLImageElement;
                              t.style.display = "none";
                              if (t.parentElement)
                                t.parentElement.innerHTML = `<span class="text-[10px] font-bold text-gray-500 text-center leading-tight">${method.name}</span>`;
                            }} />
                        </div>
                        <span className="flex-1 text-xs font-semibold truncate">{method.name}</span>
                        {isSelected && <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Biaya transaksi sesuai kebijakan{" "}
          <a href="https://www.xendit.co/en-id/pricing/" target="_blank" rel="noopener noreferrer"
            className="font-medium underline underline-offset-2 hover:text-foreground">Xendit</a>.
          Rincian biaya ditampilkan di ringkasan pesanan setelah memilih metode.
        </p>
      </div>
    </div>
  );
}

// ─── Order Summary ────────────────────────────────────────────────────────────
//
// Formula:
//   subtotalProduk = Σ item subtotals
//   promoDisc      = subtotalProduk × promoRate
//   afterPromo     = subtotalProduk − promoDisc
//   ppn            = afterPromo × 11%
//   subtotalPajak  = afterPromo + ppn
//   paymentFee     = total fee sudah inklusif PPN (semua fee di PAYMENT_METHODS sudah dinormalisasi)
//   grandTotal     = subtotalPajak + paymentFee

function OrderSummary({
  items, promoCode, paymentMethodId,
  onPromoApply, onPromoRemove,
  agreePrivacy, onAgreeChange,
  onSubmit, isSubmitting,
}: {
  items: CartItem[];
  promoCode: { code: string; discount: number } | null;
  paymentMethodId: string | null;
  onPromoApply: (c: string) => void;
  onPromoRemove: () => void;
  agreePrivacy: boolean;
  onAgreeChange: (v: boolean) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  // 1. Subtotal produk
  const subtotalProduk = items.reduce((sum, item) => sum + getItemSubtotal(item), 0);

  // 2. Diskon promo
  const promoDisc  = promoCode ? Math.round(subtotalProduk * (promoCode.discount / 100)) : 0;

  // 3. Setelah promo
  const afterPromo = subtotalProduk - promoDisc;

  // 4. PPN
  const ppn        = Math.round(afterPromo * PPN_RATE);

  // 5. Subtotal setelah pajak
  const subtotalPajak = afterPromo + ppn;

  // 6. Biaya payment (sudah inklusif PPN semua — normalisasi dilakukan di calcTotalFee)
  const selectedMethod = paymentMethodId
    ? (PAYMENT_METHODS.find((m) => m.id === paymentMethodId) ?? null)
    : null;
  const paymentFeeTotal = selectedMethod ? calcTotalFee(selectedMethod, subtotalPajak) : 0;

  // 7. Grand total
  const grandTotal = subtotalPajak + paymentFeeTotal;

  // Group items by type for summary display
  const domainItems   = items.filter((i) => i.type === "domain") as DomainItem[];
  const genericItems  = items.filter((i) => i.type !== "domain") as GenericItem[];

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-border/40 px-5 py-3.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Receipt className="h-3.5 w-3.5" />
        </span>
        <p className="text-sm font-semibold">Ringkasan Pesanan</p>
      </div>

      <div className="p-5 space-y-4">
        {/* Line items */}
        <div className="space-y-2.5">
          {domainItems.map((item) => {
            const full         = `${item.domain}${item.tld}`;
            const discount     = PERIOD_DISCOUNT[item.period];
            const base         = item.price * item.period;
            const domainPrice  = Math.round(base * (1 - discount));
            const whoisAmt     = supportsWhois(item.tld) && item.whoisEnabled ? WHOIS_PROTECTION_PRICE * item.period : 0;
            const sslAmt       = item.sslPremium ? SSL_PREMIUM_PRICE * item.period : 0;
            return (
              <div key={full} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Globe className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                    <span className="font-mono font-medium truncate max-w-[140px]">{full}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{item.period}thn</span>
                  </div>
                  <span className="font-semibold shrink-0">{formatIDR(domainPrice)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-[11px] pl-5">
                    <span className="text-emerald-600">Diskon {Math.round(discount * 100)}%</span>
                    <span className="text-emerald-600">−{formatIDR(Math.round(base * discount))}</span>
                  </div>
                )}
                {whoisAmt > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pl-5">
                    <span>+ WHOIS Protection</span><span>{formatIDR(whoisAmt)}</span>
                  </div>
                )}
                {sslAmt > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pl-5">
                    <span>+ SSL Premium</span><span>{formatIDR(sslAmt)}</span>
                  </div>
                )}
              </div>
            );
          })}

          {genericItems.map((item) => {
            const discount = PERIOD_DISCOUNT[item.period];
            const base     = item.price * item.period * item.quantity;
            const subtotal = calcGenericSubtotal(item);
            return (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={cn("shrink-0", productTypeBadgeColor(item.type))}>{productTypeIcon(item.type)}</span>
                    <span className="font-medium truncate max-w-[130px]">{item.name}</span>
                    {item.quantity > 1 && <span className="text-[10px] text-muted-foreground shrink-0">×{item.quantity}</span>}
                  </div>
                  <span className="font-semibold shrink-0">{formatIDR(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-[11px] pl-5">
                    <span className="text-emerald-600">Diskon {Math.round(discount * 100)}%</span>
                    <span className="text-emerald-600">−{formatIDR(Math.round(base * discount))}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Separator />
        <PromoCode applied={promoCode} onApply={onPromoApply} onRemove={onPromoRemove} />
        {promoDisc > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-emerald-700 dark:text-emerald-400">Diskon promo ({promoCode?.code})</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">−{formatIDR(promoDisc)}</span>
          </div>
        )}

        <Separator />

        {/* Subtotal + PPN */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Subtotal produk</span>
            <span>{formatIDR(afterPromo)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>PPN 11%</span>
            <span>{formatIDR(ppn)}</span>
          </div>
          <div className="flex items-center justify-between text-sm font-semibold border-t border-border/30 pt-1.5">
            <span>Subtotal</span>
            <span>{formatIDR(subtotalPajak)}</span>
          </div>
        </div>

        {/* Biaya payment — ditampilkan sebagai satu angka sudah inklusif PPN */}
        {selectedMethod && (
          <>
            <Separator />
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Biaya transaksi ({selectedMethod.name})</span>
                {paymentFeeTotal === 0
                  ? <span className="font-medium text-emerald-600">Gratis</span>
                  : <span>+{formatIDR(paymentFeeTotal)}</span>
                }
              </div>
              {/* <p className="text-[10px] text-muted-foreground/70 italic">{selectedMethod.fee.note}</p> */}
            </div>
          </>
        )}

        <Separator />

        {/* Grand total */}
        <div className="flex items-center justify-between">
          <span className="font-bold">Total</span>
          <span className="text-xl font-extrabold">{formatIDR(grandTotal)}</span>
        </div>

        {/* Privacy checkbox */}
        <div className="flex items-start gap-2.5 rounded-lg border border-border/40 bg-muted/20 p-3">
          <Checkbox id="privacy" checked={agreePrivacy} onCheckedChange={(v) => onAgreeChange(!!v)} className="mt-0.5 shrink-0" />
          <Label htmlFor="privacy" className="text-xs leading-relaxed text-muted-foreground cursor-pointer">
            Saya menyetujui{" "}
            <Link href="/legal/privacy-policy" target="_blank" className="font-semibold text-primary underline underline-offset-2">Kebijakan Privasi</Link>,{" "}
            <Link href="/legal/terms-of-service" target="_blank" className="font-semibold text-primary underline underline-offset-2">Syarat & Ketentuan</Link>, dan{" "}
            <Link href="/legal/domain-policy" target="_blank" className="font-semibold text-primary underline underline-offset-2">Kebijakan Domain</Link>.
          </Label>
        </div>

        {!paymentMethodId && (
          <p className="text-center text-xs text-amber-600 dark:text-amber-400">
            Pilih metode pembayaran terlebih dahulu
          </p>
        )}

        <Button className="w-full gap-2 font-bold shadow shadow-primary/20" size="lg"
          disabled={!agreePrivacy || !paymentMethodId || items.length === 0 || isSubmitting}
          onClick={onSubmit}>
          {isSubmitting
            ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            : <Lock className="h-4 w-4" />}
          {isSubmitting ? "Memproses..." : "Lanjut ke Pembayaran"}
          {!isSubmitting && <ArrowRight className="h-4 w-4" />}
        </Button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3" />
          <span>Transaksi aman · Powered by Xendit</span>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();

  const defaultContact: ContactInfo = {
    name: ACCOUNT_INFO.name, email: ACCOUNT_INFO.email,
    phone: ACCOUNT_INFO.phone, useAccountInfo: true,
  };

  const [cartItems, setCartItems] = React.useState<CartItem[]>([
    {
      type: "domain", id: "tokobaju.com", domain: "tokobaju", tld: ".com",
      price: 195_000, priceRenew: 225_000, period: 1,
      whoisEnabled: false, sslPremium: false, contact: { ...defaultContact },
    } as DomainItem,
    {
      type: "domain", id: "tokobaju.id", domain: "tokobaju", tld: ".id",
      price: 150_000, priceRenew: 150_000, period: 1,
      whoisEnabled: false, sslPremium: false, contact: { ...defaultContact },
    } as DomainItem,
    {
      type: "hosting", id: "hosting-starter", name: "Hosting Starter",
      description: "SSD 5 GB · 1 Domain · Unlimited Bandwidth",
      price: 49_000, period: 1, quantity: 1,
    } as GenericItem,
    {
      type: "vps", id: "vps-1gb", name: "VPS Cloud 1 GB",
      description: "1 vCPU · 1 GB RAM · 20 GB NVMe · Jakarta",
      price: 65_000, period: 1, quantity: 1,
    } as GenericItem,
  ]);

  const handleCartFromUrl = React.useCallback((items: CartItem[]) => { setCartItems(items); }, []);

  const [description, setDescription]     = React.useState("");
  const [agreePrivacy, setAgreePrivacy]   = React.useState(false);
  const [promoCode, setPromoCode]         = React.useState<{ code: string; discount: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = React.useState<string | null>(null);

  const updateItem = (id: string, updated: CartItem) => {
    setCartItems((prev) => prev.map((i) => i.id === id ? updated : i));
  };
  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const domainItems   = cartItems.filter((i) => i.type === "domain") as DomainItem[];
  const genericItems  = cartItems.filter((i) => i.type !== "domain") as GenericItem[];

  const orderMutation = useMutation(
    orpc.order.create.mutationOptions({
      onSuccess: (data: { orderId: string }) => {
        router.push(`/dashboard/order/payment?order=${data.orderId}`);
      },
    }),
  );

  const handleSubmit = () => {
    if (!agreePrivacy || cartItems.length === 0 || !paymentMethod) return;
    orderMutation.mutate({
      items: cartItems.map((item) => {
        if (item.type === "domain") {
          const d = item as DomainItem;
          return {
            type: "domain",
            domain: `${d.domain}${d.tld}`, period: d.period,
            whoisProtection: supportsWhois(d.tld) && d.whoisEnabled,
            sslPremium: d.sslPremium,
            contact: d.contact.useAccountInfo
              ? { name: ACCOUNT_INFO.name, email: ACCOUNT_INFO.email, phone: ACCOUNT_INFO.phone }
              : { name: d.contact.name, email: d.contact.email, phone: d.contact.phone },
          };
        }
        const g = item as GenericItem;
        return { type: g.type, id: g.id, period: g.period, quantity: g.quantity };
      }),
      paymentMethod,
      promoCode:   promoCode?.code ?? null,
      description: description.trim() || null,
    });
  };

  return (
    <SidebarProvider>
      <Suspense fallback={null}><SearchParamsReader onCart={handleCartFromUrl} /></Suspense>
      <AppSidebar />
      <SidebarInset>

        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ms-1" />
            <Separator orientation="vertical" className="me-2 data-vertical:h-4 data-vertical:self-auto" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem><BreadcrumbPage>Checkout</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 pt-0 sm:p-6 sm:pt-0">
          <div>
            <Button variant="ghost" size="sm" className="mb-3 -ms-2 gap-1.5 text-muted-foreground" asChild>
              <Link href="/dashboard"><ChevronLeft className="h-4 w-4" />Kembali</Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Checkout</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Tinjau pesanan dan lengkapi informasi sebelum melanjutkan ke pembayaran.
                </p>
              </div>
            </div>
          </div>

          {cartItems.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 px-6 py-16 text-center">
              <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="font-semibold">Keranjang kosong</p>
              <p className="mt-1 text-sm text-muted-foreground">Pilih produk terlebih dahulu sebelum checkout.</p>
              <Button className="mt-4" asChild><Link href="/dashboard">Jelajahi Produk</Link></Button>
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
              <div className="space-y-6">

                {/* ── Domain Section ── */}
                {domainItems.length > 0 && (
                  <Section icon={<Globe className="h-3.5 w-3.5" />} title={`Domain (${domainItems.length})`}>
                    <div className="space-y-3">
                      {domainItems.map((item) => (
                        <DomainItemCard key={item.id} item={item}
                          onChange={(updated) => updateItem(item.id, updated)}
                          onRemove={() => removeItem(item.id)} />
                      ))}
                      <div className="flex items-start gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          Setiap domain dapat dikonfigurasi secara terpisah: periode, add-on, dan informasi kontak registrant.
                          WHOIS Protection tidak tersedia untuk domain <span className="font-mono">.id</span> dan ekstensi Indonesia lainnya.
                        </p>
                      </div>
                    </div>
                  </Section>
                )}

                {/* ── Produk Lainnya ── */}
                {genericItems.length > 0 && (
                  <Section icon={<Package className="h-3.5 w-3.5" />} title={`Produk Lainnya (${genericItems.length})`}>
                    <div className="space-y-3">
                      {genericItems.map((item) => (
                        <GenericItemCard key={item.id} item={item}
                          onChange={(updated) => updateItem(item.id, updated)}
                          onRemove={() => removeItem(item.id)} />
                      ))}
                    </div>
                  </Section>
                )}

                {/* ── Metode Pembayaran ── */}
                <Section icon={<CreditCard className="h-3.5 w-3.5" />} title="Metode Pembayaran">
                  <PaymentMethodSelector selected={paymentMethod} onChange={setPaymentMethod} />
                </Section>

                {/* ── Catatan Pesanan ── */}
                <Section icon={<Receipt className="h-3.5 w-3.5" />} title="Catatan Pesanan">
                  <FieldSet>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="order-desc">
                          Catatan
                          <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-[10px] font-normal normal-case">Opsional</Badge>
                        </FieldLabel>
                        <Textarea id="order-desc" placeholder="Tambahkan catatan untuk pesanan ini…"
                          value={description} onChange={(e) => setDescription(e.target.value)}
                          rows={3} className="resize-none text-sm" />
                        <FieldDescription>Catatan ini hanya untuk referensi internal Anda.</FieldDescription>
                      </Field>
                    </FieldGroup>
                  </FieldSet>
                </Section>

                {orderMutation.isError && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <p className="text-sm text-destructive">
                      {orderMutation.error instanceof Error ? orderMutation.error.message : "Terjadi kesalahan. Silakan coba lagi."}
                    </p>
                  </div>
                )}
              </div>

              <div className="lg:sticky lg:top-4 lg:self-start">
                <OrderSummary
                  items={cartItems}
                  promoCode={promoCode} paymentMethodId={paymentMethod}
                  onPromoApply={(code) => setPromoCode({ code, discount: 10 })}
                  onPromoRemove={() => setPromoCode(null)}
                  agreePrivacy={agreePrivacy} onAgreeChange={setAgreePrivacy}
                  onSubmit={handleSubmit} isSubmitting={orderMutation.isPending}
                />
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}