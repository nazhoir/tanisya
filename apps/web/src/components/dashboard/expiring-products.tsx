"use client";

import { AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tanisya/ui/components/card";
import { Badge } from "@tanisya/ui/components/badge";

// Placeholder — sambungkan ke orpc.projectProducts.getAll saat siap
const MOCK_EXPIRING = [
  { label: "example.com",   type: "domain",      expiresAt: "2025-04-01", daysLeft: 29 },
  { label: "VPS Starter",   type: "hosting_vps", expiresAt: "2025-03-25", daysLeft: 22 },
  { label: "SSL Wildcard",  type: "ssl",          expiresAt: "2025-03-20", daysLeft: 17 },
];

export function ExpiringProducts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Segera Kadaluarsa
        </CardTitle>
        <CardDescription>Produk yang expire dalam 30 hari</CardDescription>
      </CardHeader>
      <CardContent>
        {MOCK_EXPIRING.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Tidak ada produk yang akan segera kadaluarsa.
          </p>
        ) : (
          <div className="space-y-3">
            {MOCK_EXPIRING.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.expiresAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                </div>
                <Badge
                  variant={item.daysLeft <= 14 ? "destructive" : "secondary"}
                  className="shrink-0"
                >
                  {item.daysLeft}h lagi
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}