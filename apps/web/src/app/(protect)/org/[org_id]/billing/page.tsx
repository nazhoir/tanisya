// apps/web/src/app/(protect)/billing/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@tanisya/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@tanisya/ui/components/card";
import { Input } from "@tanisya/ui/components/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@tanisya/ui/components/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tanisya/ui/components/tabs";
import { RadioGroup, RadioGroupItem } from "@tanisya/ui/components/radio-group";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, PlusCircle, Receipt, Wallet, ArrowLeft, History } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { orpc } from "@/utils/orpc";
import { authClient } from "@/lib/auth-client";

const MANUAL_CATEGORIES = [
  {
    label: "Transfer Bank Manual",
    channel: [
      { channel_code: "MANUAL_BRI", display_name: "Transfer BRI", vendor: "MANUAL", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_2020.svg", payment_fees: null },
      { channel_code: "MANUAL_BCA", display_name: "Transfer BCA", vendor: "MANUAL", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg", payment_fees: null },
    ]
  }
];

const GATEWAY_CATEGORIES = [
  {
    label: "QR Code",
    channel: [
      { channel_code: "QRIS", display_name: "QRIS", vendor: "xendit", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg", payment_fees: { fixed: null, percent: 0.7, maximal: null, additional: null } }
    ]
  }
];

const calculateTransactionFee = (amount: number, feeStructure: any) => {
  if (!feeStructure) return 0;
  let totalFee = 0;
  if (feeStructure.percent) totalFee += amount * (feeStructure.maximal ? feeStructure.maximal : feeStructure.percent) / 100;
  if (feeStructure.fixed) totalFee += feeStructure.fixed;
  if (feeStructure.additional && feeStructure.percent !== null) totalFee += feeStructure.additional;
  return Math.ceil(totalFee);
};

export default function BillingPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { data: activeOrganization, isPending: isOrgPending } = authClient.useActiveOrganization();
  
  const orgId = activeOrganization?.id || "";
  const userId = session?.user?.id || "";

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState<"MANUAL" | "GATEWAY">("GATEWAY");
  const [channelCode, setChannelCode] = useState<string>("");
  const [uniqueCode, setUniqueCode] = useState<number>(0);

  useEffect(() => {
    setUniqueCode(Math.floor(Math.random() * 900) + 100);
  }, [amount, paymentMethod]);

  const balanceQuery = useQuery({
    ...orpc.billing.getPointBalance.queryOptions({ input: { organizationId: orgId } }),
    enabled: !!orgId,
  });

  // PERBAIKAN 1: Menyesuaikan nama fungsi sesuai dengan ketersediaan di backend router (getInvoices)
  const invoicesQuery = useQuery({
    ...orpc.billing.getInvoices.queryOptions({ input: { organizationId: orgId, limit: 10, offset: 0 } }),
    enabled: !!orgId,
  });

  // PERBAIKAN 2: Menyesuaikan nama fungsi dari getTransactionHistory ke getTransactions
  const transactionsQuery = useQuery({
    ...orpc.billing.getTransactions.queryOptions({ input: { organizationId: orgId, limit: 10, offset: 0 } }),
    enabled: !!orgId,
  });

  // PERBAIKAN 3 & 4: Menyesuaikan nama mutasi ke createTopup dan memberikan explicit type (: any)
  const createTopupMutation = useMutation(
    orpc.billing.createTopup.mutationOptions({
      onSuccess: (data: any) => {
        balanceQuery.refetch();
        invoicesQuery.refetch();
        setAmount("");
        setChannelCode("");
        setIsSheetOpen(false);
        setStep(1);
        // router.push(`/billing/invoice/${data?.id}`);
      },
      onError: (error: any) => alert(error?.message || "Terjadi kesalahan")
    })
  );

  const selectedChannelData = useMemo(() => {
    if (!channelCode) return null;
    if (paymentMethod === "MANUAL") return MANUAL_CATEGORIES[0].channel.find(c => c.channel_code === channelCode) || null;
    for (const cat of GATEWAY_CATEGORIES) {
      const found = cat.channel.find(c => c.channel_code === channelCode);
      if (found) return found;
    }
    return null;
  }, [channelCode, paymentMethod]);

  const breakdown = useMemo(() => {
    const base = Number(amount) || 0;
    const tax = Math.floor(base * 0.11);
    if (!selectedChannelData) return { base, tax, transactionFee: 0, uniqueCode: 0, total: base + tax };
    const transactionFee = paymentMethod === "MANUAL" ? 0 : calculateTransactionFee(base, selectedChannelData.payment_fees);
    const code = paymentMethod === "MANUAL" ? uniqueCode : 0;
    return { base, tax, transactionFee, uniqueCode: code, total: base + tax + transactionFee + code };
  }, [amount, paymentMethod, selectedChannelData, uniqueCode]);

  const handleSubmitTopup = () => {
    if (!orgId || !userId || !selectedChannelData) return;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 5);
    createTopupMutation.mutate({
      organizationId: orgId,
      amount: breakdown.total,
      pointsAdded: breakdown.base, 
      paymentProvider: selectedChannelData.vendor.toUpperCase() as any,
      paymentChannel: selectedChannelData.channel_code,
      customDueDate: dueDate,
    });
  };

  // PERBAIKAN 5: Handling aman untuk Array Map agar TypeScript tidak error "Property 'length' / 'map' does not exist"
  const rawInvoices = invoicesQuery.data as any;
  const invoicesList: any[] = Array.isArray(rawInvoices) ? rawInvoices : (rawInvoices?.items || rawInvoices?.data || []);

  const rawTx = transactionsQuery.data as any;
  const transactionsList: any[] = Array.isArray(rawTx) ? rawTx : (rawTx?.items || rawTx?.data || []);

  if (isOrgPending) return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!activeOrganization) return <div className="mx-auto w-full max-w-3xl py-10"><Card><CardContent className="p-10 text-center">Organisasi Tidak Ditemukan</CardContent></Card></div>;

  return (
    <div className="mx-auto w-full max-w-4xl py-10 space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Tagihan & Saldo</h1>
        <p className="text-muted-foreground">Kelola keuangan proyek anda</p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-full"><Wallet className="h-8 w-8 text-primary" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Saldo Poin Saat Ini</p>
              {balanceQuery.isLoading ? <Loader2 className="h-6 w-6 animate-spin mt-1" /> : <h2 className="text-3xl font-bold">{balanceQuery.data?.balance?.toLocaleString("id-ID") || 0} <span className="text-lg font-normal text-muted-foreground">Poin</span></h2>}
            </div>
          </div>
          <Button onClick={() => { setIsSheetOpen(true); setStep(1); }}><PlusCircle className="w-4 h-4 mr-2" /> Top Up Saldo</Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invoices"><Receipt className="w-4 h-4 mr-2" /> Tagihan (Invoice)</TabsTrigger>
          <TabsTrigger value="transactions"><History className="w-4 h-4 mr-2" /> Riwayat Mutasi (Kuitansi)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daftar Tagihan</CardTitle>
            </CardHeader>
            <CardContent>
              {invoicesQuery.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
                <div className="space-y-3">
                  {invoicesList.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">Belum ada tagihan.</p>}
                  {invoicesList.map((inv: any) => (
                    // PERBAIKAN 6: Menghapus class "block" yang bertabrakan dengan "flex"
                    <Link key={inv.id} href={`/billing/invoice/${inv.id}` as any} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50">
                      <div>
                        <p className="text-sm font-bold">{inv.pointsAdded?.toLocaleString("id-ID")} Poin</p>
                        <p className="text-xs font-mono text-muted-foreground mt-1">{inv.id}</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="inline-block px-2 py-1 text-[10px] font-bold rounded uppercase bg-muted text-foreground">{inv.status}</span>
                        <p className="text-[10px] text-muted-foreground mt-1">{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("id-ID") : "-"}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Riwayat Mutasi Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsQuery.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
                <div className="space-y-3">
                  {transactionsList.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">Belum ada riwayat mutasi.</p>}
                  {transactionsList.map((tx: any) => {
                    const snapshot = tx.itemSnapshot || {};
                    const isIncoming = tx.pointsCost > 0;
                    return (
                      <div key={tx.id} className="flex justify-between items-center p-3 border rounded-lg bg-card">
                        <div>
                          <p className="text-sm font-bold">{snapshot?.description || "Transaksi"}</p>
                          <p className="text-xs font-mono text-muted-foreground mt-1">{tx.id}</p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className={`inline-block text-sm font-bold ${isIncoming ? "text-green-600" : "text-red-600"}`}>
                            {isIncoming ? "+" : ""}{tx.pointsCost?.toLocaleString("id-ID")} Poin
                          </span>
                          <p className="text-[10px] text-muted-foreground mt-1">{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("id-ID") : "-"}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md md:max-w-lg p-0 flex flex-col h-full" side="right">
          <SheetHeader className="p-6 pb-4 border-b shrink-0"><SheetTitle>Top Up Saldo</SheetTitle></SheetHeader>
          {step === 1 && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold">Nominal Poin</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">Rp</div>
                  <Input type="number" min="50000" className="pl-10 h-14 font-bold" value={amount} onChange={(e) => setAmount(Number(e.target.value) || "")} autoFocus />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[50000, 100000, 250000].map(val => <Button key={val} variant="outline" type="button" onClick={() => setAmount(val)} className={amount === val ? "border-primary bg-primary/5" : ""}>{val.toLocaleString("id-ID")}</Button>)}
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <Button variant="ghost" size="sm" className="-ml-3" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-1" /> Kembali</Button>
              <Tabs defaultValue="gateway" onValueChange={(v) => { setPaymentMethod(v === "manual" ? "MANUAL" : "GATEWAY"); setChannelCode(""); }}>
                <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="gateway">Gateway</TabsTrigger><TabsTrigger value="manual">Manual</TabsTrigger></TabsList>
                <TabsContent value="gateway" className="mt-4"><RadioGroup value={channelCode} onValueChange={setChannelCode} className="space-y-3">{GATEWAY_CATEGORIES[0].channel.map(c => <label key={c.channel_code} htmlFor={c.channel_code} className="flex justify-between border-2 p-3 rounded-lg cursor-pointer hover:bg-muted/50"><div className="flex items-center gap-4"><span className="text-sm font-bold">{c.display_name}</span></div><RadioGroupItem value={c.channel_code} id={c.channel_code} /></label>)}</RadioGroup></TabsContent>
                <TabsContent value="manual" className="mt-4"><RadioGroup value={channelCode} onValueChange={setChannelCode} className="space-y-3">{MANUAL_CATEGORIES[0].channel.map(c => <label key={c.channel_code} htmlFor={c.channel_code} className="flex justify-between border-2 p-3 rounded-lg cursor-pointer hover:bg-muted/50"><div className="flex items-center gap-4"><span className="text-sm font-bold">{c.display_name}</span></div><RadioGroupItem value={c.channel_code} id={c.channel_code} /></label>)}</RadioGroup></TabsContent>
              </Tabs>
            </div>
          )}
          {step === 3 && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <Button variant="ghost" size="sm" className="-ml-3" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4 mr-1" /> Kembali</Button>
              <div className="bg-muted/30 border rounded-xl p-5 space-y-4">
                <div className="flex items-center font-semibold border-b pb-3"><Receipt className="w-4 h-4 mr-2" /> Detail Rincian</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Nominal</span><span>Rp {breakdown.base.toLocaleString("id-ID")}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">PPN</span><span>Rp {breakdown.tax.toLocaleString("id-ID")}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Biaya Tambahan</span><span>Rp {(breakdown.transactionFee + breakdown.uniqueCode).toLocaleString("id-ID")}</span></div>
                </div>
                <div className="bg-primary/5 rounded-lg p-4 flex justify-between items-center border font-bold text-lg"><span>Total Bayar</span><span className="text-primary">Rp {breakdown.total.toLocaleString("id-ID")}</span></div>
              </div>
            </div>
          )}
          <div className="p-6 bg-background border-t shrink-0">
            {step === 1 && <Button className="w-full" onClick={() => setStep(2)} disabled={!amount || amount < 50000}>Pilih Pembayaran</Button>}
            {step === 2 && <Button className="w-full" onClick={() => setStep(3)} disabled={!channelCode}>Lanjut Konfirmasi</Button>}
            {step === 3 && <Button className="w-full" onClick={handleSubmitTopup} disabled={createTopupMutation.isPending}>{createTopupMutation.isPending ? "Memproses..." : "Bayar Sekarang"}</Button>}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}