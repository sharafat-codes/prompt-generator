// The core primitive: prompts are templates with {variable} tokens.
// Parsing them powers the token highlighting in the library and the
// "tokens become fields" experience on the run screen.

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
