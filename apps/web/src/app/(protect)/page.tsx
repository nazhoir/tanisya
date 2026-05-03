import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import DashboardPage from "./page-client";
import { client } from "@/utils/orpc";
import DashboardPageClient from "./page-client";

export default async function Page() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      throw: true,
    },
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Melakukan destructuring karena response oRPC adalah { status: string }
  const { status } = await client.onboarding.getStatus({
    userId: session.user.id,
  });

  // Mengecek apakah status BUKAN "completed" dan BUKAN "skipped_topup"
  const isCompleted = status === "completed" || status === "skipped_topup";

  if (!isCompleted) {
    redirect("/onboarding");
  }

  return <DashboardPageClient/>
}
