import OnboardingFeed from "@/components/shadcn-studio/blocks/onboarding-feed-01/onboarding-feed-01";
import { authClient } from "@/lib/auth-client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async  function OnboardingPage() {

  const session = await authClient.getSession({
      fetchOptions: {
        headers: await headers(),
        throw: true,
      },
    });
  
    if (!session?.user) {
      redirect("/login");
    }
  return (
    <div className="flex flex-col">
      <div className="py-8 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <OnboardingFeed userId={session.user.id} userName={session.user.name} userEmail={session.user.email} />
          </div>
        </div>
      </div>
    </div>
  );
}
