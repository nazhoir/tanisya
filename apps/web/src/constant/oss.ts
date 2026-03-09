import { GraduationCap, Building2, Wallet, Heart } from "lucide-react";
import { ca } from "zod/v4/locales";

export const OSS_PROJECTS = [
  {
    category: "Open Source",
    to: "/oss",
    icon: Building2,
    items: [
      {
        to: "/oss/postren",
        label: "Postren",
        icon: GraduationCap,
        description: "Manajemen Pondok Pesantren — santri, asrama, keuangan.",
        badge: null,
        category: "Pendidikan",
      },
      {
        to: "/oss/masjid-manager",
        label: "Masjid Manager",
        icon: Building2,
        description: "Kelola kegiatan, kas, dan jamaah masjid.",
        badge: null,
        category: "Sosial",
      },
      {
        to: "/oss/kas-rt",
        label: "Kas RT/RW",
        icon: Wallet,
        description: "Pengelolaan iuran & laporan keuangan lingkungan.",
        badge: null,
        category: "Komunitas",
      },
      {
        to: "/oss/klinik",
        label: "Klinik Manager",
        icon: Heart,
        description: "Manajemen pasien, antrian, dan rekam medis klinik.",
        badge: "Segera",
        category: "Kesehatan",
      },
    ],
  },
];
