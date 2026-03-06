import { describe, it, expect } from 'vitest';
import {
  extractKeywords,
  scoreMatch,
  type Offering,
  type Need,
  type MatchInput,
} from './scorer.js';

// =============================================================================
// Inline helpers — shapes match the actual types in scorer.ts
// =============================================================================

function makeOffering(overrides: Partial<Offering> = {}): Offering {
  return {
    id: 'o1',
    type: 'service',
    title: 'Test Offering',
    description: 'test offering description',
    capabilities: ['testing'],
    constraints: {},
    ...overrides,
  };
}

function makeNeed(overrides: Partial<Need> = {}): Need {
  return {
    id: 'n1',
    type: 'service',
    title: 'Test Need',
    description: 'test need description',
    explicitMatches: ['testing'],
    constraints: {},
    ...overrides,
  };
}

function makeMatchInput(overrides: Partial<MatchInput> = {}): MatchInput {
  return {
    offering: makeOffering(),
    need: makeNeed(),
    providerTrustScore: 0.8,
    recipientMinTrust: 0.3,
    ...overrides,
  };
}

// =============================================================================
// extractKeywords()
// =============================================================================

describe('extractKeywords', () => {
  it('extracts meaningful words and removes stop words', () => {
    const result = extractKeywords('the quick brown fox jumps over a lazy dog');
    // 'the', 'a' are stop words; 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog' remain
    // 'fox' and 'dog' are 3 chars — kept (filter is > 2, i.e. length >= 3)
    expect(result).toContain('quick');
    expect(result).toContain('brown');
    expect(result).toContain('fox');
    expect(result).toContain('lazy');
    expect(result).toContain('dog');
    expect(result).not.toContain('the');
    expect(result).not.toContain('a');
    // 'over' is not in stop words — actually check: it IS not in the stop word set
    // Looking at the source: 'over' is NOT in STOP_WORDS, so it should be present
    expect(result).toContain('over');
  });

  it('returns empty array for empty string', () => {
    expect(extractKeywords('')).toEqual([]);
  });

  it('removes words with fewer than 3 characters', () => {
    const result = extractKeywords('go up run big cat');
    // 'go' (2 chars) and 'up' (2 chars) should be removed
    // 'run' (3 chars), 'big' (3 chars), 'cat' (3 chars) should be kept
    expect(result).not.toContain('go');
    expect(result).not.toContain('up');
    expect(result).toContain('run');
    expect(result).toContain('big');
    expect(result).toContain('cat');
  });

  it('deduplicates while preserving order', () => {
    const result = extractKeywords('testing testing again testing');
    expect(result).toEqual(['testing', 'again']);
  });

  it('lowercases and handles punctuation', () => {
    const result = extractKeywords('Web-Design, Marketing! Analysis.');
    expect(result).toContain('web');
    expect(result).toContain('design');
    expect(result).toContain('marketing');
    expect(result).toContain('analysis');
    // All should be lowercase
    expect(result.every(kw => kw === kw.toLowerCase())).toBe(true);
  });
});

// =============================================================================
// scoreMatch() — behavioural tests
// =============================================================================

describe('scoreMatch', () => {
  describe('semantic dimension', () => {
    it('type-matched offering scores higher than mismatched', () => {
      const matched = makeMatchInput({
        offering: makeOffering({ type: 'service' }),
        need: makeNeed({ type: 'service' }),
      });
      const mismatched = makeMatchInput({
        offering: makeOffering({ type: 'physical_good' }),
        need: makeNeed({ type: 'service' }),
      });

      // Sanity: verify inputs actually differ
      expect(matched.offering.type).not.toBe(mismatched.offering.type);

      const matchedScore = scoreMatch(matched);
      const mismatchedScore = scoreMatch(mismatched);
      expect(matchedScore.breakdown.semantic).toBeGreaterThan(
        mismatchedScore.breakdown.semantic
      );
    });

    it('keyword overlap increases score', () => {
      const withOverlap = makeMatchInput({
        offering: makeOffering({
          title: 'Web Development Services',
          description: 'Expert web development and design',
        }),
        need: makeNeed({
          title: 'Need Web Development',
          description: 'Looking for web development help',
        }),
      });
      const withoutOverlap = makeMatchInput({
        offering: makeOffering({
          title: 'Plumbing Repairs',
          description: 'Expert pipe installation and maintenance',
        }),
        need: makeNeed({
          title: 'Need Web Development',
          description: 'Looking for web development help',
        }),
      });

      // Sanity: verify descriptions differ
      expect(withOverlap.offering.description).not.toBe(
        withoutOverlap.offering.description
      );

      const overlapScore = scoreMatch(withOverlap);
      const noOverlapScore = scoreMatch(withoutOverlap);
      expect(overlapScore.breakdown.semantic).toBeGreaterThan(
        noOverlapScore.breakdown.semantic
      );
    });

    it('capability substring match increases score', () => {
      const withCapMatch = makeMatchInput({
        offering: makeOffering({ capabilities: ['web development'] }),
        need: makeNeed({ explicitMatches: ['web'] }),
      });
      const withoutCapMatch = makeMatchInput({
        offering: makeOffering({ capabilities: ['plumbing'] }),
        need: makeNeed({ explicitMatches: ['web'] }),
      });

      // Sanity: capabilities differ
      expect(withCapMatch.offering.capabilities[0]).not.toBe(
        withoutCapMatch.offering.capabilities[0]
      );

      const capMatchScore = scoreMatch(withCapMatch);
      const noCapMatchScore = scoreMatch(withoutCapMatch);
      expect(capMatchScore.breakdown.semantic).toBeGreaterThan(
        noCapMatchScore.breakdown.semantic
      );
    });

    it('no data on either side produces mid-range score', () => {
      const sparse = makeMatchInput({
        offering: makeOffering({
          title: '',
          description: '',
          capabilities: [],
        }),
        need: makeNeed({
          title: '',
          description: '',
          explicitMatches: [],
        }),
      });
      const result = scoreMatch(sparse);
      // With no keywords and no capabilities, both keyword and capability get 0.5 (neutral)
      // type mismatch is 0 if types differ, but defaults match (both 'service') so typeScore = 1.0
      // semantic = 1.0 * 0.3 + 0.5 * 0.4 + 0.5 * 0.3 = 0.3 + 0.2 + 0.15 = 0.65
      expect(result.breakdown.semantic).toBeCloseTo(0.65, 4);
    });
  });

  describe('timing dimension', () => {
    it('no constraints scores higher than tight deadline', () => {
      const noConstraints = makeMatchInput();
      const tightDeadline = makeMatchInput({
        offering: makeOffering({
          constraints: {
            timing: {
              availableFrom: '2025-06-01',
            },
          },
        }),
        need: makeNeed({
          constraints: {
            timing: { neededBy: '2025-05-01' },
          },
        }),
      });

      // Sanity: one has timing constraints, the other doesn't
      expect(noConstraints.need.constraints.timing).toBeUndefined();
      expect(tightDeadline.need.constraints.timing).toBeDefined();

      const noConstraintScore = scoreMatch(noConstraints);
      const tightScore = scoreMatch(tightDeadline);
      expect(noConstraintScore.breakdown.timing).toBeGreaterThan(
        tightScore.breakdown.timing
      );
    });

    it('offering available after neededBy scores zero', () => {
      const lateOffering = makeMatchInput({
        offering: makeOffering({
          constraints: {
            timing: { availableFrom: '2025-08-01' },
          },
        }),
        need: makeNeed({
          constraints: {
            timing: { neededBy: '2025-06-01' },
          },
        }),
      });
      const result = scoreMatch(lateOffering);
      expect(result.breakdown.timing).toBe(0.0);
    });
  });

  describe('geographic dimension (deal-breaker)', () => {
    it('matching regions keeps score intact', () => {
      const matchingGeo = makeMatchInput({
        offering: makeOffering({
          constraints: { geographic: ['UK'] },
        }),
        need: makeNeed({
          constraints: {
            geographic: { acceptedRegions: ['UK'] },
          },
        }),
      });
      const result = scoreMatch(matchingGeo);
      expect(result.breakdown.geographic).toBe(1.0);
      expect(result.overall).toBeGreaterThan(0);
    });

    it('non-overlapping regions zeros entire score', () => {
      const noOverlap = makeMatchInput({
        offering: makeOffering({
          constraints: { geographic: ['UK'] },
        }),
        need: makeNeed({
          constraints: {
            geographic: { acceptedRegions: ['Japan'] },
          },
        }),
      });
      const result = scoreMatch(noOverlap);
      expect(result.breakdown.geographic).toBe(0.0);
      expect(result.overall).toBe(0);
    });

    it('case-insensitive matching works', () => {
      const caseInsensitive = makeMatchInput({
        offering: makeOffering({
          constraints: { geographic: ['united kingdom'] },
        }),
        need: makeNeed({
          constraints: {
            geographic: { acceptedRegions: ['United Kingdom'] },
          },
        }),
      });
      const result = scoreMatch(caseInsensitive);
      expect(result.breakdown.geographic).toBe(1.0);
    });
  });

  describe('trust dimension (deal-breaker)', () => {
    it('meeting threshold keeps score intact', () => {
      const trustMet = makeMatchInput({
        providerTrustScore: 0.9,
        recipientMinTrust: 0.5,
      });
      const result = scoreMatch(trustMet);
      expect(result.breakdown.trust).toBe(1.0);
      expect(result.overall).toBeGreaterThan(0);
    });

    it('below threshold zeros entire score', () => {
      const trustNotMet = makeMatchInput({
        providerTrustScore: 0.2,
        recipientMinTrust: 0.5,
      });
      const result = scoreMatch(trustNotMet);
      expect(result.breakdown.trust).toBe(0.0);
      expect(result.overall).toBe(0);
    });
  });

  describe('surplus sensitivity dimension', () => {
    it('hours urgency scores higher than weeks', () => {
      const hours = makeMatchInput({
        offering: makeOffering({ surplusTimeSensitivity: 'hours' }),
        need: makeNeed({ urgentDeadline: true }),
      });
      const weeks = makeMatchInput({
        offering: makeOffering({ surplusTimeSensitivity: 'weeks' }),
        need: makeNeed({ urgentDeadline: true }),
      });

      // Sanity: sensitivities differ
      expect(hours.offering.surplusTimeSensitivity).not.toBe(
        weeks.offering.surplusTimeSensitivity
      );

      const hoursResult = scoreMatch(hours);
      const weeksResult = scoreMatch(weeks);
      expect(hoursResult.breakdown.surplusSensitivity).toBeGreaterThan(
        weeksResult.breakdown.surplusSensitivity
      );
    });

    it('no sensitivity produces mid-range score', () => {
      const noSensitivity = makeMatchInput({
        offering: makeOffering({ surplusTimeSensitivity: 'none' }),
      });
      const result = scoreMatch(noSensitivity);
      expect(result.breakdown.surplusSensitivity).toBeCloseTo(0.5, 4);
    });
  });

  describe('diversity dimension', () => {
    it('new partner scores higher than existing partner', () => {
      const newPartner = makeMatchInput({ existingPartnership: false });
      const existingPartner = makeMatchInput({ existingPartnership: true });

      // Sanity: partnership flags differ
      expect(newPartner.existingPartnership).not.toBe(
        existingPartner.existingPartnership
      );

      const newResult = scoreMatch(newPartner);
      const existingResult = scoreMatch(existingPartner);
      expect(newResult.breakdown.diversity).toBeGreaterThan(
        existingResult.breakdown.diversity
      );
    });
  });

  describe('sector overlap dimension', () => {
    it('matching sector tags score higher than no overlap', () => {
      const matching = makeMatchInput({
        offering: makeOffering({ sectorTags: ['technology', 'consulting'] }),
        need: makeNeed({ sectorTags: ['technology'] }),
      });
      const noOverlap = makeMatchInput({
        offering: makeOffering({ sectorTags: ['agriculture'] }),
        need: makeNeed({ sectorTags: ['technology'] }),
      });

      // Sanity: sector tags differ
      expect(matching.offering.sectorTags).not.toEqual(
        noOverlap.offering.sectorTags
      );

      const matchResult = scoreMatch(matching);
      const noOverlapResult = scoreMatch(noOverlap);
      expect(matchResult.breakdown.sector).toBeGreaterThan(
        noOverlapResult.breakdown.sector
      );
    });

    it('no data produces mid-range score', () => {
      const noData = makeMatchInput({
        offering: makeOffering({ sectorTags: undefined }),
        need: makeNeed({ sectorTags: undefined }),
      });
      const result = scoreMatch(noData);
      expect(result.breakdown.sector).toBeCloseTo(0.5, 4);
    });
  });

  // ===========================================================================
  // Deal-breaker integration tests
  // ===========================================================================

  describe('deal-breaker integration', () => {
    it('trust deal-breaker zeros overall regardless of high scores on other dimensions', () => {
      const input = makeMatchInput({
        offering: makeOffering({
          type: 'service',
          title: 'Web Development',
          description: 'Expert web development',
          capabilities: ['web development'],
          sectorTags: ['technology'],
          surplusTimeSensitivity: 'hours',
        }),
        need: makeNeed({
          type: 'service',
          title: 'Need Web Development',
          description: 'Looking for web development',
          explicitMatches: ['web development'],
          sectorTags: ['technology'],
          urgentDeadline: true,
        }),
        providerTrustScore: 0.1,
        recipientMinTrust: 0.9,
        existingPartnership: false,
      });
      const result = scoreMatch(input);
      expect(result.breakdown.trust).toBe(0.0);
      // Other dimensions should still be high
      expect(result.breakdown.semantic).toBeGreaterThan(0.5);
      expect(result.overall).toBe(0);
    });

    it('geographic deal-breaker zeros overall regardless of high scores on other dimensions', () => {
      const input = makeMatchInput({
        offering: makeOffering({
          type: 'service',
          title: 'Web Development',
          description: 'Expert web development',
          capabilities: ['web development'],
          constraints: { geographic: ['Antarctica'] },
          sectorTags: ['technology'],
          surplusTimeSensitivity: 'hours',
        }),
        need: makeNeed({
          type: 'service',
          title: 'Need Web Development',
          description: 'Looking for web development',
          explicitMatches: ['web development'],
          constraints: {
            geographic: { acceptedRegions: ['UK'] },
          },
          sectorTags: ['technology'],
          urgentDeadline: true,
        }),
        providerTrustScore: 0.9,
        recipientMinTrust: 0.3,
        existingPartnership: false,
      });
      const result = scoreMatch(input);
      expect(result.breakdown.geographic).toBe(0.0);
      expect(result.breakdown.trust).toBe(1.0);
      expect(result.overall).toBe(0);
    });

    it('both deal-breakers pass and score reflects other dimensions', () => {
      const input = makeMatchInput({
        offering: makeOffering({
          constraints: { geographic: ['UK'] },
        }),
        need: makeNeed({
          constraints: {
            geographic: { acceptedRegions: ['UK'] },
          },
        }),
        providerTrustScore: 0.8,
        recipientMinTrust: 0.3,
      });
      const result = scoreMatch(input);
      expect(result.breakdown.trust).toBe(1.0);
      expect(result.breakdown.geographic).toBe(1.0);
      expect(result.overall).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // Documentation tests
  // Documents scoring weights — update if formula changes
  // ===========================================================================

  describe('documentation tests', () => {
    // Documents scoring weights — update if formula changes

    it('verifies exact overall score for a fully-specified input', () => {
      // Construct an input where we can compute every dimension exactly
      const input = makeMatchInput({
        offering: makeOffering({
          type: 'service',
          title: 'Web Development',
          description: 'Professional web development services',
          capabilities: ['web development'],
          constraints: { geographic: ['UK'] },
          surplusTimeSensitivity: 'hours',
          sectorTags: ['technology'],
        }),
        need: makeNeed({
          type: 'service',
          title: 'Web Development Needed',
          description: 'Looking for web development services',
          explicitMatches: ['web development'],
          constraints: {
            geographic: { acceptedRegions: ['UK'] },
            timing: { neededBy: '2025-12-31' },
          },
          sectorTags: ['technology'],
          urgentDeadline: true,
        }),
        providerTrustScore: 0.9,
        recipientMinTrust: 0.3,
        existingPartnership: false,
      });

      const result = scoreMatch(input);

      // Compute expected values per dimension:

      // 1. Semantic:
      //   typeScore = 1.0 (both 'service')
      //   offering text: "Web Development Professional web development services"
      //   offering keywords: ['web', 'development', 'professional', 'services']
      //   need text: "Web Development Needed Looking for web development services"
      //   need keywords: ['web', 'development', 'needed', 'looking', 'services']
      //   keyword matches: 'web', 'development', 'services' = 3/5 = 0.6
      //   capability: 'web development' includes 'web development' => match => 1/1 = 1.0
      //   semantic = 1.0*0.3 + 0.6*0.4 + 1.0*0.3 = 0.3 + 0.24 + 0.3 = 0.84
      expect(result.breakdown.semantic).toBeCloseTo(0.84, 4);

      // 2. Capacity: always 1.0
      expect(result.breakdown.capacity).toBe(1.0);

      // 3. Timing: no offering timing, need has neededBy but offering has no timing constraints
      //   offering has no timing -> availableUntil and availableFrom both undefined
      //   "Offering has open availability" -> 1.0
      expect(result.breakdown.timing).toBeCloseTo(1.0, 4);

      // 4. Geographic: both UK -> 1.0
      expect(result.breakdown.geographic).toBe(1.0);

      // 5. Trust: 0.9 >= 0.3 -> 1.0
      expect(result.breakdown.trust).toBe(1.0);

      // 6. Surplus sensitivity: hours + urgent = 1.0
      expect(result.breakdown.surplusSensitivity).toBeCloseTo(1.0, 4);

      // 7. Diversity: new partnership = 1.0
      expect(result.breakdown.diversity).toBeCloseTo(1.0, 4);

      // 8. Sector: 'technology' matches => 1/1 = 1.0
      expect(result.breakdown.sector).toBeCloseTo(1.0, 4);

      // Overall = semantic*0.30 + timing*0.15 + capacity*0.10 + surplus*0.15 + diversity*0.15 + sector*0.15
      //         = 0.84*0.30 + 1.0*0.15 + 1.0*0.10 + 1.0*0.15 + 1.0*0.15 + 1.0*0.15
      //         = 0.252 + 0.15 + 0.10 + 0.15 + 0.15 + 0.15
      //         = 0.952
      expect(result.overall).toBeCloseTo(0.952, 4);
    });

    it('capacity always returns 1.0 (Phase 1 stub)', () => {
      const result = scoreMatch(makeMatchInput());
      expect(result.breakdown.capacity).toBe(1.0);
    });

    it('reasons array is non-empty', () => {
      const result = scoreMatch(makeMatchInput());
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('overall score is weighted combination of non-deal-breaker dimensions', () => {
      // Documents scoring weights — update if formula changes
      // Weights: semantic 0.30, timing 0.15, capacity 0.10, surplus 0.15, diversity 0.15, sector 0.15
      const input = makeMatchInput({ existingPartnership: true });
      const result = scoreMatch(input);

      // Verify it's the weighted combination (deal-breakers both pass here)
      const expected =
        result.breakdown.semantic * 0.30 +
        result.breakdown.timing * 0.15 +
        result.breakdown.capacity * 0.10 +
        result.breakdown.surplusSensitivity * 0.15 +
        result.breakdown.diversity * 0.15 +
        result.breakdown.sector * 0.15;
      expect(result.overall).toBeCloseTo(expected, 4);
    });

    it('breakdown contains all 8 dimensions', () => {
      // Documents scoring weights — update if formula changes
      const result = scoreMatch(makeMatchInput());
      const keys = Object.keys(result.breakdown);
      expect(keys).toContain('semantic');
      expect(keys).toContain('capacity');
      expect(keys).toContain('timing');
      expect(keys).toContain('geographic');
      expect(keys).toContain('trust');
      expect(keys).toContain('surplusSensitivity');
      expect(keys).toContain('diversity');
      expect(keys).toContain('sector');
      expect(keys).toHaveLength(8);
    });
  });

  // ===========================================================================
  // Defensive input tests
  // ===========================================================================

  describe('defensive inputs', () => {
    it('offering with empty capabilities and need with empty explicitMatches does not throw', () => {
      const input = makeMatchInput({
        offering: makeOffering({ capabilities: [] }),
        need: makeNeed({ explicitMatches: [] }),
      });
      expect(() => scoreMatch(input)).not.toThrow();
      const result = scoreMatch(input);
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(1);
    });

    it('missing optional fields does not throw', () => {
      const input = makeMatchInput({
        offering: makeOffering({
          surplusTimeSensitivity: undefined,
          sectorTags: undefined,
          constraints: {},
        }),
        need: makeNeed({
          urgentDeadline: undefined,
          sectorTags: undefined,
          constraints: {},
        }),
        existingPartnership: undefined,
      });
      expect(() => scoreMatch(input)).not.toThrow();
      const result = scoreMatch(input);
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(1);
    });
  });
});
