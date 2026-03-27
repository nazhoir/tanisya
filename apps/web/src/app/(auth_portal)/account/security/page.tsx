import { auth } from "@tanisya/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarPageHeader } from "@/components/sidebar-page-header";
import ChangePasswordForm from "./change-password-form";
import ManageSessionForm from "./manage-session-form";
import TwoFactorAuthenticationForm from "./two-factor-authentication-form";

export const metadata: Metadata = {
	title: "Keamanan | Akun",
	description: "Kelola keamanan akun kamu.",
};

export default async function SecurityPage() {
	const headersList = await headers();

	const session = await auth.api.getSession({
		headers: headersList,
	});

	if (!session) {
		redirect("/auth/login");
	}

	return (
		<>
			<SidebarPageHeader
				items={[{ label: "Akun", href: "/account" }, { label: "Keamanan" }]}
			/>

			<div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 pt-4">
				<div>
					<h1 className="font-semibold text-2xl tracking-tight">Keamanan</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Jaga keamanan akun kamu dengan pengaturan berikut.
					</p>
				</div>
				<ChangePasswordForm />
				<TwoFactorAuthenticationForm
					twoFactorEnabled={session?.user.twoFactorEnabled || false}
					email={session?.user.email!}
				/>
				<ManageSessionForm />

				{/* Sesi Aktif */}
			</div>
		</>
	);
}
