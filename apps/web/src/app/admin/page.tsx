// apps/web/src/app/(protect)/billing/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tanisya/ui/components/tabs";
import { Card, CardContent } from "@tanisya/ui/components/card";
import { Loader2, Receipt, History } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { orpc } from "@/utils/orpc";
import { authClient } from "@/lib/auth-client";

import { BalanceCard } from "@/components/billing/balance-card";
import { InvoiceList } from "@/components/billing/invoice-list";
import { TransactionList } from "@/components/billing/transaction-list";
import { TopupSheet, type TopupPayload } from "@/components/billing/topup-sheet";

export default function BillingPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { data: activeOrganization, isPending: isOrgPending } =
    authClient.useActiveOrganization();

  const orgId = activeOrganization?.id || "";

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // ─── Queries ────────────────────────────────────────────────────────────

  const balanceQuery = useQuery({
    ...orpc.billing.getPointBalance.queryOptions({
      input: { organizationId: orgId },
    }),
    enabled: !!orgId,
  });

  const invoicesQuery = useQuery({
    ...orpc.billing.getInvoices.queryOptions({
      input: { organizationId: orgId, limit: 10, offset: 0 },
    }),
    enabled: !!orgId,
  });

  const transactionsQuery = useQuery({
    ...orpc.billing.getTransactions.queryOptions({
      input: { organizationId: orgId, limit: 10, offset: 0 },
    }),
    enabled: !!orgId,
  });

  // ─── Mutations ──────────────────────────────────────────────────────────

  const createTopupMutation = useMutation(
    orpc.billing.createTopup.mutationOptions({
      onSuccess: (data: any) => {
        balanceQuery.refetch();
        invoicesQuery.refetch();
        setIsSheetOpen(false);
        router.push(`/billing/invoice/${data?.id}`);
      },
      onError: (error: any) =>
        alert(error?.message || "Terjadi kesalahan"),
    })
  );

  // ─── Data Normalization ─────────────────────────────────────────────────

  const rawInvoices = invoicesQuery.data as any;
  const invoicesList: any[] = Array.isArray(rawInvoices)
    ? rawInvoices
    : rawInvoices?.items || rawInvoices?.data || [];

  const rawTx = transactionsQuery.data as any;
  const transactionsList: any[] = Array.isArray(rawTx)
    ? rawTx
    : rawTx?.items || rawTx?.data || [];

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleTopupSubmit = (payload: TopupPayload) => {
    createTopupMutation.mutate({
      ...payload,
      paymentProvider: payload.paymentProvider as any,
    });
  };

  // ─── Guards ─────────────────────────────────────────────────────────────

  if (isOrgPending) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!activeOrganization) {
    return (
      <div className="mx-auto w-full max-w-3xl py-10">
        <Card>
          <CardContent className="p-10 text-center">
            Organisasi Tidak Ditemukan
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-4xl py-10 space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Tagihan & Saldo</h1>
        <p className="text-muted-foreground">
          Kelola keuangan untuk proyek anda
        </p>
      </div>

      <BalanceCard
        organizationName={activeOrganization.name}
        balance={balanceQuery.data?.balance}
        isLoading={balanceQuery.isLoading}
        onTopUp={() => setIsSheetOpen(true)}
      />

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invoices">
            <Receipt className="w-4 h-4 mr-2" /> Tagihan (Invoice)
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <History className="w-4 h-4 mr-2" /> Riwayat Mutasi (Kuitansi)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <InvoiceList
            invoices={invoicesList}
            isLoading={invoicesQuery.isLoading}
          />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionList
            transactions={transactionsList}
            isLoading={transactionsQuery.isLoading}
          />
        </TabsContent>
      </Tabs>

      <TopupSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSubmit={handleTopupSubmit}
        isSubmitting={createTopupMutation.isPending}
        organizationId={orgId}
      />
    </div>
  );
}
