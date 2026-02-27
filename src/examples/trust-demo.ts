/**
 * SEP Trust System Demonstration
 *
 * Demonstrates the full trust system including:
 * - Trust score computation
 * - Tier assessment and progression
 * - Exposure limit enforcement
 * - Vouching workflow
 */

import {
  computeTrustScore,
  assessTier,
  summariseTierAssessment,
  checkExposure,
  summariseExposureLimits,
  summariseCurrentExposure,
  createVouch,
  getVouchCapacity,
  calculateVouchImpact,
  processExpiredVouches,
  type TrustInput,
  type CurrentExposure,
  type Vouch,
} from '../trust/index.js';

// ═══════════════════════════════════════════════════════════════════════════════
// Sample Participant Data
// ═══════════════════════════════════════════════════════════════════════════════

const participants: Record<string, { input: TrustInput; display: string; description: string }> = {
  // Anchor: the network backbone
  anchor_alice: {
    display: 'Alice (Harrison & Co Solicitors)',
    description: 'Anchor — 83 exchanges, 22 partners, 450 days in network',
    input: {
      participantId: 'anchor_alice',
      satisfactionHistory: {
        asProvider: { total: 45, satisfied: 44, disputed: 1 },
        asRecipient: { total: 38, satisfied: 37, disputed: 0 },
      },
      networkPosition: {
        partnerCount: 22,
        repeatPartners: 15,
        networkAge: 450,
        vouchesReceived: 8,
        vouchesGiven: 4,
      },
      recentActivity: {
        last30Days: 3,
        last90Days: 8,
        daysSinceLastExchange: 5,
      },
    },
  },

  // Established: proven track record
  established_bob: {
    display: 'Bob (Savour Events Catering)',
    description: 'Established — 20 exchanges, 7 partners, 120 days',
    input: {
      participantId: 'established_bob',
      satisfactionHistory: {
        asProvider: { total: 12, satisfied: 11, disputed: 1 },
        asRecipient: { total: 8, satisfied: 8, disputed: 0 },
      },
      networkPosition: {
        partnerCount: 7,
        repeatPartners: 3,
        networkAge: 120,
        vouchesReceived: 2,
        vouchesGiven: 1,
      },
      recentActivity: {
        last30Days: 1,
        last90Days: 4,
        daysSinceLastExchange: 18,
      },
    },
  },

  // Probationary: early track record
  probationary_carol: {
    display: 'Carol (Pixel & Grain Studio)',
    description: 'Probationary — 3 exchanges, 2 partners, 15 days',
    input: {
      participantId: 'probationary_carol',
      satisfactionHistory: {
        asProvider: { total: 2, satisfied: 2, disputed: 0 },
        asRecipient: { total: 1, satisfied: 1, disputed: 0 },
      },
      networkPosition: {
        partnerCount: 2,
        repeatPartners: 0,
        networkAge: 15,
        vouchesReceived: 1,
        vouchesGiven: 0,
      },
      recentActivity: {
        last30Days: 2,
        last90Days: 3,
        daysSinceLastExchange: 3,
      },
    },
  },

  // Newcomer: zero history, no vouch
  newcomer_dave: {
    display: 'Dave (new joiner)',
    description: 'Newcomer — zero exchanges, zero network, just verified',
    input: {
      participantId: 'newcomer_dave',
      satisfactionHistory: {
        asProvider: { total: 0, satisfied: 0, disputed: 0 },
        asRecipient: { total: 0, satisfied: 0, disputed: 0 },
      },
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
        daysSinceLastExchange: 0,
      },
    },
  },

  // Vouched newcomer: zero exchanges but has a vouch
  vouched_frank: {
    display: 'Frank (ByteForge Solutions — vouched)',
    description: 'Newcomer with vouch — zero exchanges, but Alice vouched for him',
    input: {
      participantId: 'vouched_frank',
      satisfactionHistory: {
        asProvider: { total: 0, satisfied: 0, disputed: 0 },
        asRecipient: { total: 0, satisfied: 0, disputed: 0 },
      },
      networkPosition: {
        partnerCount: 0,
        repeatPartners: 0,
        networkAge: 2,
        vouchesReceived: 1,
        vouchesGiven: 0,
      },
      recentActivity: {
        last30Days: 0,
        last90Days: 0,
        daysSinceLastExchange: 0,
      },
    },
  },

  // At-risk: declining reliability
  atrisk_eve: {
    display: 'Eve (Momentum Marketing — at risk)',
    description: 'At risk — 8 provider exchanges, 3 disputes, declining activity',
    input: {
      participantId: 'atrisk_eve',
      satisfactionHistory: {
        asProvider: { total: 8, satisfied: 5, disputed: 3 },
        asRecipient: { total: 6, satisfied: 4, disputed: 1 },
      },
      networkPosition: {
        partnerCount: 4,
        repeatPartners: 1,
        networkAge: 90,
        vouchesReceived: 1,
        vouchesGiven: 0,
      },
      recentActivity: {
        last30Days: 0,
        last90Days: 1,
        daysSinceLastExchange: 45,
      },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════

function narrateTrustScore(name: string, input: TrustInput, score: ReturnType<typeof computeTrustScore>): string {
  const p = input.networkPosition;
  const h = input.satisfactionHistory;
  const totalExchanges = h.asProvider.total + h.asRecipient.total;
  const totalDisputes = h.asProvider.disputed + h.asRecipient.disputed;

  if (totalExchanges === 0) {
    return `${name} has no exchange history — baseline trust score assigned`;
  }

  const parts: string[] = [];

  // Network strength narrative
  if (p.partnerCount >= 15) {
    parts.push(`high network strength (${score.components.networkStrength.toFixed(2)}) reflects ${p.partnerCount} unique partners including ${p.repeatPartners} repeat relationships`);
  } else if (p.partnerCount >= 5) {
    parts.push(`growing network (${score.components.networkStrength.toFixed(2)}) with ${p.partnerCount} partners, ${p.repeatPartners} repeat`);
  } else {
    parts.push(`small network (${p.partnerCount} partners)`);
  }

  // Reliability narrative
  if (totalDisputes > 0) {
    parts.push(`reliability ${score.components.reliability.toFixed(2)} reflects ${totalDisputes} dispute${totalDisputes > 1 ? 's' : ''} in ${totalExchanges} exchanges`);
  } else {
    parts.push(`${totalExchanges} exchanges with no disputes`);
  }

  // Recency narrative
  if (input.recentActivity.daysSinceLastExchange > 30) {
    parts.push(`inactive for ${input.recentActivity.daysSinceLastExchange} days`);
  }

  return `${name}'s ${parts.join(', ')}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Demo Functions
// ═══════════════════════════════════════════════════════════════════════════════

function demonstrateTrustScores() {
  console.log('═'.repeat(70));
  console.log('  1. Trust Score Computation');
  console.log('═'.repeat(70));
  console.log();

  for (const [, entry] of Object.entries(participants)) {
    const score = computeTrustScore(entry.input);
    console.log(`${entry.display}:`);
    console.log(`  Overall: ${score.overall.toFixed(3)} (${score.confidence} confidence)`);
    console.log(`  Components:`);
    console.log(`    Reliability:     ${score.components.reliability.toFixed(3)}`);
    console.log(`    Experience:      ${score.components.experience.toFixed(3)}`);
    console.log(`    Network:         ${score.components.networkStrength.toFixed(3)}`);
    console.log(`    Recency:         ${score.components.recency.toFixed(3)}`);
    console.log(`  ${narrateTrustScore(entry.display.split(' (')[0], entry.input, score)}`);
    console.log();
  }
}

function demonstrateTierAssessment() {
  console.log('═'.repeat(70));
  console.log('  2. Tier Assessment & Progression');
  console.log('═'.repeat(70));
  console.log();
  console.log('  SEP uses 4 tiers: Newcomer → Probationary → Established → Anchor');
  console.log('  Each tier unlocks greater chain participation and exposure limits.');
  console.log('  Vouching by Established/Anchor members accelerates past Newcomer.');
  console.log();

  for (const [, entry] of Object.entries(participants)) {
    const input = entry.input;
    const score = computeTrustScore(input);
    const totalExchanges =
      input.satisfactionHistory.asProvider.total +
      input.satisfactionHistory.asRecipient.total;

    const assessment = assessTier({
      score,
      completedExchanges: totalExchanges,
      networkAgeDays: input.networkPosition.networkAge,
      uniquePartners: input.networkPosition.partnerCount,
      hasActiveVouch: input.networkPosition.vouchesReceived > 0,
    });

    console.log(`${entry.display}:`);
    console.log(summariseTierAssessment(assessment).split('\n').map(l => '  ' + l).join('\n'));
    console.log();
  }
}

function demonstrateExposureLimits() {
  console.log('═'.repeat(70));
  console.log('  3. Exposure Limits');
  console.log('═'.repeat(70));
  console.log();

  // Show limits for each tier
  for (const tier of ['newcomer', 'probationary', 'established', 'anchor'] as const) {
    console.log(summariseExposureLimits(tier));
    console.log();
  }

  // Demonstrate exposure checking
  console.log('─'.repeat(70));
  console.log('  Exposure Check Examples');
  console.log('─'.repeat(70));
  console.log();

  // Dave (newcomer) trying to join a 3-party chain — should be blocked
  const daveExposure: CurrentExposure = {
    outstandingValue: 0,
    activeChains: 0,
    pendingAsProvider: 0,
    pendingAsRecipient: 0,
    daysSinceLastDispute: null,
  };

  console.log('Dave (newcomer) tries to join a 3-party chain:');
  const daveCheck = checkExposure({
    tier: 'newcomer',
    currentExposure: daveExposure,
    proposedValue: 5,
    proposedChainLength: 3,
    involvesPhysicalGoods: false,
  });

  console.log(`  Allowed: ${daveCheck.allowed}`);
  if (!daveCheck.allowed) {
    console.log(`  Reason: ${daveCheck.reason}`);
  }
  console.log('  (Newcomers are limited to bilateral exchanges — max chain length 2)');
  console.log();

  // Carol (probationary) joins the same chain — should succeed
  const carolExposure: CurrentExposure = {
    outstandingValue: 15,
    activeChains: 1,
    pendingAsProvider: 10,
    pendingAsRecipient: 5,
    daysSinceLastDispute: null,
  };

  console.log('Carol (probationary) current state:');
  console.log(summariseCurrentExposure('probationary', carolExposure).split('\n').map(l => '  ' + l).join('\n'));
  console.log();

  const carolCheck = checkExposure({
    tier: 'probationary',
    currentExposure: carolExposure,
    proposedValue: 8,
    proposedChainLength: 3,
    involvesPhysicalGoods: false,
  });

  console.log('  Can Carol join the same 3-party chain (worth 8 units)?');
  console.log(`    Allowed: ${carolCheck.allowed}`);
  if (!carolCheck.allowed) {
    console.log(`    Reason: ${carolCheck.reason}`);
  }
  console.log(`    Remaining capacity: ${carolCheck.remainingCapacity.value} units, ${carolCheck.remainingCapacity.chains} chains`);
  console.log();

  // Alice (anchor) with more capacity
  const aliceExposure: CurrentExposure = {
    outstandingValue: 120,
    activeChains: 4,
    pendingAsProvider: 80,
    pendingAsRecipient: 40,
    daysSinceLastDispute: 200,
  };

  console.log('Alice (anchor) current state:');
  console.log(summariseCurrentExposure('anchor', aliceExposure).split('\n').map(l => '  ' + l).join('\n'));
  console.log();

  const aliceCheck = checkExposure({
    tier: 'anchor',
    currentExposure: aliceExposure,
    proposedValue: 150,
    proposedChainLength: 5,
    involvesPhysicalGoods: false,
  });

  console.log('  Can Alice join a chain worth 150 units?');
  console.log(`    Allowed: ${aliceCheck.allowed}`);
  if (!aliceCheck.allowed) {
    console.log(`    Reason: ${aliceCheck.reason}`);
  }
  console.log();
}

function demonstrateVouching() {
  console.log('═'.repeat(70));
  console.log('  4. Vouching System');
  console.log('═'.repeat(70));
  console.log();
  console.log('  Vouching accelerates newcomers past the Newcomer tier.');
  console.log('  Only Established and Anchor members can vouch.');
  console.log('  Sponsors bear reputation consequences for those they vouch for.');
  console.log();

  const existingVouches: Vouch[] = [];

  // Alice (anchor) vouches for Frank (newcomer)
  console.log('─── Scenario: Alice (Anchor) vouches for Frank ───');
  console.log();

  const aliceCapacityBefore = getVouchCapacity(
    'anchor_alice',
    'anchor',
    existingVouches,
    { successful: 3, problematic: 0 }
  );
  console.log('Alice vouch capacity:');
  console.log(`  Max vouches: ${aliceCapacityBefore.maxVouches}`);
  console.log(`  Active: ${aliceCapacityBefore.activeVouches}`);
  console.log(`  Remaining: ${aliceCapacityBefore.remainingCapacity}`);
  console.log();

  const vouchResult = createVouch(
    'anchor_alice',
    'vouched_frank',
    'anchor',
    existingVouches,
    'Met Frank at industry conference. Strong professional background.'
  );

  if ('vouch' in vouchResult) {
    existingVouches.push(vouchResult.vouch);
    console.log('Vouch created successfully:');
    console.log(`  Sponsor: ${vouchResult.vouch.sponsorId} → Sponsored: ${vouchResult.vouch.sponsoredId}`);
    console.log(`  Expires: ${vouchResult.vouch.expiresAt}`);
    console.log();

    // Show Frank's tier with and without vouch
    const frankInput = participants.vouched_frank.input;
    const frankScore = computeTrustScore(frankInput);

    const withoutVouch = assessTier({
      score: frankScore,
      completedExchanges: 0,
      networkAgeDays: frankInput.networkPosition.networkAge,
      uniquePartners: frankInput.networkPosition.partnerCount,
      hasActiveVouch: false,
    });

    const withVouch = assessTier({
      score: frankScore,
      completedExchanges: 0,
      networkAgeDays: frankInput.networkPosition.networkAge,
      uniquePartners: frankInput.networkPosition.partnerCount,
      hasActiveVouch: true,
    });

    console.log(`  Frank without vouch: ${withoutVouch.currentTier}`);
    console.log(`  Frank with vouch:    ${withVouch.currentTier} (vouch acceleration)`);
  } else {
    console.log(`Vouch failed: ${vouchResult.error}`);
  }
  console.log();

  // Bob (established) vouches successfully
  console.log('─── Scenario: Bob (Established) vouches for Dave ───');
  console.log();

  const bobVouchResult = createVouch(
    'established_bob',
    'newcomer_dave',
    'established',
    existingVouches,
    'Business contact from local networking group.'
  );

  if ('vouch' in bobVouchResult) {
    existingVouches.push(bobVouchResult.vouch);
    console.log('Vouch created successfully:');
    console.log(`  Sponsor: ${bobVouchResult.vouch.sponsorId} → Sponsored: ${bobVouchResult.vouch.sponsoredId}`);
    console.log('  (Established members can vouch — they have proven track records)');
  } else {
    console.log(`Vouch failed: ${bobVouchResult.error}`);
  }
  console.log();

  // Carol (probationary) tries to vouch - should fail
  console.log('─── Scenario: Carol (Probationary) tries to vouch ───');
  console.log();

  const carolVouchResult = createVouch(
    'probationary_carol',
    'newcomer_dave',
    'probationary',
    existingVouches
  );

  if ('error' in carolVouchResult) {
    console.log(`Expected failure: ${carolVouchResult.error}`);
    console.log('  (Only Established and Anchor members can vouch)');
  }
  console.log();

  // Demonstrate reputation impact
  console.log('─── Reputation Impact from Sponsored Behaviour ───');
  console.log();

  for (const behaviour of ['excellent', 'good', 'poor', 'problematic'] as const) {
    const impact = calculateVouchImpact('anchor_alice', behaviour);
    const sign = impact.impactOnSponsor >= 0 ? '+' : '';
    console.log(`  ${behaviour}: ${sign}${impact.impactOnSponsor.toFixed(2)}`);
    console.log(`    ${impact.reason}`);
    console.log();
  }

  // Demonstrate expiry processing
  console.log('─── Vouch Expiry Processing ───');
  console.log();

  const expiredVouch: Vouch = {
    id: 'expired-vouch-123',
    sponsorId: 'established_bob',
    sponsoredId: 'some_participant',
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  };

  const vouchesToProcess = [...existingVouches, expiredVouch];
  console.log(`Before processing: ${vouchesToProcess.filter(v => v.status === 'active').length} active vouches`);

  const processed = processExpiredVouches(vouchesToProcess);
  console.log(`After processing: ${processed.filter(v => v.status === 'active').length} active, ${processed.filter(v => v.status === 'expired').length} expired`);
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════════

function main() {
  console.log();
  console.log('╔'.padEnd(69, '═') + '╗');
  console.log('║' + '  SEP Trust System Demonstration'.padEnd(68) + '║');
  console.log('╚'.padEnd(69, '═') + '╝');
  console.log();
  console.log('  SEP trust is relational, not reputational. There are no star ratings');
  console.log('  or public review scores. Trust is computed from exchange history,');
  console.log('  network position, and vouching relationships.');
  console.log();
  console.log('  4-tier model: Newcomer → Probationary → Established → Anchor');
  console.log('  Each tier determines chain participation limits and exposure.');
  console.log('  Vouching by Established/Anchor members accelerates newcomers');
  console.log('  past the Newcomer tier — not a gate, but an accelerator.');
  console.log();

  demonstrateTrustScores();
  demonstrateTierAssessment();
  demonstrateExposureLimits();
  demonstrateVouching();

  console.log('═'.repeat(70));
  console.log('  Summary');
  console.log('═'.repeat(70));
  console.log();
  console.log('  The SEP trust system provides:');
  console.log('  - Multi-factor trust scoring (reliability, experience, network, recency)');
  console.log('  - 4-tier progression (Newcomer → Probationary → Established → Anchor)');
  console.log('  - Structural exposure limits per tier');
  console.log('  - Vouching as an accelerator with reputation consequences');
  console.log();
  console.log('  This enables a self-regulating network where:');
  console.log('  - New participants start with bilateral-only exchanges');
  console.log('  - Trusted members can accelerate newcomers via vouching');
  console.log('  - Risk is limited based on demonstrated trustworthiness');
  console.log('  - Bad actors face consequences that propagate to sponsors');
  console.log();
  console.log('═'.repeat(70));
}

main();
