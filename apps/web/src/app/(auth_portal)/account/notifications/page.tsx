"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@tanisya/ui/components/card";
import { Switch } from "@tanisya/ui/components/switch";
import { Mail, Smartphone } from "lucide-react";
import { useState } from "react";
import { SidebarPageHeader } from "@/components/sidebar-page-header";

const notifTypes = ["Peringatan keamanan", "Pembaruan dan pengumuman produk"];

export default function NotificationsPage() {
	const [emailNotif, setEmailNotif] = useState(true);
	const [whatsApphNotif, setPushNotif] = useState(true);
	const [typeToggles, setTypeToggles] = useState(
		notifTypes.map((_, i) => i < 3),
	);

	return (
		<>
			<SidebarPageHeader
				items={[{ label: "Akun", href: "/account" }, { label: "Notifikasi" }]}
			/>

			<div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 pt-4">
				<div>
					<h1 className="font-semibold text-2xl tracking-tight">Notifikasi</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Atur bagaimana dan kapan kamu ingin diberitahu.
					</p>
				</div>

				{/* Saluran Notifikasi */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Saluran Notifikasi</CardTitle>
						<CardDescription>Pilih cara kamu ingin diberitahu.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-5">
						{[
							{
								icon: <Mail className="h-4 w-4" />,
								label: "Notifikasi Email",
								desc: "Terima pembaruan dan peringatan melalui email.",
								value: emailNotif,
								onChange: setEmailNotif,
							},
							{
								icon: <Smartphone className="h-4 w-4" />,
								label: "Notifikasi WhatsApp",
								desc: "terima pembaruan dan peringatan melalui WhatsApp.",
								value: whatsApphNotif,
								onChange: setPushNotif,
							},
						].map((item, i) => (
							<div key={i} className="flex items-start justify-between gap-4">
								<div className="flex items-start gap-3">
									<div className="mt-0.5 rounded-md bg-muted p-2 text-muted-foreground">
										{item.icon}
									</div>
									<div>
										<p className="font-medium text-sm">{item.label}</p>
										<p className="mt-0.5 text-muted-foreground text-xs">
											{item.desc}
										</p>
									</div>
								</div>
								<Switch checked={item.value} onCheckedChange={item.onChange} />
							</div>
						))}
					</CardContent>
				</Card>

				{/* Jenis Notifikasi */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Jenis Notifikasi</CardTitle>
						<CardDescription>
							Tentukan event mana yang memicu notifikasi.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{notifTypes.map((item, i) => (
							<div key={i} className="flex items-center justify-between">
								<p className="text-sm">{item}</p>
								<Switch
									checked={typeToggles[i]}
									onCheckedChange={(val) =>
										setTypeToggles((prev) =>
											prev.map((v, idx) => (idx === i ? val : v)),
										)
									}
								/>
							</div>
						))}
					</CardContent>
				</Card>
			</div>
		</>
	);
}
