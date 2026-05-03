"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@tanisya/ui/components/card";
import { Loader2 } from "lucide-react";

interface Invoice {
  id: string;
  pointsAdded?: number;
  status: string;
  createdAt?: string;
}

interface InvoiceListProps {
  invoices: Invoice[];
  isLoading: boolean;
}

export function InvoiceList({ invoices, isLoading }: InvoiceListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Daftar Tagihan</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                Belum ada tagihan.
              </p>
            )}
            {invoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/billing/invoice/${inv.id}`}
                className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50"
              >
                <div>
                  <p className="text-sm font-bold">
                    {inv.pointsAdded?.toLocaleString("id-ID")} Poin
                  </p>
                  <p className="text-xs font-mono text-muted-foreground mt-1">
                    {inv.id}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="inline-block px-2 py-1 text-[10px] font-bold rounded uppercase bg-muted text-foreground">
                    {inv.status}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {inv.createdAt
                      ? new Date(inv.createdAt).toLocaleDateString("id-ID")
                      : "-"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
