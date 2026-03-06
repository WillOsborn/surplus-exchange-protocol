import { describe, it, expect } from 'vitest';
import {
  NetworkGraph,
  type NetworkNode,
  type NetworkEdge,
} from './graph.js';

// =============================================================================
// Inline helpers — shapes match the actual types in graph.ts
// =============================================================================

function makeNode(id: string, overrides: Partial<NetworkNode> = {}): NetworkNode {
  return {
    participantId: id,
    offerings: [],
    needs: [],
    trustScore: 0.8,
    constraints: {
      maxChainLength: 6,
      minPartnerExchanges: 0,
      preferredSectors: [],
      excludedSectors: [],
      geographic: [],
    },
    ...overrides,
  };
}

function makeEdge(
  id: string,
  from: string,
  to: string,
  overrides: Partial<NetworkEdge> = {}
): NetworkEdge {
  return {
    id,
    fromId: from,
    toId: to,
    offeringId: 'o1',
    matchScore: 0.8,
    feasibility: 0.9,
    weight: 0.85,
    ...overrides,
  };
}

// =============================================================================
// Node operations
// =============================================================================

describe('NetworkGraph', () => {
  describe('node operations', () => {
    it('addNode + getNode roundtrip', () => {
      const graph = new NetworkGraph();
      const node = makeNode('alice');
      graph.addNode(node);
      const retrieved = graph.getNode('alice');
      expect(retrieved).toBeDefined();
      expect(retrieved!.participantId).toBe('alice');
      expect(retrieved!.trustScore).toBe(0.8);
    });

    it('addNode replaces existing node with same participantId', () => {
      const graph = new NetworkGraph();
      graph.addNode(makeNode('alice', { trustScore: 0.5 }));
      graph.addNode(makeNode('alice', { trustScore: 0.9 }));
      const retrieved = graph.getNode('alice');
      expect(retrieved!.trustScore).toBe(0.9);
      expect(graph.nodeCount()).toBe(1);
    });

    it('getNode returns undefined for non-existent ID', () => {
      const graph = new NetworkGraph();
      expect(graph.getNode('nonexistent')).toBeUndefined();
    });

    it('getAllNodes returns all added nodes', () => {
      const graph = new NetworkGraph();
      graph.addNode(makeNode('alice'));
      graph.addNode(makeNode('bob'));
      graph.addNode(makeNode('charlie'));
      const allNodes = graph.getAllNodes();
      expect(allNodes).toHaveLength(3);
      const ids = allNodes.map(n => n.participantId).sort();
      expect(ids).toEqual(['alice', 'bob', 'charlie']);
    });

    it('removeNode removes node AND cascades all associated edges', () => {
      const graph = new NetworkGraph();
      graph.addNode(makeNode('alice'));
      graph.addNode(makeNode('bob'));
      graph.addNode(makeNode('charlie'));
      graph.addEdge(makeEdge('e1', 'alice', 'bob'));
      graph.addEdge(makeEdge('e2', 'charlie', 'alice'));

      graph.removeNode('alice');

      expect(graph.getNode('alice')).toBeUndefined();
      expect(graph.getEdge('e1')).toBeUndefined();
      expect(graph.getEdge('e2')).toBeUndefined();
      expect(graph.nodeCount()).toBe(2);
      expect(graph.edgeCount()).toBe(0);
    });

    it('nodeCount is correct after add and remove', () => {
      const graph = new NetworkGraph();
      expect(graph.nodeCount()).toBe(0);

      graph.addNode(makeNode('alice'));
      expect(graph.nodeCount()).toBe(1);

      graph.addNode(makeNode('bob'));
      expect(graph.nodeCount()).toBe(2);

      graph.removeNode('alice');
      expect(graph.nodeCount()).toBe(1);

      graph.removeNode('bob');
      expect(graph.nodeCount()).toBe(0);
    });
  });

  // ===========================================================================
  // Edge operations
  // ===========================================================================

  describe('edge operations', () => {
    it('addEdge + getEdge roundtrip', () => {
      const graph = new NetworkGraph();
      graph.addNode(makeNode('alice'));
      graph.addNode(makeNode('bob'));
      const edge = makeEdge('e1', 'alice', 'bob');
      graph.addEdge(edge);
      const retrieved = graph.getEdge('e1');
      expect(retrieved).toBeDefined();
      expect(retrieved!.fromId).toBe('alice');
      expect(retrieved!.toId).toBe('bob');
      expect(retrieved!.matchScore).toBe(0.8);
    });

    it('addEdge replaces existing edge with same ID and cleans old adjacency', () => {
      const graph = new NetworkGraph();
      graph.addNode(makeNode('alice'));
      graph.addNode(makeNode('bob'));
      graph.addNode(makeNode('charlie'));

      // Add edge from alice to bob
      graph.addEdge(makeEdge('e1', 'alice', 'bob'));
      expect(graph.getNeighbours('alice')).toEqual(['bob']);

      // Replace with edge from alice to charlie using same ID
      graph.addEdge(makeEdge('e1', 'alice', 'charlie'));
      expect(graph.getEdge('e1')!.toId).toBe('charlie');

      // Old adjacency should be cleaned: alice should no longer point to bob via e1
      const outgoing = graph.getOutgoingEdges('alice');
      expect(outgoing).toHaveLength(1);
      expect(outgoing[0].toId).toBe('charlie');

      // bob should have no incoming edges
      expect(graph.getIncomingEdges('bob')).toHaveLength(0);

      expect(graph.edgeCount()).toBe(1);
    });

    it('removeEdge removes edge and cleans both adjacency lists', () => {
      const graph = new NetworkGraph();
      graph.addNode(makeNode('alice'));
      graph.addNode(makeNode('bob'));
      graph.addEdge(makeEdge('e1', 'alice', 'bob'));

      graph.removeEdge('e1');

      expect(graph.getEdge('e1')).toBeUndefined();
      expect(graph.getOutgoingEdges('alice')).toHaveLength(0);
      expect(graph.getIncomingEdges('bob')).toHaveLength(0);
      expect(graph.edgeCount()).toBe(0);
    });

    it('removeEdge is no-op for non-existent ID', () => {
      const graph = new NetworkGraph();
      graph.addNode(makeNode('alice'));
      graph.addNode(makeNode('bob'));
      graph.addEdge(makeEdge('e1', 'alice', 'bob'));

      // Should not throw
      graph.removeEdge('nonexistent');
      expect(graph.edgeCount()).toBe(1);
      expect(graph.getEdge('e1')).toBeDefined();
    });

    it('edgeCount is correct after add and remove', () => {
      const graph = new NetworkGraph();
      graph.addNode(makeNode('alice'));
      graph.addNode(makeNode('bob'));
      graph.addNode(makeNode('charlie'));

      expect(graph.edgeCount()).toBe(0);

      graph.addEdge(makeEdge('e1', 'alice', 'bob'));
      expect(graph.edgeCount()).toBe(1);

      graph.addEdge(makeEdge('e2', 'bob', 'charlie'));
      expect(graph.edgeCount()).toBe(2);

      graph.removeEdge('e1');
      expect(graph.edgeCount()).toBe(1);

      graph.removeEdge('e2');
      expect(graph.edgeCount()).toBe(0);
    });
  });

  // ===========================================================================
  // Adjacency queries
  // ===========================================================================

  describe('adjacency queries', () => {
    it('getOutgoingEdges returns edges where fromId matches', () => {
      const graph = new NetworkGraph();
      graph.addNode(makeNode('alice'));
      graph.addNode(makeNode('bob'));
      graph.addNode(makeNode('charlie'));
      graph.addEdge(makeEdge('e1', 'alice', 'bob'));
      graph.addEdge(makeEdge('e2', 'alice', 'charlie'));
      graph.addEdge(makeEdge('e3', 'bob', 'charlie'));

      const aliceOutgoing = graph.getOutgoingEdges('alice');
      expect(aliceOutgoing).toHaveLength(2);
      const toIds = aliceOutgoing.map(e => e.toId).sort();
      expect(toIds).toEqual(['bob', 'charlie']);
    });

    it('getIncomingEdges returns edges where toId matches', () => {
      const graph = new NetworkGraph();
      graph.addNode(makeNode('alice'));
      graph.addNode(makeNode('bob'));
      graph.addNode(makeNode('charlie'));
      graph.addEdge(makeEdge('e1', 'alice', 'charlie'));
      graph.addEdge(makeEdge('e2', 'bob', 'charlie'));

      const charlieIncoming = graph.getIncomingEdges('charlie');
      expect(charlieIncoming).toHaveLength(2);
      const fromIds = charlieIncoming.map(e => e.fromId).sort();
      expect(fromIds).toEqual(['alice', 'bob']);
    });

    it('getNeighbours returns unique toIds from outgoing edges', () => {
      const graph = new NetworkGraph();
      graph.addNode(makeNode('alice'));
      graph.addNode(makeNode('bob'));
      graph.addNode(makeNode('charlie'));
      // Two edges from alice to bob (different offerings)
      graph.addEdge(makeEdge('e1', 'alice', 'bob', { offeringId: 'o1' }));
      graph.addEdge(makeEdge('e2', 'alice', 'bob', { offeringId: 'o2' }));
      graph.addEdge(makeEdge('e3', 'alice', 'charlie'));

      const neighbours = graph.getNeighbours('alice');
      expect(neighbours.sort()).toEqual(['bob', 'charlie']);
    });

    it('all three return empty arrays for isolated node', () => {
      const graph = new NetworkGraph();
      graph.addNode(makeNode('alice'));

      expect(graph.getOutgoingEdges('alice')).toEqual([]);
      expect(graph.getIncomingEdges('alice')).toEqual([]);
      expect(graph.getNeighbours('alice')).toEqual([]);
    });

    it('all three return empty arrays for non-existent node ID', () => {
      const graph = new NetworkGraph();

      expect(graph.getOutgoingEdges('nonexistent')).toEqual([]);
      expect(graph.getIncomingEdges('nonexistent')).toEqual([]);
      expect(graph.getNeighbours('nonexistent')).toEqual([]);
    });
  });

  // ===========================================================================
  // Edge cases
  // ===========================================================================

  describe('edge cases', () => {
    it('triangle graph has correct bidirectional adjacency', () => {
      const graph = new NetworkGraph();
      graph.addNode(makeNode('alice'));
      graph.addNode(makeNode('bob'));
      graph.addNode(makeNode('charlie'));

      // A -> B -> C -> A (cycle)
      graph.addEdge(makeEdge('e1', 'alice', 'bob'));
      graph.addEdge(makeEdge('e2', 'bob', 'charlie'));
      graph.addEdge(makeEdge('e3', 'charlie', 'alice'));

      // Alice: outgoing to bob, incoming from charlie
      expect(graph.getOutgoingEdges('alice')).toHaveLength(1);
      expect(graph.getOutgoingEdges('alice')[0].toId).toBe('bob');
      expect(graph.getIncomingEdges('alice')).toHaveLength(1);
      expect(graph.getIncomingEdges('alice')[0].fromId).toBe('charlie');

      // Bob: outgoing to charlie, incoming from alice
      expect(graph.getOutgoingEdges('bob')).toHaveLength(1);
      expect(graph.getOutgoingEdges('bob')[0].toId).toBe('charlie');
      expect(graph.getIncomingEdges('bob')).toHaveLength(1);
      expect(graph.getIncomingEdges('bob')[0].fromId).toBe('alice');

      // Charlie: outgoing to alice, incoming from bob
      expect(graph.getOutgoingEdges('charlie')).toHaveLength(1);
      expect(graph.getOutgoingEdges('charlie')[0].toId).toBe('alice');
      expect(graph.getIncomingEdges('charlie')).toHaveLength(1);
      expect(graph.getIncomingEdges('charlie')[0].fromId).toBe('bob');
    });

    it('removing a node with both incoming and outgoing edges cleans all', () => {
      const graph = new NetworkGraph();
      graph.addNode(makeNode('alice'));
      graph.addNode(makeNode('bob'));
      graph.addNode(makeNode('charlie'));

      graph.addEdge(makeEdge('e1', 'alice', 'bob'));   // alice -> bob
      graph.addEdge(makeEdge('e2', 'bob', 'charlie')); // bob -> charlie
      graph.addEdge(makeEdge('e3', 'charlie', 'bob')); // charlie -> bob

      // Bob has 1 outgoing (to charlie) and 2 incoming (from alice and charlie)
      expect(graph.getOutgoingEdges('bob')).toHaveLength(1);
      expect(graph.getIncomingEdges('bob')).toHaveLength(2);

      graph.removeNode('bob');

      expect(graph.getNode('bob')).toBeUndefined();
      expect(graph.edgeCount()).toBe(0);

      // Alice and charlie should have no edges
      expect(graph.getOutgoingEdges('alice')).toHaveLength(0);
      expect(graph.getIncomingEdges('charlie')).toHaveLength(0);
      expect(graph.getOutgoingEdges('charlie')).toHaveLength(0);
    });

    it('multiple edges between same node pair tracked independently', () => {
      const graph = new NetworkGraph();
      graph.addNode(makeNode('alice'));
      graph.addNode(makeNode('bob'));

      graph.addEdge(makeEdge('e1', 'alice', 'bob', { offeringId: 'o1', matchScore: 0.7 }));
      graph.addEdge(makeEdge('e2', 'alice', 'bob', { offeringId: 'o2', matchScore: 0.9 }));

      expect(graph.edgeCount()).toBe(2);
      expect(graph.getEdge('e1')!.matchScore).toBe(0.7);
      expect(graph.getEdge('e2')!.matchScore).toBe(0.9);

      const outgoing = graph.getOutgoingEdges('alice');
      expect(outgoing).toHaveLength(2);

      // Neighbours should deduplicate
      expect(graph.getNeighbours('alice')).toEqual(['bob']);

      // Remove one edge, other remains
      graph.removeEdge('e1');
      expect(graph.edgeCount()).toBe(1);
      expect(graph.getOutgoingEdges('alice')).toHaveLength(1);
      expect(graph.getOutgoingEdges('alice')[0].offeringId).toBe('o2');
    });

    it('addEdge for fromId with no corresponding node creates adjacency', () => {
      const graph = new NetworkGraph();
      // No nodes added — edge references non-existent node IDs
      graph.addEdge(makeEdge('e1', 'phantom', 'ghost'));

      expect(graph.edgeCount()).toBe(1);
      expect(graph.getEdge('e1')).toBeDefined();

      // Adjacency should still work for the phantom node
      const outgoing = graph.getOutgoingEdges('phantom');
      expect(outgoing).toHaveLength(1);
      expect(outgoing[0].toId).toBe('ghost');

      const incoming = graph.getIncomingEdges('ghost');
      expect(incoming).toHaveLength(1);
      expect(incoming[0].fromId).toBe('phantom');
    });
  });
});
