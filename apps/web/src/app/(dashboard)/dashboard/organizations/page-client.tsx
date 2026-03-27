"use client";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@tanisya/ui/components/avatar";
import { Button } from "@tanisya/ui/components/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@tanisya/ui/components/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@tanisya/ui/components/empty";
import { Input } from "@tanisya/ui/components/input";
import { FolderKanban, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DialogCreateOrganization } from "@/components/auth/dialog-create-organization-form";
import Logo from "@/components/logo";
import UserMenu from "@/components/user-menu";
import { authClient } from "@/lib/auth-client";

// ─── Sub-component: EmptyState ────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<FolderKanban />
				</EmptyMedia>
				<EmptyTitle>Belum ada Organisasi</EmptyTitle>
				<EmptyDescription>
					Kamu belum membuat organisasi. Mulai dengan membuat Organisasi
					Pertamamu.
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent className="flex-row justify-center gap-2">
				<Button onClick={onNew}>
					<Plus className="mr-2 h-4 w-4" />
					Buat Organisasi
				</Button>
			</EmptyContent>
		</Empty>
	);
}

export default function OrganizationsPageClient() {
	const router = useRouter();
	const {
		data: organizations,
		isPending,
		refetch,
	} = authClient.useListOrganizations();

	const [search, setSearch] = useState("");
	const [openCreate, setOpenCreate] = useState(false);

	const orgs = organizations ?? [];
	const filtered = orgs.filter((o) =>
		o.name?.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<>
			{/* ── Topbar ────────────────────────────────────────────────────────── */}
			<header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-2">
				<Logo />
				<UserMenu />
			</header>

			{/* ── Content ───────────────────────────────────────────────────────── */}
			<main className="container mx-auto px-8 py-10">
				<h1 className="mb-8 font-semibold text-2xl">Organisasi Kamu</h1>

				{/* Search + New */}
				<div className="mb-6 flex items-center justify-between">
					<div className="relative w-64">
						<Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Cari organisasi..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="h-9 pl-9 text-sm"
						/>
					</div>

					<Button onClick={() => setOpenCreate(true)}>
						<Plus className="mr-1.5 h-4 w-4" />
						Organisasi Baru
					</Button>
				</div>

				{/* Loading */}
				{isPending && (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								key={i}
								className="h-24 animate-pulse rounded-xl border bg-muted"
							/>
						))}
					</div>
				)}

				{/* Empty state */}
				{!isPending && orgs.length === 0 && search === "" && (
					<EmptyState onNew={() => setOpenCreate(true)} />
				)}

				{/* Search empty */}
				{!isPending && filtered.length === 0 && search !== "" && (
					<p className="py-10 text-center text-muted-foreground text-sm">
						Tidak ada organisasi yang cocok dengan &ldquo;{search}&rdquo;
					</p>
				)}

				{/* List */}
				{!isPending && filtered.length > 0 && (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{filtered.map((org) => (
							<Link
								href={`/dashboard/org/${org.id}`}
								key={org.id}
								onClick={async (e) => {
									e.preventDefault();
									await authClient.organization.setActive({
										organizationId: org.id,
										organizationSlug: org.slug,
									});

									router.push(`/dashboard/org/${org.id}`);
								}}
							>
								<Card className="cursor-pointer transition-colors hover:bg-muted">
									<CardHeader className="flex flex-row items-center gap-3">
										<Avatar className="h-10 w-10 rounded-lg">
											<AvatarImage src={org.logo ?? undefined} alt={org.name} />
											<AvatarFallback className="font-semibold text-sm">
												{org.name.slice(0, 2).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div>
											<CardTitle className="text-sm">{org.name}</CardTitle>
											<CardDescription className="text-xs">
												/{org.slug}
											</CardDescription>
										</div>
									</CardHeader>
								</Card>
							</Link>
						))}
					</div>
				)}
			</main>

			{/* ── Dialog buat organisasi ────────────────────────────────────────── */}
			<DialogCreateOrganization
				open={openCreate}
				onOpenChange={setOpenCreate}
				onCreated={() => refetch?.()}
			/>
		</>
	);
}
