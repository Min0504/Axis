import type { MetadataRoute } from "next";
import { COMPARISONS } from "@/lib/compare-pages/comparisons";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://axis.so";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const comparisons: MetadataRoute.Sitemap = COMPARISONS.map((c) => ({
    url: `${siteUrl}/compare/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/compare`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...comparisons,
  ];
}
