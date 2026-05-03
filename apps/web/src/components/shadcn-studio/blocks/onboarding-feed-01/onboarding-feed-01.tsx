// apps/web/src/components/shadcn-studio/blocks/onboarding-feed-01/onboarding-feed-01.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useStore } from "@tanstack/react-form";
import * as z from "zod";
import { 
  CircleDashedIcon, 
  Wallet, 
  CircleCheckIcon, 
  PlusIcon, 
  ExternalLinkIcon, 
  AlertCircleIcon, 
  Loader2Icon 
} from "lucide-react";

import { Button } from "@tanisya/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tanisya/ui/components/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@tanisya/ui/components/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@tanisya/ui/components/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@tanisya/ui/components/field";
import { Input } from "@tanisya/ui/components/input";
import { Separator } from "@tanisya/ui/components/separator";
import { Alert, AlertDescription, AlertTitle } from "@tanisya/ui/components/alert";

import { orpc } from "@/utils/orpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

const orgSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter.").max(50),
  slug: z.string().min(3, "Slug minimal 3 karakter.").regex(/^[a-z0-9-]+$/, "Hanya huruf kecil, angka, dan tanda hubung"),
});

const topupSchema = z.object({
  amount: z.number().min(50000, "Minimal top up adalah Rp 50.000"),
});

interface OnboardingFeedProps {
  userId: string;
  userName: string;
  userEmail: string;
}

interface OnboardingStatus {
  status: string;
  metadata?: {
    organizationId?: string;
  };
}

export default function OnboardingFeed({ userId, userName, userEmail }: OnboardingFeedProps) {
  const [active, setActive] = React.useState<string>("");
  const [isOrgDialogOpen, setIsOrgDialogOpen] = React.useState(false);
  const [isTopupDialogOpen, setIsTopupDialogOpen] = React.useState(false);
  const [isProcessLoading, setIsProcessLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const currentOrgId = activeOrganization?.id;

  const { data, isLoading, refetch } = useQuery(
    orpc.onboarding.getStatus.queryOptions({ input: { userId } }),
  );

  const onboardingData = data as OnboardingStatus | undefined;

  const { mutateAsync: updateStatus } = useMutation(
    orpc.onboarding.updateStatus.mutationOptions()
  );

  const { mutateAsync: createTopup } = useMutation(
    orpc.point.createTopupSession.mutationOptions()
  );

  const defaultOrgName = userName ? `Proyek ${userName}` : "";
  const defaultOrgSlug = defaultOrgName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const orgForm = useForm({
    defaultValues: { name: defaultOrgName, slug: defaultOrgSlug },
    validators: {
      onSubmit: orgSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setErrorMessage(null);
        setIsProcessLoading(true);
        
        const { data: org, error: createError } = await authClient.organization.create({
          name: value.name,
          slug: value.slug,
          userId: userId,
          keepCurrentActiveOrganization: false,
        });

        if (createError) {
          const msg = createError?.message ?? "";
          if (msg.toLowerCase().includes("already exists")) throw new Error("Slug sudah digunakan.");
          throw new Error(msg || "Gagal membuat organisasi");
        }

        if (org) {
          await authClient.organization.setActive({ organizationId: org.id });
          await authClient.getSession(); 
          
          await updateStatus({ 
            userId, 
            status: "pending_topup", 
            metadata: { organizationId: org.id } 
          });
          
          await refetch();
          
          setIsOrgDialogOpen(false);
          setActive("pending_topup");
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Gagal memproses organisasi");
      } finally {
        setIsProcessLoading(false);
      }
    },
  });

  const topupForm = useForm({
    defaultValues: { amount: 50000 },
    validators: {
      onSubmit: topupSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setIsProcessLoading(true);
        
        if (!currentOrgId) {
          throw new Error("ID Organisasi tidak ditemukan. Sistem sedang mensinkronkan data, silakan coba lagi.");
        }

        const res = await createTopup({
          organizationId: currentOrgId,
          userId: userId,
          amount: value.amount,
        });

        if (res.invoiceId) {
          window.location.href = `/billing/invoice/${res.invoiceId}`;
        }
      } catch (err: any) {
        setErrorMessage(err.message);
      } finally {
        setIsProcessLoading(false);
      }
    },
  });

  const watchedAmount = useStore(topupForm.store, (s) => s.values.amount);
  const tax = Math.floor(watchedAmount * 0.11);
  const appFee = 2000;
  const totalBill = watchedAmount + tax + appFee;

  React.useEffect(() => {
    if (onboardingData?.status) {
      const isDone = onboardingData.status === "completed" || onboardingData.status === "skipped_topup";
      setActive(isDone ? "" : onboardingData.status);
    }
  }, [onboardingData?.status]);

  if (isLoading) return null;
  const isAllCompleted = onboardingData?.status === "completed" || onboardingData?.status === "skipped_topup";

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle>Halo, {userName}!</CardTitle>
          <CardDescription>Selesaikan langkah berikut untuk mengaktifkan akun.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" value={active} onValueChange={setActive} className="w-full space-y-2">
            <AccordionItem value="pending_organization" className="rounded-md border">
              <AccordionTrigger className="px-5">
                <div className="flex items-center gap-2">
                  {onboardingData?.status !== "pending_organization" ? <CircleCheckIcon className="size-4 text-primary" /> : <CircleDashedIcon className="size-4" />}
                  <span>Buat Organisasi</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4 space-y-4 text-sm">
                <p className="text-muted-foreground">Langkah awal untuk mulai mengelola infrastruktur Anda.</p>
                <Button size="sm" onClick={() => { setErrorMessage(null); setIsOrgDialogOpen(true); }} disabled={onboardingData?.status !== "pending_organization"}>
                  <PlusIcon className="size-4 mr-2" /> Buat Organisasi
                </Button>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="pending_topup" className="rounded-md border">
              <AccordionTrigger className="px-5">
                <div className="flex items-center gap-2">
                  {isAllCompleted ? <CircleCheckIcon className="size-4 text-primary" /> : <CircleDashedIcon className="size-4" />}
                  <span>Top Up Poin</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4 space-y-4 text-sm">
                <p className="text-muted-foreground">Isi saldo untuk membeli layanan pertama Anda. (1 Poin = Rp 1)</p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => { setErrorMessage(null); setIsTopupDialogOpen(true); }} 
                    disabled={onboardingData?.status !== "pending_topup" || isProcessLoading}
                  >
                    {isProcessLoading && active === "pending_topup" ? <Loader2Icon className="size-4 mr-2 animate-spin" /> : <Wallet className="size-4 mr-2" />}
                    Top Up Sekarang
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => updateStatus({ userId, status: "skipped_topup" }).then(() => refetch())}>
                    Lewati
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {isAllCompleted && (
            <Button className="w-full mt-6" onClick={() => window.location.href = "/dashboard"}>
              Masuk ke Dashboard
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOrgDialogOpen} onOpenChange={setIsOrgDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Buat Organisasi</DialogTitle></DialogHeader>
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <form 
            id="org-form" 
            onSubmit={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              orgForm.handleSubmit(); 
            }}
          >
            <FieldGroup>
              <orgForm.Field name="name">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel>Nama Organisasi</FieldLabel>
                    <Input 
                      value={field.state.value} 
                      onBlur={field.handleBlur} 
                      onChange={(e) => field.handleChange(e.target.value)} 
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </orgForm.Field>
              <orgForm.Field name="slug">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel>Slug (ID Unik)</FieldLabel>
                    <Input 
                      value={field.state.value} 
                      onBlur={field.handleBlur} 
                      onChange={(e) => field.handleChange(e.target.value)} 
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </orgForm.Field>
            </FieldGroup>
          </form>
          <DialogFooter>
            <Button type="submit" form="org-form" disabled={isProcessLoading}>
              {isProcessLoading ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
              Lanjutkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTopupDialogOpen} onOpenChange={setIsTopupDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Isi Saldo Poin</DialogTitle>
            <DialogDescription>Min. Rp 50.000. Biaya termasuk Pajak 11% & Admin.</DialogDescription>
          </DialogHeader>
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <form id="topup-form" onSubmit={(e) => { e.preventDefault(); topupForm.handleSubmit(); }}>
            <div className="space-y-6">
              <topupForm.Field name="amount">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel>Jumlah Top Up (Rupiah)</FieldLabel>
                    <Input type="number" value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} />
                    <div className="flex gap-2 mt-2">
                      {[50000, 100000, 250000].map(val => (
                        <Button key={val} type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => field.handleChange(val)}>
                          Rp {val.toLocaleString()}
                        </Button>
                      ))}
                    </div>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </topupForm.Field>
              <Card className="bg-muted/50 border-none">
                <CardContent className="p-4 space-y-2 text-xs">
                  <div className="flex justify-between"><span>Poin Didapat:</span><span className="font-bold">{watchedAmount.toLocaleString()} Poin</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>Pajak (11%):</span><span>Rp {tax.toLocaleString()}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>Biaya Layanan:</span><span>Rp {appFee.toLocaleString()}</span></div>
                  <Separator />
                  <div className="flex justify-between text-sm font-bold text-primary"><span>Total Bayar:</span><span>Rp {totalBill.toLocaleString()}</span></div>
                </CardContent>
              </Card>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTopupDialogOpen(false)} disabled={isProcessLoading}>Batal</Button>
            <Button type="submit" form="topup-form" disabled={isProcessLoading || !currentOrgId}>
              {isProcessLoading ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLinkIcon className="size-4 ml-2" />}
              Bayar Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}