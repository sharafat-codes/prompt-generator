/** Short random token for globally-unique public slugs. */
export function randomToken(len = 6) {
  return Math.random().toString(36).slice(2, 2 + len);
}

export function slugify(input: string) {
  return (
    input
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "prompt"
  );
}
