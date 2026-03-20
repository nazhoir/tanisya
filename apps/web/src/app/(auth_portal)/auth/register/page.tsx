
import { redirect } from "next/navigation";
import SignUpForm from "@/components/sign-up-form";
import { headers } from "next/headers";
import { auth } from "@tanisya/auth";

export default async function Page() {
	 const session = await auth.api.getSession({
			headers: await headers()
		})
		if(session) {
			redirect("/dashboard")
		}

	return <SignUpForm />;
}
