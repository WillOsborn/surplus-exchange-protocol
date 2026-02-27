# /session-start - Session Orientation Command

Orient at the start of a new Claude session by displaying current project status, recent work, and next priorities.

## Usage

```
/session-start
```

## What It Does

1. **Reads STATUS.md** and displays:
   - Current state (what's working)
   - In-progress items
   - Known issues
   - Recent session summary

2. **Shows next priorities** so you know what to work on

3. **Checks for blockers** that might affect the session

## Output Format

```markdown
## Session Start: Surplus Exchange Protocol

### Current State
- Core schemas: Working
- Matching algorithm: Working
- Trust calculation: Working

### Recent Session (2026-02-12)
- Codebase tidying completed
- STATUS.md created
- Documentation organised

### Next Priorities
1. Capability Translation System (WP8)
2. Developer guide for agent integration
3. Deployment architecture decision

### Known Issues
- No test suite yet
- Some documentation may reference deprecated terminology

### Ready to start!
```

## Related

- `STATUS.md` - The file this command reads
- `/session-end` - Run at end of session to update status
- `CLAUDE.md` - Full project context
