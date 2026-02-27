/**
 * Vouching System Module for the Surplus Exchange Protocol
 *
 * Implements a trust-based vouching mechanism where established and anchor
 * participants can sponsor new members. Vouches are time-limited and have
 * reputation consequences for the sponsor based on the sponsored participant's
 * behaviour.
 *
 * Key concepts:
 * - Only Established and Anchor tier participants can vouch
 * - Vouches expire after a configurable period (default 90 days)
 * - Sponsors face reputation consequences based on sponsored behaviour
 * - Vouching capacity is limited by tier
 */

import type { TrustTier } from './tiers.js';

export type { TrustTier };

/**
 * Status of a vouch.
 */
export type VouchStatus = 'active' | 'expired' | 'revoked';

/**
 * Categorisation of sponsored participant behaviour for reputation impact.
 */
export type SponsoredBehaviour = 'excellent' | 'good' | 'poor' | 'problematic';

/**
 * Represents a vouch from a sponsor to a sponsored participant.
 */
export interface Vouch {
  /** Unique identifier for this vouch */
  id: string;
  /** Participant ID of the sponsor (must be Established or Anchor) */
  sponsorId: string;
  /** Participant ID of the sponsored new member */
  sponsoredId: string;
  /** ISO timestamp when the vouch was created */
  createdAt: string;
  /** ISO timestamp when the vouch expires */
  expiresAt: string;
  /** Current status of the vouch */
  status: VouchStatus;
  /** Optional notes from the sponsor about their assessment */
  notes?: string;
}

/**
 * Tracks a participant's capacity to vouch for others.
 */
export interface VouchCapacity {
  /** The participant's ID */
  participantId: string;
  /** Current trust tier */
  tier: TrustTier;
  /** Maximum number of active vouches allowed for this tier */
  maxVouches: number;
  /** Number of currently active vouches */
  activeVouches: number;
  /** Remaining capacity to vouch for new participants */
  remainingCapacity: number;
  /** Historical vouching outcomes */
  vouchHistory: {
    /** Total number of vouches ever given */
    totalGiven: number;
    /** Number of sponsored participants who reached Established tier */
    successful: number;
    /** Number of sponsored participants who had disputes */
    problematic: number;
  };
}

/**
 * Calculates the reputation impact on a sponsor based on sponsored behaviour.
 */
export interface VouchReputationImpact {
  /** The sponsor's participant ID */
  sponsorId: string;
  /** The sponsored participant's behaviour categorisation */
  sponsoredBehaviour: SponsoredBehaviour;
  /** Trust score adjustment for the sponsor (-0.1 to +0.05) */
  impactOnSponsor: number;
  /** Human-readable explanation of the impact */
  reason: string;
}

/**
 * Result of vouch validation.
 */
export interface VouchValidation {
  /** Whether the vouch is currently valid */
  valid: boolean;
  /** Reason for invalidity (if not valid) */
  reason?: string;
}

/**
 * Configuration options for the vouching system.
 */
export interface VouchingConfig {
  /** Default vouch duration in days */
  defaultDurationDays: number;
  /** Maximum active vouches per tier */
  maxVouchesPerTier: {
    newcomer: number;
    probationary: number;
    established: number;
    anchor: number;
  };
  /** Reputation impact values per behaviour category */
  reputationImpact: {
    excellent: number;
    good: number;
    poor: number;
    problematic: number;
  };
}

/**
 * Default configuration for the vouching system.
 */
export const DEFAULT_VOUCHING_CONFIG: VouchingConfig = {
  defaultDurationDays: 90,
  maxVouchesPerTier: {
    newcomer: 0,
    probationary: 0,
    established: 2,
    anchor: 5,
  },
  reputationImpact: {
    excellent: 0.02,
    good: 0.01,
    poor: -0.03,
    problematic: -0.08,
  },
};

/**
 * Gets the maximum number of active vouches allowed for a given tier.
 *
 * @param tier - The trust tier to check
 * @param config - Optional configuration (defaults to DEFAULT_VOUCHING_CONFIG)
 * @returns Maximum number of active vouches allowed
 */
function getMaxVouchesForTier(
  tier: TrustTier,
  config: VouchingConfig = DEFAULT_VOUCHING_CONFIG
): number {
  return config.maxVouchesPerTier[tier];
}

/**
 * Checks if a tier is allowed to vouch for others.
 *
 * @param tier - The trust tier to check
 * @returns True if the tier can vouch, false otherwise
 */
function canTierVouch(tier: TrustTier): boolean {
  return tier === 'established' || tier === 'anchor';
}

/**
 * Counts active vouches for a specific sponsor.
 *
 * @param sponsorId - The sponsor's participant ID
 * @param vouches - Array of all vouches to search
 * @returns Number of active vouches from this sponsor
 */
function countActiveVouches(sponsorId: string, vouches: Vouch[]): number {
  return vouches.filter(
    v => v.sponsorId === sponsorId && v.status === 'active'
  ).length;
}

/**
 * Creates a new vouch from a sponsor to a sponsored participant.
 *
 * Validates that:
 * - The sponsor's tier allows vouching
 * - The sponsor has remaining vouch capacity
 * - The sponsor isn't already vouching for this participant
 *
 * @param sponsorId - The sponsor's participant ID
 * @param sponsoredId - The sponsored participant's ID
 * @param sponsorTier - The sponsor's current trust tier
 * @param existingVouches - Array of existing vouches for capacity checking
 * @param notes - Optional notes from the sponsor
 * @param config - Optional configuration (defaults to DEFAULT_VOUCHING_CONFIG)
 * @returns Either a new Vouch object or an error message
 */
export function createVouch(
  sponsorId: string,
  sponsoredId: string,
  sponsorTier: TrustTier,
  existingVouches: Vouch[],
  notes?: string,
  config: VouchingConfig = DEFAULT_VOUCHING_CONFIG
): { vouch: Vouch } | { error: string } {
  // Validate sponsor tier can vouch
  if (!canTierVouch(sponsorTier)) {
    return {
      error: `Participants with '${sponsorTier}' tier cannot vouch for others. Only Established and Anchor participants may vouch.`,
    };
  }

  // Check if sponsor already has an active vouch for this participant
  const existingActiveVouch = existingVouches.find(
    v =>
      v.sponsorId === sponsorId &&
      v.sponsoredId === sponsoredId &&
      v.status === 'active'
  );

  if (existingActiveVouch) {
    return {
      error: `Sponsor already has an active vouch for participant ${sponsoredId}.`,
    };
  }

  // Check sponsor's vouch capacity
  const activeVouchCount = countActiveVouches(sponsorId, existingVouches);
  const maxVouches = getMaxVouchesForTier(sponsorTier, config);

  if (activeVouchCount >= maxVouches) {
    return {
      error: `Sponsor has reached maximum vouch capacity (${maxVouches} for ${sponsorTier} tier).`,
    };
  }

  // Create the vouch
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + config.defaultDurationDays);

  const vouch: Vouch = {
    id: crypto.randomUUID(),
    sponsorId,
    sponsoredId,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'active',
  };

  if (notes !== undefined) {
    vouch.notes = notes;
  }

  return { vouch };
}

/**
 * Validates whether a vouch is currently valid.
 *
 * A vouch is valid if:
 * - Its status is 'active'
 * - It has not expired
 *
 * @param vouch - The vouch to validate
 * @param currentTime - Optional current time for testing (defaults to now)
 * @returns Validation result with validity status and reason if invalid
 */
export function validateVouch(
  vouch: Vouch,
  currentTime: Date = new Date()
): VouchValidation {
  // Check status
  if (vouch.status === 'revoked') {
    return {
      valid: false,
      reason: 'Vouch has been revoked.',
    };
  }

  if (vouch.status === 'expired') {
    return {
      valid: false,
      reason: 'Vouch has expired.',
    };
  }

  // Check expiry date
  const expiresAt = new Date(vouch.expiresAt);
  if (currentTime > expiresAt) {
    return {
      valid: false,
      reason: `Vouch expired on ${vouch.expiresAt}.`,
    };
  }

  return { valid: true };
}

/**
 * Calculates the vouch capacity for a participant.
 *
 * @param participantId - The participant's ID
 * @param tier - The participant's trust tier
 * @param vouches - Array of all vouches to analyse
 * @param vouchOutcomes - Historical outcomes of this participant's vouches
 * @param config - Optional configuration (defaults to DEFAULT_VOUCHING_CONFIG)
 * @returns Complete vouch capacity information
 */
export function getVouchCapacity(
  participantId: string,
  tier: TrustTier,
  vouches: Vouch[],
  vouchOutcomes: { successful: number; problematic: number },
  config: VouchingConfig = DEFAULT_VOUCHING_CONFIG
): VouchCapacity {
  const maxVouches = getMaxVouchesForTier(tier, config);
  const activeVouches = countActiveVouches(participantId, vouches);
  const remainingCapacity = Math.max(0, maxVouches - activeVouches);

  // Count total vouches given by this participant
  const totalGiven = vouches.filter(v => v.sponsorId === participantId).length;

  return {
    participantId,
    tier,
    maxVouches,
    activeVouches,
    remainingCapacity,
    vouchHistory: {
      totalGiven,
      successful: vouchOutcomes.successful,
      problematic: vouchOutcomes.problematic,
    },
  };
}

/**
 * Calculates the reputation impact on a sponsor based on their sponsored
 * participant's behaviour.
 *
 * Impact scale:
 * - excellent: +0.02 (sponsored participant performing exceptionally)
 * - good: +0.01 (sponsored participant meeting expectations)
 * - poor: -0.03 (sponsored participant underperforming)
 * - problematic: -0.08 (sponsored participant causing issues/disputes)
 *
 * @param sponsorId - The sponsor's participant ID
 * @param sponsoredBehaviour - Categorisation of the sponsored participant's behaviour
 * @param config - Optional configuration (defaults to DEFAULT_VOUCHING_CONFIG)
 * @returns Reputation impact details
 */
export function calculateVouchImpact(
  sponsorId: string,
  sponsoredBehaviour: SponsoredBehaviour,
  config: VouchingConfig = DEFAULT_VOUCHING_CONFIG
): VouchReputationImpact {
  const impactOnSponsor = config.reputationImpact[sponsoredBehaviour];

  const reasons: Record<SponsoredBehaviour, string> = {
    excellent:
      'Sponsored participant is performing excellently, reflecting well on sponsor judgement.',
    good: 'Sponsored participant is meeting expectations, validating sponsor judgement.',
    poor: 'Sponsored participant is underperforming, calling sponsor judgement into question.',
    problematic:
      'Sponsored participant has caused disputes or issues, significantly impacting sponsor reputation.',
  };

  return {
    sponsorId,
    sponsoredBehaviour,
    impactOnSponsor,
    reason: reasons[sponsoredBehaviour],
  };
}

/**
 * Revokes a vouch, marking it as no longer valid.
 *
 * @param vouch - The vouch to revoke
 * @param reason - Optional reason for revocation (added to notes)
 * @returns A new Vouch object with revoked status
 */
export function revokeVouch(vouch: Vouch, reason?: string): Vouch {
  const revokedVouch: Vouch = {
    ...vouch,
    status: 'revoked',
  };

  if (reason !== undefined) {
    const existingNotes = vouch.notes ? `${vouch.notes}\n` : '';
    revokedVouch.notes = `${existingNotes}[Revoked: ${reason}]`;
  }

  return revokedVouch;
}

/**
 * Processes a list of vouches and marks expired ones.
 *
 * Checks each active vouch against the current time and updates
 * status to 'expired' if the expiry date has passed.
 *
 * @param vouches - Array of vouches to process
 * @param currentTime - Optional current time for testing (defaults to now)
 * @returns Updated array of vouches with expired statuses applied
 */
export function processExpiredVouches(
  vouches: Vouch[],
  currentTime: Date = new Date()
): Vouch[] {
  return vouches.map(vouch => {
    // Only process active vouches
    if (vouch.status !== 'active') {
      return vouch;
    }

    const expiresAt = new Date(vouch.expiresAt);

    if (currentTime > expiresAt) {
      return {
        ...vouch,
        status: 'expired' as const,
      };
    }

    return vouch;
  });
}
