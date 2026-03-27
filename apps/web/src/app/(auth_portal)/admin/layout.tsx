import { auth } from "@tanisya/auth";
import { SidebarInset, SidebarProvider } from "@tanisya/ui/components/sidebar";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AccountSidebar } from "@/components/account-sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session || session.user.role != "admin") {
		notFound();
	}

	return (
		<SidebarProvider>
			<AdminSidebar />
			<SidebarInset>{children}</SidebarInset>
		</SidebarProvider>
	);
}
