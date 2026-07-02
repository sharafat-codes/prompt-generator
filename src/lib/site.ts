// Canonical site URL for metadata, OG, robots, and sitemap. Override in Vercel
// with NEXT_PUBLIC_SITE_URL when a custom domain is added.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://prompt-generator-olive-sigma.vercel.app";

export const SITE_NAME = "PromptPilot";
export const SITE_TAGLINE = "Prompts that compound";
export const SITE_DESCRIPTION =
  "PromptPilot turns your best prompts into reusable recipes — for polished content or ready-to-paste AI prompts. Do the work once; reuse it forever.";
