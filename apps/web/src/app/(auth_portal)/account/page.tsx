"use client";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@tanisya/ui/components/avatar";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@tanisya/ui/components/select";
import { Camera, Mail, Smartphone, Trash2 } from "lucide-react";
import { AccountHeader } from "@/components/account-header";

export default function ProfilePage() {
	return (
		<>
			<AccountHeader />

			<div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 pt-4">
				<div>
					<h1 className="font-semibold text-2xl tracking-tight">Profil</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Kelola informasi pribadi dan foto profil kamu.
					</p>
				</div>

				{/* Foto Profil */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Foto Profil</CardTitle>
						<CardDescription>
							Foto ini akan ditampilkan di profil dan seluruh platform.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-6">
							<div className="relative">
								<Avatar className="h-20 w-20">
									<AvatarImage src="https://github.com/shadcn.png" alt="User" />
									<AvatarFallback className="font-semibold text-lg">
										BS
									</AvatarFallback>
								</Avatar>
								<button className="absolute right-0 bottom-0 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
									<Camera className="h-3.5 w-3.5" />
								</button>
							</div>
							<div className="flex flex-col gap-2">
								<div className="flex gap-2">
									<Button variant="outline" size="sm">
										Upload Foto
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="text-destructive hover:text-destructive"
									>
										Hapus
									</Button>
								</div>
								<p className="text-muted-foreground text-xs">
									JPG, GIF atau PNG. Maks 2MB.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Informasi Pribadi */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Informasi Pribadi</CardTitle>
						<CardDescription>
							Perbarui detail pribadi kamu di sini.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="first-name">Nama Depan</Label>
							<Input id="first-name" defaultValue="Budi" />
						</div>
						<div className="space-y-2">
							<Label htmlFor="last-name">Nama Belakang</Label>
							<Input id="last-name" defaultValue="Santoso" />
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Alamat Email</Label>
							<div className="relative">
								<Mail className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="email"
									className="pl-9"
									defaultValue="budi@example.com"
									type="email"
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="phone">Nomor Telepon</Label>
							<div className="relative">
								<Smartphone className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="phone"
									className="pl-9"
									defaultValue="+62 812 3456 7890"
								/>
							</div>
						</div>
						
					</CardContent>
					<CardFooter className="flex justify-end gap-2">
						<Button variant="outline">Batal</Button>
						<Button>Simpan Perubahan</Button>
					</CardFooter>
				</Card>

				{/* Zona Berbahaya */}
				<Card className="border-destructive! border shadow-none  bg-destructive/15">
					<CardHeader>
						<CardTitle className="text-base text-destructive">
							Zona Berbahaya
						</CardTitle>
						<CardDescription className="text-destructive">
							Tindakan yang tidak dapat dibatalkan.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between rounded-lg border bg-destructive/10  border-destructive/30 p-4">
							<div>
								<p className="font-medium text-destructive text-sm">Hapus Akun</p>
								<p className="mt-0.5 text-destructive/60">
									Hapus permanen akun dan semua data kamu.
								</p>
							</div>
							<Button variant="destructive" size="sm" className="gap-2">
								<Trash2 className="h-4 w-4" />
								Hapus
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
