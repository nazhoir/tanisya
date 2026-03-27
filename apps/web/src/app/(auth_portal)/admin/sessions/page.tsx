import { SidebarPageHeader } from "@/components/sidebar-page-header";

export default function Page() {
	return (
		<>
			<SidebarPageHeader
				items={[
					{ label: "Manajemen", href: "/admin" },
					{ label: "Sesi Pengguna" },
				]}
			/>
			<div className="flex flex-1 flex-col gap-4 p-4">
				<div>
					<h1 className="font-bold text-2xl tracking-tight">
						Manajemen Sesi Pengguna
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Kelola semua pengguna yang terdaftar di sistem.
					</p>
				</div>
			</div>
		</>
	);
}
