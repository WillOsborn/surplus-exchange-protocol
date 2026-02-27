/**
 * Trust Calculator Module
 *
 * Computes trust scores for participants in the Surplus Exchange Protocol.
 * Trust scores are composite values derived from satisfaction history,
 * network position, and recent activity patterns.
 *
 * The scoring system is designed to balance multiple factors:
 * - Reliability: How consistently a participant fulfils their commitments
 * - Experience: Depth and duration of participation in the network
 * - Network Strength: Quality and diversity of connections
 * - Recency: How actively engaged the participant is currently
 */

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Satisfaction history for exchanges in a specific role.
 */
export interface RoleSatisfaction {
  /** Total number of exchanges in this role */
  total: number;
  /** Exchanges marked as satisfactory by the counterparty */
  satisfied: number;
  /** Exchanges that resulted in a dispute */
  disputed: number;
}

/**
 * Input data required to compute a participant's trust score.
 */
export interface TrustInput {
  /** Unique identifier for the participant */
  participantId: string;

  /** Historical satisfaction data from exchanges */
  satisfactionHistory: {
    /** Satisfaction when acting as the provider of goods/services */
    asProvider: RoleSatisfaction;
    /** Satisfaction when acting as the recipient of goods/services */
    asRecipient: RoleSatisfaction;
  };

  /** Information about the participant's position in the network */
  networkPosition: {
    /** Number of unique exchange partners */
    partnerCount: number;
    /** Partners with whom 2 or more exchanges have occurred */
    repeatPartners: number;
    /** Days since the participant's first exchange */
    networkAge: number;
    /** Number of active vouches received from other participants */
    vouchesReceived: number;
    /** Number of vouches this participant has extended to others */
    vouchesGiven: number;
  };

  /** Activity patterns in recent time periods */
  recentActivity: {
    /** Number of exchanges completed in the last 30 days */
    last30Days: number;
    /** Number of exchanges completed in the last 90 days */
    last90Days: number;
    /** Days elapsed since the most recent exchange */
    daysSinceLastExchange: number;
  };
}

/**
 * The computed trust score with component breakdown.
 */
export interface TrustScore {
  /** Composite trust score from 0 to 1 */
  overall: number;

  /** Individual component scores, each from 0 to 1 */
  components: {
    /** Satisfaction rate across exchanges */
    reliability: number;
    /** Volume and tenure in the network */
    experience: number;
    /** Quality of network connections */
    networkStrength: number;
    /** Recent engagement level */
    recency: number;
  };

  /** Confidence in the score based on data volume */
  confidence: 'low' | 'medium' | 'high';

  /** ISO 8601 timestamp when the score was computed */
  computedAt: string;
}

/**
 * Configuration options for trust score computation.
 * All weights should sum to 1.0 for the overall score to remain in [0, 1].
 */
export interface TrustCalculatorOptions {
  /** Weight applied to the reliability component (default: 0.40) */
  reliabilityWeight: number;
  /** Weight applied to the experience component (default: 0.25) */
  experienceWeight: number;
  /** Weight applied to the network strength component (default: 0.20) */
  networkStrengthWeight: number;
  /** Weight applied to the recency component (default: 0.15) */
  recencyWeight: number;

  /** Threshold for 'low' confidence (exchanges below this count) (default: 5) */
  lowConfidenceThreshold: number;
  /** Threshold for 'high' confidence (exchanges above this count) (default: 20) */
  highConfidenceThreshold: number;

  /** Maximum network age (in days) for experience calculation (default: 365) */
  maxNetworkAgeDays: number;

  /** Days after which recency score begins to decay significantly (default: 30) */
  recencyDecayStartDays: number;
  /** Days at which recency score reaches minimum (default: 180) */
  recencyDecayEndDays: number;
}

// ============================================================================
// Default Configuration
// ============================================================================

/**
 * Default options for trust score computation.
 * These values have been chosen to balance the various factors appropriately
 * for typical surplus exchange scenarios.
 */
export const DEFAULT_OPTIONS: TrustCalculatorOptions = {
  reliabilityWeight: 0.40,
  experienceWeight: 0.25,
  networkStrengthWeight: 0.20,
  recencyWeight: 0.15,

  lowConfidenceThreshold: 5,
  highConfidenceThreshold: 20,

  maxNetworkAgeDays: 365,

  recencyDecayStartDays: 30,
  recencyDecayEndDays: 180,
};

// ============================================================================
// Component Calculation Functions
// ============================================================================

/**
 * Calculates the reliability component based on satisfaction rates.
 *
 * The reliability score is a weighted average of satisfaction rates in
 * provider and recipient roles, where the weights are proportional to
 * the number of exchanges in each role.
 *
 * @param satisfactionHistory - The participant's satisfaction history
 * @returns A score from 0 to 1 representing reliability
 */
function calculateReliability(
  satisfactionHistory: TrustInput['satisfactionHistory']
): number {
  const { asProvider, asRecipient } = satisfactionHistory;

  const providerTotal = asProvider.total;
  const recipientTotal = asRecipient.total;
  const totalExchanges = providerTotal + recipientTotal;

  // No exchanges means no data on reliability - return neutral score
  if (totalExchanges === 0) {
    return 0.5;
  }

  // Calculate satisfaction rates for each role
  // Note: disputed exchanges are considered unsatisfactory
  const providerSatisfactionRate =
    providerTotal > 0 ? asProvider.satisfied / providerTotal : 0;
  const recipientSatisfactionRate =
    recipientTotal > 0 ? asRecipient.satisfied / recipientTotal : 0;

  // Weight by volume in each role
  const weightedScore =
    (providerSatisfactionRate * providerTotal +
      recipientSatisfactionRate * recipientTotal) /
    totalExchanges;

  return clamp(weightedScore, 0, 1);
}

/**
 * Calculates the experience component based on exchange volume and tenure.
 *
 * Uses logarithmic scaling for exchange count to prevent runaway scores
 * from high-volume participants, combined with network age up to a cap.
 *
 * @param satisfactionHistory - Used to derive total exchange count
 * @param networkPosition - Contains network age information
 * @param options - Calculator configuration options
 * @returns A score from 0 to 1 representing experience
 */
function calculateExperience(
  satisfactionHistory: TrustInput['satisfactionHistory'],
  networkPosition: TrustInput['networkPosition'],
  options: TrustCalculatorOptions
): number {
  const totalExchanges =
    satisfactionHistory.asProvider.total + satisfactionHistory.asRecipient.total;

  // Volume score: logarithmic scaling
  // log10(1) = 0, log10(10) = 1, log10(100) = 2
  // We normalise so that ~100 exchanges gives a score of ~1.0
  const volumeScore =
    totalExchanges > 0 ? Math.min(Math.log10(totalExchanges + 1) / 2, 1) : 0;

  // Tenure score: linear up to the cap
  const tenureScore = Math.min(
    networkPosition.networkAge / options.maxNetworkAgeDays,
    1
  );

  // Combine volume (60%) and tenure (40%)
  const experienceScore = volumeScore * 0.6 + tenureScore * 0.4;

  return clamp(experienceScore, 0, 1);
}

/**
 * Calculates the network strength component based on connections and vouches.
 *
 * Considers:
 * - Partner diversity: Having many different exchange partners
 * - Repeat partnerships: Indication of trusted, ongoing relationships
 * - Vouches received: Explicit endorsements from other participants
 *
 * @param networkPosition - Network position data
 * @returns A score from 0 to 1 representing network strength
 */
function calculateNetworkStrength(
  networkPosition: TrustInput['networkPosition']
): number {
  const { partnerCount, repeatPartners, vouchesReceived } = networkPosition;

  // Partner diversity: logarithmic scaling, ~20 partners approaches 1.0
  const diversityScore =
    partnerCount > 0 ? Math.min(Math.log10(partnerCount + 1) / 1.3, 1) : 0;

  // Repeat partner ratio: what proportion of partners are repeat partners
  const repeatRatio = partnerCount > 0 ? repeatPartners / partnerCount : 0;

  // Vouches: logarithmic scaling, ~10 vouches approaches 1.0
  const vouchScore =
    vouchesReceived > 0 ? Math.min(Math.log10(vouchesReceived + 1) / 1.0, 1) : 0;

  // Combine: diversity (40%), repeat ratio (30%), vouches (30%)
  const networkScore =
    diversityScore * 0.4 + repeatRatio * 0.3 + vouchScore * 0.3;

  return clamp(networkScore, 0, 1);
}

/**
 * Calculates the recency component based on recent activity patterns.
 *
 * Combines:
 * - Decay based on days since last exchange
 * - Boost for recent activity volume
 *
 * @param recentActivity - Recent activity data
 * @param options - Calculator configuration options
 * @returns A score from 0 to 1 representing recency
 */
function calculateRecency(
  recentActivity: TrustInput['recentActivity'],
  options: TrustCalculatorOptions
): number {
  const { last30Days, last90Days, daysSinceLastExchange } = recentActivity;

  // Decay score based on days since last exchange
  // Full score if within decay start, linear decay to minimum after decay end
  let decayScore: number;
  if (daysSinceLastExchange <= options.recencyDecayStartDays) {
    decayScore = 1.0;
  } else if (daysSinceLastExchange >= options.recencyDecayEndDays) {
    decayScore = 0.2; // Minimum floor - don't completely penalise inactive participants
  } else {
    // Linear decay between start and end
    const decayRange = options.recencyDecayEndDays - options.recencyDecayStartDays;
    const daysIntoDecay = daysSinceLastExchange - options.recencyDecayStartDays;
    decayScore = 1.0 - (daysIntoDecay / decayRange) * 0.8;
  }

  // Activity boost based on recent exchange volume
  // Having multiple exchanges in recent periods indicates active engagement
  const activityBoost = Math.min(
    (last30Days * 0.1 + last90Days * 0.03),
    0.3
  );

  // Combine decay score with activity boost
  const recencyScore = Math.min(decayScore + activityBoost, 1.0);

  return clamp(recencyScore, 0, 1);
}

/**
 * Determines confidence level based on total exchange count.
 *
 * @param totalExchanges - Total number of completed exchanges
 * @param options - Calculator configuration options
 * @returns Confidence level: 'low', 'medium', or 'high'
 */
function determineConfidence(
  totalExchanges: number,
  options: TrustCalculatorOptions
): 'low' | 'medium' | 'high' {
  if (totalExchanges < options.lowConfidenceThreshold) {
    return 'low';
  }
  if (totalExchanges > options.highConfidenceThreshold) {
    return 'high';
  }
  return 'medium';
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clamps a value to the specified range.
 *
 * @param value - The value to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns The clamped value
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Rounds a number to the specified number of decimal places.
 *
 * @param value - The value to round
 * @param decimals - Number of decimal places (default: 4)
 * @returns The rounded value
 */
function roundTo(value: number, decimals: number = 4): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ============================================================================
// Main Export
// ============================================================================

/**
 * Computes a trust score for a participant based on their exchange history,
 * network position, and recent activity.
 *
 * The overall score is a weighted combination of four components:
 * - Reliability (40%): Satisfaction rate across exchanges
 * - Experience (25%): Volume and tenure in the network
 * - Network Strength (20%): Quality of connections and vouches
 * - Recency (15%): Recent engagement level
 *
 * @param input - The participant data to evaluate
 * @param options - Optional configuration to customise scoring weights and thresholds
 * @returns A TrustScore object with the overall score, component breakdown, and confidence level
 *
 * @example
 * ```typescript
 * const input: TrustInput = {
 *   participantId: 'participant-123',
 *   satisfactionHistory: {
 *     asProvider: { total: 15, satisfied: 14, disputed: 1 },
 *     asRecipient: { total: 12, satisfied: 11, disputed: 0 },
 *   },
 *   networkPosition: {
 *     partnerCount: 8,
 *     repeatPartners: 3,
 *     networkAge: 120,
 *     vouchesReceived: 2,
 *     vouchesGiven: 1,
 *   },
 *   recentActivity: {
 *     last30Days: 2,
 *     last90Days: 5,
 *     daysSinceLastExchange: 12,
 *   },
 * };
 *
 * const score = computeTrustScore(input);
 * console.log(score.overall); // e.g., 0.7823
 * console.log(score.confidence); // 'high'
 * ```
 */
export function computeTrustScore(
  input: TrustInput,
  options: Partial<TrustCalculatorOptions> = {}
): TrustScore {
  // Merge provided options with defaults
  const config: TrustCalculatorOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // Calculate individual components
  const reliability = calculateReliability(input.satisfactionHistory);
  const experience = calculateExperience(
    input.satisfactionHistory,
    input.networkPosition,
    config
  );
  const networkStrength = calculateNetworkStrength(input.networkPosition);
  const recency = calculateRecency(input.recentActivity, config);

  // Compute weighted overall score
  const overall =
    reliability * config.reliabilityWeight +
    experience * config.experienceWeight +
    networkStrength * config.networkStrengthWeight +
    recency * config.recencyWeight;

  // Determine confidence based on total exchanges
  const totalExchanges =
    input.satisfactionHistory.asProvider.total +
    input.satisfactionHistory.asRecipient.total;
  const confidence = determineConfidence(totalExchanges, config);

  return {
    overall: roundTo(overall),
    components: {
      reliability: roundTo(reliability),
      experience: roundTo(experience),
      networkStrength: roundTo(networkStrength),
      recency: roundTo(recency),
    },
    confidence,
    computedAt: new Date().toISOString(),
  };
}
