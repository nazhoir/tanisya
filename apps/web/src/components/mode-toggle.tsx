"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@tanisya/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tanisya/ui/components/dropdown-menu";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const ActiveIcon = themes.find((t) => t.value === theme)?.icon ?? Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative border-border/60 bg-background transition-all duration-200 hover:border-border hover:bg-accent hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <span className="animate-in zoom-in-75 duration-200">
            <ActiveIcon className="h-[1.1rem] w-[1.1rem] text-foreground/80" />
          </span>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="z-999 w-36  border-border/60 bg-popover/95 p-1.5 shadow-lg backdrop-blur-sm"
      >
        <DropdownMenuLabel className="px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Appearance
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 bg-border/50" />

        {themes.map(({ value, label, icon: Icon }) => {
          const isActive = theme === value;
          return (
            <DropdownMenuItem
              key={value}
              onClick={() => setTheme(value)}
              className={`flex cursor-pointer items-center gap-2.5  px-2.5 py-1.5 my-1 text-sm font-medium transition-colors duration-150 focus:bg-accent ${
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              />
              {label}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-foreground/70" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}