import {
	BookOpen,
	FileText,
	Newspaper,
	Phone,
	RefreshCw,
	Rocket,
	Star,
	Users,
} from "lucide-react";

export const RESOURCES_CONTENTS = [
	{
		category: "Konten",
		items: [
			{
				to: "/blog",
				label: "Blog & Tutorial",
				icon: BookOpen,
				description: "Tips hosting, keamanan, dan teknologi web.",
			},
			{
				to: "/press",
				label: "Press & Media",
				icon: Newspaper,
				description: "Siaran pers dan liputan media.",
			},
			{
				to: "/changelog",
				label: "Changelog",
				icon: RefreshCw,
				description: "Update produk dan fitur terbaru kami.",
			},
		],
	},
	{
		category: "Academy",
		items: [
			{
				to: "/docs",
				label: "Dokumentasi",
				icon: FileText,
				badge: null,
				description: "Panduan teknis dan referensi API lengkap.",
			},
			{
				to: "/community",
				label: "Komunitas",
				icon: Users,
				description: "Forum diskusi dan knowledge base.",
			},
		],
	},
	{
		category: "Perusahaan",
		items: [
			{
				to: "/about",
				label: "Tentang Kami",
				icon: Star,
				description: "Visi, misi, dan perjalanan Tanisya.",
			},
			{
				to: "/life-at-tanisya",
				label: "Karir",
				icon: Rocket,
				description: "Bergabung dengan tim kami.",
			},
			{
				to: "/affiliate",
				label: "Program Partner & Organisasi non-profit",
				icon: Users,
				description: "Dapatkan komisi dari setiap referral.",
			},
			{
				to: "/contact",
				label: "Hubungi Kami",
				icon: Phone,
				description: "Sales & support siap membantu 24/7.",
			},
		],
	},
];
