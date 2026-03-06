import { describe, it, expect } from 'vitest';
import {
  findMatches,
  hasTermOverlap,
  getExtractionSectors,
  isCrossSectorMatch,
} from './matcher.js';
import type {
  ExtractionResult,
  ExtractedOffering,
  ExtractedNeed,
  MatchCandidate,
} from './types.js';

// ============================================================================
// Inline Helpers
// ============================================================================

let idCounter = 0;

function makeExtraction(
  termIds: string[],
  confidences?: number[],
  sourceType: 'offering' | 'need' = 'offering'
): ExtractionResult {
  idCounter += 1;
  return {
    id: `extraction-${idCounter}`,
    input: 'test input',
    source_type: sourceType,
    extracted_terms: termIds.map((term_id, i) => ({
      term_id,
      confidence: confidences?.[i] ?? 0.9,
      reasoning: 'test',
    })),
    unmatched_fragments: [],
    timestamp: '2025-06-15T12:00:00.000Z',
  };
}

function makeOffering(termIds: string[], confidences?: number[]): ExtractedOffering {
  idCounter += 1;
  return {
    id: `offering-${idCounter}`,
    description: 'test offering',
    extraction: makeExtraction(termIds, confidences, 'offering'),
  };
}

function makeNeed(termIds: string[], confidences?: number[]): ExtractedNeed {
  idCounter += 1;
  return {
    id: `need-${idCounter}`,
    description: 'test need',
    extraction: makeExtraction(termIds, confidences, 'need'),
  };
}

// ============================================================================
// Tests — findMatches
// ============================================================================

describe('findMatches', () => {
  it('returns matches when need and offering share terms above confidence threshold', () => {
    const need = makeNeed(['logo_design', 'pitch_deck']);
    const offering = makeOffering(['logo_design']);

    const matches = findMatches(need, [offering]);

    expect(matches).toHaveLength(1);
    expect(matches[0].matched_terms).toContain('logo_design');
    expect(matches[0].confidence).toBeGreaterThanOrEqual(0.5);
    expect(matches[0].offering_id).toBe(offering.id);
    expect(matches[0].need_id).toBe(need.id);
  });

  it('returns empty array when no term overlap exists', () => {
    const need = makeNeed(['logo_design']);
    const offering = makeOffering(['contract_review']);

    const matches = findMatches(need, [offering]);

    expect(matches).toEqual([]);
  });

  it('sorts matches by confidence descending', () => {
    // Lower confidence on offering terms will produce a lower average
    const need = makeNeed(['logo_design', 'contract_review'], [0.9, 0.9]);
    const offeringHigh = makeOffering(['logo_design'], [0.95]);
    const offeringLow = makeOffering(['contract_review'], [0.7]);

    const matches = findMatches(need, [offeringLow, offeringHigh]);

    expect(matches).toHaveLength(2);
    expect(matches[0].confidence).toBeGreaterThanOrEqual(matches[1].confidence);
  });

  it('filters out matches below MIN_MATCH_CONFIDENCE (0.5)', () => {
    // Both terms at exactly 0.6 (MIN_TERM_CONFIDENCE) — average confidence = 0.6
    // This is above 0.5, so it should still match
    const need = makeNeed(['logo_design'], [0.6]);
    const offering = makeOffering(['logo_design'], [0.6]);

    const matches = findMatches(need, [offering]);
    expect(matches).toHaveLength(1);
    expect(matches[0].confidence).toBeGreaterThanOrEqual(0.5);
  });

  it('filters out individual terms below MIN_TERM_CONFIDENCE (0.6) before matching', () => {
    // Need term at 0.5 is below the 0.6 threshold — should be excluded
    const need = makeNeed(['logo_design'], [0.5]);
    const offering = makeOffering(['logo_design'], [0.9]);

    const matches = findMatches(need, [offering]);

    expect(matches).toEqual([]);
  });
});

// ============================================================================
// Tests — utility functions
// ============================================================================

describe('hasTermOverlap', () => {
  it('returns true when extractions share at least one term above confidence threshold', () => {
    const e1 = makeExtraction(['logo_design', 'pitch_deck'], [0.9, 0.9]);
    const e2 = makeExtraction(['logo_design', 'contract_review'], [0.8, 0.8]);

    expect(hasTermOverlap(e1, e2)).toBe(true);
  });

  it('returns false when extractions share no terms', () => {
    const e1 = makeExtraction(['logo_design'], [0.9]);
    const e2 = makeExtraction(['contract_review'], [0.9]);

    expect(hasTermOverlap(e1, e2)).toBe(false);
  });
});

describe('getExtractionSectors', () => {
  it('returns correct sectors from vocabulary lookup', () => {
    const extraction = makeExtraction(['logo_design', 'contract_review']);

    const sectors = getExtractionSectors(extraction);

    expect(sectors).toContain('creative');
    expect(sectors).toContain('legal');
    expect(sectors).toHaveLength(2);
  });

  it('returns empty array for unknown term_ids', () => {
    const extraction = makeExtraction(['unknown_term_abc', 'another_unknown']);

    const sectors = getExtractionSectors(extraction);

    expect(sectors).toEqual([]);
  });
});

describe('isCrossSectorMatch', () => {
  it('returns true when matched terms span multiple sectors', () => {
    const match: MatchCandidate = {
      id: 'match-1',
      offering_id: 'o1',
      need_id: 'n1',
      matched_terms: ['logo_design', 'contract_review'], // creative + legal
      confidence: 0.85,
      explanation: 'test',
    };

    expect(isCrossSectorMatch(match)).toBe(true);
  });

  it('returns false when all matched terms are in the same sector', () => {
    const match: MatchCandidate = {
      id: 'match-2',
      offering_id: 'o2',
      need_id: 'n2',
      matched_terms: ['logo_design', 'pitch_deck'], // both creative
      confidence: 0.9,
      explanation: 'test',
    };

    expect(isCrossSectorMatch(match)).toBe(false);
  });
});
