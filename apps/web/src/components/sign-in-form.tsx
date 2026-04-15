"use client";

import { Button } from "@tanisya/ui/components/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@tanisya/ui/components/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@tanisya/ui/components/input-group";
import { useForm } from "@tanstack/react-form";
import { ArrowRight, Lock, Mail, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";
import { InputPassword } from "@/components/input-password";
import Loader from "@/components/loader";

// ─── Social providers ─────────────────────────────────────────────────────────

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

// ─── Validation schema ────────────────────────────────────────────────────────

const signInSchema = z.object({
	identifier: z.string().min(1, "Email/username tidak boleh kosong"),
	password: z.string().min(8, "Password minimal 8 karakter"),
});

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
	const router = useRouter();
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: { identifier: "", password: "" },
		validators: { onSubmit: signInSchema },
		onSubmit: async ({ value }) => {
			const isEmail = value.identifier.includes("@");

			const result = isEmail
				? await authClient.signIn.email({
						email: value.identifier,
						password: value.password,
					})
				: await authClient.signIn.username({
						username: value.identifier,
						password: value.password,
					});

			if (result.error) {
				toast.error(result.error.message || result.error.statusText);
				return;
			}

			if ((result.data as { twoFactorRedirect?: boolean })?.twoFactorRedirect) {
				router.push("/auth/login/2fa");
				return;
			}

			toast.success("Berhasil masuk");
			router.push("/dashboard");
		},
	});

	if (isPending) return <Loader />;

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<FieldGroup>
				<div className="mb-2 flex flex-col gap-1">
					<h1 className="font-extrabold text-2xl tracking-tight">
						Selamat Datang Kembali
					</h1>
					<p className="text-muted-foreground text-sm">
						Masuk ke akun Anda untuk melanjutkan
					</p>
				</div>

				{/* Email / Username */}
				<form.Field
					name="identifier"
					children={(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Email atau Username</FieldLabel>
								<InputGroup>
									<InputGroupInput
										id={field.name}
										name={field.name}
										type="text"
										placeholder="nama@contoh.com atau username"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										autoComplete="username"
										autoFocus
									/>
									<InputGroupAddon>
										<Mail />
									</InputGroupAddon>
								</InputGroup>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>

				{/* Password */}
				<form.Field
					name="password"
					children={(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<div className="flex items-center justify-between">
									<FieldLabel htmlFor={field.name}>Password</FieldLabel>
									<Link
										href="/auth/forgot-password"
										className="font-semibold text-primary text-xs underline-offset-2 hover:underline"
									>
										Lupa password?
									</Link>
								</div>
								<InputPassword
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={field.handleChange}
									aria-invalid={isInvalid}
									icon={Lock}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>

				{/* Submit */}
				<form.Subscribe
					selector={(s) => [s.canSubmit, s.isSubmitting] as const}
					children={([canSubmit, isSubmitting]) => (
						<Button
							type="submit"
							size="lg"
							className="h-11 w-full gap-2 font-bold shadow-md shadow-primary/15"
							disabled={!canSubmit || isSubmitting}
						>
							{isSubmitting ? (
								<>
									<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
									Memproses...
								</>
							) : (
								<>
									Masuk <ArrowRight className="h-4 w-4" />
								</>
							)}
						</Button>
					)}
				/>

				{/* Alternative login methods */}
				<div className="flex flex-col gap-2">
					<Button
						type="button"
						variant="outline"
						className="h-10 w-full gap-2"
						onClick={() => router.push("/auth/login/otp")}
					>
						<Sparkles className="h-4 w-4" />
						Masuk dengan Kode OTP
					</Button>
					<Button
						type="button"
						variant="outline"
						className="h-10 w-full gap-2"
						onClick={() => router.push("/auth/login/magic-link")}
					>
						<Mail className="h-4 w-4" />
						Kirim Magic Link
					</Button>
				</div>

				{/* Social divider */}
				<FieldSeparator className="*:data-[slot=field-separator-content]:bg-background">
					<span className="text-muted-foreground text-xs">
						Atau lanjutkan dengan
					</span>
				</FieldSeparator>

				{/* Social buttons */}
				<Field orientation="horizontal" className="grid grid-cols-3 gap-3">
					{SOCIAL_PROVIDERS.map(({ id, label, path }) => (
						<Button
							key={id}
							type="button"
							variant="outline"
							className="h-10 w-full"
							aria-label={`Masuk dengan ${label}`}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								className="h-4 w-4"
								aria-hidden
							>
								<path d={path} fill="currentColor" />
							</svg>
						</Button>
					))}
				</Field>

				{/* Register link */}
				<p className="text-center text-muted-foreground text-sm">
					Belum punya akun?{" "}
					<Link
						href="/auth/register"
						className="font-semibold text-primary underline-offset-2 hover:underline"
					>
						Daftar sekarang
					</Link>
				</p>
			</FieldGroup>
		</form>
	);
}