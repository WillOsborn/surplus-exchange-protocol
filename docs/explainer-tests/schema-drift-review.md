# Schema Design Review: Capability Offering Drift Analysis

**Date**: 2026-02-06
**Purpose**: Challenge current schema direction and realign with original design intent
**Action Required**: Either justify current approach with compelling reasoning, or revise to match original principles

---

## Executive Summary

The current `capability-offering.schema.json` appears to have drifted from the core design principles established during the initial exploration phase. This document details the original reasoning, identifies where drift has occurred, and requests explicit justification or correction.

**Key concern**: The schema is trending toward a conventional marketplace/directory model rather than the novel AI-mediated surplus exchange system we designed.

---

## Original Design Principles (Non-Negotiable)

These principles emerged from extensive research into historical complementary currency systems and represent hard-won insights. Any deviation requires compelling justification.

### 1. Subjective Value, Not Shared Currency

**Original reasoning**:
> "Each participant maintains their own sense of balance based on their own valuation, not shared currency or universal exchange rates... Track what you've given (your terms: hours, deliverables). Track what you've received (valued by your needs, not market rates). Self-assess overall balance (net contributor/receiver/even). No external validation required."

**Why this matters**:
- Eliminates valuation arguments that killed LETS systems
- Respects contextual value (desperate need = high subjective value)
- Aligns with surplus framing (anything > nothing = win)
- Mirrors how good B2B relationships already work informally

**Challenge to current schema**: Does the schema inadvertently reintroduce objective valuation through fields like `typical_effort` or `track_record` metrics? Are we creating infrastructure for price comparison when we explicitly rejected that?

### 2. Surplus Frame, Not Market Exchange

**Original reasoning**:
> "Not exchanging 'fair market value' but 'otherwise wasted capacity'... Baseline is 'better than nothing' not 'fair market value'... Anything additional feels like win. Reduces conflict over valuation."

**Why this matters**:
- Historical lesson: pragmatic business tools survive; ideological alternatives stay small
- Surplus framing means we're not competing with existing business
- Removes the psychological burden of "am I getting a fair deal?"
- Positions as "useful tool" not "alternative economy"

**Challenge to current schema**: Does the schema structure imply market-style exchange rather than surplus activation? Are we inadvertently creating a barter marketplace rather than a surplus redistribution layer?

### 3. AI Matching as the Core Innovation

**Original reasoning**:
> "Money solved the matching friction in commerce. AI could solve matching directly... Humans struggle beyond 2-3 parties. AI could identify: Law firm → contract review → restaurant chain → catering → marketing agency → campaign → manufacturer → equipment maintenance → law firm. Everyone benefits, no money, no debt."

**Why this matters**:
- This is the novel contribution - without it, we're just another barter exchange
- Multi-party chains are where AI provides unique value humans can't replicate
- The protocol should be optimised for agent discovery and chain computation

**Challenge to current schema**: Is the schema optimised for AI agent matching and multi-party chain discovery? Or is it optimised for human browsing of a directory? These are fundamentally different structures.

### 4. The Automation Boundary

**Original reasoning**:
> "Automated by agents: Discovery, initial filtering, feasibility checking, multi-party chain finding. Human decisions: Proceed with match, scope confirmation, satisfaction rating, dispute resolution... Speed comes from automation; trust comes from human confirmation."

**Why this matters**:
- Humans in the loop only where trust requires it
- Everything else should be agent-to-agent
- Friction in the wrong places kills adoption

**Challenge to current schema**: Does the schema support rapid agent-to-agent negotiation? Or does it require human interpretation at every step?

### 5. Capability Translation (Surplus → Value)

**Original reasoning**:
> "Having a designer available for 20 hours is the business surplus, but that person could do visual branding, print design, packaging concepts, etc, which is what people need. The MCP-like aspect needs to understand what the surplus can translate into, so that when matches are being made it can find links. It is unlikely that they would find a request for 'X hours of a designer', it's more likely to find a request for some branding work or some print design."

**Why this matters**:
- Surplus (what you have) ≠ Value (what others need)
- The translation layer is essential for matching
- Without it, we're just listing availability, not enabling exchange

**Challenge to current schema**: Does the `capability_mapping` structure adequately capture this translation? Is it structured for agent matching or human reading?

### 6. Physical Goods Complexity

**Original reasoning**:
> "If someone is exchanging an online service for physical materials, they have different characteristics... the physical products might need moving which would have time and cost associated with it. Not that it is still surplus, so the supplier of it can set what they're willing to take on to provide the product, but that needs to be part of the picture. And still important for multiple party matching, possibly even more so if you could find someone with surplus capacity for moving things from one place to another."

**Why this matters**:
- Physical goods introduce location, transport, timing, condition
- Transport itself is a surplus offering that can be matched
- Multi-party chains can include logistics as a matched component

**Challenge to current schema**: Does `physical_details` adequately support transport as a matchable surplus? Or does it treat transport as an external cost/problem?

---

## Specific Schema Concerns

### Concern 1: `track_record` Reintroduces Objective Metrics

Current schema includes:
```json
"track_record": {
  "exchanges_completed": 12,
  "satisfaction_rating": 4.8,
  "repeat_exchange_rate": 0.42,
  "on_time_delivery_rate": 0.92
}
```

**Question**: These metrics are useful for trust, but do they inadvertently create a rating/ranking system that pushes toward marketplace dynamics rather than surplus exchange?

**Original intent for trust**: "Mutual satisfaction ratings post-exchange, network position (are you sought after?), transparent activity patterns (not valuations), referral/vouching by trusted members, graduated exposure (small exchanges → larger as trust builds)."

**Required response**: Justify how `track_record` serves surplus exchange differently than it would serve a marketplace, or propose an alternative trust structure.

### Concern 2: `typical_effort` May Imply Pricing

Current schema includes:
```json
"capability_mapping": [{
  "output": "pitch deck design",
  "typical_effort": "4-8 hours"
}]
```

**Question**: Does `typical_effort` create implicit pricing? If a designer says "pitch deck = 4-8 hours" and an accountant says "VAT return = 2-4 hours", have we accidentally created an exchange rate (1 pitch deck ≈ 2 VAT returns)?

**Original intent**: Each party assesses subjectively whether they're better off. No external comparison needed.

**Required response**: Explain how agents use `typical_effort` without it becoming a price signal, or remove/replace it.

### Concern 3: Schema Optimised for Human Browsing

The current schema reads like a job posting or service directory listing. Fields like `title`, `description`, `status` are human-oriented.

**Question**: Is this structured for AI agent matching or human directory browsing?

**Original intent**: "Ideally, this should be automated because this is where it could slow down if humans handle all of it. It could get caught up in scoping, planning, etc. Ideally it should know roughly what is/isn't possible, and a human only needs to step in for clarifications or for scoping after agreements."

**Required response**: Demonstrate how the current schema enables rapid agent-to-agent matching, or restructure for that purpose.

### Concern 4: Missing Multi-Party Chain Support

The schema describes individual offerings but doesn't obviously support chain discovery.

**Question**: How does an agent use this schema to find A→B→C→D→A loops?

**Original insight**: "Multi-party chains are where AI provides unique value humans can't replicate."

**Required response**: Either show how current schema supports chain discovery, or add structures that enable it.

### Concern 5: Transport Not Modelled as Matchable Surplus

Current `physical_details.transport_included` is boolean - transport is either included or it's the recipient's problem.

**Original insight**: "Possibly even more so if you could find someone with surplus capacity for moving things from one place to another."

**Required response**: How does an agent match transport capacity from a third party into an exchange involving physical goods? The schema should enable:
- Manufacturer in Leeds has surplus materials
- Design agency in Birmingham needs materials
- Logistics company has spare capacity on Leeds→Birmingham route
- All three matched together

---

## Required Actions

### Option A: Justify Current Approach

If the current schema direction is correct, provide explicit reasoning for each concern above. Explain:
1. Why the current approach better serves the original goals
2. What insights led to the departure from original principles
3. How the schema avoids the failure modes we identified in historical systems

### Option B: Revise Schema

If the concerns are valid, revise the schema to:
1. Remove or restructure elements that reintroduce marketplace dynamics
2. Optimise for agent-to-agent matching rather than human browsing
3. Support multi-party chain discovery
4. Model transport as matchable surplus
5. Preserve subjective value principle throughout

### Option C: Propose Alternative

If neither the original principles nor the current schema are quite right, propose a third approach that:
1. Acknowledges the tension
2. Offers a novel resolution
3. Maintains the core innovation (AI-mediated surplus exchange without money)

---

## Context: Why These Principles Matter

The historical research showed clear patterns:

**Systems that survived** (WIR, Sardex, ITEX):
- Professional management, not ideology
- Pragmatic business framing
- Clear accountability mechanisms
- Tax compliance

**Systems that failed** (most LETS, many TimeBank):
- Ideological framing
- Volunteer burnout
- Valuation disputes
- Critical mass never reached

Our design explicitly chose:
- B2B focus (professional accountability)
- Surplus frame (pragmatic, not ideological)
- Subjective value (eliminates disputes)
- Protocol not platform (decentralised resilience)

Any schema that drifts toward "marketplace with barter" rather than "surplus redistribution layer" risks recreating the failure modes we studied.

---

## Appendix: Original Capability Description Concept

From initial exploration:

```yaml
surplus_offering:
  type: "service" | "physical_good" | "access" | "space" | "expertise"
  
  # For services
  service_details:
    available_capacity: "20 hours"
    capability_mapping:
      - output: "pitch deck design"
        typical_effort: "4-8 hours"
        requirements: ["brand guidelines or discovery"]
        deliverables: ["designed slides", "source files"]
      - output: "visual brand identity"
        typical_effort: "15-25 hours"
        requirements: ["discovery session", "competitor examples"]
        deliverables: ["logo", "colour palette", "typography", "guidelines doc"]
    skillset_boundaries: ["no motion", "no development", "no UX research"]
    delivery_method: "remote"
    lead_time: "2 weeks preferred"
```

Note: This was a starting sketch, not a final design. The question is whether the current schema has improved on this or drifted from the intent.

---

## Response Required

Please provide a structured response addressing:

1. **Acknowledgment**: Do you agree drift has occurred, or do you believe the current approach is faithful to original intent?

2. **For each concern raised**: Either justify the current approach or propose a revision

3. **Recommendation**: Which option (A, B, or C) do you recommend, and why?

4. **Next steps**: What specific changes, if any, should be made?

The goal is not to be dogmatic about the original design, but to ensure any evolution is deliberate and justified rather than accidental drift toward familiar patterns.
