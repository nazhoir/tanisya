// 3. UI (apps/web/src/app/(protect)/billing/invoice/[id]/page.tsx)
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  CheckCircle, 
  Copy, 
  CreditCard, 
  Loader2, 
  XCircle,
  Download,
  CheckCircle2,
  RefreshCcw
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";

import { Button } from "@tanisya/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@tanisya/ui/components/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tanisya/ui/components/tabs";
import { RadioGroup, RadioGroupItem } from "@tanisya/ui/components/radio-group";

import { orpc } from "@/utils/orpc";
import { authClient } from "@/lib/auth-client";

const MANUAL_CATEGORIES = [
  {
    label: "Transfer Bank Manual",
    channel: [
      { channel_code: "MANUAL_BRI", display_name: "Transfer BRI", vendor: "MANUAL", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_2020.svg", payment_fees: null },
      { channel_code: "MANUAL_MANDIRI", display_name: "Transfer Mandiri", vendor: "MANUAL", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg", payment_fees: null },
      { channel_code: "MANUAL_BCA", display_name: "Transfer BCA", vendor: "MANUAL", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg", payment_fees: null },
    ]
  }
];

const GATEWAY_CATEGORIES = [
  {
    label: "Paylater",
    channel: [
      { channel_code: "AKULAKU", display_name: "Akulaku", vendor: "xendit", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Akulaku.png", payment_fees: { fixed: null, percent: 1.7, maximal: null, additional: null } },
      { channel_code: "ATOME", display_name: "Atome", vendor: "xendit", logo: "https://www.atome.id/images/logo.svg", payment_fees: { fixed: null, percent: 5.0, maximal: null, additional: null } },
      { channel_code: "INDODANA", display_name: "Indodana", vendor: "xendit", logo: "https://www.indodana.id/images/logo.svg", payment_fees: { fixed: null, percent: 2.3, maximal: null, additional: null } },
      { channel_code: "KREDIVO", display_name: "Kredivo", vendor: "xendit", logo: "https://upload.wikimedia.org/wikipedia/commons/1/14/Kredivo_logo.svg", payment_fees: { fixed: null, percent: 2.3, maximal: null, additional: null } }
    ]
  },
  {
    label: "Gerai Retail",
    channel: [
      { channel_code: "ALFAMART", display_name: "Alfamart", vendor: "xendit", logo: "https://upload.wikimedia.org/wikipedia/commons/8/86/Alfamart_logo.svg", payment_fees: { fixed: 5000, percent: null, maximal: null, additional: null } },
      { channel_code: "INDOMARET", display_name: "Indomaret", vendor: "xendit", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Logo_Indomaret.png", payment_fees: { fixed: 5500, percent: null, maximal: null, additional: null } }
    ]
  },
  {
    label: "E-Wallet",
    channel: [
      { channel_code: "ASTRAPAY", display_name: "AstraPay", vendor: "xendit", logo: "https://astrapay.com/assets/images/logo.svg", payment_fees: { fixed: null, percent: 1.5, maximal: null, additional: null } },
      { channel_code: "DANA", display_name: "DANA", vendor: "xendit", logo: "https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg", payment_fees: { fixed: null, percent: 1.5, maximal: 3.0, additional: null } },
      { channel_code: "OVO", display_name: "OVO", vendor: "xendit", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Logo_OVO.svg", payment_fees: { fixed: null, percent: 1.5, maximal: 3.18, additional: null } },
      { channel_code: "LINKAJA", display_name: "LinkAja", vendor: "xendit", logo: "https://upload.wikimedia.org/wikipedia/commons/8/85/LinkAja.svg", payment_fees: { fixed: null, percent: 1.5, maximal: 3.15, additional: null } },
      { channel_code: "SHOPEEPAY", display_name: "ShopeePay", vendor: "xendit", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee_logo.svg", payment_fees: { fixed: null, percent: 2.0, maximal: 4.0, additional: null } },
      { channel_code: "GOPAY", display_name: "GoPay", vendor: "xendit", logo: "https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg", payment_fees: { fixed: null, percent: null, maximal: null, additional: null } }
    ]
  },
  {
    label: "Transfer Bank (Virtual Account)",
    channel: [
      { channel_code: "BCA_VIRTUAL_ACCOUNT", display_name: "BCA Virtual Account", vendor: "xendit", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg", payment_fees: { fixed: 4000, percent: null, maximal: null, additional: 2000 } },
      { channel_code: "BNI_VIRTUAL_ACCOUNT", display_name: "BNI Virtual Account", vendor: "xendit", logo: "https://upload.wikimedia.org/wikipedia/id/5/55/BNI_logo.svg", payment_fees: { fixed: 4000, percent: null, maximal: null, additional: 2000 } },
      { channel_code: "BRI_VIRTUAL_ACCOUNT", display_name: "BRI Virtual Account", vendor: "xendit", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_2020.svg", payment_fees: { fixed: 4000, percent: null, maximal: null, additional: 2000 } },
      { channel_code: "MANDIRI_VIRTUAL_ACCOUNT", display_name: "Mandiri Virtual Account", vendor: "xendit", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg", payment_fees: { fixed: 4000, percent: null, maximal: null, additional: 2000 } }
    ]
  },
  {
    label: "Kartu Kredit/Debit",
    channel: [
      { channel_code: "CARDS", display_name: "Cards", vendor: "midtrans", logo: "https://midtrans.com/assets/img/midtrans-logo.svg", payment_fees: { fixed: null, percent: 2.9, maximal: null, additional: 2000 } }
    ]
  },
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
  if (feeStructure.percent) {
    const applicableRate = feeStructure.maximal ? feeStructure.maximal : feeStructure.percent;
    totalFee += amount * (applicableRate / 100);
  }
  if (feeStructure.fixed) {
    totalFee += feeStructure.fixed;
  }
  if (feeStructure.additional && feeStructure.percent !== null) { 
    totalFee += feeStructure.additional;
  }
  return Math.ceil(totalFee);
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const { data: activeOrganization, isPending: isOrgPending } = authClient.useActiveOrganization();
  const orgId = activeOrganization?.id || "";

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedChannelCode, setSelectedChannelCode] = useState<string | null>(null);
  const [paymentMethodTab, setPaymentMethodTab] = useState<"MANUAL" | "GATEWAY">("GATEWAY");
  const [isChangeMethodOpen, setIsChangeMethodOpen] = useState(false);

  const { data: invoice, isLoading, refetch } = useQuery({
    ...orpc.billing.getInvoiceDetail.queryOptions({
      input: { invoiceId, organizationId: orgId }
    }),
    enabled: !!orgId && !!invoiceId,
  });

  const cancelMutation = useMutation(
    orpc.billing.cancelTopup.mutationOptions({
      onSuccess: () => refetch(),
      onError: (error) => alert(error.message || "Gagal membatalkan tagihan.")
    })
  );

  const handleCancel = () => {
    if (confirm("Apakah Anda yakin ingin membatalkan tagihan ini?")) {
      cancelMutation.mutate({ invoiceId });
    }
  };

  useEffect(() => {
    if (invoice && !selectedChannelCode) {
      setSelectedChannelCode(invoice.paymentChannel);
      setPaymentMethodTab(invoice.paymentProvider === "MANUAL" ? "MANUAL" : "GATEWAY");
    }
  }, [invoice, selectedChannelCode]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getBankDetails = (channel: string) => {
    if (channel === "MANUAL_BRI") return { name: "Bank BRI", account: "001122334455", owner: "PT Tanisya Infrastruktur" };
    if (channel === "MANUAL_BCA") return { name: "Bank BCA", account: "8899776655", owner: "PT Tanisya Infrastruktur" };
    if (channel === "MANUAL_MANDIRI") return { name: "Bank Mandiri", account: "137000111222", owner: "PT Tanisya Infrastruktur" };
    return { name: channel.replace(/_/g, " "), account: "Hubungi Admin", owner: "-" };
  };

  const currentChannelData = useMemo(() => {
    if (!selectedChannelCode) return null;
    const manualFound = MANUAL_CATEGORIES[0].channel.find(c => c.channel_code === selectedChannelCode);
    if (manualFound) return manualFound;
    
    for (const cat of GATEWAY_CATEGORIES) {
      const found = cat.channel.find(c => c.channel_code === selectedChannelCode);
      if (found) return found;
    }
    return null;
  }, [selectedChannelCode]);

  const breakdown = useMemo(() => {
    if (!invoice || !currentChannelData) return null;
    
    const base = invoice.pointsAdded;
    const tax = Math.floor(base * 0.11);
    
    if (selectedChannelCode === invoice.paymentChannel) {
      const originalDifference = invoice.amount - base - tax;
      const isOriginallyManual = invoice.paymentProvider === "MANUAL";
      return {
        base,
        tax,
        fee: originalDifference,
        isManual: isOriginallyManual,
        total: invoice.amount
      };
    }

    const isNowManual = currentChannelData.vendor === "MANUAL";
    let newFee = isNowManual ? Math.floor(Math.random() * 900) + 100 : calculateTransactionFee(base, currentChannelData.payment_fees);

    return {
      base,
      tax,
      fee: newFee,
      isManual: isNowManual,
      total: base + tax + newFee
    };
  }, [invoice, currentChannelData, selectedChannelCode]);

  if (isOrgPending || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!invoice || !breakdown || !currentChannelData) {
    return (
      <div className="mx-auto w-full max-w-2xl py-10 text-center">
        <h2 className="text-2xl font-bold">Tagihan tidak ditemukan</h2>
        <Button variant="link" onClick={() => router.push("/billing")}>Kembali ke daftar tagihan</Button>
      </div>
    );
  }

  const bankDetail = breakdown.isManual ? getBankDetails(currentChannelData.channel_code) : null;
  
  // Penanganan tanggal jatuh tempo jika nilainya null (tanpa batas waktu)
  const dueDateDisplay = invoice.dueDate 
    ? new Date(invoice.dueDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })
    : "-";

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "paid": 
        return <span className="bg-green-500/10 text-green-600 px-3 py-1 rounded text-xs font-bold uppercase border border-green-500/20">Telah Dibayar</span>;
      case "pending": 
        return <span className="bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded text-xs font-bold uppercase border border-yellow-500/20">Menunggu Pembayaran</span>;
      case "rejected": 
        return <span className="bg-red-500/10 text-red-600 px-3 py-1 rounded text-xs font-bold uppercase border border-red-500/20">Ditolak Admin</span>;
      case "cancelled": 
        return <span className="bg-gray-500/10 text-gray-600 px-3 py-1 rounded text-xs font-bold uppercase border border-gray-500/20">Dibatalkan</span>;
      default: 
        return <span className="bg-gray-500/10 text-gray-600 px-3 py-1 rounded text-xs font-bold uppercase border border-gray-500/20">{status}</span>;
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl py-10 px-4">
      <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground -ml-4" onClick={() => router.push("/billing")}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Billing
      </Button>

      <div className="bg-zinc-50 dark:bg-zinc-950 border rounded-2xl p-6 sm:p-10 shadow-sm space-y-10">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-foreground">Tanisya Digital Studio</h2>
            <p className="text-sm text-muted-foreground">finance@tanisya.com • +62 811 2233 4455</p>
            <p className="text-sm text-muted-foreground">Jl. Teknologi Raya No. 1, Jakarta Selatan 12930</p>
          </div>
          <div className="text-left sm:text-right">
            <h1 className="text-3xl font-semibold mb-3 tracking-tight">Invoice</h1>
            <div className="flex flex-col sm:items-end gap-2">
              <span className="bg-blue-600/10 text-blue-600 px-3 py-1 rounded text-xs font-mono font-medium border border-blue-600/20">
                {invoice.id}
              </span>
              {getStatusDisplay(invoice.status)}
            </div>
          </div>
        </div>

        {/* METADATA */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-y border-border/60">
          <div>
            <p className="text-[11px] text-muted-foreground mb-1.5 font-semibold tracking-wider uppercase">Tanggal Invoice</p>
            <p className="font-medium text-sm">{new Date(invoice.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground mb-1.5 font-semibold tracking-wider uppercase">Jatuh Tempo</p>
            <p className="font-medium text-sm">{dueDateDisplay}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground mb-1.5 font-semibold tracking-wider uppercase">Mata Uang</p>
            <p className="font-medium text-sm">IDR (Rupiah)</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground mb-1.5 font-semibold tracking-wider uppercase">Pajak</p>
            <p className="font-medium text-sm">PPN 11%</p>
          </div>
        </div>

        {/* FROM / TO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-muted/40 p-5 rounded-xl border border-border/50">
            <p className="text-[11px] text-muted-foreground mb-3 font-semibold tracking-wider uppercase">Dari</p>
            <p className="font-bold text-foreground mb-2">Tanisya Digital Studio</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tim Administrasi & Keuangan<br />
              finance@tanisya.com<br />
              +62 811 2233 4455
            </p>
          </div>
          <div className="bg-muted/40 p-5 rounded-xl border border-border/50">
            <p className="text-[11px] text-muted-foreground mb-3 font-semibold tracking-wider uppercase">Kepada</p>
            <p className="font-bold text-foreground mb-2">{activeOrganization?.name}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dipesan oleh: {invoice.user?.name || invoice.userId}<br />
              {invoice.user?.email || "-"}<br />
              ID Organisasi: {orgId.split("_")[1] || orgId}
            </p>
          </div>
        </div>

        {/* LINE ITEMS */}
        <div className="space-y-4 pt-4">
          <p className="text-[11px] text-muted-foreground font-semibold tracking-wider uppercase px-1">Rincian Layanan</p>
          <div className="border border-border/60 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left font-medium p-4 border-b">Deskripsi</th>
                  <th className="text-center font-medium p-4 border-b w-24">Qty</th>
                  <th className="text-right font-medium p-4 border-b w-40">Harga Satuan</th>
                  <th className="text-right font-medium p-4 border-b w-40">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-background/50">
                <tr>
                  <td className="p-4">
                    <p className="font-semibold text-foreground">Top Up Saldo Poin</p>
                    <p className="text-xs text-muted-foreground mt-1">Pembelian {breakdown.base.toLocaleString("id-ID")} poin sistem</p>
                  </td>
                  <td className="p-4 text-center text-muted-foreground">1</td>
                  <td className="p-4 text-right font-medium">Rp {breakdown.base.toLocaleString("id-ID")}</td>
                  <td className="p-4 text-right font-bold">Rp {breakdown.base.toLocaleString("id-ID")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* TOTALS */}
        <div className="flex justify-end pt-2">
          <div className="w-full sm:w-80 space-y-4">
            <div className="flex justify-between text-sm px-2">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">Rp {breakdown.base.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-sm px-2">
              <span className="text-muted-foreground">PPN (11%)</span>
              <span className="font-medium">Rp {breakdown.tax.toLocaleString("id-ID")}</span>
            </div>
            {breakdown.fee > 0 && (
              <div className="flex justify-between text-sm px-2">
                <span className="text-muted-foreground">
                  {breakdown.isManual ? "Kode Unik" : "Biaya Transaksi"}
                </span>
                <span className={breakdown.isManual ? "text-blue-600 font-medium" : "font-medium"}>
                  Rp {breakdown.fee.toLocaleString("id-ID")}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-5 rounded-xl shadow-inner mt-4">
              <span className="font-semibold">Total Tagihan</span>
              <span className="text-2xl font-bold tracking-tight">Rp {breakdown.total.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* NOTES & PAYMENT METHOD */}
        <div className="border border-border/60 rounded-xl p-6 bg-muted/20 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold tracking-wider uppercase mb-1">Catatan & Pembayaran</p>
              <div className="flex items-center gap-3 mt-2">
                {currentChannelData.logo && <img src={currentChannelData.logo} alt="" className="h-5 object-contain bg-white px-1 py-0.5 rounded border" />}
                <span className="font-semibold">{currentChannelData.display_name}</span>
              </div>
            </div>
            {invoice.status === "pending" && (
              <Dialog open={isChangeMethodOpen} onOpenChange={setIsChangeMethodOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <RefreshCcw className="w-4 h-4 mr-2" /> Ubah Metode
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl h-[80vh] flex flex-col p-0">
                  <DialogHeader className="p-6 pb-4 border-b shrink-0">
                    <DialogTitle>Ubah Metode Pembayaran</DialogTitle>
                    <DialogDescription>Pilih metode pembayaran baru. Total tagihan akan menyesuaikan biaya transaksi layanan.</DialogDescription>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto p-6">
                    <Tabs value={paymentMethodTab} onValueChange={(v) => setPaymentMethodTab(v as any)}>
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="GATEWAY">Otomatis (Gateway)</TabsTrigger>
                        <TabsTrigger value="MANUAL">Transfer Manual</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="GATEWAY" className="space-y-6">
                        <RadioGroup value={selectedChannelCode || ""} onValueChange={setSelectedChannelCode} className="space-y-6">
                          {GATEWAY_CATEGORIES.map(category => (
                            <div key={category.label} className="space-y-3">
                              <h4 className="text-sm font-semibold text-muted-foreground">{category.label}</h4>
                              <div className="grid grid-cols-1 gap-3">
                                {category.channel.map(c => (
                                  <label
                                    key={c.channel_code}
                                    htmlFor={`change-${c.channel_code}`}
                                    className={`flex items-center justify-between rounded-lg border-2 p-3 cursor-pointer transition-all ${
                                      selectedChannelCode === c.channel_code ? "border-primary bg-primary/5" : "border-muted hover:bg-accent"
                                    }`}
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="w-12 h-8 bg-white rounded flex items-center justify-center p-1 border shrink-0">
                                        {c.logo ? <img src={c.logo} alt={c.display_name} className="max-h-full max-w-full object-contain" /> : <CreditCard className="w-5 h-5 text-muted-foreground" />}
                                      </div>
                                      <span className="text-sm font-semibold">{c.display_name}</span>
                                    </div>
                                    <RadioGroupItem value={c.channel_code} id={`change-${c.channel_code}`} />
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                      </TabsContent>

                      <TabsContent value="MANUAL" className="space-y-6">
                        <RadioGroup value={selectedChannelCode || ""} onValueChange={setSelectedChannelCode} className="space-y-3">
                          {MANUAL_CATEGORIES[0].channel.map(c => (
                            <label
                              key={c.channel_code}
                              htmlFor={`change-${c.channel_code}`}
                              className={`flex items-center justify-between rounded-lg border-2 p-3 cursor-pointer transition-all ${
                                selectedChannelCode === c.channel_code ? "border-primary bg-primary/5" : "border-muted hover:bg-accent"
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-8 bg-white rounded flex items-center justify-center p-1 border shrink-0">
                                  {c.logo ? <img src={c.logo} alt={c.display_name} className="max-h-full max-w-full object-contain" /> : <CreditCard className="w-5 h-5 text-muted-foreground" />}
                                </div>
                                <span className="text-sm font-semibold">{c.display_name}</span>
                              </div>
                              <RadioGroupItem value={c.channel_code} id={`change-${c.channel_code}`} />
                            </label>
                          ))}
                        </RadioGroup>
                      </TabsContent>
                    </Tabs>
                  </div>
                  <div className="p-6 border-t shrink-0 flex justify-end gap-3">
                    <Button variant="outline" onClick={() => {
                      setSelectedChannelCode(invoice.paymentChannel); 
                      setIsChangeMethodOpen(false);
                    }}>Batal</Button>
                    <Button onClick={() => setIsChangeMethodOpen(false)}>Simpan & Update Tagihan</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="text-sm">
            {breakdown.isManual && bankDetail ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Pembayaran dapat dilakukan melalui transfer bank ke rekening di bawah ini. Harap transfer sesuai nominal hingga 3 digit terakhir.
                </p>
                <div className="bg-background border rounded-lg p-4 inline-block space-y-3 pr-10">
                  <div>
                    <p className="text-xs text-muted-foreground">Nomor Rekening ({bankDetail.name})</p>
                    <div className="flex items-center mt-1">
                      <p className="font-mono text-lg font-bold">{bankDetail.account}</p>
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-3" onClick={() => handleCopy(bankDetail.account, "acc")}>
                        {copiedField === "acc" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">a.n. {bankDetail.owner}</p>
                  </div>
                  <div className="border-t pt-2">
                    <p className="text-xs text-muted-foreground">Nominal Transfer (Termasuk Kode Unik)</p>
                    <div className="flex items-center mt-1">
                      <p className="font-bold text-primary text-lg">Rp {breakdown.total.toLocaleString("id-ID")}</p>
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-3" onClick={() => handleCopy(breakdown.total.toString(), "nom")}>
                        {copiedField === "nom" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Pembayaran dilakukan melalui Payment Gateway <strong>{currentChannelData.display_name}</strong>. Klik "Lanjutkan ke Pembayaran" untuk memproses tagihan Anda secara otomatis.
              </p>
            )}
          </div>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-3 pt-6 border-t border-border/60">
          {invoice.status === "pending" && (
            <Button 
              variant="ghost" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
              Batalkan Tagihan
            </Button>
          )}

          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>

          {invoice.status === "pending" && (
            breakdown.isManual ? (
              <Button asChild className="w-full sm:w-auto shadow-md">
                <Link href={`/billing/invoice/${invoice.id}/confirmation`}>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Konfirmasi Pembayaran
                </Link>
              </Button>
            ) : (
              <Button className="w-full sm:w-auto shadow-md" onClick={() => alert("Redirecting to Xendit/Midtrans...")}>
                <CreditCard className="w-4 h-4 mr-2" /> Lanjutkan ke Pembayaran
              </Button>
            )
          )}
        </div>

      </div>
    </div>
  );
}