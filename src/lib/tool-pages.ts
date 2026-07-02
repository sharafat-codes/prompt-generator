import { CONTENT_TYPES, type ContentType } from "@/lib/content-types";

// Public, SEO-focused landing pages — one per generator. Each targets a
// "<thing> generator" search intent, demos the tool, and CTAs to sign up.
// contentTypeKey links back to the guided Create flow.

export type ToolPage = {
  slug: string;
  contentTypeKey: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  useCases: string[];
};

export const TOOL_PAGES: ToolPage[] = [
  {
    slug: "marketing-email-generator",
    contentTypeKey: "marketing-email",
    h1: "AI Marketing Email Generator",
    metaTitle: "Free AI Marketing Email Generator",
    metaDescription:
      "Generate high-converting marketing emails in seconds. Answer a couple of questions and get a polished, ready-to-send email — then save it as a reusable recipe.",
    intro:
      "Write launch and promo emails that convert — without staring at a blank page. Answer a couple of quick questions and get a polished, ready-to-send email in seconds.",
    useCases: [
      "Product launch announcements",
      "Promotions and sale emails",
      "Welcome and onboarding sequences",
      "Win-back and re-engagement campaigns",
      "Newsletter intros",
    ],
  },
  {
    slug: "ad-copy-generator",
    contentTypeKey: "ad-copy",
    h1: "AI Ad Copy Generator",
    metaTitle: "Free AI Ad Copy Generator",
    metaDescription:
      "Generate scroll-stopping ad hooks and copy in seconds. Perfect for Meta, Google, and TikTok ads — save your best angles as reusable recipes.",
    intro:
      "Get scroll-stopping ad hooks in seconds. Describe your product and audience, and generate punchy angles you can test — then reuse the ones that win.",
    useCases: [
      "Facebook and Instagram ad hooks",
      "Google search ad headlines",
      "TikTok and Reels hooks",
      "A/B test variations",
      "Landing-page headlines",
    ],
  },
  {
    slug: "blog-outline-generator",
    contentTypeKey: "blog-post",
    h1: "AI Blog Outline Generator",
    metaTitle: "Free AI Blog Outline Generator",
    metaDescription:
      "Turn any topic and keyword into a clear, SEO-friendly blog outline with a title and H2 sections — in seconds. Save it as a reusable recipe.",
    intro:
      "Beat writer's block. Give a topic and target keyword, and get a structured, SEO-friendly outline with a compelling title and H2 sections — ready to write from.",
    useCases: [
      "SEO article outlines",
      "How-to and listicle structures",
      "Content-calendar planning",
      "Pillar-page frameworks",
      "Newsletter long-forms",
    ],
  },
  {
    slug: "product-description-generator",
    contentTypeKey: "product-description",
    h1: "AI Product Description Generator",
    metaTitle: "Free AI Product Description Generator",
    metaDescription:
      "Write benefit-led product descriptions that sell — in seconds. Great for Shopify, Amazon, and Etsy listings. Save your format as a reusable recipe.",
    intro:
      "Turn product details into benefit-led descriptions that sell. Pick a tone and length, and generate copy for any store or marketplace in seconds.",
    useCases: [
      "Shopify and WooCommerce listings",
      "Amazon and Etsy product copy",
      "Catalog and feed descriptions",
      "Bundle and variant copy",
      "Feature-to-benefit rewrites",
    ],
  },
  {
    slug: "social-caption-generator",
    contentTypeKey: "social-caption",
    h1: "AI Social Media Caption Generator",
    metaTitle: "Free AI Social Media Caption Generator",
    metaDescription:
      "Generate scroll-stopping social captions with hashtags in seconds — for Instagram, LinkedIn, TikTok, and more. Save your voice as a reusable recipe.",
    intro:
      "Never run out of captions. Describe your post and pick a voice, and get a batch of ready-to-publish captions with relevant hashtags in seconds.",
    useCases: [
      "Instagram and Threads captions",
      "LinkedIn posts",
      "TikTok and Reels captions",
      "Hashtag sets",
      "Content-batch planning",
    ],
  },
  {
    slug: "image-prompt-generator",
    contentTypeKey: "image-prompt",
    h1: "AI Image Prompt Generator",
    metaTitle: "Free Midjourney & AI Image Prompt Generator",
    metaDescription:
      "Generate rich, detailed image prompts for Midjourney, DALL·E, and Stable Diffusion. Pick a subject, style, and detail level — copy and paste in seconds.",
    intro:
      "Get better images by starting with a better prompt. Describe a subject, choose a style and detail level, and generate a rich, copy-paste prompt for Midjourney, DALL·E, or Stable Diffusion.",
    useCases: [
      "Midjourney prompts",
      "DALL·E and ChatGPT image prompts",
      "Stable Diffusion prompts",
      "Consistent brand-style visuals",
      "Concept art and mood boards",
    ],
  },
  {
    slug: "chatgpt-prompt-generator",
    contentTypeKey: "assistant-prompt",
    h1: "AI Chat Prompt Generator",
    metaTitle: "Free ChatGPT Prompt Generator (AI Personas)",
    metaDescription:
      "Generate powerful system prompts that turn ChatGPT or Claude into a focused expert assistant. Pick a role, goal, and tone — copy and paste in seconds.",
    intro:
      "Turn any AI chat into a focused expert. Describe the role, goal, and tone, and generate a polished system prompt you can paste into ChatGPT, Claude, or any assistant.",
    useCases: [
      "ChatGPT and Claude system prompts",
      "Custom GPT instructions",
      "Role-based expert personas",
      "Team prompt standards",
      "Reusable assistant setups",
    ],
  },
];

export function getToolPage(slug: string): ToolPage | null {
  return TOOL_PAGES.find((t) => t.slug === slug) ?? null;
}

export function contentTypeFor(key: string): ContentType | undefined {
  return CONTENT_TYPES.find((c) => c.key === key);
}
