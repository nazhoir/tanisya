import { auth } from "@tanisya/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SignUpForm from "@/components/sign-up-form";

export default async function Page() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (session) {
		redirect("/dashboard");
	}

	return <SignUpForm />;
}
