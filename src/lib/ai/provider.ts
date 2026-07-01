import Anthropic from "@anthropic-ai/sdk";

// Managed generation: the key is server-only. Provider-agnostic seam — Claude
// is the default; the model is env-overridable so cost/latency can be tuned
// without touching code (a future "model comparison" feature slots in here).
export const DEFAULT_MODEL = process.env.PROMPTPILOT_MODEL ?? "claude-opus-4-8";

export const hasApiKey = () => Boolean(process.env.ANTHROPIC_API_KEY);

let cached: Anthropic | null = null;

/** Returns a client when a key is configured, otherwise null (→ demo mode). */
export function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!cached) cached = new Anthropic();
  return cached;
}
