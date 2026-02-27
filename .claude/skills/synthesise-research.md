# Synthesise Research

Synthesise research findings from multiple sources into actionable recommendations for SEP design.

## Description

Use this skill when you have gathered research from multiple subagents, sessions, or sources and need to produce coherent design guidance. Generates ADR-format design decisions with evidence.

## Usage

```
/synthesise-research [area]
```

**Examples:**
- `/synthesise-research needs` — Synthesise findings on need representation
- `/synthesise-research execution` — Synthesise findings on exchange execution protocols
- `/synthesise-research trust` — Synthesise findings on trust mechanisms
- `/synthesise-research agentic-protocols` — Synthesise findings on A2A, MCP, etc.

## Workflow

### Step 1: Gather Inputs

Identify all relevant research sources:

```markdown
## Sources Consulted

### Subagent Research
- [ ] need-researcher findings
- [ ] execution-researcher findings
- [ ] historical-researcher findings

### External Documentation
- [ ] Protocol specifications read
- [ ] Academic papers reviewed
- [ ] System documentation examined

### Comparisons Completed
- [ ] Schema comparisons via /compare-schemas
- [ ] Trade-off analyses documented

### Project Context
- [ ] Existing design decisions (docs/design/decisions.md)
- [ ] Open questions (docs/design/open-questions.md)
- [ ] Scenario analysis (docs/design/scenarios.md)
```

### Step 2: Extract Patterns

For each research area, identify:

**Convergent Findings** (Multiple sources agree)
```markdown
### Pattern: [Name]
**Sources**: [list]
**Finding**: [what they agree on]
**Confidence**: High (multiple independent sources)
```

**Divergent Findings** (Sources disagree)
```markdown
### Divergence: [Topic]
**Source A says**: [position]
**Source B says**: [position]
**Likely explanation**: [why they differ]
**SEP implication**: [which applies to our context]
```

**Surprising Findings** (Contradicted assumptions)
```markdown
### Surprise: [Topic]
**Assumption was**: [what we thought]
**Evidence shows**: [what we found]
**Implication**: [how this changes our thinking]
```

**Gaps** (What remains unknown)
```markdown
### Gap: [Topic]
**Question**: [what we don't know]
**Why it matters**: [impact on design]
**How to resolve**: [suggested approach]
```

### Step 3: Apply SEP Context Filter

Filter patterns through SEP-specific requirements:

| SEP Principle | Filter Question |
|---------------|-----------------|
| Surplus focus | Does this work when baseline is "anything > nothing"? |
| Subjective value | Does this avoid reintroducing shared currency? |
| B2B professional | Does this fit professional services context? |
| Multi-party chains | Does this work for A→B→C→D→A, not just bilateral? |
| Protocol not platform | Does this work across implementations? |
| Layered trust | Does this complement our three-layer trust model? |

### Step 4: Generate Recommendations

For each design decision, produce ADR-format output:

```markdown
## Decision: [Title]

**Date**: [date]
**Status**: Proposed
**Confidence**: [High/Medium/Low] based on evidence strength

### Context

[What problem are we solving? What constraints apply?]

### Decision

[Specific design choice in 1-2 sentences]

### Evidence

**Supporting sources:**
- [Source 1]: [what it showed]
- [Source 2]: [what it showed]

**Confidence assessment:**
- [High]: Multiple independent sources converge
- [Medium]: Single strong source or multiple weak sources
- [Low]: Limited evidence, significant uncertainty

### Alternatives Considered

1. **[Alternative A]**
   - Pro: [benefit]
   - Con: [drawback]
   - Why not: [reason rejected]

2. **[Alternative B]**
   - Pro: [benefit]
   - Con: [drawback]
   - Why not: [reason rejected]

### Rationale

[2-3 paragraphs explaining why this choice fits SEP's context, referencing evidence]

### Consequences

**Positive:**
- [benefit 1]
- [benefit 2]

**Negative:**
- [cost 1]
- [cost 2]

### Trade-offs Accepted

[What we're consciously giving up]

### Conditions for Reconsideration

- [Condition 1 that would make us revisit]
- [Condition 2]
```

### Step 5: Identify Implementation Sequence

Order recommendations by:

| Priority | Criteria |
|----------|----------|
| **P0** | Blocks other decisions; must resolve first |
| **P1** | High value, high confidence; implement soon |
| **P2** | Important but can wait; some uncertainty |
| **P3** | Nice to have; low urgency or needs more research |

```markdown
## Implementation Sequence

### P0: Must Resolve First
1. [Decision]: [why it blocks others]

### P1: High Priority
1. [Decision]: [value delivered]
2. [Decision]: [value delivered]

### P2: Medium Priority
1. [Decision]: [why it can wait]

### P3: Future Consideration
1. [Decision]: [what's needed before implementing]
```

## Output Format

```markdown
# Research Synthesis: [Area]

**Date**: [date]
**Synthesised from**: [list of inputs]

## Executive Summary

[3-5 sentences capturing key findings and recommendations]

## Sources Consulted

[Checklist of inputs]

## Key Patterns Identified

### Convergent Findings
[Patterns where sources agree]

### Divergent Findings
[Where sources disagree and why]

### Surprising Findings
[What contradicted assumptions]

### Gaps
[What remains unknown]

## Recommendations

### Decision 1: [Title]
[Full ADR format]

### Decision 2: [Title]
[Full ADR format]

...

## Implementation Sequence

[Prioritised order]

## Open Questions

- [Question requiring further research]
- [Question requiring user input]

## Next Steps

1. [Specific action]
2. [Specific action]

## Appendix: Evidence Summary

| Finding | Sources | Confidence |
|---------|---------|------------|
| ... | ... | ... |
```

## Tips

- **Don't force consensus**: If sources genuinely disagree, document the divergence
- **Be honest about confidence**: Low confidence is fine — it guides where to invest more research
- **Connect to existing decisions**: Reference `docs/design/decisions.md` for consistency
- **Think implementation**: Recommendations should be actionable, not abstract
- **Flag dependencies**: Some decisions can't be made until others are resolved
- **Update open questions**: Move resolved questions out, add new ones discovered
