/**
 * SEP Matching Algorithm Demonstration
 *
 * Demonstrates multi-party chain discovery using the example test data.
 * Shows the full matching pipeline: graph construction → cycle detection → scoring → ranking.
 *
 * This demo uses the core scoreMatch function via thin data adapters, demonstrating
 * how real implementations would integrate with the SEP matching engine.
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
  scoreMatch,
  type ScorerOffering,
  type ScorerNeed,
  type MatchScore,
} from '../matching/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXAMPLES_DIR = join(__dirname, '../../examples/matching');

// ═══════════════════════════════════════════════════════════════════════════════
// Load Test Data
// ═══════════════════════════════════════════════════════════════════════════════

interface ParticipantData {
  id: string;
  identity: { display_name: string };
  profile: { sectors: string[]; location: { city: string; region?: string; country?: string } };
  network_position: {
    exchange_partners_count: number;
    repeat_partner_rate?: number;
    chain_participation_count?: number;
  };
  satisfaction_summary: {
    as_provider: { total: number; satisfied: number };
    as_recipient?: { total: number; satisfied: number };
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
  surplus_context?: {
    why_surplus?: string;
    alternative_fate?: string;
    time_sensitivity?: string;
  };
  capability_matching?: CapabilityMatchingData;
  service_details?: { capability_mapping?: Array<{ output: string }> };
  constraints?: {
    geographic?: string[];
    timing?: {
      available_from?: string;
      available_until?: string;
    };
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
  constraints?: {
    geographic?: {
      accepted_regions?: string[];
      excluded_regions?: string[];
    };
    timing?: {
      needed_by?: string;
    };
    provider_requirements?: {
      min_exchanges_completed?: number;
      verification_required?: boolean;
    };
  };
  urgency?: {
    declared_priority?: string;
    deadline?: string;
    deadline_type?: string;
    flexibility_for_speed?: {
      accept_partial?: boolean;
      accept_less_experienced?: boolean;
      accept_longer_chain?: boolean;
      accept_different_format?: boolean;
    };
  };
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

// ═══════════════════════════════════════════════════════════════════════════════
// Data Adapters — transform JSON format to core scorer interfaces
// ═══════════════════════════════════════════════════════════════════════════════

function toScorerOffering(o: OfferingData): ScorerOffering {
  return {
    id: o.id,
    type: o.type,
    title: o.title,
    description: o.description,
    capabilities: o.capability_matching?.capability_outputs ??
      o.service_details?.capability_mapping?.map(c => c.output) ?? [],
    constraints: {
      geographic: o.capability_matching?.location
        ? [o.capability_matching.location.region, o.capability_matching.location.country].filter(Boolean) as string[]
        : o.constraints?.geographic ?? [],
      timing: {
        availableFrom: o.constraints?.timing?.available_from,
        availableUntil: o.constraints?.timing?.available_until,
      },
    },
    surplusTimeSensitivity: o.surplus_context?.time_sensitivity as ScorerOffering['surplusTimeSensitivity'],
    sectorTags: o.capability_matching?.sector_tags,
  };
}

function toScorerNeed(n: NeedData): ScorerNeed {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    description: n.description,
    explicitMatches: n.capability_matching?.capability_sought ??
      n.capability_links?.explicit_matches?.map(m => m.capability_output) ?? [],
    constraints: {
      geographic: {
        acceptedRegions: n.constraints?.geographic?.accepted_regions,
      },
      timing: {
        neededBy: n.constraints?.timing?.needed_by,
      },
    },
    sectorTags: n.capability_matching?.sector_tags,
    urgentDeadline: n.urgency?.declared_priority === 'high',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Demo
// ═══════════════════════════════════════════════════════════════════════════════

function main() {
  console.log('═'.repeat(70));
  console.log('  SEP Matching Algorithm Demonstration');
  console.log('═'.repeat(70));
  console.log();
  console.log('  This demo shows SEP\'s core matching pipeline:');
  console.log('  1. Build a graph of participants, offerings, and needs');
  console.log('  2. Score each potential exchange using the core scorer');
  console.log('  3. Discover multi-party chains via cycle detection');
  console.log('  4. Rank chains by composite quality score');
  console.log();
  console.log('  The scorer evaluates 8 dimensions: semantic fit, capacity,');
  console.log('  timing, geographic compatibility, trust threshold,');
  console.log('  surplus time sensitivity, relationship diversity, and sector overlap.');
  console.log('  Trust and geographic scores are deal-breakers — if either is 0,');
  console.log('  the overall score is forced to 0 regardless of other dimensions.');
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
  const filteredEdges: Array<{ from: string; to: string; offering: string; reasons: string[] }> = [];
  const edgeScores = new Map<string, MatchScore>();

  for (const offering of offerings) {
    const provider = participantMap.get(offering.provider);
    if (!provider) continue;

    for (const need of needs) {
      // Don't match with self
      if (offering.provider === need.participant) continue;

      const recipient = participantMap.get(need.participant);
      if (!recipient) continue;

      // ─── Constraint filtering (before scoring) ───

      // Geographic exclusion check
      const excludedRegions = need.constraints?.geographic?.excluded_regions ?? [];
      const providerRegion = provider.profile?.location?.region;
      if (providerRegion && excludedRegions.some(r => r.toLowerCase() === providerRegion.toLowerCase())) {
        filteredEdges.push({
          from: provider.identity.display_name,
          to: recipient.identity.display_name,
          offering: offering.title,
          reasons: [`Geographic: excluded region '${providerRegion}'`],
        });
        continue;
      }

      // Provider experience check
      const minExchanges = need.constraints?.provider_requirements?.min_exchanges_completed ?? 0;
      const providerExchanges = (provider.satisfaction_summary?.as_provider?.total ?? 0) +
        (provider.satisfaction_summary?.as_recipient?.total ?? 0);
      if (minExchanges > 0 && providerExchanges < minExchanges) {
        filteredEdges.push({
          from: provider.identity.display_name,
          to: recipient.identity.display_name,
          offering: offering.title,
          reasons: [`Provider requirements: ${providerExchanges} exchanges < ${minExchanges} required`],
        });
        continue;
      }

      // ─── Core scorer ───
      const matchResult = scoreMatch({
        offering: toScorerOffering(offering),
        need: toScorerNeed(need),
        providerTrustScore: computeTrustScore(provider),
        recipientMinTrust: 0,
        existingPartnership: false,
      });

      if (matchResult.overall < MIN_MATCH_SCORE) continue;

      const edgeId = `edge-${offering.id}-${need.id}`;
      edgeScores.set(edgeId, matchResult);

      const edge: NetworkEdge = {
        id: edgeId,
        fromId: offering.provider,
        toId: need.participant,
        offeringId: offering.id,
        needId: need.id,
        matchScore: matchResult.overall,
        feasibility: 1.0,
        weight: matchResult.overall,
      };

      graph.addEdge(edge);
      edgeCount++;
    }
  }

  console.log(`  Created ${edgeCount} potential exchange edges (match score >= ${MIN_MATCH_SCORE})`);

  if (filteredEdges.length > 0) {
    console.log(`  Filtered ${filteredEdges.length} edges by constraints:`);
    for (const f of filteredEdges) {
      console.log(`    ✗ ${f.from} → ${f.to} (${f.offering}): ${f.reasons.join(', ')}`);
    }
  }
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

  // Detailed view for top 3
  const detailedCount = Math.min(3, rankedChains.length);
  console.log(`  Top ${detailedCount} chains (detailed):\n`);

  for (let i = 0; i < detailedCount; i++) {
    const { cycle, score } = rankedChains[i];

    console.log(`  ┌─ Chain ${i + 1} ─────────────────────────────────────────`);

    // Show participants
    const participantNames = cycle.nodeIds.map((id) => {
      const p = participantMap.get(id);
      return p?.identity.display_name ?? id;
    });

    console.log(`  │ ${participantNames.join(' → ')} → (loop)`);
    console.log('  │');

    // Show edges with detailed scoring
    console.log('  │ Exchanges:');
    for (let j = 0; j < cycle.edgeIds.length; j++) {
      const edge = graph.getEdge(cycle.edgeIds[j]);
      if (!edge) continue;

      const fromP = participantMap.get(edge.fromId);
      const toP = participantMap.get(edge.toId);
      const offering = offerings.find((o) => o.id === edge.offeringId);

      console.log(`  │   ${fromP?.identity.display_name} → ${toP?.identity.display_name}`);
      console.log(`  │     Offering: ${offering?.title}`);

      // Show surplus context
      if (offering?.surplus_context) {
        console.log(`  │     Surplus: ${offering.surplus_context.why_surplus ?? 'not specified'}`);
        console.log(`  │     Time sensitivity: ${offering.surplus_context.time_sensitivity ?? 'none'} | Fate if unused: ${offering.surplus_context.alternative_fate ?? 'unknown'}`);
      }

      // Show per-dimension score breakdown
      const matchResult = edgeScores.get(edge.id);
      if (matchResult) {
        const b = matchResult.breakdown;
        console.log(`  │     Score: ${edge.matchScore.toFixed(2)} — semantic: ${b.semantic.toFixed(2)}, timing: ${b.timing.toFixed(2)}, capacity: ${b.capacity.toFixed(2)}, surplus: ${b.surplusSensitivity.toFixed(2)}, diversity: ${b.diversity.toFixed(2)}, sector: ${b.sector.toFixed(2)}`);
      } else {
        console.log(`  │     Score: ${edge.matchScore.toFixed(2)}`);
      }
      console.log('  │');
    }

    // Show chain score summary
    console.log('  │ Chain score:');
    console.log(`  │   ${summariseChainScore(score).split('\n').join('\n  │   ')}`);
    console.log(`  └${'─'.repeat(50)}`);
    console.log();
  }

  // Brief listing for remaining chains
  if (rankedChains.length > detailedCount) {
    console.log(`  Remaining chains (${rankedChains.length - detailedCount}):\n`);
    for (let i = detailedCount; i < Math.min(10, rankedChains.length); i++) {
      const { cycle, score } = rankedChains[i];
      const names = cycle.nodeIds.map((id) => {
        const p = participantMap.get(id);
        return p?.identity.display_name ?? id;
      });
      console.log(`    ${i + 1}. ${names.join(' → ')} → (loop)  [score: ${score.overall.toFixed(2)}]`);
    }
    if (rankedChains.length > 10) {
      console.log(`    ... and ${rankedChains.length - 10} more`);
    }
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
