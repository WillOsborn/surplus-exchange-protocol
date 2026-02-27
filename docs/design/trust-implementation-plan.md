# Trust System Implementation Plan

**Status**: Complete
**Last Updated**: 2026-02-12
**Implementation**: `src/trust/`
**Specification**: [../specs/trust-model.md](../specs/trust-model.md)

---

## Overview

The trust system is SEP's mechanism for managing risk in a network without centralised credit scoring. It enables graduated participation based on demonstrated reliability, with safeguards against bad actors.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Trust System                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │  Calculator  │───▶│    Tiers     │───▶│   Exposure   │       │
│  │              │    │              │    │    Limits    │       │
│  │ - History    │    │ - Probation  │    │              │       │
│  │ - Network    │    │ - Establish  │    │ - Max value  │       │
│  │ - Recency    │    │ - Anchor     │    │ - Chain len  │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                                    │
│         │                   ▼                                    │
│         │            ┌──────────────┐                           │
│         └───────────▶│   Vouching   │                           │
│                      │              │                           │
│                      │ - Sponsors   │                           │
│                      │ - Capacity   │                           │
│                      │ - Reputation │                           │
│                      └──────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Trust Calculator (`calculator.ts`)

Computes a trust score (0-1) from multiple signals:

```typescript
interface TrustInput {
  participantId: string;
  satisfactionHistory: {
    asProvider: { total: number; satisfied: number; disputed: number };
    asRecipient: { total: number; satisfied: number; disputed: number };
  };
  networkPosition: {
    partnerCount: number;        // Unique exchange partners
    repeatPartners: number;      // Partners with 2+ exchanges
    networkAge: number;          // Days since first exchange
    vouchesReceived: number;     // Active vouches
    vouchesGiven: number;        // Vouches extended
  };
  recentActivity: {
    last30Days: number;          // Exchanges completed
    last90Days: number;          // Exchanges completed
    daysSinceLastExchange: number;
  };
}

interface TrustScore {
  overall: number;               // 0-1 composite score
  components: {
    reliability: number;         // Satisfaction rate
    experience: number;          // Volume and tenure
    networkStrength: number;     // Connections and vouches
    recency: number;             // Recent activity
  };
  confidence: 'low' | 'medium' | 'high';  // Based on data volume
  computedAt: string;            // ISO timestamp
}
```

**Scoring Formula:**
```
overall = (reliability × 0.40) + (experience × 0.25) +
          (networkStrength × 0.20) + (recency × 0.15)
```

**Confidence Levels:**
- Low: < 5 completed exchanges
- Medium: 5-20 completed exchanges
- High: > 20 completed exchanges

### 2. Trust Tiers (`tiers.ts`)

Three-tier progression system based on demonstrated reliability:

```typescript
type TrustTier = 'probationary' | 'established' | 'anchor';

interface TierDefinition {
  name: TrustTier;
  minScore: number;              // Minimum trust score
  minExchanges: number;          // Completed exchanges required
  minNetworkAge: number;         // Days in network
  minPartners: number;           // Unique partners required
  requiresVouch: boolean;        // Needs active vouch to enter
}

interface TierAssessment {
  currentTier: TrustTier;
  score: TrustScore;
  nextTier: TrustTier | null;
  progressToNext: {
    scoreProgress: number;       // 0-1
    exchangeProgress: number;    // 0-1
    ageProgress: number;         // 0-1
    partnerProgress: number;     // 0-1
  } | null;
  atRiskOfDemotion: boolean;
  demotionReason?: string;
}
```

**Tier Thresholds:**

| Tier | Min Score | Min Exchanges | Min Age (days) | Min Partners | Vouch Required |
|------|-----------|---------------|----------------|--------------|----------------|
| Probationary | 0.0 | 0 | 0 | 0 | Yes (to join) |
| Established | 0.5 | 5 | 30 | 3 | No |
| Anchor | 0.8 | 20 | 180 | 10 | No |

### 3. Exposure Limits (`exposure.ts`)

Graduated limits based on trust tier:

```typescript
interface ExposureLimits {
  maxSingleExchangeValue: number;    // Relative units
  maxOutstandingValue: number;       // Total pending
  maxChainLength: number;            // Participation limit
  maxConcurrentChains: number;       // Simultaneous chains
  requiresEscrow: boolean;           // Physical goods
  cooldownAfterDispute: number;      // Days before new chains
}

interface ExposureCheck {
  allowed: boolean;
  reason?: string;
  currentExposure: {
    outstandingValue: number;
    activeChains: number;
    pendingAsProvider: number;
    pendingAsRecipient: number;
  };
  remainingCapacity: {
    value: number;
    chains: number;
  };
}
```

**Tier Limits:**

| Tier | Max Single | Max Outstanding | Max Chain Len | Max Concurrent |
|------|------------|-----------------|---------------|----------------|
| Probationary | 10 | 20 | 3 | 2 |
| Established | 50 | 150 | 5 | 5 |
| Anchor | 200 | 500 | 8 | 10 |

### 4. Vouching System (`vouching.ts`)

Enables established participants to sponsor newcomers:

```typescript
interface Vouch {
  id: string;
  sponsorId: string;             // Established/Anchor participant
  sponsoredId: string;           // New participant
  createdAt: string;
  expiresAt: string;             // Vouches expire
  status: 'active' | 'expired' | 'revoked';
  notes?: string;                // Sponsor's assessment
}

interface VouchCapacity {
  participantId: string;
  tier: TrustTier;
  maxVouches: number;            // Based on tier
  activeVouches: number;
  remainingCapacity: number;
  vouchHistory: {
    totalGiven: number;
    successful: number;          // Sponsored reached Established
    problematic: number;         // Sponsored had disputes
  };
}

interface VouchReputationImpact {
  sponsorId: string;
  sponsoredBehaviour: 'excellent' | 'good' | 'poor' | 'problematic';
  impactOnSponsor: number;       // Trust score adjustment
  reason: string;
}
```

**Vouch Rules:**
- Only Established and Anchor participants can vouch
- Established: max 2 active vouches
- Anchor: max 5 active vouches
- Vouches last 90 days (renewable)
- Sponsor reputation affected by sponsored behaviour

## File Structure

```
src/trust/
├── index.ts              # Public exports
├── calculator.ts         # Trust score computation
├── tiers.ts              # Tier definitions and assessment
├── exposure.ts           # Exposure limit enforcement
└── vouching.ts           # Vouch management
```

## Implementation Order

1. **Calculator** - Core scoring, no dependencies
2. **Tiers** - Depends on calculator for scores
3. **Exposure** - Depends on tiers for limits
4. **Vouching** - Depends on tiers for capacity

## Integration Points

### With Matching Algorithm
```typescript
// In graph.ts node construction
const trustScore = computeTrustScore(participantInput);
const tier = assessTier(trustScore);
const limits = getExposureLimits(tier.currentTier);

const node: NetworkNode = {
  // ...
  trustScore: trustScore.overall,
  constraints: {
    maxChainLength: limits.maxChainLength,
    // ...
  }
};
```

### With Chain Execution
```typescript
// Before chain confirmation
const exposureCheck = checkExposure(participantId, proposedChainValue);
if (!exposureCheck.allowed) {
  return { error: exposureCheck.reason };
}
```

### With Protocol Messages
- Include trust tier in participant announcements
- Validate vouch status on join requests
- Report satisfaction outcomes for score updates

## Test Scenarios

1. **New Participant Flow**
   - Joins with vouch → Probationary tier
   - Completes 5 exchanges → Established tier
   - 20+ exchanges over 6 months → Anchor tier

2. **Dispute Impact**
   - Provider fails to deliver
   - Trust score drops
   - May trigger tier demotion
   - Exposure limits reduce

3. **Vouch Lifecycle**
   - Anchor vouches for newcomer
   - Newcomer completes exchanges successfully
   - Newcomer reaches Established
   - Anchor's vouch capacity restored

4. **Exposure Limit Enforcement**
   - Participant at max outstanding value
   - New chain proposal rejected
   - Must complete existing chains first

## Demo Script

`src/examples/trust-demo.ts` will demonstrate:

1. Computing trust scores for sample participants
2. Tier assessment and progression tracking
3. Exposure limit checks
4. Vouching workflow

## Success Criteria

- [ ] Trust scores computed from satisfaction history
- [ ] Tier progression works correctly
- [ ] Exposure limits enforced
- [ ] Vouching system functional
- [ ] Integration with matching algorithm
- [ ] Demo script runs successfully
