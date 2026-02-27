# Schema Drift Review Response

**Date**: 2026-02-06
**Purpose**: Address each concern raised in the schema-drift-review.md
**Recommendation**: Option B (Revise Schema) with specific changes outlined below

---

## 1. Acknowledgment

**Yes, drift has occurred.**

Reading back through the original design documents and comparing them to what we've built, I can see several places where we've inadvertently moved toward familiar marketplace patterns rather than staying true to the novel surplus exchange concept.

The drift wasn't intentional malice—it's the natural gravity of known patterns. When building schemas, it's easy to reach for "how would a marketplace do this?" rather than asking "what does a surplus redistribution layer need?"

---

## 2. Response to Each Concern

### Concern 1: `track_record` Reintroduces Objective Metrics

**Current state**: The `capability-offering.schema.json` includes:
```json
"track_record": {
  "exchanges_completed": 12,
  "satisfaction_rating": 4.8,
  "repeat_exchange_rate": 0.42,
  "on_time_delivery_rate": 0.92
}
```

**Verdict**: **DRIFT HAS OCCURRED** - but partially justified.

**The problem**: These metrics, especially `satisfaction_rating` as a 0-5 scale, read like Amazon/Uber ratings. They invite comparison and create implicit ranking—exactly what we wanted to avoid.

**What's justified**:
- Trust signals ARE needed—the original design explicitly said: "Mutual satisfaction ratings post-exchange, network position, transparent activity patterns."
- The question is presentation, not existence.

**Proposed revision**:
1. Remove `satisfaction_rating` as a numeric score from offerings
2. Move trust signals to `trust-profile.schema.json` only (where they already live properly)
3. The offering itself should NOT carry trust metrics—that conflates "what I offer" with "how reliable I am"
4. Trust assessment happens at the participant level, fed into matching algorithm, but not displayed as a "rating" on individual offerings

**Rationale**: An offering is "I have 20 hours of design capacity that could become pitch decks." Trust is "This participant has completed 12 chains with 92% satisfaction." These are separate concepts. Putting ratings on offerings turns them into product listings.

---

### Concern 2: `typical_effort` May Imply Pricing

**Current state**:
```json
"capability_mapping": [{
  "output": "pitch deck design",
  "typical_effort": "4-8 hours"
}]
```

**Verdict**: **NUANCED** - This serves matching, but framing matters.

**The concern is valid**: If everyone publishes effort estimates, implicit exchange rates emerge. "Your 8-hour pitch deck for my 4-hour VAT return" becomes a negotiation.

**However, the original design included this**:
```yaml
capability_mapping:
  - output: "pitch deck design"
    typical_effort: "4-8 hours"
```

**The distinction**: `typical_effort` is for **capacity planning**, not valuation.

When AI agents are matching chains, they need to know:
- Alice has 20 hours of design capacity
- A pitch deck typically consumes 4-8 hours of that capacity
- Therefore, Alice's surplus could produce ~3 pitch decks this month

This is **feasibility checking**, not pricing.

**Proposed revision**:
1. Keep `typical_effort` but rename to `capacity_consumption` or `typical_duration`
2. Add explicit schema documentation: "Used for feasibility matching, not valuation. Participants assess subjective value independently."
3. **Critical**: This field is for **agent matching**, not human display. It shouldn't appear in any "marketplace browse" interface—only used computationally.

**The safeguard**: As long as subjective value assessment remains at the participant level ("Is this worth it to me?"), effort estimates for matching don't create exchange rates. The problem would be if we displayed "4 hours of design = 2 hours of accounting" anywhere.

---

### Concern 3: Schema Optimised for Human Browsing

**Current state**: Fields like `title`, `description`, `status` are human-oriented.

**Verdict**: **DRIFT HAS OCCURRED** - and this is a real problem.

**The evidence**:
- The need schema has `title` (human-readable label)
- Both schemas have `description` (human prose)
- We have `visibility: "public"` suggesting browsable directory

**Original intent**:
> "Ideally, this should be automated because this is where it could slow down if humans handle all of it."

**The tension**: We need SOME human-readable content because:
1. Humans confirm matches proposed by agents
2. Humans scope and negotiate after match discovery
3. Humans rate satisfaction

But the PRIMARY consumer of these schemas should be AI agents, not humans browsing a directory.

**Proposed revision**:

1. **Add agent-optimised fields alongside human fields**:
```json
{
  "title": "Senior brand designer availability",
  "description": "20 hours of experienced design capacity...",
  "agent_summary": {
    "capability_outputs": ["pitch_deck", "brand_identity", "packaging"],
    "capacity_units": 20,
    "capacity_unit_type": "hours",
    "sector_tags": ["professional_services", "creative"],
    "constraint_flags": ["remote_only", "uk_preferred"]
  }
}
```

2. **Make the intent explicit**: Human fields are for confirmation/scoping. Agent fields are for matching.

3. **Remove or de-emphasise browse/directory affordances**: No "marketplace listing" patterns.

---

### Concern 4: Missing Multi-Party Chain Support

**Current state**: Schemas describe individual offerings/needs. Chain discovery happens in the matching algorithm.

**Verdict**: **PARTIALLY ADDRESSED** - but could be clearer.

**What we have**:
- `exchange-chain.schema.json` models chains with multiple edges
- The matching algorithm in `src/matching/cycles.ts` finds A→B→C→D→A loops
- We demonstrated 50+ viable chains in the match demo

**What's missing**:
- Offerings/needs don't signal "chain-friendliness"
- No field for "I'm okay being in a 4-party chain" at the offering level
- Transport isn't modelled as a matchable service that can be **inserted** into chains

**Proposed revision**:

1. Add to offering constraints:
```json
"chain_participation": {
  "max_chain_length": 6,
  "min_chain_length": 2,
  "can_be_intermediate": true
}
```

2. Add offering type `"transport"` or include transport as a capability mapping output:
```json
"capability_mapping": [{
  "output": "goods_transport",
  "route": { "from": "Leeds", "to": "Birmingham" },
  "capacity": "1 pallet",
  "timing": "weekly_tuesday"
}]
```

This allows the matching algorithm to find: `Manufacturer(Leeds) → Transport(Leeds→Birmingham) → Agency(Birmingham)`.

---

### Concern 5: Transport Not Modelled as Matchable Surplus

**Current state**: `transport_included: boolean` - transport is either bundled or "your problem."

**Verdict**: **SIGNIFICANT GAP** - this contradicts original insight.

**Original insight**:
> "Possibly even more so if you could find someone with surplus capacity for moving things from one place to another."

Transport as matchable surplus is **core to the value proposition**. A manufacturer with surplus materials in Leeds, a design agency needing materials in Birmingham, and a logistics company with spare capacity on that route—all three matched together—is exactly the kind of chain humans can't find but AI can.

**Proposed revision**:

1. **Add `transport` as a first-class offering type** (or model it as a service capability):
```json
{
  "type": "service",
  "service_details": {
    "capability_mapping": [{
      "output": "logistics_transport",
      "route_from": { "city": "Leeds", "country": "UK" },
      "route_to": { "city": "Birmingham", "country": "UK" },
      "capacity": { "weight": "500kg", "volume": "2 cubic metres" },
      "frequency": "twice weekly"
    }]
  }
}
```

2. **Modify `physical_details` to support transport matching**:
```json
"physical_details": {
  "location": { "city": "Leeds" },
  "transport_included": false,
  "transport_matchable": true,
  "transport_requirements": {
    "destination": { "city": "Birmingham" },
    "weight": "200kg",
    "timing_flexibility": "within 2 weeks"
  }
}
```

3. **Update matching algorithm** to recognise transport edges and insert them into physical goods chains.

---

## 3. Recommendation: Option B (Revise Schema)

The current schema has drifted toward marketplace patterns in several ways:

| Issue | Severity | Action |
|-------|----------|--------|
| Track record on offerings | Medium | Move to trust profile only |
| Implied pricing via effort | Low | Rename field, add documentation |
| Human-browse optimisation | High | Add agent-optimised fields |
| Chain participation signals | Medium | Add to offering constraints |
| Transport not matchable | High | Add transport as offering type |

I recommend revising the schemas rather than justifying the current state.

---

## 4. Specific Next Steps

### Immediate (Schema Changes)

1. **Remove `track_record` from `capability-offering.schema.json`**
   - Trust lives in `trust-profile.schema.json` at participant level
   - Offerings describe capacity, not reputation

2. **Rename `typical_effort` to `capacity_consumption`**
   - Add documentation clarifying it's for agent matching, not valuation

3. **Add `agent_summary` block to both offering and need schemas**
   - Structured data optimised for algorithmic matching
   - Separate from human-readable title/description

4. **Add `chain_participation` preferences to offering constraints**
   - `max_chain_length`, `can_be_intermediate`

5. **Model transport as matchable surplus**
   - Either add `transport` type or model as service capability
   - Add `transport_requirements` to physical goods needing delivery
   - Update matching algorithm to insert transport edges

### Follow-Up (Implementation)

6. **Update TypeScript types** (`npm run generate:types`)

7. **Update matching algorithm** to:
   - Use agent_summary fields for faster matching
   - Recognise and insert transport offerings into physical goods chains

8. **Update demo scripts** to demonstrate:
   - Transport matching in physical goods chains
   - Longer chains (4-5 party) with clear value demonstration

---

## 5. Philosophical Alignment Check

Before implementing, let me verify we're aligned on core principles:

| Principle | Current State | After Revision |
|-----------|---------------|----------------|
| Subjective value | Mostly preserved | Strengthened (remove rating display) |
| Surplus frame | Present but weak | Unchanged |
| AI matching as core | Partial | Strengthened (agent_summary) |
| Automation boundary | Correct | Unchanged |
| Capability translation | Present | Unchanged |
| Transport as surplus | Missing | Added |

The revisions strengthen alignment with original intent without requiring fundamental redesign.

---

## 6. What We Got Right

Not everything drifted. Some things are well-aligned:

1. **Trust tier system** (`probationary` → `established` → `anchor`) - exactly as designed
2. **Vouching with accountability** - sponsors affected by sponsored behaviour
3. **Exposure limits** - graduated by tier, prevents over-extension
4. **Multi-party cycle detection** - the matching algorithm finds A→B→C→D→A loops
5. **Satisfaction signals, not ratings** - trust-profile uses satisfaction counts, not 5-star scores
6. **Chain state machine** - proper lifecycle management

The core innovation (AI-mediated multi-party surplus exchange) is intact. The drift is primarily in schema presentation, not system architecture.

---

## Summary

**Drift occurred** in how we structured offering/need schemas—they trend toward marketplace listings rather than agent-matchable surplus descriptions.

**Root cause**: Familiar patterns are gravitationally attractive when building schemas.

**Solution**: Revise schemas to add agent-optimised structures, remove marketplace affordances, and properly model transport as matchable surplus.

**Impact**: Moderate refactoring of schemas and matching algorithm. Core trust system and chain mechanics remain unchanged.

**Next step**: Your approval to proceed with the schema revisions outlined above.

---

## User Feedback (2026-02-06)

### Concern 1: Agreed
Proceed with removing track_record from offerings.

### Concern 2: Agreed with Addition
The "human in the loop" aspect is important here. In the Alice example (designer with 20 hours capacity), either Alice or a Resourcing Manager would review and approve whether Alice's capacity actually translates to the incoming request. This:
- Reduces risk of agents misunderstanding skills, capacity, etc.
- Prevents unsuitable matches from being created
- Keeps humans in confirmation role as per automation boundary

**Action**: Keep `capacity_consumption` (renamed from `typical_effort`) but ensure the schema/documentation makes clear this is:
1. For capacity planning (agent matching)
2. Subject to human confirmation before commitment
3. Not a valuation mechanism

### Concern 3: Agreed
Proceed with adding agent-optimised fields.

### Concern 4: Agreed
Proceed with chain participation preferences.

### Concern 5: Agreed
Proceed with modelling transport as matchable surplus.

### Recommendations: Agreed
Revise schemas to better fit original intention.

### Philosophical Alignment: Strengthen Surplus Frame
The surplus frame could be strengthened—it is currently weak. Consider how to make "otherwise wasted capacity" more central to the schema design.

### What We Got Right: Confirmed
Core architecture is sound.

---

## Revised Next Steps

Based on feedback, proceed with schema revisions:

1. Remove `track_record` from offerings
2. Rename `typical_effort` → `capacity_consumption`, add human confirmation documentation
3. Add `agent_summary` blocks for algorithmic matching
4. Add `chain_participation` preferences
5. Model transport as matchable surplus
6. **NEW**: Strengthen surplus framing throughout schemas
