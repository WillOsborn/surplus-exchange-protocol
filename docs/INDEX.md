# Guide to This Repository

This document helps you navigate the Surplus Exchange Protocol project. It explains what's here, how the thinking evolved, and where to find things.

---

## The Shape of This Project

SEP started as a provocative question — *what if AI could solve the matching problem that money was invented for?* — and has been developed through several phases:

1. **Research**: Studying historical non-monetary exchange systems (WIR, LETS, Sardex, TimeBanks) to learn what worked and what didn't
2. **Protocol design**: Defining schemas, matching algorithms, trust systems, and protocol specifications
3. **Hard questions**: Systematically analysing 10 difficult design questions surfaced by an unintended consequences analysis — things like "how do you prevent enterprise capture?" and "what about labour market effects?"
4. **Implementation**: TypeScript reference implementation proving the core matching, trust, and capability translation concepts

The project is a **conceptual provocation**, not a product roadmap. The protocol is the story; the governance and infrastructure are depth for those who want it.

---

## Where to Start

| If you're interested in... | Start here |
|---------------------------|------------|
| The core idea and philosophy | [../PHILOSOPHY.md](../PHILOSOPHY.md) |
| How it would actually work | [../README.md](../README.md), then [use-cases.md](use-cases.md) |
| The hard questions and honest answers | [design/open-questions.md](design/open-questions.md) |
| Architecture and system design | [diagrams/c4-model.md](diagrams/c4-model.md) |
| The matching algorithm | [design/chain-discovery.md](design/chain-discovery.md) |
| The trust model | [design/trust-implementation-plan.md](design/trust-implementation-plan.md) |
| Running the code | [../README.md](../README.md) → Development section |
| Current project status | [../STATUS.md](../STATUS.md) |

---

## Research

Historical research that informed the design. The deep dive into real-world non-monetary exchange systems shaped many of the protocol's key decisions.

| Document | What it covers |
|----------|---------------|
| [research/initial-exploration.md](research/initial-exploration.md) | The original exploration — where the idea came from |
| [research/historical-systems-deep-dive.md](research/historical-systems-deep-dive.md) | WIR Bank, LETS, Sardex, TimeBanks — what worked and what failed |
| [research/comparative-analysis.md](research/comparative-analysis.md) | Cross-system comparison matrix |
| [research/needs-research-findings.md](research/needs-research-findings.md) | How to represent what participants need |
| [research/execution-research-findings.md](research/execution-research-findings.md) | How exchanges actually get executed |
| [research/agentic-protocols-analysis.md](research/agentic-protocols-analysis.md) | Analysis of A2A and MCP protocols |

---

## Design Documents

### Open Questions Journey

The most intellectually substantial part of the project. An unintended consequences analysis surfaced 10 hard questions, each of which was then systematically analysed through collaborative brainstorming, research, and philosophy checks.

**Tracking:** [design/open-questions.md](design/open-questions.md) — shows all 10 questions with their status and positions taken.

**Design documents** (one per analysed question, in `plans/`):

| Question | Design document |
|----------|----------------|
| Q1: Subjective Value vs Accountability | [plans/2026-02-26-commitment-based-accountability-design.md](plans/2026-02-26-commitment-based-accountability-design.md) |
| Q2: Enterprise Capture vs Peer Vision | [plans/2026-02-26-peer-exchange-protection-design.md](plans/2026-02-26-peer-exchange-protection-design.md) |
| Q3/Q4: Deployment & Federation | [plans/2026-02-26-deployment-and-federation-design.md](plans/2026-02-26-deployment-and-federation-design.md) |
| Q5: Trust Mechanisms & Gatekeeping | [plans/2026-02-26-trust-and-openness-design.md](plans/2026-02-26-trust-and-openness-design.md) |
| Q6: Bad Actor Scenarios | [plans/2026-02-26-bad-actor-scenarios-design.md](plans/2026-02-26-bad-actor-scenarios-design.md) |
| Q7: Algorithm Transparency & Systemic Risk | [plans/2026-02-26-algorithm-transparency-design.md](plans/2026-02-26-algorithm-transparency-design.md) |
| Q10: Labour Market Effects | [plans/2026-02-26-labour-market-effects-design.md](plans/2026-02-26-labour-market-effects-design.md) |

**Consolidated view:** [plans/2026-02-26-consolidated-design-impact.md](plans/2026-02-26-consolidated-design-impact.md) — synthesises all analysed questions into combined architectural and implementation impact.

### Core Design

| Document | What it covers |
|----------|---------------|
| [design/decisions.md](design/decisions.md) | All design decisions with rationale |
| [design/work-packages.md](design/work-packages.md) | Work package status (authoritative source) |
| [design/scenarios.md](design/scenarios.md) | Failure modes and edge cases |
| [design/unintended-consequences-analysis.md](design/unintended-consequences-analysis.md) | The risk analysis that surfaced the 10 questions |

### Implementation Design

| Document | What it covers |
|----------|---------------|
| [design/chain-discovery.md](design/chain-discovery.md) | Multi-party matching algorithm |
| [design/matching-implementation-plan.md](design/matching-implementation-plan.md) | Matching implementation roadmap |
| [design/trust-implementation-plan.md](design/trust-implementation-plan.md) | Trust system design |
| [design/capability-translation.md](design/capability-translation.md) | Capability translation system (how natural language becomes matchable) |
| [design/schema-revision-plan.md](design/schema-revision-plan.md) | Schema evolution plan |
| [design/federation-exploration.md](design/federation-exploration.md) | Federation vs managed service analysis |

### Agent Integration

Analysis of how AI agents interact with the protocol at different autonomy levels.

| Document | What it covers |
|----------|---------------|
| [design/agent-integration-plan.md](design/agent-integration-plan.md) | Overall agent integration plan |
| [design/sep-boundary-definition.md](design/sep-boundary-definition.md) | SEP vs external systems boundary |
| [design/agent-analysis-delegated.md](design/agent-analysis-delegated.md) | Delegated agent analysis |
| [design/agent-analysis-autonomous.md](design/agent-analysis-autonomous.md) | Autonomous agent analysis |
| [design/agent-analysis-multi-agent.md](design/agent-analysis-multi-agent.md) | Multi-agent network analysis |
| [design/agent-interaction-models.md](design/agent-interaction-models.md) | Agent interaction patterns |
| [design/participant-taxonomy.md](design/participant-taxonomy.md) | Participant type hierarchy |

### Analysis & Research

Supporting analysis produced during design work.

| Document | Context |
|----------|---------|
| [design/analysis/2026-02-26-trust-gatekeeping-research.md](design/analysis/2026-02-26-trust-gatekeeping-research.md) | Research supporting Q5 (trust & gatekeeping) |
| [design/analysis/systems-architect-analysis.md](design/analysis/systems-architect-analysis.md) | Capability taxonomy — systems architecture perspective |
| [design/analysis/product-designer-analysis.md](design/analysis/product-designer-analysis.md) | Capability taxonomy — product design perspective |
| [design/analysis/network-economist-analysis.md](design/analysis/network-economist-analysis.md) | Capability taxonomy — network economics perspective |
| [design/analysis/devils-advocate-analysis.md](design/analysis/devils-advocate-analysis.md) | Capability taxonomy — adversarial perspective |
| [design/capability-taxonomy-findings.md](design/capability-taxonomy-findings.md) | Capability taxonomy — synthesised findings |

---

## Specifications

Formal protocol specifications defining message formats, execution flows, and security models.

| Document | Status | What it covers |
|----------|--------|---------------|
| [specs/execution-protocol.md](specs/execution-protocol.md) | Draft | Exchange execution flow |
| [specs/message-protocol.md](specs/message-protocol.md) | Draft | Protocol message formats |
| [specs/trust-model.md](specs/trust-model.md) | Draft | Trust calculation specification |
| [specs/security-integration.md](specs/security-integration.md) | Draft | Security model |

---

## Diagrams

Visual architecture and journey documentation — ASCII art diagrams covering system architecture and participant journeys at multiple levels of detail.

| Document | What it covers |
|----------|---------------|
| [diagrams/c4-model.md](diagrams/c4-model.md) | C4 architecture (context, container, component) |
| [diagrams/human-journey.md](diagrams/human-journey.md) | Human participant journey |
| [diagrams/delegated-agent-journey.md](diagrams/delegated-agent-journey.md) | Delegated agent journey (Phase 2) |
| [diagrams/autonomous-agent-journey.md](diagrams/autonomous-agent-journey.md) | Autonomous agent journey (Phase 3) |

---

## Explainer Tests

Early experiments testing how to explain SEP to different audiences.

| Document | Audience |
|----------|----------|
| [explainer-tests/Test 1 - Complete Novice.md](explainer-tests/Test%201%20-%20Complete%20Novice.md) | General audience |
| [explainer-tests/Test 1 - Business Expert.md](explainer-tests/Test%201%20-%20Business%20Expert.md) | Business stakeholders |
| [explainer-tests/Test 1 - Technology Expert.md](explainer-tests/Test%201%20-%20Technology%20Expert.md) | Technical audience |
| [explainer-tests/schema-drift-review.md](explainer-tests/schema-drift-review.md) | Schema design drift review |
| [explainer-tests/Test 1 - Schema Drift Response.md](explainer-tests/Test%201%20-%20Schema%20Drift%20Response.md) | Response to drift review |

---

## Other Files

| Document | What it covers |
|----------|---------------|
| [use-cases.md](use-cases.md) | Concrete exchange scenarios showing how SEP works in practice |
| [session-log.md](session-log.md) | Development session history (Feb 12–26, 2026) |
