"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { toast } from "sonner";

import { Badge }    from "@tanisya/ui/components/badge";
import { Button }   from "@tanisya/ui/components/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@tanisya/ui/components/table";
import { Skeleton }               from "@tanisya/ui/components/skeleton";
import { PaginationControls }     from "@/components/pagination-controls";
import { VerifyPaymentDialog }    from "./verify-payment-dialog";
import { PageHeader }             from "@/components/dashboard/page-header";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@tanisya/ui/components/select";

const STATUS_VARIANT: Record<string, any> = {
  paid:             "default",
  verified:         "default",
  awaiting_verify:  "secondary",
  pending:          "outline",
  failed:           "destructive",
  cancelled:        "destructive",
  refunded:         "outline",
  expired:          "outline",
};

export function PaymentsClient() {
  const qc = useQueryClient();
  const [page, setPage]                   = useState(1);
  const [statusFilter, setStatusFilter]   = useState<string>("all");
  const [verifying, setVerifying]         = useState<any>(null);

  const query = useQuery(
    orpc.payments.getAll.queryOptions({
      input: {
        page,
        limit: 10,
        status: statusFilter === "all" ? undefined : (statusFilter as any),
      },
    })
  );

  const verifyMutation = useMutation(
    orpc.payments.verify.mutationOptions({
      onSuccess: () => {
        toast.success("Pembayaran berhasil diverifikasi");
        qc.invalidateQueries({ queryKey: ["payments"] });
        setVerifying(null);
      },
      onError: () => toast.error("Gagal memverifikasi pembayaran"),
    })
  );

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Payments" }]}
      />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Payments</h2>
            <p className="text-sm text-muted-foreground">Kelola semua pembayaran</p>
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="awaiting_verify">Menunggu Verifikasi</SelectItem>
              <SelectItem value="verified">Terverifikasi</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="failed">Gagal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (query.data?.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Tidak ada data pembayaran.
                  </TableCell>
                </TableRow>
              ) : (
                (query.data?.data ?? []).map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-sm">#{row.invoiceId}</TableCell>
                    <TableCell className="capitalize">{row.method.replace("_", " ")}</TableCell>
                    <TableCell>Rp {Number(row.amount).toLocaleString("id-ID")}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[row.status] ?? "outline"}>
                        {row.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(row.createdAt).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>
                      {row.status === "awaiting_verify" && (
                        <Button size="sm" variant="outline" onClick={() => setVerifying(row)}>
                          Verifikasi
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {query.data?.meta && (
          <PaginationControls
            page={page}
            totalPages={query.data.meta.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      <VerifyPaymentDialog
        open={!!verifying}
        payment={verifying}
        onOpenChange={(open) => !open && setVerifying(null)}
        onSubmit={(values) => verifyMutation.mutate({ id: verifying.id, ...values })}
        isPending={verifyMutation.isPending}
      />
    </>
  );
}