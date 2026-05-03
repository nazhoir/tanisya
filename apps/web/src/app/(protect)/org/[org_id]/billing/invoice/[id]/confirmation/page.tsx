// apps/web/src/app/(protect)/billing/invoice/[id]/confirmation/page.tsx
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { 
  ArrowLeft, 
  UploadCloud, 
  Loader2, 
  CheckCircle2, 
  ImageIcon, 
  X,
  Receipt
} from "lucide-react";

import { Button } from "@tanisya/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@tanisya/ui/components/card";
import { Input } from "@tanisya/ui/components/input";
import { orpc } from "@/utils/orpc";
import { authClient } from "@/lib/auth-client";

export default function PaymentConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const { data: session } = authClient.useSession();
  const { data: activeOrganization, isPending: isOrgPending } = authClient.useActiveOrganization();
  const orgId = activeOrganization?.id || "";

  const [senderName, setSenderName] = useState("");
  const [senderAccount, setSenderAccount] = useState("");
  const [transferDate, setTransferDate] = useState("");
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: invoice, isLoading: isInvoiceLoading } = useQuery({
    ...orpc.billing.getInvoiceDetail.queryOptions({
      input: { invoiceId, organizationId: orgId }
    }),
    enabled: !!orgId && !!invoiceId,
  });

  const confirmMutation = useMutation({
    mutationFn: async (payload: { receiptUrl: string }) => {
      // Catatan: Jika skema uploadPaymentReceipt diubah untuk menerima meta tambahan,
      // tambahkan senderName, senderAccount, dan transferDate ke dalam payload ini.
      return orpc.billing.uploadPaymentReceipt.mutate({
        invoiceId,
        userId: session?.user?.id || "",
        receiptUrl: payload.receiptUrl,
        // metadata: { senderName, senderAccount, transferDate } // Uncomment jika backend sudah support
      });
    },
    onSuccess: () => {
      router.push(`/billing/invoice/${invoiceId}`);
    },
    onError: (error) => {
      alert(error.message || "Gagal mengirim konfirmasi pembayaran.");
      setIsUploading(false);
    }
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      alert("Hanya file gambar (JPG, PNG, dll) yang diperbolehkan.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB.");
      return;
    }

    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !senderName || !senderAccount || !transferDate) {
      alert("Harap lengkapi semua data dan unggah bukti pembayaran.");
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload ke S3 (Sesuaikan endpoint `/api/upload` dengan API S3 Anda)
      const formData = new FormData();
      formData.append("file", file);
      // formData.append("folder", "receipts"); 

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Gagal mengunggah gambar ke server.");
      }

      const uploadData = await uploadRes.json();
      const uploadedUrl = uploadData.url; // Asumsi response: { url: "https://s3..." }

      // 2. Submit data konfirmasi ke database via tRPC/oRPC
      await confirmMutation.mutateAsync({ receiptUrl: uploadedUrl });

    } catch (error: any) {
      console.error(error);
      alert(error.message || "Terjadi kesalahan sistem saat proses upload.");
      setIsUploading(false);
    }
  };

  if (isOrgPending || isInvoiceLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!invoice || invoice.status !== "pending") {
    return (
      <div className="mx-auto w-full max-w-2xl py-10 text-center space-y-4">
        <h2 className="text-2xl font-bold">Tagihan tidak valid</h2>
        <p className="text-muted-foreground">Tagihan ini tidak ditemukan atau sudah tidak berstatus pending.</p>
        <Button variant="outline" onClick={() => router.push(`/billing/invoice/${invoiceId}`)}>Kembali</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl py-10 px-4">
      <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground -ml-4" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
      </Button>

      <Card className="overflow-hidden border-border/50 shadow-sm">
        <CardHeader className="border-b bg-muted/10 pb-6">
          <CardTitle className="text-2xl font-bold">Konfirmasi Pembayaran</CardTitle>
          <CardDescription className="mt-1">
            Unggah bukti transfer dan lengkapi data pengirim untuk invoice <strong className="text-foreground">{invoice.id}</strong>
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-8">
            {/* Info Tagihan Singkat */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tagihan</p>
                  <p className="font-bold text-lg">Rp {invoice.amount.toLocaleString("id-ID")}</p>
                </div>
              </div>
            </div>

            {/* Form Input Data Pengirim */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold tracking-wider uppercase text-muted-foreground border-b pb-2">Informasi Pengirim</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Pengirim (Sesuai Rekening) <span className="text-red-500">*</span></label>
                <Input 
                  placeholder="Contoh: Ahmad Nazhoir" 
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  required
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nomor Rekening Pengirim <span className="text-red-500">*</span></label>
                <Input 
                  placeholder="Contoh: 1234567890" 
                  type="number"
                  value={senderAccount}
                  onChange={(e) => setSenderAccount(e.target.value)}
                  required
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tanggal Transfer <span className="text-red-500">*</span></label>
                <Input 
                  type="date"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  required
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Form Upload Bukti */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold tracking-wider uppercase text-muted-foreground border-b pb-2">Bukti Transfer</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Unggah Gambar Bukti (JPG/PNG) <span className="text-red-500">*</span></label>
                
                {!previewUrl ? (
                  <div 
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                      isUploading ? "opacity-50 cursor-not-allowed bg-muted/50" : "hover:bg-muted/50 hover:border-primary/50"
                    }`}
                  >
                    <UploadCloud className="w-10 h-10 text-muted-foreground mb-4" />
                    <p className="font-medium text-sm">Klik untuk mengunggah gambar</p>
                    <p className="text-xs text-muted-foreground mt-1">Maksimal ukuran file 5MB</p>
                  </div>
                ) : (
                  <div className="relative border rounded-xl overflow-hidden bg-muted/30 p-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-4 right-4 h-8 w-8 rounded-full shadow-md z-10"
                      onClick={removeFile}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="relative w-full h-64 flex items-center justify-center bg-black/5 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={previewUrl} 
                        alt="Preview Bukti Pembayaran" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-3 px-2 pb-1">
                      <ImageIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <p className="text-xs text-muted-foreground truncate font-medium">{file?.name}</p>
                    </div>
                  </div>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </div>
            </div>

          </CardContent>
          <CardFooter className="p-6 bg-muted/10 border-t flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={isUploading}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading || !file || !senderName || !senderAccount || !transferDate}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengunggah...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Kirim Konfirmasi
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}