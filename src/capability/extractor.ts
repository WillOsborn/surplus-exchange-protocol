/**
 * Capability Translation System — Term Extractor
 *
 * Uses Claude API to extract capability terms from natural language input.
 * This is the core AI component of the capability translation system.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { ExtractionResult, ExtractedTerm } from './types.js';
import { SEED_VOCABULARY, formatVocabularyForPrompt } from './seed-vocabulary.js';

// ═══════════════════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════════════════

/** Model to use for extraction (Haiku for speed/cost) */
const EXTRACTION_MODEL = 'claude-3-5-haiku-latest';

/** Maximum tokens for extraction response */
const MAX_TOKENS = 1024;

// ═══════════════════════════════════════════════════════════════════════════════
// Prompt Construction
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build the system prompt for capability extraction.
 */
function buildSystemPrompt(): string {
  return `You are a capability extraction system for a surplus exchange protocol.
Your job is to identify capability terms from natural language descriptions of
what someone can offer or what someone needs.

You must ONLY match against the known vocabulary provided. Do not invent new terms.

For each match, provide:
- The exact term_id from the vocabulary
- A confidence score from 0.0 to 1.0
- Brief reasoning for the match

If parts of the input don't match any known terms, list them as unmatched fragments.

IMPORTANT: Respond with ONLY a JSON object. No explanations, no commentary, no text before or after the JSON. Just the raw JSON object.`;
}

/**
 * Build the user prompt for a specific extraction.
 */
function buildUserPrompt(input: string, sourceType: 'offering' | 'need'): string {
  const vocabulary = formatVocabularyForPrompt();
  const context =
    sourceType === 'offering'
      ? 'This describes surplus capacity someone is OFFERING.'
      : 'This describes something someone NEEDS.';

  return `AVAILABLE CAPABILITY TERMS:
${vocabulary}

INPUT TYPE: ${sourceType}
CONTEXT: ${context}

INPUT TO ANALYSE:
"${input}"

Extract capability terms and respond with JSON in this exact format:
{
  "extracted_terms": [
    {
      "term_id": "exact_term_id_from_vocabulary",
      "confidence": 0.0-1.0,
      "reasoning": "Brief explanation"
    }
  ],
  "unmatched_fragments": ["parts that don't match any terms"]
}

Rules:
- Only use term_ids that exist in the vocabulary above
- Confidence should reflect how well the input matches the term
- Include unmatched_fragments for parts that don't map to known terms
- If nothing matches, return empty arrays`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Response Parsing
// ═══════════════════════════════════════════════════════════════════════════════

interface RawExtractionResponse {
  extracted_terms: Array<{
    term_id: string;
    confidence: number;
    reasoning: string;
  }>;
  unmatched_fragments: string[];
}

/**
 * Extract JSON object from a string that may contain surrounding text.
 */
function extractJsonFromText(text: string): string {
  // Find the first { and last } to extract the JSON object
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('No JSON object found in response');
  }

  return text.slice(firstBrace, lastBrace + 1);
}

/**
 * Parse and validate the LLM response.
 */
function parseExtractionResponse(responseText: string): RawExtractionResponse {
  // Extract JSON from response (handle markdown code blocks and surrounding text)
  let jsonText = responseText.trim();

  // Remove markdown code blocks if present
  if (jsonText.includes('```json')) {
    const start = jsonText.indexOf('```json') + 7;
    const end = jsonText.indexOf('```', start);
    if (end > start) {
      jsonText = jsonText.slice(start, end);
    }
  } else if (jsonText.includes('```')) {
    const start = jsonText.indexOf('```') + 3;
    const end = jsonText.indexOf('```', start);
    if (end > start) {
      jsonText = jsonText.slice(start, end);
    }
  }

  // Extract just the JSON object (handles text before/after JSON)
  jsonText = extractJsonFromText(jsonText);

  try {
    const parsed = JSON.parse(jsonText) as RawExtractionResponse;

    // Validate structure
    if (!Array.isArray(parsed.extracted_terms)) {
      parsed.extracted_terms = [];
    }
    if (!Array.isArray(parsed.unmatched_fragments)) {
      parsed.unmatched_fragments = [];
    }

    // Validate term IDs exist in vocabulary
    const validTermIds = new Set(SEED_VOCABULARY.map((t) => t.id));
    parsed.extracted_terms = parsed.extracted_terms.filter((term) => {
      if (!validTermIds.has(term.term_id)) {
        console.warn(`  Warning: Unknown term_id "${term.term_id}" — skipping`);
        return false;
      }
      return true;
    });

    // Clamp confidence scores
    for (const term of parsed.extracted_terms) {
      term.confidence = Math.max(0, Math.min(1, term.confidence));
    }

    return parsed;
  } catch (error) {
    console.error('Failed to parse extraction response:', responseText);
    throw new Error(`Invalid extraction response: ${error}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Extraction Function
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract capability terms from natural language input using Claude API.
 *
 * @param input - Natural language description
 * @param sourceType - Whether this is an offering or a need
 * @param apiKey - Anthropic API key
 * @returns Extraction result with matched terms and unmatched fragments
 *
 * @example
 * ```typescript
 * const result = await extractTerms(
 *   "I'm a solicitor with 10 hours spare for contract work",
 *   "offering",
 *   process.env.ANTHROPIC_API_KEY
 * );
 * // result.extracted_terms = [
 * //   { term_id: 'contract_review', confidence: 0.9, reasoning: '...' },
 * //   { term_id: 'legal_consultation', confidence: 0.8, reasoning: '...' }
 * // ]
 * ```
 */
export async function extractTerms(
  input: string,
  sourceType: 'offering' | 'need',
  apiKey: string
): Promise<ExtractionResult> {
  if (!apiKey) {
    throw new Error('API key is required for term extraction');
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: EXTRACTION_MODEL,
    max_tokens: MAX_TOKENS,
    system: buildSystemPrompt(),
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(input, sourceType),
      },
    ],
  });

  // Extract text from response
  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in extraction response');
  }

  const parsed = parseExtractionResponse(textContent.text);

  // Build result
  const result: ExtractionResult = {
    id: `ext-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    input,
    source_type: sourceType,
    extracted_terms: parsed.extracted_terms.map(
      (t): ExtractedTerm => ({
        term_id: t.term_id,
        confidence: t.confidence,
        reasoning: t.reasoning,
      })
    ),
    unmatched_fragments: parsed.unmatched_fragments,
    timestamp: new Date().toISOString(),
  };

  return result;
}

/**
 * Format extraction result for display.
 */
export function formatExtractionResult(result: ExtractionResult): string {
  const lines: string[] = [];

  if (result.extracted_terms.length === 0) {
    lines.push('  No matching capability terms found.');
  } else {
    lines.push('  Found:');
    for (const term of result.extracted_terms) {
      const confidencePercent = Math.round(term.confidence * 100);
      lines.push(`    • ${term.term_id} (${confidencePercent}%) — ${term.reasoning}`);
    }
  }

  if (result.unmatched_fragments.length > 0) {
    lines.push('');
    lines.push('  Unmatched:');
    for (const fragment of result.unmatched_fragments) {
      lines.push(`    • "${fragment}"`);
    }
  }

  return lines.join('\n');
}
