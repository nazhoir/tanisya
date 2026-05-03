"use client";

import { Button } from "@tanisya/ui/components/button";
import { Card, CardContent } from "@tanisya/ui/components/card";
import { Loader2, PlusCircle, Wallet } from "lucide-react";

interface BalanceCardProps {
  organizationName: string;
  balance: number | undefined;
  isLoading: boolean;
  onTopUp: () => void;
}

export function BalanceCard({
  organizationName,
  balance,
  isLoading,
  onTopUp,
}: BalanceCardProps) {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Saldo Poin Saat Ini
            </p>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin mt-1" />
            ) : (
              <h2 className="text-3xl font-bold">
                {balance?.toLocaleString("id-ID") || 0}{" "}
                <span className="text-lg font-normal text-muted-foreground">
                  Poin
                </span>
              </h2>
            )}
          </div>
        </div>
        <Button onClick={onTopUp}>
          <PlusCircle className="w-4 h-4 mr-2" /> Top Up Saldo
        </Button>
      </CardContent>
    </Card>
  );
}
