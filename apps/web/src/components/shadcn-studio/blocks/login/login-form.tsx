"use client"

import * as React from "react"
import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"

import { Button } from "@tanisya/ui/components/button"
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

// Mengubah validasi email menjadi identifier (bisa email atau username)
const formSchema = z.object({
  identifier: z.string().min(1, "Email atau Username wajib diisi."),
  password: z.string().min(1, "Password wajib diisi."),
})

export function LoginForm() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      identifier: "",
      password: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)

      try {
        // Cek apakah input berupa email (mengandung @) atau username
        const isEmail = value.identifier.includes("@")
        
        let response
        if (isEmail) {
          response = await authClient.signIn.email({
            email: value.identifier,
            password: value.password,
          })
        } else {
          // Asumsi backend menggunakan plugin username dari better-auth
          response = await authClient.signIn.username({
            username: value.identifier,
            password: value.password,
          })
        }

        if (response.error) {
          toast.error("Login Gagal", {
            description: response.error.message || "Kredensial yang Anda masukkan salah.",
          })
          return
        }

        toast.success("Login Berhasil!", {
          description: "Mengarahkan ke halaman utama...",
        })
        
        router.push("/")
      } catch (error) {
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
      id="login-form"
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <FieldGroup>
        {/* Identifier (Email/Username) Field */}
        <form.Field
          name="identifier"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Email or Username*</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Enter your email or username"
                  autoComplete="username"
                />
                {isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            )
          }}
        />

        {/* Password Field */}
        <form.Field
          name="password"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor={field.name}>Password*</FieldLabel>
                  <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary hover:underline">
                    Forgot Password?
                  </a>
                </div>
                <InputGroup>
                  <InputGroupInput
                    id={field.name}
                    name={field.name}
                    type={isVisible ? "text" : "password"}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="••••••••••••••••"
                    autoComplete="current-password"
                  />
                  <InputGroupAddon align="inline-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsVisible((prev) => !prev)}
                      className="text-muted-foreground hover:bg-transparent"
                    >
                      {isVisible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                      <span className="sr-only">
                        {isVisible ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
                {isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            )
          }}
        />
      </FieldGroup>

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in to Tanisya"}
      </Button>
    </form>
  )
}

export default LoginForm