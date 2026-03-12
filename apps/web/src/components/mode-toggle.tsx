"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@tanisya/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@tanisya/ui/components/dropdown-menu";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  // ── Hydration guard ───────────────────────────────────────────────────────
  // next-themes reads localStorage/system preference on the client only.
  // Rendering the icon before mount causes SSR ↔ client mismatch.
  // Solution: render a neutral placeholder until after first mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Icon to show in the trigger button
  const Icon = !mounted
    ? Monitor // neutral placeholder — matches server render
    : theme === "dark"
      ? Moon
      : theme === "light"
        ? Sun
        : Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-9 w-9"
          aria-label="Ganti tema"
        >
          <Icon className="h-[1.1rem] w-[1.1rem] text-foreground/80" aria-hidden />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
          <Sun className="h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
          <Moon className="h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2">
          <Monitor className="h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}