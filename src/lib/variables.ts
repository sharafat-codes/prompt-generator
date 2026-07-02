// The core primitive: prompts are templates with {variable} tokens.
// Parsing them powers the token highlighting in the library and the
// "tokens become fields" experience on the run screen.

import type { VariableSpec } from "@/lib/prompt-types";

const TOKEN = /\{([a-zA-Z0-9_]+)\}/g;

export type TemplateSegment =
  | { type: "text"; value: string }
  | { type: "var"; name: string };

/** Split a template into text + variable segments for rendering. */
export function parseTemplate(template: string): TemplateSegment[] {
  const segments: TemplateSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  TOKEN.lastIndex = 0;
  while ((match = TOKEN.exec(template)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: template.slice(lastIndex, match.index) });
    }
    segments.push({ type: "var", name: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < template.length) {
    segments.push({ type: "text", value: template.slice(lastIndex) });
  }
  return segments;
}

/** Unique variable keys in a template, in first-seen order. */
export function extractVariables(template: string): string[] {
  const seen = new Set<string>();
  let match: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((match = TOKEN.exec(template)) !== null) {
    seen.add(match[1]);
  }
  return [...seen];
}

/** Turn a token key into a human label, e.g. "target_audience" → "Target audience". */
export function labelize(key: string): string {
  const s = key.replace(/[_-]+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Re-derive the variable schema from a (possibly edited) template: keep the
 * spec for tokens that still exist, default new tokens to a text field.
 */
export function deriveVariables(template: string, previous: VariableSpec[] = []): VariableSpec[] {
  const prev = new Map(previous.map((v) => [v.key, v]));
  return extractVariables(template).map(
    (key) => prev.get(key) ?? { key, label: labelize(key), type: "text" as const },
  );
}
