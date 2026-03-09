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

const schema = z.object({
  name:        z.string().min(1, "Nama wajib diisi"),
  slug:        z
    .string()
    .min(1, "Slug wajib diisi")
    .regex(/^[a-z0-9-]+$/, "Hanya huruf kecil, angka, dan tanda -"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ProjectFormDialogProps {
  open:           boolean;
  onOpenChange:   (open: boolean) => void;
  defaultValues?: any;
  onSubmit:       (values: FormValues) => void;
  isPending:      boolean;
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  isPending,
}: ProjectFormDialogProps) {
  const isEditing = !!defaultValues?.id;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "", description: "" },
  });

  // Reset form setiap dialog dibuka
  useEffect(() => {
    if (open) {
      reset(
        defaultValues
          ? {
              name:        defaultValues.name,
              slug:        defaultValues.slug,
              description: defaultValues.description ?? "",
            }
          : { name: "", slug: "", description: "" }
      );
    }
  }, [open, defaultValues, reset]);

  // Auto-generate slug dari name (hanya saat create)
  const watchName = watch("name");
  useEffect(() => {
    if (!isEditing) {
      setValue(
        "slug",
        watchName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
      );
    }
  }, [watchName, isEditing, setValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Project" : "Buat Project Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Perbarui informasi project Anda."
              : "Isi detail untuk project baru."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Field>
                <FieldLabel>Nama Project</FieldLabel>
                <FieldGroup>
                  <Input placeholder="Toko Online Saya" {...field} />
                </FieldGroup>
                {errors.name && (
                  <FieldError>{errors.name.message}</FieldError>
                )}
              </Field>
            )}
          />

          {/* Slug */}
          <Controller
            control={control}
            name="slug"
            render={({ field }) => (
              <Field>
                <FieldLabel>Slug</FieldLabel>
                <FieldGroup>
                  <Input placeholder="toko-online-saya" {...field} />
                </FieldGroup>
                <FieldDescription>
                  URL-friendly identifier — hanya huruf kecil, angka, dan tanda -
                </FieldDescription>
                {errors.slug && (
                  <FieldError>{errors.slug.message}</FieldError>
                )}
              </Field>
            )}
          />

          {/* Description */}
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <Field>
                <FieldLabel>
                  Deskripsi{" "}
                  <span className="text-muted-foreground font-normal">
                    (opsional)
                  </span>
                </FieldLabel>
                <FieldGroup>
                  <Textarea
                    placeholder="Deskripsi singkat project..."
                    rows={3}
                    {...field}
                  />
                </FieldGroup>
                {errors.description && (
                  <FieldError>{errors.description.message}</FieldError>
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
              {isPending
                ? "Menyimpan..."
                : isEditing
                ? "Simpan Perubahan"
                : "Buat Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}