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
	BookOpenIcon,
	BotIcon,
	Box,
	FrameIcon,
	GalleryVerticalEndIcon,
	Globe,
	MapIcon,
	PieChartIcon,
	Server,
	Settings2Icon,
	ShieldCheck,
	TerminalIcon,
	TerminalSquareIcon,
	Zap,
} from "lucide-react";
import type * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";

// This is sample data.
const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	teams: [
		{
			name: "Acme Inc",
			logo: <GalleryVerticalEndIcon />,
			plan: "Enterprise",
		},
		{
			name: "Acme Corp.",
			logo: <AudioLinesIcon />,
			plan: "Startup",
		},
		{
			name: "Evil Corp.",
			logo: <TerminalIcon />,
			plan: "Free",
		},
	],
	navMain: [
		{
			title: "Domain",
			url: "#",
			icon: <Globe />,
			isActive: true,
			items: [
				{ title: "Domain saya", url: "/dashboard/domain" },
				{ title: "Registrasi", url: "/dashboard/domain/register" },
				{ title: "Transfer", url: "/dashboard/domain/transfer" },
			],
		},

		{
			title: "Hosting",
			url: "/dashboard/hosting",
			icon: <Server />,
			items: [
				{ title: "Paket Saya", url: "/dashboard/hosting" },
				{ title: "Beli Hosting", url: "/dashboard/hosting/order" },
				{ title: "File Manager", url: "/dashboard/hosting/files" },
				{ title: "Database", url: "/dashboard/hosting/database" },
				{ title: "Email", url: "/dashboard/hosting/email" },
				{ title: "Pengaturan", url: "/dashboard/hosting/settings" },
			],
		},

		{
			title: "VPS",
			url: "/dashboard/vps",
			icon: <Box />,
			items: [
				{ title: "Server Saya", url: "/dashboard/vps" },
				{ title: "Beli VPS", url: "/dashboard/vps/order" },
				{ title: "Console", url: "/dashboard/vps/console" },
				{ title: "Snapshot", url: "/dashboard/vps/snapshot" },
				{ title: "Firewall", url: "/dashboard/vps/firewall" },
				{ title: "Pengaturan", url: "/dashboard/vps/settings" },
			],
		},

		{
			title: "SSL",
			url: "/dashboard/ssl",
			icon: <ShieldCheck />,
			items: [
				{ title: "Sertifikat Saya", url: "/dashboard/ssl" },
				{ title: "Beli SSL", url: "/dashboard/ssl/order" },
				{ title: "Pasang SSL", url: "/dashboard/ssl/install" },
				{ title: "Perbarui", url: "/dashboard/ssl/renew" },
			],
		},

		{
			title: "Instan Apps",
			url: "/dashboard/instan-apps",
			icon: <Zap />,
			items: [
				{ title: "Aplikasi Saya", url: "/dashboard/instan-apps" },
				{ title: "Install Baru", url: "/dashboard/instan-apps/install" },
				{ title: "Update", url: "/dashboard/instan-apps/update" },
				{ title: "Backup", url: "/dashboard/instan-apps/backup" },
			],
		},
	],
	projects: [
		{
			name: "Design Engineering",
			url: "#",
			icon: <FrameIcon />,
		},
		{
			name: "Sales & Marketing",
			url: "#",
			icon: <PieChartIcon />,
		},
		{
			name: "Travel",
			url: "#",
			icon: <MapIcon />,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={data.teams} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				{/* <NavProjects projects={data.projects} /> */}
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
