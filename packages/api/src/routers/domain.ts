import { env } from "@tanisya/env/server";
import z from "zod";

import { publicProcedure } from "../index";

/* ============================= */
/* 🔐 BASIC AUTH HEADER */
/* ============================= */
function getBasicAuthHeader() {
  const credentials = Buffer.from(
    `${env.RDASH_RESELLER_ID}:${env.RDASH_API_KEY}`,
  ).toString("base64");

  return `Basic ${credentials}`;
}

/* ============================= */
/* 🌐 RDASH FETCH HELPER */
/* ============================= */
async function checkDomainAvailability(domain: string) {
  const res = await fetch(
    `${env.RDASH_API_URL}/domains/availability?domain=${domain}`,
    {
      headers: {
        Authorization: getBasicAuthHeader(),
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("RDASH ERROR:", {
      status: res.status,
      statusText: res.statusText,
      body: errorText,
    });
    return {
      name: domain,
      available: 0 as const,
      message: `HTTP ${res.status}`,
    };
  }

  const data = await res.json();
  return (
    data.data?.[0] ?? {
      name: domain,
      available: 0 as const,
      message: "No data",
    }
  );
}

/* ============================= */
/* 🔧 HELPERS */
/* ============================= */

/**
 * Normalisasi ekstensi: hapus titik di awal jika ada, lalu tambahkan kembali.
 * ".id" → "id", "co.id" → "co.id"
 */
function normalizeExtension(ext: string): string {
  return ext.trim().replace(/^\.+/, "");
}

/**
 * Parse input ekstensi dari string CSV.
 * ".id,.co.id, net" → ["id", "co.id", "net"]
 */
function parseExtensions(raw: string): string[] {
  return raw
    .split(",")
    .map(normalizeExtension)
    .filter((e) => e.length > 0);
}

/**
 * Parse input domain batch dari string CSV.
 * "ahmad.sch.id, muhammad.co.id" → ["ahmad.sch.id", "muhammad.co.id"]
 */
function parseDomainList(raw: string): string[] {
  return raw
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter((d) => d.length > 0 && d.includes("."));
}

/**
 * Ekstrak base name dari domain input.
 * "ahmad.id" → { baseName: "ahmad", originalExt: "id" }
 * "ahmad"    → { baseName: "ahmad", originalExt: null }
 */
function extractBaseName(input: string): {
  baseName: string;
  originalExt: string | null;
} {
  const clean = input.trim().toLowerCase();
  if (clean.includes(".")) {
    const parts = clean.split(".");
    return {
      baseName: parts[0]!,
      originalExt: parts.slice(1).join("."),
    };
  }
  return { baseName: clean, originalExt: null };
}

/* ============================= */
/* 📦 EXTENSION PRESETS */
/* ============================= */
const EXTENSIONS_PRIMARY = [
  "com", "id", "co.id", "net", "org", "io", "dev", "app",
];

const EXTENSIONS_SECONDARY = [
  "co", "info", "biz", "tech", "shop", "store",
  "design", "art", "media", "studio", "cloud",
  "digital", "blog", "page", "market", "agency",
];

/* ============================= */
/* 🚀 DOMAIN ROUTER */
/* ============================= */
export const domainRouter = {
  /**
   * MODE 1 — Satu nama + banyak ekstensi kustom.
   *
   * Input:
   *   { domain: "ahmad", extensions: ".id,.sch.id,.co.id" }
   *
   * Jika `extensions` kosong/tidak dikirim, fallback ke EXTENSIONS_PRIMARY.
   */
  checkByExtensions: publicProcedure
    .input(
      z.object({
        domain: z.string().min(1),
        extensions: z.string().optional(), // CSV: ".id,.sch.id" atau "id,sch.id"
      }),
    )
    .handler(async ({ input }) => {
      const { baseName, originalExt } = extractBaseName(input.domain);

      let exts: string[];

      if (input.extensions && input.extensions.trim().length > 0) {
        // Gunakan ekstensi yang dikirim user
        exts = parseExtensions(input.extensions);
      } else {
        // Fallback ke preset, selalu dahulukan ekstensi dari nama domain (jika ada)
        exts = originalExt
          ? [originalExt, ...EXTENSIONS_PRIMARY.filter((e) => e !== originalExt)]
          : EXTENSIONS_PRIMARY;
      }

      const domains = exts.map((ext) => `${baseName}.${ext}`);

      const results = await Promise.all(
        domains.map((d) => checkDomainAvailability(d)),
      );

      return {
        mode: "by-extensions" as const,
        baseName,
        extensions: exts,
        total: results.length,
        results,
      };
    }),

  /**
   * MODE 2 — Batch domain lengkap (nama + ekstensi sudah lengkap).
   *
   * Input:
   *   { domains: "ahmad.sch.id,muhammad.co.id,budi.net" }
   */
  checkBatch: publicProcedure
    .input(
      z.object({
        domains: z.string().min(1), // CSV: "ahmad.sch.id,muhammad.co.id"
      }),
    )
    .handler(async ({ input }) => {
      const domainList = parseDomainList(input.domains);

      if (domainList.length === 0) {
        return {
          mode: "batch" as const,
          total: 0,
          results: [],
          error: "Tidak ada domain valid yang ditemukan. Pastikan format: nama.ekstensi",
        };
      }

      const results = await Promise.all(
        domainList.map((d) => checkDomainAvailability(d)),
      );

      return {
        mode: "batch" as const,
        total: results.length,
        results,
      };
    }),

  /**
   * PRESET — Cek ekstensi sekunder (untuk tombol "Domain Lain").
   * Tetap tersedia sebagai opsi preset.
   *
   * Input:
   *   { domain: "ahmad" }
   */
  checkSecondaryPreset: publicProcedure
    .input(
      z.object({
        domain: z.string().min(1),
      }),
    )
    .handler(async ({ input }) => {
      const { baseName } = extractBaseName(input.domain);
      const domains = EXTENSIONS_SECONDARY.map((ext) => `${baseName}.${ext}`);

      const results = await Promise.all(
        domains.map((d) => checkDomainAvailability(d)),
      );

      return {
        mode: "secondary-preset" as const,
        baseName,
        extensions: EXTENSIONS_SECONDARY,
        total: results.length,
        results,
      };
    }),
};