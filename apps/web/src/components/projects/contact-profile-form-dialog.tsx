"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import { Switch }    from "@tanisya/ui/components/switch";
import { Label }     from "@tanisya/ui/components/label";

const schema = z.object({
  label:        z.string().max(100).optional(),
  firstName:    z.string().min(1, "Nama depan wajib diisi"),
  lastName:     z.string().optional(),
  organization: z.string().optional(),
  email:        z.string().email("Format email tidak valid"),
  phone:        z.string().min(5, "Nomor telepon wajib diisi"),
  address1:     z.string().min(1, "Alamat wajib diisi"),
  address2:     z.string().optional(),
  city:         z.string().min(1, "Kota wajib diisi"),
  province:     z.string().optional(),
  postalCode:   z.string().min(1, "Kode pos wajib diisi"),
  country:      z.string().length(2, "Kode negara 2 huruf (ISO 3166-1)"),
  isDefault:    z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface ContactProfileFormDialogProps {
  open:           boolean;
  onOpenChange:   (open: boolean) => void;
  defaultValues?: any;
  onSubmit:       (values: FormValues) => void;
  isPending:      boolean;
}

export function ContactProfileFormDialog({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  isPending,
}: ContactProfileFormDialogProps) {
  const isEditing = !!defaultValues?.id;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label:        "",
      firstName:    "",
      lastName:     "",
      organization: "",
      email:        "",
      phone:        "",
      address1:     "",
      address2:     "",
      city:         "",
      province:     "",
      postalCode:   "",
      country:      "ID",
      isDefault:    false,
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        defaultValues
          ? { ...defaultValues }
          : {
              label: "", firstName: "", lastName: "",
              organization: "", email: "", phone: "",
              address1: "", address2: "", city: "",
              province: "", postalCode: "", country: "ID",
              isDefault: false,
            }
      );
    }
  }, [open, defaultValues, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Contact Profile" : "Tambah Contact Profile"}
          </DialogTitle>
          <DialogDescription>
            Data ini digunakan sebagai registrant domain.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Label */}
          <Controller
            control={control}
            name="label"
            render={({ field }) => (
              <Field>
                <FieldLabel>
                  Label{" "}
                  <span className="text-muted-foreground font-normal">
                    (opsional)
                  </span>
                </FieldLabel>
                <FieldGroup>
                  <Input placeholder="Kontak Pribadi / Bisnis" {...field} />
                </FieldGroup>
                <FieldDescription>
                  Label untuk memudahkan identifikasi kontak ini.
                </FieldDescription>
              </Field>
            )}
          />

          <Separator />

          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={control}
              name="firstName"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Nama Depan</FieldLabel>
                  <FieldGroup>
                    <Input placeholder="Budi" {...field} />
                  </FieldGroup>
                  {errors.firstName && (
                    <FieldError>{errors.firstName.message}</FieldError>
                  )}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="lastName"
              render={({ field }) => (
                <Field>
                  <FieldLabel>
                    Nama Belakang{" "}
                    <span className="text-muted-foreground font-normal">
                      (opsional)
                    </span>
                  </FieldLabel>
                  <FieldGroup>
                    <Input placeholder="Santoso" {...field} />
                  </FieldGroup>
                </Field>
              )}
            />
          </div>

          {/* Organization */}
          <Controller
            control={control}
            name="organization"
            render={({ field }) => (
              <Field>
                <FieldLabel>
                  Organisasi{" "}
                  <span className="text-muted-foreground font-normal">
                    (opsional)
                  </span>
                </FieldLabel>
                <FieldGroup>
                  <Input placeholder="PT. Contoh Indonesia" {...field} />
                </FieldGroup>
              </Field>
            )}
          />

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <FieldGroup>
                    <Input
                      type="email"
                      placeholder="budi@contoh.com"
                      {...field}
                    />
                  </FieldGroup>
                  {errors.email && (
                    <FieldError>{errors.email.message}</FieldError>
                  )}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Telepon</FieldLabel>
                  <FieldGroup>
                    <Input
                      placeholder="+628123456789"
                      inputMode="tel"
                      {...field}
                    />
                  </FieldGroup>
                  {errors.phone && (
                    <FieldError>{errors.phone.message}</FieldError>
                  )}
                </Field>
              )}
            />
          </div>

          <Separator />

          {/* Address */}
          <Controller
            control={control}
            name="address1"
            render={({ field }) => (
              <Field>
                <FieldLabel>Alamat</FieldLabel>
                <FieldGroup>
                  <Input placeholder="Jl. Sudirman No. 1" {...field} />
                </FieldGroup>
                {errors.address1 && (
                  <FieldError>{errors.address1.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            control={control}
            name="address2"
            render={({ field }) => (
              <Field>
                <FieldLabel>
                  Alamat Baris 2{" "}
                  <span className="text-muted-foreground font-normal">
                    (opsional)
                  </span>
                </FieldLabel>
                <FieldGroup>
                  <Input placeholder="Lantai 5, Gedung XYZ" {...field} />
                </FieldGroup>
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={control}
              name="city"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Kota</FieldLabel>
                  <FieldGroup>
                    <Input placeholder="Jakarta" {...field} />
                  </FieldGroup>
                  {errors.city && (
                    <FieldError>{errors.city.message}</FieldError>
                  )}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="province"
              render={({ field }) => (
                <Field>
                  <FieldLabel>
                    Provinsi{" "}
                    <span className="text-muted-foreground font-normal">
                      (opsional)
                    </span>
                  </FieldLabel>
                  <FieldGroup>
                    <Input placeholder="DKI Jakarta" {...field} />
                  </FieldGroup>
                </Field>
              )}
            />
            <Controller
              control={control}
              name="postalCode"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Kode Pos</FieldLabel>
                  <FieldGroup>
                    <Input
                      placeholder="12345"
                      inputMode="numeric"
                      {...field}
                    />
                  </FieldGroup>
                  {errors.postalCode && (
                    <FieldError>{errors.postalCode.message}</FieldError>
                  )}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="country"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Kode Negara</FieldLabel>
                  <FieldGroup>
                    <Input
                      placeholder="ID"
                      maxLength={2}
                      className="uppercase"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FieldGroup>
                  <FieldDescription>ISO 3166-1 alpha-2</FieldDescription>
                  {errors.country && (
                    <FieldError>{errors.country.message}</FieldError>
                  )}
                </Field>
              )}
            />
          </div>

          <Separator />

          {/* Is Default */}
          <Controller
            control={control}
            name="isDefault"
            render={({ field }) => (
              <Field>
                <FieldGroup>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="isDefault"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="isDefault" className="cursor-pointer">
                      Jadikan kontak default
                    </Label>
                  </div>
                </FieldGroup>
                <FieldDescription>
                  Kontak ini akan otomatis dipilih saat order domain baru.
                </FieldDescription>
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
              {isPending
                ? "Menyimpan..."
                : isEditing
                ? "Simpan Perubahan"
                : "Tambah Kontak"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}