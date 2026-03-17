"use client";

import { cn } from "@tanisya/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Color Extraction Utilities
// ─────────────────────────────────────────────────────────────────────────────

interface RGB {
	r: number;
	g: number;
	b: number;
}

interface Palette {
	bg: string;
	ambientGlow: string;
	bottomFade: string;
	bottomBg: string;
	accentRgb: string;
	primaryRgb: RGB;
}

function extractColors(imgEl: HTMLImageElement): RGB[] {
	try {
		const canvas = document.createElement("canvas");
		const S = 80;
		canvas.width = S;
		canvas.height = S;
		const ctx = canvas.getContext("2d");
		if (!ctx) return [{ r: 80, g: 80, b: 120 }];
		ctx.drawImage(imgEl, 0, 0, S, S);
		const { data } = ctx.getImageData(0, 0, S, S);
		const regions = [
			{ x: 0, y: 0, w: S / 2, h: S / 2 },
			{ x: S / 2, y: 0, w: S / 2, h: S / 2 },
			{ x: 0, y: S / 2, w: S / 2, h: S / 2 },
			{ x: S / 2, y: S / 2, w: S / 2, h: S / 2 },
			{ x: S / 4, y: 0, w: S / 2, h: S / 3 },
			{ x: S / 4, y: S / 3, w: S / 2, h: S / 3 },
		];
		return regions.map(({ x, y, w, h }) => {
			let r = 0,
				g = 0,
				b = 0,
				n = 0;
			for (let py = y; py < y + h; py++)
				for (let px = x; px < x + w; px++) {
					const i = (py * S + px) * 4;
					if (data[i + 3] > 100) {
						r += data[i];
						g += data[i + 1];
						b += data[i + 2];
						n++;
					}
				}
			return n
				? { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) }
				: { r: 100, g: 100, b: 100 };
		});
	} catch {
		return [{ r: 80, g: 80, b: 120 }];
	}
}

function hsl(r: number, g: number, b: number) {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	let h = 0,
		s = 0;
	const l = (max + min) / 2;
	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
				break;
			case g:
				h = ((b - r) / d + 2) / 6;
				break;
			case b:
				h = ((r - g) / d + 4) / 6;
				break;
		}
	}
	return { h: h * 360, s: s * 100, l: l * 100 };
}

const dk = (c: RGB, f: number): RGB => ({
	r: Math.round(c.r * f),
	g: Math.round(c.g * f),
	b: Math.round(c.b * f),
});
const rgb = (c: RGB) => `rgb(${c.r},${c.g},${c.b})`;
const rgba = (c: RGB, a: number) => `rgba(${c.r},${c.g},${c.b},${a})`;

function buildPalette(colors: RGB[]): Palette {
	const scored = colors
		.map((c) => {
			const { s, l } = hsl(c.r, c.g, c.b);
			return { ...c, score: s * (1 - Math.abs(l - 50) / 50) };
		})
		.sort((a, b) => b.score - a.score);

	const primary = scored[0] ?? { r: 80, g: 100, b: 200 };
	const secondary = scored[1] ?? primary;
	const tertiary = scored[2] ?? secondary;

	const p = dk(primary, 0.42);
	const s = dk(secondary, 0.36);
	const t = dk(tertiary, 0.3);
	const mid: RGB = {
		r: (p.r + s.r) >> 1,
		g: (p.g + s.g) >> 1,
		b: (p.b + s.b) >> 1,
	};

	return {
		bg: `linear-gradient(155deg, ${rgb(p)} 0%, ${rgb(s)} 55%, ${rgb(t)} 100%)`,
		ambientGlow: `radial-gradient(ellipse 75% 60% at 50% 30%, ${rgba(primary, 0.28)} 0%, transparent 70%)`,
		bottomFade: `linear-gradient(to bottom, ${rgba(p, 0)} 0%, ${rgba(mid, 0.75)} 45%, ${rgba(s, 0.98)} 75%)`,
		bottomBg: rgb(s),
		accentRgb: `${primary.r},${primary.g},${primary.b}`,
		primaryRgb: primary,
	};
}

const FALLBACK: Palette = {
	bg: "linear-gradient(155deg, #1c1c2e 0%, #16213e 55%, #0f3460 100%)",
	ambientGlow: "none",
	bottomFade:
		"linear-gradient(to bottom, transparent 0%, rgba(22,33,62,0.75) 45%, rgba(22,33,62,0.98) 75%)",
	bottomBg: "rgb(22,33,62)",
	accentRgb: "100,130,220",
	primaryRgb: { r: 100, g: 130, b: 220 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

interface CardCtx {
	palette: Palette;
	setPalette: (p: Palette) => void;
	variant: "default" | "glow" | "glow-on-hover";
	rounded: "sm" | "default" | "md";
	size: "sm" | "default" | "lg";
}

const CardCtx = React.createContext<CardCtx>({
	palette: FALLBACK,
	setPalette: () => {},
	variant: "default",
	rounded: "default",
	size: "default",
});

const useCard = () => React.useContext(CardCtx);

// ─────────────────────────────────────────────────────────────────────────────
// Glow helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds the multi-layer box-shadow that creates the glowing stroke effect:
 *   Layer 1 — tight colored ring (mimics a stroke / border)
 *   Layer 2 — soft mid-range bloom
 *   Layer 3 — wide, diffuse outer halo
 */
function buildGlowShadow(accentRgb: string, intensity = 1): string {
	return [
		`0 0 0 1.5px rgba(${accentRgb},${0.7 * intensity})`, // stroke ring
		`0 0 18px 3px  rgba(${accentRgb},${0.5 * intensity})`, // near bloom
		`0 0 55px 12px rgba(${accentRgb},${0.25 * intensity})`, // wide halo
	].join(", ");
}

// ─────────────────────────────────────────────────────────────────────────────
// imageCardVariants (structural only — glow applied via inline style)
// ─────────────────────────────────────────────────────────────────────────────

const imageCardVariants = cva(
	"group/image-card relative flex flex-col overflow-hidden text-white shadow-2xl transition-[box-shadow] duration-500",
	{
		variants: {
			variant: {
				/**
				 * No glow — clean card with deep shadow
				 */
				default: "",
				/**
				 * Always-on glowing stroke + outer bloom
				 * The actual colored shadow is set via inline style (color-aware)
				 */
				glow: "",
				/**
				 * Glowing stroke appears on hover with smooth transition
				 */
				"glow-on-hover": "",
			},
			rounded: {
				sm: "rounded-xl",
				default: "rounded-2xl",
				md: "rounded-3xl",
			},
			size: {
				sm: "text-xs",
				default: "text-sm",
				lg: "text-base",
			},
		},
		defaultVariants: {
			variant: "default",
			rounded: "default",
			size: "default",
		},
	},
);

// ─────────────────────────────────────────────────────────────────────────────
// ImageCard (Root)
// ─────────────────────────────────────────────────────────────────────────────

export interface ImageCardProps
	extends React.ComponentPropsWithoutRef<"div">,
		VariantProps<typeof imageCardVariants> {}

export function ImageCard({
	className,
	variant = "default",
	rounded = "default",
	size = "default",
	style,
	children,
	...props
}: ImageCardProps) {
	const [palette, setPalette] = React.useState<Palette>(FALLBACK);
	const [hovered, setHovered] = React.useState(false);

	const resolvedVariant = variant ?? "default";
	const resolvedRounded = rounded ?? "default";
	const resolvedSize = size ?? "default";

	const isGlow = resolvedVariant === "glow";
	const isGlowOnHover = resolvedVariant === "glow-on-hover";

	// Compute box-shadow based on variant + hover state
	const glowShadow = buildGlowShadow(palette.accentRgb);
	const defaultShadow = "0 8px 40px rgba(0,0,0,0.45)";

	let boxShadow = defaultShadow;
	if (isGlow) boxShadow = glowShadow;
	if (isGlowOnHover && hovered) boxShadow = glowShadow;
	if (isGlowOnHover && !hovered) boxShadow = defaultShadow;

	return (
		<CardCtx.Provider
			value={{
				palette,
				setPalette,
				variant: resolvedVariant,
				rounded: resolvedRounded,
				size: resolvedSize,
			}}
		>
			<div
				data-slot="image-card"
				data-variant={resolvedVariant}
				className={cn(
					imageCardVariants({
						variant: resolvedVariant,
						rounded: resolvedRounded,
						size: resolvedSize,
					}),
					className,
				)}
				style={{ background: palette.bg, boxShadow, ...style }}
				onMouseEnter={() => isGlowOnHover && setHovered(true)}
				onMouseLeave={() => isGlowOnHover && setHovered(false)}
				{...props}
			>
				{/* Inset stroke ring — visible for glow, fades in/out for glow-on-hover */}
				{(isGlow || isGlowOnHover) && (
					<div
						aria-hidden
						className={cn(
							"pointer-events-none absolute inset-0 z-20 rounded-[inherit] transition-opacity duration-500",
							isGlow && "opacity-100",
							isGlowOnHover && (hovered ? "opacity-100" : "opacity-0"),
						)}
						style={{
							boxShadow: `inset 0 0 0 1px rgba(${palette.accentRgb},0.55), inset 0 0 24px 2px rgba(${palette.accentRgb},0.12)`,
						}}
					/>
				)}

				{children}
			</div>
		</CardCtx.Provider>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// ImageCardImage
// ─────────────────────────────────────────────────────────────────────────────

export interface ImageCardImageProps
	extends React.ComponentPropsWithoutRef<"div"> {
	src: string;
	alt?: string;
	height?: number | string;
	objectPosition?: string;
}

export function ImageCardImage({
	className,
	src,
	alt = "",
	height = 240,
	objectPosition = "center top",
	children,
	...props
}: ImageCardImageProps) {
	const { setPalette, palette } = useCard();
	const imgRef = React.useRef<HTMLImageElement>(null);

	const extract = React.useCallback(() => {
		const img = imgRef.current;
		if (!img) return;
		setPalette(buildPalette(extractColors(img)));
	}, [setPalette]);

	return (
		<div
			data-slot="image-card-image"
			className={cn("relative w-full shrink-0 overflow-hidden", className)}
			style={{ height }}
			{...props}
		>
			<img
				ref={imgRef}
				src={src}
				alt={alt}
				crossOrigin="anonymous"
				onLoad={extract}
				className="absolute inset-0 h-full w-full object-cover"
				style={{ objectPosition }}
			/>

			{/* Ambient center glow */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 z-10"
				style={{ background: palette.ambientGlow }}
			/>

			{/* Left / right edge fades */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10"
				style={{
					background: `linear-gradient(to right, ${palette.bottomBg}bb 0%, transparent 100%)`,
				}}
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10"
				style={{
					background: `linear-gradient(to left,  ${palette.bottomBg}bb 0%, transparent 100%)`,
				}}
			/>

			{/* Bottom gradient fade */}
			<div
				aria-hidden
				className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-36"
				style={{ background: palette.bottomFade }}
			/>

			{children && (
				<div className="absolute inset-0 z-20 flex flex-col">{children}</div>
			)}
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// ImageCardContent
// ─────────────────────────────────────────────────────────────────────────────

export function ImageCardContent({
	className,
	style,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	const { palette, size } = useCard();
	return (
		<div
			data-slot="image-card-content"
			className={cn(
				"relative z-10 flex flex-col gap-1",
				size === "sm" ? "px-3 py-2" : size === "lg" ? "px-6 py-5" : "px-5 py-4",
				className,
			)}
			style={{ background: palette.bottomBg, ...style }}
			{...props}
		/>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// ImageCardBadge
// ─────────────────────────────────────────────────────────────────────────────

const badgeVariants = cva(
	"inline-flex w-fit items-center font-semibold uppercase leading-none tracking-[0.15em]",
	{
		variants: {
			variant: {
				default: "text-white/70",
				accent: "rounded-full px-2 py-0.5 text-white",
				outline:
					"rounded-full border border-white/30 px-2 py-0.5 text-white/80",
			},
			size: { sm: "text-[9px]", default: "text-[10px]", lg: "text-xs" },
		},
		defaultVariants: { variant: "default", size: "default" },
	},
);

export interface ImageCardBadgeProps
	extends React.ComponentPropsWithoutRef<"span">,
		VariantProps<typeof badgeVariants> {}

export function ImageCardBadge({
	className,
	variant = "default",
	size,
	style,
	...props
}: ImageCardBadgeProps) {
	const { palette, size: cs } = useCard();
	const sz = size ?? (cs as VariantProps<typeof badgeVariants>["size"]);
	const accentStyle =
		variant === "accent"
			? {
					background: `rgba(${palette.accentRgb},0.28)`,
					border: `1px solid rgba(${palette.accentRgb},0.38)`,
				}
			: {};
	return (
		<span
			data-slot="image-card-badge"
			className={cn(badgeVariants({ variant, size: sz }), className)}
			style={{ ...accentStyle, ...style }}
			{...props}
		/>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// ImageCardTitle
// ─────────────────────────────────────────────────────────────────────────────

export function ImageCardTitle({
	className,
	...props
}: React.ComponentPropsWithoutRef<"h3">) {
	const { size } = useCard();
	return (
		<h3
			data-slot="image-card-title"
			className={cn(
				"font-bold text-white leading-tight",
				size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-[22px]",
				className,
			)}
			style={{
				textShadow: "0 1px 8px rgba(0,0,0,0.4)",
				letterSpacing: "-0.3px",
			}}
			{...props}
		/>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// ImageCardDescription
// ─────────────────────────────────────────────────────────────────────────────

export function ImageCardDescription({
	className,
	...props
}: React.ComponentPropsWithoutRef<"p">) {
	return (
		<p
			data-slot="image-card-description"
			className={cn("text-white/60 leading-snug", className)}
			{...props}
		/>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// ImageCardFooter
// ─────────────────────────────────────────────────────────────────────────────

export function ImageCardFooter({
	className,
	style,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	const { palette, size } = useCard();
	return (
		<div
			data-slot="image-card-footer"
			className={cn(
				"relative z-10 flex items-center gap-3",
				size === "sm"
					? "px-3 pt-2 pb-3"
					: size === "lg"
						? "px-6 pt-3 pb-5"
						: "px-5 pt-3 pb-4",
				className,
			)}
			style={{
				background: palette.bottomBg,
				borderTop: `1px solid rgba(${palette.accentRgb},0.14)`,
				...style,
			}}
			{...props}
		/>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// ImageCardAppIcon
// ─────────────────────────────────────────────────────────────────────────────

const appIconVariants = cva(
	"flex shrink-0 items-center justify-center overflow-hidden shadow-lg",
	{
		variants: {
			size: {
				sm: "size-9 rounded-[8px] text-xl",
				default: "size-11 rounded-[10px] text-2xl",
				lg: "size-14 rounded-[12px] text-3xl",
			},
		},
		defaultVariants: { size: "default" },
	},
);

export interface ImageCardAppIconProps
	extends React.ComponentPropsWithoutRef<"div">,
		VariantProps<typeof appIconVariants> {
	src?: string;
	alt?: string;
}

export function ImageCardAppIcon({
	className,
	size,
	src,
	alt,
	style,
	children,
	...props
}: ImageCardAppIconProps) {
	const { palette, size: cs } = useCard();
	const sz = size ?? (cs as VariantProps<typeof appIconVariants>["size"]);
	return (
		<div
			data-slot="image-card-app-icon"
			className={cn(appIconVariants({ size: sz }), className)}
			style={{
				background: `rgba(${palette.accentRgb},0.22)`,
				border: `1px solid rgba(${palette.accentRgb},0.3)`,
				...style,
			}}
			{...props}
		>
			{src ? (
				<img src={src} alt={alt ?? ""} className="h-full w-full object-cover" />
			) : (
				children
			)}
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// ImageCardAppInfo / AppName / AppDesc
// ─────────────────────────────────────────────────────────────────────────────

export function ImageCardAppInfo({
	className,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	return (
		<div
			data-slot="image-card-app-info"
			className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)}
			{...props}
		/>
	);
}

export function ImageCardAppName({
	className,
	...props
}: React.ComponentPropsWithoutRef<"p">) {
	return (
		<p
			data-slot="image-card-app-name"
			className={cn(
				"truncate font-semibold text-white leading-tight",
				className,
			)}
			{...props}
		/>
	);
}

export function ImageCardAppDesc({
	className,
	...props
}: React.ComponentPropsWithoutRef<"p">) {
	return (
		<p
			data-slot="image-card-app-desc"
			className={cn(
				"truncate text-[11px] text-white/50 leading-tight",
				className,
			)}
			{...props}
		/>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// ImageCardAction
// ─────────────────────────────────────────────────────────────────────────────

const actionVariants = cva(
	"inline-flex shrink-0 cursor-pointer items-center justify-center font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:scale-95",
	{
		variants: {
			variant: {
				default: "text-white",
				ghost: "text-white/70 hover:text-white",
			},
			size: {
				sm: "rounded-full px-3 py-1 text-[11px]",
				default: "rounded-full px-4 py-1.5 text-[13px]",
				lg: "rounded-full px-5 py-2 text-sm",
			},
		},
		defaultVariants: { variant: "default", size: "default" },
	},
);

export interface ImageCardActionProps
	extends React.ComponentPropsWithoutRef<"button">,
		VariantProps<typeof actionVariants> {}

export function ImageCardAction({
	className,
	variant = "default",
	size,
	style,
	...props
}: ImageCardActionProps) {
	const { palette, size: cs } = useCard();
	const sz = size ?? (cs as VariantProps<typeof actionVariants>["size"]);
	return (
		<button
			data-slot="image-card-action"
			className={cn(actionVariants({ variant, size: sz }), className)}
			style={{
				background: `rgba(${palette.accentRgb},0.28)`,
				border: `1px solid rgba(${palette.accentRgb},0.38)`,
				backdropFilter: "blur(10px)",
				...style,
			}}
			{...props}
		/>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export type { Palette as ImageCardPalette };
export { actionVariants, appIconVariants, badgeVariants, imageCardVariants };
