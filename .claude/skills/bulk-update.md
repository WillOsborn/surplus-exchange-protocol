# Bulk Update Skill

Execute large-scale codebase updates using a coordinated agent team with built-in verification.

## Invocation

```
/bulk-update <audit-report>
```

Where `<audit-report>` is either:
- A file path to a previously generated audit report
- Inline instructions for what to update

## Instructions

### Team Structure

Launch two agents in parallel:

1. **UPDATE AGENT** - Makes all file changes
2. **VERIFICATION AGENT** - Monitors and validates changes

### Update Agent Instructions

```markdown
You are the UPDATE AGENT for a bulk codebase update.

## Your Task
[Insert specific changes from audit report]

## Process
1. Read all target files first
2. Create a todo list with all files to update
3. Update each file, marking todos complete as you go
4. For each file:
   - Use `replace_all: true` for simple renames across a file
   - Use specific edits for targeted changes
5. After all updates, grep to confirm no old terms remain

## Priority Order
1. TypeScript schema definitions (`.d.ts`)
2. Barrel exports (`index.ts`)
3. Source code (`.ts`)
4. JSON examples
5. Documentation

## Do NOT Update
- Historical documents (ADRs, decisions.md)
- Compiled output (dist/) - will be regenerated
- Configuration files unless explicitly listed
```

### Verification Agent Instructions

```markdown
You are the VERIFICATION AGENT for a bulk codebase update.

## Your Task
Monitor the UPDATE AGENT's progress and verify correctness.

## Process
1. Wait 60 seconds for UPDATE AGENT to start
2. Every 30-60 seconds, check progress:
   - Grep for old term - count should decrease
   - Grep for new term - count should increase
3. After UPDATE AGENT reports complete:
   - Final grep for old term in target files
   - Read each target file to spot-check changes
   - Report any missed files or partial updates

## Verification Checklist
- [ ] No old term in src/ (except intentional)
- [ ] No old term in examples/
- [ ] New term appears in expected locations
- [ ] TypeScript types properly renamed
- [ ] Re-exports in index.ts updated

## Output
Provide a verification report:
- Files confirmed updated
- Files still containing old term (if any)
- Recommendations for manual review
```

### Coordination Pattern

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BULK UPDATE FLOW                             │
│                                                                      │
│  1. User runs /bulk-update with audit report                        │
│                                                                      │
│  2. Launch both agents in parallel:                                 │
│     ┌──────────────────┐     ┌──────────────────┐                   │
│     │   UPDATE AGENT   │     │ VERIFICATION     │                   │
│     │                  │     │    AGENT         │                   │
│     │ • Read files     │     │                  │                   │
│     │ • Make edits     │     │ • Wait 60s       │                   │
│     │ • Track progress │     │ • Monitor grep   │                   │
│     │ • Report done    │     │ • Spot check     │                   │
│     └────────┬─────────┘     └────────┬─────────┘                   │
│              │                        │                              │
│              ▼                        ▼                              │
│  3. Collect results from both agents                                │
│                                                                      │
│  4. Run verification commands:                                      │
│     • npm run build                                                 │
│     • npm run validate:examples                                     │
│     • npm run match (or equivalent demo)                            │
│                                                                      │
│  5. Report final status to user                                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Post-Update Verification

After agents complete, always run:

```bash
# TypeScript compilation (catches import/export errors)
npm run build

# Schema validation (catches JSON structure errors)
npm run validate:examples

# Runtime check (catches data access errors)
npm run match
```

### Error Recovery

If UPDATE AGENT misses files:
1. Identify missed files from VERIFICATION AGENT report
2. Make targeted edits manually or re-run with specific file list

If build fails:
1. Check error message for file/line
2. Usually a missed re-export in index.ts
3. Fix manually and rebuild

### Example Invocation (Historical: agent_matching rename)

This example documents the completed `agent_matching` → `capability_matching` rename:

```
User: /bulk-update

Based on the audit report, update agent_matching → capability_matching:

HIGH PRIORITY:
- src/schemas/index.ts (lines 20, 36)
- src/schemas/need.schema.d.ts
- src/schemas/capability-offering.schema.d.ts

MEDIUM PRIORITY:
- examples/matching/offerings.json
- examples/matching/needs.json
- examples/needs/*.json

Documentation updates handled separately.
```

## Dependencies

- Task tool for launching agents
- Grep tool for verification
- Bash tool for npm commands
