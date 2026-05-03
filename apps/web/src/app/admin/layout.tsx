import { headers } from "next/headers";
import { AppSidebarAdmin } from "@/components/admin/app-sidebar-admin";
import { SiteHeader } from "@/components/site-header";
import { authClient } from "@/lib/auth-client";
import { SidebarInset, SidebarProvider } from "@tanisya/ui/components/sidebar";
import { redirect } from "next/navigation";
import { NotAdmin } from "@/components/admin/not-admin";

export default async function AdminLayput({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      throw: true,
    },
  });

  if (!session?.user) {
    redirect("/login");
  }


  if(session.user.role != "admin"){
    return (
        <div className="w-screen h-screen flex items-center justify-center">

            <NotAdmin/>
        </div>
    )
  }
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebarAdmin variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
