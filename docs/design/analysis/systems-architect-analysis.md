# Systems Architect Analysis: Capability Taxonomy Architecture

**Perspective**: Systems Architect
**Focus Areas**: Technical scalability, data structures, versioning, matching algorithm integration, query performance
**Date**: 2026-02-12

---

## Executive Summary

From a systems architecture perspective, the capability taxonomy must solve three interrelated technical challenges:

1. **Matching Performance**: Enable sub-second matching across potentially millions of offerings and needs
2. **Evolution Management**: Support taxonomy changes without breaking existing data or forcing mass migrations
3. **Semantic Flexibility**: Bridge the gap between human language variability and machine-matchable structures

My analysis concludes that a **Hybrid Architecture** (Canonical core + Semantic layer + Emergent learning) offers the best balance of performance, evolvability, and practical deployability.

---

## Architecture Option Evaluation

### Option 1: Canonical + Curated Taxonomy

**Scalability Assessment**:

| Metric | Phase 1 (10 sectors) | Phase 2 (50 sectors) | Phase 3 (100+ sectors) |
|--------|-----------------|-----------------|-------------------|
| Taxonomy nodes | ~200 | ~1,000 | ~3,000+ |
| Query complexity | O(log n) | O(log n) | O(log n) |
| Governance overhead | Manageable | Significant | Potentially blocking |

**Strengths**: Predictable query performance, clear data model, deterministic matching
**Weaknesses**: Governance bottleneck at scale, term collision risk, coverage gaps

**Recommended for**: Phase 1 only, if governance capacity is available.

### Option 2: Canonical + Extensions

**Scalability Assessment**:

| Metric | Phase 1 | Phase 2 | Phase 3 |
|--------|---------|---------|---------|
| Core taxonomy nodes | ~100 | ~200 | ~300 |
| Extension nodes | ~100 | ~2,000 | ~20,000+ |
| Cross-walk entries | ~50 | ~1,000 | ~10,000+ |

**Strengths**: Governance scales, regional customisation, federation-friendly
**Weaknesses**: Cross-walk maintenance, discovery fragmentation, version drift

**Recommended for**: Phase 2+ in federated deployment model.

### Option 3: Semantic Layer (Embeddings)

**Scalability Assessment**:

| Metric | Phase 1 | Phase 2 | Phase 3 |
|--------|---------|---------|---------|
| Embeddings stored | ~5,000 | ~500,000 | ~5,000,000 |
| Vector index size | ~40MB | ~4GB | ~40GB |
| Query latency (HNSW) | <10ms | <50ms | <100ms |

**Strengths**: Zero governance, fuzzy matching native, language-agnostic
**Weaknesses**: Opacity, model dependency, threshold tuning, cold start

**Recommended for**: Phase 2+ as supplement to structured taxonomy.

### Option 4: Emergent Taxonomy

**Strengths**: Zero upfront work, organic evolution
**Weaknesses**: Cold start is terrible, garbage in/garbage out, slow convergence

**Recommended for**: Phase 3+ as learning layer on top of structured base.

### Option 5: Hybrid Architecture (Recommended)

**Three-Layer Data Model**:

```
Layer 1: Canonical Core (stable, small, governance-controlled)
  - ~100-200 terms covering major categories
  - Query performance: O(1) hash lookup

Layer 2: Extension + Cross-Walk (federation-managed)
  - Regional/domain-specific vocabularies
  - AI-assisted cross-walk generation
  - Materialised equivalence classes

Layer 3: Semantic Matching (AI-powered, fuzzy)
  - Embeddings for all descriptions
  - Kicks in when Layer 1+2 don't produce matches
  - Confidence scores guide human review

Emergent: Learning Loop (background, advisory)
  - Track term usage and successful matches
  - Suggest new canonical terms quarterly
```

---

## Scenario Analysis

### Scenario A: New Term Introduction

"AI prompt engineering services" offered; "help writing prompts for ChatGPT" needed

| Architecture | Time to Match | Quality |
|--------------|---------------|---------|
| Canonical+Curated | Weeks | Perfect after added |
| Canonical+Extensions | Hours | Good |
| Semantic Layer | Immediate | ~85% accurate |
| **Hybrid** | Immediate | Good + improving |

### Scenario B: Term Collision

"Branding" = logo only vs. full identity system

**Hybrid Solution**: Sub-terms resolve ambiguity (`branding/logo_only` vs `branding/full_identity`) with UI clarification prompts.

### Scenario C: Cross-Domain Capability

"Marketing strategy consulting" - multi-parenting with primary category and GIN-indexed ancestors for O(log n) queries.

### Scenario D: Regional Variance

UK "solicitor" = US "attorney" - Extension cross-walks with confidence scores.

### Scenario E: Specificity Mismatch

Taxonomy has `logo_design`; need is "animated logo" - Semantic layer boosts offerings with animation keywords.

---

## Technical Implementation

### Database Schema (PostgreSQL + pgvector)

- `taxonomy_nodes`: Core taxonomy with synonyms, versions, deprecation tracking
- `extensions`: Namespace management for federation
- `extension_mappings`: Cross-walk table with confidence scores
- `equivalence_classes`: Materialised for query performance
- `capability_embeddings`: Vector storage with model versioning

### Query Performance Estimates

| Query Type | Phase 1 (1K) | Phase 2 (100K) | Phase 3 (1M) |
|------------|---------|-----------|---------|
| Canonical exact | <5ms | <10ms | <20ms |
| Canonical + extensions | <10ms | <30ms | <50ms |
| Semantic similarity | <50ms | <100ms | <200ms |
| Full hybrid | <100ms | <200ms | <500ms |

### Key Technical Decisions

| Decision | Recommendation | Rationale |
|----------|----------------|-----------|
| Embedding model | OpenAI text-embedding-3-small | Good quality, stable API |
| Vector database | PostgreSQL + pgvector | No additional infrastructure |
| Version format | Semantic versioning | Clear compatibility rules |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Governance bottleneck | High at scale | High | Extensions + AI-assisted curation |
| Cross-walk inconsistency | Medium | Medium | Confidence scores, validation jobs |
| Embedding model change | Medium | High | Version tracking, parallel embeddings |
| Cold start failures | Certain | High | Pre-seed with external taxonomies |

---

## Recommendations

1. **Phase 1**: Define canonical taxonomy (~100 terms, 5-6 sectors)
2. **Phase 1**: Implement basic synonym matching in scorer.ts
3. **Phase 1+**: Add embedding generation for semantic fallback
4. **Phase 2**: Design extension namespace schema
5. **Phase 2**: Build AI cross-walk suggestion system
6. **Phase 3**: Implement learning loop

**What Not To Do**:
- Don't build perfect taxonomy before Phase 1: Ship with 80% coverage
- Don't rely on semantic alone: Humans need explainability
- Don't centralise all governance: Extensions enable self-organisation
