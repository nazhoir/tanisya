"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@tanisya/ui/components/badge";
import { Button } from "@tanisya/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tanisya/ui/components/card";
import { Skeleton } from "@tanisya/ui/components/skeleton";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completed:  "default",
  paid:       "default",
  pending:    "secondary",
  processing: "secondary",
  draft:      "outline",
  failed:     "destructive",
  cancelled:  "destructive",
  refunded:   "outline",
};

export function RecentOrders({
  orders,
  isLoading,
}: {
  orders: any[];
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Order Terbaru</CardTitle>
          <CardDescription>5 order terakhir</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/orders">
            Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Belum ada order.
          </p>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    Rp {Number(order.grandTotal).toLocaleString("id-ID")}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[order.status] ?? "outline"}>
                  {order.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}