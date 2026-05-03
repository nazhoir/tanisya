"use client";

import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { Button } from "@tanisya/ui/components/button";
import { Input } from "@tanisya/ui/components/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@tanisya/ui/components/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@tanisya/ui/components/tabs";
import { RadioGroup, RadioGroupItem } from "@tanisya/ui/components/radio-group";
import { ArrowLeft, Receipt } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

// ─── Payment Channel Config ────────────────────────────────────────────────

export const MANUAL_CATEGORIES = [
  {
    label: "Transfer Bank Manual",
    channel: [
      {
        channel_code: "MANUAL_BRI",
        display_name: "Transfer BRI",
        vendor: "MANUAL",
        logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_2020.svg",
        payment_fees: null,
      },
      {
        channel_code: "MANUAL_BCA",
        display_name: "Transfer BCA",
        vendor: "MANUAL",
        logo: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg",
        payment_fees: null,
      },
    ],
  },
];

export const GATEWAY_CATEGORIES = [
  {
    label: "QR Code",
    channel: [
      {
        channel_code: "QRIS",
        display_name: "QRIS",
        vendor: "xendit",
        logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg",
        payment_fees: {
          fixed: null,
          percent: 0.7,
          maximal: null,
          additional: null,
        },
      },
    ],
  },
];

// ─── Fee Calculator ────────────────────────────────────────────────────────

export const calculateTransactionFee = (
  amount: number,
  feeStructure: any
): number => {
  if (!feeStructure) return 0;
  let totalFee = 0;
  if (feeStructure.percent)
    totalFee +=
      (amount *
        (feeStructure.maximal ? feeStructure.maximal : feeStructure.percent)) /
      100;
  if (feeStructure.fixed) totalFee += feeStructure.fixed;
  if (feeStructure.additional && feeStructure.percent !== null)
    totalFee += feeStructure.additional;
  return Math.ceil(totalFee);
};

// ─── Zod Schemas ───────────────────────────────────────────────────────────

const step1Schema = z.object({
  amount: z.number({ error: "Nominal wajib diisi" }).min(50000, "Minimal top up Rp 50.000"),
});

const step2Schema = z.object({
  channelCode: z.string().min(1, "Pilih metode pembayaran"),
});

// ─── Types ─────────────────────────────────────────────────────────────────

export interface TopupPayload {
  organizationId: string;
  amount: number;
  pointsAdded: number;
  paymentProvider: string;
  paymentChannel: string;
  customDueDate: Date;
}

interface TopupSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: TopupPayload) => void;
  isSubmitting: boolean;
  organizationId: string;
}

// ─── Step 1: Nominal Form ──────────────────────────────────────────────────

function Step1Form({
  onNext,
}: {
  onNext: (amount: number) => void;
}) {
  const form = useForm({
    defaultValues: { amount: "" as number | "" },
    validators: {
      onSubmit: step1Schema,
    },
    onSubmit: async ({ value }) => {
      onNext(Number(value.amount));
    },
  });

  const QUICK_AMOUNTS = [50000, 100000, 250000];

  return (
    <form
      id="topup-step1"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex-1 overflow-y-auto p-6 space-y-6"
    >
      <form.Field
        name="amount"
        children={(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <div className="space-y-3">
              <label htmlFor={field.name} className="text-sm font-semibold">
                Nominal Poin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sm text-muted-foreground">
                  Rp
                </div>
                <Input
                  id={field.name}
                  type="number"
                  min="50000"
                  className="pl-10 h-14 font-bold"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(Number(e.target.value) || "")
                  }
                  aria-invalid={isInvalid}
                  autoFocus
                />
              </div>
              {isInvalid && (
                <p className="text-xs text-destructive">
                  {field.state.meta.errors?.[0]?.message}
                </p>
              )}
              <div className="grid grid-cols-3 gap-3">
                {QUICK_AMOUNTS.map((val) => (
                  <Button
                    key={val}
                    variant="outline"
                    type="button"
                    onClick={() => field.handleChange(val)}
                    className={
                      field.state.value === val
                        ? "border-primary bg-primary/5"
                        : ""
                    }
                  >
                    {val.toLocaleString("id-ID")}
                  </Button>
                ))}
              </div>
            </div>
          );
        }}
      />

      <div className="p-6 bg-background border-t absolute bottom-0 left-0 right-0">
        <Button className="w-full" type="submit">
          Pilih Pembayaran
        </Button>
      </div>
    </form>
  );
}

// ─── Step 2: Payment Method Form ───────────────────────────────────────────

function Step2Form({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (channelCode: string, vendor: string) => void;
}) {
  const form = useForm({
    defaultValues: {
      paymentMode: "gateway" as "gateway" | "manual",
      channelCode: "",
    },
    validators: {
      onSubmit: step2Schema,
    },
    onSubmit: async ({ value }) => {
      const allChannels = [
        ...GATEWAY_CATEGORIES.flatMap((c) => c.channel),
        ...MANUAL_CATEGORIES.flatMap((c) => c.channel),
      ];
      const found = allChannels.find(
        (c) => c.channel_code === value.channelCode
      );
      if (found) onNext(found.channel_code, found.vendor);
    },
  });

  return (
    <form
      id="topup-step2"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex-1 overflow-y-auto p-6 space-y-6"
    >
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3"
        type="button"
        onClick={onBack}
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
      </Button>

      <form.Field
        name="paymentMode"
        children={(modeField) => (
          <form.Field
            name="channelCode"
            children={(channelField) => {
              const isInvalid =
                channelField.state.meta.isTouched &&
                !channelField.state.meta.isValid;

              return (
                <div className="space-y-4">
                  <Tabs
                    value={modeField.state.value}
                    onValueChange={(v) => {
                      modeField.handleChange(v as "gateway" | "manual");
                      channelField.handleChange("");
                    }}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="gateway">Gateway</TabsTrigger>
                      <TabsTrigger value="manual">Manual</TabsTrigger>
                    </TabsList>

                    <TabsContent value="gateway" className="mt-4">
                      <RadioGroup
                        value={channelField.state.value}
                        onValueChange={channelField.handleChange}
                        className="space-y-3"
                      >
                        {GATEWAY_CATEGORIES[0].channel.map((c) => (
                          <label
                            key={c.channel_code}
                            htmlFor={c.channel_code}
                            className="flex justify-between border-2 p-3 rounded-lg cursor-pointer hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-bold">
                                {c.display_name}
                              </span>
                            </div>
                            <RadioGroupItem
                              value={c.channel_code}
                              id={c.channel_code}
                            />
                          </label>
                        ))}
                      </RadioGroup>
                    </TabsContent>

                    <TabsContent value="manual" className="mt-4">
                      <RadioGroup
                        value={channelField.state.value}
                        onValueChange={channelField.handleChange}
                        className="space-y-3"
                      >
                        {MANUAL_CATEGORIES[0].channel.map((c) => (
                          <label
                            key={c.channel_code}
                            htmlFor={c.channel_code}
                            className="flex justify-between border-2 p-3 rounded-lg cursor-pointer hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-bold">
                                {c.display_name}
                              </span>
                            </div>
                            <RadioGroupItem
                              value={c.channel_code}
                              id={c.channel_code}
                            />
                          </label>
                        ))}
                      </RadioGroup>
                    </TabsContent>
                  </Tabs>

                  {isInvalid && (
                    <p className="text-xs text-destructive">
                      {channelField.state.meta.errors?.[0]?.message}
                    </p>
                  )}
                </div>
              );
            }}
          />
        )}
      />

      <div className="p-6 bg-background border-t absolute bottom-0 left-0 right-0">
        <Button className="w-full" type="submit">
          Lanjut Konfirmasi
        </Button>
      </div>
    </form>
  );
}

// ─── Step 3: Confirmation ──────────────────────────────────────────────────

interface Breakdown {
  base: number;
  tax: number;
  transactionFee: number;
  uniqueCode: number;
  total: number;
}

function Step3Confirmation({
  breakdown,
  isSubmitting,
  onBack,
  onConfirm,
}: {
  breakdown: Breakdown;
  isSubmitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3"
        type="button"
        onClick={onBack}
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
      </Button>

      <div className="bg-muted/30 border rounded-xl p-5 space-y-4">
        <div className="flex items-center font-semibold border-b pb-3">
          <Receipt className="w-4 h-4 mr-2" /> Detail Rincian
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nominal</span>
            <span>Rp {breakdown.base.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">PPN</span>
            <span>Rp {breakdown.tax.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Biaya Tambahan</span>
            <span>
              Rp{" "}
              {(breakdown.transactionFee + breakdown.uniqueCode).toLocaleString(
                "id-ID"
              )}
            </span>
          </div>
        </div>
        <div className="bg-primary/5 rounded-lg p-4 flex justify-between items-center border font-bold text-lg">
          <span>Total Bayar</span>
          <span className="text-primary">
            Rp {breakdown.total.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      <div className="p-6 bg-background border-t absolute bottom-0 left-0 right-0">
        <Button
          className="w-full"
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Memproses..." : "Bayar Sekarang"}
        </Button>
      </div>
    </div>
  );
}

// ─── TopupSheet (Orchestrator) ─────────────────────────────────────────────

export function TopupSheet({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  organizationId,
}: TopupSheetProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState<number>(0);
  const [channelCode, setChannelCode] = useState<string>("");
  const [vendor, setVendor] = useState<string>("");
  const [uniqueCode, setUniqueCode] = useState<number>(0);

  useEffect(() => {
    setUniqueCode(Math.floor(Math.random() * 900) + 100);
  }, [amount, channelCode]);

  const selectedChannelData = useMemo(() => {
    const allChannels = [
      ...GATEWAY_CATEGORIES.flatMap((c) => c.channel),
      ...MANUAL_CATEGORIES.flatMap((c) => c.channel),
    ];
    return allChannels.find((c) => c.channel_code === channelCode) || null;
  }, [channelCode]);

  const isManual = vendor === "MANUAL";

  const breakdown: Breakdown = useMemo(() => {
    const base = amount;
    const tax = Math.floor(base * 0.11);
    const transactionFee = isManual
      ? 0
      : calculateTransactionFee(base, selectedChannelData?.payment_fees);
    const code = isManual ? uniqueCode : 0;
    return { base, tax, transactionFee, uniqueCode: code, total: base + tax + transactionFee + code };
  }, [amount, isManual, selectedChannelData, uniqueCode]);

  const handleStep1Next = (val: number) => {
    setAmount(val);
    setStep(2);
  };

  const handleStep2Next = (code: string, v: string) => {
    setChannelCode(code);
    setVendor(v);
    setStep(3);
  };

  const handleConfirm = () => {
    if (!selectedChannelData) return;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 5);
    onSubmit({
      organizationId,
      amount: breakdown.total,
      pointsAdded: breakdown.base,
      paymentProvider: vendor.toUpperCase(),
      paymentChannel: channelCode,
      customDueDate: dueDate,
    });
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setStep(1);
      setAmount(0);
      setChannelCode("");
      setVendor("");
    }
    onOpenChange(val);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        className="sm:max-w-md md:max-w-lg p-0 flex flex-col h-full relative"
        side="right"
      >
        <SheetHeader className="p-6 pb-4 border-b shrink-0">
          <SheetTitle>Top Up Saldo</SheetTitle>
        </SheetHeader>

        {step === 1 && <Step1Form onNext={handleStep1Next} />}
        {step === 2 && (
          <Step2Form onBack={() => setStep(1)} onNext={handleStep2Next} />
        )}
        {step === 3 && (
          <Step3Confirmation
            breakdown={breakdown}
            isSubmitting={isSubmitting}
            onBack={() => setStep(2)}
            onConfirm={handleConfirm}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
