"use client";

import {
  FolderKanban,
  ShoppingCart,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@tanisya/ui/components/card";
import { Skeleton } from "@tanisya/ui/components/skeleton";

interface StatsProps {
  stats: {
    totalProjects:        number;
    totalOrders:          number;
    pendingVerifications: number;
    isLoading:            boolean;
  };
}

export function StatsCards({ stats }: StatsProps) {
  const cards = [
    {
      title:       "Total Projects",
      value:       stats.totalProjects,
      icon:        FolderKanban,
      description: "Project aktif",
      color:       "text-blue-500",
    },
    {
      title:       "Total Orders",
      value:       stats.totalOrders,
      icon:        ShoppingCart,
      description: "Semua order",
      color:       "text-green-500",
    },
    {
      title:       "Menunggu Verifikasi",
      value:       stats.pendingVerifications,
      icon:        Clock,
      description: "Pembayaran manual",
      color:       "text-amber-500",
    },
    {
      title:       "Produk Aktif",
      value:       "—",
      icon:        TrendingUp,
      description: "Akan segera tersedia",
      color:       "text-purple-500",
    },
  ];

  if (stats.isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-1 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}