"use client";

import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { cn } from "@tanisya/ui/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tanisya/ui/components/dropdown-menu";
import { Button } from "@tanisya/ui/components/button";
import { Skeleton } from "@tanisya/ui/components/skeleton";

// ─── Avatar initials helper ───────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  name,
  image,
  size = "sm",
}: {
  name: string;
  image?: string | null;
  size?: "sm" | "md";
}) {
  const dim = size === "md" ? "h-10 w-10 text-sm" : "h-7 w-7 text-xs";
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={cn("rounded-full object-cover ring-2 ring-border", dim)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground ring-2 ring-border",
        dim
      )}
    >
      {getInitials(name)}
    </div>
  );
}

// ─── UserMenu ─────────────────────────────────────────────────────────────────

export default function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-7 rounded-full" />
        <Skeleton className="hidden h-4 w-20 sm:block" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/login">
          <Button variant="outline"  className="hidden sm:flex">
            Masuk
          </Button>
        </Link>
        <Link href="/auth/register">
          <Button >Daftar</Button>
        </Link>
      </div>
    );
  }

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/"),
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-xl border border-border bg-background px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="User menu"
        >
          <Avatar name={session.user.name} image={session.user.image} />
          <span className="hidden max-w-28 truncate sm:block text-sm">
            {session.user.name}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="z-50 w-60 rounded-xl border border-border bg-card p-1.5 shadow-lg"
      >
        {/* User info header */}
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5 mb-1">
          <Avatar name={session.user.name} image={session.user.image} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">
              {session.user.name}
            </p>
            <p className="truncate text-[11px] text-muted-foreground leading-tight mt-0.5">
              {session.user.email}
            </p>
          </div>
        </div>

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard"
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm"
            >
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/billing"
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm"
            >
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Tagihan &amp; Langganan
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/settings"
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Pengaturan Akun
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5" />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}