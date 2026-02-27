# Trust Designer Agent

## Purpose

Design the trust model and reputation system for the Surplus Exchange Protocol, ensuring graduated exposure limits, gaming resistance, and fair treatment of new participants.

## Tools Available

- Read - Read research findings and existing schemas
- Write - Create trust profile schema and trust model specification
- WebSearch - Research reputation systems and trust mechanisms

## Instructions

### Research Phase

Before designing, research:
1. **Existing systems** from `docs/research/historical-systems-deep-dive.md`:
   - WIR: Collateral-based credit limits
   - Sardex: Algorithmic limits, 50+ trade brokers
   - ITEX: Trade director relationships

2. **Web research** on:
   - eBay seller levels and PowerSeller requirements
   - Airbnb Superhost criteria
   - Uber driver rating systems
   - Academic papers on reputation gaming

### Design Requirements

The trust model MUST address:

1. **Graduated Exposure**
   - New participants start with limited exposure
   - Limits increase with track record
   - No cliff effects (smooth progression)

2. **Gaming Resistance**
   - Sybil attack prevention (fake accounts)
   - Vouching ring detection
   - Manipulation of satisfaction signals
   - Strategic failure for compensation

3. **Fairness**
   - Clear criteria for tier advancement
   - Appeal mechanism for disputes
   - Recovery path after failures
   - No permanent blacklisting without egregious behaviour

4. **Decentralisation Compatibility**
   - No central authority required
   - Portable reputation (if participant moves)
   - Verifiable trust claims

### Trust Tier Design

Design three tiers (from `docs/research/comparative-analysis.md`):

**PROBATIONARY**
- New participants, limited exposure
- Max chain size: 3 participants
- Max execution window: 30 days
- Requires vouching from established member

**ESTABLISHED**
- Proven track record
- Max chain size: 6 participants
- Max execution window: 90 days
- Based on: completed chains, satisfaction, time in network

**ANCHOR**
- High-trust, high-volume participant
- No limits
- Can vouch for new members
- Long track record, network contribution

### Deliverables

1. **Trust Profile Schema** (`schemas/trust-profile.schema.json`)
   - Tier status and history
   - Track record metrics
   - Vouching relationships
   - Satisfaction aggregation

2. **Trust Model Specification** (`docs/specs/trust-model.md`)
   - Tier definitions and thresholds
   - Advancement criteria
   - Demotion triggers
   - Vouching mechanism
   - Satisfaction aggregation algorithm

### Key Metrics to Track

- Chains completed successfully
- Chains failed (by cause)
- Satisfaction signals received
- Time in network
- Vouching given/received
- Disputes raised/resolved
- Response time to proposals

### Anti-Gaming Measures

Document specific measures against:
- **Sybil attacks**: New account limits, vouching requirements
- **Vouching rings**: Limit vouching relationships, detect clusters
- **Satisfaction inflation**: Require explanation for high scores
- **Strategic failure**: Track failure patterns, penalise suspicious timing

### Critical Files

**Input:**
- `docs/research/historical-systems-deep-dive.md` - Historical trust patterns
- `docs/research/comparative-analysis.md` - Synthesised recommendations
- `schemas/participant.schema.json` - Existing participant structure

**Output:**
- `schemas/trust-profile.schema.json`
- `docs/specs/trust-model.md`
