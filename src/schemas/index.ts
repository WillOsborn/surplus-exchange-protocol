/**
 * TypeScript types generated from JSON schemas.
 *
 * These types are generated using json-schema-to-typescript.
 * Run `npm run generate:types` to regenerate after schema changes.
 */

// Re-export all generated types
export type {
  Need,
  CapabilityLinks,
  ServiceNeedDetails,
  PhysicalNeedDetails,
  AccessNeedDetails,
  Constraints as NeedConstraints,
  Preferences,
  Urgency,
  FulfilmentHistory,
  InferredSignals,
  CapabilityMatching as NeedCapabilityMatching,
} from './need.schema.js';

export type {
  ExchangeChain,
  ChainEdge,
  ChainTiming,
  ChainMetadata,
  ChainEvent,
  FailureInfo,
  CompensationPlan,
} from './exchange-chain.schema.js';

export type {
  SurplusOffering,
  SurplusContext,
  CapabilityMatching as OfferingCapabilityMatching,
  ServiceDetails,
  CapacityConsumption,
  TransportRoute,
  PhysicalDetails,
  PhysicalTransportMatching,
  AccessDetails,
  Constraints as OfferingConstraints,
  ChainParticipation,
} from './capability-offering.schema.js';

// Backwards compatibility alias
export type { SurplusOffering as CapabilityOffering } from './capability-offering.schema.js';

export type { Participant } from './participant.schema.js';

export type { TrustProfile } from './trust-profile.schema.js';

// Export state types directly for convenience
export type ChainState =
  | 'draft'
  | 'proposed'
  | 'confirming'
  | 'committed'
  | 'executing'
  | 'completed'
  | 'discarded'
  | 'abandoned'
  | 'declined'
  | 'cancelled'
  | 'failed';

export type EdgeState =
  | 'proposed'
  | 'provider_confirmed'
  | 'recipient_confirmed'
  | 'both_confirmed'
  | 'in_progress'
  | 'delivered'
  | 'satisfied'
  | 'skipped'
  | 'disputed'
  | 'resolved';

export type SatisfactionSignal = 'satisfied' | 'partially_satisfied' | 'not_satisfied';

export type TrustTier = 'probationary' | 'established' | 'anchor';

export type OfferingType = 'service' | 'physical_good' | 'access' | 'space';

export type NeedStatus = 'active' | 'partially_fulfilled' | 'fulfilled' | 'expired' | 'withdrawn';
