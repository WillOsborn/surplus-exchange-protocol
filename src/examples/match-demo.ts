/**
 * SEP Matching Algorithm Demonstration
 *
 * Demonstrates multi-party chain discovery using the example test data.
 * Shows the full matching pipeline: graph construction → cycle detection → scoring → ranking.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import {
  NetworkGraph,
  type NetworkNode,
  type NetworkEdge,
  findCycles,
  rankChains,
  summariseChainScore,
  getCycleStats,
} from '../matching/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXAMPLES_DIR = join(__dirname, '../../examples/matching');

// ═══════════════════════════════════════════════════════════════════════════════
// Load Test Data
// ═══════════════════════════════════════════════════════════════════════════════

interface ParticipantData {
  id: string;
  identity: { display_name: string };
  profile: { sectors: string[]; location: { city: string } };
  network_position: { exchange_partners_count: number };
  satisfaction_summary: {
    as_provider: { total: number; satisfied: number };
  };
  preferences?: { matching?: { max_chain_length?: number; min_partner_exchanges?: number } };
  status: string;
}

interface CapabilityMatchingData {
  capability_outputs?: string[];
  capacity_available?: { amount: number; unit: string };
  sector_tags?: string[];
  constraint_flags?: string[];
  location?: { city?: string; region?: string; country?: string };
}

interface NeedCapabilityMatchingData {
  capability_sought?: string[];
  sector_tags?: string[];
  constraint_flags?: string[];
  location?: { city?: string; region?: string; country?: string };
  chain_acceptable?: boolean;
  max_chain_length?: number;
  transport_acceptable?: boolean;
}

interface OfferingData {
  id: string;
  type: string;
  provider: string;
  title: string;
  description: string;
  capability_matching?: CapabilityMatchingData;
  service_details?: { capability_mapping?: Array<{ output: string }> };
  constraints?: {
    chain_participation?: {
      max_chain_length?: number;
      can_be_intermediate?: boolean;
      prefers_direct?: boolean;
    };
  };
}

interface NeedData {
  id: string;
  type: string;
  participant: string;
  title: string;
  description: string;
  capability_matching?: NeedCapabilityMatchingData;
  capability_links?: { explicit_matches?: Array<{ capability_output: string }> };
}

function loadJSON<T>(filename: string): T {
  const path = join(EXAMPLES_DIR, filename);
  const content = readFileSync(path, 'utf-8');
  return JSON.parse(content) as T;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════════

function computeTrustScore(participant: ParticipantData): number {
  const providerStats = participant.satisfaction_summary?.as_provider;
  if (!providerStats || providerStats.total === 0) {
    return 0.5; // Neutral for new participants
  }
  return providerStats.satisfied / providerStats.total;
}

/**
 * Scores how well an offering matches a need using capability_matching fields.
 *
 * This function prioritises structured capability_matching data for fast algorithmic
 * matching, falling back to keyword-based matching for legacy data.
 *
 * Scoring dimensions:
 * - Type match (0.2 weight)
 * - Capability match via capability_matching (0.4 weight)
 * - Sector overlap via capability_matching (0.2 weight)
 * - Keyword fallback (0.2 weight)
 */
function simpleMatchScore(offering: OfferingData, need: NeedData): number {
  let score = 0;

  // === Type match (0.2 weight) ===
  if (offering.type === need.type) {
    score += 0.2;
  }

  // === Capability matching (preferred path) ===
  const offeringCapabilities = offering.capability_matching?.capability_outputs ?? [];
  const needCapabilities = need.capability_matching?.capability_sought ?? [];

  if (offeringCapabilities.length > 0 && needCapabilities.length > 0) {
    // Capability match via capability_matching (0.4 weight)
    const offeringCapsLower = new Set(offeringCapabilities.map(c => c.toLowerCase()));
    const matchedCapabilities = needCapabilities.filter(cap => {
      const capLower = cap.toLowerCase();
      // Exact match or partial match
      return offeringCapsLower.has(capLower) ||
        [...offeringCapsLower].some(oc => oc.includes(capLower) || capLower.includes(oc));
    });

    if (matchedCapabilities.length > 0) {
      const capabilityScore = matchedCapabilities.length / needCapabilities.length;
      score += 0.4 * capabilityScore;
    }

    // Sector overlap (0.2 weight)
    const offeringSectors = new Set(
      (offering.capability_matching?.sector_tags ?? []).map(s => s.toLowerCase())
    );
    const needSectors = (need.capability_matching?.sector_tags ?? []).map(s => s.toLowerCase());

    if (offeringSectors.size > 0 && needSectors.length > 0) {
      const matchedSectors = needSectors.filter(s =>
        offeringSectors.has(s) ||
        [...offeringSectors].some(os => os.includes(s) || s.includes(os))
      );
      if (matchedSectors.length > 0) {
        score += 0.2 * (matchedSectors.length / needSectors.length);
      }
    } else {
      // No sector data - neutral contribution
      score += 0.1;
    }
  } else {
    // === Fallback to legacy capability_links matching ===
    const capabilities = offering.service_details?.capability_mapping?.map((c) =>
      c.output.toLowerCase()
    ) ?? [];
    const explicitMatches = need.capability_links?.explicit_matches?.map((m) =>
      m.capability_output.toLowerCase()
    ) ?? [];

    if (capabilities.length > 0 && explicitMatches.length > 0) {
      for (const match of explicitMatches) {
        if (capabilities.some((cap) => cap.includes(match) || match.includes(cap))) {
          score += 0.4;
          break;
        }
      }
    }
  }

  // === Keyword overlap fallback (0.2 weight) ===
  const offeringWords = new Set(
    `${offering.title} ${offering.description}`.toLowerCase().split(/\W+/)
  );
  const needWords = `${need.title} ${need.description}`.toLowerCase().split(/\W+/);
  const overlap = needWords.filter((w) => w.length > 3 && offeringWords.has(w)).length;
  score += Math.min(0.2, overlap * 0.04);

  return Math.min(1, score);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Demo
// ═══════════════════════════════════════════════════════════════════════════════

function main() {
  console.log('═'.repeat(70));
  console.log('  SEP Matching Algorithm Demonstration');
  console.log('═'.repeat(70));
  console.log();

  // Load data
  console.log('Loading test data...');
  const { participants } = loadJSON<{ participants: ParticipantData[] }>('participants.json');
  const { offerings } = loadJSON<{ offerings: OfferingData[] }>('offerings.json');
  const { needs } = loadJSON<{ needs: NeedData[] }>('needs.json');

  console.log(`  Participants: ${participants.length}`);
  console.log(`  Offerings: ${offerings.length}`);
  console.log(`  Needs: ${needs.length}`);
  console.log();

  // ─── Build participant lookup ───
  const participantMap = new Map<string, ParticipantData>();
  for (const p of participants) {
    participantMap.set(p.id, p);
  }

  // ─── Build offering lookup by provider ───
  const offeringsByProvider = new Map<string, OfferingData[]>();
  for (const o of offerings) {
    const existing = offeringsByProvider.get(o.provider) ?? [];
    existing.push(o);
    offeringsByProvider.set(o.provider, existing);
  }

  // ─── Build needs lookup by participant ───
  const needsByParticipant = new Map<string, NeedData[]>();
  for (const n of needs) {
    const existing = needsByParticipant.get(n.participant) ?? [];
    existing.push(n);
    needsByParticipant.set(n.participant, existing);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Phase 1: Build Graph
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('─── Phase 1: Building Exchange Graph ───');
  console.log();

  const graph = new NetworkGraph();

  // Add nodes
  for (const p of participants) {
    const pOfferings = offeringsByProvider.get(p.id) ?? [];
    const pNeeds = needsByParticipant.get(p.id) ?? [];

    const node: NetworkNode = {
      participantId: p.id,
      offerings: pOfferings.map((o) => ({
        id: o.id,
        type: o.type as 'service' | 'physical_good' | 'access' | 'space',
        title: o.title,
        availableCapacity: 'available',
      })),
      needs: pNeeds.map((n) => ({
        id: n.id,
        type: n.type as 'service' | 'physical_good' | 'access' | 'space',
        title: n.title,
        description: n.description,
      })),
      trustScore: computeTrustScore(p),
      constraints: {
        maxChainLength: p.preferences?.matching?.max_chain_length ?? 6,
        minPartnerExchanges: p.preferences?.matching?.min_partner_exchanges ?? 0,
        preferredSectors: [],
        excludedSectors: [],
        geographic: [],
      },
    };

    graph.addNode(node);
    console.log(
      `  Added: ${p.identity.display_name} (${pOfferings.length} offerings, ${pNeeds.length} needs, trust: ${node.trustScore.toFixed(2)})`
    );
  }

  console.log();

  // Add edges (offerings → needs)
  let edgeCount = 0;
  const MIN_MATCH_SCORE = 0.3;

  for (const offering of offerings) {
    const provider = participantMap.get(offering.provider);
    if (!provider) continue;

    for (const need of needs) {
      // Don't match with self
      if (offering.provider === need.participant) continue;

      const recipient = participantMap.get(need.participant);
      if (!recipient) continue;

      // Check min exchanges constraint
      const minExchanges = recipient.preferences?.matching?.min_partner_exchanges ?? 0;
      if (provider.network_position.exchange_partners_count < minExchanges) {
        continue;
      }

      // Compute match score
      const matchScore = simpleMatchScore(offering, need);
      if (matchScore < MIN_MATCH_SCORE) continue;

      const edge: NetworkEdge = {
        id: `edge-${offering.id}-${need.id}`,
        fromId: offering.provider,
        toId: need.participant,
        offeringId: offering.id,
        needId: need.id,
        matchScore,
        feasibility: 1.0, // Simplified for demo
        weight: matchScore,
      };

      graph.addEdge(edge);
      edgeCount++;
    }
  }

  console.log(`  Created ${edgeCount} potential exchange edges (match score >= ${MIN_MATCH_SCORE})`);
  console.log();

  // ═══════════════════════════════════════════════════════════════════════════
  // Phase 2: Find Cycles
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('─── Phase 2: Discovering Exchange Chains ───');
  console.log();

  const cycles = findCycles(graph, {
    minLength: 2,
    maxLength: 6,
    minEdgeWeight: MIN_MATCH_SCORE,
    maxResults: 50,
  });

  console.log(`  Found ${cycles.length} potential chains`);
  console.log();

  // Show cycle stats
  const stats = getCycleStats(graph, { maxLength: 6 });
  console.log('  Cycle statistics:');
  console.log(`    Participant coverage: ${(stats.participantCoverage * 100).toFixed(0)}%`);
  console.log('    Chains by length:');
  for (const [len, count] of Object.entries(stats.cyclesByLength)) {
    console.log(`      ${len}-party: ${count}`);
  }
  console.log();

  // ═══════════════════════════════════════════════════════════════════════════
  // Phase 3: Score and Rank Chains
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('─── Phase 3: Scoring and Ranking Chains ───');
  console.log();

  const rankedChains = rankChains(cycles, graph);

  console.log(`  Top 5 chains:\n`);

  for (let i = 0; i < Math.min(5, rankedChains.length); i++) {
    const { cycle, score } = rankedChains[i];

    console.log(`  Chain ${i + 1}:`);

    // Show participants
    const participantNames = cycle.nodeIds.map((id) => {
      const p = participantMap.get(id);
      return p?.identity.display_name ?? id;
    });

    console.log(`    Participants: ${participantNames.join(' → ')} → (loop)`);

    // Show edges
    console.log('    Exchanges:');
    for (let j = 0; j < cycle.edgeIds.length; j++) {
      const edge = graph.getEdge(cycle.edgeIds[j]);
      if (edge) {
        const fromP = participantMap.get(edge.fromId);
        const toP = participantMap.get(edge.toId);
        const offering = offerings.find((o) => o.id === edge.offeringId);
        console.log(
          `      ${fromP?.identity.display_name} → ${toP?.identity.display_name}: ${offering?.title} (score: ${edge.matchScore.toFixed(2)})`
        );
      }
    }

    // Show score summary
    console.log();
    console.log('    Score:');
    console.log(`      ${summariseChainScore(score).split('\n').join('\n      ')}`);
    console.log();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Summary
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('═'.repeat(70));
  console.log('  Summary');
  console.log('═'.repeat(70));
  console.log();
  console.log(`  The matching algorithm discovered ${cycles.length} viable chains`);
  console.log(`  connecting ${graph.nodeCount()} participants through ${graph.edgeCount()} potential exchanges.`);
  console.log();
  console.log('  This demonstrates SEP\'s core value proposition:');
  console.log('  AI-powered discovery of complex multi-party exchanges');
  console.log('  that humans couldn\'t compute manually.');
  console.log();
  console.log('═'.repeat(70));
}

main();
