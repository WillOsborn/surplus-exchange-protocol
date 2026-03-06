import { describe, it, expect } from 'vitest';
import {
  qualifiesForTier,
  assessTier,
  calculateProgress,
  getLowerTier,
  getHigherTier,
  TIER_DEFINITIONS,
  type TierAssessmentInput,
} from './tiers.js';
import type { TrustScore } from './calculator.js';

// ============================================================================
// Inline Helpers
// ============================================================================

/**
 * Build a minimal TrustScore object for use in tier assessment inputs.
 */
function makeScore(overall: number, confidence: 'low' | 'medium' | 'high' = 'medium'): TrustScore {
  return {
    overall,
    components: {
      reliability: overall,
      experience: overall,
      networkStrength: overall,
      recency: overall,
    },
    confidence,
    computedAt: '2025-06-15T12:00:00.000Z',
  };
}

function makeTierInput(overrides: Partial<TierAssessmentInput> = {}): TierAssessmentInput {
  return {
    score: makeScore(0.6),
    completedExchanges: 10,
    networkAgeDays: 60,
    uniquePartners: 5,
    hasActiveVouch: false,
    ...overrides,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('qualifiesForTier', () => {
  it('qualifies everyone for newcomer, even with score 0 and 0 exchanges', () => {
    const input = makeTierInput({
      score: makeScore(0),
      completedExchanges: 0,
      networkAgeDays: 0,
      uniquePartners: 0,
      hasActiveVouch: false,
    });
    expect(qualifiesForTier('newcomer', input)).toBe(true);
  });

  it('qualifies for probationary when exchange requirements are met', () => {
    const input = makeTierInput({
      score: makeScore(0),
      completedExchanges: 3,
      networkAgeDays: 14,
      uniquePartners: 2,
      hasActiveVouch: false,
    });
    expect(qualifiesForTier('probationary', input)).toBe(true);
  });

  it('qualifies for probationary via active vouch without meeting exchange requirements', () => {
    const input = makeTierInput({
      score: makeScore(0),
      completedExchanges: 0,
      networkAgeDays: 0,
      uniquePartners: 0,
      hasActiveVouch: true,
    });
    expect(qualifiesForTier('probationary', input)).toBe(true);
  });

  it('qualifies for established when score and metric thresholds are met', () => {
    const input = makeTierInput({
      score: makeScore(0.5),
      completedExchanges: 5,
      networkAgeDays: 30,
      uniquePartners: 3,
    });
    expect(qualifiesForTier('established', input)).toBe(true);
  });

  it('qualifies for anchor with high score, exchanges, age, and partners', () => {
    const input = makeTierInput({
      score: makeScore(0.8),
      completedExchanges: 20,
      networkAgeDays: 180,
      uniquePartners: 10,
    });
    expect(qualifiesForTier('anchor', input)).toBe(true);
  });

  it('fails established when score is just below threshold (0.49)', () => {
    const input = makeTierInput({
      score: makeScore(0.49),
      completedExchanges: 10,
      networkAgeDays: 60,
      uniquePartners: 5,
    });
    expect(qualifiesForTier('established', input)).toBe(false);
  });
});

describe('assessTier', () => {
  it('assigns the highest qualifying tier, not just the first', () => {
    // Qualifies for newcomer, probationary, and established -- should get established
    const input = makeTierInput({
      score: makeScore(0.6),
      completedExchanges: 10,
      networkAgeDays: 60,
      uniquePartners: 5,
    });
    const result = assessTier(input);
    expect(result.currentTier).toBe('established');
  });

  it('returns correct nextTier and progressToNext', () => {
    // At established, next should be anchor
    const input = makeTierInput({
      score: makeScore(0.6),
      completedExchanges: 10,
      networkAgeDays: 60,
      uniquePartners: 5,
    });
    const result = assessTier(input);
    expect(result.nextTier).toBe('anchor');
    expect(result.progressToNext).not.toBeNull();

    // Progress towards anchor: score 0.6/0.8, exchanges 10/20, age 60/180, partners 5/10
    expect(result.progressToNext!.scoreProgress).toBeCloseTo(0.6 / 0.8, 4);
    expect(result.progressToNext!.exchangeProgress).toBeCloseTo(10 / 20, 4);
    expect(result.progressToNext!.ageProgress).toBeCloseTo(60 / 180, 4);
    expect(result.progressToNext!.partnerProgress).toBeCloseTo(5 / 10, 4);
  });

  it('returns nextTier: null when at anchor tier', () => {
    const input = makeTierInput({
      score: makeScore(0.9),
      completedExchanges: 25,
      networkAgeDays: 365,
      uniquePartners: 15,
    });
    const result = assessTier(input);
    expect(result.currentTier).toBe('anchor');
    expect(result.nextTier).toBeNull();
    expect(result.progressToNext).toBeNull();
  });

  it('includes the score in the assessment result', () => {
    const score = makeScore(0.6);
    const input = makeTierInput({ score });
    const result = assessTier(input);
    expect(result.score).toBe(score);
  });

  it('does not flag demotion risk for established with metrics well above thresholds', () => {
    const input = makeTierInput({
      score: makeScore(0.7),
      completedExchanges: 15,
      networkAgeDays: 90,
      uniquePartners: 8,
    });
    const result = assessTier(input);
    expect(result.currentTier).toBe('established');
    expect(result.atRiskOfDemotion).toBe(false);
  });
});

describe('calculateProgress', () => {
  it('returns 1.0 for each fully met criterion', () => {
    // Meets all anchor requirements
    const input = makeTierInput({
      score: makeScore(0.9),
      completedExchanges: 30,
      networkAgeDays: 365,
      uniquePartners: 15,
    });
    const progress = calculateProgress('anchor', input);
    expect(progress.scoreProgress).toBe(1);
    expect(progress.exchangeProgress).toBe(1);
    expect(progress.ageProgress).toBe(1);
    expect(progress.partnerProgress).toBe(1);
  });

  it('returns proportional values for partially met criteria', () => {
    const input = makeTierInput({
      score: makeScore(0.4),
      completedExchanges: 10,
      networkAgeDays: 90,
      uniquePartners: 5,
    });
    const progress = calculateProgress('anchor', input);

    // anchor: minScore=0.8, minExchanges=20, minNetworkAge=180, minPartners=10
    expect(progress.scoreProgress).toBeCloseTo(0.4 / 0.8, 4);
    expect(progress.exchangeProgress).toBeCloseTo(10 / 20, 4);
    expect(progress.ageProgress).toBeCloseTo(90 / 180, 4);
    expect(progress.partnerProgress).toBeCloseTo(5 / 10, 4);
  });

  it('returns all progress as 1.0 for newcomer tier (all requirements are 0)', () => {
    const input = makeTierInput({
      score: makeScore(0),
      completedExchanges: 0,
      networkAgeDays: 0,
      uniquePartners: 0,
    });
    const progress = calculateProgress('newcomer', input);
    expect(progress.scoreProgress).toBe(1);
    expect(progress.exchangeProgress).toBe(1);
    expect(progress.ageProgress).toBe(1);
    expect(progress.partnerProgress).toBe(1);
  });
});

describe('checkDemotionRisk (via assessTier)', () => {
  it('newcomer and probationary are never at risk of demotion', () => {
    const newcomerInput = makeTierInput({
      score: makeScore(0),
      completedExchanges: 0,
      networkAgeDays: 0,
      uniquePartners: 0,
      hasActiveVouch: false,
    });
    const newcomerResult = assessTier(newcomerInput);
    expect(newcomerResult.currentTier).toBe('newcomer');
    expect(newcomerResult.atRiskOfDemotion).toBe(false);

    const probInput = makeTierInput({
      score: makeScore(0.1),
      completedExchanges: 3,
      networkAgeDays: 14,
      uniquePartners: 2,
      hasActiveVouch: false,
    });
    const probResult = assessTier(probInput);
    expect(probResult.currentTier).toBe('probationary');
    expect(probResult.atRiskOfDemotion).toBe(false);
  });

  it('established is not at demotion risk when all metrics are comfortably above thresholds', () => {
    const input = makeTierInput({
      score: makeScore(0.7),
      completedExchanges: 15,
      networkAgeDays: 90,
      uniquePartners: 8,
    });
    const result = assessTier(input);
    expect(result.currentTier).toBe('established');
    expect(result.atRiskOfDemotion).toBe(false);
    expect(result.demotionReason).toBeUndefined();
  });
});

describe('utility functions', () => {
  it('getLowerTier returns the correct lower neighbour', () => {
    expect(getLowerTier('anchor')).toBe('established');
    expect(getLowerTier('established')).toBe('probationary');
    expect(getLowerTier('probationary')).toBe('newcomer');
  });

  it('getLowerTier returns null for newcomer (lowest tier)', () => {
    expect(getLowerTier('newcomer')).toBeNull();
  });

  it('getHigherTier returns the correct higher neighbour', () => {
    expect(getHigherTier('newcomer')).toBe('probationary');
    expect(getHigherTier('probationary')).toBe('established');
    expect(getHigherTier('established')).toBe('anchor');
  });

  it('getHigherTier returns null for anchor (highest tier)', () => {
    expect(getHigherTier('anchor')).toBeNull();
  });
});
