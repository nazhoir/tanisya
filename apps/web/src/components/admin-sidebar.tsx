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
				<NavMain baseUrl="/admin" items={navdata} />
			</SidebarContent>

			<SidebarFooter>
				<NavUser />
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
