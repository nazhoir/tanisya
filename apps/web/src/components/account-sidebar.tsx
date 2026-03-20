"use client";

import { Button } from "@tanisya/ui/components/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@tanisya/ui/components/sidebar";
import {
	Bell,
	LogOut,
	LogOutIcon,
	Palette,
	Shield,
	StarIcon,
	User,
	Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Logo from "./logo";

const accountNavItems = [
	{ label: "Profil", href: "/account", icon: User },
	{ label: "Keamanan", href: "/account/security", icon: Shield },
];

const settingsNavItems = [
	{ label: "Notifikasi", href: "/account/notifications", icon: Bell },
	{ label: "Preferensi", href: "/account/preferences", icon: Palette },
];

const billingNavItems = [
	{ label: "Poin Saya", href: "/account/point", icon: StarIcon },
	{ label: "Tagihan", href: "/account/billing", icon: Wallet },
];

const navGroups = [
	{ label: "Akun", items: accountNavItems },
	{ label: "Pengaturan", items: settingsNavItems },
	{ label: "Poin & Tagihan", items: billingNavItems },
];

export function AccountSidebar() {
	const pathname = usePathname();

	const router = useRouter();

	// ── Sign out ──────────────────────────────────────────────────────────────
	const handleSignOut = () => {
		authClient.signOut({
			fetchOptions: { onSuccess: () => router.push("/") },
		});
	};

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader className="p-4">
				<Logo href="/dashboard" />
			</SidebarHeader>

			<SidebarContent>
				{navGroups.map((group) => (
					<SidebarGroup key={group.label}>
						<SidebarGroupLabel>{group.label}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{group.items.map((item) => {
									const isActive = pathname === item.href;
									return (
										<SidebarMenuItem key={item.href}>
											<SidebarMenuButton
												asChild
												isActive={isActive}
												tooltip={item.label}
											>
												<Link
													href={item.href as any}
													className="flex items-center gap-2"
												>
													<item.icon className="h-4 w-4" />
													<span>{item.label}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>

			<SidebarFooter className="p-3">
				<Button
					variant={"destructive"}
					onClick={handleSignOut}
					className="w-full justify-start"
				>
					<LogOutIcon className="h-4 w-4" />
					Log out
				</Button>
			</SidebarFooter>
		</Sidebar>
	);
}
