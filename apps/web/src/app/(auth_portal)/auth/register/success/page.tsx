
import { headers } from "next/headers";
import RegisterSuccessClient from "./register-success-client";
import { auth } from "@tanisya/auth";
import { redirect } from "next/navigation";


export default async function RegisterSuccessPage() {

	 const session = await auth.api.getSession({
			headers: await headers()
		})
		if(session) {
			redirect("/dashboard")
		}
	

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			{/* Decorative background blobs */}
			<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute top-1/4 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />
				<div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-emerald-500/8 blur-[80px]" />
			</div>

			<RegisterSuccessClient />
		</div>
	);
}
