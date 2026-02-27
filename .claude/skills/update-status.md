# Update Status Skill

Standardised way to update STATUS.md with session information.

## When to Use

- At the end of each Claude session
- After completing significant work
- When project state changes

## STATUS.md Structure

```markdown
# Project Status

*Last updated: YYYY-MM-DD*

## Current State

### What's Working
- List of functioning components
- Build/validation status

### What's In Progress
- Active work items
- WP references

### Known Issues
- Bugs or limitations
- Technical debt items

---

## Phase 1 Readiness: X% Complete

**Completed:**
- [x] Item 1
- [x] Item 2

**Remaining:**
- [ ] Item 3
- [ ] Item 4

---

## Recent Session Summary

*Session: YYYY-MM-DD*

**What was done:**
- Bullet points of accomplishments

**Key decisions:**
- Any decisions made (or "None")

**Issues encountered:**
- Problems hit (or "None")

---

## Next Priority

1. First priority item
2. Second priority item
3. Third priority item

---

## Future Work
[Long-term items...]

---

## Quick Links
[Links to key documents...]
```

## Update Procedure

### 1. Update "Last updated" Date

Change the date at the top to today's date.

### 2. Update "Current State" if Needed

If components changed from working to broken (or vice versa), update.

### 3. Update "In Progress" Items

Add newly started items, remove completed ones.

### 4. Update "Recent Session Summary"

Replace the previous session summary with:
- Today's date
- What was accomplished
- Decisions made
- Issues encountered

### 5. Update "Next Priority"

Reorder based on current priorities.

### 6. Update "Phase 1 Readiness" Percentage if Changed

Recalculate based on completed vs remaining items.

### 7. Sync Dependent Documents

After updating STATUS.md, check if these need updates:

| If this changed... | Update these... |
|--------------------|-----------------|
| Phase 1 readiness % | README.md, CLAUDE.md, CHANGELOG.md [Unreleased] |
| WP status | [docs/design/work-packages.md](../docs/design/work-packages.md) |
| Decision made | [docs/design/open-questions.md](../docs/design/open-questions.md) lifecycle status |

**Information hierarchy**: STATUS.md is the primary source for project state. See CLAUDE.md "Information Hierarchy" section for full reference.

## Example Update

Before:
```markdown
## Recent Session Summary

*Session: 2026-02-11*

**What was done:**
- Added trust calculation tests
```

After:
```markdown
## Recent Session Summary

*Session: 2026-02-12*

**What was done:**
- Codebase tidying and organisation
- Created STATUS.md
- Updated CLAUDE.md with accurate commands

**Key decisions:**
- Archived prototypes to archive/prototypes/

**Issues encountered:**
- None
```

## Related

- `/session-end` - Command that triggers this skill
- `STATUS.md` - The file being updated
- `CHANGELOG.md` - For versioned changes
