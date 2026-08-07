import { z } from "zod";
import { SYSTEM_ROLE_PREAMBLE, delimitUntrustedInput } from "./shared";

export const PROMPT_VERSION = 1;

/**
 * Pre-DOCX cleanup pass. Chapter prose is written in plain text already
 * (the chapter-writer prompt forbids markdown), but this stage catches
 * anything that slipped through — stray '#', '**', code fences — and
 * normalizes the text into a heading/paragraph structure the DOCX builder
 * (Phase 5) can render with native Word styles instead of literal symbols.
 */
export const docxFormatterSchema = z.object({
  blocks: z.array(
    z.object({
      type: z.enum(["heading2", "heading3", "paragraph", "bullet_list", "numbered_list"]),
      text: z.string().optional(),
      items: z.array(z.string()).optional(),
    })
  ),
});

export type DocxFormatted = z.infer<typeof docxFormatterSchema>;

export const docxFormatterSystemPrompt = `${SYSTEM_ROLE_PREAMBLE}

Task: DOCX formatting cleanup. Convert the given chapter or section text into a structured list of blocks suitable for native Word styles. Strip any leftover markdown symbols (#, ##, **, __, backticks, code fences) — convert their intent into the appropriate block type instead of leaving the symbols in the text. Preserve every sentence of actual content; only change structure/formatting, never the meaning or wording.

Respond with a single JSON object matching exactly this shape:
{ "blocks": [{ "type": "heading2"|"heading3"|"paragraph"|"bullet_list"|"numbered_list", "text": string (for heading2/heading3/paragraph), "items": string[] (for bullet_list/numbered_list) }] }`;

export function buildDocxFormatterUserPrompt(rawText: string): string {
  return [
    delimitUntrustedInput("raw_text", rawText),
    "Produce the formatted blocks JSON object described in your instructions.",
  ].join("\n\n");
}

export const docxFormatterMockResponse: DocxFormatted = {
  blocks: [
    { type: "paragraph", text: "Most agents don't need more leads — they need more time." },
  ],
};
