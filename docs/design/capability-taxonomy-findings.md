# Capability Taxonomy Architecture: Multi-Perspective Findings

**Date**: 2026-02-12
**Status**: Analysis Complete
**Input**: Exploration brief at `docs/design/briefs/capability-taxonomy-exploration.md`

---

## Executive Summary

Four specialist perspectives analysed the capability taxonomy architecture options for SEP's Capability Translation System (WP8). This document synthesises their findings into actionable recommendations.

**Overall Consensus**: A **Hybrid Architecture** with a semantic-first user interface, canonical core taxonomy for structure, and AI-assisted matching offers the best balance of usability, scalability, and adaptability. However, **trust infrastructure may be more important than taxonomy** for network success.

### Key Insight

> "The taxonomy should be invisible to users. They should think in terms of their own language while the system handles translation. The moment we ask users to navigate categories or select from dropdowns, we have failed." — Product Designer

---

## 1. Summary of Each Perspective

### Systems Architect Analysis

**Focus**: Technical scalability, data structures, versioning, query performance

**Recommendation**: Hybrid three-layer architecture

| Layer | Purpose | Implementation |
|-------|---------|----------------|
| Layer 1: Canonical Core | Stable structure, fast queries | ~100-200 curated terms, O(1) hash lookup |
| Layer 2: Extensions | Regional/domain customisation | Federation-managed, AI-assisted cross-walks |
| Layer 3: Semantic | Fuzzy matching fallback | Embeddings via pgvector, confidence scores |
| Emergent Loop | Background learning | Term co-occurrence tracking, taxonomy suggestions |

**Key Technical Decisions**:
- PostgreSQL + pgvector (no additional infrastructure)
- Semantic versioning for taxonomy changes
- Materialised equivalence classes for cross-walk performance
- Query latency targets: <100ms for Phase 1, <500ms for Phase 3 hybrid pipeline

**Version Evolution**:
- Phase 1: Canonical core (~100 terms) + basic embeddings
- Phase 2: Extensions + AI cross-walks
- Phase 3: Full emergent learning loop

---

### Product Designer Analysis

**Focus**: User experience, cognitive load, onboarding, error recovery

**Recommendation**: Semantic layer as user interface, taxonomy invisible

**Core Principle**: "Just describe what you do/need" — AI handles translation

**UX Ratings by Architecture**:

| Architecture | Provider UX | Recipient UX | Cold Start | Error Recovery |
|--------------|-------------|--------------|------------|----------------|
| Canonical + Curated | B- | B+ | D | C |
| Canonical + Extensions | C+ | C | C | C |
| **Semantic Layer** | **A** | **A-** | B | **A-** |
| Emergent | B | D | F | B |
| Hybrid | B- | B- | C+ | B |

**Critical UX Requirements**:
1. Conversational-first onboarding (natural language input)
2. AI interpretation transparency ("Here's what I understood")
3. Lightweight correction mechanisms
4. Match confidence communication
5. Graceful handling of "I don't see my thing" scenarios

**Cold Start UX Strategy**:
```
Onboarding target (5 minutes):
1. IDENTIFY (30 sec): Role and context
2. DESCRIBE (2 min): Capacity/needs in natural language
3. CONFIRM (1 min): Review AI understanding
4. PREVIEW (1 min): See potential matches
5. ACTIVATE (30 sec): Go live
```

**Key Insight**: The taxonomy is an implementation detail. Users should never need to know it exists.

---

### Network Economist Analysis

**Focus**: Incentives, governance, standards adoption, network effects

**Recommendation**: Hybrid with graduated governance model

**Critical Mass Analysis**:
- Category viability threshold: ~8 participants per category
- Minimum viable taxonomy: ~50 categories
- Network thresholds: 100-200 participants for minimal viability; 2000+ for full network effects

**Governance Evolution**:

| Phase | Primary Model | Rationale |
|-------|---------------|-----------|
| Phase 1 | Centralised Curation | Small network, need consistency |
| Phase 2 | Centralised Core + Federated Extensions | Scaling beyond central capacity |
| Phase 3 | AI-Mediated + Market Governance | Sufficient data for AI learning |

**Standards Adoption Lessons**:
- Successful: MARC records, EDI, ISBN, hashtags — low adoption cost, clear value
- Failed: SIC codes (slow updates), complex citation systems — high friction
- SEP must: Minimise cognitive overhead, demonstrate immediate matching benefit

**Incentive Design**:
1. Match quality signalling (better categorisation → better matches)
2. Contribution recognition (taxonomy contributor badges)
3. Graduated complexity (AI handles taxonomy for new users)
4. Outcome-linked learning (successful exchanges reinforce patterns)

**Commons Risks and Mitigations**:

| Risk | Mitigation |
|------|------------|
| Quality degradation (over-specificity) | Usage thresholds for new categories |
| Gaming (mis-categorisation) | Limited selections per offering, recipient feedback |
| Governance capture | Transparent process, distributed voting |
| Maintenance abandonment | Funded governance function, AI gap detection |

---

### Devil's Advocate Analysis

**Focus**: Challenge assumptions, identify failure modes

**Core Challenge**: "Is taxonomy even the right abstraction?"

**Historical Pattern Observed**:
| System | Had Taxonomy? | Success? | Key Differentiator |
|--------|--------------|----------|-------------------|
| LETS | Yes | Failed | - |
| TimeBanks | Implicit | Failed | - |
| Sardex | Yes | **Succeeded** | **Active brokers** |
| ITEX | Yes | **Succeeded** | **Trade directors** |
| WIR | Yes | **Succeeded** | Established bank infrastructure |

**Key Insight**: "Taxonomies are present in both successful and failed systems. What differentiates success is **active brokerage**, not vocabulary structure."

**Failure Mode Analysis**:

| Architecture | Failure Mode | Likelihood | Severity |
|--------------|-------------|------------|----------|
| Canonical + Curated | Governance bottleneck | HIGH | HIGH |
| Canonical + Extensions | Fragmentation | HIGH | HIGH |
| Semantic Layer | Match opacity | HIGH | HIGH |
| Emergent | Cold start paralysis | CRITICAL | CRITICAL |
| Hybrid | Integration complexity | HIGH | MEDIUM |

**Critical Questions Raised**:
1. If AI matching is good enough, why have a taxonomy at all?
2. If AI matching isn't good enough, can taxonomy save it?
3. Who provides 1.2 FTE equivalent governance labour for a "protocol"?
4. What happens when taxonomy fails? Failures are visible and trust-destroying.

**Hidden Costs Identified**:
- Governance operational cost: ~200 hours/month at scale (1.2 FTE)
- Technical debt per major revision: 80-200 engineering hours
- User friction during onboarding: Each correction point is a churn opportunity
- Cross-version compatibility: Not addressed in current design
- Legal/compliance risk: Taxonomy terms may imply qualifications

**Kill Criteria Proposed**:
- Match rate below 10% after 12 months
- Satisfaction below 50%
- Governance deadlock preventing updates
- Scale ceiling (works at 100, fails at 1000)

---

## 2. Points of Agreement

All four perspectives agree on these points:

### 2.1 Hybrid Over Pure Approaches
No single architecture option is sufficient. All recommend combining:
- Structured taxonomy (for explainability and AI training)
- Semantic/AI layer (for flexibility and cold start)
- Learning mechanisms (for evolution)

### 2.2 AI as Primary Matching Engine
All perspectives acknowledge that AI (via embeddings or LLM understanding) must do the heavy lifting for matching. The taxonomy supports AI rather than replacing it.

### 2.3 Minimal Phase 1 Taxonomy
Start small (~100-150 terms) covering core sectors (professional services). Expand based on actual usage, not anticipated need.

### 2.4 Semantic Fallback Essential
When structured taxonomy doesn't produce matches, semantic similarity (embeddings) must fill the gap. This is non-negotiable for novel capabilities.

### 2.5 Human Review for Edge Cases
Phase 1 should have humans reviewing matches, especially semantic-only matches. Automation increases with confidence and data.

### 2.6 Governance is Critical Path Risk
All perspectives identify governance as the major scaling risk. Solutions vary but all involve some combination of:
- Federation (distributed governance)
- AI assistance (reduce governance burden)
- Market signals (usage determines canonical status)

---

## 3. Points of Tension

### 3.1 Taxonomy Visibility

| Perspective | Position |
|-------------|----------|
| **Product Designer** | Taxonomy must be completely invisible to users |
| **Systems Architect** | Taxonomy provides explainability users need |
| **Network Economist** | Some visibility needed for governance participation |
| **Devil's Advocate** | If invisible, why have it at all? |

**Resolution**: Taxonomy invisible by default; optional visibility for power users and governance participants. Explainability via natural language ("matched because you both do design work") not category exposure.

### 3.2 AI Dependency

| Perspective | Position |
|-------------|----------|
| **Product Designer** | Maximise AI; minimise structure |
| **Systems Architect** | AI fallback, structure primary |
| **Network Economist** | AI reduces governance burden |
| **Devil's Advocate** | AI opacity destroys trust when it fails |

**Resolution**: Layer 1+2 (canonical + extensions) primary, AI fallback. But AI handles all user-facing translation (natural language ↔ taxonomy). AI failures flagged for human review with clear explanation.

### 3.3 Governance Model

| Perspective | Position |
|-------------|----------|
| **Systems Architect** | Technical: Central for core, federated for extensions |
| **Network Economist** | Political: Graduated from central to AI-mediated |
| **Devil's Advocate** | Who actually does this work? |
| **Product Designer** | Governance should be invisible to most users |

**Resolution**: Design governance before taxonomy. Questions to answer:
- Who has authority? (SEP Foundation? Elected committee? Protocol contributors?)
- How are decisions made? (Consensus? Voting? AI proposal with human veto?)
- How is deadlock resolved?
- What's the funding model for governance labour?

### 3.4 Is Taxonomy Necessary?

| Perspective | Position |
|-------------|----------|
| **Systems Architect** | Yes, for performance and explainability |
| **Product Designer** | Yes, but invisible |
| **Network Economist** | Yes, for coordination and network effects |
| **Devil's Advocate** | Maybe not — trust and brokerage may matter more |

**Resolution**: Proceed with hybrid taxonomy, but:
- Invest parallel effort in trust infrastructure
- Design for graceful fallback if taxonomy fails
- Track whether taxonomy improves matching vs AI-only baseline

---

## 4. Recommended Approach

### Primary Recommendation: "Invisible Hybrid"

**User-Facing Layer**: Pure semantic (natural language throughout)
- Users describe offerings/needs in their own words
- AI translates to structured representation
- AI explains matches in natural language
- No category selection, no dropdowns, no taxonomy navigation

**Implementation Layer**: Three-tier hybrid
- Canonical core for structure (AI training, governance, explainability)
- Extensions for regional/domain customisation
- Semantic fallback for novel/edge cases

**Learning Layer**: Background evolution
- Track term usage and match success
- AI proposes taxonomy additions
- Human review for canonical promotion

### Alternative Option: "AI-First with Minimal Structure"

If governance capacity is genuinely unavailable, consider:
- Skip canonical taxonomy entirely for Phase 1
- Pure AI matching with confidence scores
- Human review below confidence threshold
- Emergent structure from usage patterns

**Trade-offs**:
- Pro: No governance burden; ships faster
- Con: Less explainability; AI failures harder to debug
- Con: Network effects weaker without shared vocabulary

### Implementation Priority

| Priority | Action | Rationale |
|----------|--------|-----------|
| 1 | Design governance model | Critical path risk; must answer "who decides?" |
| 2 | Build semantic matching (embeddings) | Enables both AI-first and hybrid approaches |
| 3 | Define minimal Phase 1 taxonomy (~100 terms) | Provides structure for AI and explainability |
| 4 | Implement conversational onboarding | Reduces user friction |
| 5 | Build trust infrastructure | Sardex insight: brokerage > vocabulary |
| 6 | Design extension mechanism | For Phase 2 federation support |
| 7 | Implement learning loop | For Phase 3 emergence |

---

## 5. Open Questions Requiring Further Investigation

### User Research Needed

1. **Confidence thresholds**: At what AI confidence level should we auto-match vs ask for clarification? (A/B testing)

2. **Disambiguation tolerance**: How many clarifying questions before users abandon? (Usability testing)

3. **Category visibility demand**: Do users actually want to browse categories? (User interviews)

4. **Cold-start messaging**: What framing of "no matches yet" retains users? (Retention testing)

### Technical Investigation Needed

5. **Embedding model selection**: Which model best captures professional services semantics? (Benchmark testing)

6. **Cross-walk performance at scale**: Can equivalence classes be maintained efficiently with 10K+ entries? (Load testing)

7. **Learning loop convergence**: How much data is needed for statistically valid taxonomy suggestions? (Simulation)

### Governance Design Needed

8. **Authority model**: Who ultimately decides what's canonical?

9. **Funding model**: How is governance labour compensated?

10. **Deadlock resolution**: What happens when governance can't agree?

11. **Legal review**: Do taxonomy terms create liability (e.g., "legal advice" implying qualifications)?

---

## 6. Next Steps

### Immediate (Next Session)

1. **Draft governance charter**: Answer the "who decides?" question
2. **Define Phase 1 taxonomy scope**: Confirm ~100 terms covering 5-6 sectors
3. **Prototype conversational onboarding**: Test with 3-5 users

### Near-Term

4. **Implement embedding generation**: Add to offering/need creation
5. **Update scorer.ts**: Add semantic similarity layer
6. **Design extension schema**: For Phase 2 federation support

### Success Metrics

| Metric | Phase 1 Target | Measurement |
|--------|-----------|-------------|
| Match rate | >30% of needs | Needs finding at least one viable match |
| Match satisfaction | >60% | Post-match feedback |
| Onboarding completion | >70% | Users completing 5-minute flow |
| Categorisation accuracy | >80% | AI suggestions confirmed by users |
| Governance backlog | <30 days | Time from proposal to decision |

---

## Appendix: Individual Analysis Files

The full analyses from each perspective are available at:
- [Systems Architect Analysis](analysis/systems-architect-analysis.md)
- [Product Designer Analysis](analysis/product-designer-analysis.md)
- [Network Economist Analysis](analysis/network-economist-analysis.md)
- [Devil's Advocate Analysis](analysis/devils-advocate-analysis.md)

---

*This findings document synthesises four independent analyses. Points of agreement represent high-confidence recommendations. Points of tension represent design decisions requiring stakeholder input.*
