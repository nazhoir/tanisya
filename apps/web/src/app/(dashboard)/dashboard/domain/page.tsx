"use client";

import * as React from "react";
import Link from "next/link";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  ExternalLink,
  Globe,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { Badge } from "@tanisya/ui/components/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@tanisya/ui/components/breadcrumb";
import { Button } from "@tanisya/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@tanisya/ui/components/dropdown-menu";
import { Input } from "@tanisya/ui/components/input";
import { Separator } from "@tanisya/ui/components/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@tanisya/ui/components/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tanisya/ui/components/table";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@tanisya/ui/components/empty";
import { cn } from "@tanisya/ui/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type DomainStatus = "active" | "expired" | "expiring" | "suspended";

interface Domain {
  id: string;
  name: string;
  tld: string;
  nextDue: string;
  autoRenew: boolean;
  status: DomainStatus;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const domains: Domain[] = [
  { id: "1", name: "tokobaju",      tld: ".co.id",  nextDue: "2026-03-15", autoRenew: true,  status: "active"    },
  { id: "2", name: "restorankita",  tld: ".id",     nextDue: "2025-04-10", autoRenew: false, status: "expiring"  },
  { id: "3", name: "agencydigital", tld: ".com",    nextDue: "2026-11-01", autoRenew: true,  status: "active"    },
  { id: "4", name: "sekolahpintar", tld: ".sch.id", nextDue: "2027-01-20", autoRenew: true,  status: "active"    },
  { id: "5", name: "techstartup",   tld: ".io",     nextDue: "2025-07-08", autoRenew: false, status: "suspended" },
  { id: "6", name: "blogpribadi",   tld: ".web.id", nextDue: "2024-09-22", autoRenew: false, status: "expired"   },
  { id: "7", name: "konsultanku",   tld: ".biz.id", nextDue: "2026-06-30", autoRenew: true,  status: "active"    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  DomainStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Aktif",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  expiring: {
    label: "Segera Berakhir",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  expired: {
    label: "Kedaluwarsa",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  suspended: {
    label: "Suspend",
    className: "bg-muted text-muted-foreground border-border",
  },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns: ColumnDef<Domain>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ms-3 h-8 gap-1 font-semibold"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Domain
        <ArrowUpDown className="h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const { name, tld } = row.original;
      const full = `${name}${tld}`;
      return (
        <Link
          href={`/dashboard/domain/${full}`}
          className="group flex items-center gap-2"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Globe className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-sm group-hover:text-primary transition-colors">
              {name}
              <span className="text-muted-foreground font-normal">{tld}</span>
            </p>
          </div>
          <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      );
    },
  },
  {
    accessorKey: "nextDue",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ms-3 h-8 gap-1 font-semibold"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Next Due
        <ArrowUpDown className="h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const days = daysUntil(row.getValue("nextDue"));
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm">{formatDate(row.getValue("nextDue"))}</span>
          {days > 0 && days <= 30 && (
            <span className="flex items-center gap-1 text-xs text-amber-500">
              <TriangleAlert className="h-3 w-3" />
              {days} hari lagi
            </span>
          )}
          {days <= 0 && (
            <span className="text-xs text-destructive">Sudah berakhir</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "autoRenew",
    header: "Auto Renew",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={cn(
          "text-xs",
          row.getValue("autoRenew")
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            : "text-muted-foreground",
        )}
      >
        {row.getValue("autoRenew") ? "Aktif" : "Nonaktif"}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as DomainStatus;
      const cfg = STATUS_CONFIG[status];
      return (
        <Badge
          variant="outline"
          className={cn("text-xs font-medium", cfg.className)}
        >
          {cfg.label}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const full = `${row.original.name}${row.original.tld}`;
      return (
        <div className="flex justify-end gap-2">
          {row.original.status === "expiring" && (
            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" asChild>
              <Link href={`/dashboard/domain/renew?domain=${full}`}>
                <RefreshCw className="h-3 w-3" />
                Perpanjang
              </Link>
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-7 text-xs" asChild>
            <Link href={`/dashboard/domain/${full}`}>Kelola</Link>
          </Button>
        </div>
      );
    },
  },
];

// ─── Stats cards ──────────────────────────────────────────────────────────────

function StatsCards() {
  const total    = domains.length;
  const active   = domains.filter((d) => d.status === "active").length;
  const expiring = domains.filter((d) => d.status === "expiring").length;
  const expired  = domains.filter((d) => d.status === "expired" || d.status === "suspended").length;

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/25 sm:grid-cols-4">
      {[
        { label: "Total Domain",      value: total,    icon: Globe },
        { label: "Aktif",             value: active,   icon: ShieldCheck },
        { label: "Segera Berakhir",   value: expiring, icon: TriangleAlert },
        { label: "Bermasalah",        value: expired,  icon: TriangleAlert },
      ].map(({ label, value, icon: Icon }) => (
        <div key={label} className="flex items-center gap-3 bg-background p-4 sm:p-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-extrabold leading-none tracking-tight">{value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DomainPage() {
  const [sorting, setSorting]       = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data: domains,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, columnFilters, columnVisibility },
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>

        {/* ── Header ─────────────────────────────────────────────────────── */}
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
                <BreadcrumbItem>
                  <BreadcrumbPage>Domain Saya</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0 sm:p-6 sm:pt-0">

          {/* Page heading */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                Domain Saya
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Kelola semua nama domain yang terdaftar di akun kamu.
              </p>
            </div>
            <Button className="h-9 gap-2 font-semibold shadow-sm shadow-primary/20" asChild>
              <Link href="/dashboard/domain/register">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Daftar Domain</span>
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <StatsCards />

          {/* Table */}
          <div className="rounded-2xl border border-border/60 bg-background">

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 p-4 border-b border-border/60">
              <div className="relative max-w-xs flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari domain..."
                  value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                  onChange={(e) =>
                    table.getColumn("name")?.setFilterValue(e.target.value)
                  }
                  className="h-9 pl-9 text-sm"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1">
                    Kolom <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((col) => col.getCanHide())
                    .map((col) => (
                      <DropdownMenuCheckboxItem
                        key={col.id}
                        className="capitalize"
                        checked={col.getIsVisible()}
                        onCheckedChange={(v) => col.toggleVisibility(!!v)}
                      >
                        {col.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Table */}
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id} className="hover:bg-transparent border-border/60">
                    {hg.headers.map((header) => (
                      <TableHead key={header.id} className="text-xs font-semibold">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer border-border/40 hover:bg-muted/30 transition-colors"
                      onClick={() => {
                        const { name, tld } = row.original;
                        window.location.href = `/dashboard/domain/${name}${tld}`;
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="p-0">
                      <Empty className="border-none rounded-none py-12">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <Globe />
                          </EmptyMedia>
                          <EmptyTitle>Belum ada domain</EmptyTitle>
                          <EmptyDescription>
                            Kamu belum memiliki domain yang terdaftar. Daftarkan domain pertamamu sekarang.
                          </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                          <Button size="sm" asChild>
                            <Link href="/dashboard/domain/register">
                              <Plus className="h-4 w-4" />
                              Daftar Domain
                            </Link>
                          </Button>
                        </EmptyContent>
                      </Empty>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                {table.getFilteredRowModel().rows.length} domain
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Sebelumnya
                </Button>
                <span className="text-xs text-muted-foreground">
                  {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}