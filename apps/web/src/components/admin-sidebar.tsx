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
import {
	Activity,
	Bell,
	Globe,
	Palette,
	PieChartIcon,
	Search,
	Shield,
	StarIcon,
	User,
	UserCog2,
	Users2,
	Wallet,
} from "lucide-react";
import type * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import Logo from "./logo";

const navdata = [
	{
		title: "Overview",
		url: "",
		icon: <PieChartIcon />,
	},

	{
		title: "Users",
		url: "/users",
		icon: <Users2 />,
		MatchMode: "startsWith",
	},
	{
		title: "Impersonate",
		url: "/impersonate",
		icon: <UserCog2 />,
	},

	{
		title: "Sessions",
		url: "/sessions",
		icon: <Activity />,
	},
];

const productNavData = [
	{
      title: "Domain",
      url: "#",
      icon: <Globe />,
      isActive: true,
      items: [
        { title: "Domain", url: "/domain" },
        { title: "Provider", url: "/domain/provider" },
        { title: "Registrasi", url: "/domain/register" },
        { title: "Transfer", url: "/domain/transfer" },
      ],
    },
]

export function AdminSidebar({
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
				<NavMain baseUrl="/admin" label="Pengguna" items={navdata} />
				<NavMain baseUrl="/admin" label="Produk" items={productNavData} />
			</SidebarContent>

			<SidebarFooter>
				<NavUser />
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
