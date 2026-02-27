/**
 * Exposure limit enforcement for SEP.
 *
 * Manages risk by limiting how much value participants can have
 * outstanding at any time, graduated by trust tier.
 */

import type { TrustTier } from './tiers.js';

/**
 * Exposure limits for a participant.
 */
export interface ExposureLimits {
  /** Maximum value for a single exchange */
  maxSingleExchangeValue: number;
  /** Maximum total value outstanding (pending chains) */
  maxOutstandingValue: number;
  /** Maximum chain length participant can join */
  maxChainLength: number;
  /** Maximum concurrent active chains */
  maxConcurrentChains: number;
  /** Whether escrow is required for physical goods */
  requiresEscrow: boolean;
  /** Days of cooldown after a dispute */
  cooldownAfterDispute: number;
}

/**
 * Current exposure state for a participant.
 */
export interface CurrentExposure {
  /** Total value currently outstanding */
  outstandingValue: number;
  /** Number of active chains */
  activeChains: number;
  /** Value pending as provider (what they owe) */
  pendingAsProvider: number;
  /** Value pending as recipient (what they're owed) */
  pendingAsRecipient: number;
  /** Days since last dispute (null if never) */
  daysSinceLastDispute: number | null;
}

/**
 * Result of an exposure check.
 */
export interface ExposureCheck {
  /** Whether the proposed action is allowed */
  allowed: boolean;
  /** Reason if not allowed */
  reason?: string;
  /** Current exposure state */
  currentExposure: CurrentExposure;
  /** Remaining capacity */
  remainingCapacity: {
    /** Remaining value capacity */
    value: number;
    /** Remaining chain slots */
    chains: number;
  };
}

/**
 * Input for checking proposed exchange exposure.
 */
export interface ExposureCheckInput {
  /** Participant's trust tier */
  tier: TrustTier;
  /** Current exposure state */
  currentExposure: CurrentExposure;
  /** Proposed exchange value */
  proposedValue: number;
  /** Proposed chain length */
  proposedChainLength: number;
  /** Whether this involves physical goods */
  involvesPhysicalGoods: boolean;
}

/**
 * Default exposure limits by tier.
 *
 * Values are in abstract "exchange units" - actual values
 * would be determined by the specific exchange context.
 */
export const TIER_EXPOSURE_LIMITS: Record<TrustTier, ExposureLimits> = {
  newcomer: {
    maxSingleExchangeValue: 5,
    maxOutstandingValue: 5,
    maxChainLength: 2,      // Bilateral only
    maxConcurrentChains: 1,  // One at a time
    requiresEscrow: true,
    cooldownAfterDispute: 60,
  },
  probationary: {
    maxSingleExchangeValue: 10,
    maxOutstandingValue: 20,
    maxChainLength: 3,
    maxConcurrentChains: 2,
    requiresEscrow: true,
    cooldownAfterDispute: 30,
  },
  established: {
    maxSingleExchangeValue: 50,
    maxOutstandingValue: 150,
    maxChainLength: 5,
    maxConcurrentChains: 5,
    requiresEscrow: false,
    cooldownAfterDispute: 14,
  },
  anchor: {
    maxSingleExchangeValue: 200,
    maxOutstandingValue: 500,
    maxChainLength: 8,
    maxConcurrentChains: 10,
    requiresEscrow: false,
    cooldownAfterDispute: 7,
  },
};

/**
 * Get exposure limits for a trust tier.
 *
 * @param tier - The participant's trust tier
 * @param customLimits - Optional custom limit overrides
 * @returns Exposure limits for the tier
 */
export function getExposureLimits(
  tier: TrustTier,
  customLimits?: Partial<ExposureLimits>
): ExposureLimits {
  return {
    ...TIER_EXPOSURE_LIMITS[tier],
    ...customLimits,
  };
}

/**
 * Check if a proposed exchange is within exposure limits.
 *
 * @param input - The exposure check input
 * @returns Exposure check result
 */
export function checkExposure(input: ExposureCheckInput): ExposureCheck {
  const limits = getExposureLimits(input.tier);
  const reasons: string[] = [];

  // Check dispute cooldown
  if (input.currentExposure.daysSinceLastDispute !== null &&
      input.currentExposure.daysSinceLastDispute < limits.cooldownAfterDispute) {
    const daysRemaining = limits.cooldownAfterDispute - input.currentExposure.daysSinceLastDispute;
    reasons.push(`In dispute cooldown period (${daysRemaining} days remaining)`);
  }

  // Check single exchange value
  if (input.proposedValue > limits.maxSingleExchangeValue) {
    reasons.push(
      `Exchange value (${input.proposedValue}) exceeds single exchange limit (${limits.maxSingleExchangeValue})`
    );
  }

  // Check total outstanding value
  const newOutstanding = input.currentExposure.outstandingValue + input.proposedValue;
  if (newOutstanding > limits.maxOutstandingValue) {
    reasons.push(
      `Would exceed outstanding value limit (${newOutstanding} > ${limits.maxOutstandingValue})`
    );
  }

  // Check chain length
  if (input.proposedChainLength > limits.maxChainLength) {
    reasons.push(
      `Chain length (${input.proposedChainLength}) exceeds maximum (${limits.maxChainLength})`
    );
  }

  // Check concurrent chains
  const newChainCount = input.currentExposure.activeChains + 1;
  if (newChainCount > limits.maxConcurrentChains) {
    reasons.push(
      `Would exceed concurrent chain limit (${newChainCount} > ${limits.maxConcurrentChains})`
    );
  }

  // Calculate remaining capacity
  const remainingValue = Math.max(
    0,
    limits.maxOutstandingValue - input.currentExposure.outstandingValue
  );
  const remainingChains = Math.max(
    0,
    limits.maxConcurrentChains - input.currentExposure.activeChains
  );

  return {
    allowed: reasons.length === 0,
    reason: reasons.length > 0 ? reasons.join('; ') : undefined,
    currentExposure: input.currentExposure,
    remainingCapacity: {
      value: remainingValue,
      chains: remainingChains,
    },
  };
}

/**
 * Check if escrow is required for a proposed exchange.
 *
 * @param tier - Participant's trust tier
 * @param involvesPhysicalGoods - Whether exchange involves physical goods
 * @returns Whether escrow is required
 */
export function requiresEscrow(
  tier: TrustTier,
  involvesPhysicalGoods: boolean
): boolean {
  const limits = getExposureLimits(tier);

  // Probationary always requires escrow
  if (limits.requiresEscrow) {
    return true;
  }

  // Physical goods typically require escrow for all tiers
  // (can be overridden by network policy)
  if (involvesPhysicalGoods) {
    return true;
  }

  return false;
}

/**
 * Calculate how much value a participant can still commit.
 *
 * @param tier - Participant's trust tier
 * @param currentExposure - Current exposure state
 * @returns Maximum value that can be committed
 */
export function getAvailableCapacity(
  tier: TrustTier,
  currentExposure: CurrentExposure
): number {
  const limits = getExposureLimits(tier);

  // Check dispute cooldown
  if (currentExposure.daysSinceLastDispute !== null &&
      currentExposure.daysSinceLastDispute < limits.cooldownAfterDispute) {
    return 0;
  }

  // Check chain count
  if (currentExposure.activeChains >= limits.maxConcurrentChains) {
    return 0;
  }

  // Calculate value capacity
  const valueCapacity = limits.maxOutstandingValue - currentExposure.outstandingValue;

  // Cap at single exchange limit
  return Math.min(Math.max(0, valueCapacity), limits.maxSingleExchangeValue);
}

/**
 * Format exposure limits as a human-readable summary.
 */
export function summariseExposureLimits(tier: TrustTier): string {
  const limits = getExposureLimits(tier);

  return [
    `Exposure limits for ${tier} tier:`,
    `  Max single exchange: ${limits.maxSingleExchangeValue} units`,
    `  Max outstanding: ${limits.maxOutstandingValue} units`,
    `  Max chain length: ${limits.maxChainLength} participants`,
    `  Max concurrent chains: ${limits.maxConcurrentChains}`,
    `  Escrow required: ${limits.requiresEscrow ? 'Yes' : 'No (except physical goods)'}`,
    `  Dispute cooldown: ${limits.cooldownAfterDispute} days`,
  ].join('\n');
}

/**
 * Format current exposure as a human-readable summary.
 */
export function summariseCurrentExposure(
  tier: TrustTier,
  exposure: CurrentExposure
): string {
  const limits = getExposureLimits(tier);
  const available = getAvailableCapacity(tier, exposure);

  const lines = [
    `Current exposure (${tier} tier):`,
    `  Outstanding value: ${exposure.outstandingValue} / ${limits.maxOutstandingValue} units`,
    `  Active chains: ${exposure.activeChains} / ${limits.maxConcurrentChains}`,
    `  As provider: ${exposure.pendingAsProvider} units`,
    `  As recipient: ${exposure.pendingAsRecipient} units`,
    `  Available capacity: ${available} units`,
  ];

  if (exposure.daysSinceLastDispute !== null) {
    if (exposure.daysSinceLastDispute < limits.cooldownAfterDispute) {
      const remaining = limits.cooldownAfterDispute - exposure.daysSinceLastDispute;
      lines.push(`  COOLDOWN: ${remaining} days remaining`);
    } else {
      lines.push(`  Last dispute: ${exposure.daysSinceLastDispute} days ago (cooldown complete)`);
    }
  }

  return lines.join('\n');
}

/**
 * Validate that exposure limits configuration is consistent.
 *
 * Ensures probationary < established < anchor for all metrics.
 */
export function validateLimitsConfiguration(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const tiers: TrustTier[] = ['newcomer', 'probationary', 'established', 'anchor'];

  for (let i = 1; i < tiers.length; i++) {
    const lower = TIER_EXPOSURE_LIMITS[tiers[i - 1]];
    const higher = TIER_EXPOSURE_LIMITS[tiers[i]];

    if (higher.maxSingleExchangeValue < lower.maxSingleExchangeValue) {
      errors.push(`${tiers[i]} maxSingleExchangeValue should be >= ${tiers[i - 1]}`);
    }
    if (higher.maxOutstandingValue < lower.maxOutstandingValue) {
      errors.push(`${tiers[i]} maxOutstandingValue should be >= ${tiers[i - 1]}`);
    }
    if (higher.maxChainLength < lower.maxChainLength) {
      errors.push(`${tiers[i]} maxChainLength should be >= ${tiers[i - 1]}`);
    }
    if (higher.maxConcurrentChains < lower.maxConcurrentChains) {
      errors.push(`${tiers[i]} maxConcurrentChains should be >= ${tiers[i - 1]}`);
    }
    // Cooldown should decrease for higher tiers
    if (higher.cooldownAfterDispute > lower.cooldownAfterDispute) {
      errors.push(`${tiers[i]} cooldownAfterDispute should be <= ${tiers[i - 1]}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
