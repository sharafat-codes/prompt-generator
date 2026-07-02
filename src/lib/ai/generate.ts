import { getClient, DEFAULT_MODEL } from "./provider";

const SYSTEM = `You are PromptPilot's generation engine — an expert copywriter for content creators and marketers. Produce polished, ready-to-use output that matches the requested tone and audience. Respond only with the finished content: no preamble, no explanation, no meta-commentary about your process.`;

/**
 * Streams generated text token-by-token. Uses Claude when a key is set;
 * otherwise streams a canned, on-topic response so the whole UX is demoable
 * with zero setup. Swapping demo → live requires no code change.
 */
export async function* streamGeneration(
  prompt: string,
  opts: { contentType?: string; model?: string } = {},
): AsyncGenerator<string> {
  const client = getClient();
  if (!client) {
    yield* demoStream(opts.contentType);
    return;
  }

  const stream = client.messages.stream({
    model: opts.model ?? DEFAULT_MODEL,
    max_tokens: 2048,
    system: SYSTEM,
    messages: [{ role: "user", content: prompt }],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}

const IMPROVE_SYSTEM = `You improve prompt templates. Rewrite the given template so it produces clearer, more effective, more specific results. Rules: preserve every {token} exactly (same names, same casing); do not add or remove tokens; keep it concise. Return ONLY the improved template text — no preamble, no quotes, no explanation.`;

/** Rewrite a template into a stronger one (non-streaming). Demo-safe. */
export async function improveTemplate(template: string, model?: string): Promise<string> {
  const client = getClient();
  if (!client) {
    // Demo: a light, deterministic touch-up that keeps tokens intact.
    const base = template.trim().replace(/\s+$/, "");
    return `${base.replace(/\.$/, "")}. Be specific and concrete, lead with the most important point, and match the requested tone.`;
  }
  const message = await client.messages.create({
    model: model ?? DEFAULT_MODEL,
    max_tokens: 1024,
    system: IMPROVE_SYSTEM,
    messages: [{ role: "user", content: template }],
  });
  const text = message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
  return text || template;
}

// ── Demo mode ─────────────────────────────────────────────────────────────
const DEMO: Record<string, string> = {
  "marketing-email":
    "Subject: Mornings just got easier ☀️\n\nHey there —\n\nBetween the school run and a full inbox, who has time to make breakfast? The new Acme Blender Pro blitzes a smoothie in 20 seconds flat, then rinses clean in the sink. No lumps, no lids to scrub, no excuses.\n\nYour 7 a.m. self will thank you.\n\n→ See it in action",
  "ad-copy":
    "1. Breakfast, blitzed in 20 seconds.\n2. The blender busy parents actually use.\n3. Smoothies without a sink full of parts.",
  "blog-post":
    "Title: The 20-Second Breakfast — How Busy Parents Actually Eat Well\n\n1. Why mornings break most healthy-eating plans\n2. The one appliance that changes the math\n3. Five no-prep smoothie formulas\n4. Cleanup in under a minute\n5. Making it a habit that sticks",
  "product-description":
    "Meet the Acme Blender Pro — the 20-second path from fridge to smoothie. A single-touch motor powers through frozen fruit and ice, while the one-piece cup rinses clean in seconds. Built for real mornings, not recipe blogs.",
  "social-caption":
    "1. 20 seconds. One cup. Zero excuses. 🥤 #morningroutine #smoothie #busyparents\n2. Breakfast sorted before the coffee's even brewed. ☕ #healthyhabits #quickmeals #blenderlife\n3. Less prep, more mornings back. 🙌 #mealprep #busymom #wellness",
  "image-prompt":
    "A cozy reading nook beside a rain-streaked window, worn leather armchair, stacks of well-loved books, a steaming mug on the sill — warm golden lamplight, soft shadows, shallow depth of field, muted autumn palette, cinematic, photorealistic, 35mm, highly detailed.",
  "assistant-prompt":
    'You are a senior email copywriter with over a decade in direct response. Your job is to write and sharpen cold emails that actually get replies. Keep them short, specific, and human: open with the reader\'s problem, one idea per email, a single soft call-to-action. Avoid hype, jargon, and generic flattery. When given a draft, rewrite it and briefly note what you changed and why.',
};

const DEMO_DEFAULT =
  "Here's a polished draft ready to use. It follows the tone and audience you chose, leads with the strongest benefit, and closes with a clear next step — the kind of output you'll be able to save as a reusable recipe and re-run in seconds.";

async function* demoStream(contentType?: string): AsyncGenerator<string> {
  const text = (contentType && DEMO[contentType]) || DEMO_DEFAULT;
  for (const token of text.split(/(\s+)/)) {
    if (token) yield token;
    await new Promise((resolve) => setTimeout(resolve, 16));
  }
}
