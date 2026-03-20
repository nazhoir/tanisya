"use client";

import { Button } from "@tanisya/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@tanisya/ui/components/card";
import { Label } from "@tanisya/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@tanisya/ui/components/select";
import { Switch } from "@tanisya/ui/components/switch";
import { CreditCard, Languages, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { AccountHeader } from "@/components/account-header";
import App from "next/app";
import { AppearanceModeToggle } from "./appearance-mode-toggle";

export default function PreferencesPage() {
	const [darkMode, setDarkMode] = useState(false);

	return (
		<>
			<AccountHeader page="Preferensi" />

			<div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 pt-4">
				<div>
					<h1 className="font-semibold text-2xl tracking-tight">Preferensi</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Sesuaikan dengan tampilan yang kamu suka.
					</p>
				</div>

				{/* Tampilan */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Tampilan</CardTitle>
						<CardDescription>
							Sesuaikan tampilan antarmuka untuk kamu.
						</CardDescription>
					</CardHeader>
					<CardContent>

						<AppearanceModeToggle />

						
					</CardContent>
					<CardFooter className="flex justify-end gap-2">
<p className="text-muted-foreground text-xs">
								Beralih antara tema terang dan gelap atau sesuaikan tema dengan device anda.
							</p>
					</CardFooter>
				</Card>
			</div>
		</>
	);
}
