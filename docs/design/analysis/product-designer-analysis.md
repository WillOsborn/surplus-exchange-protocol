# Product Designer Analysis: Capability Taxonomy Architecture

**Perspective**: Product Designer
**Focus**: User experience for capability definition, need expression, and matching
**Date**: 2026-02-12

---

## Executive Summary

From a product design perspective, the capability taxonomy is not primarily a data architecture problem - it is an **interaction design problem**. The taxonomy exists to help humans express what they have and what they need in terms that enable matching.

**Key insight**: The taxonomy should be invisible to users. They should think in terms of their own language ("I need a logo", "I have spare design time") while the system handles translation. The moment we ask users to navigate categories or select from dropdowns, we have failed.

**Recommendation**: A **Semantic Layer** approach with progressive structure emergence. The primary interface should be conversational, with AI-assisted translation happening in the background.

---

## The User Experience Challenge

### Two Distinct Journeys

**Providers**: "I have 20 hours of design time spare" → need to express in matchable terms
**Recipients**: "I need a logo for my business" → may not know "correct" terminology

### The Vocabulary Gap

| What providers say | What recipients search for |
|-------------------|---------------------------|
| "20 hours of design work" | "Logo design" |
| "Legal expertise" | "Review my supplier contract" |
| "Van going to Manchester" | "Move 3 boxes from Leeds" |

The taxonomy must bridge this gap **without requiring either party to learn a new vocabulary**.

---

## Cognitive Load Analysis

| Approach | Provider Load | Recipient Load |
|----------|--------------|----------------|
| Canonical + curated | Medium (pick from list) | Low (browse) |
| Semantic layer | **Very Low** (just describe) | **Very Low** |
| Emergent | Low initially | High (unpredictable) |

**Critical insight from historical research**: LETS failed partly because cognitive burden was placed on users. Sardex succeeded because brokers absorbed the matching complexity.

For SEP, **the AI should absorb the cognitive load**, not the taxonomy structure.

---

## Architecture Evaluation (UX Perspective)

| Architecture | Provider UX | Recipient UX | Cold Start | Error Recovery |
|--------------|-------------|--------------|------------|----------------|
| Canonical + Curated | B- | B+ | D | C |
| Canonical + Extensions | C+ | C | C | C |
| **Semantic Layer** | **A** | **A-** | B | **A-** |
| Emergent | B | D | F | B |
| Hybrid | B- | B- | C+ | B |

---

## Scenario Analysis (UX Focus)

### Scenario A: New Term

**Bad UX**: "I'm not sure we have a category for that... should I flag for governance?"

**Good UX**: AI understands semantic similarity, matches immediately, learns from success.

### Scenario B: Term Collision ("branding")

**Bad UX**: Show multiple providers with confusing category labels

**Good UX**:
```
AI: "Can you tell me more? Are you looking for:
     - A logo or visual mark
     - A complete brand identity
     - Brand strategy and positioning?"
```

Clarifying questions feel like helpful scoping, not category navigation.

### Scenario E: Specificity Mismatch (animated logo)

**Good UX**:
```
AI: "I found several logo designers, but animated logos require
     motion graphics skills. Would you like me to:
     1. Show only providers who do animation
     2. Show all logo designers and ask about animation
     3. Consider a static logo and separate animation?"
```

Be transparent about the gap. A 0.7 match with explanation beats a silent 0.9 match that disappoints.

---

## "I Don't See My Thing" Scenarios

This is the most critical UX failure mode.

### Provider: "I offer something the system doesn't understand"

**Bad**: "Select primary category: Accounting / Finance / Consulting / Other"

**Good**:
```
User: "I provide fractional CFO services to tech startups"

AI: "Interesting! So you're providing part-time, senior-level
     financial leadership. That could help businesses who need:
     - Financial strategy and planning
     - Investor relations and fundraising support
     Is there anything specific you focus on?"
```

### Recipient: "I need something I can't name"

**Bad**: Search box → "online stuff" → 0 results

**Good**: Guided questions that help articulate the need

---

## Progressive Disclosure Strategy

### Phase 1: Maximum Simplicity

**Provider**: Tell us about yourself (conversational) → Review AI summary → Confirm → Done
**Recipient**: Tell us what you need → See AI interpretation → See matches

**What's hidden**: All taxonomy structure, algorithms, confidence scores.

### Phase 2: Reveal on Demand

- "See how your capabilities are categorised" (expandable)
- "Refine your search" (optional structured filters)

### Phase 3: Power User Features

- Structured API for automation
- Custom matching preferences

---

## Onboarding Flow (5 minutes)

1. **IDENTIFY** (30 sec): "I'm a [role] at [company]"
2. **DESCRIBE** (2 min): Tell us about capacity/needs
3. **CONFIRM** (1 min): "Here's what I understood"
4. **PREVIEW** (1 min): See potential matches
5. **ACTIVATE** (30 sec): Go live

**SEP targets**:
- Within 5 minutes: Complete, matchable profile
- Within 24 hours: First potential match
- Within 1 week: First exchange

---

## Error Recovery Patterns

### Misclassification
```
AI: "You can offer: Logo design, Web design, Illustration"
User: "I don't do web design"
AI: "No problem - removed. Anything I missed?"
```

One sentence input, instant update.

### Match Disappointment
```
AI: "How did your exchange with [Provider] go?"
User: "They couldn't do the animation I needed"
AI: "Sorry - I'll be more careful about that distinction.
     Want me to find someone who does animation?"
```

Feedback improves future matching.

---

## Key Recommendations

### For Phase 1

1. **Conversational-first design**: Every interaction starts with natural language
2. **AI interpretation transparency**: Show what AI understood, allow correction
3. **Graceful degradation**: "I'm not sure I understand X - tell me more?"
4. **Match confidence communication**: Show why matches were suggested
5. **Minimal viable taxonomy**: Professional services only, ~100 terms

### For Phase 2

6. **Opt-in structure**: Power users can see taxonomy; never force it
7. **Agent integration**: API accepts both natural language and structured
8. **Learning loops**: Every match (success or failure) improves the system

### Principles

9. **Invisible taxonomy is best taxonomy**: Measure by matching quality, not completeness
10. **Humans in the loop for edge cases**: When AI isn't confident, escalate

---

## Open Questions (User Research Needed)

1. **Confidence threshold**: At what level auto-match vs ask for clarification?
2. **Disambiguation tolerance**: How many questions before users abandon?
3. **Category visibility demand**: Do users want to browse categories?
4. **Cold-start messaging**: What "no matches yet" framing retains users?
