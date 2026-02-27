/**
 * Capability Translation System — Matcher
 *
 * Matches offerings to needs based on extracted capability terms.
 * This is a simple term-overlap matcher for the prototype.
 */

import type {
  ExtractionResult,
  ExtractedOffering,
  ExtractedNeed,
  MatchCandidate,
} from './types.js';
import { SEED_VOCABULARY_MAP } from './seed-vocabulary.js';

// ═══════════════════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════════════════

/** Minimum confidence threshold for a match to be considered */
const MIN_MATCH_CONFIDENCE = 0.5;

/** Minimum term confidence to include in matching */
const MIN_TERM_CONFIDENCE = 0.6;

// ═══════════════════════════════════════════════════════════════════════════════
// Matching Logic
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Find matches between a need and a list of offerings.
 *
 * @param need - The extracted need to match
 * @param offerings - List of extracted offerings to match against
 * @returns Sorted list of match candidates (best first)
 *
 * @example
 * ```typescript
 * const matches = findMatches(extractedNeed, [offering1, offering2]);
 * for (const match of matches) {
 *   console.log(`Match: ${match.confidence} on ${match.matched_terms.join(', ')}`);
 * }
 * ```
 */
export function findMatches(
  need: ExtractedNeed,
  offerings: ExtractedOffering[]
): MatchCandidate[] {
  const candidates: MatchCandidate[] = [];

  // Get need terms above confidence threshold
  const needTerms = need.extraction.extracted_terms.filter(
    (t) => t.confidence >= MIN_TERM_CONFIDENCE
  );

  if (needTerms.length === 0) {
    return [];
  }

  const needTermIds = new Set(needTerms.map((t) => t.term_id));

  for (const offering of offerings) {
    // Get offering terms above confidence threshold
    const offeringTerms = offering.extraction.extracted_terms.filter(
      (t) => t.confidence >= MIN_TERM_CONFIDENCE
    );

    if (offeringTerms.length === 0) {
      continue;
    }

    // Find overlapping terms
    const matchedTerms: string[] = [];
    let totalConfidence = 0;

    for (const offeringTerm of offeringTerms) {
      if (needTermIds.has(offeringTerm.term_id)) {
        matchedTerms.push(offeringTerm.term_id);

        // Find the corresponding need term
        const needTerm = needTerms.find((t) => t.term_id === offeringTerm.term_id);
        if (needTerm) {
          // Average the confidences
          totalConfidence += (offeringTerm.confidence + needTerm.confidence) / 2;
        }
      }
    }

    if (matchedTerms.length === 0) {
      continue;
    }

    // Calculate overall confidence
    const confidence = totalConfidence / matchedTerms.length;

    if (confidence < MIN_MATCH_CONFIDENCE) {
      continue;
    }

    // Generate explanation
    const explanation = generateMatchExplanation(
      offering,
      need,
      matchedTerms,
      confidence
    );

    const candidate: MatchCandidate = {
      id: `match-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      offering_id: offering.id,
      need_id: need.id,
      matched_terms: matchedTerms,
      confidence,
      explanation,
    };

    candidates.push(candidate);
  }

  // Sort by confidence (descending)
  candidates.sort((a, b) => b.confidence - a.confidence);

  return candidates;
}

/**
 * Generate a human-readable explanation for a match.
 */
function generateMatchExplanation(
  _offering: ExtractedOffering,
  _need: ExtractedNeed,
  matchedTerms: string[],
  confidence: number
): string {
  const termLabels = matchedTerms
    .map((id) => SEED_VOCABULARY_MAP.get(id)?.label ?? id)
    .join(', ');

  const confidencePercent = Math.round(confidence * 100);

  if (matchedTerms.length === 1) {
    return `Provider offers ${termLabels.toLowerCase()}, which matches what the recipient needs (${confidencePercent}% confidence).`;
  }

  return `Provider offers capabilities matching ${matchedTerms.length} needs: ${termLabels} (${confidencePercent}% confidence).`;
}

/**
 * Quick match check between two extraction results.
 * Returns true if there's any term overlap.
 */
export function hasTermOverlap(
  extraction1: ExtractionResult,
  extraction2: ExtractionResult
): boolean {
  const terms1 = new Set(
    extraction1.extracted_terms
      .filter((t) => t.confidence >= MIN_TERM_CONFIDENCE)
      .map((t) => t.term_id)
  );

  return extraction2.extracted_terms.some(
    (t) => t.confidence >= MIN_TERM_CONFIDENCE && terms1.has(t.term_id)
  );
}

/**
 * Get the sectors involved in an extraction.
 */
export function getExtractionSectors(extraction: ExtractionResult): string[] {
  const sectors = new Set<string>();

  for (const term of extraction.extracted_terms) {
    const definition = SEED_VOCABULARY_MAP.get(term.term_id);
    if (definition) {
      sectors.add(definition.sector);
    }
  }

  return [...sectors];
}

/**
 * Check if a match is cross-sector (involves terms from different sectors).
 */
export function isCrossSectorMatch(match: MatchCandidate): boolean {
  const sectors = new Set<string>();

  for (const termId of match.matched_terms) {
    const definition = SEED_VOCABULARY_MAP.get(termId);
    if (definition) {
      sectors.add(definition.sector);
    }
  }

  return sectors.size > 1;
}

/**
 * Format a match candidate for display.
 */
export function formatMatchCandidate(match: MatchCandidate): string {
  const lines: string[] = [];
  const confidencePercent = Math.round(match.confidence * 100);

  lines.push(`  Match found!`);
  lines.push(`    Matched on: ${match.matched_terms.join(', ')}`);
  lines.push(`    Confidence: ${confidencePercent}%`);
  lines.push(`    ${match.explanation}`);

  if (isCrossSectorMatch(match)) {
    lines.push(`    (Cross-sector match)`);
  }

  return lines.join('\n');
}
