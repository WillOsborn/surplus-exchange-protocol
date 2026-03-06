import { describe, it, expect } from 'vitest';
import {
  getExposureLimits,
  checkExposure,
  requiresEscrow,
  getAvailableCapacity,
  validateLimitsConfiguration,
  TIER_EXPOSURE_LIMITS,
  type CurrentExposure,
  type ExposureCheckInput,
} from './exposure.js';
import type { TrustTier } from './tiers.js';

// =============================================================================
// Inline helpers
// =============================================================================

function makeCurrentExposure(
  overrides: Partial<CurrentExposure> = {}
): CurrentExposure {
  return {
    outstandingValue: 0,
    activeChains: 0,
    pendingAsProvider: 0,
    pendingAsRecipient: 0,
    daysSinceLastDispute: null,
    ...overrides,
  };
}

function makeExposureCheckInput(
  overrides: Partial<ExposureCheckInput> = {}
): ExposureCheckInput {
  return {
    tier: 'established' as TrustTier,
    currentExposure: makeCurrentExposure(),
    proposedValue: 10,
    proposedChainLength: 3,
    involvesPhysicalGoods: false,
    ...overrides,
  };
}

// =============================================================================
// getExposureLimits()
// =============================================================================

describe('getExposureLimits', () => {
  it('returns correct limits for newcomer and anchor tiers', () => {
    const newcomer = getExposureLimits('newcomer');
    expect(newcomer.maxSingleExchangeValue).toBe(5);
    expect(newcomer.maxOutstandingValue).toBe(5);
    expect(newcomer.maxChainLength).toBe(2);
    expect(newcomer.maxConcurrentChains).toBe(1);
    expect(newcomer.requiresEscrow).toBe(true);
    expect(newcomer.cooldownAfterDispute).toBe(60);

    const anchor = getExposureLimits('anchor');
    expect(anchor.maxSingleExchangeValue).toBe(200);
    expect(anchor.maxOutstandingValue).toBe(500);
    expect(anchor.maxChainLength).toBe(8);
    expect(anchor.maxConcurrentChains).toBe(10);
    expect(anchor.requiresEscrow).toBe(false);
    expect(anchor.cooldownAfterDispute).toBe(7);
  });

  it('applies custom limit overrides on top of tier defaults', () => {
    const customised = getExposureLimits('newcomer', {
      maxSingleExchangeValue: 100,
      cooldownAfterDispute: 3,
    });

    // Overridden values
    expect(customised.maxSingleExchangeValue).toBe(100);
    expect(customised.cooldownAfterDispute).toBe(3);

    // Non-overridden values remain at newcomer defaults
    expect(customised.maxOutstandingValue).toBe(5);
    expect(customised.maxChainLength).toBe(2);
  });
});

// =============================================================================
// checkExposure()
// =============================================================================

describe('checkExposure', () => {
  it('allows exchange within all limits', () => {
    const input = makeExposureCheckInput({
      tier: 'established',
      currentExposure: makeCurrentExposure({ outstandingValue: 10, activeChains: 1 }),
      proposedValue: 20,
      proposedChainLength: 3,
    });
    const result = checkExposure(input);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('rejects when in dispute cooldown period with remaining days in reason', () => {
    const input = makeExposureCheckInput({
      tier: 'established',
      currentExposure: makeCurrentExposure({ daysSinceLastDispute: 5 }),
      proposedValue: 10,
    });
    // Established cooldown is 14 days; 5 days in => 9 remaining
    const result = checkExposure(input);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('cooldown');
    expect(result.reason).toContain('9 days remaining');
  });

  it('rejects when single exchange value exceeds tier limit', () => {
    const input = makeExposureCheckInput({
      tier: 'newcomer',
      proposedValue: 10, // newcomer limit is 5
    });
    const result = checkExposure(input);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('single exchange limit');
  });

  it('rejects when total outstanding would exceed tier limit', () => {
    const input = makeExposureCheckInput({
      tier: 'established',
      currentExposure: makeCurrentExposure({ outstandingValue: 145 }),
      proposedValue: 10, // 145 + 10 = 155 > 150
    });
    const result = checkExposure(input);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('outstanding value limit');
  });

  it('rejects when chain length exceeds tier limit', () => {
    const input = makeExposureCheckInput({
      tier: 'newcomer',
      proposedValue: 3,
      proposedChainLength: 4, // newcomer limit is 2
    });
    const result = checkExposure(input);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Chain length');
  });

  it('rejects when concurrent chains would exceed tier limit', () => {
    const input = makeExposureCheckInput({
      tier: 'newcomer',
      currentExposure: makeCurrentExposure({ activeChains: 1 }),
      proposedValue: 3,
      proposedChainLength: 2,
    });
    // newcomer maxConcurrentChains is 1; 1 active + 1 proposed = 2 > 1
    const result = checkExposure(input);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('concurrent chain limit');
  });

  it('allows exchange when daysSinceLastDispute is null (never disputed)', () => {
    const input = makeExposureCheckInput({
      tier: 'established',
      currentExposure: makeCurrentExposure({ daysSinceLastDispute: null }),
      proposedValue: 10,
      proposedChainLength: 3,
    });
    const result = checkExposure(input);
    expect(result.allowed).toBe(true);
  });

  it('computes remainingCapacity correctly for value and chains', () => {
    const input = makeExposureCheckInput({
      tier: 'established',
      currentExposure: makeCurrentExposure({
        outstandingValue: 100,
        activeChains: 3,
      }),
      proposedValue: 10,
      proposedChainLength: 3,
    });
    const result = checkExposure(input);
    // established: maxOutstandingValue=150, maxConcurrentChains=5
    expect(result.remainingCapacity.value).toBe(50);  // 150 - 100
    expect(result.remainingCapacity.chains).toBe(2);   // 5 - 3
  });
});

// =============================================================================
// requiresEscrow()
// =============================================================================

describe('requiresEscrow', () => {
  it('returns true for newcomer and probationary regardless of goods type', () => {
    expect(requiresEscrow('newcomer', false)).toBe(true);
    expect(requiresEscrow('newcomer', true)).toBe(true);
    expect(requiresEscrow('probationary', false)).toBe(true);
    expect(requiresEscrow('probationary', true)).toBe(true);
  });

  it('returns false for established and anchor when services only', () => {
    expect(requiresEscrow('established', false)).toBe(false);
    expect(requiresEscrow('anchor', false)).toBe(false);
  });

  it('returns true for all tiers when physical goods are involved', () => {
    const tiers: TrustTier[] = ['newcomer', 'probationary', 'established', 'anchor'];
    for (const tier of tiers) {
      expect(requiresEscrow(tier, true)).toBe(true);
    }
  });
});

// =============================================================================
// getAvailableCapacity()
// =============================================================================

describe('getAvailableCapacity', () => {
  it('returns 0 during cooldown or when at chain limit', () => {
    // During cooldown
    const cooldownExposure = makeCurrentExposure({ daysSinceLastDispute: 5 });
    expect(getAvailableCapacity('established', cooldownExposure)).toBe(0);

    // At chain limit (established maxConcurrentChains = 5)
    const chainLimitExposure = makeCurrentExposure({ activeChains: 5 });
    expect(getAvailableCapacity('established', chainLimitExposure)).toBe(0);
  });

  it('returns min(remaining outstanding, single exchange limit) when within limits', () => {
    // Established: maxOutstandingValue=150, maxSingleExchangeValue=50
    // Case 1: remaining outstanding (30) < single exchange limit (50)
    const exposure1 = makeCurrentExposure({ outstandingValue: 120, activeChains: 1 });
    expect(getAvailableCapacity('established', exposure1)).toBe(30);

    // Case 2: remaining outstanding (150) > single exchange limit (50) => capped at 50
    const exposure2 = makeCurrentExposure({ outstandingValue: 0, activeChains: 1 });
    expect(getAvailableCapacity('established', exposure2)).toBe(50);
  });
});

// =============================================================================
// validateLimitsConfiguration()
// =============================================================================

describe('validateLimitsConfiguration', () => {
  it('validates that default configuration is consistent (limits increase, cooldown decreases)', () => {
    const result = validateLimitsConfiguration();
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
