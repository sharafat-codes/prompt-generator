import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { TOOL_PAGES } from "@/lib/tool-pages";
import { listPublicPrompts } from "@/server/data/prompts";

// Regenerate hourly so newly-shared public prompts get indexed.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/tools`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...TOOL_PAGES.map((tool) => ({
      url: `${SITE_URL}/tools/${tool.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  let shared: MetadataRoute.Sitemap = [];
  try {
    const prompts = await listPublicPrompts();
    shared = prompts.map((p) => ({
      url: `${SITE_URL}/s/${p.publicSlug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // DB unreachable at build → still emit the static sitemap.
  }

  return [...staticRoutes, ...shared];
}
