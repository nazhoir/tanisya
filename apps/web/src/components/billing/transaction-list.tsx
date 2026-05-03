"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@tanisya/ui/components/card";
import { Loader2 } from "lucide-react";

interface Transaction {
  id: string;
  pointsCost?: number;
  createdAt?: string;
  itemSnapshot?: {
    description?: string;
  };
}

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function TransactionList({ transactions, isLoading }: TransactionListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Riwayat Mutasi Saldo</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                Belum ada riwayat mutasi.
              </p>
            )}
            {transactions.map((tx) => {
              const snapshot = tx.itemSnapshot || {};
              const isIncoming = (tx.pointsCost ?? 0) > 0;
              return (
                <div
                  key={tx.id}
                  className="flex justify-between items-center p-3 border rounded-lg bg-card"
                >
                  <div>
                    <p className="text-sm font-bold">
                      {snapshot?.description || "Transaksi"}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground mt-1">
                      {tx.id}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span
                      className={`inline-block text-sm font-bold ${
                        isIncoming ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isIncoming ? "+" : ""}
                      {tx.pointsCost?.toLocaleString("id-ID")} Poin
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {tx.createdAt
                        ? new Date(tx.createdAt).toLocaleDateString("id-ID")
                        : "-"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
