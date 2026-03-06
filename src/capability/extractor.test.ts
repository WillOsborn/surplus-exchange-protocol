/**
 * Term Extractor — Unit Tests
 *
 * Tests extractTerms() via mocked Anthropic SDK, plus
 * parseExtractionResponse() edge cases and formatExtractionResult().
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
}));

vi.mock('@anthropic-ai/sdk', () => ({
  default: function MockAnthropic() {
    return { messages: { create: mockCreate } };
  },
}));

import { extractTerms, formatExtractionResult } from './extractor.js';
import type { ExtractionResult } from './types.js';

// ─────────────────────────────────────────────────────────────────────────────
// Inline helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Build a mock API response wrapping a text payload. */
function apiResponse(text: string) {
  return {
    content: [{ type: 'text', text }],
  };
}

/** Standard extraction JSON with valid term IDs from seed vocabulary. */
function validExtractionJson(overrides: {
  extracted_terms?: Array<{ term_id: string; confidence: number; reasoning: string }>;
  unmatched_fragments?: string[];
} = {}) {
  return JSON.stringify({
    extracted_terms: overrides.extracted_terms ?? [
      { term_id: 'logo_design', confidence: 0.9, reasoning: 'Direct match' },
    ],
    unmatched_fragments: overrides.unmatched_fragments ?? [],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.resetAllMocks();
});

describe('extractTerms', () => {
  it('calls mock API and returns parsed result', async () => {
    mockCreate.mockResolvedValueOnce(apiResponse(validExtractionJson()));

    const result = await extractTerms('I can design logos', 'offering', 'test-key');

    expect(mockCreate).toHaveBeenCalledOnce();
    expect(result.extracted_terms).toHaveLength(1);
    expect(result.extracted_terms[0].term_id).toBe('logo_design');
    expect(result.extracted_terms[0].confidence).toBe(0.9);
    expect(result.source_type).toBe('offering');
  });

  it('throws when apiKey is empty', async () => {
    await expect(extractTerms('test', 'offering', '')).rejects.toThrow('API key is required');
  });

  it('handles response wrapped in markdown code blocks', async () => {
    const wrappedResponse = '```json\n' + validExtractionJson({
      extracted_terms: [
        { term_id: 'contract_review', confidence: 0.85, reasoning: 'Legal match' },
      ],
    }) + '\n```';

    mockCreate.mockResolvedValueOnce(apiResponse(wrappedResponse));

    const result = await extractTerms('I need contract review', 'need', 'test-key');

    expect(result.extracted_terms).toHaveLength(1);
    expect(result.extracted_terms[0].term_id).toBe('contract_review');
    expect(result.extracted_terms[0].confidence).toBe(0.85);
    expect(result.source_type).toBe('need');
  });

  it('filters out unknown term_ids and clamps confidence to [0, 1]', async () => {
    const responseJson = JSON.stringify({
      extracted_terms: [
        { term_id: 'logo_design', confidence: 1.5, reasoning: 'Over-confident' },
        { term_id: 'nonexistent_term', confidence: 0.9, reasoning: 'Invented' },
        { term_id: 'pitch_deck', confidence: -0.2, reasoning: 'Under-confident' },
      ],
      unmatched_fragments: ['something unknown'],
    });

    mockCreate.mockResolvedValueOnce(apiResponse(responseJson));

    const result = await extractTerms('Design a logo and pitch deck', 'offering', 'test-key');

    // nonexistent_term should be filtered out
    expect(result.extracted_terms).toHaveLength(2);
    expect(result.extracted_terms.map((t) => t.term_id)).toEqual(['logo_design', 'pitch_deck']);

    // Confidence should be clamped to [0, 1]
    expect(result.extracted_terms[0].confidence).toBe(1);  // 1.5 → 1
    expect(result.extracted_terms[1].confidence).toBe(0);   // -0.2 → 0

    expect(result.unmatched_fragments).toEqual(['something unknown']);
  });
});

describe('formatExtractionResult', () => {
  it('returns formatted string containing extracted term labels and confidence', () => {
    const result: ExtractionResult = {
      id: 'ext-fmt-001',
      input: 'I can design logos and review contracts',
      source_type: 'offering',
      extracted_terms: [
        { term_id: 'logo_design', confidence: 0.92, reasoning: 'Design skill' },
        { term_id: 'contract_review', confidence: 0.75, reasoning: 'Legal skill' },
      ],
      unmatched_fragments: ['some other skill'],
      timestamp: '2026-01-01T00:00:00.000Z',
    };

    const formatted = formatExtractionResult(result);

    // Should contain term IDs and confidence percentages
    expect(formatted).toContain('logo_design');
    expect(formatted).toContain('92%');
    expect(formatted).toContain('contract_review');
    expect(formatted).toContain('75%');
    // Should contain unmatched fragments
    expect(formatted).toContain('some other skill');
    // Should contain "Found:" header since there are terms
    expect(formatted).toContain('Found:');
    // Should contain "Unmatched:" header since there are fragments
    expect(formatted).toContain('Unmatched:');
  });
});
