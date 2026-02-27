# Demo Enrichment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enrich the four CLI demos to serve as executable protocol documentation for developers, while bringing core modules up to date with the current design.

**Architecture:** Two prerequisite tasks update core modules (trust tiers, match scorer) to reflect the current design. Four demo tasks then consume these updated modules. Each demo is a standalone TypeScript script in `src/examples/`.

**Tech Stack:** TypeScript, Node.js ESM, existing SEP modules.

**Design doc:** `docs/plans/2026-02-27-demo-enrichment-design.md`

**Key design decisions (from critical evaluation):**
- Core trust module gets Newcomer tier (not just the demo)
- Core scorer gets enriched with new dimensions (not a separate demo scorer)
- Demo uses core scorer via a thin data adapter
- Trace demo protocol messages are labelled "illustrative" in output
- Vouching acceleration requires a new pathway in `assessTier`

---

## Task 0: Add Newcomer Tier to Trust Module

The trust module has 3 tiers but the Q5 design specifies 4. This is a core module update, not demo-specific.

**Blast radius** (from codebase analysis):
- `src/trust/tiers.ts` — 9 locations (type, definitions, ordering, 2× qualifiesForTier conditionals, assessTier default, demotion check, describeTier switch, getTierRequirements)
- `src/trust/exposure.ts` — 1 new Record entry + 1 validation array (line 310)
- `src/trust/vouching.ts` — interface type + config default (canTierVouch already correct)
- `schemas/trust-profile.schema.json` — 1 enum update
- Generated types — regenerate

**Files:**
- Modify: `src/trust/tiers.ts`
- Modify: `src/trust/exposure.ts`
- Modify: `src/trust/vouching.ts`
- Modify: `schemas/trust-profile.schema.json`

### Step 1: Update the trust-profile schema

In `schemas/trust-profile.schema.json`, find the `trustTier` enum and add `"newcomer"` as the first entry:

```json
"trustTier": {
  "type": "string",
  "enum": ["newcomer", "probationary", "established", "anchor"],
  "description": "Trust tier levels in the SEP network"
}
```

### Step 2: Regenerate types

Run: `npm run generate:types`
Expected: Clean generation. `src/schemas/trust-profile.schema.d.ts` now includes `"newcomer"` in all tier unions.

### Step 3: Update TrustTier type and TIER_ORDER

In `src/trust/tiers.ts:13`, change:
```typescript
export type TrustTier = 'probationary' | 'established' | 'anchor';
```
to:
```typescript
export type TrustTier = 'newcomer' | 'probationary' | 'established' | 'anchor';
```

In `src/trust/tiers.ts:114`, change:
```typescript
const TIER_ORDER: TrustTier[] = ['probationary', 'established', 'anchor'];
```
to:
```typescript
const TIER_ORDER: TrustTier[] = ['newcomer', 'probationary', 'established', 'anchor'];
```

### Step 4: Add Newcomer to TIER_DEFINITIONS

In `src/trust/tiers.ts`, add newcomer as first entry in `TIER_DEFINITIONS` and update probationary:

```typescript
newcomer: {
  name: 'newcomer',
  minScore: 0.0,
  minExchanges: 0,
  minNetworkAge: 0,
  minPartners: 0,
  requiresVouch: false, // Identity verification is the gate, not vouching
},
probationary: {
  name: 'probationary',
  minScore: 0.0,
  minExchanges: 3,
  minNetworkAge: 14,
  minPartners: 2,
  requiresVouch: false, // Reached by completing exchanges OR by being vouched for
},
```

### Step 5: Update qualifiesForTier for vouching acceleration

The current logic at lines 128-148 checks `requiresVouch` for probationary entry. With the new model, vouching accelerates past Newcomer. Replace the function:

```typescript
export function qualifiesForTier(
  tier: TrustTier,
  input: TierAssessmentInput
): boolean {
  const def = TIER_DEFINITIONS[tier];

  // Newcomer: everyone qualifies (identity verification is external)
  if (tier === 'newcomer') {
    return true;
  }

  // Probationary: qualify by meeting exchange requirements OR by having an active vouch
  if (tier === 'probationary') {
    const meetsRequirements =
      input.completedExchanges >= def.minExchanges &&
      input.networkAgeDays >= def.minNetworkAge &&
      input.uniquePartners >= def.minPartners;
    return meetsRequirements || input.hasActiveVouch;
  }

  // Higher tiers: check all metrics
  if (input.score.overall < def.minScore) return false;
  if (input.completedExchanges < def.minExchanges) return false;
  if (input.networkAgeDays < def.minNetworkAge) return false;
  if (input.uniquePartners < def.minPartners) return false;

  return true;
}
```

### Step 6: Update demotion check, describeTier, getTierRequirements, assessTier default

In `assessTier` (`src/trust/tiers.ts:188`), change the default from:
```typescript
let currentTier: TrustTier = 'probationary';
```
to:
```typescript
let currentTier: TrustTier = 'newcomer';
```

Note: The iteration logic in `assessTier` would overwrite this anyway (everyone qualifies for Newcomer), but changing the default improves readability and avoids a misleading fallback.

Note: `calculateProgress` (lines 157-177) requires no changes — the arithmetic handles Newcomer→Probationary correctly. It divides current values by tier minimums and returns 1.0 when the minimum is 0. For a newcomer with zero history, progress to probationary shows: `scoreProgress: 1.0` (minScore is 0), `exchangeProgress: 0.0` (0/3), `ageProgress: 0.0` (0/14 days), `partnerProgress: 0.0` (0/2). The vouch shortcut is communicated through `getTierRequirements` text, not progress percentages.

In `checkDemotionRisk`, update the early return:
```typescript
if (currentTier === 'newcomer' || currentTier === 'probationary') {
  return { atRisk: false };
}
```

In `describeTier`, add the newcomer case:
```typescript
case 'newcomer':
  return 'Newcomer - Identity verified, bilateral exchanges only';
```

In `getTierRequirements`, add handling for the vouching acceleration:
```typescript
if (tier === 'probationary') {
  // Special case: can be reached by exchanges OR vouching
  const exchangePath = parts.join(', ');
  return `${exchangePath} — OR active vouch from Established/Anchor participant`;
}
```

### Step 7: Add Newcomer exposure limits

In `src/trust/exposure.ts`, add newcomer as first entry in `TIER_EXPOSURE_LIMITS`.

Also update the `validateLimitsConfiguration` function (line 310) — it has a hardcoded tier array:
```typescript
const tiers: TrustTier[] = ['probationary', 'established', 'anchor'];
```
Change to:
```typescript
const tiers: TrustTier[] = ['newcomer', 'probationary', 'established', 'anchor'];
```

Add newcomer limits:

```typescript
newcomer: {
  maxSingleExchangeValue: 5,
  maxOutstandingValue: 5,
  maxChainLength: 2,      // Bilateral only
  maxConcurrentChains: 1,  // One at a time
  requiresEscrow: true,
  cooldownAfterDispute: 60,
},
```

### Step 8: Update vouching config

In `src/trust/vouching.ts`, update BOTH the `VouchingConfig` interface (lines 106-110) and the `DEFAULT_VOUCHING_CONFIG` object (lines 125-129) to include newcomer:

Interface (`VouchingConfig.maxVouchesPerTier`):
```typescript
maxVouchesPerTier: {
  newcomer: number;
  probationary: number;
  established: number;
  anchor: number;
};
```

Default config:
```typescript
maxVouchesPerTier: {
  newcomer: 0,
  probationary: 0,
  established: 2,
  anchor: 5,
},
```

Note: `canTierVouch()` already only allows established/anchor — no change needed.

### Step 9: Build and verify

Run: `npm run build`
Expected: Clean compile. TypeScript will catch any missed locations.

Run: `npm run validate`
Expected: Schemas valid.

Run: `npm run trust`
Expected: Existing demo runs. Verify in the output that:
- Dave (zero history, no vouch) → **Newcomer** (not Probationary)
- Frank (zero history, has vouch) → **Probationary** (vouch acceleration)
- All other personas → same tier as before (Carol: Probationary, Bob: Established, Alice: Anchor, Eve: Established)

This confirms `assessTier` iterates TIER_ORDER correctly with Newcomer at index 0.

### Step 10: Add newcomer example profile

Create `examples/trust/profile-newcomer.json` following the pattern of existing trust profile examples.

### Step 11: Validate examples

Run: `npm run validate:examples`
Expected: All examples valid including new newcomer profile.

### Step 12: Commit

```bash
git add src/trust/ schemas/trust-profile.schema.json src/schemas/ examples/trust/
git commit -m "feat(trust): add Newcomer tier — 4-tier model from Q5 design

Newcomer → Probationary → Established → Anchor.
Newcomer: bilateral-only, 1 concurrent chain, identity verified entry.
Vouching accelerates past Newcomer to Probationary (not a gate).
Only Established and Anchor can vouch (unchanged).

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 1: Enrich Core Scorer

Add three new scoring dimensions to the core `scoreMatch` function: surplus time sensitivity, relationship diversity, and sector overlap. Also add a data adapter for the demo's JSON format.

**Files:**
- Modify: `src/matching/scorer.ts`
- Modify: `src/matching/index.ts` (if new exports needed)

### Step 1: Read the full scorer file

Read `src/matching/scorer.ts` in full to understand the complete `scoreMatch` function, weight constants, and helper functions before modifying.

### Step 2: Extend the Offering interface

Add optional fields to the `Offering` interface:

```typescript
export interface Offering {
  // ... existing fields ...
  /** Surplus time sensitivity — how quickly this surplus loses value */
  surplusTimeSensitivity?: 'none' | 'weeks' | 'days' | 'hours';
  /** Sector tags for sector-based matching */
  sectorTags?: string[];
}
```

### Step 3: Extend the Need interface

Add optional fields:

```typescript
export interface Need {
  // ... existing fields ...
  /** Sector tags for sector-based matching */
  sectorTags?: string[];
  /** Whether the need has a tight deadline */
  urgentDeadline?: boolean;
}
```

### Step 4: Extend MatchInput

Add relationship context:

```typescript
export interface MatchInput {
  // ... existing fields ...
  /** Whether these participants have exchanged before */
  existingPartnership?: boolean;
}
```

### Step 5: Extend MatchScoreBreakdown

Add new dimensions:

```typescript
export interface MatchScoreBreakdown {
  // ... existing 5 dimensions ...
  /** Surplus time sensitivity alignment (0-1) */
  surplusSensitivity: number;
  /** Relationship diversity bonus (0-1) */
  diversity: number;
  /** Sector overlap (0-1) */
  sector: number;
}
```

### Step 6: Implement the three new scoring functions

Add after the existing scoring helpers:

```typescript
function scoreSurplusSensitivity(
  offering: Offering,
  need: Need
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const sensitivity = offering.surplusTimeSensitivity ?? 'none';

  if (sensitivity === 'none') {
    reasons.push('No time pressure on surplus');
    return { score: 0.5, reasons }; // Neutral
  }

  // Time-sensitive surplus gets a boost, especially if need is also urgent
  const sensitivityBoost: Record<string, number> = {
    hours: 1.0,
    days: 0.8,
    weeks: 0.6,
  };

  let score = sensitivityBoost[sensitivity] ?? 0.5;

  if (need.urgentDeadline) {
    reasons.push(`Time-sensitive surplus (${sensitivity}) matches urgent need`);
  } else {
    score *= 0.7; // Slight reduction if need isn't urgent
    reasons.push(`Time-sensitive surplus (${sensitivity}), need not urgent`);
  }

  return { score, reasons };
}

function scoreDiversity(
  input: MatchInput
): { score: number; reasons: string[] } {
  if (input.existingPartnership) {
    return { score: 0.3, reasons: ['Existing partnership — lower diversity value'] };
  }
  return { score: 1.0, reasons: ['New partnership — high diversity value'] };
}

function scoreSectorOverlap(
  offering: Offering,
  need: Need
): { score: number; reasons: string[] } {
  const offeringSectors = new Set(
    (offering.sectorTags ?? []).map(s => s.toLowerCase())
  );
  const needSectors = (need.sectorTags ?? []).map(s => s.toLowerCase());

  if (offeringSectors.size === 0 || needSectors.length === 0) {
    return { score: 0.5, reasons: ['No sector data — neutral'] };
  }

  const matched = needSectors.filter(s =>
    offeringSectors.has(s) ||
    [...offeringSectors].some(os => os.includes(s) || s.includes(os))
  );

  if (matched.length === 0) {
    return { score: 0.0, reasons: ['No sector overlap'] };
  }

  const score = matched.length / needSectors.length;
  return { score, reasons: [`Sector overlap: ${matched.join(', ')}`] };
}
```

### Step 7: Update scoreMatch weights and integrate new dimensions

**Important:** The current `scoreMatch` (`src/matching/scorer.ts:463-510`) does NOT weight all dimensions equally. Trust and geographic are **deal-breakers** — if either scores 0, the overall score is forced to 0 regardless of other dimensions. Only the remaining dimensions are weighted. This pattern must be preserved.

Current weighted dimensions (3): `semantic * 0.5 + timing * 0.3 + capacity * 0.2`

New weighted dimensions (6) — replace the weight calculation (line 502) with:

```typescript
// Weighted combination of non-deal-breaker dimensions
overall =
  semantic.score * 0.30 +
  timing.score * 0.15 +
  capacity.score * 0.10 +
  surplusSensitivity.score * 0.15 +
  diversity.score * 0.15 +
  sector.score * 0.15;
```

| Dimension | Old weight | New weight | Rationale |
|-----------|:---:|:---:|-----------|
| semantic | 0.50 | 0.30 | Still dominant — capability match is the core signal |
| timing | 0.30 | 0.15 | Reduced to make room |
| capacity | 0.20 | 0.10 | Reduced — always 1.0 in Phase 1 anyway |
| surplusSensitivity | — | 0.15 | New: time-critical surplus priority |
| diversity | — | 0.15 | New: prefer novel connections |
| sector | — | 0.15 | New: sector tag alignment |
| trust | deal-breaker | deal-breaker | Unchanged |
| geographic | deal-breaker | deal-breaker | Unchanged |

Also update the breakdown object and reason collection to include all 8 dimensions, and update the `allReasons.push(...)` calls for the three new dimensions.

### Step 8: Build and verify

Run: `npm run build`
Expected: Clean compile.

Run: `npm run match`
Expected: Existing demo still works (new dimensions will use defaults/neutral scores since demo data doesn't yet have the new fields).

### Step 9: Commit

```bash
git add src/matching/scorer.ts src/matching/index.ts
git commit -m "feat(matching): add surplus sensitivity, diversity, and sector scoring

Three new dimensions in scoreMatch:
- Surplus time sensitivity: prioritises time-critical capacity
- Relationship diversity: prefers new partner connections
- Sector overlap: scores shared sector tags

Existing dimensions preserved with adjusted weights.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Enrich Example Data

**Files:**
- Modify: `examples/matching/participants.json`
- Modify: `examples/matching/offerings.json`
- Modify: `examples/matching/needs.json`

### Step 1: Read schemas to verify field names

Read `schemas/capability-offering.schema.json` and `schemas/need.schema.json` to verify exact property names and structures before enriching data. Pay particular attention to:
- `surplus_context` property names and enum values
- `constraints` nesting structure
- `urgency` property names
- Whether properties use snake_case (schemas) or camelCase

### Step 2: Read current example data

Read all three JSON files to understand current structure, participant IDs, and how many participants/offerings/needs exist.

**Important:** The example data is already partially enriched — `surplus_context`, `urgency`, `constraints.geographic`, and `constraints.provider_requirements` already exist on some entries. The goal of this task is to ensure **completeness and consistency** across all entries, and to ensure the specific data requirements below are met. Do not duplicate fields that already exist; extend or adjust them as needed.

### Data Requirements

The enriched data must support these demo scenarios (verified in Task 3's match demo output):

- **Geographic filter**: At least one need with `excluded_regions` containing a region that one offering's participant is in (e.g., need excludes "scotland", one participant is in Scotland) → produces a visible filtered edge in match demo
- **Time sensitivity alignment**: At least one offering with `time_sensitivity: "days"` paired with a need that has `urgency.declared_priority: "high"` → high surplus sensitivity score
- **Time sensitivity mismatch**: At least one offering with `time_sensitivity: "none"` → neutral surplus score for comparison
- **Sector overlap**: At least one offering-need pair sharing `sector_tags` → visible sector score in breakdown
- **Provider requirement filter**: At least one need with `constraints.provider_requirements.min_exchanges: 5` that a low-experience participant can't satisfy
- **Variety**: Spread `alternative_fate` values across offerings — use at least 3 different values (e.g., `"unused"`, `"disposal"`, `"opportunity_cost"`)

### Step 3: Enrich participants.json

For each participant, add:
- `profile.location` expanded: `{ city, region, country }`
- `network_position` expanded: add `repeat_partner_rate`, `chain_participation_count`

### Step 4: Enrich offerings.json

For each offering, add:
- `surplus_context`: `{ why_surplus, alternative_fate, time_sensitivity }` — using exact enum values from schema
- `constraints.chain_participation`: `{ max_chain_length, can_be_intermediate, prefers_direct }`

Ensure variety: at least one offering with `time_sensitivity: "days"`, one with `"hours"`, one with `"none"`.

### Step 5: Enrich needs.json

For each need, add:
- `constraints.geographic`: `{ accepted_regions, excluded_regions }` — ensure at least one has excluded_regions that will filter out an offering
- `constraints.timing`: `{ needed_by }` — ISO date strings
- `constraints.provider_requirements`: `{ min_exchanges }`
- `urgency`: `{ declared_priority, deadline, flexibility_for_speed }`

### Step 6: Validate enriched data

Run: `npm run validate:examples`
Expected: All validation passes. If it fails, check property names against schemas and fix.

### Step 6b: Smoke-test with existing match demo

Run: `npm run build && npm run match`
Expected: Demo runs without errors. Scoring output may look different due to richer data (new dimensions will contribute non-neutral scores), but should not crash. This verifies the enriched JSON loads correctly and the existing graph-building code handles new fields gracefully.

### Step 7: Commit

```bash
git add examples/matching/
git commit -m "feat(examples): enrich matching data with surplus context and constraints

Participants: geographic regions, richer network position.
Offerings: surplus_context, chain participation constraints.
Needs: geographic/timing constraints, provider requirements, urgency.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Update Match Demo to Use Core Scorer

Replace the demo's inline `simpleMatchScore` with the core `scoreMatch` function via a data adapter.

**Files:**
- Modify: `src/examples/match-demo.ts`

### Step 0: Verify adapter assumptions against enriched data

Read the enriched `examples/matching/offerings.json` and `examples/matching/needs.json` from Task 2. Confirm these field paths resolve correctly:
- `o.capability_matching.capability_outputs` (string array)
- `o.capability_matching.sector_tags` (string array)
- `o.surplus_context.time_sensitivity` (enum string)
- `n.capability_matching.capability_sought` (string array)
- `n.constraints.geographic.accepted_regions` / `excluded_regions` (string arrays)
- `n.urgency.declared_priority` (string)

If Task 2 introduced different nesting or naming, adjust the adapter code in Step 1 accordingly.

### Step 1: Write the data adapter functions

Add functions that transform the demo's JSON data format to the core scorer's interfaces:

```typescript
import {
  scoreMatch,
  type Offering as ScorerOffering,
  type Need as ScorerNeed,
  type MatchInput,
} from '../matching/index.js';

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
        : [],
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
    urgentDeadline: n.urgency?.declared_priority === 'high' || n.urgency?.flexibility_for_speed === true,
  };
}
```

### Step 2: Replace simpleMatchScore with scoreMatch calls

In the edge-building loop, replace the inline scoring with:

```typescript
const matchResult = scoreMatch({
  offering: toScorerOffering(offering),
  need: toScorerNeed(need),
  providerTrustScore: computeTrustScore(provider), // from trust module
  recipientMinTrust: 0, // or from need constraints
  existingPartnership: /* check if these participants have exchanged before */,
});

if (matchResult.overall < MIN_MATCH_SCORE) continue;
```

### Step 3: Add constraint filtering with logging

Before scoring, check geographic exclusions and log filtered edges:

```typescript
const excludedRegions = need.constraints?.geographic?.excluded_regions ?? [];
const providerRegion = provider.profile?.location?.region;
if (providerRegion && excludedRegions.some(r => r.toLowerCase() === providerRegion.toLowerCase())) {
  filteredEdges.push({ from: provider.identity.display_name, to: recipient.identity.display_name,
    reasons: [`geographic: excluded_region '${providerRegion}'`] });
  continue;
}
```

Print filtered edges after the loop.

### Step 4: Add inline introduction

Add at start of `main()` (text from design doc).

### Step 5: Update output to show detailed top 3

Replace the "top 5 brief" loop with detailed output showing per-edge scoring breakdowns. Use `matchResult.breakdown` to show each dimension's contribution and `matchResult.reasons` for explanations.

Print surplus context for each offering edge:
```typescript
console.log(`    Surplus: ${offering.surplus_context?.why_surplus ?? 'not specified'}`);
console.log(`    Time sensitivity: ${offering.surplus_context?.time_sensitivity ?? 'none'}`);
```

### Step 6: Remove the old simpleMatchScore function

Delete the `simpleMatchScore` function (lines ~116-189 in the current file). The demo now uses the core scorer exclusively.

### Step 7: Build and run

Run: `npm run build && npm run match`
Expected: Clean compile. Output shows enriched scoring with constraint filtering and detailed top 3.

### Step 8: Commit

```bash
git add src/examples/match-demo.ts
git commit -m "feat(demo): match demo uses core scorer with constraint filtering

Replaces inline simpleMatchScore with core scoreMatch via data adapter.
Shows geographic/timing constraint filtering with reasons.
Detailed top-3 output with per-dimension score breakdown.
Surplus context displayed for each offering.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Enrich Trust Demo

**Files:**
- Modify: `src/examples/trust-demo.ts`

### Step 1: Replace participants data with 6 personas

Replace the existing `participants` record with 6 personas using the existing `TrustInput` type:

- `newcomer_dave` — zero history, zero network, zero activity
- `vouched_frank` — zero exchanges but `vouchesReceived: 1`, `networkAge: 2`
- `probationary_carol` — 3 exchanges, 2 partners, 15 days
- `established_bob` — 20 exchanges, 7 partners, 3 repeat, 120 days
- `anchor_alice` — 83 exchanges, 22 partners, 15 repeat, 450 days
- `atrisk_eve` — 8 provider (5 satisfied, 3 disputed), declining activity

### Step 2: Add inline introduction

Add at start of `main()` (text from design doc — 4-tier model, relational trust, vouching as accelerator).

### Step 3: Add relational narration helper

Write a `narrateTrustScore` function that produces lines like:
- "Alice's high network strength (0.89) reflects 22 unique partners including 15 repeat relationships"
- "Dave has no exchange history — baseline trust score assigned"
- "Eve's declining reliability (0.63) reflects 3 disputes in 8 provider exchanges"

Call this after printing each score in `demonstrateTrustScores`.

### Step 4: Update demonstrateTierAssessment

Now uses 4 tiers. Dave should assess as Newcomer. Frank (vouched) should assess as Probationary (vouch acceleration). Show progression requirements for each.

### Step 5: Update demonstrateExposureLimits

Add Newcomer to the tier loop:
```typescript
for (const tier of ['newcomer', 'probationary', 'established', 'anchor'] as const) {
```

Update examples:
- Dave (Newcomer) blocked from 3-party chain (`maxChainLength: 2`)
- Carol (Probationary) joins the same chain successfully

### Step 6: Update demonstrateVouching

- Alice (Anchor) vouches for Frank → Frank enters at Probationary
- Bob (Established) vouches successfully (now allowed per Q5)
- Carol (Probationary) blocked from vouching
- Keep reputation impact demonstration

### Step 7: Build and run

Run: `npm run build && npm run trust`
Expected: 6 personas, 4 tiers, relational narration, vouching acceleration shown.

### Step 8: Commit

```bash
git add src/examples/trust-demo.ts
git commit -m "feat(demo): enrich trust demo with 4-tier model and richer personas

6 personas across Newcomer, Probationary, Established, Anchor.
Relational narration of trust scores.
Newcomer structural limits demonstrated.
Vouching as accelerator shown (Frank skips Newcomer via Alice's vouch).

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Rewrite Trace Demo

The largest demo change. Substantially rewritten with protocol messages and richer scenarios.

**Files:**
- Modify: `src/examples/trace-chain.ts`

**Output guidelines:**
- Each scenario should produce **30-50 lines of output** (roughly one terminal screen). The goal is readability, not completeness.
- Use box-drawing format from the design doc (`─── Step N: Title ───` headers, indented state/message fields).
- Protocol messages should show **4-6 key fields**, not the complete schema structure. Pick the fields that best illustrate the message's purpose.
- Scenario 1 (happy path) gets the full treatment. Scenarios 2 and 3 can be shorter — the reader already understands the output format by then.

Reference output format (from design doc):
```
─── Step 3: Participants Confirm ───
  Meridian Legal confirms (Established tier, 3 active chains)

  State: proposed → confirming
  Message: ParticipantConfirmation
    chain_id: "chain-abc-123"
    participant_id: "meridian-legal"
    decision: "confirm"
    conditions: { "preferred_start": "2026-03-10" }
```

### Step 1: Define characters and helper types

Define three self-contained character objects inline:
- Meridian Legal (Established) — contract review surplus, `time_sensitivity: "weeks"`
- Bloom Catering (Probationary) — cancelled booking, `time_sensitivity: "days"`, `alternative_fate: "disposal"`
- Fern Studio (Established) — brand design, `time_sensitivity: "none"`

Define a `ProtocolMessage` interface and `logMessage` helper for formatted output.

### Step 2: Add inline introduction

Print at start of `main()` (text from design doc). Include a note:

```typescript
console.log('  Note: Protocol messages shown are illustrative — they demonstrate');
console.log('  the message structures defined in the protocol-messages schema,');
console.log('  not generated by a production protocol layer.');
```

### Step 3: Write Scenario 1 — Happy Path

Full lifecycle with both state transitions and protocol messages:

1. Print chain overview (who gives what to whom, with surplus context)
2. `ChainProposal` message with `match_rationale`
3. `ParticipantConfirmation` from each (decision: confirm)
4. `ChainCommitment` with timing
5. Edge execution: `ExecutionStart`, `ExecutionCompletion` per edge
6. Fulfilment signals per edge
7. `ChainCompletion` with trust updates

Use actual `ChainStateMachine` and `EdgeStateMachine` for transitions. Print protocol message alongside each transition.

### Step 4: Write Scenario 2 — Counter-Proposal

Bloom receives proposal, sends counter adjusting timing:

1. Chain proposed, Meridian confirms
2. Bloom sends `ParticipantConfirmation` with `decision: "counter"`, `counter_proposal` adjusting execution window
3. Narrate: Other participants accept counter
4. Chain commits (abbreviated from there)

Note: State machine stays in `confirming` throughout — counter-proposal is a protocol-level message, not a state change.

### Step 5: Write Scenario 3 — Stuck Flag

1. Set up chain to `executing` state quickly
2. Narrate: Bloom hasn't delivered, Meridian raises stuck flag
3. Edge stays in `in_progress` — stuck is a protocol signal, not a state machine event
4. Print illustrative stuck flag message
5. Resolution: Bloom delivers late, `DELIVERY_COMPLETE`, then `SATISFACTION_SIGNAL` with `partially_satisfied`
6. Chain completes with mixed fulfilment signals

### Step 6: Build and run

Run: `npm run build && npm run trace`
Expected: 3 scenarios with state transitions and protocol messages.

### Step 7: Commit

```bash
git add src/examples/trace-chain.ts
git commit -m "feat(demo): rewrite trace demo with protocol messages and 3 scenarios

Happy path, counter-proposal, stuck flag with escalation.
Each step shows state transition + illustrative protocol message.
Self-contained characters with surplus context and trust tiers.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Add Offline Capability Demo

**Files:**
- Create: `src/examples/capability-offline-demo.ts`
- Modify: `src/examples/capability-demo.ts` (add introduction)
- Modify: `package.json` (add `capability:live` script)

### Step 1: Create offline demo with pre-recorded scenarios

Create `src/examples/capability-offline-demo.ts` with 3 pre-recorded scenarios:

1. **Good match** — solicitor/contract work ↔ supplier agreement review
2. **Partial match** — graphic designer ↔ investor presentation (overlap on `pitch_deck`)
3. **No match** — van driver ↔ quarterly accounts

Each scenario has hardcoded `ExtractionResult` objects. The demo imports `findMatches`, `formatMatchCandidate`, `formatExtractionResult` from `../capability/index.js` — real matching code is exercised, only extraction is pre-recorded.

### Step 2: Add inline introduction

Text from design doc, including "Running in offline mode" and pointer to `capability:live`.

### Step 3: Add introduction to existing interactive demo

In `src/examples/capability-demo.ts`, add a brief intro at the start of `runDemo()` noting this is interactive mode.

### Step 4: Update package.json scripts

Change:
```json
"capability": "npm run build && node dist/examples/capability-offline-demo.js",
"capability:live": "npm run build && node dist/examples/capability-demo.js"
```

### Step 5: Build and run

Run: `npm run build && npm run capability`
Expected: Offline demo runs without API key. Shows 3 scenarios with extraction results and matching.

### Step 6: Commit

```bash
git add src/examples/capability-offline-demo.ts src/examples/capability-demo.ts package.json
git commit -m "feat(demo): add offline capability demo, no API key required

Default 'npm run capability' runs 3 pre-recorded scenarios.
Interactive mode via 'npm run capability:live'.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Final Verification

### Step 1: Full build

Run: `npm run build`
Expected: Clean compile.

### Step 2: Run all demos

```bash
npm run trust
npm run match
npm run trace
npm run capability
```

Expected: All four run without errors.

### Step 3: Validate schemas and examples

Run: `npm run validate && npm run validate:examples`
Expected: All validation passes.

### Step 4: Update expected-chains.md

If enriched matching data changes which chains are discovered, update `examples/matching/expected-chains.md`.

### Step 5: Final commit if needed

```bash
git add examples/matching/expected-chains.md
git commit -m "docs: update expected chains for enriched matching data

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```
