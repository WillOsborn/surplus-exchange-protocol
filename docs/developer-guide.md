# Developer Guide

This guide is for developers exploring the Surplus Exchange Protocol reference implementation. It covers the architecture, how to run things, and where to find what you need.

SEP is a **proof-of-concept** — working code that demonstrates the protocol's core ideas. It is not a production system, an SDK, or a library to install. The value is in the design thinking and the executable demonstrations of how the pieces fit together.

---

## What to Expect (and What Not To)

If you're coming from a marketplace, payments, or trading background, several things about SEP will feel unfamiliar. It's worth understanding these up front rather than discovering them as surprises.

**No prices, no balances, no ledger.** There is no numeric value assignment anywhere in the system. No account balances. No credits or debits. Each participant maintains their own subjective sense of whether they're getting value from the network. If you find yourself looking for a price field or a balance — it doesn't exist, by design. See [PHILOSOPHY.md](../PHILOSOPHY.md) (Principle 1: Subjective value over shared currency) for why.

**Cycles, not bilateral trades.** The matching algorithm finds closed loops — A provides to B, B provides to C, C provides back to A. There are no standalone pair trades in the usual sense. Newcomers start with bilateral exchanges (chain length 2, effectively A↔B) as a trust-building step, then graduate to longer chains. The function you're looking for is `findCycles()`, not `findMatch()`.

**No network layer.** The protocol defines messages and state machines, but there is no transport implementation — no HTTP endpoints, no WebSockets, no peer discovery. This is a protocol specification with a reference implementation of the logic. A production system would need to add networking on top.

**Satisfaction signals are asymmetric.** When an exchange completes, each participant independently signals how satisfied they are. Two participants in the same exchange edge can give different signals. There is no objective "was this completed?" arbiter — satisfaction is subjective by design.

**Trust gates everything.** What a participant can do is determined by their trust tier, not by roles or permissions. Your tier sets your maximum chain length, concurrent chains, single exchange value, and whether escrow is required:

| Tier | Max Chain Length | Concurrent Chains | Escrow Required |
|------|-----------------|-------------------|-----------------|
| Newcomer | 2 (bilateral only) | 1 | Yes |
| Probationary | 3 | 2 | Yes |
| Established | 5 | 5 | No |
| Anchor | 8 | 10 | No |

---

## Quick Start

**Prerequisites:** Node.js 18+ and npm.

```bash
git clone https://github.com/WillOsborn/surplus-exchange-protocol.git
cd surplus-exchange-protocol
npm install
npm run build
npm run match          # See the matching algorithm discover exchange chains
```

That last command builds the TypeScript, then runs the matching demo — it constructs a network graph from example participants, detects cycles, scores them across 8 dimensions, and shows the top-ranked chains with detailed breakdowns.

Other commands:

```bash
npm run trust          # Trust calculation: 4-tier assessment, exposure limits, vouching
npm run trace          # Protocol trace: 3 scenarios (happy path, counter-proposal, stuck)
npm run capability     # Capability translation: offline matching demo
npm run capability:live  # AI-assisted extraction (requires ANTHROPIC_API_KEY)
npm run validate       # Validate all JSON schemas compile
npm run validate:examples  # Validate example JSON data against schemas
npm run generate:types     # Regenerate TypeScript types from JSON schemas
npm test               # Run 252 tests across 17 files
```

---

## Architecture Overview

SEP's reference implementation has five modules, six JSON schemas, and five runnable demos.

```
schemas/                 JSON Schema definitions (the data model)
    │
    ▼
src/schemas/             Generated TypeScript types
    │
    ├──► src/validation/     Schema validation utilities
    │
    ├──► src/matching/       Graph construction, cycle detection, scoring
    │
    ├──► src/trust/          Trust scores, tiers, exposure limits, vouching
    │
    ├──► src/protocol/       State machines for chain and edge lifecycle
    │
    └──► src/capability/     AI-assisted capability translation
                │
                ▼
         src/examples/       Runnable demos that exercise the modules
```

**Data flows through the system like this:**

1. Participants describe their surplus (offerings) and needs in natural language
2. **Capability translation** extracts structured terms from those descriptions
3. The **matching algorithm** builds a graph and finds exchange cycles
4. Cycles are scored and filtered using **trust** data and constraints
5. The **protocol** manages the lifecycle of proposed chains (confirm → execute → satisfy)
6. **Validation** ensures all data conforms to the JSON schemas

---

## Module Guide

### Matching (`src/matching/`)

The core differentiator — finding multi-party exchange chains that humans couldn't compute.

**Key concepts:**
- A `NetworkGraph` holds participants as nodes and potential exchanges as weighted edges
- `scoreMatch()` evaluates how well an offering meets a need across 8 dimensions: semantic fit, capacity, timing, geography, trust, surplus sensitivity, relationship diversity, and sector overlap
- Trust and geography are "deal-breaker" dimensions — if either fails, the whole score is zero regardless of other dimensions
- `findCycles()` detects closed loops (Johnson's algorithm) where every participant gives and receives
- `rankChains()` scores and sorts cycles by overall viability

**Main exports:**

| Export | Purpose |
|--------|---------|
| `NetworkGraph` | Graph data structure (nodes = participants, edges = potential exchanges) |
| `scoreMatch(offering, need, options?)` | Score a single offering-need pair (returns 0–1 with 8-dimension breakdown) |
| `findCycles(graph, options?)` | Detect all closed loops in the graph |
| `rankChains(cycles, graph, options?)` | Score and sort cycles by viability |
| `filterViableChains(chains, threshold)` | Keep only chains above a score threshold |

**Try it:** `npm run match` — builds a graph from `examples/matching/`, finds cycles, and shows scored results with dimension breakdowns.

**Deeper reading:** [docs/design/chain-discovery.md](design/chain-discovery.md)

---

### Trust (`src/trust/`)

Graduated trust through tiers, exposure limits, and a vouching system.

**Key concepts:**
- Trust scores are computed from satisfaction history, network position, and recency of activity
- The 4-tier system (Newcomer → Probationary → Established → Anchor) gates what participants can do
- Exposure limits prevent any participant from overcommitting
- Vouching accelerates trust progression but isn't required — you can advance through track record alone
- Network position decays over time (180-day half-life) — trust must be maintained

**Main exports:**

| Export | Purpose |
|--------|---------|
| `computeTrustScore(input, options?)` | Calculate a trust score from satisfaction history and network position |
| `assessTier(input)` | Determine current tier, progress toward next, and risk flags |
| `getExposureLimits(tier)` | Get the exposure constraints for a trust tier |
| `checkExposure(current, limits)` | Check whether a proposed action would exceed limits |
| `createVouch(sponsor, nominee, config)` | Create a vouch from an established participant for a newer one |
| `validateVouch(vouch)` | Check vouch validity (tier eligibility, capacity, expiry) |

**Try it:** `npm run trust` — computes scores for example participants, shows tier assessments, exposure limits, and vouching mechanics.

**Deeper reading:** [docs/design/trust-implementation-plan.md](design/trust-implementation-plan.md), [docs/specs/trust-model.md](specs/trust-model.md)

---

### Protocol (`src/protocol/`)

State machines managing the lifecycle of exchange chains and individual edges.

**Key concepts:**
- A **chain** progresses through: draft → proposed → confirming → committed → executing → completed (or terminal failure states)
- Each **edge** (a single provider→recipient exchange within a chain) has its own lifecycle: proposed → confirmed → in progress → delivered → satisfied
- State machines are event-driven — you feed events, they produce valid transitions or rejection
- The `MessageHandler` processes protocol messages and drives state transitions

**Main exports:**

| Export | Purpose |
|--------|---------|
| `ChainStateMachine` | Manages chain lifecycle (draft → completed, with failure paths) |
| `EdgeStateMachine` | Manages individual edge lifecycle within a chain |
| `MessageHandler` | Processes protocol messages, validates them, drives state transitions |

**Chain states:** `draft` · `proposed` · `confirming` · `committed` · `executing` · `completed` · `discarded` · `abandoned` · `declined` · `cancelled` · `failed`

**Edge states:** `proposed` · `provider_confirmed` · `recipient_confirmed` · `both_confirmed` · `in_progress` · `delivered` · `satisfied` · `skipped` · `disputed` · `resolved`

**Try it:** `npm run trace` — walks through 3 protocol scenarios showing state transitions and messages at each step.

**Deeper reading:** [docs/specs/execution-protocol.md](specs/execution-protocol.md), [docs/specs/message-protocol.md](specs/message-protocol.md)

---

### Validation (`src/validation/`)

Schema validation using AJV with JSON Schema draft-2020-12.

**Main exports:**

| Export | Purpose |
|--------|---------|
| `createValidator()` | Create a configured AJV instance |
| `validate(validator, data)` | Validate data and return typed result (throws `ValidationError` on failure) |
| `loadSchemas(dir?)` | Load all `.schema.json` files from a directory |
| `getSchema(name)` | Get a loaded schema by name |
| `ValidationError` | Error class with detailed AJV error messages |

**Try it:** `npm run validate` compiles all schemas; `npm run validate:examples` validates the example JSON files against them.

---

### Capability (`src/capability/`)

AI-assisted translation between natural language descriptions and structured capability terms. This is what enables cross-industry matching — a restaurant's "extra catering capacity" needs to map to an office's "need for event food."

**Key concepts:**
- A **seed vocabulary** defines structured terms across sectors (creative, legal, professional services, transport)
- **Extraction** uses Claude (Anthropic API) to pull structured terms from natural language descriptions
- **Matching** compares extracted terms to find potential exchanges
- A **feedback store** records extraction and matching outcomes for learning

**Main exports:**

| Export | Purpose |
|--------|---------|
| `SEED_VOCABULARY` | 15 structured terms across 4 sectors |
| `extractTerms(input, sourceType, apiKey)` | Extract capability terms from natural language (requires API key) |
| `findMatches(need, offerings)` | Find matching offerings for a need based on extracted terms |
| `createEmptyStore()` / `loadFeedbackStore(path)` | Create or load a feedback store |
| `recordFeedback(store, feedback)` | Record whether a match was confirmed, declined, or skipped |

**Try it:** `npm run capability` runs the offline demo (no API key needed); `npm run capability:live` runs AI-assisted extraction (requires `ANTHROPIC_API_KEY` environment variable).

**Deeper reading:** [docs/design/capability-translation.md](design/capability-translation.md)

---

## Schemas

Six JSON schemas in `schemas/` define the protocol's data model:

| Schema | Defines |
|--------|---------|
| `need.schema.json` | What a participant needs (service, physical good, access, or space) |
| `capability-offering.schema.json` | What surplus a participant offers |
| `participant.schema.json` | Participant identity, status, network position, preferences |
| `exchange-chain.schema.json` | A complete multi-party exchange cycle with edges, timing, and history |
| `trust-profile.schema.json` | Trust score, tier, track record, vouching, and limits |
| `protocol-messages.schema.json` | The protocol message types (chain proposals, confirmations) |

**Generating types:** `npm run generate:types` produces TypeScript interfaces from the schemas into `src/schemas/`. Key generated types include `Need`, `SurplusOffering`, `ExchangeChain`, `Participant`, and `TrustProfile`.

**Example data:** The `examples/` directory contains valid JSON instances for each schema — useful for understanding the data shapes and as test fixtures.

> **Known discrepancy:** The generated `TrustTier` type doesn't include `'newcomer'` even though the schema defines it. The trust module defines its own `TrustTier` type that includes all four tiers.

---

## Imports

The package root (`src/index.ts`) re-exports schemas, validation, protocol, and capability. **Matching and trust are not re-exported from the root** — import them from their subdirectories:

```typescript
// These work from the root
import { ChainStateMachine, MessageHandler } from 'sep-reference';
import { createValidator, validate } from 'sep-reference';
import { extractTerms, findMatches } from 'sep-reference';

// These need subdirectory imports
import { NetworkGraph, findCycles, rankChains } from 'sep-reference/dist/matching';
import { computeTrustScore, assessTier, getExposureLimits } from 'sep-reference/dist/trust';
```

The project uses ESM (`"type": "module"` in package.json). Source files use `.js` extensions in import paths — this is the ESM convention for TypeScript.

---

## Testing

252 tests across 17 files, using [Vitest](https://vitest.dev/).

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode (re-run on changes)
npm run test:coverage # Run with coverage report
```

Tests cover all five modules. Mocking uses `vi.hoisted()` + `vi.mock()` for SDK and filesystem mocks, with plain `function` (not arrow functions) for constructor mocks.

---

## Design Decisions and Further Reading

This project has substantial design documentation beyond the code. If you want to understand *why* things work the way they do:

**Philosophy and principles:**
- [PHILOSOPHY.md](../PHILOSOPHY.md) — 8 design principles, 8 active tensions, the core insight

**Design decisions:**
- [docs/design/decisions.md](design/decisions.md) — All architectural choices with rationale
- [docs/design/open-questions.md](design/open-questions.md) — 10 hard questions, 8 analysed with positions

**Protocol specifications:**
- [docs/specs/execution-protocol.md](specs/execution-protocol.md) — Chain lifecycle and state management
- [docs/specs/message-protocol.md](specs/message-protocol.md) — 11 message types and formats
- [docs/specs/trust-model.md](specs/trust-model.md) — Trust calculation specification
- [docs/specs/security-integration.md](specs/security-integration.md) — Security model

**Architecture diagrams:**
- [docs/diagrams/c4-model.md](diagrams/c4-model.md) — C4 architecture (context, container, component)
- [docs/diagrams/human-journey.md](diagrams/human-journey.md) — Human participant journey
- [docs/diagrams/delegated-agent-journey.md](diagrams/delegated-agent-journey.md) — Delegated agent journey (Phase 2)
- [docs/diagrams/autonomous-agent-journey.md](diagrams/autonomous-agent-journey.md) — Autonomous agent journey (Phase 3)

**The website** ([sep.willosborn.xyz](https://sep.willosborn.xyz)) provides the narrative explanation — start there if you want the concept before the code.
