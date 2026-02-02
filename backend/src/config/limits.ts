/**
 * Limites defensivos contra abuso e custo excessivo.
 * Impede que um único PDF gere custo desproporcional.
 */
export const PDF_LIMITS = {
  /** Máximo de caracteres de texto extraído do PDF */
  MAX_TEXT_LENGTH: 500_000,
  /** Máximo de chunks enviados ao Gemini por PDF */
  MAX_CHUNKS_PER_PDF: 50,
  /** Máximo de chamadas paralelas ao Gemini por PDF (hard cap) */
  MAX_GEMINI_CALLS_PER_PDF: 20,
} as const;
