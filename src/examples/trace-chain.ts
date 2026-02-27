/**
 * Example: Trace through a chain lifecycle
 *
 * This script demonstrates the protocol flow for a 3-party exchange chain.
 * Run with: npm run trace
 */

import { ChainStateMachine, EdgeStateMachine } from '../protocol/state-machine.js';

function log(message: string): void {
  console.log(message);
}

function logState(label: string, state: string): void {
  console.log(`  ${label}: ${state}`);
}

function logTransition(event: string, from: string, to: string, actions: string[]): void {
  console.log(`  Event: ${event}`);
  console.log(`  Transition: ${from} → ${to}`);
  if (actions.length > 0) {
    console.log(`  Actions: ${actions.join(', ')}`);
  }
  console.log();
}

/**
 * Trace a happy-path 3-party chain from proposal to completion.
 */
async function traceHappyPath(): Promise<void> {
  log('');
  log('═══════════════════════════════════════════════════════════════');
  log('  SEP Protocol Trace: Happy Path 3-Party Chain');
  log('═══════════════════════════════════════════════════════════════');
  log('');
  log('Participants:');
  log('  • Alice (Legal Services) - Offers contract review');
  log('  • Bob (Catering) - Offers event catering');
  log('  • Carol (Design) - Offers branding services');
  log('');
  log('Chain:');
  log('  Alice → Bob: Contract review');
  log('  Bob → Carol: Catering for 50 people');
  log('  Carol → Alice: Brand identity design');
  log('');

  const chain = new ChainStateMachine('draft');
  const edges = [
    new EdgeStateMachine('proposed'),
    new EdgeStateMachine('proposed'),
    new EdgeStateMachine('proposed'),
  ];

  // Step 1: Submit proposal
  log('─── Step 1: Submit Chain Proposal ───');
  logState('Initial state', chain.state);

  let result = chain.transition({ type: 'SUBMIT' });
  logTransition('SUBMIT', 'draft', result.state, result.actions);

  // Step 2: First confirmation
  log('─── Step 2: First Confirmation (Alice) ───');
  logState('Current state', chain.state);

  result = chain.transition({
    type: 'FIRST_CONFIRMATION',
    participantId: 'participant-alice',
  });
  logTransition('FIRST_CONFIRMATION', 'proposed', result.state, result.actions);

  // Step 3: All confirmed
  log('─── Step 3: All Participants Confirm ───');
  logState('Current state', chain.state);
  log('  (Bob and Carol also confirm...)');

  result = chain.transition({ type: 'ALL_CONFIRMED' });
  logTransition('ALL_CONFIRMED', 'confirming', result.state, result.actions);

  // Update edge states
  log('─── Step 4: Edge States Update ───');
  for (let i = 0; i < edges.length; i++) {
    const edgeResult = edges[i].transition({ type: 'CHAIN_COMMITTED' });
    log(`  Edge ${i + 1}: proposed → ${edgeResult.state}`);
  }
  log('');

  // Step 5: Execution window opens
  log('─── Step 5: Execution Window Opens ───');
  logState('Current state', chain.state);

  result = chain.transition({ type: 'EXECUTION_WINDOW_OPEN' });
  logTransition('EXECUTION_WINDOW_OPEN', 'committed', result.state, result.actions);

  // Step 6: Execute each edge
  log('─── Step 6: Execute Edges ───');
  const edgeNames = ['Alice→Bob', 'Bob→Carol', 'Carol→Alice'];

  for (let i = 0; i < edges.length; i++) {
    log(`  ${edgeNames[i]}:`);

    // Start execution
    let edgeResult = edges[i].transition({ type: 'EXECUTION_START' });
    log(`    confirmed → ${edgeResult.state}`);

    // Delivery complete
    edgeResult = edges[i].transition({ type: 'DELIVERY_COMPLETE' });
    log(`    in_progress → ${edgeResult.state}`);

    // Satisfaction signal
    edgeResult = edges[i].transition({
      type: 'SATISFACTION_SIGNAL',
      signal: 'satisfied',
    });
    log(`    delivered → ${edgeResult.state}`);
    log('');
  }

  // Step 7: Chain completes
  log('─── Step 7: Chain Completion ───');
  logState('Current state', chain.state);

  result = chain.transition({ type: 'ALL_EDGES_SATISFIED' });
  logTransition('ALL_EDGES_SATISFIED', 'executing', result.state, result.actions);

  log('═══════════════════════════════════════════════════════════════');
  log('  Chain completed successfully!');
  log('═══════════════════════════════════════════════════════════════');
  log('');
}

/**
 * Trace a chain with a single edge failure.
 */
async function traceFailure(): Promise<void> {
  log('');
  log('═══════════════════════════════════════════════════════════════');
  log('  SEP Protocol Trace: Single Edge Failure');
  log('═══════════════════════════════════════════════════════════════');
  log('');

  const chain = new ChainStateMachine('draft');

  // Quick setup to executing state
  chain.transition({ type: 'SUBMIT' });
  chain.transition({ type: 'FIRST_CONFIRMATION', participantId: 'alice' });
  chain.transition({ type: 'ALL_CONFIRMED' });
  chain.transition({ type: 'EXECUTION_WINDOW_OPEN' });

  logState('Starting state', chain.state);
  log('');

  // Failure detected
  log('─── Failure Detected ───');
  log('  Bob fails to deliver catering (edge timeout)');

  const result = chain.transition({
    type: 'FAILURE_DETECTED',
    edgeId: 'edge-bob-carol',
    reason: 'Execution timeout exceeded',
  });
  logTransition('FAILURE_DETECTED', 'executing', result.state, result.actions);

  log('═══════════════════════════════════════════════════════════════');
  log('  Chain failed - compensation saga initiated');
  log('═══════════════════════════════════════════════════════════════');
  log('');
}

// Run traces
async function main(): Promise<void> {
  await traceHappyPath();
  await traceFailure();
}

main().catch(console.error);
