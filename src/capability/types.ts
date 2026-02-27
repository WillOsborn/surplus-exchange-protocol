/**
 * Capability Translation System — Type Definitions
 *
 * Types for the capability extraction, matching, and feedback system.
 * This enables AI-powered translation between natural language descriptions
 * and structured capability terms.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Seed Vocabulary Types
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * A capability term in the seed vocabulary.
 *
 * Terms represent discrete capabilities that can be offered or needed.
 * They enable matching between differently-expressed surplus and needs.
 */
export interface TermDefinition {
  /** Unique identifier for the term (e.g., 'logo_design', 'contract_review') */
  id: string;

  /** Human-readable label (e.g., 'Logo Design', 'Contract Review') */
  label: string;

  /** Sector this term belongs to (e.g., 'creative', 'legal', 'transport') */
  sector: string;

  /** Alternative expressions that map to this term */
  synonyms: string[];

  /** Typical capacity required to deliver this output */
  typical_capacity: CapacityEstimate;
}

/**
 * Estimated capacity required for a capability output.
 */
export interface CapacityEstimate {
  /** Numeric amount */
  amount: number;

  /** Unit of measurement */
  unit: 'hours' | 'days' | 'sessions' | 'projects' | 'trips';

  /** How confident is this estimate */
  confidence: 'exact' | 'typical' | 'estimated' | 'variable';
}

// ═══════════════════════════════════════════════════════════════════════════════
// Extraction Types
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Result of extracting capability terms from natural language input.
 */
export interface ExtractionResult {
  /** Unique ID for this extraction */
  id: string;

  /** The original natural language input */
  input: string;

  /** Whether this came from an offering or a need */
  source_type: 'offering' | 'need';

  /** Terms extracted from the input */
  extracted_terms: ExtractedTerm[];

  /** Parts of the input that couldn't be mapped to known terms */
  unmatched_fragments: string[];

  /** When this extraction was performed */
  timestamp: string;
}

/**
 * A single term extracted from natural language.
 */
export interface ExtractedTerm {
  /** ID of the matched term from vocabulary */
  term_id: string;

  /** Confidence score (0-1) */
  confidence: number;

  /** Why this term was extracted */
  reasoning: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Matching Types
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * An offering with extracted capability terms.
 */
export interface ExtractedOffering {
  /** Unique ID for this offering */
  id: string;

  /** Original natural language description */
  description: string;

  /** Extraction result */
  extraction: ExtractionResult;
}

/**
 * A need with extracted capability terms.
 */
export interface ExtractedNeed {
  /** Unique ID for this need */
  id: string;

  /** Original natural language description */
  description: string;

  /** Extraction result */
  extraction: ExtractionResult;
}

/**
 * A candidate match between an offering and a need.
 */
export interface MatchCandidate {
  /** Unique ID for this match */
  id: string;

  /** ID of the matched offering */
  offering_id: string;

  /** ID of the matched need */
  need_id: string;

  /** Term IDs that connected them */
  matched_terms: string[];

  /** Overall confidence score (0-1) */
  confidence: number;

  /** Human-readable explanation of the match */
  explanation: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Feedback Types
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Feedback on a proposed match.
 */
export interface MatchFeedback {
  /** ID of the match this feedback is for */
  match_id: string;

  /** Whether the match was confirmed or declined */
  outcome: 'confirmed' | 'declined' | 'skipped';

  /** If declined, why */
  decline_reason?: 'poor_fit' | 'trust_concern' | 'timing' | 'other';

  /** Optional freeform notes */
  notes?: string;

  /** When this feedback was recorded */
  timestamp: string;
}

/**
 * Aggregated statistics for a term.
 */
export interface TermStats {
  /** How many times this term was extracted */
  extraction_count: number;

  /** How many times this term was part of a match */
  match_count: number;

  /** How many matches involving this term were confirmed */
  confirmation_count: number;

  /** How many matches involving this term were declined */
  decline_count: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Store Types
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * The feedback store — persisted to JSON.
 */
export interface FeedbackStore {
  /** All extractions performed */
  extractions: ExtractionResult[];

  /** All matches found */
  matches: MatchCandidate[];

  /** All feedback recorded */
  feedback: MatchFeedback[];

  /** Aggregated term statistics */
  term_stats: Record<string, TermStats>;

  /** When the store was last updated */
  last_updated: string;
}
