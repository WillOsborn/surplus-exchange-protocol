import { describe, it, expect, beforeEach } from 'vitest';
import { MessageHandler, type ChainProposalMessage, type ParticipantConfirmationMessage } from './message-handler.js';

// ============================================================================
// Inline Helpers
// ============================================================================

/**
 * Build a valid ChainProposalMessage with sensible defaults.
 * Override any field via the overrides parameter.
 */
function makeProposal(overrides: Partial<ChainProposalMessage> = {}): ChainProposalMessage {
  return {
    message_id: 'msg-1',
    message_type: 'ChainProposal',
    timestamp: '2026-01-01T00:00:00Z',
    sender_id: 'sender-1',
    protocol_version: '0.1.0',
    chain_id: 'chain-1',
    edges: [
      {
        edge_id: 'e1',
        provider_id: 'p1',
        recipient_id: 'p2',
        offering_id: 'o1',
        offering_summary: 'Test offering',
      },
    ],
    timing: {
      confirmation_deadline: '2026-01-08T00:00:00Z',
      execution_window: {
        start: '2026-01-10T00:00:00Z',
        end: '2026-01-20T00:00:00Z',
      },
    },
    match_rationale: {
      algorithm_version: '0.1.0',
      match_score: 0.8,
      key_matches: ['test'],
    },
    ...overrides,
  };
}

/**
 * Build a valid ParticipantConfirmationMessage with sensible defaults.
 */
function makeConfirmation(overrides: Partial<ParticipantConfirmationMessage> = {}): ParticipantConfirmationMessage {
  return {
    message_id: 'msg-confirm-1',
    message_type: 'ParticipantConfirmation',
    timestamp: '2026-01-02T00:00:00Z',
    sender_id: 'p1',
    protocol_version: '0.1.0',
    chain_id: 'chain-1',
    participant_id: 'p1',
    decision: 'confirm',
    ...overrides,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('MessageHandler', () => {
  let handler: MessageHandler;

  beforeEach(() => {
    handler = new MessageHandler();
  });

  describe('ChainProposal', () => {
    it('processes a valid proposal, creates machine in proposed state, and returns actions', async () => {
      const proposal = makeProposal();
      const result = await handler.processMessage(proposal);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.actions).toContain('SEND_PROPOSAL_TO_ALL_PARTICIPANTS');
      expect(result.actions).toContain('START_CONFIRMATION_TIMER');

      const machine = handler.getChainMachine('chain-1');
      expect(machine).toBeDefined();
      expect(machine!.state).toBe('proposed');
    });

    it('rejects a message with missing message_id', async () => {
      const proposal = makeProposal({ message_id: '' });
      const result = await handler.processMessage(proposal);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing message_id');
      expect(result.actions).toEqual([]);
    });

    it('rejects a message with missing sender_id', async () => {
      const proposal = makeProposal({ sender_id: '' });
      const result = await handler.processMessage(proposal);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing sender_id');
      expect(result.actions).toEqual([]);
    });
  });

  describe('ParticipantConfirmation', () => {
    beforeEach(async () => {
      // Set up a chain in proposed state
      await handler.processMessage(makeProposal());
      const machine = handler.getChainMachine('chain-1');
      expect(machine).toBeDefined();
      expect(machine!.state).toBe('proposed'); // sanity
    });

    it('confirm decision transitions chain to confirming', async () => {
      const confirmation = makeConfirmation({ decision: 'confirm' });
      const result = await handler.processMessage(confirmation);

      expect(result.success).toBe(true);
      const machine = handler.getChainMachine('chain-1');
      expect(machine!.state).toBe('confirming');
    });

    it('decline decision transitions chain to declined with reason', async () => {
      // First move to confirming state (DECLINE is only valid from confirming)
      await handler.processMessage(makeConfirmation({
        message_id: 'msg-confirm-first',
        participant_id: 'p1',
        decision: 'confirm',
      }));
      expect(handler.getChainMachine('chain-1')!.state).toBe('confirming'); // sanity

      const decline = makeConfirmation({
        message_id: 'msg-decline-1',
        decision: 'decline',
        participant_id: 'p2',
        decline_reason: 'Schedule conflict',
      });
      const result = await handler.processMessage(decline);

      expect(result.success).toBe(true);
      const machine = handler.getChainMachine('chain-1');
      expect(machine!.state).toBe('declined');
    });

    it('returns error for unknown chain_id', async () => {
      const confirmation = makeConfirmation({
        chain_id: 'nonexistent-chain',
      });
      const result = await handler.processMessage(confirmation);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown chain');
    });
  });

  describe('idempotency', () => {
    it('returns success with no actions when the same message_id is processed twice', async () => {
      const proposal = makeProposal({ message_id: 'idempotent-msg' });

      const first = await handler.processMessage(proposal);
      expect(first.success).toBe(true);
      expect(first.actions.length).toBeGreaterThan(0); // sanity: first call has actions

      const second = await handler.processMessage(proposal);
      expect(second.success).toBe(true);
      expect(second.actions).toEqual([]);
    });

    it('processes different message_ids independently', async () => {
      const proposal1 = makeProposal({ message_id: 'msg-a', chain_id: 'chain-a' });
      const proposal2 = makeProposal({ message_id: 'msg-b', chain_id: 'chain-b' });

      const result1 = await handler.processMessage(proposal1);
      const result2 = await handler.processMessage(proposal2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      // Both chains exist independently
      expect(handler.getChainMachine('chain-a')).toBeDefined();
      expect(handler.getChainMachine('chain-b')).toBeDefined();
    });
  });

  describe('integration', () => {
    it('full flow: proposal -> first confirmation -> decline', async () => {
      // Step 1: Proposal
      const proposal = makeProposal({ chain_id: 'chain-flow' });
      const proposalResult = await handler.processMessage(proposal);
      expect(proposalResult.success).toBe(true);
      expect(handler.getChainMachine('chain-flow')!.state).toBe('proposed');

      // Step 2: First confirmation
      const confirm = makeConfirmation({
        message_id: 'msg-confirm-flow',
        chain_id: 'chain-flow',
        participant_id: 'p1',
        decision: 'confirm',
      });
      const confirmResult = await handler.processMessage(confirm);
      expect(confirmResult.success).toBe(true);
      expect(handler.getChainMachine('chain-flow')!.state).toBe('confirming');

      // Step 3: Decline from another participant
      const decline = makeConfirmation({
        message_id: 'msg-decline-flow',
        chain_id: 'chain-flow',
        participant_id: 'p2',
        decision: 'decline',
        decline_reason: 'Changed priorities',
      });
      const declineResult = await handler.processMessage(decline);
      expect(declineResult.success).toBe(true);
      expect(handler.getChainMachine('chain-flow')!.state).toBe('declined');
      expect(handler.getChainMachine('chain-flow')!.isTerminal()).toBe(true);
    });

    it('getChainMachine returns stored machine or undefined for unknown chain', async () => {
      // Before any messages, nothing exists
      expect(handler.getChainMachine('unknown')).toBeUndefined();

      // After a proposal, the machine exists
      await handler.processMessage(makeProposal({ chain_id: 'chain-lookup' }));
      const machine = handler.getChainMachine('chain-lookup');
      expect(machine).toBeDefined();
      expect(machine!.state).toBe('proposed');

      // Other chain ids still undefined
      expect(handler.getChainMachine('other-chain')).toBeUndefined();
    });
  });
});
