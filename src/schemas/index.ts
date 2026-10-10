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

// Convenience aliases, derived from the generated types so they cannot drift
// from the schemas. Do not hand-write enum unions here.
import type { ExchangeChain, ChainEdge } from './exchange-chain.schema.js';
import type { TrustProfile } from './trust-profile.schema.js';
import type { SurplusOffering } from './capability-offering.schema.js';
import type { Need } from './need.schema.js';

export type ChainState = ExchangeChain['status'];

export type EdgeState = ChainEdge['status'];

export type SatisfactionSignal = NonNullable<NonNullable<ChainEdge['satisfaction']>['provider_signal']>;

export type TrustTier = TrustProfile['current_tier'];

export type OfferingType = SurplusOffering['type'];

export type NeedStatus = Need['status'];
