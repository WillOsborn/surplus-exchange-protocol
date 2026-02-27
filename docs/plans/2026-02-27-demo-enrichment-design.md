# Demo Enrichment Design

*2026-02-27*

## Purpose

Enrich the four CLI demos (trust, match, trace, capability) to serve as executable protocol documentation for developers who want to understand how SEP works. The current demos prove the algorithms work but don't showcase the protocol's depth — the schemas define far richer data structures and flows than the demos exercise.

## Audience

Developers who want to dig into how SEP works. The demos are their first hands-on introduction — they should be able to run `npm run <name>` and see a clear, self-documenting walkthrough of each protocol concept.

## Design Decisions

- **Focused, not comprehensive**: Each demo covers the most important paths, not every possible state.
- **Self-contained**: Each demo runs with no external dependencies (no API keys, no interactive input by default).
- **Both layers**: Where applicable, show both the internal state transition AND the protocol message that triggered it.
- **Inline introductions**: Each demo opens with a printed overview explaining what it demonstrates.
- **Learning path framing**: The four demos form a natural sequence (trust → match → trace → capability), though each works standalone.
- **Enrich data AND scoring**: The match demo extends the scoring algorithm to use richer data, not just commentary.
- **Richer snapshots over progression**: The trust demo shows 6 personas at different tiers with rich data, rather than simulating progression over time.
- **Default offline + optional live**: The capability demo runs with pre-recorded data by default; live API mode available via flag.

## Philosophy Check

Checked against PHILOSOPHY.md. **Supports philosophy** with no conflicts. Two areas to be mindful of:

1. **Trust demo**: Narrate the relationship basis of scores (exchange history, partner diversity), not just the numbers — aligns with Principle 6 ("Trust through relationships, not ratings").
2. **General**: Demos stay grounded in surplus exchange (surplus_context visible), pragmatic framing (no ideological language), and protocol-as-standard (trace demo shows standardised messages).

---

## Demo 1: Trust (`npm run trust`)

### Current State

~400 lines, 5 hardcoded personas, 4 subsections (scores, tiers, exposure, vouching). Uses simplified `TrustInput` type. Missing Newcomer tier. 3-tier model (Probationary → Established → Anchor).

### Changes

**Personas**: Expand from 5 to 6, reflecting the 4-tier model from Q5 design:

| Persona | Tier | Key characteristic |
|---------|------|--------------------|
| newcomer_dave | Newcomer | Just joined, identity verified, zero history. Bilateral-only, 1 concurrent chain. |
| probationary_carol | Probationary | 3 completed exchanges, 2 unique partners. Vouched for by Alice (accelerator, skipped Newcomer). |
| vouched_frank | Probationary | New but vouched for by Alice — entered at Probationary, skipping Newcomer. Shows vouching as accelerator. |
| established_bob | Established | 20 exchanges, 7 partners, good on-time rate. Can vouch. |
| anchor_alice | Anchor | 83 exchanges, 22 partners, 15 repeat. High reliability. Bounded limits (not unlimited). |
| atrisk_eve | Established (at risk) | Was Established but dispute rate rising, activity declining. Shows tier doesn't only go up. |

**Data enrichment**: Each persona's input expands to include:

- `chains_completed` / `chains_failed` / `chains_in_progress`
- `on_time_rate` and `average_chain_size`
- `total_value_exchanged` (as_provider, as_recipient)

**Subsection updates**:

1. **Trust Scores** — 6 personas with richer component breakdown. Show Dave (Newcomer, zero history) baseline vs Frank (also new but vouched, vouch boost). Narrate each score in relational terms ("Bob's network strength of 0.72 reflects 7 unique partners including 3 repeat relationships").
2. **Tier Assessment** — Show 4-tier model. For each persona, show current tier and what's needed for the next tier. For Dave: "Newcomer → Probationary requires: 3 completed exchanges, 2 unique partners, 30 days network age". For Eve: flag risk factors.
3. **Exposure Limits** — Add Newcomer limits (bilateral-only, 1 concurrent, lowest value cap). Show Dave blocked from joining a 3-party chain (structural Newcomer limit) while Carol can join.
4. **Vouching** — Only Established and Anchor can vouch (not Probationary, per Q5). Show Alice vouching for Frank (enters at Probationary, skipping Newcomer). Show Carol blocked from vouching. Keep reputation impact demonstration.

**Introduction** (printed at start):

```
SEP Trust System Demonstration

This demo shows how SEP assesses participants and manages risk.
Trust is built through exchange history, not upfront credentials.

Key concepts demonstrated:
  • 4-tier progression: Newcomer → Probationary → Established → Anchor
  • Multi-factor trust scoring (reliability, experience, network, recency)
  • Structural limits by tier (chain length, concurrency, value caps)
  • Vouching as accelerator (skip Newcomer, not a gate for entry)
  • Bounded Anchor limits (generous but not unlimited)

All data is self-contained — no external files required.
```

### Estimated Size

~450–500 lines. Modest increase from current ~400.

---

## Demo 2: Match (`npm run match`)

### Current State

~415 lines, loads from `examples/matching/`, scores on 4 dimensions (type, capability overlap, sector overlap, keywords), shows top 5 chains with brief scores.

### Changes

**Example data enrichment** (in `examples/matching/` JSON files):

- **Participants**: Geographic location with region/country (not just city), constraint preferences (excluded sectors, geographic limits), richer `network_position` data (repeat_partner_rate, chain_participation_count).
- **Offerings**: Add `surplus_context` (why_surplus, alternative_fate, time_sensitivity) to each offering. Add `constraints.chain_participation` (max_chain_length, can_be_intermediate, prefers_direct). Add capacity consumption details.
- **Needs**: Add `constraints` (geographic accepted/excluded regions, timing with needed_by, provider requirements with min_exchanges). Add `urgency` (declared_priority, deadline, flexibility_for_speed). Add soft `preferences` (preferred_sectors, relationship_preference).

**Scoring enrichment** — expand `simpleMatchScore` from 4 to ~7-8 dimensions:

| Dimension | Weight | What it checks |
|-----------|--------|----------------|
| Type match | 0.15 | Offering type matches need type |
| Capability match | 0.25 | capability_matching term overlap |
| Constraint satisfaction | 0.20 | Geographic compatibility, timing feasibility, provider requirements met |
| Surplus time sensitivity | 0.10 | Time-sensitive surplus prioritised when need deadline aligns |
| Sector overlap | 0.10 | Sector tag overlap via capability_matching |
| Relationship diversity | 0.10 | New partner connections preferred over repeat exchanges |
| Keyword overlap | 0.10 | Title/description word overlap (fallback) |

**Output enrichment** — replace "top 5 brief" with "detailed top 3":

```
Chain 1 (score: 0.847):
  Participants: Meridian Legal → Bloom Catering → Fern Studio → (loop)

  Edge 1: Meridian Legal → Bloom Catering
    Offering: Contract review (10 hours, surplus: between projects)
    Need: Supplier agreement review (needed by March 15)
    Scoring breakdown:
      Capability:   0.25/0.25  (contract_review ↔ contract_review)
      Constraints:  0.18/0.20  (geographic: match, timing: match, min exchanges: met)
      Surplus:      0.08/0.10  (time_sensitivity: weeks, need deadline: 2 weeks)
      Type:         0.15/0.15  (service ↔ service)
      Sector:       0.08/0.10  (legal ↔ legal, professional_services)
      Diversity:    0.10/0.10  (new partner connection)
      Keywords:     0.06/0.10
      Edge total:   0.90
```

Also print constraint filtering in action — when an edge is eliminated by a constraint, note it:

```
Filtered: Meridian Legal → Acme Transport (geographic: excluded_region 'scotland')
```

**Introduction** (printed at start):

```
SEP Matching Algorithm Demonstration

This demo shows how SEP discovers multi-party exchange chains.
It builds a graph from participants, offerings, and needs,
then finds cycles (closed loops of exchanges) and scores them.

Key concepts demonstrated:
  • Capability matching via structured terms
  • Constraint filtering (geographic, timing, provider requirements)
  • Surplus time sensitivity affecting match priority
  • Relationship diversity preferences
  • Multi-dimensional chain scoring and ranking

Data loaded from: examples/matching/
```

### Estimated Size

~500–600 lines (from ~415). Example JSON files grow moderately.

---

## Demo 3: Trace (`npm run trace`)

### Current State

~175 lines, 2 scenarios (happy path + timeout), hardcoded names, internal state machine only. No protocol messages shown.

### Changes

This is the largest change. The trace demo becomes the protocol lifecycle demonstration.

**Characters** (defined inline, self-contained — no file dependencies):

- **Meridian Legal** (Established tier) — Solicitor with 10 spare hours for contract work. `surplus_context: { why_surplus: "Between projects", time_sensitivity: "weeks", alternative_fate: "unused" }`.
- **Bloom Catering** (Probationary tier) — Event caterer with excess capacity from a cancelled booking. `surplus_context: { why_surplus: "Cancelled booking, perishable stock", time_sensitivity: "days", alternative_fate: "disposal" }`.
- **Fern Studio** (Established tier) — Brand designer. `surplus_context: { why_surplus: "Capacity between client projects", time_sensitivity: "none", alternative_fate: "opportunity_cost" }`.

Each character has: trust tier, exposure limits, a concrete offering with surplus_context, and a concrete need.

**Scenarios** (3–4 focused paths):

**Scenario 1: Happy path** (expanded from current)

Each step shows both the state transition and the protocol message:

1. Chain proposal — `ChainProposal` message with `match_rationale` explaining why these three were matched
2. Participant confirmations — `ParticipantConfirmation` messages from each participant (decision: confirm, with conditions)
3. Chain commitment — `ChainCommitment` with timing and commitment hash
4. Edge execution — `ExecutionStart`, `ExecutionCompletion` for each edge, with delivery details
5. Fulfilment signals — `SatisfactionSignal` (with signal: satisfied) for each edge
6. Chain completion — `ChainCompletion` with trust updates for each participant

**Scenario 2: Counter-proposal during confirmation**

- Bloom Catering receives the proposal but the timing doesn't work
- Sends `ParticipantConfirmation` with `decision: "counter"` and `counter_proposal` adjusting the execution window
- Other participants accept the counter
- Chain proceeds (abbreviated from there)
- Shows the negotiation phase that the current demo skips

**Scenario 3: Stuck flag and escalation**

- Chain is executing, but one edge stalls — Bloom hasn't delivered
- Meridian raises a stuck flag (not a dispute — "this isn't progressing")
- Shows the `STUCK` state, escalation routing, and resolution (Bloom delivers late, fulfilment signal records partial satisfaction)
- Shows how this differs from a hard failure

**Scenario 4 (optional): Edge failure with compensation**

- Clean failure — timeout exceeded, `FAILURE_DETECTED`
- `ChainFailure` message with compensation plan
- Brief compensation saga

**Output format** for each step:

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

**Introduction** (printed at start):

```
SEP Protocol Trace

This demo traces exchange chains through their full lifecycle,
showing both internal state transitions and the protocol messages
that flow between participants at each step.

Key concepts demonstrated:
  • Chain lifecycle: proposal → confirmation → commitment → execution → completion
  • Protocol messages (the structures agents would send/receive)
  • Counter-proposals during confirmation negotiation
  • Stuck flag handling and escalation (distinct from hard failure)
  • Fulfilment signals and trust updates

Scenarios:
  1. Happy path — 3-party chain from proposal to completion
  2. Counter-proposal — timing negotiation during confirmation
  3. Stuck flag — stalled delivery with escalation and resolution

All data is self-contained — no external files required.
```

### Estimated Size

~500–600 lines (from ~175). Substantial expansion.

---

## Demo 4: Capability (`npm run capability` / `npm run capability:live`)

### Current State

~360 lines, fully interactive, requires `ANTHROPIC_API_KEY`. Walks through offering → need → match → feedback one at a time.

### Changes

Split into two modes:

**Offline mode** (`npm run capability`) — default, no API key needed:

Uses pre-recorded `ExtractionResult` objects to demonstrate the full pipeline. Walks through 3 scenarios:

1. **Good match** — Solicitor offering contract work ↔ need for supplier agreement review. High capability overlap, same sector, high confidence.
2. **Partial match (cross-sector)** — Graphic designer offering logos/pitch decks ↔ need for investor presentation. Partial capability overlap on `pitch_deck`, lower confidence.
3. **No match** — Van driver with empty return journey ↔ need for quarterly accounts. Zero capability overlap, shows unmatched fragments.

For each scenario, prints:
- The natural language input
- The extracted terms with confidence and reasoning
- The vocabulary terms matched against
- The match result (or lack thereof) with explanation
- What a feedback signal would look like

The offline demo imports from `../capability/index.js` for `findMatches`, `formatMatchCandidate`, etc. — the matching and formatting code is exercised, just not the extraction API call.

**Live mode** (`npm run capability:live`) — existing interactive demo, unchanged except for inline introduction added.

**Introduction** (offline mode, printed at start):

```
SEP Capability Translation Demo

This demo shows how SEP translates natural language descriptions
into structured capability terms for algorithmic matching.

Key concepts demonstrated:
  • Natural language → structured term extraction
  • Seed vocabulary with sector-specific terms
  • Confidence scoring on extracted terms
  • Term-overlap matching between offerings and needs
  • Feedback capture for vocabulary improvement

Running in offline mode with pre-recorded extractions.
For interactive mode with live AI extraction: npm run capability:live
```

**npm scripts**: Add `capability:live` script pointing to the existing interactive entry point.

### Estimated Size

Offline demo: ~250–300 lines (new file). Live demo: ~360 lines (existing, minor update).

---

## Cross-Cutting Concerns

### Consistency

- All demos use British English (colour, organisation, behaviour)
- All demos use the same box-drawing characters for headers (═, ─, etc.)
- Business names are consistent where characters overlap between demos
- Terminology aligned with latest design: fulfilment signals (not satisfaction), Newcomer tier, vouching as accelerator

### Files Changed

| File | Change type |
|------|------------|
| `src/examples/trust-demo.ts` | Major update — add Newcomer, richer data, 4-tier model |
| `src/examples/match-demo.ts` | Major update — enriched scoring, detailed output |
| `src/examples/trace-chain.ts` | Major rewrite — protocol messages, 3-4 scenarios |
| `src/examples/capability-demo.ts` | Minor update — add introduction, rename to live mode |
| `src/examples/capability-offline-demo.ts` | New file — offline capability demo |
| `examples/matching/participants.json` | Enrich — add geographic, constraints, richer network data |
| `examples/matching/offerings.json` | Enrich — add surplus_context, chain_participation, capacity |
| `examples/matching/needs.json` | Enrich — add constraints, urgency, preferences |
| `package.json` | Add `capability:live` script |

### What's NOT Changing

- Core source modules (`src/matching/`, `src/trust/`, `src/protocol/`, `src/capability/`) — demos consume these, don't modify them
- Schema files — no schema changes needed
- Website demos — separate concern, not in scope
- The `@anthropic-ai/sdk` dependency stays as devDependency (already moved)

---

## Implementation Priority

1. **Trace demo** — biggest gap, most new code, highest value for protocol understanding
2. **Match demo** — enriches both data and scoring, moderate complexity
3. **Trust demo** — contained update, lower risk
4. **Capability demo** — smallest change, mostly a new file with pre-recorded data
