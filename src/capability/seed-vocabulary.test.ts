import { describe, it, expect } from 'vitest';
import {
  SEED_VOCABULARY,
  SEED_VOCABULARY_MAP,
  getTermsBySector,
  getSectors,
  formatVocabularyForPrompt,
} from './seed-vocabulary.js';

// ============================================================================
// Tests
// ============================================================================

describe('SEED_VOCABULARY', () => {
  it('contains exactly 15 terms', () => {
    expect(SEED_VOCABULARY).toHaveLength(15);
  });

  it('every term has the required fields (id, label, sector, synonyms, typical_capacity)', () => {
    for (const term of SEED_VOCABULARY) {
      expect(term.id).toEqual(expect.any(String));
      expect(term.id.length).toBeGreaterThan(0);

      expect(term.label).toEqual(expect.any(String));
      expect(term.label.length).toBeGreaterThan(0);

      expect(term.sector).toEqual(expect.any(String));
      expect(term.sector.length).toBeGreaterThan(0);

      expect(Array.isArray(term.synonyms)).toBe(true);
      expect(term.synonyms.length).toBeGreaterThan(0);

      expect(term.typical_capacity).toBeDefined();
      expect(term.typical_capacity.amount).toEqual(expect.any(Number));
      expect(term.typical_capacity.unit).toEqual(expect.any(String));
      expect(term.typical_capacity.confidence).toEqual(expect.any(String));
    }
  });
});

describe('SEED_VOCABULARY_MAP', () => {
  it('has the same size as the SEED_VOCABULARY array', () => {
    expect(SEED_VOCABULARY_MAP.size).toBe(SEED_VOCABULARY.length);
  });

  it('provides O(1) lookup — every term id resolves to the correct term', () => {
    for (const term of SEED_VOCABULARY) {
      const looked = SEED_VOCABULARY_MAP.get(term.id);
      expect(looked).toBe(term);
    }
  });
});

describe('getTermsBySector', () => {
  it('returns 5 terms for the creative sector', () => {
    expect(getTermsBySector('creative')).toHaveLength(5);
  });

  it('returns 4 terms for the legal sector', () => {
    expect(getTermsBySector('legal')).toHaveLength(4);
  });

  it('returns 2 terms for the transport sector', () => {
    expect(getTermsBySector('transport')).toHaveLength(2);
  });

  it('returns an empty array for a nonexistent sector', () => {
    expect(getTermsBySector('nonexistent')).toEqual([]);
  });
});

describe('getSectors', () => {
  it('returns exactly 4 unique sectors', () => {
    const sectors = getSectors();
    expect(sectors).toHaveLength(4);
    expect(new Set(sectors).size).toBe(4);
    expect(sectors).toContain('creative');
    expect(sectors).toContain('legal');
    expect(sectors).toContain('professional_services');
    expect(sectors).toContain('transport');
  });
});

describe('formatVocabularyForPrompt', () => {
  it('returns a non-empty string containing all sector names', () => {
    const output = formatVocabularyForPrompt();
    expect(output.length).toBeGreaterThan(0);

    // The function uppercases sector names and replaces _ with space
    expect(output).toContain('CREATIVE');
    expect(output).toContain('LEGAL');
    expect(output).toContain('PROFESSIONAL SERVICES');
    expect(output).toContain('TRANSPORT');
  });
});
