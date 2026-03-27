import { auth } from "@tanisya/auth";
import { SidebarInset, SidebarProvider } from "@tanisya/ui/components/sidebar";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";

export default async function OrganizationLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ org_id: string }>;
}) {
	const { org_id } = await params;

	return (
		<SidebarProvider>
			<AppSidebar baseurl={`/dashboard/org/${org_id}`} />
			<SidebarInset>{children}</SidebarInset>
		</SidebarProvider>
	);
}
