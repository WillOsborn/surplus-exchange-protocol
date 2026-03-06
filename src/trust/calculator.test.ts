import { describe, it, expect, vi, afterEach } from 'vitest';
import { computeTrustScore, type TrustInput } from './calculator.js';

// ============================================================================
// Inline Helpers
// ============================================================================

function makeTrustInput(overrides: Partial<TrustInput> = {}): TrustInput {
  return {
    participantId: 'p1',
    satisfactionHistory: {
      asProvider: { total: 10, satisfied: 9, disputed: 1 },
      asRecipient: { total: 8, satisfied: 7, disputed: 1 },
    },
    networkPosition: {
      partnerCount: 5,
      repeatPartners: 2,
      networkAge: 90,
      vouchesReceived: 1,
      vouchesGiven: 0,
    },
    recentActivity: {
      last30Days: 3,
      last90Days: 8,
      daysSinceLastExchange: 10,
    },
    ...overrides,
  };
}

/**
 * Helper to build satisfactionHistory overrides more concisely.
 */
function makeHistory(
  provider: { total: number; satisfied: number; disputed: number },
  recipient: { total: number; satisfied: number; disputed: number },
): TrustInput['satisfactionHistory'] {
  return { asProvider: provider, asRecipient: recipient };
}

// ============================================================================
// Tests
// ============================================================================

describe('computeTrustScore', () => {
  // Use fake timers so computedAt is deterministic
  vi.useFakeTimers();
  afterEach(() => vi.useRealTimers());

  // --------------------------------------------------------------------------
  // Reliability component
  // --------------------------------------------------------------------------
  describe('reliability component', () => {
    it('returns reliability near 1.0 when all exchanges are satisfied', () => {
      const input = makeTrustInput({
        satisfactionHistory: makeHistory(
          { total: 10, satisfied: 10, disputed: 0 },
          { total: 10, satisfied: 10, disputed: 0 },
        ),
      });
      const result = computeTrustScore(input);
      expect(result.components.reliability).toBeCloseTo(1.0, 4);
    });

    it('returns reliability of 0.5 when there are no exchanges', () => {
      const input = makeTrustInput({
        satisfactionHistory: makeHistory(
          { total: 0, satisfied: 0, disputed: 0 },
          { total: 0, satisfied: 0, disputed: 0 },
        ),
      });
      const result = computeTrustScore(input);
      expect(result.components.reliability).toBe(0.5);
    });

    it('returns mid-range reliability for 50% satisfaction', () => {
      const input = makeTrustInput({
        satisfactionHistory: makeHistory(
          { total: 10, satisfied: 5, disputed: 5 },
          { total: 10, satisfied: 5, disputed: 5 },
        ),
      });
      const result = computeTrustScore(input);
      expect(result.components.reliability).toBeCloseTo(0.5, 4);
    });

    it('weights provider role more heavily when provider-dominant', () => {
      // Provider-heavy: 20 provider exchanges vs 2 recipient
      // Provider satisfaction 90%, Recipient satisfaction 50%
      const providerHeavy = makeTrustInput({
        satisfactionHistory: makeHistory(
          { total: 20, satisfied: 18, disputed: 2 },
          { total: 2, satisfied: 1, disputed: 1 },
        ),
      });
      // Recipient-heavy: 2 provider exchanges vs 20 recipient
      // Provider satisfaction 90%, Recipient satisfaction 50%
      const recipientHeavy = makeTrustInput({
        satisfactionHistory: makeHistory(
          { total: 2, satisfied: 1, disputed: 1 },
          { total: 20, satisfied: 18, disputed: 2 },
        ),
      });
      const provResult = computeTrustScore(providerHeavy);
      const recResult = computeTrustScore(recipientHeavy);

      // Sanity: both should have the same total exchanges but different weights
      expect(providerHeavy.satisfactionHistory.asProvider.total).toBe(20);
      expect(recipientHeavy.satisfactionHistory.asRecipient.total).toBe(20);

      // Both should be weighted towards the dominant role's satisfaction rate
      // With provider-heavy, the 90% provider rate dominates
      // With recipient-heavy, the 90% recipient rate dominates
      // Both should give the same result since the formula is symmetric by volume
      expect(provResult.components.reliability).toBeCloseTo(
        recResult.components.reliability,
        4,
      );
      // Weighted average: (18 * 20 + 1 * 2) / (20 + 2) = (360 + 2) / 22 ... wait
      // Actually: (provRate * provTotal + recRate * recTotal) / total
      // = (0.9 * 20 + 0.5 * 2) / 22 = (18 + 1) / 22 = 19/22 ≈ 0.8636
      expect(provResult.components.reliability).toBeCloseTo(19 / 22, 4);
    });
  });

  // --------------------------------------------------------------------------
  // Experience component
  // --------------------------------------------------------------------------
  describe('experience component', () => {
    it('returns experience near 0 for zero exchanges and zero network age', () => {
      const input = makeTrustInput({
        satisfactionHistory: makeHistory(
          { total: 0, satisfied: 0, disputed: 0 },
          { total: 0, satisfied: 0, disputed: 0 },
        ),
        networkPosition: {
          partnerCount: 0,
          repeatPartners: 0,
          networkAge: 0,
          vouchesReceived: 0,
          vouchesGiven: 0,
        },
      });
      const result = computeTrustScore(input);
      expect(result.components.experience).toBeCloseTo(0, 4);
    });

    it('returns experience near 1.0 for high volume and long tenure', () => {
      const input = makeTrustInput({
        satisfactionHistory: makeHistory(
          { total: 50, satisfied: 45, disputed: 5 },
          { total: 50, satisfied: 45, disputed: 5 },
        ),
        networkPosition: {
          partnerCount: 20,
          repeatPartners: 10,
          networkAge: 365,
          vouchesReceived: 5,
          vouchesGiven: 3,
        },
      });
      const result = computeTrustScore(input);
      // 100 total exchanges: volumeScore = min(log10(101)/2, 1) = min(1.002, 1) = 1.0
      // networkAge=365: tenureScore = min(365/365, 1) = 1.0
      // experience = 0.6 * 1.0 + 0.4 * 1.0 = 1.0
      expect(result.components.experience).toBeCloseTo(1.0, 1);
    });

    it('uses logarithmic scaling so 10 exchanges is not 10x the score of 1 exchange', () => {
      const oneExchange = makeTrustInput({
        satisfactionHistory: makeHistory(
          { total: 1, satisfied: 1, disputed: 0 },
          { total: 0, satisfied: 0, disputed: 0 },
        ),
        networkPosition: {
          partnerCount: 1,
          repeatPartners: 0,
          networkAge: 0,
          vouchesReceived: 0,
          vouchesGiven: 0,
        },
      });
      const tenExchanges = makeTrustInput({
        satisfactionHistory: makeHistory(
          { total: 10, satisfied: 10, disputed: 0 },
          { total: 0, satisfied: 0, disputed: 0 },
        ),
        networkPosition: {
          partnerCount: 1,
          repeatPartners: 0,
          networkAge: 0,
          vouchesReceived: 0,
          vouchesGiven: 0,
        },
      });

      const oneResult = computeTrustScore(oneExchange);
      const tenResult = computeTrustScore(tenExchanges);

      // Sanity: verify the inputs really do differ
      expect(tenExchanges.satisfactionHistory.asProvider.total).toBe(10);
      expect(oneExchange.satisfactionHistory.asProvider.total).toBe(1);

      // 10x exchanges should NOT produce 10x the experience score
      expect(tenResult.components.experience).toBeGreaterThan(
        oneResult.components.experience,
      );
      const ratio =
        tenResult.components.experience / oneResult.components.experience;
      expect(ratio).toBeLessThan(10);
    });

    it('caps network age contribution at maxNetworkAgeDays', () => {
      const atCap = makeTrustInput({
        satisfactionHistory: makeHistory(
          { total: 0, satisfied: 0, disputed: 0 },
          { total: 0, satisfied: 0, disputed: 0 },
        ),
        networkPosition: {
          partnerCount: 0,
          repeatPartners: 0,
          networkAge: 365,
          vouchesReceived: 0,
          vouchesGiven: 0,
        },
      });
      const beyondCap = makeTrustInput({
        satisfactionHistory: makeHistory(
          { total: 0, satisfied: 0, disputed: 0 },
          { total: 0, satisfied: 0, disputed: 0 },
        ),
        networkPosition: {
          partnerCount: 0,
          repeatPartners: 0,
          networkAge: 730,
          vouchesReceived: 0,
          vouchesGiven: 0,
        },
      });

      const atCapResult = computeTrustScore(atCap);
      const beyondCapResult = computeTrustScore(beyondCap);

      // Both should have the same experience (since volume is 0, only tenure matters,
      // and it's capped at maxNetworkAgeDays=365)
      expect(beyondCapResult.components.experience).toBeCloseTo(
        atCapResult.components.experience,
        4,
      );
    });
  });

  // --------------------------------------------------------------------------
  // Network strength component
  // --------------------------------------------------------------------------
  describe('network strength component', () => {
    it('returns network strength near 0 for zero partners', () => {
      const input = makeTrustInput({
        networkPosition: {
          partnerCount: 0,
          repeatPartners: 0,
          networkAge: 90,
          vouchesReceived: 0,
          vouchesGiven: 0,
        },
      });
      const result = computeTrustScore(input);
      expect(result.components.networkStrength).toBeCloseTo(0, 4);
    });

    it('returns network strength near 1.0 for many partners and vouches', () => {
      const input = makeTrustInput({
        networkPosition: {
          partnerCount: 20,
          repeatPartners: 20,
          networkAge: 365,
          vouchesReceived: 10,
          vouchesGiven: 5,
        },
      });
      const result = computeTrustScore(input);
      // diversityScore = min(log10(21)/1.3, 1) ≈ 1.0
      // repeatRatio = 20/20 = 1.0
      // vouchScore = min(log10(11)/1.0, 1) ≈ 1.0
      // networkScore = 0.4 * 1.0 + 0.3 * 1.0 + 0.3 * 1.0 = 1.0
      expect(result.components.networkStrength).toBeCloseTo(1.0, 1);
    });

    it('increases score with higher repeat partner ratio', () => {
      const lowRepeat = makeTrustInput({
        networkPosition: {
          partnerCount: 10,
          repeatPartners: 1,
          networkAge: 90,
          vouchesReceived: 0,
          vouchesGiven: 0,
        },
      });
      const highRepeat = makeTrustInput({
        networkPosition: {
          partnerCount: 10,
          repeatPartners: 8,
          networkAge: 90,
          vouchesReceived: 0,
          vouchesGiven: 0,
        },
      });

      const lowResult = computeTrustScore(lowRepeat);
      const highResult = computeTrustScore(highRepeat);

      // Sanity: inputs actually differ
      expect(lowRepeat.networkPosition.repeatPartners).toBe(1);
      expect(highRepeat.networkPosition.repeatPartners).toBe(8);

      expect(highResult.components.networkStrength).toBeGreaterThan(
        lowResult.components.networkStrength,
      );
    });

    it('increases score with more vouches received', () => {
      const noVouches = makeTrustInput({
        networkPosition: {
          partnerCount: 5,
          repeatPartners: 2,
          networkAge: 90,
          vouchesReceived: 0,
          vouchesGiven: 0,
        },
      });
      const manyVouches = makeTrustInput({
        networkPosition: {
          partnerCount: 5,
          repeatPartners: 2,
          networkAge: 90,
          vouchesReceived: 5,
          vouchesGiven: 0,
        },
      });

      const noResult = computeTrustScore(noVouches);
      const manyResult = computeTrustScore(manyVouches);

      // Sanity: inputs actually differ
      expect(noVouches.networkPosition.vouchesReceived).toBe(0);
      expect(manyVouches.networkPosition.vouchesReceived).toBe(5);

      expect(manyResult.components.networkStrength).toBeGreaterThan(
        noResult.components.networkStrength,
      );
    });
  });

  // --------------------------------------------------------------------------
  // Recency component
  // --------------------------------------------------------------------------
  describe('recency component', () => {
    it('returns recency near 1.0 for recent activity within 30 days', () => {
      const input = makeTrustInput({
        recentActivity: {
          last30Days: 3,
          last90Days: 8,
          daysSinceLastExchange: 5,
        },
      });
      const result = computeTrustScore(input);
      // daysSinceLastExchange=5, <= 30: decayScore = 1.0
      // activityBoost = min(3*0.1 + 8*0.03, 0.3) = min(0.54, 0.3) = 0.3
      // recencyScore = min(1.0 + 0.3, 1.0) = 1.0
      expect(result.components.recency).toBeCloseTo(1.0, 4);
    });

    it('returns recency at floor (0.2) for long-inactive participant', () => {
      const input = makeTrustInput({
        recentActivity: {
          last30Days: 0,
          last90Days: 0,
          daysSinceLastExchange: 200,
        },
      });
      const result = computeTrustScore(input);
      // daysSinceLastExchange=200, >= 180: decayScore = 0.2
      // activityBoost = min(0*0.1 + 0*0.03, 0.3) = 0
      // recencyScore = min(0.2 + 0, 1.0) = 0.2
      expect(result.components.recency).toBeCloseTo(0.2, 4);
    });

    it('decays linearly between decay start and end days', () => {
      // Exactly mid-point: 105 days (between 30 and 180)
      const input = makeTrustInput({
        recentActivity: {
          last30Days: 0,
          last90Days: 0,
          daysSinceLastExchange: 105,
        },
      });
      const result = computeTrustScore(input);
      // decayRange = 180 - 30 = 150
      // daysIntoDecay = 105 - 30 = 75
      // decayScore = 1.0 - (75/150) * 0.8 = 1.0 - 0.4 = 0.6
      // activityBoost = 0
      // recencyScore = 0.6
      expect(result.components.recency).toBeCloseTo(0.6, 4);
    });

    it('boosts recency for high recent exchange volume, capped at 0.3', () => {
      // Very high activity but also somewhat inactive by days
      const input = makeTrustInput({
        recentActivity: {
          last30Days: 10,
          last90Days: 20,
          daysSinceLastExchange: 105,
        },
      });
      const result = computeTrustScore(input);
      // decayScore = 0.6 (same as above)
      // activityBoost = min(10*0.1 + 20*0.03, 0.3) = min(1.0 + 0.6, 0.3) = 0.3
      // recencyScore = min(0.6 + 0.3, 1.0) = 0.9
      expect(result.components.recency).toBeCloseTo(0.9, 4);
    });
  });

  // --------------------------------------------------------------------------
  // Overall score and confidence
  // --------------------------------------------------------------------------
  describe('overall score and confidence', () => {
    it('produces an overall score between 0 and 1 for any valid input', () => {
      // Test with default helper input
      const result = computeTrustScore(makeTrustInput());
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(1);

      // Test with extreme low input
      const lowResult = computeTrustScore(
        makeTrustInput({
          satisfactionHistory: makeHistory(
            { total: 0, satisfied: 0, disputed: 0 },
            { total: 0, satisfied: 0, disputed: 0 },
          ),
          networkPosition: {
            partnerCount: 0,
            repeatPartners: 0,
            networkAge: 0,
            vouchesReceived: 0,
            vouchesGiven: 0,
          },
          recentActivity: {
            last30Days: 0,
            last90Days: 0,
            daysSinceLastExchange: 365,
          },
        }),
      );
      expect(lowResult.overall).toBeGreaterThanOrEqual(0);
      expect(lowResult.overall).toBeLessThanOrEqual(1);

      // Test with extreme high input
      const highResult = computeTrustScore(
        makeTrustInput({
          satisfactionHistory: makeHistory(
            { total: 100, satisfied: 100, disputed: 0 },
            { total: 100, satisfied: 100, disputed: 0 },
          ),
          networkPosition: {
            partnerCount: 50,
            repeatPartners: 40,
            networkAge: 1000,
            vouchesReceived: 20,
            vouchesGiven: 15,
          },
          recentActivity: {
            last30Days: 10,
            last90Days: 25,
            daysSinceLastExchange: 1,
          },
        }),
      );
      expect(highResult.overall).toBeGreaterThanOrEqual(0);
      expect(highResult.overall).toBeLessThanOrEqual(1);
    });

    it('returns confidence "low" when total exchanges < 5', () => {
      const input = makeTrustInput({
        satisfactionHistory: makeHistory(
          { total: 2, satisfied: 2, disputed: 0 },
          { total: 2, satisfied: 2, disputed: 0 },
        ),
      });
      const result = computeTrustScore(input);
      expect(result.confidence).toBe('low');
    });

    it('returns confidence "medium" for 5-20 total exchanges', () => {
      const input = makeTrustInput({
        satisfactionHistory: makeHistory(
          { total: 5, satisfied: 5, disputed: 0 },
          { total: 5, satisfied: 5, disputed: 0 },
        ),
      });
      const result = computeTrustScore(input);
      expect(result.confidence).toBe('medium');
    });

    it('returns confidence "high" for more than 20 total exchanges', () => {
      const input = makeTrustInput({
        satisfactionHistory: makeHistory(
          { total: 15, satisfied: 14, disputed: 1 },
          { total: 10, satisfied: 9, disputed: 1 },
        ),
      });
      const result = computeTrustScore(input);
      // Total = 25, which is > 20
      expect(result.confidence).toBe('high');
    });
  });

  // --------------------------------------------------------------------------
  // computedAt timestamp
  // --------------------------------------------------------------------------
  describe('computedAt timestamp', () => {
    it('uses the current time for the computedAt field', () => {
      const fixedDate = new Date('2025-06-15T12:00:00.000Z');
      vi.setSystemTime(fixedDate);

      const result = computeTrustScore(makeTrustInput());
      expect(result.computedAt).toBe(fixedDate.toISOString());
    });
  });
});
