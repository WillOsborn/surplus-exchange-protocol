# Compare Schemas

Compare schema designs from different systems against SEP requirements.

## Description

Use this skill to evaluate how external systems represent needs, offerings, or exchanges and assess how those approaches might apply to SEP. Produces structured comparison tables and recommendations.

## Usage

```
/compare-schemas [topic]
```

**Examples:**
- `/compare-schemas need representation` — Compare how different systems structure need/want declarations
- `/compare-schemas execution states` — Compare state machines for transaction execution
- `/compare-schemas capability description` — Compare how systems describe what participants can offer
- `/compare-schemas trust metrics` — Compare reputation/trust systems across platforms

## Workflow

### Step 1: Identify Comparison Dimensions

For any schema comparison, assess across these dimensions:

| Dimension | Description | SEP Relevance |
|-----------|-------------|---------------|
| **Expressiveness** | What can be represented? | Must handle service, physical_good, access, space |
| **Simplicity** | How easy to create/understand? | B2B users need low friction |
| **Matching Efficiency** | How well does it enable automated matching? | AI-mediated matching is core value |
| **Extensibility** | Can it grow without breaking? | Protocol must evolve |
| **Privacy** | What is exposed to whom? | Competitive sensitivity in B2B |
| **Interoperability** | Works across implementations? | Protocol not platform |

### Step 2: Map to SEP Requirements

**For needs schema comparisons:**
- Categories: service, physical_good, access, space
- Urgency levels without price signals
- Geographic and timing constraints
- Visibility controls (network-wide, sector-only, private)
- Explicit vs inferred source distinction

**For execution protocol comparisons:**
- State transitions: proposed → confirming → committed → executing → completed
- Multi-party coordination (not just bilateral)
- Failure handling and cascade prevention
- Dispute resolution mechanisms
- Physical goods logistics integration

**For trust/reputation comparisons:**
- Three-layer model: verifiable identity, network position, satisfaction signals
- No numeric scores (to prevent gaming)
- Newcomer pathway support
- Cross-implementation portability

### Step 3: Document Trade-offs

For each approach evaluated, document:

```markdown
### [System/Approach Name]

**What it does well:**
- [strength 1]
- [strength 2]

**What it does poorly:**
- [weakness 1]
- [weakness 2]

**Context where it shines:**
- [scenario]

**Context where it fails:**
- [scenario]

**Adaptation required for SEP:**
- [modification needed]
```

### Step 4: Produce Comparison Table

Create a structured comparison:

```markdown
| Dimension | System A | System B | System C | SEP Recommendation |
|-----------|----------|----------|----------|-------------------|
| Expressiveness | [rating + note] | [rating + note] | [rating + note] | [choice] |
| Simplicity | [rating + note] | [rating + note] | [rating + note] | [choice] |
| Matching Efficiency | [rating + note] | [rating + note] | [rating + note] | [choice] |
| Extensibility | [rating + note] | [rating + note] | [rating + note] | [choice] |
| Privacy | [rating + note] | [rating + note] | [rating + note] | [choice] |
| Interoperability | [rating + note] | [rating + note] | [rating + note] | [choice] |
```

Use ratings: Strong / Adequate / Weak / N/A

### Step 5: Write Recommendation

Synthesise findings into actionable guidance:

```markdown
## Recommendation for SEP

### Recommended Approach
[Specific design choice with 1-2 sentence explanation]

### Rationale
[2-3 paragraphs explaining why this approach fits SEP's context]

### Evidence
[Which systems demonstrate this approach working]

### Trade-offs Accepted
[What we're giving up by choosing this approach]

### Implementation Notes
[Specific considerations for SEP implementation]

### Conditions for Reconsideration
[What would make us revisit this choice]
```

## Output Format

```markdown
# Schema Comparison: [Topic]

**Date**: [date]
**Compared**: [list of systems/approaches]

## Systems Compared

### System A: [Name]
[2-3 sentence description of how this system handles the topic]

### System B: [Name]
[2-3 sentence description]

...

## Comparison Table

| Dimension | System A | System B | ... | SEP Recommendation |
|-----------|----------|----------|-----|-------------------|
| ... | ... | ... | ... | ... |

## Detailed Analysis

### [Dimension 1]
[Analysis of how systems differ on this dimension]

### [Dimension 2]
[Analysis]

...

## Trade-off Summary

| Approach | Strengths | Weaknesses | Best For |
|----------|-----------|------------|----------|
| ... | ... | ... | ... |

## Recommendation for SEP

### Recommended Approach
[Specific choice]

### Rationale
[Why]

### Trade-offs Accepted
[What we're giving up]

## Open Questions

- [Question 1]
- [Question 2]

## References

- [Source 1]
- [Source 2]
```

## Tips

- **Be specific**: "Upwork uses hierarchical categories" is better than "some systems use categories"
- **Cite evidence**: Reference where you saw each pattern
- **Consider context**: What works for eBay may not work for B2B professional services
- **Think protocol**: SEP must work across implementations, not just one platform
- **Remember constraints**: No shared currency, subjective value, layered trust
