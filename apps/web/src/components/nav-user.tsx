"use client";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@tanisya/ui/components/avatar";
import { Button } from "@tanisya/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
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
import { Skeleton } from "@tanisya/ui/components/skeleton";
import {
	BadgeCheckIcon,
	BellIcon,
	ChevronsUpDownIcon,
	CreditCard,
	CreditCardIcon,
	LogOutIcon,
	Settings,
	SparklesIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function getInitials(name: string) {
	return name
		.split(" ")
		.map((w) => w[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}
export function NavUser() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	// ── Loading state ─────────────────────────────────────────────────────────
	if (isPending || !session) {
		return (
			<div className="flex items-center gap-2">
				<Skeleton className="h-7 w-7 rounded-full" />
				<Skeleton className="hidden h-3.5 w-20 sm:block" />
			</div>
		);
	}

	// ── Sign out ──────────────────────────────────────────────────────────────
	const handleSignOut = () => {
		authClient.signOut({
			fetchOptions: { onSuccess: () => router.push("/") },
		});
	};

	const { name, email, image } = session.user;
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage src={image ?? undefined} alt={name} />
								<AvatarFallback className="bg-primary font-bold text-primary-foreground text-xs">
									{getInitials(name)}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-start text-sm leading-tight">
								<span className="truncate font-medium"> {name}</span>
								<span className="truncate text-xs">{email}</span>
							</div>
							<ChevronsUpDownIcon className="ms-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
								<Avatar className="h-9 w-9 shrink-0">
									<AvatarImage src={image ?? undefined} alt={name} />
									<AvatarFallback className="bg-primary font-bold text-primary-foreground text-xs">
										{getInitials(name)}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0 flex-1">
									<p className="truncate font-semibold text-sm leading-tight">
										{name}
									</p>
									<p className="mt-0.5 truncate text-[11px] text-muted-foreground leading-tight">
										{email}
									</p>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />

						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<Link href="/account" className="cursor-pointer gap-2.5">
									<Settings className="h-4 w-4 text-muted-foreground" />
									Pengaturan Akun
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link
									href="/account/billing"
									className="cursor-pointer gap-2.5"
								>
									<CreditCard className="h-4 w-4 text-muted-foreground" />
									Tagihan
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Button
								variant={"destructive"}
								onClick={handleSignOut}
								className="w-full justify-start"
							>
								<LogOutIcon className="h-4 w-4" />
								Log out
							</Button>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
