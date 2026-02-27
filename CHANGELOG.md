# Changelog

All notable changes to the Surplus Exchange Protocol are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Phase 1 Readiness (Target: MVP Launch)

**Status: 95% Complete**

- [x] Core schemas (need, offering, participant, exchange-chain, trust-profile)
- [x] Matching algorithm implementation
- [x] Trust calculation system
- [x] Agent integration analysis and boundary definition
- [x] Terminology clarification (`agent_matching` → `capability_matching`)
- [x] User journey diagrams (human, delegated, autonomous)
- [x] **Capability Translation System** (WP8) — Core matching proven; schemas contain capacity, constraints, capability outputs
- [ ] Developer guide for agent integration (WP7)
- [ ] Deployment architecture decision (Managed Service vs Federation)

### Changed (Website)

- **Comprehensive website content update** — All 8 pages reshaped to reflect "protocol is the story" framing
- **New page: philosophy.html** — 8 design principles, 8 active tensions, horizon section (from PHILOSOPHY.md)
- **Restructured questions.html** — 10 questions grouped by analysis status (7 Analysed, 1 Partial, 2 Open) with position summaries
- **Trust sections updated** — 4-tier model (Newcomer → Anchor), vouching as accelerator, commitment-based accountability
- **Navigation updated** — Philosophy added to all pages, "Open Questions" → "Hard Questions" site-wide
- **Homepage pathway** — New "See the Thinking" card linking to Philosophy for thinkers/critics audience

### Added

- **Documentation Consistency System**
  - `docs/design/work-packages.md` — Authoritative source for work package status
  - Question Lifecycle in `open-questions.md` (OPEN → ANALYSED → RESOLVED)
  - Information Hierarchy section in `CLAUDE.md`
  - Cross-Document Sync Check in `/session-end` workflow
  - 3 new documentation health checks (WP consistency, question lifecycle, percentage sync)

- **Capability Translation Prototype** (`src/capability/`)
  - `types.ts` — Type definitions for terms, extractions, matches, feedback
  - `seed-vocabulary.ts` — 15 seed terms across 4 sectors (creative, legal, professional services, transport)
  - `extractor.ts` — Claude API integration for AI-powered term extraction
  - `matcher.ts` — Term-overlap matching logic
  - `feedback.ts` — JSON persistence for learning loop
  - `index.ts` — Public API barrel export
  - Interactive CLI demo (`npm run capability`)

- **New Dependency**: `@anthropic-ai/sdk` for Claude API integration

### Changed

- **Terminology rename: V1/V2/V3 → Phase 1/Phase 2/Phase 3**
  - Rationale: "V1" implies launch-ready software; "Phase" better reflects conceptual project stage
  - Updated ~40+ files across schemas, source code, documentation, Claude tools, website
  - Added version terminology health check to `check-docs-health.md`
- **Deployment Architecture** moved to ANALYSED section in `open-questions.md` (decision still required)
- Phase 1 readiness synced to 95% across STATUS.md, README.md, CLAUDE.md, CHANGELOG.md
- Agent Integration Plan now links to `work-packages.md` instead of inline table
- Documentation index simplified with links to authoritative sources

- **Capability Translation System - Major Design Revision** ([capability-translation.md](docs/design/capability-translation.md))
  - Revised to AI-first approach: AI does heavy lifting, taxonomy supports it
  - Scope narrowed to discovery-only: finding candidates, not validating quality
  - Taxonomy now emergent: grows from usage rather than predefined hierarchy
  - Integrated confirmation flow: capability + trust presented together
  - Term maturity model: tracks usage and enables efficiency gains over time
  - Governance model: AI-mediated with founding participant approval

### Added

- **Multi-Perspective Analysis** ([capability-taxonomy-findings.md](docs/design/capability-taxonomy-findings.md))
  - Systems Architect analysis (scalability, data structures)
  - Product Designer analysis (UX, cognitive load)
  - Network Economist analysis (governance, incentives)
  - Devil's Advocate analysis (challenges, failure modes)
  - Synthesis with points of agreement and tension

- **Analysis Documents** ([docs/design/analysis/](docs/design/analysis/))
  - `systems-architect-analysis.md`
  - `product-designer-analysis.md`
  - `network-economist-analysis.md`
  - `devils-advocate-analysis.md`

- **Exploration Brief** ([docs/design/briefs/capability-taxonomy-exploration.md](docs/design/briefs/capability-taxonomy-exploration.md))
  - Structured analysis framework for taxonomy architecture decisions

- **User Journey Diagrams** ([docs/diagrams/](docs/diagrams/))
  - Human journey at 3 levels of detail
  - Delegated agent (Phase 2) journey at 3 levels of detail
  - Autonomous agent (Phase 3) journey at 3 levels of detail
  - All journeys now include capability definition stage

### Decisions

- **AI-First Matching**: AI interprets natural language; taxonomy supports rather than replaces
- **Discovery-Only Scope**: Taxonomy finds candidates; trust layer + humans handle the rest
- **Emergent Taxonomy**: Structure grows from usage, seeded with ~25 terms
- **Founding Participant Governance**: AI proposes changes, founding participants approve
- **Integrated Trust**: Capability and trust signals shown together in confirmation flow
- **Term Maturity Tracking**: Enables efficiency gains as taxonomy matures (reduces AI costs)

---

## [0.3.0] - 2026-02-10

### Added

- **Agent Integration Framework** (WP1-WP7)
  - Boundary definition between SEP and external AI agents ([sep-boundary-definition.md](docs/design/sep-boundary-definition.md))
  - Delegated agent analysis ([agent-analysis-delegated.md](docs/design/agent-analysis-delegated.md))
  - Autonomous buyer analysis ([agent-analysis-autonomous.md](docs/design/agent-analysis-autonomous.md))
  - Multi-agent network analysis ([agent-analysis-multi-agent.md](docs/design/agent-analysis-multi-agent.md))
  - Unified interaction models ([agent-interaction-models.md](docs/design/agent-interaction-models.md))

- **Participant Type Taxonomy**
  - Categories: `human`, `organisation`, `agent`
  - Sub-types for each category (e.g., `small_business`, `delegated_agent`, `autonomous_buyer`)
  - Employee count bands for organisations

- **Delegation Support** (Phase 2 schema preparation)
  - `delegation` field on participant schema
  - `delegationBounds` for offering/need creation, match confirmation, satisfaction signals
  - `accountability` chain linking participants to responsible humans/legal entities

- **Design Principle: Participant Type Drives Experience**
  - Documented in [agent-interaction-models.md](docs/design/agent-interaction-models.md)
  - Experience matrix showing how type affects confirmation, speed, trust, satisfaction

- **Codebase Audit Tooling**
  - `/audit` command for terminology and schema change audits
  - `/bulk-update` command for coordinated multi-file updates
  - `/verify` command for build/schema/runtime verification

### Changed

- **Terminology Rename**: `agent_matching` → `capability_matching`
  - Prevents confusion between SEP's matching engine and external AI agents
  - Updated across all schemas, TypeScript types, examples, and documentation
  - TypeScript interfaces renamed: `AgentMatching` → `CapabilityMatching`

- **Participant Type Structure**
  - Changed from simple string (`"type": "organisation"`)
  - To nested object (`"type": { "category": "organisation", "sub_type": "small_business" }`)

### Decisions

- **Agent Participation Model**: Phase 1 Agent-Aware, Human-Required (Option B)
  - SEP acknowledges delegation but requires human confirmation
  - Full agent types (autonomous, multi-agent) deferred to Phase 2/3
  - Documented in [decisions.md](docs/design/decisions.md)

---

## [0.2.0] - 2026-02-09

### Added

- **C4 Architecture Model** ([c4-model.md](docs/diagrams/c4-model.md))
  - Context, Container, and Component diagrams
  - Matching flow and trust calculation flows

- **Use Cases Document** ([use-cases.md](docs/use-cases.md))
  - External communication summary
  - Concrete exchange scenarios

- **Expanded Scenarios**
  - AI Agent Participation scenario
  - Hostile Takeover / Market Failure scenario

### Changed

- Schema revision plan updated with transport matching capabilities
- Physical goods schema enhanced with transport coordination

---

## [0.1.0] - 2026-02-08

### Added

- **Core Schemas**
  - `need.schema.json` - Participant needs with capability matching
  - `capability-offering.schema.json` - Surplus offerings (renamed from offering.schema.json)
  - `participant.schema.json` - Network participants with trust metrics
  - `exchange-chain.schema.json` - Multi-party exchange chains
  - `trust-profile.schema.json` - Layered trust model
  - `protocol-messages.schema.json` - Protocol message formats

- **TypeScript Implementation**
  - Generated types from JSON schemas
  - Match scoring algorithm (`match-demo.ts`)
  - Trust calculation (`calculator.ts`)
  - Network graph utilities (`graph.ts`)
  - Vouching system (`vouching.ts`)

- **Example Data**
  - 7 example participants (professional services cluster)
  - 11 example offerings
  - 8 example needs
  - Example exchange chains and protocol messages

- **Design Documentation**
  - Historical systems research (LETS, WIR, Sardex, etc.)
  - Trust model design (3-layer: identity, network position, satisfaction)
  - Matching algorithm design (Johnson's algorithm for cycle detection)
  - Schema revision plan

### Decisions

- Subjective Value Over Shared Currency
- B2B Focus Over Consumer
- Sector-Specific Seeding (professional services first)
- Protocol Over Platform
- Layered Trust Without Shared Accounting

---

## Phase Roadmap

### Phase 1 (MVP)
- Human/organisation participants only
- Human confirmation required for all commitments
- Core matching and trust functionality
- Agent-aware but not agent-first

### Phase 2 (Delegation)
- Explicit delegation bounds
- Conditional auto-confirmation within bounds
- Principal accountability chain
- Bounded-fast lane for delegated agents

### Phase 3+ (Autonomous Agents)
- Autonomous buyer participant type
- M2M satisfaction metrics (separate from human signals)
- Fast lane for fully autonomous chains
- Physical goods only restriction for autonomous buyers

### Phase 3+ (Multi-Agent Networks) - Research
- Collective identity model
- Governance verification
- Anti-gaming measures for agent collectives
- Possibly separate network tier

---

## Links

- [Design Decisions](docs/design/decisions.md)
- [Agent Integration Plan](docs/design/agent-integration-plan.md)
- [Participant Taxonomy](docs/design/participant-taxonomy.md)
- [Trust Model](docs/design/trust-implementation-plan.md)
