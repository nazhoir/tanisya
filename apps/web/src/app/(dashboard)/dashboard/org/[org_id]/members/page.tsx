import { auth } from "@tanisya/auth";
import { headers } from "next/headers";
import { SidebarPageHeader } from "@/components/sidebar-page-header";
import { UsersGrid } from "./users-grid";
import { UsersToolbar } from "./users-toolbar";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SearchParams = {
	q?: string;
	searchField?: "name" | "email";
	filterField?: "role" | "createdAt";
	filterValue?: string;
	filterOperator?: "eq" | "contains" | "starts_with";
	sortBy?: "name" | "email" | "createdAt" | "role";
	sortDirection?: "asc" | "desc";
	limit?: string;
	offset?: string;
};

type PageProps = {
	params: Promise<{ org_id: string }>;
	searchParams: Promise<SearchParams>;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function Page({ params, searchParams }: PageProps) {
	const { org_id } = await params;
	const sp = await searchParams;

	const limit = Math.min(Number(sp.limit) || 20, 100);
	const offset = Math.max(Number(sp.offset) || 0, 0);

	const query: Record<string, unknown> = {
		organizationId: org_id,
		limit,
		offset,
	};

	if (sp.q?.trim()) {
		query.searchValue = sp.q.trim();
		query.searchField = sp.searchField ?? "name";
		query.searchOperator = "contains";
	}

	if (sp.filterField && sp.filterValue?.trim()) {
		query.filterField = sp.filterField;
		query.filterValue = sp.filterValue.trim();
		query.filterOperator = sp.filterOperator ?? "eq";
	}

	if (sp.sortBy) {
		query.sortBy = sp.sortBy;
		query.sortDirection = sp.sortDirection ?? "asc";
	}

	const { members, total } = await auth.api.listMembers({
		query,
		headers: await headers(),
	});

	interface DataMember {
		 
	id: string;
	name: string;
	email?: string | null;
	image?: string | null;
	role?: string;
	createdAt?: Date | string;
	emailVerified?: boolean;
}

	const datamembers:DataMember[] = members.map((member) => ({
		id: member.id,
		name: member.user.name,
		email: member.user.email,
		role: member.role,
		createdAt: member.createdAt,
		image: member.user.image,
	}));

	return (
		<>
			<SidebarPageHeader
				items={[
					{ label: "Organisasi", href: `/dashboard/org/${org_id}` },
					{ label: "Anggota" },
				]}
			/>
			<div className="flex flex-1 flex-col gap-4 p-4">
				<div>
					<h1 className="font-bold text-2xl tracking-tight">
						Anggota Organisasi
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Kelola semua anggota yang terdaftar di organisasi ini.
					</p>
				</div>

				<UsersToolbar
					total={total ?? members.length}
					currentParams={sp}
					limit={limit}
					offset={offset}
				/>

				<UsersGrid users={datamembers} />
			</div>
		</>
	);
}