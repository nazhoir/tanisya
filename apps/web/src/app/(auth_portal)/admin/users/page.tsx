import { auth } from "@tanisya/auth";
import { headers } from "next/headers";
import { SidebarPageHeader } from "@/components/sidebar-page-header";
import { UsersGrid } from "./users-grid";
import { UsersToolbar } from "./users-toolbar";

// ─── Types (shared, re-export) ────────────────────────────────────────────────

export type SearchParams = {
	q?: string; // searchValue → name/email
	searchField?: "name" | "email";
	filterField?: "email" | "role" | "emailVerified";
	filterValue?: string;
	filterOperator?: "eq" | "contains" | "starts_with";
	sortBy?: "name" | "email" | "createdAt";
	sortDirection?: "asc" | "desc";
	limit?: string;
	offset?: string;
};

type PageProps = {
	searchParams: Promise<SearchParams>;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function Page({ searchParams }: PageProps) {
	const sp = await searchParams;

	const limit = Math.min(Number(sp.limit) || 20, 100);
	const offset = Math.max(Number(sp.offset) || 0, 0);

	// Hanya sertakan field yang benar-benar ada
	const query: Record<string, unknown> = { limit, offset };

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

	const { users, total } = await auth.api.listUsers({
		query,
		headers: await headers(),
	});

	return (
		<>
			<SidebarPageHeader
				items={[{ label: "Manajemen", href: "/admin" }, { label: "Pengguna" }]}
			/>
			<div className="flex flex-1 flex-col gap-4 p-4">
				<div>
					<h1 className="font-bold text-2xl tracking-tight">
						Manajemen Pengguna
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Kelola semua pengguna yang terdaftar di sistem.
					</p>
				</div>

				{/* Toolbar: search, filter, sort — client, ubah URL params */}
				<UsersToolbar
					total={total ?? users.length}
					currentParams={sp}
					limit={limit}
					offset={offset}
				/>

				{/* Grid: cards + sheet — client */}
				<UsersGrid users={users} />
			</div>
		</>
	);
}
