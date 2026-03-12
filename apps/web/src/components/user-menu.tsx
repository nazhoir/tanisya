"use client";

import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@tanisya/ui/components/avatar";
import { Button } from "@tanisya/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tanisya/ui/components/dropdown-menu";
import { Skeleton } from "@tanisya/ui/components/skeleton";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-7 rounded-full" />
        <Skeleton className="hidden h-3.5 w-20 sm:block" />
      </div>
    );
  }

  // ── Guest state ───────────────────────────────────────────────────────────
  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/login">
          <Button variant="outline" size="sm" className="hidden h-9 sm:flex">
            Masuk
          </Button>
        </Link>
        <Link href="/auth/register">
          <Button size="sm" className="h-9">
            Daftar
          </Button>
        </Link>
      </div>
    );
  }

  // ── Sign out ──────────────────────────────────────────────────────────────
  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/") },
    });
  };

  const { name, email, image } = session.user;

  // ── Authenticated state ───────────────────────────────────────────────────
  return (
    <DropdownMenu>
      {/* Trigger — avatar + name */}
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 pr-3"
          aria-label="Menu pengguna"
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={image ?? undefined} alt={name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-28 truncate text-sm sm:block">
            {name}
          </span>
        </Button>
      </DropdownMenuTrigger>

      {/* Dropdown panel */}
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-60 rounded-xl p-1.5"
      >
        {/* User info header */}
        <DropdownMenuLabel className="p-0">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={image ?? undefined} alt={name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">
                {name}
              </p>
              <p className="truncate text-[11px] leading-tight text-muted-foreground mt-0.5">
                {email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1.5" />

        {/* Navigation items */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="cursor-pointer gap-2.5">
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              Dashboard
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/billing" className="cursor-pointer gap-2.5">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Tagihan &amp; Langganan
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/account" className="cursor-pointer gap-2.5">
              <Settings className="h-4 w-4 text-muted-foreground" />
              Pengaturan Akun
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5" />

        {/* Sign out */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer gap-2.5 text-destructive focus:bg-destructive/50"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}