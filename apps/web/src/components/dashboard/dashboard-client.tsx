"use client";

import { useQuery } from "@tanstack/react-query";
import type { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

import { StatsCards }        from "./stats-cards";
import { RecentOrders }      from "./recent-orders";
import { ExpiringProducts }  from "./expiring-products";

type Session = typeof authClient.$Infer.Session;

export function DashboardClient({ session }: { session: Session }) {
  const projectsQuery = useQuery(
    orpc.projects.getAll.queryOptions({ input: { page: 1, limit: 5 } })
  );
  const ordersQuery = useQuery(
    orpc.orders.getAll.queryOptions({ input: { page: 1, limit: 5 } })
  );
  const paymentsQuery = useQuery(
    orpc.payments.getAll.queryOptions({ input: { page: 1, limit: 5, status: "awaiting_verify" } })
  );

  const stats = {
    totalProjects:        projectsQuery.data?.meta.total  ?? 0,
    totalOrders:          ordersQuery.data?.meta.total    ?? 0,
    pendingVerifications: paymentsQuery.data?.meta.total  ?? 0,
    isLoading:
      projectsQuery.isLoading ||
      ordersQuery.isLoading   ||
      paymentsQuery.isLoading,
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Selamat datang, {session?.user.name} 👋
        </h1>
        <p className="text-muted-foreground">
          Berikut ringkasan aktivitas akun Anda hari ini.
        </p>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Bottom grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentOrders orders={ordersQuery.data?.data ?? []} isLoading={ordersQuery.isLoading} />
        <ExpiringProducts />
      </div>
    </div>
  );
}