# /philosophy-check - Philosophy Alignment Command

Check thinking, decisions, or proposals against the project philosophy to identify alignment, conflicts, or needed additions.

## Usage

```
/philosophy-check [topic]
```

### Arguments

- `[topic]` - (Optional) The decision, proposal, or concern to check. If omitted, Claude will ask what to check.

## Examples

```
/philosophy-check Should we add numeric reputation scores?
```
Checks whether adding numeric reputation scores aligns with the project philosophy.

```
/philosophy-check enterprise API pricing tier
```
Checks whether an enterprise pricing tier aligns with principles.

```
/philosophy-check
```
Prompts for what to check.

## What It Does

1. **Reads PHILOSOPHY.md** to get the current philosophy
2. **Articulates the item** being checked (from argument or by asking)
3. **Checks against each layer**:
   - The Insight (radical core)
   - The Scope (surplus focus)
   - The 8 Principles (with specific assessment for each)
   - The Tensions (existing conflicts)
   - The Horizon (future options)
4. **Determines outcome**:
   - Supports philosophy
   - Conflicts with philosophy (and which elements)
   - Requires philosophy update (proposes addition)
   - Acceptable trade-off (documented)
5. **Provides recommendation**: Proceed / Modify / Reconsider / Update philosophy

## Output Format

Generates a structured report showing alignment status for each layer and a clear recommendation.

## When to Use

- Before making significant design decisions
- When resolving open questions from [open-questions.md](../docs/design/open-questions.md)
- When evaluating new features
- When something feels "off" about a direction
- Periodically to check for drift

## Related

- `PHILOSOPHY.md` — The primary reference document
- `.claude/skills/philosophy-check.md` — Detailed methodology
- `/session-end` — For session maintenance (separate concern)
- `docs/design/decisions.md` — Where decisions are recorded
