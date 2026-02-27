# Capability Translation System

**Status**: In Progress (WP8)
**Last Updated**: 2026-02-12
**Related**: [agent-integration-plan.md](./agent-integration-plan.md), [capability-taxonomy-findings.md](./capability-taxonomy-findings.md)

---

## The Problem

Surplus is expressed in **provider terms** (what they have), but needs are expressed in **recipient terms** (what they want). These rarely match directly:

| Provider Says | Recipient Needs |
|---------------|-----------------|
| "20 hours of design work" | "A logo for my business" |
| "Legal expertise available" | "Contract review for supplier agreement" |
| "Van returning empty from Birmingham" | "Move 3 boxes to Manchester" |
| "Meeting room free Tuesdays" | "Space for 8-person workshop" |

**Without translation, matching fails.** The system sees "20 hours design" and "logo needed" as unrelated strings.

---

## Design Principles

Based on [multi-perspective analysis](./capability-taxonomy-findings.md), the following principles guide this design:

### 1. AI-First Matching

AI (via embeddings and LLM interpretation) does the heavy lifting for matching. The taxonomy supports AI rather than replacing it. This aligns with SEP's core thesis: AI enables matching that humans couldn't compute alone.

### 2. Discovery-Only Scope

The taxonomy's job is narrow: **given a need, find offerings that might fulfil it**. It does not:
- Validate quality (handled by trust layer)
- Guarantee fit (handled by human confirmation)
- Negotiate scope (handled by participants)
- Assess commitment risk (handled by trust layer)

### 3. Invisible Taxonomy

Users interact via natural language only. They should never navigate categories or select from dropdowns. The taxonomy is an implementation detail that enables matching, not a user-facing structure.

### 4. Integrated Trust

Capability matching and trust assessment are presented together in a unified confirmation flow. They share the same human-in-the-loop moments and the same feedback mechanisms.

### 5. Emergent Structure

The taxonomy grows from AI extractions and human confirmations, not top-down definition. Early AI investment builds an asset that reduces ongoing AI dependency.

---

## The Solution: Capability Translation

A system that bridges provider capacity and recipient needs by:

1. **Extracting capabilities** - AI interprets natural language into structured representation
2. **Semantic matching** - Embedding-based similarity finds candidate matches
3. **Human confirmation** - All matches reviewed before commitment (Phase 1)
4. **Learning** - Confirmed matches improve future matching

---

## Phase 1 Architecture: AI-First Matching

### Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PHASE 1 MATCHING ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   NATURAL LANGUAGE INPUT                                            │
│   "I have 20 hours of design time" / "I need a logo"               │
│         │                                                           │
│         ▼                                                           │
│   ┌─────────────────────────────────────────────────────────┐      │
│   │              AI CAPABILITY EXTRACTION                    │      │
│   │  • LLM interprets input                                  │      │
│   │  • Extracts capability terms + context                   │      │
│   │  • Generates embeddings                                  │      │
│   │  • Checks against known terms (cache hit = no LLM call)  │      │
│   └─────────────────────────────────────────────────────────┘      │
│         │                                                           │
│         ▼                                                           │
│   ┌─────────────────────────────────────────────────────────┐      │
│   │              SEMANTIC MATCHING                           │      │
│   │  • Vector similarity search                              │      │
│   │  • Confidence scoring                                    │      │
│   │  • Candidate ranking                                     │      │
│   └─────────────────────────────────────────────────────────┘      │
│         │                                                           │
│         ▼                                                           │
│   ┌─────────────────────────────────────────────────────────┐      │
│   │              INTEGRATED CONFIRMATION                     │      │
│   │  • Capability match explanation (natural language)       │      │
│   │  • Trust signals (from trust layer)                      │      │
│   │  • Human reviews and confirms/declines                   │      │
│   └─────────────────────────────────────────────────────────┘      │
│         │                                                           │
│         ▼                                                           │
│   ┌─────────────────────────────────────────────────────────┐      │
│   │              LEARNING LOOP                               │      │
│   │  • Confirmed matches strengthen term associations        │      │
│   │  • Declined matches refine future suggestions            │      │
│   │  • Novel terms cached for future direct matching         │      │
│   │  • High-usage patterns proposed for taxonomy             │      │
│   └─────────────────────────────────────────────────────────┘      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Human Journey (Phase 1)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CAPABILITY DEFINITION FLOW                        │
└─────────────────────────────────────────────────────────────────────┘

     Human                    AI Assistant                    SEP
       │                           │                           │
       │  "I have 20 hours of     │                           │
       │   design time spare"     │                           │
       │ ─────────────────────────>                           │
       │                           │                           │
       │                    Asks clarifying questions:        │
       │                    - What type of design?            │
       │                    - What tools do you use?          │
       │                    - What's your experience level?   │
       │                    - Any portfolio examples?         │
       │ <─────────────────────────                           │
       │                           │                           │
       │  "Graphic design,         │                           │
       │   Figma/Adobe, 8 years,   │                           │
       │   here's my portfolio"    │                           │
       │ ─────────────────────────>                           │
       │                           │                           │
       │                    Generates capability mapping:     │
       │                    ┌─────────────────────────────┐   │
       │                    │ Your 20 hours could become: │   │
       │                    │ • Logo design (4-6 hrs)     │   │
       │                    │ • Pitch deck (6-10 hrs)     │   │
       │                    │ • Brand guidelines (8-12)   │   │
       │                    │ • Social media pack (3-5)   │   │
       │                    │ • Marketing flyer (2-3)     │   │
       │                    └─────────────────────────────┘   │
       │ <─────────────────────────                           │
       │                           │                           │
       │  Reviews, adjusts,        │                           │
       │  confirms outputs         │                           │
       │ ─────────────────────────>                           │
       │                           │                           │
       │                    Validates & structures:           │
       │                    - Checks estimates are realistic  │
       │                    - Caches term mappings            │
       │                    - Sets confidence levels          │
       │                           │ ─────────────────────────>
       │                           │                           │
       │                           │         Offering stored   │
       │                           │         with capability   │
       │                           │         mapping ready     │
       │                           │         for matching      │
       │                           │ <─────────────────────────
```

### Delegated Agent Journey (Phase 2)

```
┌─────────────────────────────────────────────────────────────────────┐
│              AGENT-ASSISTED CAPABILITY DEFINITION                    │
└─────────────────────────────────────────────────────────────────────┘

  Business          Delegated              Capability            SEP
  Systems            Agent                 Service
     │                  │                      │                  │
     │  Staff calendar  │                      │                  │
     │  shows 20hrs     │                      │                  │
     │  unallocated     │                      │                  │
     │ ────────────────>│                      │                  │
     │                  │                      │                  │
     │                  │  Query: "designer,   │                  │
     │                  │  8yrs, portfolio X"  │                  │
     │                  │ ────────────────────>│                  │
     │                  │                      │                  │
     │                  │                      │  Analyses:       │
     │                  │                      │  - Profile data  │
     │                  │                      │  - Past work     │
     │                  │                      │  - Industry norms│
     │                  │                      │                  │
     │                  │  Returns capability  │                  │
     │                  │  mapping with        │                  │
     │                  │  confidence scores   │                  │
     │                  │ <────────────────────│                  │
     │                  │                      │                  │
     │                  │  Auto-publish offering with            │
     │                  │  AI-generated capability mapping       │
     │                  │ ─────────────────────────────────────> │
     │                  │                      │                  │
     │                  │                      │    Stored with   │
     │                  │                      │    "ai_generated"│
     │                  │                      │    flag          │
     │                  │ <───────────────────────────────────── │
     │                  │                      │                  │
     │  Dashboard:      │                      │                  │
     │  "Auto-published │                      │                  │
     │  20hrs design    │                      │                  │
     │  as logo/deck/   │                      │                  │
     │  brand work"     │                      │                  │
     │ <────────────────│                      │                  │
```

### Autonomous Agent Journey (Phase 3)

```
┌─────────────────────────────────────────────────────────────────────┐
│              AUTONOMOUS CAPABILITY NEGOTIATION                       │
└─────────────────────────────────────────────────────────────────────┘

  Provider           Provider              Recipient            Recipient
  Agent              Capability            Agent                Capability
     │                  │                      │                    │
     │  Broadcast:      │                      │                    │
     │  "20hrs design,  │                      │                    │
     │  outputs: [...]" │                      │                    │
     │ ────────────────────────────────────────>                    │
     │                  │                      │                    │
     │                  │              Receives broadcast           │
     │                  │              Has need: "logo"             │
     │                  │                      │                    │
     │                  │              Query: "Can 'logo'           │
     │                  │              be fulfilled by              │
     │                  │              this offering?"              │
     │                  │                      │ ──────────────────>│
     │                  │                      │                    │
     │                  │                      │    Semantic match: │
     │                  │                      │    logo ∈ outputs  │
     │                  │                      │    confidence: 0.92│
     │                  │                      │ <──────────────────│
     │                  │                      │                    │
     │                  │    Negotiation:      │                    │
     │                  │    "Logo feasible    │                    │
     │                  │    in 4-6hrs?"       │                    │
     │ <────────────────────────────────────────                    │
     │                  │                      │                    │
     │  Query own       │                      │                    │
     │  capability      │                      │                    │
     │  service         │                      │                    │
     │ ────────────────>│                      │                    │
     │                  │                      │                    │
     │  Validates:      │                      │                    │
     │  "Logo: 4-6hrs   │                      │                    │
     │  typical,        │                      │                    │
     │  confidence:high"│                      │                    │
     │ <────────────────│                      │                    │
     │                  │                      │                    │
     │  Confirm: "Yes,  │                      │                    │
     │  4-6hrs, terms X"│                      │                    │
     │ ────────────────────────────────────────>                    │
```

---

## Capability Translation Service

A service that bridges natural language and structured matching:

### Core Functions

| Function | Description | Phase 1 Implementation |
|----------|-------------|-------------------|
| **Extract** | Interpret natural language into capability terms | LLM + caching |
| **Embed** | Generate vector embeddings for semantic matching | Embedding API |
| **Match** | Find candidate offerings for a need | Vector similarity |
| **Explain** | Generate natural language match explanations | Template + LLM fallback |
| **Learn** | Improve from confirmed/declined matches | Pattern tracking |

### Service Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                   CAPABILITY TRANSLATION SERVICE                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    EXTRACTION LAYER                          │   │
│  │                                                              │   │
│  │  Input: Natural language ("I need a logo for my startup")   │   │
│  │                          │                                   │   │
│  │            ┌─────────────┴─────────────┐                    │   │
│  │            ▼                           ▼                    │   │
│  │     ┌────────────┐              ┌────────────┐              │   │
│  │     │ Term Cache │              │    LLM     │              │   │
│  │     │ (fast)     │              │ (fallback) │              │   │
│  │     └────────────┘              └────────────┘              │   │
│  │            │                           │                    │   │
│  │            └─────────────┬─────────────┘                    │   │
│  │                          ▼                                   │   │
│  │  Output: {terms: ["logo_design"], context: {sector: "tech"}} │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                          │                                         │
│                          ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    MATCHING LAYER                            │   │
│  │                                                              │   │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │   │
│  │  │  Embedding   │    │   Vector     │    │  Confidence  │   │   │
│  │  │  Generation  │───▶│   Search     │───▶│   Scoring    │   │   │
│  │  └──────────────┘    └──────────────┘    └──────────────┘   │   │
│  │                                                              │   │
│  │  Output: Ranked candidates with confidence scores            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                          │                                         │
│                          ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    LEARNING LAYER                            │   │
│  │                                                              │   │
│  │  • Cache novel term → extraction mappings                    │   │
│  │  • Track confirmation rates per term                         │   │
│  │  • Update term maturity scores                               │   │
│  │  • Propose high-usage patterns for taxonomy                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Emergent Taxonomy

In Phase 1, the taxonomy **emerges from AI extractions and human confirmations** rather than being predefined. A lightweight seed vocabulary bootstraps the system.

### Seed Vocabulary (Phase 1)

Initial terms covering professional services, legal, and transport:

```yaml
seed_vocabulary:
  # Design outputs
  - logo_design
  - pitch_deck
  - brand_guidelines
  - website_mockup
  - social_media_pack
  - marketing_flyer
  - illustration

  # Legal outputs
  - contract_review
  - contract_drafting
  - terms_and_conditions
  - legal_consultation
  - compliance_audit

  # Transport outputs
  - local_delivery
  - regional_transport
  - same_day_courier
  - storage_space

  # General professional services
  - consulting_session
  - strategy_document
  - research_report
  - training_session
  - project_management
```

### Term Maturity Model

Each term tracks its usage and reliability:

```typescript
interface TermMaturity {
  term_id: string;

  // Usage metrics
  extraction_count: number;      // How often AI extracts this term
  match_count: number;           // How often used in matching
  confirmation_rate: number;     // % of matches confirmed by humans

  // Maturity classification
  maturity_level: 'seed' | 'emerging' | 'established' | 'canonical';

  // Synonyms learned
  known_expressions: string[];   // Natural language → this term

  // Efficiency impact
  direct_match_rate: number;     // % of extractions that skip LLM (cache hit)
}
```

**Maturity progression:**

| Level | Criteria | Matching Approach |
|-------|----------|-------------------|
| **Seed** | Pre-defined, limited data | LLM extraction + embedding |
| **Emerging** | 10+ extractions, >50% confirmation | Cache + embedding |
| **Established** | 100+ extractions, >70% confirmation | Direct match + cache |
| **Canonical** | 500+ extractions, >80% confirmation, governance approved | Direct match (no AI) |

### Synonym Learning

When AI interprets novel expressions, mappings are cached:

```
"fractional CFO" → {term: "consulting_session", context: {domain: "finance", level: "senior"}}
"investor deck" → {term: "pitch_deck", confidence: 0.95}
"legal review of contract" → {term: "contract_review", confidence: 0.98}
```

High-confidence cached mappings become synonyms after validation threshold.

---

## Integrated Confirmation Flow

Capability matching and trust assessment are presented together:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MATCH CONFIRMATION SCREEN                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  "We found a potential match for your logo design need"            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ CAPABILITY FIT                                               │   │
│  │                                                              │   │
│  │ Provider offers: Graphic design services                     │   │
│  │ Your need: Logo for tech startup                             │   │
│  │                                                              │   │
│  │ Match reasoning: "Provider has delivered 12 logo projects    │   │
│  │ including 3 for tech companies. Estimated 4-6 hours."        │   │
│  │                                                              │   │
│  │ Confidence: ████████░░ 82%                                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ TRUST SIGNALS                                                │   │
│  │                                                              │   │
│  │ Exchange history: 8 completed, 100% satisfaction            │   │
│  │ Network position: Vouched by 3 participants you've worked   │   │
│  │                   with                                       │   │
│  │ Verification: Identity verified                              │   │
│  │                                                              │   │
│  │ Trust tier: Established                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐    │
│  │  Confirm    │  │   Decline   │  │  Ask provider question  │    │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Feedback Captured

Both confirm and decline feed back into both systems:

| Action | Capability Learning | Trust Learning |
|--------|---------------------|----------------|
| **Confirm** | Strengthen term associations; update estimates | Positive signal for provider |
| **Decline (poor fit)** | Weaken term association; flag for review | Neutral |
| **Decline (trust concern)** | Neutral | Flag for trust review |
| **Exchange succeeds** | Promote term maturity; refine estimates | Increase trust score |
| **Exchange fails** | Reduce confidence; flag term | Decrease trust score |

---

## Data Model Extensions

### Offering Schema Addition

```json
{
  "capability_translation": {
    "type": "object",
    "description": "Metadata about how capability mapping was generated",
    "properties": {
      "method": {
        "type": "string",
        "enum": ["human_defined", "ai_assisted", "ai_generated", "template", "learned"],
        "description": "How the capability mapping was created"
      },
      "confidence": {
        "type": "number",
        "minimum": 0,
        "maximum": 1,
        "description": "System confidence in the mapping accuracy"
      },
      "validated_by": {
        "type": "string",
        "enum": ["human", "system", "exchange_history", "unvalidated"],
        "description": "What validated this mapping"
      },
      "last_refined": {
        "type": "string",
        "format": "date-time",
        "description": "When mapping was last updated based on exchange outcomes"
      },
      "source_inputs": {
        "type": "array",
        "items": { "type": "string" },
        "description": "What information was used to generate mapping (e.g., 'portfolio', 'profile', 'interview')"
      }
    }
  }
}
```

### Need Schema Addition

```json
{
  "capability_resolution": {
    "type": "object",
    "description": "How the need was matched to capability taxonomy",
    "properties": {
      "original_expression": {
        "type": "string",
        "description": "What the user originally asked for (e.g., 'I need a logo')"
      },
      "resolved_to": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Taxonomy terms this resolves to (e.g., ['logo_design', 'visual_identity'])"
      },
      "resolution_confidence": {
        "type": "number",
        "minimum": 0,
        "maximum": 1
      },
      "alternatives_suggested": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Other interpretations offered to user"
      }
    }
  }
}
```

---

## User Experience by Mode

### Human (Phase 1): Guided Definition

**Onboarding flow:**

1. User states what they have ("I'm a designer with spare time")
2. AI assistant asks clarifying questions
3. System suggests outputs based on profile
4. User reviews, adjusts, confirms
5. System validates and stores

**Key UX principles:**
- Never ask users to categorise themselves
- Show concrete outputs, not abstract categories
- Let users remove outputs they can't/won't do
- Explain how each output helps matching

### Delegated Agent (Phase 2): Supervised Auto-Definition

**Auto-publish flow:**

1. Agent detects surplus from business systems
2. Queries Capability Service with context
3. Receives capability mapping with confidence scores
4. Auto-publishes if confidence > threshold
5. Notifies human of what was published
6. Human can adjust if needed

**Key design principles:**
- High-confidence outputs auto-included
- Medium-confidence outputs flagged for review
- Low-confidence outputs excluded
- All mappings shown on dashboard

### Autonomous Agent (Phase 3): Real-Time Negotiation

**Matching flow:**

1. Provider agent broadcasts capability mapping
2. Recipient agent has need in natural language
3. Both query Capability Service for semantic match
4. Agents negotiate based on validated mapping
5. Commitment includes specific output, not hours

**Key design principles:**
- Agents must agree on output definition
- Capacity estimation validated before commitment
- Disputes trigger human escalation
- Successful exchanges improve future mappings

---

## Learning Loop

The system improves over time:

```
┌─────────────────────────────────────────────────────────────────┐
│                      CAPABILITY LEARNING LOOP                    │
└─────────────────────────────────────────────────────────────────┘

    Exchange             Outcome              Feedback
    Proposed             Recorded             Applied
        │                    │                    │
        ▼                    ▼                    ▼
   ┌─────────┐         ┌─────────┐         ┌─────────┐
   │ "Logo   │         │ Took    │         │ Update  │
   │ design  │ ──────> │ 5 hours │ ──────> │ estimate│
   │ 4-6hrs" │         │ Happy   │         │ to 4-6  │
   └─────────┘         └─────────┘         └─────────┘
                            │
                            ▼
                       ┌─────────┐
                       │ Provider│
                       │ delivers│
                       │ well    │
                       └─────────┘
                            │
                            ▼
                       ┌─────────┐
                       │ Increase│
                       │ mapping │
                       │ confid. │
                       └─────────┘
```

**Signals captured:**
- Actual time vs estimated time
- Satisfaction rating
- Whether output matched expectation
- Repeat exchanges for same output type

**Improvements made:**
- Refine time estimates
- Add new output types seen in practice
- Remove outputs that consistently fail
- Adjust confidence scores

---

## Integration Points

| Component | Integration |
|-----------|-------------|
| **Onboarding UI** | Calls Capability Service during profile creation |
| **Offering API** | Validates capability mapping on submission |
| **Matching Engine** | Uses semantic matcher for need→offering matching |
| **Delegated Agent** | Queries service for auto-generated mappings |
| **Autonomous Agent** | Real-time capability validation during negotiation |
| **Trust Engine** | Receives exchange outcomes for learning loop |

---

## Governance Model

### Phase 1: Founding Participant Governance

For Phase 1, taxonomy governance is lightweight:

**Who decides**: Founding participants (early adopters of the protocol)

**What they decide**:
- Approve AI-proposed additions to canonical vocabulary
- Resolve term collision disputes
- Review low-confidence terms flagged by the system

**How it works**:

```
AI observes usage patterns
         │
         ▼
AI proposes taxonomy changes
("'fractional CFO' appeared 47 times, maps to 'consulting'.
 Suggest adding as subcategory of financial_advisory?")
         │
         ▼
Proposal visible to founding participants
         │
         ▼
Simple voting (majority approval, 7-day window)
         │
         ▼
Approved → term promoted to canonical
Rejected → remains cached synonym only
```

**Evolution path**: As SEP federates, governance may shift to representatives from federated instances.

### Governance Principles

1. **AI does heavy lifting**: Pattern detection, proposal generation, synonym clustering
2. **Humans provide legitimacy**: Approval, dispute resolution, quality control
3. **Low burden**: Periodic review cycles, not constant attention
4. **Transparent**: All proposals and decisions visible to participants

---

## Operational Costs and Efficiency

### AI Cost Structure

| Function | Cost Driver | Phase 1 Estimate |
|----------|-------------|-------------|
| Capability extraction | LLM call per novel input | ~$0.02 per extraction |
| Embedding generation | Embedding API call | ~$0.0001 per embedding |
| Match explanation | LLM call (if not templated) | ~$0.01 per explanation |
| Taxonomy proposal | Batch LLM analysis | ~$10 per review cycle |

**Phase 1 estimated monthly cost** (100 participants): ~$100-200/month

### Efficiency Roadmap

As the taxonomy matures, AI costs decrease:

```
Early (no taxonomy)                          Mature (rich taxonomy)
        │                                              │
        ▼                                              ▼
┌─────────────────┐                        ┌─────────────────┐
│ Every input     │                        │ Most inputs     │
│ needs full AI   │                        │ map to known    │
│ interpretation  │                        │ terms (cached)  │
└─────────────────┘                        └─────────────────┘
        │                                              │
   Expensive                                      Cheap
   ~$0.02/query                              ~$0.0001/query
```

**Cost projection by scale**:

| Stage | Participants | Novel Input Rate | AI Calls/Query | Est. Monthly Cost |
|-------|--------------|------------------|----------------|-------------------|
| Phase 1 Bootstrap | 100 | ~80% | ~3-5 | $150 |
| Phase 2 Growing | 1,000 | ~30% | ~1-2 | $300 |
| Phase 3 Mature | 10,000 | ~5% | ~0.2 | $500 |

**Key insight**: Early AI investment builds the taxonomy that reduces ongoing AI dependency. Phase 1 costs are capital investment, not permanent operating expense.

### Phase 1 Funding Approach

For Phase 1 pilot phase, costs are absorbed by the project. Sustainable models (subscriptions, transaction fees) to be evaluated based on Phase 1 learnings.

---

## Open Questions

### Resolved by This Design

| Question | Resolution |
|----------|------------|
| Taxonomy governance | AI-mediated + founding participant approval |
| Cold start | Seed vocabulary + AI extraction from day 1 |
| Quality signals | Confirmation rates, exchange outcomes |

### Remaining for Phase 2+

1. **Federated governance**: How do federated instances participate in canonical decisions?
2. **Cross-domain outputs**: How to handle capabilities spanning categories?
3. **Regional variance**: Do terms need localisation (UK solicitor vs US attorney)?
4. **Sustainable funding**: Subscription, transaction fee, or other model?

---

## Implementation Priority

| Phase | Scope | Enables |
|-------|-------|---------|
| **Phase 1.0** | AI extraction + embedding matching + seed vocabulary | Discovery-based matching |
| **Phase 1.1** | Term maturity tracking + learning loop | Efficiency improvements |
| **Phase 1.2** | Integrated confirmation flow (capability + trust) | Unified human-in-the-loop |
| **Phase 2.0** | Founding participant governance UI | Taxonomy evolution |
| **Phase 2.1** | Agent-queryable capability service | Delegated agent support |
| **Phase 3.0** | Federated extensions + cross-walk | Multi-network interop |

---

## Success Metrics

### Discovery Quality

| Metric | Phase 1 Target | Measurement |
|--------|-----------|-------------|
| Match rate | >30% | % of needs finding at least one candidate |
| Confirmation rate | >50% | % of suggested matches confirmed |
| False negative rate | <10% | Valid matches missed (sampled) |

### Efficiency

| Metric | Phase 1 Target | Phase 3 Target |
|--------|-----------|-----------|
| Cache hit rate | 20% | 80% |
| Avg AI calls per query | 3-5 | <0.5 |
| Cost per match | ~$0.05 | ~$0.005 |

### User Experience

| Metric | Phase 1 Target |
|--------|----------------|
| Onboarding completion | >70% |
| Time to first match | <24 hours |
| Capability definition time | <5 minutes |

---

## References

- [Capability Taxonomy Findings](./capability-taxonomy-findings.md) — Multi-perspective analysis
- [Systems Architect Analysis](./analysis/systems-architect-analysis.md)
- [Product Designer Analysis](./analysis/product-designer-analysis.md)
- [Network Economist Analysis](./analysis/network-economist-analysis.md)
- [Devil's Advocate Analysis](./analysis/devils-advocate-analysis.md)
