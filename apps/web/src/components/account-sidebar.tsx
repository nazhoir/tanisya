"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarRail,
} from "@tanisya/ui/components/sidebar";
import { Bell, Palette, Shield, StarIcon, User, Wallet } from "lucide-react";
import type * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import Logo from "./logo";

const data = {
	navAccount: [
		{ title: "Profil", url: "/account", icon: <User /> },
		{ title: "Keamanan", url: "/account/security", icon: <Shield /> },
	],
	navSettings: [
		{ title: "Notifikasi", url: "/account/notifications", icon: <Bell /> },
		{ title: "Preferensi", url: "/account/preferences", icon: <Palette /> },
	],
	navBilling: [
		{ title: "Poin Saya", url: "/account/point", icon: <StarIcon /> },
		{ title: "Tagihan", url: "/account/billing", icon: <Wallet /> },
	],
};

export function AccountSidebar({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="offcanvas" variant="inset" {...props}>
			<SidebarHeader className="p-4">
				<SidebarMenu>
					<SidebarMenuItem>
						<Logo href="/dashboard" />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<NavMain label="Akun" items={data.navAccount} />
				<NavMain label="Pengaturan" items={data.navSettings} />
				<NavMain label="Poin & Tagihan" items={data.navBilling} />
			</SidebarContent>

			<SidebarFooter>
				<NavUser />
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
