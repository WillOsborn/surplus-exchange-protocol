/**
 * Feedback Store — Unit Tests
 *
 * Tests store management, recording functions, and analytics queries.
 * Uses vi.mock('fs') to isolate from filesystem.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockExistsSync, mockReadFileSync, mockWriteFileSync, mockMkdirSync } = vi.hoisted(() => ({
  mockExistsSync: vi.fn(),
  mockReadFileSync: vi.fn(),
  mockWriteFileSync: vi.fn(),
  mockMkdirSync: vi.fn(),
}));

vi.mock('fs', () => ({
  existsSync: mockExistsSync,
  readFileSync: mockReadFileSync,
  writeFileSync: mockWriteFileSync,
  mkdirSync: mockMkdirSync,
}));

import {
  createEmptyStore,
  loadFeedbackStore,
  saveFeedbackStore,
  recordExtraction,
  recordMatch,
  recordFeedback,
  getConfirmationRate,
  getStoreSummary,
} from './feedback.js';

import type {
  FeedbackStore,
  ExtractionResult,
  MatchCandidate,
  MatchFeedback,
} from './types.js';

// ─────────────────────────────────────────────────────────────────────────────
// Inline helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeExtraction(overrides: Partial<ExtractionResult> = {}): ExtractionResult {
  return {
    id: 'ext-001',
    input: 'I can design logos',
    source_type: 'offering',
    extracted_terms: [
      { term_id: 'logo_design', confidence: 0.9, reasoning: 'Direct match' },
    ],
    unmatched_fragments: [],
    timestamp: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeMatch(overrides: Partial<MatchCandidate> = {}): MatchCandidate {
  return {
    id: 'match-001',
    offering_id: 'off-001',
    need_id: 'need-001',
    matched_terms: ['logo_design'],
    confidence: 0.85,
    explanation: 'Logo design match',
    ...overrides,
  };
}

function makeFeedback(overrides: Partial<MatchFeedback> = {}): MatchFeedback {
  return {
    match_id: 'match-001',
    outcome: 'confirmed',
    timestamp: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.resetAllMocks();
});

describe('Store management', () => {
  it('createEmptyStore returns correct structure with empty arrays and current timestamp', () => {
    const before = new Date().toISOString();
    const store = createEmptyStore();
    const after = new Date().toISOString();

    expect(store.extractions).toEqual([]);
    expect(store.matches).toEqual([]);
    expect(store.feedback).toEqual([]);
    expect(store.term_stats).toEqual({});
    expect(store.last_updated).toBeDefined();
    // Timestamp should be between before and after
    expect(store.last_updated >= before).toBe(true);
    expect(store.last_updated <= after).toBe(true);
  });

  it('returns empty store when file does not exist', () => {
    mockExistsSync.mockReturnValue(false);

    const store = loadFeedbackStore('/fake/path.json');

    expect(mockExistsSync).toHaveBeenCalledWith('/fake/path.json');
    expect(store.extractions).toEqual([]);
    expect(store.matches).toEqual([]);
    expect(store.feedback).toEqual([]);
    expect(store.term_stats).toEqual({});
    expect(store.last_updated).toBeDefined();
  });

  it('loadFeedbackStore parses and returns existing store when file exists', () => {
    const existingStore: FeedbackStore = {
      extractions: [makeExtraction()],
      matches: [makeMatch()],
      feedback: [makeFeedback()],
      term_stats: {
        logo_design: {
          extraction_count: 1,
          match_count: 1,
          confirmation_count: 1,
          decline_count: 0,
        },
      },
      last_updated: '2026-01-01T00:00:00.000Z',
    };

    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(JSON.stringify(existingStore));

    const store = loadFeedbackStore('/data/store.json');

    expect(mockExistsSync).toHaveBeenCalledWith('/data/store.json');
    expect(mockReadFileSync).toHaveBeenCalledWith('/data/store.json', 'utf-8');
    expect(store.extractions).toHaveLength(1);
    expect(store.matches).toHaveLength(1);
    expect(store.feedback).toHaveLength(1);
    expect(store.term_stats.logo_design.extraction_count).toBe(1);
  });

  it('saveFeedbackStore calls mkdirSync + writeFileSync with formatted JSON', () => {
    const store = createEmptyStore();

    // Directory does not exist yet
    mockExistsSync.mockReturnValue(false);

    saveFeedbackStore(store, '/data/feedback/store.json');

    // Should create the directory recursively
    expect(mockMkdirSync).toHaveBeenCalledWith('/data/feedback', { recursive: true });

    // Should write formatted JSON
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      '/data/feedback/store.json',
      expect.any(String),
      'utf-8'
    );

    // Verify the written content is valid JSON with indentation
    const writtenContent = mockWriteFileSync.mock.calls[0][1] as string;
    const parsed = JSON.parse(writtenContent);
    expect(parsed.extractions).toEqual([]);
    // Content should be pretty-printed (2-space indent)
    expect(writtenContent).toContain('  ');
  });
});

describe('Recording', () => {
  it('recordExtraction pushes to store.extractions and increments extraction_count per term', () => {
    const store = createEmptyStore();
    const extraction = makeExtraction({
      extracted_terms: [
        { term_id: 'logo_design', confidence: 0.9, reasoning: 'Direct match' },
        { term_id: 'brand_guidelines', confidence: 0.7, reasoning: 'Related' },
      ],
    });

    recordExtraction(store, extraction);

    expect(store.extractions).toHaveLength(1);
    expect(store.extractions[0]).toBe(extraction);
    expect(store.term_stats.logo_design.extraction_count).toBe(1);
    expect(store.term_stats.brand_guidelines.extraction_count).toBe(1);

    // Record a second extraction with an overlapping term
    const extraction2 = makeExtraction({
      id: 'ext-002',
      extracted_terms: [
        { term_id: 'logo_design', confidence: 0.8, reasoning: 'Another match' },
      ],
    });
    recordExtraction(store, extraction2);

    expect(store.extractions).toHaveLength(2);
    expect(store.term_stats.logo_design.extraction_count).toBe(2);
    expect(store.term_stats.brand_guidelines.extraction_count).toBe(1);
  });

  it('recordMatch pushes to store.matches and increments match_count per term', () => {
    const store = createEmptyStore();
    const match = makeMatch({
      matched_terms: ['logo_design', 'pitch_deck'],
    });

    recordMatch(store, match);

    expect(store.matches).toHaveLength(1);
    expect(store.matches[0]).toBe(match);
    expect(store.term_stats.logo_design.match_count).toBe(1);
    expect(store.term_stats.pitch_deck.match_count).toBe(1);
  });

  it('recordFeedback confirmed increments confirmation_count', () => {
    const store = createEmptyStore();
    const match = makeMatch({ id: 'match-100', matched_terms: ['logo_design'] });
    store.matches.push(match);

    const feedback = makeFeedback({ match_id: 'match-100', outcome: 'confirmed' });
    recordFeedback(store, feedback);

    expect(store.feedback).toHaveLength(1);
    expect(store.term_stats.logo_design.confirmation_count).toBe(1);
    expect(store.term_stats.logo_design.decline_count).toBe(0);
  });

  it('recordFeedback declined increments decline_count', () => {
    const store = createEmptyStore();
    const match = makeMatch({ id: 'match-200', matched_terms: ['contract_review'] });
    store.matches.push(match);

    const feedback = makeFeedback({
      match_id: 'match-200',
      outcome: 'declined',
      decline_reason: 'poor_fit',
    });
    recordFeedback(store, feedback);

    expect(store.feedback).toHaveLength(1);
    expect(store.term_stats.contract_review.decline_count).toBe(1);
    expect(store.term_stats.contract_review.confirmation_count).toBe(0);
  });

  it('recordFeedback skipped does not change confirmation or decline counts', () => {
    const store = createEmptyStore();
    const match = makeMatch({ id: 'match-300', matched_terms: ['logo_design'] });
    store.matches.push(match);

    // Pre-populate term stats so we can verify they don't change
    store.term_stats.logo_design = {
      extraction_count: 1,
      match_count: 1,
      confirmation_count: 2,
      decline_count: 1,
    };

    const feedback = makeFeedback({ match_id: 'match-300', outcome: 'skipped' });
    recordFeedback(store, feedback);

    expect(store.feedback).toHaveLength(1);
    expect(store.term_stats.logo_design.confirmation_count).toBe(2);
    expect(store.term_stats.logo_design.decline_count).toBe(1);
  });
});

describe('Analytics', () => {
  it('getConfirmationRate returns confirmation / (confirmation + decline)', () => {
    const store = createEmptyStore();
    store.term_stats.logo_design = {
      extraction_count: 10,
      match_count: 5,
      confirmation_count: 3,
      decline_count: 1,
    };

    const rate = getConfirmationRate(store, 'logo_design');

    // 3 / (3 + 1) = 0.75
    expect(rate).toBe(0.75);
  });

  it('getConfirmationRate returns null when term has no matches', () => {
    const store = createEmptyStore();

    // Term doesn't exist at all
    expect(getConfirmationRate(store, 'nonexistent_term')).toBeNull();

    // Term exists but match_count is 0
    store.term_stats.logo_design = {
      extraction_count: 1,
      match_count: 0,
      confirmation_count: 0,
      decline_count: 0,
    };
    expect(getConfirmationRate(store, 'logo_design')).toBeNull();
  });

  it('getStoreSummary returns correct aggregated counts', () => {
    const store = createEmptyStore();

    // Add some data
    store.extractions.push(makeExtraction());
    store.extractions.push(makeExtraction({ id: 'ext-002' }));
    store.matches.push(makeMatch());
    store.matches.push(makeMatch({ id: 'match-002' }));
    store.feedback.push(makeFeedback({ outcome: 'confirmed' }));
    store.feedback.push(makeFeedback({ match_id: 'match-002', outcome: 'declined' }));
    store.feedback.push(makeFeedback({ match_id: 'match-003', outcome: 'skipped' }));
    store.term_stats = {
      logo_design: { extraction_count: 2, match_count: 1, confirmation_count: 1, decline_count: 0 },
      pitch_deck: { extraction_count: 1, match_count: 1, confirmation_count: 0, decline_count: 1 },
    };

    const summary = getStoreSummary(store);

    expect(summary.total_extractions).toBe(2);
    expect(summary.total_matches).toBe(2);
    expect(summary.total_feedback).toBe(3);
    expect(summary.confirmed_matches).toBe(1);
    expect(summary.declined_matches).toBe(1);
    expect(summary.skipped_matches).toBe(1);
    expect(summary.terms_seen).toBe(2);
  });
});
