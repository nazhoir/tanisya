// apps/web/src/app/billing/invoice/[id]/payment/page.tsx
"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { 
  ArrowLeftIcon, 
  CopyIcon, 
  CheckIcon, 
  Loader2Icon, 
  HexagonIcon,
  UploadIcon
} from "lucide-react";

import { Button } from "@tanisya/ui/components/button";
import { Alert, AlertDescription } from "@tanisya/ui/components/alert";
import { Label } from "@tanisya/ui/components/label";
import { Input } from "@tanisya/ui/components/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@tanisya/ui/components/dialog";

import { orpc } from "@/utils/orpc";

const BANK_CONFIGS: Record<string, { name: string, code: string, prefix: string }> = {
  mandiri: { name: "Mandiri", code: "89022", prefix: "89022" },
  bca: { name: "BCA", code: "3901", prefix: "3901" },
  bri: { name: "BRI", code: "BRIVA", prefix: "12345" },
};

export default function InvoicePaymentPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const invoiceId = params.id;
  const bankParam = searchParams.get("bank") || "mandiri";
  const activeBank = BANK_CONFIGS[bankParam] || BANK_CONFIGS["mandiri"];

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = React.useState(false);
  const [copiedAmount, setCopiedAmount] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"mobile" | "atm">("mobile");
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const [senderName, setSenderName] = React.useState("");
  const [senderAccount, setSenderAccount] = React.useState("");
  const [transferDate, setTransferDate] = React.useState("");
  const [proofFile, setProofFile] = React.useState<File | null>(null);

  const { mutateAsync: confirmPayment } = useMutation(
    orpc.point.confirmManualTopup.mutationOptions()
  );

  const vaNumber = `${activeBank.prefix}089999337326`;
  const totalAmount = 57500;
  const merchantName = "PT Tanisya Infrastruktur";

  const handleCopy = (text: string, type: "number" | "amount") => {
    navigator.clipboard.writeText(text);
    if (type === "number") {
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceId) return;
    
    try {
      setIsProcessing(true);
      setError(null);
      
      const res = await confirmPayment({ invoiceId });
      
      if (res.success) {
        setIsDialogOpen(false);
        router.push(`/billing/invoice/${invoiceId}/status`);
      }
    } catch (err: any) {
      setError(err.message || "Gagal mengirim bukti pembayaran.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-6 px-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-[420px] space-y-4">
        
        <div className="flex items-center justify-between py-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full h-8 px-3 text-muted-foreground font-medium" 
            onClick={() => router.push(`/billing/invoice/${invoiceId}`)}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1.5" /> Kembali
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">Tanisya Billing</span>
            <div className="w-7 h-7 bg-primary text-primary-foreground rounded flex items-center justify-center">
              <HexagonIcon className="w-4 h-4 fill-current" />
            </div>
          </div>
        </div>

        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

        <div className="bg-card text-card-foreground border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-muted/50 border-b py-3 text-center">
            <p className="text-[11px] font-medium text-muted-foreground">
              Selesaikan pembayaran sebelum <span className="font-bold text-foreground">23:59 WIB</span>
            </p>
          </div>

          <div className="p-6 flex flex-col items-center">
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xl font-bold tracking-tighter text-primary uppercase">
                {activeBank.name}
              </span>
            </div>
            
            <h1 className="text-lg font-bold text-center mb-6">Transfer ke {activeBank.name} Virtual Account</h1>

            <div className="w-full bg-primary rounded-xl overflow-hidden shadow-sm">
              <div className="py-2.5 px-4 text-center">
                <p className="text-primary-foreground text-[11px] font-medium tracking-wide">
                  Pastikan nominal transfer sesuai hingga 3 digit terakhir.
                </p>
              </div>
              
              <div className="bg-background text-foreground rounded-lg m-1 mt-0 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[11px] text-muted-foreground font-medium">Nomor Virtual Account</p>
                    <p className="text-lg font-bold tracking-wide">{vaNumber}</p>
                    <p className="text-[11px] text-muted-foreground font-medium">{merchantName}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs font-semibold px-3 text-muted-foreground rounded-md shrink-0" 
                    onClick={() => handleCopy(vaNumber, "number")}
                  >
                    {copiedNumber ? "Disalin!" : "Salin"}
                    {copiedNumber ? <CheckIcon className="w-3.5 h-3.5 ml-1.5 text-emerald-500" /> : <CopyIcon className="w-3.5 h-3.5 ml-1.5 opacity-70" />}
                  </Button>
                </div>

                <div className="my-5 border-t border-dashed"></div>

                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[11px] text-muted-foreground font-medium">Total Tagihan</p>
                    <p className="text-lg font-bold">Rp{totalAmount.toLocaleString('id-ID')}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs font-semibold px-3 text-muted-foreground rounded-md shrink-0" 
                    onClick={() => handleCopy(totalAmount.toString(), "amount")}
                  >
                    {copiedAmount ? "Disalin!" : "Salin"}
                    {copiedAmount ? <CheckIcon className="w-3.5 h-3.5 ml-1.5 text-emerald-500" /> : <CopyIcon className="w-3.5 h-3.5 ml-1.5 opacity-70" />}
                  </Button>
                </div>

                <div className="mt-6">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full h-11 text-sm font-semibold rounded-lg shadow-sm" 
                      >
                        Saya Sudah Transfer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
                        <DialogDescription>
                          Unggah bukti transfer Anda agar tim kami dapat segera melakukan verifikasi.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmitProof} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="senderName">Nama Pengirim</Label>
                          <Input 
                            id="senderName" 
                            placeholder="Contoh: John Doe" 
                            required 
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="senderAccount">Nomor Rekening Pengirim</Label>
                          <Input 
                            id="senderAccount" 
                            type="number" 
                            placeholder="Contoh: 1234567890" 
                            required 
                            value={senderAccount}
                            onChange={(e) => setSenderAccount(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="transferDate">Tanggal Transfer</Label>
                          <Input 
                            id="transferDate" 
                            type="date" 
                            required 
                            value={transferDate}
                            onChange={(e) => setTransferDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="proofFile">Bukti Tangkapan Layar</Label>
                          <div className="flex items-center gap-2">
                            <Input 
                              id="proofFile" 
                              type="file" 
                              accept="image/*" 
                              required 
                              className="cursor-pointer file:text-primary file:font-medium"
                              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            Format yang didukung: JPG, PNG, WEBP (Max: 2MB).
                          </p>
                        </div>
                        <DialogFooter className="pt-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsDialogOpen(false)}
                            disabled={isProcessing}
                          >
                            Batal
                          </Button>
                          <Button type="submit" disabled={isProcessing}>
                            {isProcessing ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <UploadIcon className="mr-2 h-4 w-4" />}
                            Kirim Bukti
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  
                  <p className="text-[10px] text-center text-muted-foreground mt-3 font-medium">
                    Klik tombol di atas jika Anda telah menyelesaikan pembayaran.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/30 py-3 text-center border-t">
            <div className="flex justify-center items-center gap-1.5">
              <p className="text-[10px] text-muted-foreground font-medium">Manual payment verified by</p>
              <div className="flex items-center gap-1 text-muted-foreground">
                <HexagonIcon className="w-3 h-3" />
                <span className="text-[10px] font-bold tracking-wide">TANISYA BILLING</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex border-b">
            <button 
              className={`pb-2 px-1 text-xs font-semibold transition-colors border-b-2 ${activeTab === 'mobile' ? 'text-primary border-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`} 
              onClick={() => setActiveTab('mobile')}
            >
              Mobile banking
            </button>
            <button 
              className={`pb-2 px-4 text-xs font-semibold transition-colors border-b-2 ${activeTab === 'atm' ? 'text-primary border-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`} 
              onClick={() => setActiveTab('atm')}
            >
              ATM
            </button>
          </div>
          <div className="py-6 px-2">
            {activeTab === 'mobile' ? (
              <ol className="list-decimal pl-4 space-y-4 text-xs text-muted-foreground">
                <li>Buka aplikasi m-banking {activeBank.name} Anda</li>
                <li>Pilih menu <span className="font-bold text-foreground">Transfer &gt; Virtual Account / Rekening Bank</span></li>
                <li>Masukkan nomor rekening / VA (<span className="font-mono">{vaNumber}</span>)</li>
                <li>Masukkan nominal tagihan (<span className="font-mono">Rp{totalAmount.toLocaleString('id-ID')}</span>)</li>
                <li>Konfirmasi transaksi dan masukkan PIN Anda</li>
                <li>Simpan bukti tangkapan layar untuk konfirmasi</li>
              </ol>
            ) : (
              <ol className="list-decimal pl-4 space-y-4 text-xs text-muted-foreground">
                <li>Masukkan kartu ATM {activeBank.name} dan PIN Anda</li>
                <li>Pilih menu <span className="font-bold text-foreground">Bayar/Beli &gt; Lainnya &gt; Multi Payment</span></li>
                <li>Masukkan kode perusahaan <span className="font-bold text-foreground">{activeBank.code}</span></li>
                <li>Masukkan nomor Virtual Account <span className="font-bold text-foreground">{vaNumber}</span></li>
                <li>Konfirmasi rincian dan nominal pembayaran</li>
                <li>Simpan struk ATM sebagai bukti pembayaran</li>
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}