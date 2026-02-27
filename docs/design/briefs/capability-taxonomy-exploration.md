# Exploration Brief: Capability Taxonomy Architecture

**Purpose**: Multi-perspective analysis to inform design decisions for the Capability Translation System (WP8)

**Output**: Findings document that will inform a design exploration document

---

## Context

The Surplus Exchange Protocol (SEP) matches surplus capacity (what providers have) to needs (what recipients want). The core matching problem is that these are expressed in different terms:

| Provider says | Recipient needs |
|---------------|-----------------|
| "20 hours of design time" | "A logo for my business" |
| "Legal expertise available" | "Contract review" |
| "Van returning empty from Birmingham" | "Move 3 boxes to Manchester" |

A **Capability Taxonomy** is proposed to bridge this gap — a normalised vocabulary of outputs (e.g., `logo_design`, `contract_review`, `regional_transport`) that enables matching.

### The Question

**How should the capability taxonomy be structured and governed to enable effective matching while remaining scalable and adaptable?**

The initial assumption was a universal canonical taxonomy maintained by SEP. However, this risks:
- Bottlenecks on additions (who decides? how fast?)
- Conflicting definitions (does "branding" mean logo-only or full identity?)
- Coverage gaps for niche domains
- Regional/cultural variance in terminology

### The Interplay

There's also interplay between:
1. **Taxonomy** — gets work into the right bucket (e.g., "this is design work")
2. **Contextual information** — narrows within the bucket (e.g., "specifically logo design, for a tech startup, modern aesthetic")

This suggests the taxonomy doesn't need to be exhaustive — it needs to be **good enough to route**, with context handling the specifics. But this flexibility requires either human interpretation or AI assistance to bridge gaps.

---

## What We Need to Understand

### 1. Architecture Options

Evaluate these approaches (and any others identified):

| Approach | Description |
|----------|-------------|
| **Canonical + curated** | SEP maintains one taxonomy, additions go through governance |
| **Canonical + extensions** | Core taxonomy + federation/network-level extensions |
| **Semantic layer** | Loose taxonomy + AI does fuzzy matching between expressions |
| **Emergent** | No fixed taxonomy — learn from actual exchanges |
| **Hybrid** | Combination of above |

For each approach, assess:
- How does matching work in practice?
- What happens when terms conflict or are missing?
- What's the governance burden?
- How does it scale (10 sectors vs 100 sectors)?
- What's the cold-start experience?

### 2. Key Scenarios to Analyse

**Scenario A: New term introduction**
> First provider offers "AI prompt engineering services". How does this become matchable to someone who needs "help writing prompts for ChatGPT"?

**Scenario B: Term collision**
> Provider A uses "branding" to mean logo design. Provider B uses "branding" to mean full identity system (logo + colours + typography + guidelines). Recipient asks for "branding help". What happens?

**Scenario C: Cross-domain capability**
> Provider offers "marketing strategy consulting" — is this under `marketing`, `consulting`, or `strategy`? Does it matter?

**Scenario D: Regional variance**
> UK provider offers "solicitor services". US recipient needs "attorney services". Same thing, different terms.

**Scenario E: Specificity mismatch**
> Taxonomy has `logo_design`. Recipient needs "animated logo for YouTube channel". Is this a match? How is the gap handled?

### 3. Role of AI/Human Interpretation

- Where is AI assistance essential vs optional?
- What confidence thresholds make sense for auto-matching vs human review?
- Can AI translate between different taxonomies in a federated model?
- What's the failure mode when AI gets it wrong?

### 4. Practical Constraints

- Phase 1 is human-only (all matches reviewed by humans before commitment)
- Phase 2 introduces delegated agents (some automation within bounds)
- Phase 3 introduces autonomous agents (agent-to-agent negotiation)

The taxonomy architecture needs to work for Phase 1 but not preclude Phase 2/Phase 3.

---

## Perspectives Requested

Analyse this problem from these distinct viewpoints:

### Perspective 1: Systems Architect
Focus on technical scalability, data structures, versioning, and how the taxonomy integrates with matching algorithms. Consider: graph structures, semantic embeddings, version compatibility, query performance.

### Perspective 2: Product Designer
Focus on user experience for providers defining capabilities and recipients expressing needs. Consider: cognitive load, error recovery, progressive disclosure, "I don't see my thing" scenarios.

### Perspective 3: Network Economist
Focus on incentive structures, governance, and what makes vocabularies succeed or fail. Consider: standards adoption dynamics, coordination problems, tragedy of the commons, comparison to other classification systems (SIC codes, job taxonomies, etc.).

### Perspective 4: Devil's Advocate
Actively challenge assumptions. Consider: Why might a taxonomy be the wrong abstraction entirely? What if free-text + AI matching is sufficient? What failure modes are being underestimated?

---

## Deliverable

A findings document structured as:

1. **Summary of each perspective's analysis**
2. **Points of agreement** across perspectives
3. **Points of tension** where perspectives conflict
4. **Recommended approach** (or 2-3 options with trade-offs)
5. **Open questions** that need further investigation or user research

This will feed into a design exploration document that proposes a specific architecture for the capability taxonomy.

---

## Reference Materials

Read these before analysis:
- [capability-translation.md](../capability-translation.md) — current design thinking
- [open-questions.md](../open-questions.md) — broader context
- [chain-discovery.md](../chain-discovery.md) — how matching currently works
- `schemas/capability-offering.schema.json` — current capability_matching structure
- `schemas/need.schema.json` — current need structure
- `src/matching/scorer.ts` — current matching implementation (keyword-based)

---

## Notes for Agent Team

- Each perspective should work independently before comparing notes
- Actively try to disprove each other's assumptions
- Concrete examples are more valuable than abstract principles
- "It depends" is acceptable if you specify what it depends on
- Recommend reading the historical systems research in `docs/research/` for context on why previous barter/exchange systems succeeded or failed
