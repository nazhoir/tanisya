"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowRight, Lock, Mail, ShieldCheck, User, Users, Zap } from "lucide-react";

import { Button } from "@tanisya/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@tanisya/ui/components/field";
import { Input } from "@tanisya/ui/components/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@tanisya/ui/lib/utils";
import Loader from "./loader";

// ─── Validation schema ────────────────────────────────────────────────────────

const formSchema = z
  .object({
    name:            z.string().min(2, "Nama minimal 2 karakter"),
    email:           z.string().email("Alamat email tidak valid"),
    password:        z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

// ─── Static data ──────────────────────────────────────────────────────────────

const HERO_PERKS = [
  { icon: ShieldCheck, text: "SSL & keamanan enterprise gratis" },
  { icon: Zap,         text: "Deploy dalam hitungan menit" },
  { icon: Users,       text: "Support manusia 24/7 via WhatsApp" },
] as const;

const SOCIAL_PROVIDERS = [
  {
    id: "apple",
    label: "Apple",
    path: "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701",
  },
  {
    id: "google",
    label: "Google",
    path: "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z",
  },
  {
    id: "meta",
    label: "Meta",
    path: "M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z",
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        { name: value.name, email: value.email, password: value.password },
        {
          onSuccess: () => {
            // Redirect ke halaman sukses, lalu halaman itu yang akan redirect ke OTP
            router.push(`/auth/register/success?email=${encodeURIComponent(value.email)}`);
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
  });

  if (isPending) return <Loader />;

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>

      {/* ── Main card ──────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-background shadow-xl shadow-black/5 md:grid md:grid-cols-2">

        {/* ── Left: hero panel ─────────────────────────────────────────────── */}
        <div className="relative hidden overflow-hidden bg-linear-to-br from-primary via-primary/90 to-blue-600 p-8 text-primary-foreground md:flex md:flex-col md:justify-between">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 left-1/3 h-32 w-32 rounded-full bg-white/8 blur-2xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />

          <div className="relative">
            <p className="text-xl font-extrabold tracking-tight">Tanisya</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-foreground/60">
              Solusi digital serba ada
            </p>
          </div>

          <div className="relative my-auto py-8">
            <h2 className="mb-3 text-2xl font-extrabold leading-tight tracking-tight">
              Mulai perjalanan digitalmu hari ini
            </h2>
            <p className="text-sm leading-relaxed text-primary-foreground/75">
              Bergabung dengan ribuan bisnis Indonesia yang sudah mempercayakan
              infrastruktur digitalnya ke Tanisya.
            </p>
          </div>

          <div className="relative flex flex-col gap-2.5">
            {HERO_PERKS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/15">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-primary-foreground/85">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: form panel ────────────────────────────────────────────── */}
        <form
          id="sign-up-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col justify-center p-6 md:p-8"
        >
          <FieldGroup>
            {/* Header */}
            <div className="mb-2 flex flex-col gap-1">
              <h1 className="text-2xl font-extrabold tracking-tight">Buat Akun Baru</h1>
              <p className="text-sm text-muted-foreground">
                Isi data di bawah untuk mulai menggunakan Tanisya
              </p>
            </div>

            {/* ── Nama ─────────────────────────────────────────────────────── */}
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Nama Lengkap</FieldLabel>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder="Ahmad Fauzi"
                        className="h-11 pl-9"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="name"
                      />
                    </div>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />

            {/* ── Email ────────────────────────────────────────────────────── */}
            <form.Field
              name="email"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        placeholder="nama@contoh.com"
                        className="h-11 pl-9"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="email"
                      />
                    </div>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />

            {/* ── Password ─────────────────────────────────────────────────── */}
            <form.Field
              name="password"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        placeholder="Minimal 8 karakter"
                        className="h-11 pl-9"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="new-password"
                      />
                    </div>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />

            {/* ── Konfirmasi Password ──────────────────────────────────────── */}
            <form.Field
              name="confirmPassword"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Konfirmasi Password</FieldLabel>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        placeholder="Ulangi password"
                        className="h-11 pl-9"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="new-password"
                      />
                    </div>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />

            {/* ── Submit ───────────────────────────────────────────────────── */}
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  form="sign-up-form"
                  size="lg"
                  className="h-11 w-full gap-2 font-bold shadow-md shadow-primary/15"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Membuat akun...
                    </>
                  ) : (
                    <>
                      Buat Akun <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            />

            {/* ── Divider ──────────────────────────────────────────────────── */}
            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-background">
              <span className="text-xs text-muted-foreground">Atau lanjutkan dengan</span>
            </FieldSeparator>

            {/* ── Social login ─────────────────────────────────────────────── */}
            <Field>
              <div className="grid grid-cols-3 gap-3">
                {SOCIAL_PROVIDERS.map(({ id, label, path }) => (
                  <Button
                    key={id}
                    type="button"
                    variant="outline"
                    className="h-10 w-full"
                    aria-label={`Daftar dengan ${label}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                      <path d={path} fill="currentColor" />
                    </svg>
                    <span className="sr-only">Daftar dengan {label}</span>
                  </Button>
                ))}
              </div>
            </Field>

            {/* ── Switch to login ──────────────────────────────────────────── */}
            <p className="text-center text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                Masuk sekarang
              </Link>
            </p>
          </FieldGroup>
        </form>
      </div>

      {/* ── Legal footer ─────────────────────────────────────────────────────── */}
      <p className="px-4 text-center text-xs text-muted-foreground">
        Dengan mendaftar, Anda menyetujui{" "}
        <Link href="/terms" className="font-semibold underline-offset-2 hover:underline hover:text-primary">
          Syarat Layanan
        </Link>{" "}
        dan{" "}
        <Link href="/privacy" className="font-semibold underline-offset-2 hover:underline hover:text-primary">
          Kebijakan Privasi
        </Link>{" "}
        kami.
      </p>
    </div>
  );
}