"use client";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@tanisya/ui/components/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@tanisya/ui/components/sidebar";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ===================================================== */
/* 🔥 ACTIVE MATCHER (FINAL FIX) */
/* ===================================================== */

type MatchMode = "exact" | "startsWith";

function normalize(path: string) {
	return path.replace(/\/$/, "");
}

function isActive(
	pathname: string,
	baseUrl: string,
	itemUrl: string,
	matchMode: MatchMode = "startsWith",
) {
	const current = normalize(pathname);
	const base = normalize(baseUrl);

	// 🔥 ROOT CASE (Overview url === "")
	if (itemUrl === "") {
		return current === base;
	}

	const fullPath = normalize(`${base}${itemUrl}`);

	if (matchMode === "exact") {
		return current === fullPath;
	}

	return current === fullPath || current.startsWith(fullPath + "/");
}

/* ===================================================== */
/* TYPES */
/* ===================================================== */

interface NavItem {
	title: string;
	url: string;
	icon?: React.ReactNode;
	matchMode?: MatchMode;
	items?: {
		title: string;
		url: string;
		matchMode?: MatchMode;
	}[];
}

interface NavMainProps {
	items: NavItem[];
	baseUrl?: string;
	label?: string;
}

/* ===================================================== */
/* COMPONENT */
/* ===================================================== */

export function NavMain({ items, baseUrl, label }: NavMainProps) {
	const pathname = usePathname();
	const prefix = baseUrl ?? "";

	return (
		<SidebarGroup>
			{label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}

			<SidebarMenu className="space-y-1">
				{items.map((item) => {
					const hasChildren = item.items && item.items.length > 0;

					/* ============================= */
					/* 🔹 ITEM TANPA CHILD */
					/* ============================= */

					if (!hasChildren) {
						const active = isActive(
							pathname,
							prefix,
							item.url,
							item.matchMode ?? "startsWith",
						);

						return (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									asChild
									tooltip={item.title}
									isActive={active}
								>
									<Link href={`${prefix}${item.url}` as any}>
										{item.icon}
										<span>{item.title}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					}

					/* ============================= */
					/* 🔽 ITEM DENGAN CHILD */
					/* ============================= */

					const parentActive = isActive(
						pathname,
						prefix,
						item.url,
						item.matchMode ?? "startsWith",
					);

					const childActive = item.items?.some((sub) =>
						isActive(pathname, prefix, sub.url, sub.matchMode ?? "exact"),
					);

					const isGroupActive = parentActive || childActive;

					return (
						<Collapsible
							key={item.title}
							asChild
							defaultOpen={isGroupActive}
							className="group/collapsible"
						>
							<SidebarMenuItem>
								<CollapsibleTrigger asChild>
									<SidebarMenuButton
										tooltip={item.title}
										isActive={isGroupActive}
									>
										{item.icon}
										<span>{item.title}</span>
										<ChevronRightIcon className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
									</SidebarMenuButton>
								</CollapsibleTrigger>

								<CollapsibleContent>
									<SidebarMenuSub>
										{item.items?.map((subItem) => {
											const isSubActive = isActive(
												pathname,
												prefix,
												subItem.url,
												subItem.matchMode ?? "exact",
											);

											return (
												<SidebarMenuSubItem key={subItem.title}>
													<SidebarMenuSubButton asChild isActive={isSubActive}>
														<Link href={`${prefix}${subItem.url}` as any}>
															<span>{subItem.title}</span>
														</Link>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											);
										})}
									</SidebarMenuSub>
								</CollapsibleContent>
							</SidebarMenuItem>
						</Collapsible>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
