import { auth } from "@tanisya/auth";
// import RequestDeleteAccount from "./request-delete-account";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarPageHeader } from "@/components/sidebar-page-header";
import FormPersonalInformation from "./form-personal-information";
import PhotoProfile from "./photo-profile";

export const metadata: Metadata = {
	title: "Profil | Akun",
	description: "Kelola informasi pribadi dan foto profil kamu.",
};

export default async function ProfilePage() {
	const headersList = await headers();

	const session = await auth.api.getSession({
		headers: headersList,
	});

	if (!session) {
		redirect("/auth/login");
	}
	return (
		<>
			<SidebarPageHeader items={[{ label: "Akun" }]} />

			<div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 pt-4">
				<div>
					<h1 className="font-semibold text-2xl tracking-tight">Profil</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Kelola informasi pribadi dan foto profil kamu.
					</p>
				</div>
				<PhotoProfile
					userId={session.user.id}
					image={session.user.image}
					name={session.user.name!}
				/>
				<FormPersonalInformation
					userId={session.user.id}
					name={session.user.name!}
					email={session.user.email}
					emailVerified={session.user.emailVerified}
					username={session.user.username!}
				/>
				{/* TODO */}
				{/* <RequestDeleteAccount /> */}
			</div>
		</>
	);
}
