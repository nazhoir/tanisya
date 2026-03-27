"use client";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@tanisya/ui/components/breadcrumb";
import { Button } from "@tanisya/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@tanisya/ui/components/dropdown-menu";
import { Separator } from "@tanisya/ui/components/separator";
import { SidebarTrigger } from "@tanisya/ui/components/sidebar";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

interface BreadcrumbItemType {
	label: string;
	href?: string;
}

interface AutoBreadcrumbProps {
	items: BreadcrumbItemType[];
}

export function AutoBreadcrumb({ items }: AutoBreadcrumbProps) {
	if (!items || items.length === 0) return null;

	// Jika <= 3 tampilkan semua
	if (items.length <= 3) {
		return (
			<Breadcrumb>
				<BreadcrumbList>
					{items.map((item, index) => (
						<div key={index} className="flex items-center">
							<BreadcrumbItem>
								{index === items.length - 1 ? (
									<BreadcrumbPage>{item.label}</BreadcrumbPage>
								) : item.href ? (
									<BreadcrumbLink asChild>
										<Link href={item.href as any}>{item.label}</Link>
									</BreadcrumbLink>
								) : (
									<BreadcrumbPage>{item.label}</BreadcrumbPage>
								)}
							</BreadcrumbItem>

							{index < items.length - 1 && <BreadcrumbSeparator />}
						</div>
					))}
				</BreadcrumbList>
			</Breadcrumb>
		);
	}

	// Jika > 3
	const first = items[0];
	const last = items[items.length - 1];
	const secondLast = items[items.length - 2];
	const middle = items.slice(1, -2);

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{/* First */}
				<BreadcrumbItem>
					{first.href ? (
						<BreadcrumbLink asChild>
							<Link href={first.href as any}>{first.label}</Link>
						</BreadcrumbLink>
					) : (
						<BreadcrumbPage>{first.label}</BreadcrumbPage>
					)}
				</BreadcrumbItem>

				<BreadcrumbSeparator />

				{/* Middle Dropdown */}
				<BreadcrumbItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="h-6 w-6">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="start">
							{middle.map((item, index) => (
								<DropdownMenuItem key={index} asChild>
									{item.href ? (
										<Link href={item.href as any}>{item.label}</Link>
									) : (
										<span>{item.label}</span>
									)}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</BreadcrumbItem>

				<BreadcrumbSeparator />

				{/* Second Last */}
				<BreadcrumbItem>
					{secondLast.href ? (
						<BreadcrumbLink asChild>
							<Link href={secondLast.href as any}>{secondLast.label}</Link>
						</BreadcrumbLink>
					) : (
						<BreadcrumbPage>{secondLast.label}</BreadcrumbPage>
					)}
				</BreadcrumbItem>

				<BreadcrumbSeparator />

				{/* Last */}
				<BreadcrumbItem>
					<BreadcrumbPage>{last.label}</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}

interface SidebarPageHeaderProps extends AutoBreadcrumbProps {}

export function SidebarPageHeader({ items }: SidebarPageHeaderProps) {
	if (!items || items.length === 0) return null;

	const first = items[0];
	const last = items[items.length - 2];
	const middle = items.slice(2, -2);

	return (
		<header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
			<div className="flex items-center gap-2 px-4">
				<SidebarTrigger className="-ms-1" />
				<Separator
					orientation="vertical"
					className="me-2 data-vertical:h-4 data-vertical:self-auto"
				/>
				<AutoBreadcrumb items={items} />
			</div>
		</header>
	);
}
