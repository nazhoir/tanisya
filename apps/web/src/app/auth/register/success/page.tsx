"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "@tanisya/ui/components/button";

// Delay in seconds before auto-redirecting to the OTP page
const REDIRECT_DELAY = 5;

export default function RegisterSuccessPage() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const email       = searchParams.get("email") ?? "";

  const [countdown, setCountdown] = React.useState(REDIRECT_DELAY);

  // Auto-redirect countdown
  React.useEffect(() => {
    if (countdown <= 0) {
      router.replace(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, email, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Decorative background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-emerald-500/8 blur-[80px]" />
      </div>

      <div className="w-full max-w-md text-center">
        {/* Success icon */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <div className="absolute h-full w-full animate-ping rounded-full bg-emerald-500/20" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Akun berhasil dibuat! 🎉
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Kami telah mengirimkan kode verifikasi OTP ke{" "}
          <span className="font-semibold text-foreground">{email}</span>.
          <br />
          Silakan cek kotak masuk atau folder spam kamu.
        </p>

        {/* Email reminder card */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4 text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Mail className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">Email terkirim ke</p>
            <p className="truncate text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        {/* Countdown redirect notice */}
        <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-background py-3 text-sm text-muted-foreground">
          <span>Mengarahkan ke halaman verifikasi dalam</span>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground">
            {countdown}
          </span>
          <span>detik...</span>
        </div>

        {/* Manual redirect button */}
        <Button
          size="lg"
          className="h-11 w-full gap-2 font-bold shadow-md shadow-primary/15"
          onClick={() =>
            router.replace(`/auth/verify-otp?email=${encodeURIComponent(email)}`)
          }
        >
          Masukkan Kode OTP Sekarang
          <Mail className="h-4 w-4" />
        </Button>

        <p className="mt-4 text-xs text-muted-foreground">
          Tidak menerima email?{" "}
          <button
            type="button"
            className="font-semibold text-primary underline-offset-2 hover:underline"
            onClick={() => {
              /* TODO: panggil endpoint resend OTP */
            }}
          >
            Kirim ulang
          </button>
        </p>
      </div>
    </div>
  );
}