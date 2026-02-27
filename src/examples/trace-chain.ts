/**
 * SEP Protocol Trace Demonstration
 *
 * Traces the lifecycle of exchange chains through state transitions
 * and illustrative protocol messages. Three scenarios demonstrate
 * the protocol's flexibility:
 *
 * 1. Happy path — full lifecycle from proposal to completion
 * 2. Counter-proposal — timing negotiation during confirmation
 * 3. Stuck flag — late delivery with partial satisfaction
 *
 * Run with: npm run trace
 */

import { ChainStateMachine, EdgeStateMachine } from '../protocol/state-machine.js';

// ═══════════════════════════════════════════════════════════════════════════════
// Characters — self-contained personas for the trace
// ═══════════════════════════════════════════════════════════════════════════════

const characters = {
  meridian: {
    id: 'participant-meridian-legal',
    name: 'Meridian Legal',
    tier: 'established' as const,
    activeChains: 3,
    offering: 'Contract review and commercial advisory',
    surplus: { why: 'Lighter caseload after year-end filings', timeSensitivity: 'weeks', fate: 'unused' },
  },
  bloom: {
    id: 'participant-bloom-catering',
    name: 'Bloom Catering',
    tier: 'probationary' as const,
    activeChains: 1,
    offering: 'Corporate event catering for 30-50 people',
    surplus: { why: 'Cancelled corporate booking left prepared ingredients', timeSensitivity: 'days', fate: 'disposal' },
  },
  fern: {
    id: 'participant-fern-studio',
    name: 'Fern Studio',
    tier: 'established' as const,
    activeChains: 2,
    offering: 'Brand identity design and guidelines',
    surplus: { why: 'Designer between projects, available for 3 weeks', timeSensitivity: 'none', fate: 'opportunity_cost' },
  },
};

const CHAIN_ID = 'chain-sep-demo-001';

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════

interface ProtocolMessage {
  type: string;
  fields: Record<string, string | number | boolean | object>;
}

function logMessage(msg: ProtocolMessage): void {
  console.log(`  Message: ${msg.type}`);
  for (const [key, value] of Object.entries(msg.fields)) {
    const display = typeof value === 'object' ? JSON.stringify(value) : String(value);
    console.log(`    ${key}: ${display}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Scenario 1: Happy Path
// ═══════════════════════════════════════════════════════════════════════════════

function scenarioHappyPath(): void {
  console.log('═'.repeat(70));
  console.log('  Scenario 1: Happy Path — 3-Party Chain');
  console.log('═'.repeat(70));
  console.log();
  console.log('  Chain:');
  console.log(`    Meridian Legal → Bloom Catering: Contract review`);
  console.log(`      Surplus: ${characters.meridian.surplus.why} (${characters.meridian.surplus.timeSensitivity})`);
  console.log(`    Bloom Catering → Fern Studio: Event catering for team day`);
  console.log(`      Surplus: ${characters.bloom.surplus.why} (${characters.bloom.surplus.timeSensitivity})`);
  console.log(`    Fern Studio → Meridian Legal: Brand refresh`);
  console.log(`      Surplus: ${characters.fern.surplus.why} (${characters.fern.surplus.timeSensitivity})`);
  console.log();

  const chain = new ChainStateMachine('draft');
  const edges = [
    new EdgeStateMachine('proposed'),
    new EdgeStateMachine('proposed'),
    new EdgeStateMachine('proposed'),
  ];

  // Step 1: Chain Proposed
  console.log('─── Step 1: Chain Proposed ───');
  const submitResult = chain.transition({ type: 'SUBMIT' });
  console.log(`  State: draft → ${submitResult.state}`);
  console.log();
  logMessage({
    type: 'ChainProposal',
    fields: {
      chain_id: CHAIN_ID,
      participants: [characters.meridian.id, characters.bloom.id, characters.fern.id],
      edge_count: 3,
      match_rationale: 'Complementary surplus: legal capacity + perishable catering + designer availability',
    },
  });
  console.log();

  // Step 2: First Confirmation
  console.log('─── Step 2: First Confirmation ───');
  console.log(`  ${characters.meridian.name} confirms (${characters.meridian.tier} tier, ${characters.meridian.activeChains} active chains)`);
  const firstConfirm = chain.transition({
    type: 'FIRST_CONFIRMATION',
    participantId: characters.meridian.id,
  });
  console.log(`  State: proposed → ${firstConfirm.state}`);
  console.log();
  logMessage({
    type: 'ParticipantConfirmation',
    fields: {
      chain_id: CHAIN_ID,
      participant_id: characters.meridian.id,
      decision: 'confirm',
      conditions: { preferred_start: '2026-03-10' },
    },
  });
  console.log();

  // Step 3: All Confirm
  console.log('─── Step 3: All Participants Confirm ───');
  console.log(`  ${characters.bloom.name} confirms (${characters.bloom.tier} tier)`);
  console.log(`  ${characters.fern.name} confirms (${characters.fern.tier} tier)`);
  const allConfirm = chain.transition({ type: 'ALL_CONFIRMED' });
  console.log(`  State: confirming → ${allConfirm.state}`);
  console.log();
  logMessage({
    type: 'ChainCommitment',
    fields: {
      chain_id: CHAIN_ID,
      status: 'committed',
      execution_window: { start: '2026-03-10', end: '2026-04-10' },
      escrow_required: false,
    },
  });
  console.log();

  // Step 4: Execution window opens
  console.log('─── Step 4: Execution Begins ───');
  for (const edge of edges) {
    edge.transition({ type: 'CHAIN_COMMITTED' });
  }
  chain.transition({ type: 'EXECUTION_WINDOW_OPEN' });
  console.log(`  State: committed → ${chain.state}`);
  console.log('  All 3 edges: proposed → both_confirmed');
  console.log();

  // Step 5: Edge execution
  const edgeLabels = [
    { from: characters.meridian.name, to: characters.bloom.name, what: 'Contract review' },
    { from: characters.bloom.name, to: characters.fern.name, what: 'Team day catering' },
    { from: characters.fern.name, to: characters.meridian.name, what: 'Brand refresh' },
  ];

  console.log('─── Step 5: Edges Execute ───');
  for (let i = 0; i < edges.length; i++) {
    edges[i].transition({ type: 'EXECUTION_START' });
    edges[i].transition({ type: 'DELIVERY_COMPLETE' });
    edges[i].transition({ type: 'SATISFACTION_SIGNAL', signal: 'satisfied' });
    console.log(`  ${edgeLabels[i].from} → ${edgeLabels[i].to}: ${edgeLabels[i].what}`);
    console.log(`    both_confirmed → in_progress → delivered → satisfied`);
  }
  console.log();

  // Step 6: Chain Completes
  console.log('─── Step 6: Chain Completes ───');
  const complete = chain.transition({ type: 'ALL_EDGES_SATISFIED' });
  console.log(`  State: executing → ${complete.state}`);
  console.log();
  logMessage({
    type: 'ChainCompletion',
    fields: {
      chain_id: CHAIN_ID,
      status: 'completed',
      edges_satisfied: 3,
      trust_updates: 'All participants: positive trust adjustment',
    },
  });
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
// Scenario 2: Counter-Proposal
// ═══════════════════════════════════════════════════════════════════════════════

function scenarioCounterProposal(): void {
  console.log('═'.repeat(70));
  console.log('  Scenario 2: Counter-Proposal — Timing Negotiation');
  console.log('═'.repeat(70));
  console.log();

  const chain = new ChainStateMachine('draft');
  chain.transition({ type: 'SUBMIT' });

  // Step 1: Meridian confirms
  console.log('─── Step 1: Meridian Confirms ───');
  chain.transition({ type: 'FIRST_CONFIRMATION', participantId: characters.meridian.id });
  console.log(`  State: proposed → ${chain.state}`);
  console.log();

  // Step 2: Bloom sends counter-proposal
  console.log('─── Step 2: Bloom Sends Counter-Proposal ───');
  console.log(`  Bloom's catering surplus expires in days (perishable ingredients).`);
  console.log(`  Requests earlier execution window.`);
  console.log();
  console.log(`  State remains: ${chain.state} (counter is a protocol message, not a state change)`);
  console.log();
  logMessage({
    type: 'ParticipantConfirmation',
    fields: {
      chain_id: CHAIN_ID,
      participant_id: characters.bloom.id,
      decision: 'counter',
      counter_proposal: { execution_window: { start: '2026-03-03', end: '2026-03-20' }, reason: 'Perishable ingredients — need earlier start' },
    },
  });
  console.log();

  // Step 3: Others accept counter
  console.log('─── Step 3: Counter Accepted ───');
  console.log('  Meridian and Fern accept the adjusted timing.');
  const allConfirm = chain.transition({ type: 'ALL_CONFIRMED' });
  console.log(`  State: confirming → ${allConfirm.state}`);
  console.log();
  logMessage({
    type: 'ChainCommitment',
    fields: {
      chain_id: CHAIN_ID,
      status: 'committed',
      execution_window: { start: '2026-03-03', end: '2026-03-20' },
      note: 'Adjusted per Bloom counter-proposal',
    },
  });
  console.log();
  console.log('  (Chain proceeds to execution as in Scenario 1)');
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
// Scenario 3: Stuck Flag
// ═══════════════════════════════════════════════════════════════════════════════

function scenarioStuckFlag(): void {
  console.log('═'.repeat(70));
  console.log('  Scenario 3: Stuck Flag — Late Delivery');
  console.log('═'.repeat(70));
  console.log();

  // Quick setup to executing state
  const chain = new ChainStateMachine('draft');
  chain.transition({ type: 'SUBMIT' });
  chain.transition({ type: 'FIRST_CONFIRMATION', participantId: characters.meridian.id });
  chain.transition({ type: 'ALL_CONFIRMED' });
  chain.transition({ type: 'EXECUTION_WINDOW_OPEN' });

  const edges = [
    new EdgeStateMachine('proposed'),
    new EdgeStateMachine('proposed'),
    new EdgeStateMachine('proposed'),
  ];
  for (const edge of edges) {
    edge.transition({ type: 'CHAIN_COMMITTED' });
  }

  console.log(`  Chain in executing state. All edges confirmed.`);
  console.log();

  // Edge 1 completes normally
  console.log('─── Step 1: First Edge Completes ───');
  edges[0].transition({ type: 'EXECUTION_START' });
  edges[0].transition({ type: 'DELIVERY_COMPLETE' });
  edges[0].transition({ type: 'SATISFACTION_SIGNAL', signal: 'satisfied' });
  console.log(`  Meridian → Bloom: Contract review delivered and accepted.`);
  console.log(`  Edge state: satisfied`);
  console.log();

  // Edge 2 starts but gets stuck
  console.log('─── Step 2: Second Edge Stuck ───');
  edges[1].transition({ type: 'EXECUTION_START' });
  console.log(`  Bloom → Fern: Catering in progress...`);
  console.log(`  Edge state: ${edges[1].state}`);
  console.log();
  console.log(`  Day 10: No delivery update from Bloom.`);
  console.log(`  Fern raises a stuck flag (protocol signal, not a state change).`);
  console.log();
  logMessage({
    type: 'StuckFlag',
    fields: {
      chain_id: CHAIN_ID,
      edge_id: 'edge-bloom-fern',
      raised_by: characters.fern.id,
      days_since_start: 10,
      expected_by: '2026-03-15',
      note: 'No delivery update received',
    },
  });
  console.log();

  // Resolution: late delivery
  console.log('─── Step 3: Late Delivery ───');
  console.log(`  Bloom delivers 5 days late with reduced menu.`);
  edges[1].transition({ type: 'DELIVERY_COMPLETE' });
  edges[1].transition({ type: 'SATISFACTION_SIGNAL', signal: 'partially_satisfied' });
  console.log(`  Edge state: ${edges[1].state} (partially_satisfied treated as satisfied by state machine)`);
  console.log();
  logMessage({
    type: 'FulfilmentSignal',
    fields: {
      chain_id: CHAIN_ID,
      edge_id: 'edge-bloom-fern',
      signal: 'partially_satisfied',
      feedback: 'Delivered late with reduced menu, but acceptable quality',
    },
  });
  console.log();

  // Edge 3 completes
  console.log('─── Step 4: Third Edge Completes ───');
  edges[2].transition({ type: 'EXECUTION_START' });
  edges[2].transition({ type: 'DELIVERY_COMPLETE' });
  edges[2].transition({ type: 'SATISFACTION_SIGNAL', signal: 'satisfied' });
  console.log(`  Fern → Meridian: Brand refresh delivered and accepted.`);
  console.log();

  // Chain completes with mixed results
  console.log('─── Step 5: Chain Completes (Mixed) ───');
  const complete = chain.transition({ type: 'ALL_EDGES_SATISFIED' });
  console.log(`  State: executing → ${complete.state}`);
  console.log();
  logMessage({
    type: 'ChainCompletion',
    fields: {
      chain_id: CHAIN_ID,
      status: 'completed',
      edges_satisfied: '2 satisfied, 1 partially_satisfied',
      trust_updates: 'Bloom: reduced positive adjustment (partial satisfaction)',
    },
  });
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════════

function main(): void {
  console.log();
  console.log('╔'.padEnd(69, '═') + '╗');
  console.log('║' + '  SEP Protocol Trace Demonstration'.padEnd(68) + '║');
  console.log('╚'.padEnd(69, '═') + '╝');
  console.log();
  console.log('  This demo traces exchange chains through the protocol state machine,');
  console.log('  showing how state transitions and protocol messages work together.');
  console.log('  Each step shows the state machine transition alongside the');
  console.log('  corresponding protocol message that would be exchanged.');
  console.log();
  console.log('  Note: Protocol messages shown are illustrative — they demonstrate');
  console.log('  the message structures defined in the protocol-messages schema,');
  console.log('  not generated by a production protocol layer.');
  console.log();

  scenarioHappyPath();
  scenarioCounterProposal();
  scenarioStuckFlag();

  console.log('═'.repeat(70));
  console.log('  Summary');
  console.log('═'.repeat(70));
  console.log();
  console.log('  Three scenarios demonstrated:');
  console.log('  1. Happy path: proposal → confirmation → execution → completion');
  console.log('  2. Counter-proposal: timing negotiation within the confirming state');
  console.log('  3. Stuck flag: late delivery resolved with partial satisfaction');
  console.log();
  console.log('  Key protocol patterns:');
  console.log('  - State machine transitions are deterministic and auditable');
  console.log('  - Protocol messages carry the context (who, what, why)');
  console.log('  - Counter-proposals are messages, not state changes');
  console.log('  - Stuck flags are signals, not disputes');
  console.log('  - Partial satisfaction still completes the chain');
  console.log();
  console.log('═'.repeat(70));
}

main();
