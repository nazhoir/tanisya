"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { toast } from "sonner"
import { RefreshCwIcon } from "lucide-react"

import { authClient } from "@/lib/auth-client"

import { Button } from "@tanisya/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@tanisya/ui/components/card"
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@tanisya/ui/components/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@tanisya/ui/components/input-otp"

import Logo from "@/components/shadcn-studio/logo"

const VerifyEmailContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || "your email address"

  const [otp, setOtp] = useState("")
  const [timeLeft, setTimeLeft] = useState(300)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (timeLeft <= 0) return
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timerId)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) return

    setIsSubmitting(true)
    try {
      const { error } = await authClient.emailOtp.verifyEmail({ 
        email, 
        otp 
      })

      if (error) {
        toast.error("Verifikasi Gagal", {
          description: error.message || "Kode OTP tidak valid atau sudah kedaluwarsa.",
        })
        
        const errorMessage = error.message?.toLowerCase() || ""
        if (errorMessage.includes("expire")) {
           setTimeLeft(0)
        }
        return
      }

      toast.success("Email Berhasil Diverifikasi!", {
        description: "Akun Anda telah aktif.",
      })
      
      router.push("/login")
      
    } catch (error) {
      toast.error("Kesalahan Sistem", { 
        description: "Gagal terhubung ke server autentikasi." 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (timeLeft > 0) return
    
    setIsResending(true)
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({ 
        email, 
        type: "email-verification" 
      })

      if (error) {
        toast.error("Gagal Mengirim Ulang", {
          description: error.message || "Tidak dapat mengirim OTP saat ini.",
        })
        return
      }

      setTimeLeft(300)
      setOtp("")
      toast.success("OTP Terkirim!", { 
        description: "Kode verifikasi baru telah dikirim ke email Anda." 
      })
    } catch (error) {
      toast.error("Kesalahan Sistem", { 
        description: "Gagal mengirim ulang OTP." 
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card className="z-1 w-full border-none shadow-md sm:max-w-80">
      <CardHeader className="gap-6">
        <Logo className="gap-3" />
        <div>
          <CardTitle className="mb-1.5 text-2xl">Verify your email</CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Enter the verification code we sent to your email address:{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={handleVerify}>
        <CardContent>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="otp-verification">
                Verification code
              </FieldLabel>
              <Button 
                variant="outline" 
                size="xs" 
                type="button"
                onClick={handleResend}
                disabled={timeLeft > 0 || isResending}
                className={timeLeft > 0 ? "min-w-[100px]" : ""}
              >
                {timeLeft > 0 ? (
                  `Resend in ${formatTime(timeLeft)}`
                ) : isResending ? (
                  <RefreshCwIcon className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <RefreshCwIcon className="mr-2 h-3.5 w-3.5" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex items-center justify-center py-2">
              <InputOTP 
                id="otp-verification"
                maxLength={6} 
                pattern={REGEXP_ONLY_DIGITS}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={isSubmitting}
                autoFocus
              >
                <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator className="mx-2" />
                <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <FieldDescription className="mb-4">
              Check your spam folder if you can&apos;t find the email.
            </FieldDescription>
          </Field>
        </CardContent>

        <CardFooter>
          <Field className="w-full">
            <Button 
              type="submit" 
              className="w-full"
              disabled={otp.length !== 6 || isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify"}
            </Button>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <a
                href="/login"
                className="underline underline-offset-4 transition-colors hover:text-primary"
              >
                Skip for now, go to login
              </a>
            </div>
          </Field>
        </CardFooter>
      </form>
    </Card>
  )
}

const VerifyEmail = () => {
  return (
    <div className="relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
      <React.Suspense fallback={
        <div className="flex w-full sm:max-w-md h-64 items-center justify-center">
          <p className="text-muted-foreground animate-pulse">Loading...</p>
        </div>
      }>
        <VerifyEmailContent />
      </React.Suspense>
    </div>
  )
}

export default VerifyEmail