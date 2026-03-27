"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@tanisya/ui/components/sidebar";
import {
	AudioLinesIcon,
	GalleryVerticalEndIcon,
	Globe,
	Mail,
	PieChartIcon,
	Settings2,
	TerminalIcon,
	Users2,
	Zap,
} from "lucide-react";
import type * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";

// This is sample data.
const data = {
	navOrg: [
		{
			title: "Overview",
			url: "",
			icon: <PieChartIcon />,
			mode: "exact",
		},
	],
	navMain: [
		{
			title: "Domain",
			url: "#",
			icon: <Globe />,
			isActive: true,
			items: [
				{ title: "Domain saya", url: "/domain" },
				{ title: "Registrasi", url: "/domain/register" },
				{ title: "Transfer", url: "/domain/transfer" },
			],
		},

		{
			title: "Instan Apps",
			url: "/instan-apps",
			icon: <Zap />,
			items: [
				{ title: "Aplikasi Saya", url: "/instan-apps" },
				{ title: "Install Baru", url: "/instan-apps/install" },
				{ title: "Update", url: "/instan-apps/update" },
				{ title: "Backup", url: "/instan-apps/backup" },
			],
		},
	],

	navSettings: [
		{
			title: "Anggota",
			url: "/members",
			icon: <Users2 />,
		},
		{
			title: "Undang Anggota",
			url: "/invite",
			icon: <Mail />,
		},
		{
			title: "Pengaturan",
			url: "/settings",
			icon: <Settings2 />,
		},
	],
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
	baseurl: string;
};

export function AppSidebar({ ...props }: AppSidebarProps) {
	return (
		<Sidebar collapsible="offcanvas" variant="inset" {...props}>
			<SidebarHeader>
				<TeamSwitcher />
			</SidebarHeader>
			<SidebarContent>
				<NavMain baseUrl={props.baseurl} items={data.navOrg} />
				<NavMain label="Produk" baseUrl={props.baseurl} items={data.navMain} />
				<NavMain
					label="Lainnya"
					baseUrl={props.baseurl}
					items={data.navSettings}
				/>
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
