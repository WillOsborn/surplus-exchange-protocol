/**
 * NetworkGraph - Graph data structure for the SEP matching algorithm
 *
 * Represents participants as nodes and potential exchanges as edges.
 * Designed for efficient traversal during cycle detection in multi-party
 * exchange matching.
 */

// =============================================================================
// Interfaces
// =============================================================================

/**
 * Reference to an offering that a participant can provide.
 */
export interface OfferingReference {
  id: string;
  type: 'service' | 'physical_good' | 'access' | 'space';
  title: string;
  availableCapacity: string;
}

/**
 * Reference to a need that a participant wants fulfilled.
 */
export interface NeedReference {
  id: string;
  type: 'service' | 'physical_good' | 'access' | 'space';
  title: string;
  description: string;
}

/**
 * Constraints that limit which exchanges a participant will accept.
 */
export interface ParticipantConstraints {
  /** Maximum number of participants in an exchange chain */
  maxChainLength: number;
  /** Minimum prior exchanges required with a partner */
  minPartnerExchanges: number;
  /** Sectors the participant prefers to exchange with */
  preferredSectors: string[];
  /** Sectors the participant will not exchange with */
  excludedSectors: string[];
  /** Geographic regions the participant accepts */
  geographic: string[];
}

/**
 * A node in the network graph representing a participant.
 */
export interface NetworkNode {
  participantId: string;
  /** References to what the participant can offer */
  offerings: OfferingReference[];
  /** References to what the participant needs */
  needs: NeedReference[];
  /** Trust score from 0-1, computed from satisfaction history */
  trustScore: number;
  /** Constraints limiting acceptable exchanges */
  constraints: ParticipantConstraints;
}

/**
 * An edge in the network graph representing a potential exchange.
 */
export interface NetworkEdge {
  id: string;
  /** Participant ID of the provider */
  fromId: string;
  /** Participant ID of the recipient */
  toId: string;
  /** ID of the offering being exchanged */
  offeringId: string;
  /** ID of the need being fulfilled, if matching an explicit need */
  needId?: string;
  /** Score from 0-1 indicating how well offering matches need */
  matchScore: number;
  /** Score from 0-1 indicating constraint satisfaction */
  feasibility: number;
  /** Combined score used for pathfinding */
  weight: number;
}

// =============================================================================
// NetworkGraph Class
// =============================================================================

/**
 * Graph data structure for representing the exchange network.
 *
 * Uses Map for O(1) lookups and adjacency lists for efficient traversal
 * during cycle detection.
 *
 * @example
 * ```typescript
 * const graph = new NetworkGraph();
 *
 * graph.addNode({
 *   participantId: 'alice',
 *   offerings: [{ id: 'o1', type: 'service', title: 'Design', availableCapacity: '10h/week' }],
 *   needs: [{ id: 'n1', type: 'service', title: 'Development', description: 'Web dev needed' }],
 *   trustScore: 0.85,
 *   constraints: { maxChainLength: 4, minPartnerExchanges: 0, preferredSectors: [], excludedSectors: [], geographic: ['UK'] }
 * });
 *
 * graph.addEdge({
 *   id: 'e1',
 *   fromId: 'alice',
 *   toId: 'bob',
 *   offeringId: 'o1',
 *   needId: 'n2',
 *   matchScore: 0.9,
 *   feasibility: 0.8,
 *   weight: 0.85
 * });
 *
 * const neighbours = graph.getNeighbours('alice'); // ['bob']
 * ```
 */
export class NetworkGraph {
  /** Map of participant ID to node data */
  private nodes: Map<string, NetworkNode>;

  /** Map of edge ID to edge data */
  private edges: Map<string, NetworkEdge>;

  /** Adjacency list: participant ID -> outgoing edge IDs */
  private outgoingAdjacency: Map<string, Set<string>>;

  /** Reverse adjacency list: participant ID -> incoming edge IDs */
  private incomingAdjacency: Map<string, Set<string>>;

  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.outgoingAdjacency = new Map();
    this.incomingAdjacency = new Map();
  }

  // ===========================================================================
  // Node Operations
  // ===========================================================================

  /**
   * Add a node to the graph.
   *
   * If a node with the same participantId already exists, it will be replaced.
   *
   * @param node - The network node to add
   */
  addNode(node: NetworkNode): void {
    this.nodes.set(node.participantId, node);

    // Initialise adjacency lists if not present
    if (!this.outgoingAdjacency.has(node.participantId)) {
      this.outgoingAdjacency.set(node.participantId, new Set());
    }
    if (!this.incomingAdjacency.has(node.participantId)) {
      this.incomingAdjacency.set(node.participantId, new Set());
    }
  }

  /**
   * Remove a node and all its associated edges from the graph.
   *
   * @param participantId - The ID of the participant to remove
   */
  removeNode(participantId: string): void {
    // Remove all outgoing edges
    const outgoing = this.outgoingAdjacency.get(participantId);
    if (outgoing) {
      for (const edgeId of outgoing) {
        this.removeEdge(edgeId);
      }
    }

    // Remove all incoming edges
    const incoming = this.incomingAdjacency.get(participantId);
    if (incoming) {
      // Create a copy since removeEdge will modify the set
      for (const edgeId of [...incoming]) {
        this.removeEdge(edgeId);
      }
    }

    // Remove node and adjacency entries
    this.nodes.delete(participantId);
    this.outgoingAdjacency.delete(participantId);
    this.incomingAdjacency.delete(participantId);
  }

  /**
   * Get a node by participant ID.
   *
   * @param nodeId - The participant ID to look up
   * @returns The node if found, undefined otherwise
   */
  getNode(nodeId: string): NetworkNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get all nodes in the graph.
   *
   * @returns Array of all network nodes
   */
  getAllNodes(): NetworkNode[] {
    return Array.from(this.nodes.values());
  }

  // ===========================================================================
  // Edge Operations
  // ===========================================================================

  /**
   * Add an edge to the graph.
   *
   * If an edge with the same ID already exists, it will be replaced.
   * The adjacency lists are updated accordingly.
   *
   * @param edge - The network edge to add
   */
  addEdge(edge: NetworkEdge): void {
    // If edge already exists, remove it first to clean up adjacency lists
    if (this.edges.has(edge.id)) {
      this.removeEdge(edge.id);
    }

    this.edges.set(edge.id, edge);

    // Update outgoing adjacency
    let outgoing = this.outgoingAdjacency.get(edge.fromId);
    if (!outgoing) {
      outgoing = new Set();
      this.outgoingAdjacency.set(edge.fromId, outgoing);
    }
    outgoing.add(edge.id);

    // Update incoming adjacency
    let incoming = this.incomingAdjacency.get(edge.toId);
    if (!incoming) {
      incoming = new Set();
      this.incomingAdjacency.set(edge.toId, incoming);
    }
    incoming.add(edge.id);
  }

  /**
   * Remove an edge from the graph.
   *
   * @param edgeId - The ID of the edge to remove
   */
  removeEdge(edgeId: string): void {
    const edge = this.edges.get(edgeId);
    if (!edge) {
      return;
    }

    // Remove from adjacency lists
    const outgoing = this.outgoingAdjacency.get(edge.fromId);
    if (outgoing) {
      outgoing.delete(edgeId);
    }

    const incoming = this.incomingAdjacency.get(edge.toId);
    if (incoming) {
      incoming.delete(edgeId);
    }

    this.edges.delete(edgeId);
  }

  /**
   * Get an edge by ID.
   *
   * @param edgeId - The edge ID to look up
   * @returns The edge if found, undefined otherwise
   */
  getEdge(edgeId: string): NetworkEdge | undefined {
    return this.edges.get(edgeId);
  }

  // ===========================================================================
  // Queries for Cycle Detection
  // ===========================================================================

  /**
   * Get all edges originating from a node.
   *
   * @param nodeId - The participant ID to get outgoing edges for
   * @returns Array of edges where fromId matches the nodeId
   */
  getOutgoingEdges(nodeId: string): NetworkEdge[] {
    const edgeIds = this.outgoingAdjacency.get(nodeId);
    if (!edgeIds) {
      return [];
    }

    const edges: NetworkEdge[] = [];
    for (const edgeId of edgeIds) {
      const edge = this.edges.get(edgeId);
      if (edge) {
        edges.push(edge);
      }
    }
    return edges;
  }

  /**
   * Get all edges pointing to a node.
   *
   * @param nodeId - The participant ID to get incoming edges for
   * @returns Array of edges where toId matches the nodeId
   */
  getIncomingEdges(nodeId: string): NetworkEdge[] {
    const edgeIds = this.incomingAdjacency.get(nodeId);
    if (!edgeIds) {
      return [];
    }

    const edges: NetworkEdge[] = [];
    for (const edgeId of edgeIds) {
      const edge = this.edges.get(edgeId);
      if (edge) {
        edges.push(edge);
      }
    }
    return edges;
  }

  /**
   * Get the IDs of all nodes reachable via outgoing edges from a node.
   *
   * @param nodeId - The participant ID to get neighbours for
   * @returns Array of participant IDs that can be reached in one hop
   */
  getNeighbours(nodeId: string): string[] {
    const edgeIds = this.outgoingAdjacency.get(nodeId);
    if (!edgeIds) {
      return [];
    }

    const neighbours = new Set<string>();
    for (const edgeId of edgeIds) {
      const edge = this.edges.get(edgeId);
      if (edge) {
        neighbours.add(edge.toId);
      }
    }
    return Array.from(neighbours);
  }

  // ===========================================================================
  // Utility
  // ===========================================================================

  /**
   * Get the number of nodes in the graph.
   *
   * @returns The count of nodes
   */
  nodeCount(): number {
    return this.nodes.size;
  }

  /**
   * Get the number of edges in the graph.
   *
   * @returns The count of edges
   */
  edgeCount(): number {
    return this.edges.size;
  }
}
