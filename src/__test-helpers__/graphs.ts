/**
 * Shared graph builders for matching module tests.
 *
 * Each builder creates a self-validating NetworkGraph with assertions
 * on structure (node/edge counts and specific edge directions).
 * Nodes have varying trustScores and edges have varying matchScores/weights
 * to enable meaningful scoring comparisons.
 */

import { expect } from 'vitest';
import {
  NetworkGraph,
  type NetworkNode,
  type NetworkEdge,
} from '../matching/graph.js';

// =============================================================================
// Helpers
// =============================================================================

/** Minimal default constraints for test nodes. */
const defaultConstraints = {
  maxChainLength: 6,
  minPartnerExchanges: 0,
  preferredSectors: [] as string[],
  excludedSectors: [] as string[],
  geographic: ['UK'],
};

/**
 * Create a NetworkNode with sensible defaults.
 * Supply overrides via the `partial` parameter.
 */
function makeNode(partial: Partial<NetworkNode> & { participantId: string }): NetworkNode {
  return {
    offerings: [],
    needs: [],
    trustScore: 0.8,
    constraints: { ...defaultConstraints },
    ...partial,
  };
}

/**
 * Create a NetworkEdge with sensible defaults.
 * Supply overrides via the `partial` parameter.
 */
function makeEdge(
  partial: Partial<NetworkEdge> & { id: string; fromId: string; toId: string }
): NetworkEdge {
  return {
    offeringId: `offering-${partial.fromId}`,
    matchScore: 0.8,
    feasibility: 0.8,
    weight: 0.8,
    ...partial,
  };
}

/** Assert that the graph has a directed edge from `fromId` to `toId`. */
function assertEdge(graph: NetworkGraph, fromId: string, toId: string): void {
  const neighbours = graph.getNeighbours(fromId);
  expect(
    neighbours,
    `Expected edge ${fromId} -> ${toId} but ${fromId} has neighbours [${neighbours.join(', ')}]`
  ).toContain(toId);
}

/** Assert that the graph does NOT have a directed edge from `fromId` to `toId`. */
function assertNoEdge(graph: NetworkGraph, fromId: string, toId: string): void {
  const neighbours = graph.getNeighbours(fromId);
  expect(
    neighbours,
    `Expected NO edge ${fromId} -> ${toId} but found one`
  ).not.toContain(toId);
}

// =============================================================================
// Builders
// =============================================================================

/**
 * Triangle graph: A -> B -> C -> A
 *
 * 3 nodes, 3 directed edges, all weights 0.8.
 * Trust scores: A=0.9, B=0.8, C=0.7
 * Match scores: A->B=0.9, B->C=0.8, C->A=0.7
 */
export function buildTriangleGraph(): NetworkGraph {
  const graph = new NetworkGraph();

  graph.addNode(makeNode({
    participantId: 'A',
    trustScore: 0.9,
    offerings: [{ id: 'offering-A', type: 'service', title: 'Design', availableCapacity: '10h/week' }],
    needs: [{ id: 'need-A', type: 'service', title: 'Accounting', description: 'Monthly accounts' }],
  }));
  graph.addNode(makeNode({
    participantId: 'B',
    trustScore: 0.8,
    offerings: [{ id: 'offering-B', type: 'service', title: 'Development', availableCapacity: '20h/week' }],
    needs: [{ id: 'need-B', type: 'service', title: 'Design', description: 'UI design needed' }],
  }));
  graph.addNode(makeNode({
    participantId: 'C',
    trustScore: 0.7,
    offerings: [{ id: 'offering-C', type: 'service', title: 'Accounting', availableCapacity: '5h/week' }],
    needs: [{ id: 'need-C', type: 'service', title: 'Development', description: 'Backend dev' }],
  }));

  graph.addEdge(makeEdge({ id: 'e-AB', fromId: 'A', toId: 'B', offeringId: 'offering-A', needId: 'need-B', matchScore: 0.9, weight: 0.8 }));
  graph.addEdge(makeEdge({ id: 'e-BC', fromId: 'B', toId: 'C', offeringId: 'offering-B', needId: 'need-C', matchScore: 0.8, weight: 0.8 }));
  graph.addEdge(makeEdge({ id: 'e-CA', fromId: 'C', toId: 'A', offeringId: 'offering-C', needId: 'need-A', matchScore: 0.7, weight: 0.8 }));

  // Self-validation
  expect(graph.nodeCount()).toBe(3);
  expect(graph.edgeCount()).toBe(3);
  assertEdge(graph, 'A', 'B');
  assertEdge(graph, 'B', 'C');
  assertEdge(graph, 'C', 'A');

  return graph;
}

/**
 * Linear (acyclic) graph: A -> B -> C, no return edge.
 *
 * 3 nodes, 2 directed edges. C has no outgoing neighbours.
 * Trust scores: A=0.85, B=0.75, C=0.65
 * Match scores: A->B=0.9, B->C=0.7
 */
export function buildLinearGraph(): NetworkGraph {
  const graph = new NetworkGraph();

  graph.addNode(makeNode({
    participantId: 'A',
    trustScore: 0.85,
    offerings: [{ id: 'offering-A', type: 'service', title: 'Design', availableCapacity: '10h/week' }],
  }));
  graph.addNode(makeNode({
    participantId: 'B',
    trustScore: 0.75,
    offerings: [{ id: 'offering-B', type: 'service', title: 'Development', availableCapacity: '20h/week' }],
  }));
  graph.addNode(makeNode({
    participantId: 'C',
    trustScore: 0.65,
    offerings: [{ id: 'offering-C', type: 'service', title: 'Accounting', availableCapacity: '5h/week' }],
  }));

  graph.addEdge(makeEdge({ id: 'e-AB', fromId: 'A', toId: 'B', matchScore: 0.9, weight: 0.85 }));
  graph.addEdge(makeEdge({ id: 'e-BC', fromId: 'B', toId: 'C', matchScore: 0.7, weight: 0.7 }));

  // Self-validation
  expect(graph.nodeCount()).toBe(3);
  expect(graph.edgeCount()).toBe(2);
  assertEdge(graph, 'A', 'B');
  assertEdge(graph, 'B', 'C');
  expect(graph.getNeighbours('C')).toHaveLength(0);

  return graph;
}

/**
 * Complex graph: 5 nodes with multiple overlapping cycles.
 *
 * Nodes: A, B, C, D, E
 * Edges (7 total):
 *   A->B, B->C, C->A  (triangle)
 *   C->D, D->E, E->A  (extends to 5-node cycle A->B->C->D->E->A)
 *   B->D              (creates additional cycle A->B->D->E->A)
 *
 * Trust scores: A=0.95, B=0.85, C=0.75, D=0.55, E=0.65
 * Varied weights for scoring differentiation.
 */
export function buildComplexGraph(): NetworkGraph {
  const graph = new NetworkGraph();

  graph.addNode(makeNode({
    participantId: 'A',
    trustScore: 0.95,
    offerings: [{ id: 'offering-A', type: 'service', title: 'Design', availableCapacity: '10h/week' }],
    needs: [{ id: 'need-A', type: 'service', title: 'Accounting', description: 'Monthly accounts' }],
  }));
  graph.addNode(makeNode({
    participantId: 'B',
    trustScore: 0.85,
    offerings: [{ id: 'offering-B', type: 'service', title: 'Development', availableCapacity: '20h/week' }],
    needs: [{ id: 'need-B', type: 'service', title: 'Design', description: 'UI design' }],
  }));
  graph.addNode(makeNode({
    participantId: 'C',
    trustScore: 0.75,
    offerings: [{ id: 'offering-C', type: 'service', title: 'Accounting', availableCapacity: '5h/week' }],
    needs: [{ id: 'need-C', type: 'service', title: 'Development', description: 'Backend' }],
  }));
  graph.addNode(makeNode({
    participantId: 'D',
    trustScore: 0.55,
    offerings: [{ id: 'offering-D', type: 'service', title: 'Marketing', availableCapacity: '15h/week' }],
    needs: [{ id: 'need-D', type: 'service', title: 'Accounting', description: 'Tax prep' }],
  }));
  graph.addNode(makeNode({
    participantId: 'E',
    trustScore: 0.65,
    offerings: [{ id: 'offering-E', type: 'service', title: 'Legal', availableCapacity: '8h/week' }],
    needs: [{ id: 'need-E', type: 'service', title: 'Marketing', description: 'Branding' }],
  }));

  // Triangle: A->B->C->A
  graph.addEdge(makeEdge({ id: 'e-AB', fromId: 'A', toId: 'B', matchScore: 0.9, weight: 0.85 }));
  graph.addEdge(makeEdge({ id: 'e-BC', fromId: 'B', toId: 'C', matchScore: 0.8, weight: 0.75 }));
  graph.addEdge(makeEdge({ id: 'e-CA', fromId: 'C', toId: 'A', matchScore: 0.7, weight: 0.7 }));
  // Extension: C->D->E->A
  graph.addEdge(makeEdge({ id: 'e-CD', fromId: 'C', toId: 'D', matchScore: 0.6, weight: 0.6 }));
  graph.addEdge(makeEdge({ id: 'e-DE', fromId: 'D', toId: 'E', matchScore: 0.5, weight: 0.5 }));
  graph.addEdge(makeEdge({ id: 'e-EA', fromId: 'E', toId: 'A', matchScore: 0.65, weight: 0.55 }));
  // Shortcut: B->D (creates A->B->D->E->A)
  graph.addEdge(makeEdge({ id: 'e-BD', fromId: 'B', toId: 'D', matchScore: 0.55, weight: 0.5 }));

  // Self-validation
  expect(graph.nodeCount()).toBe(5);
  expect(graph.edgeCount()).toBe(7);
  // Spot-check key connections
  assertEdge(graph, 'A', 'B');
  assertEdge(graph, 'C', 'A');
  assertEdge(graph, 'E', 'A');
  assertEdge(graph, 'B', 'D');

  return graph;
}

/**
 * Disconnected graph: Two separate pairs with no cross-connections.
 *
 * Pair 1: A <-> B (bidirectional)
 * Pair 2: C <-> D (bidirectional)
 *
 * 4 nodes, 4 directed edges. No path between pairs.
 * Trust scores: A=0.9, B=0.8, C=0.6, D=0.5
 */
export function buildDisconnectedGraph(): NetworkGraph {
  const graph = new NetworkGraph();

  graph.addNode(makeNode({
    participantId: 'A',
    trustScore: 0.9,
    offerings: [{ id: 'offering-A', type: 'service', title: 'Design', availableCapacity: '10h/week' }],
    needs: [{ id: 'need-A', type: 'service', title: 'Development', description: 'Web dev' }],
  }));
  graph.addNode(makeNode({
    participantId: 'B',
    trustScore: 0.8,
    offerings: [{ id: 'offering-B', type: 'service', title: 'Development', availableCapacity: '20h/week' }],
    needs: [{ id: 'need-B', type: 'service', title: 'Design', description: 'UI design' }],
  }));
  graph.addNode(makeNode({
    participantId: 'C',
    trustScore: 0.6,
    offerings: [{ id: 'offering-C', type: 'service', title: 'Accounting', availableCapacity: '5h/week' }],
    needs: [{ id: 'need-C', type: 'service', title: 'Marketing', description: 'Social media' }],
  }));
  graph.addNode(makeNode({
    participantId: 'D',
    trustScore: 0.5,
    offerings: [{ id: 'offering-D', type: 'service', title: 'Marketing', availableCapacity: '15h/week' }],
    needs: [{ id: 'need-D', type: 'service', title: 'Accounting', description: 'Tax prep' }],
  }));

  // Pair 1
  graph.addEdge(makeEdge({ id: 'e-AB', fromId: 'A', toId: 'B', matchScore: 0.9, weight: 0.85 }));
  graph.addEdge(makeEdge({ id: 'e-BA', fromId: 'B', toId: 'A', matchScore: 0.85, weight: 0.8 }));
  // Pair 2
  graph.addEdge(makeEdge({ id: 'e-CD', fromId: 'C', toId: 'D', matchScore: 0.6, weight: 0.55 }));
  graph.addEdge(makeEdge({ id: 'e-DC', fromId: 'D', toId: 'C', matchScore: 0.55, weight: 0.5 }));

  // Self-validation
  expect(graph.nodeCount()).toBe(4);
  expect(graph.edgeCount()).toBe(4);
  // Pair 1 connections
  assertEdge(graph, 'A', 'B');
  assertEdge(graph, 'B', 'A');
  // Pair 2 connections
  assertEdge(graph, 'C', 'D');
  assertEdge(graph, 'D', 'C');
  // No cross-connections
  assertNoEdge(graph, 'A', 'C');
  assertNoEdge(graph, 'A', 'D');
  assertNoEdge(graph, 'B', 'C');
  assertNoEdge(graph, 'B', 'D');
  assertNoEdge(graph, 'C', 'A');
  assertNoEdge(graph, 'C', 'B');
  assertNoEdge(graph, 'D', 'A');
  assertNoEdge(graph, 'D', 'B');

  return graph;
}

/**
 * Bidirectional triangle: Both A->B->C->A AND A->C->B->A.
 *
 * 3 nodes, 6 directed edges. Two distinct directed cycles that share
 * the same nodes but traverse in opposite directions. Used to verify
 * that the cycle finder does NOT deduplicate opposite-direction cycles.
 *
 * Trust scores: A=0.9, B=0.85, C=0.8
 * Forward weights slightly higher than reverse for differentiation.
 */
export function buildBidirectionalTriangle(): NetworkGraph {
  const graph = new NetworkGraph();

  graph.addNode(makeNode({
    participantId: 'A',
    trustScore: 0.9,
    offerings: [
      { id: 'offering-A-fwd', type: 'service', title: 'Design', availableCapacity: '10h/week' },
      { id: 'offering-A-rev', type: 'service', title: 'Consulting', availableCapacity: '5h/week' },
    ],
    needs: [
      { id: 'need-A-fwd', type: 'service', title: 'Accounting', description: 'Monthly accounts' },
      { id: 'need-A-rev', type: 'service', title: 'Development', description: 'App dev' },
    ],
  }));
  graph.addNode(makeNode({
    participantId: 'B',
    trustScore: 0.85,
    offerings: [
      { id: 'offering-B-fwd', type: 'service', title: 'Development', availableCapacity: '20h/week' },
      { id: 'offering-B-rev', type: 'service', title: 'Training', availableCapacity: '8h/week' },
    ],
    needs: [
      { id: 'need-B-fwd', type: 'service', title: 'Design', description: 'UI design' },
      { id: 'need-B-rev', type: 'service', title: 'Consulting', description: 'Strategy' },
    ],
  }));
  graph.addNode(makeNode({
    participantId: 'C',
    trustScore: 0.8,
    offerings: [
      { id: 'offering-C-fwd', type: 'service', title: 'Accounting', availableCapacity: '5h/week' },
      { id: 'offering-C-rev', type: 'service', title: 'Legal', availableCapacity: '3h/week' },
    ],
    needs: [
      { id: 'need-C-fwd', type: 'service', title: 'Development', description: 'Backend' },
      { id: 'need-C-rev', type: 'service', title: 'Training', description: 'Tech training' },
    ],
  }));

  // Forward direction: A->B->C->A
  graph.addEdge(makeEdge({ id: 'e-AB-fwd', fromId: 'A', toId: 'B', offeringId: 'offering-A-fwd', matchScore: 0.9, weight: 0.85 }));
  graph.addEdge(makeEdge({ id: 'e-BC-fwd', fromId: 'B', toId: 'C', offeringId: 'offering-B-fwd', matchScore: 0.85, weight: 0.8 }));
  graph.addEdge(makeEdge({ id: 'e-CA-fwd', fromId: 'C', toId: 'A', offeringId: 'offering-C-fwd', matchScore: 0.8, weight: 0.75 }));

  // Reverse direction: A->C->B->A
  graph.addEdge(makeEdge({ id: 'e-AC-rev', fromId: 'A', toId: 'C', offeringId: 'offering-A-rev', matchScore: 0.75, weight: 0.7 }));
  graph.addEdge(makeEdge({ id: 'e-CB-rev', fromId: 'C', toId: 'B', offeringId: 'offering-C-rev', matchScore: 0.7, weight: 0.65 }));
  graph.addEdge(makeEdge({ id: 'e-BA-rev', fromId: 'B', toId: 'A', offeringId: 'offering-B-rev', matchScore: 0.65, weight: 0.6 }));

  // Self-validation
  expect(graph.nodeCount()).toBe(3);
  expect(graph.edgeCount()).toBe(6);
  // Forward direction
  assertEdge(graph, 'A', 'B');
  assertEdge(graph, 'B', 'C');
  assertEdge(graph, 'C', 'A');
  // Reverse direction
  assertEdge(graph, 'A', 'C');
  assertEdge(graph, 'C', 'B');
  assertEdge(graph, 'B', 'A');

  return graph;
}
