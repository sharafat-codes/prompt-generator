import {
  Mail,
  Megaphone,
  FileText,
  ShoppingBag,
  Hash,
  Image,
  Bot,
  type LucideIcon,
} from "lucide-react";

// Each content type = the questions to ask + the template to build. The
// {tokens} in the template MUST match question keys. `group` sorts the picker;
// `resultLabel` is shown to the user as "Your {resultLabel}" so we never make
// them read the word "prompt" unless that's literally what they're making.

export type ContentGroup = "Content" | "AI prompts";

export type Question = {
  key: string;
  label: string;
  type: "text" | "select";
  placeholder?: string;
  options?: string[];
};

export type ContentType = {
  key: string;
  label: string;
  icon: LucideIcon;
  group: ContentGroup;
  resultLabel: string;
  template: string;
  questions: Question[];
};

export const CONTENT_GROUPS: ContentGroup[] = ["Content", "AI prompts"];

const TONE = ["Friendly", "Bold", "Premium", "Playful"];
const DETAIL = ["Simple", "Detailed", "Expert"];

export const CONTENT_TYPES: ContentType[] = [
  // ── Content: the finished thing you'll use ──────────────────────────────
  {
    key: "marketing-email",
    label: "Marketing email",
    icon: Mail,
    group: "Content",
    resultLabel: "email",
    template:
      "Write a {tone} launch email for {product}, targeting {audience}. Lead with the single biggest benefit and end with one clear call-to-action.",
    questions: [
      { key: "product", label: "What are you promoting?", type: "text", placeholder: "e.g. the Acme Blender Pro" },
      { key: "audience", label: "Who's the audience?", type: "text", placeholder: "e.g. busy parents" },
      { key: "tone", label: "Pick a tone", type: "select", options: TONE },
    ],
  },
  {
    key: "ad-copy",
    label: "Ad copy",
    icon: Megaphone,
    group: "Content",
    resultLabel: "ad hooks",
    template:
      "Write 3 scroll-stopping ad hooks for {product}, aimed at {audience}. Keep each under 12 words.",
    questions: [
      { key: "product", label: "What are you advertising?", type: "text", placeholder: "e.g. the Acme Blender Pro" },
      { key: "audience", label: "Who should it stop?", type: "text", placeholder: "e.g. busy parents" },
    ],
  },
  {
    key: "blog-post",
    label: "Blog outline",
    icon: FileText,
    group: "Content",
    resultLabel: "blog outline",
    template:
      'Write a {tone} blog post outline about {topic}, targeting the keyword "{keyword}". Include a compelling title and 4–6 H2 sections.',
    questions: [
      { key: "topic", label: "What's the topic?", type: "text", placeholder: "e.g. quick healthy breakfasts" },
      { key: "keyword", label: "Target keyword?", type: "text", placeholder: "e.g. easy smoothie recipes" },
      { key: "tone", label: "Pick a tone", type: "select", options: TONE },
    ],
  },
  {
    key: "product-description",
    label: "Product description",
    icon: ShoppingBag,
    group: "Content",
    resultLabel: "product description",
    template: "Write a benefit-led product description for {product}. Tone: {tone}. Length: {length}.",
    questions: [
      { key: "product", label: "Which product?", type: "text", placeholder: "e.g. the Acme Blender Pro" },
      { key: "tone", label: "Pick a tone", type: "select", options: TONE },
      { key: "length", label: "How long?", type: "select", options: ["Short", "Medium", "Long"] },
    ],
  },
  {
    key: "social-caption",
    label: "Social caption",
    icon: Hash,
    group: "Content",
    resultLabel: "captions",
    template: "Write 5 {tone} social captions for {product}, each with 3 relevant hashtags.",
    questions: [
      { key: "product", label: "What are you posting about?", type: "text", placeholder: "e.g. the Acme Blender Pro" },
      { key: "tone", label: "Pick a tone", type: "select", options: TONE },
    ],
  },

  // ── AI prompts: a prompt you'll paste into another AI tool ──────────────
  {
    key: "image-prompt",
    label: "Image prompt",
    icon: Image,
    group: "AI prompts",
    resultLabel: "image prompt",
    template:
      "Write a vivid, detailed image-generation prompt for {subject}. Style: {style}. Mood and lighting: {mood}. Detail level: {detail}. Return a single prompt with rich, comma-separated visual descriptors, ready to paste into an AI image generator like Midjourney or DALL·E.",
    questions: [
      { key: "subject", label: "What should the image show?", type: "text", placeholder: "e.g. a cozy reading nook by a rainy window" },
      {
        key: "style",
        label: "Visual style",
        type: "select",
        options: ["Photorealistic", "Cinematic", "Digital art", "Illustration", "3D render", "Anime"],
      },
      { key: "mood", label: "Mood & lighting", type: "text", placeholder: "e.g. warm, golden-hour, soft shadows" },
      { key: "detail", label: "Detail level", type: "select", options: DETAIL },
    ],
  },
  {
    key: "assistant-prompt",
    label: "AI chat prompt",
    icon: Bot,
    group: "AI prompts",
    resultLabel: "assistant prompt",
    template:
      "Write a {detail} system prompt that makes an AI assistant act as {role}. Its main job: {goal}. Tone: {tone}. Return the prompt only, written in the second person (\"You are…\").",
    questions: [
      { key: "role", label: "Who should the AI act as?", type: "text", placeholder: "e.g. a senior email copywriter" },
      { key: "goal", label: "What should it help with?", type: "text", placeholder: "e.g. writing and improving cold emails" },
      { key: "tone", label: "Tone", type: "select", options: ["Friendly", "Professional", "Direct", "Encouraging"] },
      { key: "detail", label: "Detail level", type: "select", options: DETAIL },
    ],
  },
];
