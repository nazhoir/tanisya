"use client";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@tanisya/ui/components/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@tanisya/ui/components/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@tanisya/ui/components/sidebar";
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { authClient } from "@/lib/auth-client";
import { DialogCreateOrganization } from "./auth/dialog-create-organization-form";

export function TeamSwitcher() {
	const { isMobile } = useSidebar();
	const [openCreate, setOpenCreate] = React.useState(false);
	const router = useRouter();

	// ── Data organisasi ──────────────────────────────────────────────────────
	const {
		data: organizations,
		isPending,
		refetch,
	} = authClient.useListOrganizations();

	// Org yang sedang aktif — digunakan untuk menampilkan di trigger button
	const { data: activeOrg } = authClient.useActiveOrganization();

	// ── Handler pindah org ───────────────────────────────────────────────────
	const handleSwitch = async (organizationId: string) => {
		await authClient.organization.setActive({ organizationId });
		router.push(`/dashboard/org/${organizationId}`);
	};

	// ── Derived ──────────────────────────────────────────────────────────────
	const orgs = organizations ?? [];

	// Tampilkan loading skeleton di trigger jika masih fetch
	const triggerName =
		activeOrg?.name ?? (isPending ? "Memuat..." : "Pilih Organisasi");
	const triggerInitials = triggerName.slice(0, 2).toUpperCase();

	return (
		<>
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						{/* ── Trigger ─────────────────────────────────────────────── */}
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<Avatar className="size-8 rounded-lg">
									<AvatarImage
										src={activeOrg?.logo ?? undefined}
										alt={triggerName}
									/>
									<AvatarFallback className="rounded-lg font-semibold text-xs">
										{triggerInitials}
									</AvatarFallback>
								</Avatar>

								<div className="grid flex-1 text-start text-sm leading-tight">
									<span className="truncate font-medium">{triggerName}</span>
									{activeOrg?.slug && (
										<span className="truncate text-muted-foreground text-xs">
											/{activeOrg.slug}
										</span>
									)}
								</div>

								<ChevronsUpDownIcon className="ms-auto size-4 shrink-0 text-muted-foreground" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>

						{/* ── Dropdown content ─────────────────────────────────────── */}
						<DropdownMenuContent
							className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
							align="start"
							side={isMobile ? "bottom" : "right"}
							sideOffset={4}
						>
							<DropdownMenuLabel className="text-muted-foreground text-xs">
								Organisasi
							</DropdownMenuLabel>

							{/* Loading skeleton */}
							{isPending && (
								<div className="space-y-1 p-1">
									{Array.from({ length: 2 }).map((_, i) => (
										<div
											key={i}
											className="h-8 animate-pulse rounded-md bg-muted"
										/>
									))}
								</div>
							)}

							{/* Empty */}
							{!isPending && orgs.length === 0 && (
								<p className="px-2 py-3 text-center text-muted-foreground text-xs">
									Belum ada organisasi
								</p>
							)}

							{/* List organisasi */}
							{!isPending &&
								orgs.map((org) => {
									const isActive = org.id === activeOrg?.id;
									const orgInitials = org.name.slice(0, 2).toUpperCase();

									return (
										<DropdownMenuItem
											key={org.id}
											onClick={() => handleSwitch(org.id)}
											className="gap-2 p-2"
											data-active={isActive}
										>
											<Avatar className="size-6 rounded-md">
												<AvatarImage
													src={org.logo ?? undefined}
													alt={org.name}
												/>
												<AvatarFallback className="rounded-md font-semibold text-[10px]">
													{orgInitials}
												</AvatarFallback>
											</Avatar>

											<span className="flex-1 truncate">{org.name}</span>

											{/* Indikator org aktif */}
											{isActive && (
												<span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
											)}
										</DropdownMenuItem>
									);
								})}

							<DropdownMenuSeparator />

							{/* Tombol buat organisasi baru */}
							<DropdownMenuItem
								className="gap-2 p-2"
								onClick={() => setOpenCreate(true)}
							>
								<div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
									<PlusIcon className="size-4" />
								</div>
								<span className="font-medium text-muted-foreground">
									Buat Organisasi
								</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>

			{/* ── Dialog buat organisasi ───────────────────────────────────────── */}
			<DialogCreateOrganization
				open={openCreate}
				onOpenChange={setOpenCreate}
				onCreated={() => refetch?.()}
			/>
		</>
	);
}
