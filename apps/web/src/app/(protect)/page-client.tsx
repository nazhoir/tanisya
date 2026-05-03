"use client";

import { EmptyOrganization } from "@/components/empty-organization";
import Loader from "@/components/loader";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@tanisya/ui/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@tanisya/ui/components/avatar";

// ─── OrganizationCard ──────────────────────────────────────────────────────

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

function OrganizationCard({ org }: { org: Organization }) {
  const initials = org.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Link href={`/org/${org.id}` as any}>
      <Card className="group h-full transition-colors hover:bg-accent/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Avatar className="h-12 w-12 ">
            <AvatarImage src={org.logo || ""} alt={org.name} className="object-cover" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <CardTitle className="truncate text-base">{org.name}</CardTitle>
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function DashboardPageClient() {
  const { data: projects, isPending } = authClient.useListOrganizations();

  if (isPending) {
    return <Loader />;
  }

  if (!projects || projects.length === 0) {
    return <EmptyOrganization />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>Organisasi Anda</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Pilih Organisasi</h1>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((org) => (
          <OrganizationCard key={org.id} org={org} />
        ))}
      </div>
    </div>
  );
}
