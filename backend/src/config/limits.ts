/**
 * Defensive limits against abuse and excessive cost.
 * Prevents a single PDF from generating disproportionate cost.
 */
export const PDF_LIMITS = {
  /** Maximum characters of text extracted from the PDF */
  MAX_TEXT_LENGTH: 500_000,
  /** Maximum chunks sent to Gemini per PDF */
  MAX_CHUNKS_PER_PDF: 50,
  /** Maximum parallel calls to Gemini per PDF (hard cap) */
  MAX_GEMINI_CALLS_PER_PDF: 20,
} as const;

/** Timeout for each LLM call in milliseconds */
export const LLM_TIMEOUT_MS = 60_000;
