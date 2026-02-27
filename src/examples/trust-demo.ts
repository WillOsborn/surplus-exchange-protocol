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
  validateVouch,
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

const participants: Record<string, TrustInput> = {
  // Experienced anchor participant
  anchor_alice: {
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

  // Established participant
  established_bob: {
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

  // New probationary participant
  probationary_carol: {
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

  // Brand new participant (needs vouch)
  newcomer_dave: {
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

  // Participant with issues (at risk)
  atrisk_eve: {
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
};

// ═══════════════════════════════════════════════════════════════════════════════
// Demo Functions
// ═══════════════════════════════════════════════════════════════════════════════

function demonstrateTrustScores() {
  console.log('═'.repeat(70));
  console.log('  1. Trust Score Computation');
  console.log('═'.repeat(70));
  console.log();

  for (const [name, input] of Object.entries(participants)) {
    const score = computeTrustScore(input);
    console.log(`${name}:`);
    console.log(`  Overall: ${score.overall.toFixed(3)} (${score.confidence} confidence)`);
    console.log(`  Components:`);
    console.log(`    Reliability:     ${score.components.reliability.toFixed(3)}`);
    console.log(`    Experience:      ${score.components.experience.toFixed(3)}`);
    console.log(`    Network:         ${score.components.networkStrength.toFixed(3)}`);
    console.log(`    Recency:         ${score.components.recency.toFixed(3)}`);
    console.log();
  }
}

function demonstrateTierAssessment() {
  console.log('═'.repeat(70));
  console.log('  2. Tier Assessment & Progression');
  console.log('═'.repeat(70));
  console.log();

  for (const [name, input] of Object.entries(participants)) {
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

    console.log(`${name}:`);
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
  for (const tier of ['probationary', 'established', 'anchor'] as const) {
    console.log(summariseExposureLimits(tier));
    console.log();
  }

  // Demonstrate exposure checking
  console.log('─'.repeat(70));
  console.log('  Exposure Check Examples');
  console.log('─'.repeat(70));
  console.log();

  // Carol (probationary) trying to join a chain
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

  // Check if Carol can join a new chain
  const carolCheck = checkExposure({
    tier: 'probationary',
    currentExposure: carolExposure,
    proposedValue: 8,
    proposedChainLength: 3,
    involvesPhysicalGoods: false,
  });

  console.log('  Can Carol join a chain worth 8 units?');
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

  const existingVouches: Vouch[] = [];

  // Alice (anchor) vouches for Dave (newcomer)
  console.log('─── Scenario: Alice vouches for Dave ───');
  console.log();

  const aliceCapacityBefore = getVouchCapacity(
    'anchor_alice',
    'anchor',
    existingVouches,
    { successful: 3, problematic: 0 }
  );
  console.log('Alice vouch capacity before:');
  console.log(`  Max vouches: ${aliceCapacityBefore.maxVouches}`);
  console.log(`  Active: ${aliceCapacityBefore.activeVouches}`);
  console.log(`  Remaining: ${aliceCapacityBefore.remainingCapacity}`);
  console.log(`  History: ${aliceCapacityBefore.vouchHistory.successful} successful, ${aliceCapacityBefore.vouchHistory.problematic} problematic`);
  console.log();

  const vouchResult = createVouch(
    'anchor_alice',
    'newcomer_dave',
    'anchor',
    existingVouches,
    'Met Dave at industry conference. Strong professional background.'
  );

  if ('vouch' in vouchResult) {
    existingVouches.push(vouchResult.vouch);
    console.log('Vouch created successfully:');
    console.log(`  ID: ${vouchResult.vouch.id}`);
    console.log(`  Sponsor: ${vouchResult.vouch.sponsorId}`);
    console.log(`  Sponsored: ${vouchResult.vouch.sponsoredId}`);
    console.log(`  Expires: ${vouchResult.vouch.expiresAt}`);
    console.log(`  Notes: ${vouchResult.vouch.notes}`);
  } else {
    console.log(`Vouch failed: ${vouchResult.error}`);
  }
  console.log();

  // Validate the vouch
  if (existingVouches.length > 0) {
    const validation = validateVouch(existingVouches[0]);
    console.log(`Vouch validation: ${validation.valid ? 'Valid' : `Invalid - ${validation.reason}`}`);
    console.log();
  }

  // Try to have Carol (probationary) vouch - should fail
  console.log('─── Scenario: Carol tries to vouch (should fail) ───');
  console.log();

  const carolVouchResult = createVouch(
    'probationary_carol',
    'newcomer_dave',
    'probationary',
    existingVouches
  );

  if ('error' in carolVouchResult) {
    console.log(`Expected failure: ${carolVouchResult.error}`);
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

  // Create a vouch that's already expired
  const expiredVouch: Vouch = {
    id: 'expired-vouch-123',
    sponsorId: 'established_bob',
    sponsoredId: 'some_participant',
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), // 100 days ago
    expiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
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

  demonstrateTrustScores();
  demonstrateTierAssessment();
  demonstrateExposureLimits();
  demonstrateVouching();

  console.log('═'.repeat(70));
  console.log('  Summary');
  console.log('═'.repeat(70));
  console.log();
  console.log('  The SEP trust system provides:');
  console.log('  • Multi-factor trust scoring (reliability, experience, network, recency)');
  console.log('  • Graduated tier progression (Probationary → Established → Anchor)');
  console.log('  • Exposure limits to manage risk');
  console.log('  • Vouching for network entry with reputation consequences');
  console.log();
  console.log('  This enables a self-regulating network where:');
  console.log('  • New participants can join with sponsor backing');
  console.log('  • Risk is limited based on demonstrated trustworthiness');
  console.log('  • Bad actors face consequences that affect their sponsors');
  console.log('  • Reliable participants gain expanded capabilities');
  console.log();
  console.log('═'.repeat(70));
}

main();
