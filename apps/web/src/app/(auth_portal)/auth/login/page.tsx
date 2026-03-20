
import { redirect } from "next/navigation";
import SignInForm from "@/components/sign-in-form";
import { auth } from "@tanisya/auth";
import { headers } from "next/headers";

export default async function LoginPage() {
	 const session = await auth.api.getSession({
        headers: await headers()
    })
    if(session) {
        redirect("/dashboard")
    }


	return <SignInForm />;
}
