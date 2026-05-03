// apps/web/src/app/billing/invoice/[id]/status/page.tsx
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  CheckCircle2Icon, 
  ArrowLeftIcon, 
  ClockIcon, 
  XCircleIcon,
  InfoIcon,
  CreditCardIcon
} from "lucide-react";
import { Button } from "@tanisya/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@tanisya/ui/components/card";
import { Separator } from "@tanisya/ui/components/separator";

type InvoiceStatus = "pending" | "paid" | "canceled" | "expired";

export default function InvoiceStatusPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const invoiceId = params.id;

  // Inisialisasi dengan type assertion untuk menghindari ts(2367)
  const [status] = React.useState<InvoiceStatus>("pending" as InvoiceStatus);

  const statusConfig = {
    paid: {
      icon: <CheckCircle2Icon className="w-12 h-12 text-emerald-500" />,
      title: "Pembayaran Diterima",
      desc: "Transaksi Anda telah berhasil diverifikasi. Saldo poin telah ditambahkan ke akun organisasi Anda.",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      instruction: "Anda sekarang dapat menggunakan poin untuk mengaktifkan layanan infrastruktur."
    },
    pending: {
      icon: <ClockIcon className="w-12 h-12 text-amber-500" />,
      title: "Menunggu Verifikasi",
      desc: "Bukti pembayaran Anda telah kami terima dan sedang dalam proses pengecekan oleh tim keuangan.",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      instruction: "Proses ini biasanya memakan waktu 15-60 menit pada jam kerja."
    },
    canceled: {
      icon: <XCircleIcon className="w-12 h-12 text-destructive" />,
      title: "Pembayaran Dibatalkan",
      desc: "Transaksi ini telah dibatalkan oleh sistem atau permintaan pengguna.",
      color: "text-destructive",
      bg: "bg-destructive/10",
      instruction: "Silakan hubungi dukungan pelanggan jika Anda merasa ini adalah kesalahan."
    },
    expired: {
      icon: <XCircleIcon className="w-12 h-12 text-destructive" />,
      title: "Waktu Habis",
      desc: "Batas waktu pembayaran untuk transaksi ini telah berakhir.",
      color: "text-destructive",
      bg: "bg-destructive/10",
      instruction: "Silakan buat ulang permintaan Top Up untuk mendapatkan nomor referensi baru."
    }
  };

  const current = statusConfig[status];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-border animate-in fade-in zoom-in-95 duration-300">
        <CardHeader className="flex flex-col items-center pb-2">
          <div className={`w-20 h-20 ${current.bg} rounded-full flex items-center justify-center mb-4`}>
            {current.icon}
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">{current.title}</CardTitle>
          <p className="text-center text-muted-foreground text-sm px-4 mt-2">
            {current.desc}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-4">
          {/* Ringkasan Status Transaksi */}
          <div className="rounded-xl border bg-muted/30 overflow-hidden">
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Nomor Referensi</span>
                <span className="font-mono font-bold text-foreground uppercase">{invoiceId?.split('-').pop()}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Metode</span>
                <div className="flex items-center gap-1.5 font-medium">
                  <CreditCardIcon className="w-3.5 h-3.5" />
                  <span>Transfer Manual</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Update Terakhir</span>
                <span className="font-medium">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
              </div>
            </div>
          </div>

          {/* Box Instruksi Lanjutan */}
          <div className={`p-4 rounded-lg border flex gap-3 ${current.bg} border-current/20`}>
            <InfoIcon className={`w-5 h-5 shrink-0 ${current.color}`} />
            <p className="text-xs leading-relaxed font-medium">
              {current.instruction}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Button 
              className="w-full h-11 font-semibold" 
              onClick={() => router.push("/dashboard")}
            >
              Kembali ke Dasbor
            </Button>
            
            {status === "pending" && (
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground text-xs"
                onClick={() => router.push(`/billing/invoice/${invoiceId}`)}
              >
                <ArrowLeftIcon className="w-3 h-3 mr-2" />
                Lihat Detail Invoice
              </Button>
            )}
          </div>
        </CardContent>

        <div className="bg-muted/50 py-3 text-center border-t text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
          Sistem Penagihan Tanisya v1.0
        </div>
      </Card>
    </div>
  );
}