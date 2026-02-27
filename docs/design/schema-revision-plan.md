# Schema Revision Plan

**Status**: In Progress
**Last Updated**: 2026-02-12
**Purpose**: Realign schemas with original design intent following drift review

---

## Overview

This plan addresses the schema drift identified in the review, with six specific changes to better align with the original Surplus Exchange Protocol design principles.

---

## Change 1: Remove `track_record` from Offerings

**File**: `schemas/capability-offering.schema.json`

**Current state**:
```json
"track_record": {
  "exchanges_completed": 12,
  "satisfaction_rating": 4.8,
  "repeat_exchange_rate": 0.42,
  "on_time_delivery_rate": 0.92
}
```

**Action**: Remove entirely from offering schema.

**Rationale**:
- Trust metrics belong at participant level (already in `trust-profile.schema.json`)
- Putting ratings on offerings creates marketplace/directory pattern
- An offering describes surplus capacity, not reputation

**Impact**:
- Update any example JSON files
- No TypeScript implementation uses this field yet

---

## Change 2: Rename `typical_effort` and Add Human Confirmation Context

**File**: `schemas/capability-offering.schema.json`

**Current state**:
```json
"capability_mapping": [{
  "output": "pitch deck design",
  "typical_effort": "4-8 hours"
}]
```

**Revised state**:
```json
"capability_mapping": [{
  "output": "pitch deck design",
  "capacity_consumption": {
    "estimate": "4-8 hours",
    "unit": "hours",
    "confidence": "typical",
    "requires_confirmation": true
  }
}]
```

**New field documentation**:
```
"capacity_consumption": {
  "description": "Estimated capacity required to produce this output. Used by agents for feasibility matching, NOT for valuation. Subject to human confirmation before any commitment is made. The provider (or their resource manager) must approve that their capacity can deliver the specific request.",
  ...
}
```

**Key addition**: `requires_confirmation: true` makes explicit that a human must validate the capacity-to-output translation before commitment.

**Rationale**:
- Preserves agent matching capability
- Makes human-in-loop explicit
- Prevents misunderstanding of skills/capacity
- Clear it's not a pricing mechanism

---

## Change 3: Add `capability_matching` for Algorithmic Matching

**Files**: `schemas/capability-offering.schema.json`, `schemas/need.schema.json`

**New structure for offerings**:
```json
"capability_matching": {
  "type": "object",
  "description": "Structured data optimised for agent-to-agent matching. Human-readable fields (title, description) are for confirmation/scoping after match discovery.",
  "properties": {
    "capability_outputs": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Normalised list of outputs this surplus can produce"
    },
    "capacity_available": {
      "type": "object",
      "properties": {
        "amount": { "type": "number" },
        "unit": { "type": "string", "enum": ["hours", "days", "units", "projects"] }
      }
    },
    "sector_tags": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Sectors this surplus applies to"
    },
    "constraint_flags": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Quick-filter flags like 'remote_only', 'uk_only', 'perishable'"
    },
    "chain_compatible": {
      "type": "boolean",
      "description": "Whether this can be matched as part of multi-party chains"
    }
  }
}
```

**New structure for needs**:
```json
"capability_matching": {
  "type": "object",
  "description": "Structured data for agent matching against offerings",
  "properties": {
    "capability_sought": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Capability outputs that would fulfil this need"
    },
    "sector_tags": {
      "type": "array",
      "items": { "type": "string" }
    },
    "constraint_flags": {
      "type": "array",
      "items": { "type": "string" }
    },
    "chain_acceptable": {
      "type": "boolean",
      "description": "Whether fulfilment via multi-party chain is acceptable"
    },
    "max_chain_length": {
      "type": "integer",
      "minimum": 2,
      "maximum": 10
    }
  }
}
```

**Rationale**:
- Separates agent-matching data from human-readable content
- Enables faster algorithmic matching
- Makes clear which fields are for which purpose

---

## Change 4: Add Chain Participation Preferences

**File**: `schemas/capability-offering.schema.json`

**Add to constraints**:
```json
"chain_participation": {
  "type": "object",
  "description": "Preferences for multi-party exchange chain participation",
  "properties": {
    "max_chain_length": {
      "type": "integer",
      "minimum": 2,
      "maximum": 10,
      "default": 6,
      "description": "Maximum chain length this offering can participate in"
    },
    "min_chain_length": {
      "type": "integer",
      "minimum": 2,
      "default": 2,
      "description": "Minimum chain length (2 = direct exchange acceptable)"
    },
    "can_be_intermediate": {
      "type": "boolean",
      "default": true,
      "description": "Whether this offering can be matched as an intermediate step (not direct provider to end recipient)"
    },
    "prefers_direct": {
      "type": "boolean",
      "default": false,
      "description": "Preference for direct over chain matches (chains still acceptable)"
    }
  }
}
```

**Rationale**:
- Enables matching algorithm to respect participant preferences
- Some providers may prefer direct relationships
- Some may be happy being part of longer chains

---

## Change 5: Model Transport as Matchable Surplus

**File**: `schemas/capability-offering.schema.json`

### 5a: Add `transport` as service capability output

Transport can be modelled as a service offering with specific capability mapping:

```json
{
  "type": "service",
  "title": "Spare logistics capacity - Leeds to Birmingham corridor",
  "service_details": {
    "available_capacity": "500kg per week",
    "capability_mapping": [{
      "output": "goods_transport",
      "route": {
        "from": { "city": "Leeds", "region": "West Yorkshire", "country": "UK" },
        "to": { "city": "Birmingham", "region": "West Midlands", "country": "UK" }
      },
      "capacity_per_trip": { "weight": "500kg", "volume": "2 cubic metres" },
      "frequency": "twice weekly",
      "capacity_consumption": {
        "estimate": "1 trip",
        "unit": "trips",
        "requires_confirmation": true
      }
    }]
  }
}
```

### 5b: Add transport matching fields to physical goods

**Add to `physicalDetails`**:
```json
"transport_matching": {
  "type": "object",
  "description": "Information for matching transport surplus to this physical goods offering",
  "properties": {
    "origin": {
      "type": "object",
      "properties": {
        "city": { "type": "string" },
        "region": { "type": "string" },
        "country": { "type": "string" },
        "coordinates": {
          "type": "object",
          "properties": {
            "lat": { "type": "number" },
            "lon": { "type": "number" }
          }
        }
      }
    },
    "transport_required": {
      "type": "boolean",
      "description": "Whether transport to recipient is needed (vs collection)"
    },
    "transport_matchable": {
      "type": "boolean",
      "description": "Whether a third-party transport surplus can be matched to move these goods"
    },
    "transport_requirements": {
      "type": "object",
      "properties": {
        "weight": { "type": "string" },
        "volume": { "type": "string" },
        "handling": { "type": "string", "enum": ["standard", "fragile", "temperature_controlled", "hazardous"] },
        "timing_flexibility": { "type": "string" }
      }
    }
  }
}
```

### 5c: Add to needs schema for physical goods

**Add to `physicalNeedDetails`**:
```json
"transport_matching": {
  "type": "object",
  "properties": {
    "destination": {
      "type": "object",
      "properties": {
        "city": { "type": "string" },
        "region": { "type": "string" },
        "country": { "type": "string" }
      }
    },
    "can_collect": { "type": "boolean" },
    "collection_radius_km": { "type": "number" },
    "accepts_transport_chain": {
      "type": "boolean",
      "description": "Whether recipient accepts goods delivered via matched transport surplus"
    }
  }
}
```

**Rationale**:
- Transport is surplus capacity that can be matched like any other
- Enables chains like: Manufacturer(Leeds) → Transport(Leeds→Bham) → Agency(Bham)
- Core to original vision of multi-party matching

---

## Change 6: Strengthen Surplus Framing

**All schemas**

### 6a: Add `surplus_context` to offerings

```json
"surplus_context": {
  "type": "object",
  "description": "Context establishing this as otherwise-wasted capacity, not market inventory",
  "properties": {
    "why_surplus": {
      "type": "string",
      "maxLength": 500,
      "description": "Why this capacity would otherwise go unused (e.g., 'Designer between projects', 'Excess stock from cancelled order', 'Vehicle returning empty')"
    },
    "alternative_fate": {
      "type": "string",
      "enum": ["unused", "discounted_sale", "disposal", "depreciation", "opportunity_cost"],
      "description": "What would happen to this capacity without SEP"
    },
    "time_sensitivity": {
      "type": "string",
      "enum": ["none", "weeks", "days", "hours"],
      "description": "How quickly this surplus loses value if not activated"
    }
  }
}
```

### 6b: Update schema descriptions

Change offering schema description from:
> "Describes surplus capacity and what it can translate into for matching purposes"

To:
> "Describes otherwise-wasted capacity (surplus) and what value it could create if activated. SEP matches surplus to needs—the baseline is 'better than nothing', not 'fair market value'. Any activation of surplus is a win."

### 6c: Add surplus-frame documentation block

```json
"_design_principles": {
  "type": "object",
  "description": "SCHEMA DESIGN NOTE: This offering represents SURPLUS—capacity that would otherwise go unused. It is NOT inventory for sale. Participants assess subjective value independently; there are no exchange rates. The goal is activation of waste, not marketplace transaction.",
  "const": {}
}
```

**Rationale**:
- Makes surplus frame explicit in schema itself
- `why_surplus` forces participants to think in surplus terms
- `alternative_fate` reinforces "anything > nothing" baseline

---

## Implementation Sequence

1. **Schema updates** (capability-offering.schema.json, need.schema.json)
2. **Regenerate TypeScript types** (`npm run generate:types`)
3. **Update example JSON files** to match new schema
4. **Update matching algorithm** to use `capability_matching` fields
5. **Update matching algorithm** to insert transport edges
6. **Update demos** to showcase transport matching and surplus framing
7. **Validate** (`npm run validate:examples`)
8. **Build and test** (`npm run build && npm run match`)

---

## Validation Criteria

After implementation:

- [x] `track_record` removed from offerings
- [x] `capacity_consumption` replaces `typical_effort` with confirmation flag
- [x] `capability_matching` present on offerings and needs
- [x] `chain_participation` preferences available
- [x] Transport modellable as matchable surplus
- [x] `surplus_context` captures why capacity is surplus
- [x] All examples validate against updated schemas
- [x] Matching demo still works (and demonstrates transport chains)
- [x] Build passes

**Implementation completed**: 2026-02-06

---

## Questions - Resolved

1. **Should `capability_matching` be required or optional?**

   **Answer**: Required at the point an agent begins searching, but not required for human input. Humans fill what they can, AI enriches with additional information from context and pre-set data. This is a **computed/enriched field** - schema marks it required, but the system populates it from human input + AI inference.

2. **Transport as service capability or separate type?**

   **Answer**: Transport as service capability with `goods_transport` output. No new type needed.

3. **Should `why_surplus` be required?**

   **Answer**: Optional. Not always relevant or needed.

---

## Approval

**APPROVED** - Proceed with implementation.
