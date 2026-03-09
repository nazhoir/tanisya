"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload } from "lucide-react";

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
import { Input }     from "@tanisya/ui/components/input";
import { Separator } from "@tanisya/ui/components/separator";

const schema = z.object({
  bankName:          z.string().min(1, "Nama bank wajib diisi"),
  bankAccountName:   z.string().min(1, "Nama pemilik rekening wajib diisi"),
  bankAccountNumber: z.string().min(1, "Nomor rekening wajib diisi"),
  amount:            z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Format jumlah tidak valid"),
  proofImageUrl:     z.string().url("URL bukti transfer tidak valid"),
});

type FormValues = z.infer<typeof schema>;

interface ManualPaymentFormDialogProps {
  open:          boolean;
  onOpenChange:  (open: boolean) => void;
  invoiceId:     number;
  grandTotal:    number;
  onSubmit:      (values: FormValues) => void;
  isPending:     boolean;
}

export function ManualPaymentFormDialog({
  open,
  onOpenChange,
  invoiceId,
  grandTotal,
  onSubmit,
  isPending,
}: ManualPaymentFormDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      bankName:          "",
      bankAccountName:   "",
      bankAccountNumber: "",
      amount:            String(grandTotal),
      proofImageUrl:     "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        bankName:          "",
        bankAccountName:   "",
        bankAccountNumber: "",
        amount:            String(grandTotal),
        proofImageUrl:     "",
      });
    }
  }, [open, grandTotal, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Konfirmasi Pembayaran Manual</DialogTitle>
          <DialogDescription>
            Invoice #{invoiceId} — Total:{" "}
            <span className="font-semibold">
              Rp {grandTotal.toLocaleString("id-ID")}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Amount */}
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <Field>
                <FieldLabel>Jumlah Transfer (Rp)</FieldLabel>
                <FieldGroup>
                  <Input type="number" min="0" {...field} />
                </FieldGroup>
                <FieldDescription>
                  Pastikan jumlah sesuai dengan total invoice.
                </FieldDescription>
                {errors.amount && (
                  <FieldError>{errors.amount.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Separator />

          {/* Bank Name */}
          <Controller
            control={control}
            name="bankName"
            render={({ field }) => (
              <Field>
                <FieldLabel>Nama Bank Pengirim</FieldLabel>
                <FieldGroup>
                  <Input placeholder="BCA / Mandiri / BNI..." {...field} />
                </FieldGroup>
                {errors.bankName && (
                  <FieldError>{errors.bankName.message}</FieldError>
                )}
              </Field>
            )}
          />

          {/* Account Name */}
          <Controller
            control={control}
            name="bankAccountName"
            render={({ field }) => (
              <Field>
                <FieldLabel>Nama Pemilik Rekening</FieldLabel>
                <FieldGroup>
                  <Input placeholder="Budi Santoso" {...field} />
                </FieldGroup>
                {errors.bankAccountName && (
                  <FieldError>{errors.bankAccountName.message}</FieldError>
                )}
              </Field>
            )}
          />

          {/* Account Number */}
          <Controller
            control={control}
            name="bankAccountNumber"
            render={({ field }) => (
              <Field>
                <FieldLabel>Nomor Rekening</FieldLabel>
                <FieldGroup>
                  <Input
                    placeholder="1234567890"
                    inputMode="numeric"
                    {...field}
                  />
                </FieldGroup>
                {errors.bankAccountNumber && (
                  <FieldError>{errors.bankAccountNumber.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Separator />

          {/* Proof Image URL */}
          <Controller
            control={control}
            name="proofImageUrl"
            render={({ field }) => (
              <Field>
                <FieldLabel>URL Bukti Transfer</FieldLabel>
                <FieldGroup>
                  <div className="relative">
                    <Upload className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-8"
                      placeholder="https://..."
                      {...field}
                    />
                  </div>
                </FieldGroup>
                <FieldDescription>
                  Upload bukti ke storage (Cloudflare R2 / S3) lalu paste URL-nya di sini.
                </FieldDescription>
                {errors.proofImageUrl && (
                  <FieldError>{errors.proofImageUrl.message}</FieldError>
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
              {isPending ? "Mengirim..." : "Kirim Konfirmasi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}