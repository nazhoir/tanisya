"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";

import { Button } from "@tanisya/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tanisya/ui/components/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@tanisya/ui/components/field";
import { Textarea }                       from "@tanisya/ui/components/textarea";
import { RadioGroup, RadioGroupItem }     from "@tanisya/ui/components/radio-group";
import { Label }                          from "@tanisya/ui/components/label";
import { Separator }                      from "@tanisya/ui/components/separator";
import { Badge }                          from "@tanisya/ui/components/badge";

const schema = z.object({
  approved:         z.boolean(),
  verificationNote: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

interface VerifyPaymentDialogProps {
  open:         boolean;
  payment:      any;
  onOpenChange: (open: boolean) => void;
  onSubmit:     (values: FormValues) => void;
  isPending:    boolean;
}

export function VerifyPaymentDialog({
  open,
  payment,
  onOpenChange,
  onSubmit,
  isPending,
}: VerifyPaymentDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { approved: true, verificationNote: "" },
  });

  useEffect(() => {
    if (open) reset({ approved: true, verificationNote: "" });
  }, [open, reset]);

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Verifikasi Pembayaran</DialogTitle>
          <DialogDescription>
            Periksa bukti transfer sebelum mengambil keputusan.
          </DialogDescription>
        </DialogHeader>

        {/* Payment summary */}
        <div className="rounded-lg border bg-muted/40 p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Jumlah</span>
            <span className="font-semibold">
              Rp {Number(payment.amount).toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bank</span>
            <span>{payment.bankName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">No. Rekening</span>
            <span className="font-mono">{payment.bankAccountNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Atas Nama</span>
            <span>{payment.bankAccountName}</span>
          </div>
        </div>

        {/* Proof image */}
        {payment.proofImageUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
            <Image
              src={payment.proofImageUrl}
              alt="Bukti Transfer"
              fill
              className="object-contain"
            />
          </div>
        )}

        <Separator />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Decision */}
          <Controller
            control={control}
            name="approved"
            render={({ field }) => (
              <Field>
                <FieldLabel>Keputusan</FieldLabel>
                <FieldGroup>
                  <RadioGroup
                    value={field.value ? "true" : "false"}
                    onValueChange={(v) => field.onChange(v === "true")}
                    className="flex gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="true" id="approve" />
                      <Label
                        htmlFor="approve"
                        className="cursor-pointer font-medium text-green-600"
                      >
                        ✓ Approve
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="false" id="reject" />
                      <Label
                        htmlFor="reject"
                        className="cursor-pointer font-medium text-destructive"
                      >
                        ✗ Tolak
                      </Label>
                    </div>
                  </RadioGroup>
                </FieldGroup>
                {errors.approved && (
                  <FieldError>{errors.approved.message}</FieldError>
                )}
              </Field>
            )}
          />

          {/* Note */}
          <Controller
            control={control}
            name="verificationNote"
            render={({ field }) => (
              <Field>
                <FieldLabel>
                  Catatan{" "}
                  <span className="text-muted-foreground font-normal">
                    (opsional)
                  </span>
                </FieldLabel>
                <FieldGroup>
                  <Textarea
                    placeholder="Alasan penolakan atau catatan verifikasi..."
                    rows={3}
                    {...field}
                  />
                </FieldGroup>
                <FieldDescription>
                  Catatan ini akan terlihat oleh user jika pembayaran ditolak.
                </FieldDescription>
                {errors.verificationNote && (
                  <FieldError>{errors.verificationNote.message}</FieldError>
                )}
              </Field>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Memproses..." : "Konfirmasi Keputusan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}