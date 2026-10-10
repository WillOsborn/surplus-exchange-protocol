/**
 * Protocol message handling for SEP.
 *
 * Handles receiving, validating, and processing protocol messages.
 * Based on: docs/specs/message-protocol.md
 * Reference: prototypes/protocol-messages.json
 */

import { ChainStateMachine, type ChainTransitionEvent } from './state-machine.js';

/**
 * Base message header present on all protocol messages.
 */
export interface MessageHeader {
  message_id: string;
  message_type: string;
  timestamp: string;
  sender_id: string;
  protocol_version: string;
  correlation_id?: string;
  reply_to?: string;
  signature?: string;
}

/**
 * Chain proposal message.
 */
export interface ChainProposalMessage extends MessageHeader {
  message_type: 'ChainProposal';
  chain_id: string;
  edges: Array<{
    edge_id: string;
    provider_id: string;
    recipient_id: string;
    offering_id: string;
    offering_summary: string;
  }>;
  timing: {
    confirmation_deadline: string;
    execution_window: {
      start: string;
      end: string;
    };
  };
  match_rationale: {
    algorithm_version: string;
    match_score: number;
    key_matches: string[];
  };
}

/**
 * Participant confirmation message.
 */
export interface ParticipantConfirmationMessage extends MessageHeader {
  message_type: 'ParticipantConfirmation';
  chain_id: string;
  participant_id: string;
  decision: 'confirm' | 'decline' | 'counter';
  conditions?: string[];
  decline_reason?: string;
  counter_proposal?: object;
}

/**
 * All message types.
 */
export type ProtocolMessage =
  | ChainProposalMessage
  | ParticipantConfirmationMessage;

/**
 * Result of processing a message.
 */
export interface MessageProcessingResult {
  success: boolean;
  response?: ProtocolMessage;
  actions: string[];
  error?: string;
}

/**
 * Message handler for processing incoming protocol messages.
 */
export class MessageHandler {
  private chainMachines: Map<string, ChainStateMachine> = new Map();
  /** Participants named on each chain's edges */
  private chainParticipants: Map<string, Set<string>> = new Map();
  /** Participants who have confirmed each chain */
  private chainConfirmations: Map<string, Set<string>> = new Map();
  private processedMessageIds: Set<string> = new Set();

  /**
   * Process an incoming protocol message.
   *
   * @param message - The message to process
   * @returns Processing result with any response and actions
   */
  async processMessage(message: ProtocolMessage): Promise<MessageProcessingResult> {
    // Idempotency check
    if (this.processedMessageIds.has(message.message_id)) {
      return {
        success: true,
        actions: [],
        // Return cached response if available
      };
    }

    // Validate message structure
    const validationResult = this.validateMessage(message);
    if (!validationResult.valid) {
      return {
        success: false,
        error: validationResult.error,
        actions: [],
      };
    }

    // Route to appropriate handler
    let result: MessageProcessingResult;
    const messageType = message.message_type;

    switch (messageType) {
      case 'ChainProposal':
        result = await this.handleChainProposal(message);
        break;
      case 'ParticipantConfirmation':
        result = await this.handleParticipantConfirmation(message);
        break;
      default: {
        // TypeScript exhaustive check
        const _exhaustive: never = messageType;
        result = {
          success: false,
          error: `Unknown message type: ${_exhaustive}`,
          actions: [],
        };
      }
    }

    // Mark message as processed
    if (result.success) {
      this.processedMessageIds.add(message.message_id);
    }

    return result;
  }

  /**
   * Validate a message structure.
   */
  private validateMessage(message: ProtocolMessage): { valid: boolean; error?: string } {
    // Basic validation - full validation would use ajv
    if (!message.message_id) {
      return { valid: false, error: 'Missing message_id' };
    }
    if (!message.message_type) {
      return { valid: false, error: 'Missing message_type' };
    }
    if (!message.sender_id) {
      return { valid: false, error: 'Missing sender_id' };
    }
    return { valid: true };
  }

  /**
   * Handle a chain proposal message.
   */
  private async handleChainProposal(
    message: ChainProposalMessage
  ): Promise<MessageProcessingResult> {
    if (this.chainMachines.has(message.chain_id)) {
      return {
        success: false,
        error: `Chain ${message.chain_id} already exists`,
        actions: [],
      };
    }

    // Create new chain state machine
    const machine = new ChainStateMachine('draft');

    // Transition to proposed
    const transition = machine.transition({ type: 'SUBMIT' });

    if (!transition.valid) {
      return {
        success: false,
        error: transition.error,
        actions: [],
      };
    }

    // Store the machine and who must confirm
    this.chainMachines.set(message.chain_id, machine);
    this.chainParticipants.set(
      message.chain_id,
      new Set(message.edges.flatMap((e) => [e.provider_id, e.recipient_id]))
    );
    this.chainConfirmations.set(message.chain_id, new Set());

    return {
      success: true,
      actions: transition.actions,
    };
  }

  /**
   * Handle a participant confirmation message.
   */
  private async handleParticipantConfirmation(
    message: ParticipantConfirmationMessage
  ): Promise<MessageProcessingResult> {
    const machine = this.chainMachines.get(message.chain_id);

    if (!machine) {
      return {
        success: false,
        error: `Unknown chain: ${message.chain_id}`,
        actions: [],
      };
    }

    if (!this.chainParticipants.get(message.chain_id)?.has(message.participant_id)) {
      return {
        success: false,
        error: `${message.participant_id} is not a participant in chain ${message.chain_id}`,
        actions: [],
      };
    }
    if (message.sender_id !== message.participant_id) {
      return {
        success: false,
        error: `sender ${message.sender_id} cannot respond for ${message.participant_id}`,
        actions: [],
      };
    }

    if (message.decision === 'confirm') {
      return this.recordConfirmation(message.chain_id, message.participant_id, machine);
    }

    // Determine event based on decision
    let event: ChainTransitionEvent;

    if (message.decision === 'decline') {
      event = {
        type: 'DECLINE',
        participantId: message.participant_id,
        reason: message.decline_reason ?? 'No reason provided',
      };
    } else {
      // Counter-proposal handling
      return {
        success: false,
        error: 'Counter-proposals not yet implemented',
        actions: [],
      };
    }

    const transition = machine.transition(event);

    return {
      success: transition.valid,
      error: transition.error,
      actions: transition.actions,
    };
  }

  /**
   * Record a participant's confirmation. The first confirmation moves the
   * chain to confirming; the last outstanding one commits it.
   */
  private recordConfirmation(
    chainId: string,
    participantId: string,
    machine: ChainStateMachine
  ): MessageProcessingResult {
    const confirmed = this.chainConfirmations.get(chainId)!;
    if (confirmed.has(participantId)) {
      return {
        success: false,
        error: `${participantId} has already confirmed chain ${chainId}`,
        actions: [],
      };
    }

    const actions: string[] = [];
    if (machine.state === 'proposed') {
      const first = machine.transition({ type: 'FIRST_CONFIRMATION', participantId });
      if (!first.valid) {
        return { success: false, error: first.error, actions: [] };
      }
      actions.push(...first.actions);
    }
    if (machine.state !== 'confirming') {
      return {
        success: false,
        error: `Chain ${chainId} is ${machine.state} and cannot accept confirmations`,
        actions: [],
      };
    }

    confirmed.add(participantId);

    if (confirmed.size === this.chainParticipants.get(chainId)!.size) {
      const all = machine.transition({ type: 'ALL_CONFIRMED' });
      if (!all.valid) {
        return { success: false, error: all.error, actions };
      }
      actions.push(...all.actions);
    }

    return { success: true, actions };
  }

  /**
   * Get the state machine for a chain.
   */
  getChainMachine(chainId: string): ChainStateMachine | undefined {
    return this.chainMachines.get(chainId);
  }
}
