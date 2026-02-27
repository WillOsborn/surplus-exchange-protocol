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

    // Store the machine
    this.chainMachines.set(message.chain_id, machine);

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

    // Determine event based on decision
    let event: ChainTransitionEvent;

    if (message.decision === 'decline') {
      event = {
        type: 'DECLINE',
        participantId: message.participant_id,
        reason: message.decline_reason ?? 'No reason provided',
      };
    } else if (message.decision === 'confirm') {
      // This is simplified - real implementation would track confirmations
      event = {
        type: 'FIRST_CONFIRMATION',
        participantId: message.participant_id,
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
   * Get the state machine for a chain.
   */
  getChainMachine(chainId: string): ChainStateMachine | undefined {
    return this.chainMachines.get(chainId);
  }
}
