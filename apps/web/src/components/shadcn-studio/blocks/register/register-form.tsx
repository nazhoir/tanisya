"use client"

import * as React from "react"
import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"
import { EyeIcon, EyeOffIcon, Check, X } from "lucide-react"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"

import { Button } from "@tanisya/ui/components/button"
import { Checkbox } from "@tanisya/ui/components/checkbox"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@tanisya/ui/components/field"
import { Input } from "@tanisya/ui/components/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@tanisya/ui/components/input-group"

// --- HELPER UNTUK MENGATASI [object Object] DAN TYPE ERROR ---
const formatErrors = (errors: unknown[] | undefined): { message: string }[] => {
  if (!errors || !Array.isArray(errors)) return []
  return errors.flatMap((err) => {
    if (typeof err === "string") return { message: err }
    if (err !== null && typeof err === "object") {
      const errObj = err as Record<string, unknown>
      
      if ("message" in errObj && typeof errObj.message === "string") {
        return { message: errObj.message }
      }
      if ("issues" in errObj && Array.isArray(errObj.issues)) {
        return errObj.issues.map((i: Record<string, unknown>) => ({ 
          message: typeof i.message === "string" ? i.message : "Invalid value" 
        }))
      }
    }
    return { message: String(err) }
  })
}

// --- KOMPONEN REUSABLE: PASSWORD STRENGTH INDICATOR ---
const passwordRules = [
  { label: "Minimal 8 karakter", regex: /.{8,}/ },
  { label: "Satu huruf besar", regex: /[A-Z]/ },
  { label: "Satu huruf kecil", regex: /[a-z]/ },
  { label: "Satu angka", regex: /[0-9]/ },
  { label: "Satu karakter spesial", regex: /[^A-Za-z0-9]/ },
]

interface PasswordStrengthIndicatorProps {
  value: string
  isVisible: boolean
}

export function PasswordStrengthIndicator({ value, isVisible }: PasswordStrengthIndicatorProps) {
  return (
    <div
      className={`grid transition-all duration-300 ease-in-out ${
        isVisible ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0 mt-0"
      }`}
    >
      <div className="overflow-hidden">
        <div className="space-y-1.5 p-1">
          {passwordRules.map((rule, idx) => {
            const isMet = rule.regex.test(value)
            return (
              <div
                key={idx}
                className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                  isMet ? "text-emerald-500" : "text-muted-foreground"
                }`}
              >
                {isMet ? (
                  <Check className="size-3.5" />
                ) : (
                  <X className="size-3.5" />
                )}
                <span>{rule.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// --- MAIN FORM COMPONENT ---
const formSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter."),
    username: z
      .string()
      .min(3, "Username minimal 3 karakter.")
      .max(20, "Username maksimal 20 karakter.")
      .regex(/^[a-zA-Z0-9_]+$/, "Hanya boleh huruf, angka, dan underscore (_)."),
    email: z.string().email("Masukkan alamat email yang valid."),
    password: z
      .string()
      .min(1, "Password wajib diisi.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
        "Password tidak memenuhi kriteria keamanan."
      ),
    confirmPassword: z.string(),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "Anda harus menyetujui kebijakan privasi & syarat ketentuan.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
  })

export function RegisterForm() {
  const router = useRouter()
  
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)

  const form = useForm({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
    validators: {
      onChange: formSchema,
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)

      try {
        const { error } = await authClient.signUp.email({
          email: value.email,
          password: value.password,
          name: value.name,
          username: value.username,
        })

        if (error) {
          toast.error("Pendaftaran Gagal", {
            description: error.message || "Terjadi kesalahan saat memproses registrasi.",
          })
          return
        }

        // Send Verification OTP
        const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
          email: value.email,
          type: "email-verification", 
        })

        if (otpError) {
          toast.error("Gagal Mengirim OTP", {
            description: otpError.message || "Registrasi berhasil, namun gagal mengirimkan kode OTP ke email Anda.",
          })
          return
        }

        toast.success("Registrasi Berhasil!", {
          description: "Akun Anda telah berhasil dibuat. Silakan periksa email Anda untuk kode OTP.",
          position: "bottom-right",
        })
        
        router.push(`/verify-email?email=${encodeURIComponent(value.email)}`)

      } catch (err) {
        toast.error("Kesalahan Sistem", {
          description: "Gagal terhubung ke server autentikasi.",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  return (
    <form
      id="register-form"
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <FieldGroup>
        {/* Name Field */}
        <form.Field
          name="name"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Full Name*</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Enter your full name"
                />
                {isInvalid && <FieldError errors={formatErrors(field.state.meta.errors)} />}
              </Field>
            )
          }}
        />

        {/* Username Field */}
        <form.Field
          name="username"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Username*</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Choose a username"
                />
                {isInvalid && <FieldError errors={formatErrors(field.state.meta.errors)} />}
              </Field>
            )
          }}
        />

        {/* Email Field */}
        <form.Field
          name="email"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Email address*</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Enter your email address"
                  autoComplete="email"
                />
                {isInvalid && <FieldError errors={formatErrors(field.state.meta.errors)} />}
              </Field>
            )
          }}
        />

        {/* Password Field */}
        <form.Field
          name="password"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            const showIndicator = isPasswordFocused || (isInvalid && field.state.value.length > 0)

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Password*</FieldLabel>
                
                <div
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setIsPasswordFocused(false)
                      field.handleBlur()
                    }
                  }}
                >
                  <InputGroup>
                    <InputGroupInput
                      id={field.name}
                      name={field.name}
                      type={isPasswordVisible ? "text" : "password"}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="••••••••••••••••"
                    />
                    <InputGroupAddon align="inline-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsPasswordVisible((prev) => !prev)}
                        className="text-muted-foreground hover:bg-transparent"
                      >
                        {isPasswordVisible ? (
                          <EyeOffIcon className="size-4" />
                        ) : (
                          <EyeIcon className="size-4" />
                        )}
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>

                  <PasswordStrengthIndicator 
                    value={field.state.value} 
                    isVisible={showIndicator} 
                  />
                </div>

                {isInvalid && !showIndicator && (
                  <FieldError errors={formatErrors(field.state.meta.errors)} />
                )}
              </Field>
            )
          }}
        />

        {/* Confirm Password Field */}
        <form.Field
          name="confirmPassword"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Confirm Password*</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id={field.name}
                    name={field.name}
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="••••••••••••••••"
                  />
                  <InputGroupAddon align="inline-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsConfirmPasswordVisible((prev) => !prev)}
                      className="text-muted-foreground hover:bg-transparent"
                    >
                      {isConfirmPasswordVisible ? (
                        <EyeOffIcon className="size-4" />
                      ) : (
                        <EyeIcon className="size-4" />
                      )}
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
                {isInvalid && <FieldError errors={formatErrors(field.state.meta.errors)} />}
              </Field>
            )
          }}
        />

        {/* Privacy Policy & Terms */}
        <form.Field
          name="agreeTerms"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={(checked) =>
                      field.handleChange(checked as boolean)
                    }
                    className="size-5"
                    aria-invalid={isInvalid}
                  />
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-muted-foreground font-normal cursor-pointer leading-tight"
                  >
                    I agree to the{" "}
                    <a href="#" className="text-primary hover:underline">
                      privacy policy & terms
                    </a>
                  </FieldLabel>
                </div>
                {isInvalid && (
                  <p className="text-sm font-medium text-destructive">
                    {formatErrors(field.state.meta.errors)
                      .map((e) => e.message)
                      .join(", ")}
                  </p>
                )}
              </div>
            )
          }}
        />
      </FieldGroup>

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Processing..." : "Sign Up to Tanisya"}
      </Button>
    </form>
  )
}

export default RegisterForm