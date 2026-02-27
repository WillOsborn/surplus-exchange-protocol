# Philosophy Check Skill

Check thinking, decisions, or proposals against the project philosophy to identify alignment, conflicts, or needed additions.

## When to Use

- When making significant design decisions
- When resolving open questions
- When evaluating new features or changes
- When something feels "off" about a direction
- Periodically to check for drift from original intent

## Reference Document

**Primary source**: [PHILOSOPHY.md](../../PHILOSOPHY.md)

The philosophy document contains:
1. **The Insight** — The radical core that motivates the project
2. **The Scope** — Why surplus, why now, why this and not everything
3. **The Philosophy** — 8 design principles with rationale and trade-offs
4. **The Tensions** — Active conflicts being navigated
5. **The Horizon** — What success could enable

## Process

### 1. Articulate the Item Under Review

Clearly state what you're checking:
- A proposed design decision
- A feature or capability
- An approach to an open question
- A direction the project seems to be heading
- A concern or uncertainty

### 2. Check Against Each Layer

**Against the Insight:**
- Does this support or undermine the core insight (AI + networks solving matching directly)?
- Does it preserve the goal of value flowing to participants rather than intermediaries?
- Is it consistent with exploring whether money's matching function can be disintermediated?

**Against the Scope:**
- Does this stay within the surplus focus, or does it creep beyond?
- Is scope creep justified, or should we resist it?
- Does this make the project more or less tractable?

**Against the Principles:**
For each of the 8 principles, ask:
1. Subjective value — Does this preserve or erode subjective valuation?
2. Protocol over platform — Does this support openness or create lock-in?
3. B2B focus — Does this serve professional services or drift to other audiences?
4. Pragmatic framing, radical intent — Does this maintain the balance?
5. Professional management — Does this support sustainable operation?
6. Trust through relationships — Does this rely on relationship patterns or reintroduce ratings?
7. Human accountability — Does this keep humans appropriately in the loop?
8. Sustainable operation — Does this reduce or increase resource intensity?

**Against the Tensions:**
- Does this resolve a tension, or create a new one?
- Does it shift the balance in a way we're comfortable with?
- Are we trading off something we shouldn't?

**Against the Horizon:**
- Does this keep future possibilities open?
- Does it foreclose options we might want?
- Is it consistent with the direction we're heading?

### 3. Determine Outcome

**Supports philosophy**: The item aligns with the insight, stays within scope, follows principles, and doesn't create problematic tensions.

**Conflicts with philosophy**: The item contradicts the insight, violates principles, or creates unacceptable tensions. Document specifically which elements conflict.

**Requires philosophy update**: The item reveals something missing from the philosophy, a new principle needed, or a tension not previously articulated. Propose the addition.

**Acceptable trade-off**: The item conflicts with some elements but the trade-off is explicitly acknowledged and justified. Document the trade-off clearly.

## Output Format

```markdown
## Philosophy Check: [Item Under Review]

### Summary
[One sentence: Supports / Conflicts / Requires Update / Acceptable Trade-off]

### Against the Insight
[Assessment]

### Against the Scope
[Assessment]

### Against the Principles
| Principle | Assessment |
|-----------|------------|
| 1. Subjective value | [Aligns / Neutral / Conflicts] — [brief note] |
| 2. Protocol over platform | [Aligns / Neutral / Conflicts] — [brief note] |
| 3. B2B focus | [Aligns / Neutral / Conflicts] — [brief note] |
| 4. Pragmatic framing | [Aligns / Neutral / Conflicts] — [brief note] |
| 5. Professional management | [Aligns / Neutral / Conflicts] — [brief note] |
| 6. Trust through relationships | [Aligns / Neutral / Conflicts] — [brief note] |
| 7. Human accountability | [Aligns / Neutral / Conflicts] — [brief note] |
| 8. Sustainable operation | [Aligns / Neutral / Conflicts] — [brief note] |

### Against the Tensions
[Does this affect any of the 7 documented tensions?]

### Against the Horizon
[Does this keep future options open?]

### Recommendation
[Proceed / Proceed with modification / Reconsider / Update philosophy]

### If Philosophy Update Needed
[Proposed addition or change to PHILOSOPHY.md]
```

## Quick Check (Abbreviated)

For minor decisions, a quick check may suffice:

1. Does this serve the core insight? [Y/N]
2. Does it stay within surplus scope? [Y/N]
3. Does it violate any of the 8 principles? [Which?]
4. Does it create new tensions? [What?]

If all answers are favourable, proceed. If any concern, do the full check.

## Related

- [PHILOSOPHY.md](../../PHILOSOPHY.md) — The primary reference
- [docs/design/decisions.md](../../docs/design/decisions.md) — Design decisions (should align)
- [docs/design/open-questions.md](../../docs/design/open-questions.md) — Questions to resolve (use this skill when resolving)
- `/philosophy-check` command — Invokes this skill
