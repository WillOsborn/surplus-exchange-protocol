/**
 * Match Scoring Module for the Surplus Exchange Protocol
 *
 * Scores how well an offering matches a need using simple keyword/category
 * matching (Phase 1 - no AI). Provides breakdown across multiple dimensions
 * to explain match quality to participants.
 */

/**
 * Common words to exclude from keyword extraction.
 * These words don't contribute to semantic matching.
 */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'needs',
  'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how',
  'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'just', 'also', 'now', 'any', 'our', 'your', 'their', 'its', 'my',
]);

/**
 * Breakdown of individual scoring dimensions.
 */
export interface MatchScoreBreakdown {
  /** Keyword/description overlap score (0-1) */
  semantic: number;
  /** Does capacity cover need? (0-1) */
  capacity: number;
  /** Timing alignment score (0-1) */
  timing: number;
  /** Location compatibility score (0-1) */
  geographic: number;
  /** Trust threshold met score (0-1) */
  trust: number;
  /** Surplus time sensitivity alignment (0-1) */
  surplusSensitivity: number;
  /** Relationship diversity bonus (0-1) */
  diversity: number;
  /** Sector overlap (0-1) */
  sector: number;
}

/**
 * Complete match score with overall score, breakdown, and explanations.
 */
export interface MatchScore {
  /** Weighted combination of all scores (0-1) */
  overall: number;
  /** Individual dimension scores */
  breakdown: MatchScoreBreakdown;
  /** Human-readable explanations for the match */
  reasons: string[];
}

/**
 * Timing constraints for an offering.
 */
export interface OfferingTimingConstraint {
  /** Earliest date the offering becomes available */
  availableFrom?: string;
  /** Latest date the offering is available */
  availableUntil?: string;
}

/**
 * Constraints on an offering.
 */
export interface OfferingConstraints {
  /** Geographic regions where offering is available */
  geographic?: string[];
  /** Timing availability */
  timing?: OfferingTimingConstraint;
  /** Minimum engagement required (e.g., '4 hours minimum') */
  minimumEngagement?: string;
}

/**
 * An offering to be matched against a need.
 */
export interface Offering {
  /** Unique identifier */
  id: string;
  /** Category of surplus (service, physical_good, access, space) */
  type: string;
  /** Short human-readable title */
  title: string;
  /** Detailed description */
  description: string;
  /** Capability outputs this offering can provide */
  capabilities: string[];
  /** Constraints on the offering */
  constraints: OfferingConstraints;
  /** Surplus time sensitivity — how quickly this surplus loses value */
  surplusTimeSensitivity?: 'none' | 'weeks' | 'days' | 'hours';
  /** Sector tags for sector-based matching */
  sectorTags?: string[];
}

/**
 * Geographic constraints for a need.
 */
export interface NeedGeographicConstraint {
  /** Regions from which offerings are acceptable */
  acceptedRegions?: string[];
}

/**
 * Timing constraints for a need.
 */
export interface NeedTimingConstraint {
  /** Latest acceptable fulfilment date */
  neededBy?: string;
}

/**
 * Constraints on a need.
 */
export interface NeedConstraints {
  /** Geographic constraints */
  geographic?: NeedGeographicConstraint;
  /** Timing constraints */
  timing?: NeedTimingConstraint;
}

/**
 * A need to be matched against offerings.
 */
export interface Need {
  /** Unique identifier */
  id: string;
  /** Category of need (service, physical_good, access, space) */
  type: string;
  /** Short human-readable title */
  title: string;
  /** Detailed description */
  description: string;
  /** Capability outputs that would fulfil this need */
  explicitMatches: string[];
  /** Constraints on acceptable offerings */
  constraints: NeedConstraints;
  /** Sector tags for sector-based matching */
  sectorTags?: string[];
  /** Whether the need has a tight deadline */
  urgentDeadline?: boolean;
}

/**
 * Input for the match scoring function.
 */
export interface MatchInput {
  /** The offering being evaluated */
  offering: Offering;
  /** The need being matched against */
  need: Need;
  /** Trust score of the provider (0-1) */
  providerTrustScore: number;
  /** Minimum trust score required by the recipient (0-1) */
  recipientMinTrust: number;
  /** Whether these participants have exchanged before */
  existingPartnership?: boolean;
  /** Reference date (ISO) for judging expiry; omit to judge only against the deadline */
  asOf?: string;
}

/**
 * Splits a term into lowercase alphanumeric tokens ("UK - London" → uk, london).
 */
function tokenise(term: string): string[] {
  return term.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

/**
 * Whether two terms match: every token of one appears in the other.
 * "design" matches "logo_design" and "UK" matches "UK - London",
 * but "ai" does not match "email" and "UK" does not match "Ukraine".
 */
export function termsMatch(a: string, b: string): boolean {
  const tokensA = tokenise(a);
  const tokensB = tokenise(b);
  if (tokensA.length === 0 || tokensB.length === 0) return false;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  return tokensA.every((t) => setB.has(t)) || tokensB.every((t) => setA.has(t));
}

/**
 * Extracts meaningful keywords from text for semantic matching.
 *
 * @param text - The text to extract keywords from
 * @returns Array of lowercase keywords with stop words removed
 */
export function extractKeywords(text: string): string[] {
  if (!text) {
    return [];
  }

  // Lowercase and split on whitespace/punctuation
  const words = text
    .toLowerCase()
    .split(/[\s,.;:!?'"()\[\]{}<>\/\\|@#$%^&*+=~`-]+/)
    .filter(word => word.length > 0);

  // Remove stop words and very short words
  const keywords = words.filter(word => {
    return word.length > 2 && !STOP_WORDS.has(word);
  });

  // Remove duplicates while preserving order
  return [...new Set(keywords)];
}

/**
 * Calculates the semantic similarity score between offering and need.
 *
 * Considers:
 * - Type matching (0.3 weight)
 * - Keyword overlap in title/description (0.4 weight)
 * - Capability matching (0.3 weight)
 *
 * @param offering - The offering to evaluate
 * @param need - The need to match against
 * @returns Score between 0 and 1, with explanatory reasons
 */
function calculateSemanticScore(
  offering: Offering,
  need: Need
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let typeScore = 0;
  let keywordScore = 0;
  let capabilityScore = 0;

  // Type matching (0.3 weight)
  if (offering.type === need.type) {
    typeScore = 1.0;
    reasons.push(`Type match: both are '${offering.type}'`);
  } else {
    reasons.push(`Type mismatch: offering is '${offering.type}', need is '${need.type}'`);
  }

  // Keyword overlap (0.4 weight)
  const offeringText = `${offering.title} ${offering.description}`;
  const needText = `${need.title} ${need.description}`;
  const offeringKeywords = new Set(extractKeywords(offeringText));
  const needKeywords = extractKeywords(needText);

  if (needKeywords.length > 0 && offeringKeywords.size > 0) {
    const matchingKeywords = needKeywords.filter(kw => offeringKeywords.has(kw));
    keywordScore = matchingKeywords.length / needKeywords.length;

    if (matchingKeywords.length > 0) {
      const displayKeywords = matchingKeywords.slice(0, 5).join(', ');
      const suffix = matchingKeywords.length > 5 ? '...' : '';
      reasons.push(`Keyword matches: ${displayKeywords}${suffix}`);
    } else {
      reasons.push('No keyword overlap in descriptions');
    }
  } else {
    // If no keywords to compare, neutral score
    keywordScore = 0.5;
    reasons.push('Insufficient text for keyword comparison');
  }

  // Capability matching (0.3 weight)
  const offeringCapabilities = new Set(
    offering.capabilities.map(c => c.toLowerCase())
  );
  const needMatches = need.explicitMatches.map(m => m.toLowerCase());

  if (needMatches.length > 0 && offeringCapabilities.size > 0) {
    const matchingCapabilities = needMatches.filter(match =>
      [...offeringCapabilities].some(cap => termsMatch(cap, match))
    );
    capabilityScore = matchingCapabilities.length / needMatches.length;

    if (matchingCapabilities.length > 0) {
      reasons.push(`Capability matches: ${matchingCapabilities.join(', ')}`);
    } else {
      reasons.push('No capability matches found');
    }
  } else if (needMatches.length === 0) {
    // No explicit matches specified - neutral score
    capabilityScore = 0.5;
    reasons.push('No explicit capability matches specified in need');
  } else {
    reasons.push('Offering has no listed capabilities');
  }

  // Weighted combination
  const score = typeScore * 0.3 + keywordScore * 0.4 + capabilityScore * 0.3;

  return { score, reasons };
}

/**
 * Calculates the capacity score.
 *
 * For Phase 1, we assume capacity is always sufficient if an offering exists.
 * This will be refined in future versions to consider quantity, effort, etc.
 *
 * @returns Score of 1.0 with explanation
 */
function calculateCapacityScore(): { score: number; reasons: string[] } {
  return {
    score: 1.0,
    reasons: ['Capacity assumed sufficient (Phase 1)'],
  };
}

/**
 * Calculates the timing alignment score.
 *
 * Scoring rules:
 * - Offering expired before the reference date (asOf): 0.0
 * - Offering only available after the need's deadline: 0.0
 * - Otherwise: 1.0 (availability that outlasts the deadline is not penalised)
 *
 * @param offering - The offering with timing constraints
 * @param need - The need with timing requirements
 * @param asOf - Optional reference date for judging expiry
 * @returns Score between 0 and 1, with explanatory reasons
 */
function calculateTimingScore(
  offering: Offering,
  need: Need,
  asOf?: string
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const offeringTiming = offering.constraints.timing;
  const needTiming = need.constraints.timing;

  // An offering that ended before the reference date can't be used at all
  if (asOf && offeringTiming?.availableUntil) {
    if (new Date(offeringTiming.availableUntil) < new Date(asOf)) {
      reasons.push(`Offering expired on ${offeringTiming.availableUntil}`);
      return { score: 0.0, reasons };
    }
  }

  if (!needTiming?.neededBy) {
    reasons.push('No timing deadline specified');
    return { score: 1.0, reasons };
  }

  // Usable if the availability window opens on or before the deadline
  if (offeringTiming?.availableFrom) {
    if (new Date(offeringTiming.availableFrom) > new Date(needTiming.neededBy)) {
      reasons.push(
        `Offering not available until ${offeringTiming.availableFrom}, ` +
        `but needed by ${needTiming.neededBy}`
      );
      return { score: 0.0, reasons };
    }
  }

  reasons.push('Offering available before the deadline');
  return { score: 1.0, reasons };
}

/**
 * Calculates the geographic compatibility score.
 *
 * Uses whole-token matching (see termsMatch), so "UK" matches "UK - London" but not "Ukraine".
 *
 * Scoring rules:
 * - No constraints on either side: 1.0
 * - Regions overlap: 1.0
 * - No overlap: 0.0 (deal-breaker)
 *
 * @param offering - The offering with geographic constraints
 * @param need - The need with geographic requirements
 * @returns Score of 0 or 1, with explanatory reasons
 */
function calculateGeographicScore(
  offering: Offering,
  need: Need
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const offeringRegions = offering.constraints.geographic;
  const needRegions = need.constraints.geographic?.acceptedRegions;

  // No constraints - universal compatibility
  if (!offeringRegions || offeringRegions.length === 0) {
    reasons.push('Offering has no geographic restrictions');
    return { score: 1.0, reasons };
  }

  if (!needRegions || needRegions.length === 0) {
    reasons.push('Need has no geographic requirements');
    return { score: 1.0, reasons };
  }

  // Check for overlap (case-insensitive, whole-token match)
  const offeringRegionsLower = offeringRegions.map(r => r.toLowerCase());
  const needRegionsLower = needRegions.map(r => r.toLowerCase());

  const matchingRegions: string[] = [];

  for (const needRegion of needRegionsLower) {
    for (const offeringRegion of offeringRegionsLower) {
      if (termsMatch(needRegion, offeringRegion)) {
        // Find original casing for display
        const originalNeed = needRegions.find(
          r => r.toLowerCase() === needRegion
        );
        if (originalNeed && !matchingRegions.includes(originalNeed)) {
          matchingRegions.push(originalNeed);
        }
      }
    }
  }

  if (matchingRegions.length > 0) {
    reasons.push(`Geographic match: ${matchingRegions.join(', ')}`);
    return { score: 1.0, reasons };
  }

  reasons.push(
    `Geographic mismatch: offering serves ${offeringRegions.join(', ')}, ` +
    `need requires ${needRegions.join(', ')}`
  );
  return { score: 0.0, reasons };
}

/**
 * Calculates the trust score.
 *
 * This is a hard constraint - if trust threshold is not met, the match fails.
 *
 * @param providerTrustScore - The provider's trust score (0-1)
 * @param recipientMinTrust - The minimum trust required by recipient (0-1)
 * @returns Score of 0 or 1, with explanatory reasons
 */
function calculateTrustScore(
  providerTrustScore: number,
  recipientMinTrust: number
): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  if (!Number.isFinite(providerTrustScore)) {
    reasons.push('Provider trust score unknown — treated as untrusted');
    return { score: 0.0, reasons };
  }

  if (providerTrustScore >= recipientMinTrust) {
    reasons.push(
      `Trust threshold met: provider score ${providerTrustScore.toFixed(2)} ` +
      `>= required ${recipientMinTrust.toFixed(2)}`
    );
    return { score: 1.0, reasons };
  }

  reasons.push(
    `Trust threshold not met: provider score ${providerTrustScore.toFixed(2)} ` +
    `< required ${recipientMinTrust.toFixed(2)}`
  );
  return { score: 0.0, reasons };
}

/**
 * Calculates surplus time sensitivity alignment.
 *
 * Time-sensitive surplus that matches an urgent need scores highest.
 * Non-sensitive surplus scores neutral (0.5).
 */
function scoreSurplusSensitivity(
  offering: Offering,
  need: Need
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const sensitivity = offering.surplusTimeSensitivity ?? 'none';

  if (sensitivity === 'none') {
    reasons.push('No time pressure on surplus');
    return { score: 0.5, reasons }; // Neutral
  }

  // Time-sensitive surplus gets a boost, especially if need is also urgent
  const sensitivityBoost: Record<string, number> = {
    hours: 1.0,
    days: 0.8,
    weeks: 0.6,
  };

  let score = sensitivityBoost[sensitivity] ?? 0.5;

  if (need.urgentDeadline) {
    reasons.push(`Time-sensitive surplus (${sensitivity}) matches urgent need`);
  } else {
    score *= 0.7; // Slight reduction if need isn't urgent
    reasons.push(`Time-sensitive surplus (${sensitivity}), need not urgent`);
  }

  return { score, reasons };
}

/**
 * Calculates relationship diversity score.
 *
 * Prefers new partner connections over repeat exchanges.
 */
function scoreDiversity(
  input: MatchInput
): { score: number; reasons: string[] } {
  if (input.existingPartnership) {
    return { score: 0.3, reasons: ['Existing partnership — lower diversity value'] };
  }
  return { score: 1.0, reasons: ['New partnership — high diversity value'] };
}

/**
 * Calculates sector overlap score.
 *
 * Compares sector tags between offering and need using substring matching.
 */
function scoreSectorOverlap(
  offering: Offering,
  need: Need
): { score: number; reasons: string[] } {
  const offeringSectors = new Set(
    (offering.sectorTags ?? []).map(s => s.toLowerCase())
  );
  const needSectors = (need.sectorTags ?? []).map(s => s.toLowerCase());

  if (offeringSectors.size === 0 || needSectors.length === 0) {
    return { score: 0.5, reasons: ['No sector data — neutral'] };
  }

  const matched = needSectors.filter(s =>
    offeringSectors.has(s) ||
    [...offeringSectors].some(os => termsMatch(os, s))
  );

  if (matched.length === 0) {
    return { score: 0.0, reasons: ['No sector overlap'] };
  }

  const score = matched.length / needSectors.length;
  return { score, reasons: [`Sector overlap: ${matched.join(', ')}`] };
}

/**
 * Scores how well an offering matches a need.
 *
 * Calculates scores across five dimensions (semantic, capacity, timing,
 * geographic, trust) and combines them into an overall score.
 *
 * Trust and geographic scores are deal-breakers - if either is 0, the
 * overall score is 0.
 *
 * @param input - The match input containing offering, need, and trust info
 * @returns Complete match score with breakdown and explanations
 */
export function scoreMatch(input: MatchInput): MatchScore {
  const { offering, need, providerTrustScore, recipientMinTrust } = input;
  const allReasons: string[] = [];

  // Calculate individual scores
  const semantic = calculateSemanticScore(offering, need);
  const capacity = calculateCapacityScore();
  const timing = calculateTimingScore(offering, need, input.asOf);
  const geographic = calculateGeographicScore(offering, need);
  const trust = calculateTrustScore(providerTrustScore, recipientMinTrust);
  const surplusSensitivity = scoreSurplusSensitivity(offering, need);
  const diversity = scoreDiversity(input);
  const sector = scoreSectorOverlap(offering, need);

  // Collect all reasons
  allReasons.push(...semantic.reasons);
  allReasons.push(...capacity.reasons);
  allReasons.push(...timing.reasons);
  allReasons.push(...geographic.reasons);
  allReasons.push(...trust.reasons);
  allReasons.push(...surplusSensitivity.reasons);
  allReasons.push(...diversity.reasons);
  allReasons.push(...sector.reasons);

  // Build breakdown
  const breakdown: MatchScoreBreakdown = {
    semantic: semantic.score,
    capacity: capacity.score,
    timing: timing.score,
    geographic: geographic.score,
    trust: trust.score,
    surplusSensitivity: surplusSensitivity.score,
    diversity: diversity.score,
    sector: sector.score,
  };

  // Calculate overall score
  let overall: number;

  // Deal-breakers: trust and geographic
  if (trust.score === 0) {
    overall = 0;
    allReasons.unshift('DEAL-BREAKER: Trust threshold not met');
  } else if (geographic.score === 0) {
    overall = 0;
    allReasons.unshift('DEAL-BREAKER: Geographic incompatibility');
  } else {
    // Weighted combination of non-deal-breaker dimensions
    overall =
      semantic.score * 0.30 +
      timing.score * 0.15 +
      capacity.score * 0.10 +
      surplusSensitivity.score * 0.15 +
      diversity.score * 0.15 +
      sector.score * 0.15;
  }

  return {
    overall,
    breakdown,
    reasons: allReasons,
  };
}
