import type { Metadata } from "next/types";
import type { Page } from "./source";

const SITE_URL = "https://docs.tanisya.com";
const FALLBACK_IMAGE = "/banner.png";

export function createMetadata(override: Metadata): Metadata {
  return {
    ...override,
    openGraph: {
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      url: SITE_URL,
      images: FALLBACK_IMAGE,
      siteName: "Tanisya.com",
      ...override.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      creator: "@nazhoir",
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      images: FALLBACK_IMAGE,
      ...override.twitter,
    },
  };
}

export function getPageMetadata(page: Page): Metadata {
  const ogUrl = new URL("/og", SITE_URL);
  ogUrl.searchParams.set("title", page.data.title);
  if (page.data.description) {
    ogUrl.searchParams.set("description", page.data.description);
  }

  const ogImage = { url: ogUrl.toString(), width: 1200, height: 630 };

  return createMetadata({
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: [ogImage],
    },
    twitter: {
      images: [ogUrl.toString()],
    },
  });
}