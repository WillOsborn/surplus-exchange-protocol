import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ChainStateMachine,
  EdgeStateMachine,
  type ChainTransitionEvent,
} from './state-machine.js';
import type { ChainState, EdgeState } from '../schemas/index.js';

// ============================================================================
// Inline Helpers
// ============================================================================

/** All terminal chain states. */
const TERMINAL_CHAIN_STATES: ChainState[] = [
  'completed', 'discarded', 'abandoned', 'declined', 'cancelled', 'failed',
];

/** All active (non-terminal) chain states. */
const ACTIVE_CHAIN_STATES: ChainState[] = [
  'draft', 'proposed', 'confirming', 'committed', 'executing',
];

/** All terminal edge states. */
const TERMINAL_EDGE_STATES: EdgeState[] = ['satisfied', 'skipped', 'resolved'];

/** All non-terminal edge states. */
const NON_TERMINAL_EDGE_STATES: EdgeState[] = [
  'proposed', 'provider_confirmed', 'recipient_confirmed',
  'both_confirmed', 'in_progress', 'delivered', 'disputed',
];

// ============================================================================
// ChainStateMachine Tests
// ============================================================================

describe('ChainStateMachine', () => {
  let machine: ChainStateMachine;

  beforeEach(() => {
    vi.useFakeTimers();
    machine = new ChainStateMachine();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('happy path', () => {
    it('completes full lifecycle: draft -> proposed -> confirming -> committed -> executing -> completed', () => {
      expect(machine.state).toBe('draft');

      const r1 = machine.transition({ type: 'SUBMIT' });
      expect(r1.valid).toBe(true);
      expect(r1.state).toBe('proposed');

      const r2 = machine.transition({ type: 'FIRST_CONFIRMATION', participantId: 'p1' });
      expect(r2.valid).toBe(true);
      expect(r2.state).toBe('confirming');

      const r3 = machine.transition({ type: 'ALL_CONFIRMED' });
      expect(r3.valid).toBe(true);
      expect(r3.state).toBe('committed');

      const r4 = machine.transition({ type: 'EXECUTION_WINDOW_OPEN' });
      expect(r4.valid).toBe(true);
      expect(r4.state).toBe('executing');

      const r5 = machine.transition({ type: 'ALL_EDGES_SATISFIED' });
      expect(r5.valid).toBe(true);
      expect(r5.state).toBe('completed');

      expect(machine.isTerminal()).toBe(true);
    });
  });

  describe('terminal paths', () => {
    it('draft -> discarded via DISCARD', () => {
      const result = machine.transition({ type: 'DISCARD' });
      expect(result.valid).toBe(true);
      expect(result.state).toBe('discarded');
      expect(machine.isTerminal()).toBe(true);
    });

    it('proposed -> abandoned via WITHDRAW', () => {
      machine.transition({ type: 'SUBMIT' });
      expect(machine.state).toBe('proposed'); // sanity

      const result = machine.transition({ type: 'WITHDRAW' });
      expect(result.valid).toBe(true);
      expect(result.state).toBe('abandoned');
      expect(machine.isTerminal()).toBe(true);
    });

    it('proposed -> declined via TIMEOUT', () => {
      machine.transition({ type: 'SUBMIT' });
      expect(machine.state).toBe('proposed'); // sanity

      const result = machine.transition({ type: 'TIMEOUT' });
      expect(result.valid).toBe(true);
      expect(result.state).toBe('declined');
      expect(machine.isTerminal()).toBe(true);
    });

    it('confirming -> declined via DECLINE with participantId and reason', () => {
      machine.transition({ type: 'SUBMIT' });
      machine.transition({ type: 'FIRST_CONFIRMATION', participantId: 'p1' });
      expect(machine.state).toBe('confirming'); // sanity

      const result = machine.transition({
        type: 'DECLINE',
        participantId: 'p2',
        reason: 'Cannot fulfil at this time',
      });
      expect(result.valid).toBe(true);
      expect(result.state).toBe('declined');
      expect(machine.isTerminal()).toBe(true);
    });

    it('committed -> cancelled via UNANIMOUS_CANCEL', () => {
      machine.transition({ type: 'SUBMIT' });
      machine.transition({ type: 'FIRST_CONFIRMATION', participantId: 'p1' });
      machine.transition({ type: 'ALL_CONFIRMED' });
      expect(machine.state).toBe('committed'); // sanity

      const result = machine.transition({ type: 'UNANIMOUS_CANCEL' });
      expect(result.valid).toBe(true);
      expect(result.state).toBe('cancelled');
      expect(machine.isTerminal()).toBe(true);
    });

    it('executing -> failed via FAILURE_DETECTED with edgeId and reason', () => {
      machine.transition({ type: 'SUBMIT' });
      machine.transition({ type: 'FIRST_CONFIRMATION', participantId: 'p1' });
      machine.transition({ type: 'ALL_CONFIRMED' });
      machine.transition({ type: 'EXECUTION_WINDOW_OPEN' });
      expect(machine.state).toBe('executing'); // sanity

      const result = machine.transition({
        type: 'FAILURE_DETECTED',
        edgeId: 'edge-1',
        reason: 'Provider did not deliver',
      });
      expect(result.valid).toBe(true);
      expect(result.state).toBe('failed');
      expect(machine.isTerminal()).toBe(true);
    });
  });

  describe('invalid transitions', () => {
    it('rejects SUBMIT from proposed state', () => {
      machine.transition({ type: 'SUBMIT' });
      expect(machine.state).toBe('proposed'); // sanity

      const result = machine.transition({ type: 'SUBMIT' });
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.state).toBe('proposed'); // state unchanged
    });

    it('rejects ALL_CONFIRMED from draft state', () => {
      expect(machine.state).toBe('draft'); // sanity

      const result = machine.transition({ type: 'ALL_CONFIRMED' });
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.state).toBe('draft'); // state unchanged
    });

    it('rejects any event from a terminal state (completed)', () => {
      // Drive to completed
      machine.transition({ type: 'SUBMIT' });
      machine.transition({ type: 'FIRST_CONFIRMATION', participantId: 'p1' });
      machine.transition({ type: 'ALL_CONFIRMED' });
      machine.transition({ type: 'EXECUTION_WINDOW_OPEN' });
      machine.transition({ type: 'ALL_EDGES_SATISFIED' });
      expect(machine.state).toBe('completed'); // sanity

      const result = machine.transition({ type: 'SUBMIT' });
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.state).toBe('completed'); // state unchanged
    });
  });

  describe('canTransition', () => {
    it('returns true for a valid event from the current state', () => {
      expect(machine.state).toBe('draft'); // sanity
      expect(machine.canTransition({ type: 'SUBMIT' })).toBe(true);
      expect(machine.canTransition({ type: 'DISCARD' })).toBe(true);
    });

    it('returns false for an invalid event from the current state', () => {
      expect(machine.state).toBe('draft'); // sanity
      expect(machine.canTransition({ type: 'ALL_CONFIRMED' })).toBe(false);
      expect(machine.canTransition({ type: 'WITHDRAW' })).toBe(false);
    });
  });

  describe('isTerminal', () => {
    it('returns true for all 6 terminal states', () => {
      for (const state of TERMINAL_CHAIN_STATES) {
        const m = new ChainStateMachine(state);
        expect(m.isTerminal()).toBe(true);
      }
    });

    it('returns false for all 5 active states', () => {
      for (const state of ACTIVE_CHAIN_STATES) {
        const m = new ChainStateMachine(state);
        expect(m.isTerminal()).toBe(false);
      }
    });
  });

  describe('actions', () => {
    it('draft -> proposed generates SEND_PROPOSAL_TO_ALL_PARTICIPANTS', () => {
      const result = machine.transition({ type: 'SUBMIT' });
      expect(result.valid).toBe(true);
      expect(result.actions).toContain('SEND_PROPOSAL_TO_ALL_PARTICIPANTS');
      expect(result.actions).toContain('START_CONFIRMATION_TIMER');
    });

    it('confirming -> committed generates RESERVE_ALL_OFFERINGS', () => {
      machine.transition({ type: 'SUBMIT' });
      machine.transition({ type: 'FIRST_CONFIRMATION', participantId: 'p1' });

      const result = machine.transition({ type: 'ALL_CONFIRMED' });
      expect(result.valid).toBe(true);
      expect(result.actions).toContain('RESERVE_ALL_OFFERINGS');
      expect(result.actions).toContain('SCHEDULE_EXECUTION');
      expect(result.actions).toContain('NOTIFY_ALL_PARTICIPANTS');
    });

    it('executing -> completed generates UPDATE_TRUST_METRICS', () => {
      machine.transition({ type: 'SUBMIT' });
      machine.transition({ type: 'FIRST_CONFIRMATION', participantId: 'p1' });
      machine.transition({ type: 'ALL_CONFIRMED' });
      machine.transition({ type: 'EXECUTION_WINDOW_OPEN' });

      const result = machine.transition({ type: 'ALL_EDGES_SATISFIED' });
      expect(result.valid).toBe(true);
      expect(result.actions).toContain('UPDATE_TRUST_METRICS');
      expect(result.actions).toContain('RECORD_COMPLETION');
      expect(result.actions).toContain('NOTIFY_ALL_PARTICIPANTS');
    });
  });

  describe('history', () => {
    it('records event, fromState, toState, and timestamp in history', () => {
      const now = new Date('2026-01-15T10:00:00Z');
      vi.setSystemTime(now);

      const event: ChainTransitionEvent = { type: 'SUBMIT' };
      machine.transition(event);

      expect(machine.history).toHaveLength(1);
      expect(machine.history[0]).toEqual({
        event,
        fromState: 'draft',
        toState: 'proposed',
        timestamp: now,
      });
    });

    it('produces an ordered history array after multiple transitions', () => {
      const t1 = new Date('2026-01-15T10:00:00Z');
      vi.setSystemTime(t1);
      machine.transition({ type: 'SUBMIT' });

      const t2 = new Date('2026-01-15T11:00:00Z');
      vi.setSystemTime(t2);
      machine.transition({ type: 'FIRST_CONFIRMATION', participantId: 'p1' });

      const t3 = new Date('2026-01-15T12:00:00Z');
      vi.setSystemTime(t3);
      machine.transition({ type: 'ALL_CONFIRMED' });

      expect(machine.history).toHaveLength(3);

      expect(machine.history[0].fromState).toBe('draft');
      expect(machine.history[0].toState).toBe('proposed');
      expect(machine.history[0].timestamp).toEqual(t1);

      expect(machine.history[1].fromState).toBe('proposed');
      expect(machine.history[1].toState).toBe('confirming');
      expect(machine.history[1].timestamp).toEqual(t2);

      expect(machine.history[2].fromState).toBe('confirming');
      expect(machine.history[2].toState).toBe('committed');
      expect(machine.history[2].timestamp).toEqual(t3);
    });
  });
});

// ============================================================================
// EdgeStateMachine Tests
// ============================================================================

describe('EdgeStateMachine', () => {
  let machine: EdgeStateMachine;

  beforeEach(() => {
    machine = new EdgeStateMachine();
  });

  describe('happy path', () => {
    it('completes full lifecycle: proposed -> both_confirmed -> in_progress -> delivered -> satisfied', () => {
      expect(machine.state).toBe('proposed');

      const r1 = machine.transition({ type: 'CHAIN_COMMITTED' });
      expect(r1.valid).toBe(true);
      expect(r1.state).toBe('both_confirmed');

      const r2 = machine.transition({ type: 'EXECUTION_START' });
      expect(r2.valid).toBe(true);
      expect(r2.state).toBe('in_progress');

      const r3 = machine.transition({ type: 'DELIVERY_COMPLETE' });
      expect(r3.valid).toBe(true);
      expect(r3.state).toBe('delivered');

      const r4 = machine.transition({ type: 'SATISFACTION_SIGNAL', signal: 'satisfied' });
      expect(r4.valid).toBe(true);
      expect(r4.state).toBe('satisfied');

      expect(machine.isTerminal()).toBe(true);
    });
  });

  describe('satisfaction routing', () => {
    beforeEach(() => {
      // Drive to delivered state
      machine.transition({ type: 'CHAIN_COMMITTED' });
      machine.transition({ type: 'EXECUTION_START' });
      machine.transition({ type: 'DELIVERY_COMPLETE' });
      expect(machine.state).toBe('delivered'); // sanity
    });

    it('SATISFACTION_SIGNAL with satisfied -> satisfied state', () => {
      const result = machine.transition({ type: 'SATISFACTION_SIGNAL', signal: 'satisfied' });
      expect(result.valid).toBe(true);
      expect(result.state).toBe('satisfied');
      expect(result.actions).toContain('UPDATE_TRUST_METRICS');
    });

    it('SATISFACTION_SIGNAL with not_satisfied -> disputed state with INITIATE_DISPUTE_RESOLUTION action', () => {
      const result = machine.transition({ type: 'SATISFACTION_SIGNAL', signal: 'not_satisfied' });
      expect(result.valid).toBe(true);
      expect(result.state).toBe('disputed');
      expect(result.actions).toContain('INITIATE_DISPUTE_RESOLUTION');
    });
  });

  describe('other paths', () => {
    it('disputed -> resolved via DISPUTE_RESOLVED', () => {
      // Drive to disputed
      machine.transition({ type: 'CHAIN_COMMITTED' });
      machine.transition({ type: 'EXECUTION_START' });
      machine.transition({ type: 'DELIVERY_COMPLETE' });
      machine.transition({ type: 'SATISFACTION_SIGNAL', signal: 'not_satisfied' });
      expect(machine.state).toBe('disputed'); // sanity

      const result = machine.transition({
        type: 'DISPUTE_RESOLVED',
        resolution: { outcome: 'partial_credit' },
      });
      expect(result.valid).toBe(true);
      expect(result.state).toBe('resolved');
      expect(machine.isTerminal()).toBe(true);
    });

    it('proposed -> skipped via CHAIN_RESTRUCTURED', () => {
      expect(machine.state).toBe('proposed'); // sanity

      const result = machine.transition({ type: 'CHAIN_RESTRUCTURED' });
      expect(result.valid).toBe(true);
      expect(result.state).toBe('skipped');
      expect(machine.isTerminal()).toBe(true);
    });
  });

  describe('isTerminal', () => {
    it('returns true for satisfied, skipped, and resolved; false for all other states', () => {
      for (const state of TERMINAL_EDGE_STATES) {
        const m = new EdgeStateMachine(state);
        expect(m.isTerminal()).toBe(true);
      }
      for (const state of NON_TERMINAL_EDGE_STATES) {
        const m = new EdgeStateMachine(state);
        expect(m.isTerminal()).toBe(false);
      }
    });
  });
});
