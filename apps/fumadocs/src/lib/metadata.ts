import type { Metadata } from "next/types";
import type { Page } from "./source";

export function createMetadata(override: Metadata): Metadata {
  return {
    ...override,
    openGraph: {
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      url: "https://docs.tanisya.com",
      images: "/banner.png",
      siteName: "Tanisya.com",
      ...override.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      creator: "@nazhoir",
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      images: "/banner.png",
      ...override.twitter,
    },
  };
}

export function getPageImage(page: Page) {
  const segments = [...page.slugs, "image.webp"];

  return {
    segments,
    url: `/og/${segments.join("/")}`,
  };
}
