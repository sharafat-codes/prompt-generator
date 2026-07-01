// Temporary mock data so the library renders before the DB is wired.
// Shapes intentionally mirror the Prisma model (Prompt + current version).
import { extractVariables } from "@/lib/variables";

export type MockPrompt = {
  slug: string;
  title: string;
  template: string;
  tag: string;
  runs: number;
  starred: boolean;
};

export const MOCK_PROMPTS: MockPrompt[] = [
  {
    slug: "product-launch-email",
    title: "Product launch email",
    template:
      "Write a {tone} launch email for {product}, targeting {audience}. Lead with the single biggest time-saver and end with one clear call-to-action.",
    tag: "Email",
    runs: 12,
    starred: true,
  },
  {
    slug: "meta-ad-hook-cta",
    title: "Meta ad — hook + CTA",
    template:
      "Write 3 scroll-stopping hooks for {product} aimed at {audience}. Keep each under 12 words.",
    tag: "Ads",
    runs: 8,
    starred: false,
  },
  {
    slug: "seo-blog-outline",
    title: "SEO blog outline",
    template:
      "Create an H2/H3 outline for a post on {topic} targeting the keyword {keyword}. Include a suggested title.",
    tag: "Blog",
    runs: 5,
    starred: false,
  },
  {
    slug: "instagram-caption-pack",
    title: "Instagram caption pack",
    template:
      "Write 5 captions for {product} in a {tone} voice, each with 3 relevant hashtags.",
    tag: "Social",
    runs: 21,
    starred: true,
  },
  {
    slug: "cold-outreach-first-line",
    title: "Cold outreach — first line",
    template:
      "Write a personal opening line for {prospect} at {company} that references something specific about them.",
    tag: "Email",
    runs: 3,
    starred: false,
  },
  {
    slug: "product-description",
    title: "Product description",
    template:
      "Write a benefit-led description for {product}. Tone: {tone}. Length: {length}.",
    tag: "Ecom",
    runs: 14,
    starred: false,
  },
];

export const varCount = (template: string) => extractVariables(template).length;

export const LIBRARY_FILTERS = ["All", "Email", "Ads", "Social", "Blog", "SEO"];
