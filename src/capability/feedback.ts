/**
 * Capability Translation System — Feedback Store
 *
 * Persists extraction results, matches, and feedback to JSON.
 * This data feeds the learning loop for term maturity progression.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import type {
  FeedbackStore,
  ExtractionResult,
  MatchCandidate,
  MatchFeedback,
  TermStats,
} from './types.js';

// ═══════════════════════════════════════════════════════════════════════════════
// Store Management
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create an empty feedback store.
 */
export function createEmptyStore(): FeedbackStore {
  return {
    extractions: [],
    matches: [],
    feedback: [],
    term_stats: {},
    last_updated: new Date().toISOString(),
  };
}

/**
 * Load feedback store from a JSON file.
 * Creates a new store if the file doesn't exist.
 *
 * @param path - Path to the JSON file
 * @returns The loaded or newly created store
 */
export function loadFeedbackStore(path: string): FeedbackStore {
  if (!existsSync(path)) {
    return createEmptyStore();
  }

  try {
    const content = readFileSync(path, 'utf-8');
    const store = JSON.parse(content) as FeedbackStore;

    // Ensure all required fields exist
    store.extractions = store.extractions ?? [];
    store.matches = store.matches ?? [];
    store.feedback = store.feedback ?? [];
    store.term_stats = store.term_stats ?? {};

    return store;
  } catch (error) {
    console.warn(`Warning: Could not load store from ${path}, creating new store`);
    return createEmptyStore();
  }
}

/**
 * Save feedback store to a JSON file.
 *
 * @param store - The store to save
 * @param path - Path to the JSON file
 */
export function saveFeedbackStore(store: FeedbackStore, path: string): void {
  // Ensure directory exists
  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  store.last_updated = new Date().toISOString();

  const content = JSON.stringify(store, null, 2);
  writeFileSync(path, content, 'utf-8');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Recording Functions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Record an extraction result in the store.
 * Updates term statistics for extracted terms.
 *
 * @param store - The store to update
 * @param extraction - The extraction result to record
 */
export function recordExtraction(
  store: FeedbackStore,
  extraction: ExtractionResult
): void {
  store.extractions.push(extraction);

  // Update term stats
  for (const term of extraction.extracted_terms) {
    if (!store.term_stats[term.term_id]) {
      store.term_stats[term.term_id] = {
        extraction_count: 0,
        match_count: 0,
        confirmation_count: 0,
        decline_count: 0,
      };
    }
    store.term_stats[term.term_id].extraction_count++;
  }
}

/**
 * Record a match in the store.
 * Updates term statistics for matched terms.
 *
 * @param store - The store to update
 * @param match - The match candidate to record
 */
export function recordMatch(store: FeedbackStore, match: MatchCandidate): void {
  store.matches.push(match);

  // Update term stats
  for (const termId of match.matched_terms) {
    if (!store.term_stats[termId]) {
      store.term_stats[termId] = {
        extraction_count: 0,
        match_count: 0,
        confirmation_count: 0,
        decline_count: 0,
      };
    }
    store.term_stats[termId].match_count++;
  }
}

/**
 * Record feedback on a match.
 * Updates term statistics based on outcome.
 *
 * @param store - The store to update
 * @param feedback - The feedback to record
 */
export function recordFeedback(store: FeedbackStore, feedback: MatchFeedback): void {
  store.feedback.push(feedback);

  // Find the associated match
  const match = store.matches.find((m) => m.id === feedback.match_id);
  if (!match) {
    return;
  }

  // Update term stats based on outcome
  for (const termId of match.matched_terms) {
    if (!store.term_stats[termId]) {
      store.term_stats[termId] = {
        extraction_count: 0,
        match_count: 0,
        confirmation_count: 0,
        decline_count: 0,
      };
    }

    if (feedback.outcome === 'confirmed') {
      store.term_stats[termId].confirmation_count++;
    } else if (feedback.outcome === 'declined') {
      store.term_stats[termId].decline_count++;
    }
    // 'skipped' doesn't affect stats
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Query Functions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get statistics for all terms.
 */
export function getTermStats(store: FeedbackStore): Record<string, TermStats> {
  return store.term_stats;
}

/**
 * Get statistics for a specific term.
 */
export function getTermStat(store: FeedbackStore, termId: string): TermStats | null {
  return store.term_stats[termId] ?? null;
}

/**
 * Calculate confirmation rate for a term.
 * Returns null if no matches exist for the term.
 */
export function getConfirmationRate(store: FeedbackStore, termId: string): number | null {
  const stats = store.term_stats[termId];
  if (!stats || stats.match_count === 0) {
    return null;
  }

  const totalFeedback = stats.confirmation_count + stats.decline_count;
  if (totalFeedback === 0) {
    return null;
  }

  return stats.confirmation_count / totalFeedback;
}

/**
 * Get summary statistics for the store.
 */
export function getStoreSummary(store: FeedbackStore): {
  total_extractions: number;
  total_matches: number;
  total_feedback: number;
  confirmed_matches: number;
  declined_matches: number;
  skipped_matches: number;
  terms_seen: number;
} {
  const feedbackCounts = store.feedback.reduce(
    (acc, f) => {
      acc[f.outcome]++;
      return acc;
    },
    { confirmed: 0, declined: 0, skipped: 0 }
  );

  return {
    total_extractions: store.extractions.length,
    total_matches: store.matches.length,
    total_feedback: store.feedback.length,
    confirmed_matches: feedbackCounts.confirmed,
    declined_matches: feedbackCounts.declined,
    skipped_matches: feedbackCounts.skipped,
    terms_seen: Object.keys(store.term_stats).length,
  };
}

/**
 * Format store summary for display.
 */
export function formatStoreSummary(store: FeedbackStore): string {
  const summary = getStoreSummary(store);
  const lines: string[] = [];

  lines.push('Store Summary:');
  lines.push(`  Extractions: ${summary.total_extractions}`);
  lines.push(`  Matches: ${summary.total_matches}`);
  lines.push(`  Feedback: ${summary.total_feedback}`);
  lines.push(`    Confirmed: ${summary.confirmed_matches}`);
  lines.push(`    Declined: ${summary.declined_matches}`);
  lines.push(`    Skipped: ${summary.skipped_matches}`);
  lines.push(`  Terms seen: ${summary.terms_seen}`);

  return lines.join('\n');
}
