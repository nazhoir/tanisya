import { SidebarInset, SidebarProvider } from "@tanisya/ui/components/sidebar";
import { AccountSidebar } from "@/components/account-sidebar";

export default function AccountLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider>
			<AccountSidebar />
			<SidebarInset>{children}</SidebarInset>
		</SidebarProvider>
	);
}
