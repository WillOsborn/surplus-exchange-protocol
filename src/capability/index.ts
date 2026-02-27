/**
 * SEP Capability Translation System
 *
 * AI-powered translation between natural language descriptions and structured
 * capability terms. Enables matching between differently-expressed surplus and needs.
 *
 * @example
 * ```typescript
 * import {
 *   extractTerms,
 *   findMatches,
 *   loadFeedbackStore,
 *   saveFeedbackStore,
 *   recordExtraction,
 *   recordMatch,
 *   recordFeedback,
 * } from './capability/index.js';
 *
 * // Extract terms from natural language
 * const offeringExtraction = await extractTerms(
 *   "I'm a designer with 20 hours spare",
 *   "offering",
 *   apiKey
 * );
 *
 * // Find matches
 * const matches = findMatches(need, [offering]);
 *
 * // Record feedback
 * recordFeedback(store, { match_id: match.id, outcome: 'confirmed', ... });
 * ```
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export type {
  // Vocabulary types
  TermDefinition,
  CapacityEstimate,
  // Extraction types
  ExtractionResult,
  ExtractedTerm,
  // Matching types
  ExtractedOffering,
  ExtractedNeed,
  MatchCandidate,
  // Feedback types
  MatchFeedback,
  TermStats,
  FeedbackStore,
} from './types.js';

// ═══════════════════════════════════════════════════════════════════════════════
// Seed Vocabulary
// ═══════════════════════════════════════════════════════════════════════════════

export {
  SEED_VOCABULARY,
  SEED_VOCABULARY_MAP,
  getTermsBySector,
  getSectors,
  formatVocabularyForPrompt,
} from './seed-vocabulary.js';

// ═══════════════════════════════════════════════════════════════════════════════
// Extraction
// ═══════════════════════════════════════════════════════════════════════════════

export { extractTerms, formatExtractionResult } from './extractor.js';

// ═══════════════════════════════════════════════════════════════════════════════
// Matching
// ═══════════════════════════════════════════════════════════════════════════════

export {
  findMatches,
  hasTermOverlap,
  getExtractionSectors,
  isCrossSectorMatch,
  formatMatchCandidate,
} from './matcher.js';

// ═══════════════════════════════════════════════════════════════════════════════
// Feedback Store
// ═══════════════════════════════════════════════════════════════════════════════

export {
  createEmptyStore,
  loadFeedbackStore,
  saveFeedbackStore,
  recordExtraction,
  recordMatch,
  recordFeedback,
  getTermStats,
  getTermStat,
  getConfirmationRate,
  getStoreSummary,
  formatStoreSummary,
} from './feedback.js';
