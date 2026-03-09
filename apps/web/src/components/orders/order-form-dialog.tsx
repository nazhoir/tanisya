"use client";

import { useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";

import { Button }  from "@tanisya/ui/components/button";
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
import { Input }    from "@tanisya/ui/components/input";
import { Textarea } from "@tanisya/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tanisya/ui/components/select";
import { Separator } from "@tanisya/ui/components/separator";

const PRODUCT_TYPES = [
  "domain",
  "hosting_vps",
  "ssl",
  "email_hosting",
  "software_license",
  "course",
  "merchandise",
] as const;

const ORDER_TYPES = ["new", "renew", "upgrade", "transfer_in", "addon"] as const;

const itemSchema = z.object({
  productName:   z.string().min(1, "Nama produk wajib diisi"),
  type:          z.enum(PRODUCT_TYPES),
  orderType:     z.enum(ORDER_TYPES),
  unitPrice:     z.string().regex(/^\d+(\.\d{1,2})?$/, "Format harga tidak valid"),
  qty:           z.coerce.number().int().min(1, "Min. 1"),
  discountAmount: z.string(),
}).strict();

const schema = z.object({
  projectId:  z.coerce.number().int().positive("Pilih project"),
  notes:      z.string().max(500).optional(),
  couponCode: z.string().max(50).optional(),
  items:      z.array(itemSchema).min(1, "Minimal 1 item"),
}).strict();

type FormValues = z.infer<typeof schema>;

interface OrderFormDialogProps {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
  projects:     { id: number; name: string }[];
  onSubmit:     (values: FormValues) => void;
  isPending:    boolean;
}

export function OrderFormDialog({
  open,
  onOpenChange,
  projects,
  onSubmit,
  isPending,
}: OrderFormDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      projectId: 0,
      notes:     "",
      couponCode: "",
      items: [
        {
          productName:    "",
          type:           "domain",
          orderType:      "new",
          unitPrice:      "0",
          qty:            1,
          discountAmount: "0",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  // Hitung grand total secara realtime
  const watchItems = watch("items");
  const grandTotal = watchItems.reduce((acc, item) => {
    const line =
      parseFloat(item.unitPrice || "0") * (item.qty || 1) -
      parseFloat(item.discountAmount || "0");
    return acc + Math.max(0, line);
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Order Baru</DialogTitle>
          <DialogDescription>
            Tambahkan produk ke keranjang dan lanjutkan ke checkout.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Project */}
          <Controller
            control={control}
            name="projectId"
            render={({ field }) => (
              <Field>
                <FieldLabel>Project</FieldLabel>
                <FieldGroup>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldGroup>
                {errors.projectId && (
                  <FieldError>{errors.projectId.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Separator />

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Item Order</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    productName:    "",
                    type:           "domain",
                    orderType:      "new",
                    unitPrice:      "0",
                    qty:            1,
                    discountAmount: "0",
                  })
                }
              >
                <Plus className="mr-1 h-3 w-3" /> Tambah Item
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border p-4 space-y-4 relative"
              >
                {/* Remove button */}
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}

                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Item {index + 1}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {/* Product Name */}
                  <Controller
                    control={control}
                    name={`items.${index}.productName`}
                    render={({ field }) => (
                      <Field className="col-span-2">
                        <FieldLabel>Nama Produk</FieldLabel>
                        <FieldGroup>
                          <Input placeholder="contoh.com" {...field} />
                        </FieldGroup>
                        {errors.items?.[index]?.productName && (
                          <FieldError>
                            {errors.items[index]!.productName!.message}
                          </FieldError>
                        )}
                      </Field>
                    )}
                  />

                  {/* Type */}
                  <Controller
                    control={control}
                    name={`items.${index}.type`}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>Tipe Produk</FieldLabel>
                        <FieldGroup>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PRODUCT_TYPES.map((t) => (
                                <SelectItem key={t} value={t}>
                                  {t.replace("_", " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FieldGroup>
                      </Field>
                    )}
                  />

                  {/* Order Type */}
                  <Controller
                    control={control}
                    name={`items.${index}.orderType`}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>Jenis Order</FieldLabel>
                        <FieldGroup>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_TYPES.map((t) => (
                                <SelectItem key={t} value={t}>
                                  {t.replace("_", " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FieldGroup>
                      </Field>
                    )}
                  />

                  {/* Unit Price */}
                  <Controller
                    control={control}
                    name={`items.${index}.unitPrice`}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>Harga Satuan (Rp)</FieldLabel>
                        <FieldGroup>
                          <Input
                            type="number"
                            min="0"
                            placeholder="150000"
                            {...field}
                          />
                        </FieldGroup>
                        {errors.items?.[index]?.unitPrice && (
                          <FieldError>
                            {errors.items[index]!.unitPrice!.message}
                          </FieldError>
                        )}
                      </Field>
                    )}
                  />

                  {/* Qty */}
                  <Controller
                    control={control}
                    name={`items.${index}.qty`}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>Qty</FieldLabel>
                        <FieldGroup>
                          <Input type="number" min="1" {...field} />
                        </FieldGroup>
                        {errors.items?.[index]?.qty && (
                          <FieldError>
                            {errors.items[index]!.qty!.message}
                          </FieldError>
                        )}
                      </Field>
                    )}
                  />
                </div>
              </div>
            ))}

            {errors.items?.root && (
              <p className="text-sm text-destructive">
                {errors.items.root.message}
              </p>
            )}
          </div>

          <Separator />

          {/* Coupon */}
          <Controller
            control={control}
            name="couponCode"
            render={({ field }) => (
              <Field>
                <FieldLabel>
                  Kode Kupon{" "}
                  <span className="text-muted-foreground font-normal">
                    (opsional)
                  </span>
                </FieldLabel>
                <FieldGroup>
                  <Input placeholder="DISKON50" {...field} />
                </FieldGroup>
              </Field>
            )}
          />

          {/* Notes */}
          <Controller
            control={control}
            name="notes"
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
                    placeholder="Catatan tambahan untuk order ini..."
                    rows={2}
                    {...field}
                  />
                </FieldGroup>
              </Field>
            )}
          />

          {/* Grand Total preview */}
          <div className="rounded-lg border bg-muted/40 p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Estimasi Total
            </span>
            <span className="text-lg font-bold">
              Rp {grandTotal.toLocaleString("id-ID")}
            </span>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Membuat Order..." : "Buat Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}