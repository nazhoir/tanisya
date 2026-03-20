"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@tanisya/ui/components/select";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const THEMES = [
	{ value: "light", label: "Light", icon: Sun },
	{ value: "dark", label: "Dark", icon: Moon },
	{ value: "system", label: "System", icon: Monitor },
] as const;

export function AppearanceModeToggle() {
	const { theme, setTheme } = useTheme();

	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	return (
		<Select value={mounted ? theme : "system"} onValueChange={setTheme}>
			<SelectTrigger className="w-36" aria-label="Ganti tema">
				<SelectValue />
			</SelectTrigger>

			<SelectContent>
				{THEMES.map(({ value, label, icon: Icon }) => (
					<SelectItem key={value} value={value}>
						<span className="flex items-center gap-2">
							<Icon className="h-4 w-4" />
							{label}
						</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}