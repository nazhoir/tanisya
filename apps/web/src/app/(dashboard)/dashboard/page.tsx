import { headers } from "next/headers";
import { auth } from "@tanisya/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  return (
    <>
      <PageHeader crumbs={[{ label: "Dashboard" }]} />
      <DashboardClient session={session!} />
    </>
  );
}