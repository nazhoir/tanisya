// ─── Types ────────────────────────────────────────────────────────────────────
export interface DomainPrice {
	tld: string;
	register: number;
	renew: number;
	transfer: number;
	popular?: boolean;
	sale?: boolean;
}

export interface DomainSuggestion {
	name: string;
	available: 0 | 1;
	message: string;
	is_premium_name?: boolean;
	premium_registration_price?: number | null;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
export const DOMAIN_PRICES: Record<string, DomainPrice[]> = {
	popular: [
		{ tld: ".com", register: 149000, renew: 189000, transfer: 149000, popular: true },
		{ tld: ".net", register: 169000, renew: 199000, transfer: 169000, popular: true },
		{ tld: ".org", register: 159000, renew: 189000, transfer: 159000, popular: true },
		{ tld: ".id", register: 350000, renew: 399000, transfer: 350000, popular: true },
		{ tld: ".co.id", register: 250000, renew: 299000, transfer: 250000, popular: true },
		{ tld: ".io", register: 699000, renew: 799000, transfer: 699000 },
		{ tld: ".co", register: 399000, renew: 449000, transfer: 399000 },
		{ tld: ".info", register: 99000, renew: 149000, transfer: 99000, sale: true },
	],
	business: [
		{ tld: ".biz", register: 189000, renew: 219000, transfer: 189000 },
		{ tld: ".company", register: 249000, renew: 279000, transfer: 249000 },
		{ tld: ".business", register: 299000, renew: 329000, transfer: 299000 },
		{ tld: ".shop", register: 199000, renew: 249000, transfer: 199000, sale: true },
		{ tld: ".store", register: 299000, renew: 349000, transfer: 299000 },
		{ tld: ".market", register: 349000, renew: 399000, transfer: 349000 },
		{ tld: ".agency", register: 379000, renew: 419000, transfer: 379000 },
		{ tld: ".consulting", register: 449000, renew: 499000, transfer: 449000 },
	],
	technology: [
		{ tld: ".tech", register: 499000, renew: 549000, transfer: 499000 },
		{ tld: ".app", register: 299000, renew: 349000, transfer: 299000 },
		{ tld: ".dev", register: 249000, renew: 299000, transfer: 249000 },
		{ tld: ".cloud", register: 349000, renew: 399000, transfer: 349000 },
		{ tld: ".digital", register: 299000, renew: 349000, transfer: 299000 },
		{ tld: ".software", register: 449000, renew: 499000, transfer: 449000 },
		{ tld: ".network", register: 379000, renew: 419000, transfer: 379000 },
		{ tld: ".systems", register: 399000, renew: 449000, transfer: 399000 },
	],
	creative: [
		{ tld: ".design", register: 449000, renew: 499000, transfer: 449000 },
		{ tld: ".art", register: 299000, renew: 349000, transfer: 299000 },
		{ tld: ".media", register: 349000, renew: 399000, transfer: 349000 },
		{ tld: ".studio", register: 379000, renew: 419000, transfer: 379000 },
		{ tld: ".photo", register: 399000, renew: 449000, transfer: 399000 },
		{ tld: ".video", register: 449000, renew: 499000, transfer: 449000 },
		{ tld: ".blog", register: 249000, renew: 299000, transfer: 249000, sale: true },
		{ tld: ".page", register: 199000, renew: 249000, transfer: 199000 },
	],
};

export const PROMO_TLDS = [".com", ".id", ".co.id", ".net"];
export const POPULAR_TLDS = [".com", ".net", ".org", ".id", ".co.id", ".io", ".co", ".info"];
export const ALL_DOMAINS = Object.values(DOMAIN_PRICES).flat();

export const PROMOS = [
	{ tld: ".com", originalPrice: 149000, promoPrice: 99000, label: "Flash Sale", color: "bg-rose-500", until: "31 Maret 2025", icon: "Zap" },
	{ tld: ".id", originalPrice: 350000, promoPrice: 199000, label: "Promo Nasional", color: "bg-blue-600", until: "30 April 2025", icon: "Star" },
	{ tld: ".co.id", originalPrice: 250000, promoPrice: 149000, label: "Harga Spesial", color: "bg-violet-600", until: "30 April 2025", icon: "Tag" },
	{ tld: ".net", originalPrice: 169000, promoPrice: 89000, label: "Limited", color: "bg-amber-500", until: "15 April 2025", icon: "Clock" },
];

// Popular TLDs shown as quick-pick on /domain search
export const QUICK_TLDS = [".com", ".id", ".co.id", ".net", ".org", ".io", ".dev", ".app", ".tech", ".shop"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const getTld = (domainName: string) => "." + domainName.split(".").slice(1).join(".");
export const getBaseName = (domainName: string) => domainName.split(".")[0];
export const getPriceByTld = (tld: string) => ALL_DOMAINS.find((d) => d.tld === tld)?.register;
export const discountPercent = (original: number, promo: number) =>
	Math.round(((original - promo) / original) * 100);