import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  createVouch,
  validateVouch,
  getVouchCapacity,
  calculateVouchImpact,
  revokeVouch,
  processExpiredVouches,
  DEFAULT_VOUCHING_CONFIG,
  type Vouch,
  type VouchStatus,
  type SponsoredBehaviour,
} from './vouching.js';

// =============================================================================
// Inline helpers
// =============================================================================

function makeVouch(overrides: Partial<Vouch> = {}): Vouch {
  return {
    id: 'v1',
    sponsorId: 's1',
    sponsoredId: 'sp1',
    createdAt: '2026-01-01T00:00:00.000Z',
    expiresAt: '2026-04-01T00:00:00.000Z',
    status: 'active' as VouchStatus,
    ...overrides,
  };
}

// =============================================================================
// createVouch()
// =============================================================================

describe('createVouch', () => {
  // createVouch() uses new Date() internally — fake timers required
  afterEach(() => vi.useRealTimers());

  it('creates valid vouch for established sponsor', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01T12:00:00.000Z'));

    const result = createVouch('sponsor1', 'newbie1', 'established', []);
    expect('vouch' in result).toBe(true);

    if ('vouch' in result) {
      expect(result.vouch.sponsorId).toBe('sponsor1');
      expect(result.vouch.sponsoredId).toBe('newbie1');
      expect(result.vouch.status).toBe('active');
      expect(result.vouch.createdAt).toBe('2026-03-01T12:00:00.000Z');
      // Default duration 90 days from 2026-03-01 => 2026-05-30
      const expiresAt = new Date(result.vouch.expiresAt);
      const createdAt = new Date(result.vouch.createdAt);
      const daysDiff = Math.round(
        (expiresAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(daysDiff).toBe(DEFAULT_VOUCHING_CONFIG.defaultDurationDays);
    }
  });

  it('creates valid vouch for anchor sponsor', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01T12:00:00.000Z'));

    const result = createVouch('anchor1', 'newbie1', 'anchor', []);
    expect('vouch' in result).toBe(true);

    if ('vouch' in result) {
      expect(result.vouch.sponsorId).toBe('anchor1');
      expect(result.vouch.status).toBe('active');
    }
  });

  it('returns error for newcomer sponsor', () => {
    const result = createVouch('newcomer1', 'newbie1', 'newcomer', []);
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('newcomer');
    }
  });

  it('returns error for probationary sponsor', () => {
    const result = createVouch('probationary1', 'newbie1', 'probationary', []);
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('probationary');
    }
  });

  it('returns error when sponsor already has active vouch for same participant', () => {
    const existingVouches = [
      makeVouch({ sponsorId: 'sponsor1', sponsoredId: 'newbie1', status: 'active' }),
    ];
    const result = createVouch('sponsor1', 'newbie1', 'established', existingVouches);
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('already has an active vouch');
    }
  });

  it('returns error when sponsor at max capacity', () => {
    // Established max is 2
    const existingVouches = [
      makeVouch({ id: 'v1', sponsorId: 'sponsor1', sponsoredId: 'a', status: 'active' }),
      makeVouch({ id: 'v2', sponsorId: 'sponsor1', sponsoredId: 'b', status: 'active' }),
    ];
    const result = createVouch('sponsor1', 'newbie1', 'established', existingVouches);
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('maximum vouch capacity');
      expect(result.error).toContain('2');
    }
  });
});

// =============================================================================
// validateVouch()
// =============================================================================

describe('validateVouch', () => {
  it('returns valid for active vouch within expiry', () => {
    const vouch = makeVouch({
      status: 'active',
      expiresAt: '2026-04-01T00:00:00.000Z',
    });
    const result = validateVouch(vouch, new Date('2026-02-15T00:00:00.000Z'));
    expect(result.valid).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('returns invalid for revoked vouch', () => {
    const vouch = makeVouch({ status: 'revoked' });
    const result = validateVouch(vouch);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('revoked');
  });

  it('returns invalid for active vouch past expiry date', () => {
    const vouch = makeVouch({
      status: 'active',
      expiresAt: '2026-01-15T00:00:00.000Z',
    });
    // currentTime is after expiresAt
    const result = validateVouch(vouch, new Date('2026-03-01T00:00:00.000Z'));
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('expired');
  });
});

// =============================================================================
// getVouchCapacity()
// =============================================================================

describe('getVouchCapacity', () => {
  it('returns correct max/active/remaining for established and anchor', () => {
    const vouches = [
      makeVouch({ sponsorId: 'est1', sponsoredId: 'a', status: 'active' }),
      makeVouch({ sponsorId: 'est1', sponsoredId: 'b', status: 'expired' }),
    ];

    const established = getVouchCapacity(
      'est1', 'established', vouches, { successful: 1, problematic: 0 }
    );
    expect(established.maxVouches).toBe(2);
    expect(established.activeVouches).toBe(1);  // only 1 active
    expect(established.remainingCapacity).toBe(1);
    expect(established.vouchHistory.totalGiven).toBe(2);

    const anchor = getVouchCapacity(
      'anc1', 'anchor', [], { successful: 5, problematic: 1 }
    );
    expect(anchor.maxVouches).toBe(5);
    expect(anchor.activeVouches).toBe(0);
    expect(anchor.remainingCapacity).toBe(5);
  });

  it('returns 0 capacity for newcomer and probationary', () => {
    const newcomer = getVouchCapacity(
      'new1', 'newcomer', [], { successful: 0, problematic: 0 }
    );
    expect(newcomer.maxVouches).toBe(0);
    expect(newcomer.remainingCapacity).toBe(0);

    const probationary = getVouchCapacity(
      'prob1', 'probationary', [], { successful: 0, problematic: 0 }
    );
    expect(probationary.maxVouches).toBe(0);
    expect(probationary.remainingCapacity).toBe(0);
  });
});

// =============================================================================
// calculateVouchImpact()
// =============================================================================

describe('calculateVouchImpact', () => {
  it('returns correct reputation impact for each behaviour category', () => {
    const behaviours: SponsoredBehaviour[] = ['excellent', 'good', 'poor', 'problematic'];
    const expectedImpacts = [0.02, 0.01, -0.03, -0.08];

    for (let i = 0; i < behaviours.length; i++) {
      const result = calculateVouchImpact('sponsor1', behaviours[i]);
      expect(result.impactOnSponsor).toBeCloseTo(expectedImpacts[i], 4);
      expect(result.sponsorId).toBe('sponsor1');
      expect(result.sponsoredBehaviour).toBe(behaviours[i]);
      expect(result.reason).toBeTruthy();
    }
  });
});

// =============================================================================
// revokeVouch()
// =============================================================================

describe('revokeVouch', () => {
  it('returns new vouch with status revoked', () => {
    const original = makeVouch({ status: 'active' });
    const revoked = revokeVouch(original);

    expect(revoked.status).toBe('revoked');
    // Original should be unchanged
    expect(original.status).toBe('active');
    // Other fields preserved
    expect(revoked.id).toBe(original.id);
    expect(revoked.sponsorId).toBe(original.sponsorId);
  });

  it('appends reason to notes', () => {
    const withExistingNotes = makeVouch({ notes: 'Original note' });
    const revoked = revokeVouch(withExistingNotes, 'Trust violation');
    expect(revoked.notes).toContain('Original note');
    expect(revoked.notes).toContain('[Revoked: Trust violation]');

    const withoutNotes = makeVouch();
    const revokedNoNotes = revokeVouch(withoutNotes, 'Inactive');
    expect(revokedNoNotes.notes).toContain('[Revoked: Inactive]');
  });
});

// =============================================================================
// processExpiredVouches()
// =============================================================================

describe('processExpiredVouches', () => {
  it('marks active vouches past expiry as expired', () => {
    const vouches = [
      makeVouch({ id: 'v1', status: 'active', expiresAt: '2026-01-15T00:00:00.000Z' }),
      makeVouch({ id: 'v2', status: 'active', expiresAt: '2026-02-01T00:00:00.000Z' }),
    ];
    const currentTime = new Date('2026-03-01T00:00:00.000Z');
    const result = processExpiredVouches(vouches, currentTime);

    expect(result[0].status).toBe('expired');
    expect(result[1].status).toBe('expired');
    // Originals unchanged
    expect(vouches[0].status).toBe('active');
    expect(vouches[1].status).toBe('active');
  });

  it('leaves active vouches within expiry and non-active vouches unchanged', () => {
    const vouches = [
      makeVouch({ id: 'v1', status: 'active', expiresAt: '2026-06-01T00:00:00.000Z' }),
      makeVouch({ id: 'v2', status: 'revoked', expiresAt: '2026-01-01T00:00:00.000Z' }),
      makeVouch({ id: 'v3', status: 'expired', expiresAt: '2025-12-01T00:00:00.000Z' }),
    ];
    const currentTime = new Date('2026-03-01T00:00:00.000Z');
    const result = processExpiredVouches(vouches, currentTime);

    expect(result[0].status).toBe('active');   // still within expiry
    expect(result[1].status).toBe('revoked');  // non-active, left as-is
    expect(result[2].status).toBe('expired');  // non-active, left as-is
  });
});
