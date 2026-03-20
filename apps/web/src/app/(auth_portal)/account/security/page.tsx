"use client";

import { Badge } from "@tanisya/ui/components/badge";
import { Button } from "@tanisya/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@tanisya/ui/components/card";
import { Input } from "@tanisya/ui/components/input";
import { Label } from "@tanisya/ui/components/label";
import { Switch } from "@tanisya/ui/components/switch";
import { Globe, KeyRound, Lock, LogOut } from "lucide-react";
import { useState } from "react";
import { AccountHeader } from "@/components/account-header";

export default function SecurityPage() {
	const [twoFactor, setTwoFactor] = useState(false);

	return (
		<>
			<AccountHeader page="Keamanan" />

			<div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 pt-4">
				<div>
					<h1 className="font-semibold text-2xl tracking-tight">Keamanan</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Jaga keamanan akun kamu dengan pengaturan berikut.
					</p>
				</div>

				{/* Ganti Kata Sandi */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Ganti Kata Sandi</CardTitle>
						<CardDescription>
							Gunakan kata sandi yang kuat dan unik.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="current-password">Kata Sandi Saat Ini</Label>
							<div className="relative">
								<Lock className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="current-password"
									type="password"
									className="pl-9"
									placeholder="••••••••"
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="new-password">Kata Sandi Baru</Label>
							<div className="relative">
								<KeyRound className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="new-password"
									type="password"
									className="pl-9"
									placeholder="••••••••"
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirm-password">
								Konfirmasi Kata Sandi Baru
							</Label>
							<div className="relative">
								<KeyRound className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="confirm-password"
									type="password"
									className="pl-9"
									placeholder="••••••••"
								/>
							</div>
						</div>
					</CardContent>
					<CardFooter className="flex justify-end">
						<Button>Perbarui Kata Sandi</Button>
					</CardFooter>
				</Card>

				{/* 2FA */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Autentikasi Dua Faktor</CardTitle>
						<CardDescription>
							Tambahkan lapisan keamanan ekstra pada akun kamu.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<div className="flex items-center gap-2">
									<p className="font-medium text-sm">Aplikasi Autentikator</p>
									<Badge
										variant={twoFactor ? "default" : "secondary"}
										className="text-xs"
									>
										{twoFactor ? "Aktif" : "Nonaktif"}
									</Badge>
								</div>
								<p className="text-muted-foreground text-xs">
									Gunakan aplikasi autentikator untuk kode satu kali pakai.
								</p>
							</div>
							<Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
						</div>
					</CardContent>
				</Card>

				{/* Sesi Aktif */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Sesi Aktif</CardTitle>
						<CardDescription>Kelola sesi login aktif kamu.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{[
							{
								device: "Chrome di Windows",
								location: "Jakarta, ID",
								current: true,
							},
							{
								device: "Safari di iPhone",
								location: "Surabaya, ID",
								current: false,
							},
						].map((session, i) => (
							<div
								key={i}
								className="flex items-center justify-between rounded-lg border p-3"
							>
								<div className="flex items-center gap-3">
									<div className="rounded-md bg-muted p-2">
										<Globe className="h-4 w-4 text-muted-foreground" />
									</div>
									<div>
										<p className="font-medium text-sm">{session.device}</p>
										<p className="text-muted-foreground text-xs">
											{session.location}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									{session.current ? (
										<Badge
											variant="outline"
											className="border-green-300 text-green-600 text-xs"
										>
											Saat ini
										</Badge>
									) : (
										<Button
											variant="ghost"
											size="sm"
											className="h-8 gap-1 text-destructive text-xs hover:text-destructive"
										>
											<LogOut className="h-3.5 w-3.5" />
											Cabut
										</Button>
									)}
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			</div>
		</>
	);
}
