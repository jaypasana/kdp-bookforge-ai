/** Converts a book title into a URL/filename-safe slug, e.g. "AI for Real Estate Agents" -> "ai-for-real-estate-agents". */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "book";
}

/** Appends a short random suffix to a base slug to guarantee uniqueness. */
export function uniqueSlug(base: string): string {
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${slugify(base)}-${suffix}`;
}
