/**
 * Chain and Edge state machines for SEP protocol execution.
 *
 * Based on: docs/specs/execution-protocol.md
 * Reference: prototypes/execution-state-machine.md
 */

import type { ChainState, EdgeState } from '../schemas/index.js';

/**
 * Events that can trigger chain state transitions.
 * Named ChainTransitionEvent to avoid conflict with ChainEvent in schemas
 * (which represents historical event records, not state machine triggers).
 */
export type ChainTransitionEvent =
  | { type: 'SUBMIT' }
  | { type: 'DISCARD' }
  | { type: 'FIRST_CONFIRMATION'; participantId: string }
  | { type: 'ALL_CONFIRMED' }
  | { type: 'DECLINE'; participantId: string; reason: string }
  | { type: 'TIMEOUT' }
  | { type: 'EXECUTION_WINDOW_OPEN' }
  | { type: 'ALL_EDGES_SATISFIED' }
  | { type: 'FAILURE_DETECTED'; edgeId: string; reason: string }
  | { type: 'UNANIMOUS_CANCEL' }
  | { type: 'WITHDRAW' };

/**
 * Events that can trigger edge state transitions.
 */
export type EdgeEvent =
  | { type: 'CHAIN_COMMITTED' }
  | { type: 'CHAIN_RESTRUCTURED' }
  | { type: 'EXECUTION_START' }
  | { type: 'DELIVERY_COMPLETE'; evidence?: object }
  | { type: 'SATISFACTION_SIGNAL'; signal: 'satisfied' | 'partially_satisfied' | 'not_satisfied' }
  | { type: 'DISPUTE_RAISED'; reason: string }
  | { type: 'DISPUTE_RESOLVED'; resolution: object }
  | { type: 'TIMEOUT' }
  | { type: 'ABANDONMENT' };

/**
 * Result of a state transition.
 */
export interface TransitionResult<S> {
  /** The new state after transition */
  state: S;
  /** Whether the transition was valid */
  valid: boolean;
  /** Actions to perform as a result of this transition */
  actions: string[];
  /** Error message if transition was invalid */
  error?: string;
}

/**
 * Transition table for chain states.
 */
const CHAIN_TRANSITIONS: Record<ChainState, Partial<Record<ChainTransitionEvent['type'], ChainState>>> = {
  draft: {
    SUBMIT: 'proposed',
    DISCARD: 'discarded',
  },
  proposed: {
    FIRST_CONFIRMATION: 'confirming',
    WITHDRAW: 'abandoned',
    TIMEOUT: 'declined',
  },
  confirming: {
    ALL_CONFIRMED: 'committed',
    DECLINE: 'declined',
    TIMEOUT: 'declined',
  },
  committed: {
    EXECUTION_WINDOW_OPEN: 'executing',
    UNANIMOUS_CANCEL: 'cancelled',
  },
  executing: {
    ALL_EDGES_SATISFIED: 'completed',
    FAILURE_DETECTED: 'failed',
  },
  // Terminal states
  completed: {},
  discarded: {},
  abandoned: {},
  declined: {},
  cancelled: {},
  failed: {},
};

/**
 * Transition table for edge states.
 */
const EDGE_TRANSITIONS: Record<EdgeState, Partial<Record<EdgeEvent['type'], EdgeState>>> = {
  proposed: {
    CHAIN_COMMITTED: 'both_confirmed',
    CHAIN_RESTRUCTURED: 'skipped',
  },
  provider_confirmed: {
    CHAIN_COMMITTED: 'both_confirmed',
    CHAIN_RESTRUCTURED: 'skipped',
  },
  recipient_confirmed: {
    CHAIN_COMMITTED: 'both_confirmed',
    CHAIN_RESTRUCTURED: 'skipped',
  },
  both_confirmed: {
    EXECUTION_START: 'in_progress',
  },
  in_progress: {
    DELIVERY_COMPLETE: 'delivered',
    TIMEOUT: 'disputed',
    ABANDONMENT: 'disputed',
  },
  delivered: {
    SATISFACTION_SIGNAL: 'satisfied', // or 'disputed' based on signal
    DISPUTE_RAISED: 'disputed',
  },
  satisfied: {},
  skipped: {},
  disputed: {
    DISPUTE_RESOLVED: 'resolved',
  },
  resolved: {},
};

/**
 * State machine for exchange chain lifecycle.
 */
export class ChainStateMachine {
  private _state: ChainState;
  private _history: Array<{ event: ChainTransitionEvent; fromState: ChainState; toState: ChainState; timestamp: Date }> = [];

  constructor(initialState: ChainState = 'draft') {
    this._state = initialState;
  }

  /**
   * Current state of the chain.
   */
  get state(): ChainState {
    return this._state;
  }

  /**
   * History of state transitions.
   */
  get history(): ReadonlyArray<{ event: ChainTransitionEvent; fromState: ChainState; toState: ChainState; timestamp: Date }> {
    return this._history;
  }

  /**
   * Check if a transition is valid without executing it.
   */
  canTransition(event: ChainTransitionEvent): boolean {
    const transitions = CHAIN_TRANSITIONS[this._state];
    return event.type in transitions;
  }

  /**
   * Attempt to transition to a new state.
   */
  transition(event: ChainTransitionEvent): TransitionResult<ChainState> {
    const transitions = CHAIN_TRANSITIONS[this._state];
    const nextState = transitions[event.type as keyof typeof transitions];

    if (!nextState) {
      return {
        state: this._state,
        valid: false,
        actions: [],
        error: `Invalid transition: ${event.type} from state ${this._state}`,
      };
    }

    const fromState = this._state;
    this._state = nextState;

    this._history.push({
      event,
      fromState,
      toState: nextState,
      timestamp: new Date(),
    });

    // Determine actions based on transition
    const actions = this.getActionsForTransition(fromState, nextState, event);

    return {
      state: nextState,
      valid: true,
      actions,
    };
  }

  /**
   * Get actions to perform for a given transition.
   */
  private getActionsForTransition(
    from: ChainState,
    to: ChainState,
    _event: ChainTransitionEvent
  ): string[] {
    const actions: string[] = [];

    // Define actions for specific transitions
    if (from === 'draft' && to === 'proposed') {
      actions.push('SEND_PROPOSAL_TO_ALL_PARTICIPANTS');
      actions.push('START_CONFIRMATION_TIMER');
    }

    if (from === 'confirming' && to === 'committed') {
      actions.push('RESERVE_ALL_OFFERINGS');
      actions.push('SCHEDULE_EXECUTION');
      actions.push('NOTIFY_ALL_PARTICIPANTS');
    }

    if (from === 'committed' && to === 'executing') {
      actions.push('SEND_EXECUTION_REMINDERS');
      actions.push('START_MONITORING');
    }

    if (to === 'completed') {
      actions.push('UPDATE_TRUST_METRICS');
      actions.push('RECORD_COMPLETION');
      actions.push('NOTIFY_ALL_PARTICIPANTS');
    }

    if (to === 'failed') {
      actions.push('INITIATE_COMPENSATION_SAGA');
      actions.push('NOTIFY_ALL_PARTICIPANTS');
    }

    if (to === 'declined') {
      actions.push('RELEASE_RESERVATIONS');
      actions.push('NOTIFY_ALL_PARTICIPANTS');
    }

    return actions;
  }

  /**
   * Check if the chain is in a terminal state.
   */
  isTerminal(): boolean {
    return ['completed', 'discarded', 'abandoned', 'declined', 'cancelled', 'failed'].includes(this._state);
  }
}

/**
 * State machine for individual edge lifecycle within a chain.
 */
export class EdgeStateMachine {
  private _state: EdgeState;

  constructor(initialState: EdgeState = 'proposed') {
    this._state = initialState;
  }

  get state(): EdgeState {
    return this._state;
  }

  canTransition(event: EdgeEvent): boolean {
    const transitions = EDGE_TRANSITIONS[this._state];
    return event.type in transitions;
  }

  transition(event: EdgeEvent): TransitionResult<EdgeState> {
    // Special handling for satisfaction signals
    if (event.type === 'SATISFACTION_SIGNAL' && this._state === 'delivered') {
      if (event.signal === 'not_satisfied') {
        this._state = 'disputed';
        return { state: 'disputed', valid: true, actions: ['INITIATE_DISPUTE_RESOLUTION'] };
      }
      this._state = 'satisfied';
      return { state: 'satisfied', valid: true, actions: ['UPDATE_TRUST_METRICS'] };
    }

    const transitions = EDGE_TRANSITIONS[this._state];
    const nextState = transitions[event.type as keyof typeof transitions];

    if (!nextState) {
      return {
        state: this._state,
        valid: false,
        actions: [],
        error: `Invalid transition: ${event.type} from state ${this._state}`,
      };
    }

    this._state = nextState;

    return {
      state: nextState,
      valid: true,
      actions: [],
    };
  }

  isTerminal(): boolean {
    return ['satisfied', 'skipped', 'resolved'].includes(this._state);
  }
}
