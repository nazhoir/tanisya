import { SidebarInset, SidebarProvider } from "@tanisya/ui/components/sidebar";
import { redirect } from "next/navigation";
import { AccountSidebar } from "@/components/account-sidebar";
import { auth } from "@tanisya/auth";
import { headers } from "next/headers";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {

    redirect("/auth/login");


  }

  return (
    <SidebarProvider>
      <AccountSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}