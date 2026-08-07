/** Attempts a plain JSON.parse, returning undefined instead of throwing. */
export function safeParseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/**
 * Best-effort recovery for a model response that wraps JSON in prose or
 * markdown code fences (e.g. "Here you go:\n```json\n{...}\n```"). Finds the
 * first balanced {...} or [...] span and tries to parse that.
 */
export function extractJsonLoosely(raw: string): unknown {
  const fencedMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch) {
    const parsed = safeParseJson(fencedMatch[1].trim());
    if (parsed !== undefined) return parsed;
  }

  const start = raw.search(/[{[]/);
  if (start === -1) return undefined;

  const open = raw[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;

  for (let i = start; i < raw.length; i++) {
    if (raw[i] === open) depth++;
    else if (raw[i] === close) {
      depth--;
      if (depth === 0) {
        return safeParseJson(raw.slice(start, i + 1));
      }
    }
  }

  return undefined;
}
