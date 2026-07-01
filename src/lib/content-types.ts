import {
  Mail,
  Megaphone,
  FileText,
  ShoppingBag,
  Hash,
  type LucideIcon,
} from "lucide-react";

// The guided-flow config. Each content type defines the questions to ask AND
// the reusable template — and the {tokens} in the template MUST match the
// question keys. This is what makes "chat in → recipe out" deterministic.

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
  template: string;
  questions: Question[];
};

const TONE = ["Friendly", "Bold", "Premium", "Playful"];

export const CONTENT_TYPES: ContentType[] = [
  {
    key: "marketing-email",
    label: "Marketing email",
    icon: Mail,
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
    template:
      "Write a benefit-led product description for {product}. Tone: {tone}. Length: {length}.",
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
    template:
      "Write 5 {tone} social captions for {product}, each with 3 relevant hashtags.",
    questions: [
      { key: "product", label: "What are you posting about?", type: "text", placeholder: "e.g. the Acme Blender Pro" },
      { key: "tone", label: "Pick a tone", type: "select", options: TONE },
    ],
  },
];
