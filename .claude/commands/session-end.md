# /session-end - Session Maintenance Command

Run at the end of a Claude session to maintain documentation and verify codebase state.

## Usage

```
/session-end
```

## What It Does

### 1. Prompts for Session Summary

Asks what was accomplished:
- What changes were made?
- What decisions were taken?
- What issues were encountered?
- What should be done next?

### 2. Updates STATUS.md

Updates the "Recent Session Summary" section with:
- Date
- What was done
- Key decisions
- Issues encountered
- Next priority recommendations

### 3. Runs Verification Checklist

```bash
npm run build              # TypeScript compilation
npm run validate           # Schema validation
npm run validate:examples  # Example validation
npm run generate:types     # Type generation
```

### 4. Suggests CHANGELOG Updates

If substantive changes were made, suggests adding to CHANGELOG.md:
- New features
- Changed behaviour
- Bug fixes
- Documentation updates

### 5. Cross-Document Sync Check

After updating STATUS.md, verify consistency with dependent documents:

| If this changed... | Update these... |
|--------------------|-----------------|
| Phase 1 readiness % | README.md, CLAUDE.md, CHANGELOG.md [Unreleased] |
| WP status | [docs/design/work-packages.md](../docs/design/work-packages.md) |
| Decision made | [docs/design/open-questions.md](../docs/design/open-questions.md) lifecycle status |

Use `check-docs-health` skill if unsure about consistency.

## Example Interaction

```
User: /session-end

Claude: What was accomplished this session?

User: Fixed the matching algorithm to handle edge cases

Claude: Any key decisions or issues?

User: Decided to use Johnson's algorithm variant

Claude: Updating STATUS.md and running verification...

✓ npm run build - passed
✓ npm run validate - passed
✓ npm run validate:examples - passed
✓ npm run generate:types - passed

STATUS.md updated.

Suggested CHANGELOG entry:
### Changed
- Matching algorithm now uses Johnson's algorithm variant for edge case handling

Add to CHANGELOG.md? (y/n)
```

## Related

- `STATUS.md` - The file this command updates
- `/session-start` - Run at start of session
- `CHANGELOG.md` - Version history
- `/verify` - Standalone verification command
