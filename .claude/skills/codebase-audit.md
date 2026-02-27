# Codebase Audit Skill

Comprehensive audit for terminology renames, schema changes, and cross-cutting updates across the codebase.

## Invocation

```
/audit <search-term> [--replacement <new-term>] [--exclude <folder>]
```

Examples:
- `/audit offering_type --replacement capacity_type`
- `/audit OfferingType` (checks all naming conventions)
- `/audit "type": "organisation"` (finds old participant type format)

> **Note**: The examples below reference the `agent_matching` → `capability_matching` rename as a historical case study. This rename has been completed.

## Instructions

### Phase 1: Multi-Convention Search

When auditing a term, search for ALL naming conventions:

| Convention | Pattern | Used In |
|------------|---------|---------|
| snake_case | `agent_matching` | JSON schemas, JSON examples, JS object keys |
| PascalCase | `AgentMatching` | TypeScript interfaces, type exports |
| camelCase | `agentMatching` | TypeScript variables, function names |
| SCREAMING_SNAKE | `AGENT_MATCHING` | Constants, environment variables |
| kebab-case | `agent-matching` | File names, CSS classes, URLs |

Search command for each:
```bash
# Find all files containing any variant
grep -r "agent_matching\|AgentMatching\|agentMatching" --include="*.ts" --include="*.json" --include="*.md"
```

### Phase 2: File Type Coverage

Ensure these file types are checked:

| Category | File Patterns | What to Check |
|----------|--------------|---------------|
| **JSON Schemas** | `schemas/*.schema.json` | Property names, $defs, required arrays |
| **TypeScript Types** | `src/schemas/*.d.ts` | Interface names, property names |
| **Barrel Exports** | `src/**/index.ts` | Re-exports, type aliases |
| **Source Code** | `src/**/*.ts` | Imports, type references, property access |
| **Examples** | `examples/**/*.json` | Property names matching schemas |
| **Documentation** | `docs/**/*.md` | Code blocks, inline references |
| **Diagrams** | `docs/diagrams/*.md` | ASCII diagrams, Mermaid code |
| **Config Files** | `*.json`, `*.yaml` | Configuration keys |
| **Compiled Output** | `dist/**/*.js` | Verify regeneration needed |

### Phase 3: Dependency Analysis

Check for downstream dependencies:

1. **Type Exports**: Search `index.ts` files for re-exports
   ```bash
   grep -r "export.*AgentMatching" src/
   ```

2. **Imports**: Find all files importing the type
   ```bash
   grep -r "import.*AgentMatching" src/
   ```

3. **Type References**: Find usage in type annotations
   ```bash
   grep -r ": AgentMatching\|<AgentMatching" src/
   ```

### Phase 4: Generate Audit Report

Output format:

```markdown
# Codebase Audit: `agent_matching` → `capability_matching`

## Summary
- Total files to update: 15
- By category:
  - Schemas: 2
  - TypeScript: 4
  - Examples: 5
  - Documentation: 4

## Files by Priority

### HIGH PRIORITY (breaks build/validation)

| File | Occurrences | Lines |
|------|-------------|-------|
| src/schemas/index.ts | 2 | 20, 36 |
| src/schemas/need.schema.d.ts | 3 | 61, 473, 475 |

### MEDIUM PRIORITY (functionality affected)

| File | Occurrences | Lines |
|------|-------------|-------|
| examples/matching/needs.json | 8 | 12, 48, ... |

### LOW PRIORITY (documentation only)

| File | Occurrences | Lines |
|------|-------------|-------|
| docs/design/schema-revision-plan.md | 5 | 91, 127, ... |

## Excluded (intentional historical references)

| File | Reason |
|------|--------|
| docs/design/decisions.md | ADR documenting the rename |

## Verification Steps

After updates, run:
1. `npm run build` - TypeScript compilation
2. `npm run validate:examples` - Schema validation
3. `npm run match` - Runtime demo
```

### Phase 5: Verification Checklist

After changes are made, verify:

- [ ] `npm run build` succeeds (no TypeScript errors)
- [ ] `npm run validate:examples` passes (all examples valid)
- [ ] No `<old-term>` in `src/` (except intentional)
- [ ] No `<old-term>` in `dist/` (confirms rebuild)
- [ ] No `<old-term>` in `examples/`
- [ ] `npm run match` executes successfully (runtime check)

### Anti-Patterns to Avoid

1. **Incomplete convention coverage**: Searching only `snake_case` misses TypeScript interfaces
2. **Missing barrel files**: `index.ts` re-exports are easy to miss
3. **Skipping compiled output**: `dist/` reveals runtime issues
4. **No build verification**: TypeScript compilation catches import/export mismatches
5. **Ignoring historical docs**: Some references are intentional (ADRs, changelogs)

## Example Workflow (Historical: agent_matching rename)

This example documents the completed `agent_matching` → `capability_matching` rename:

```
User: Rename agent_matching to capability_matching

1. Search all conventions:
   - agent_matching (snake_case) → 45 occurrences
   - AgentMatching (PascalCase) → 12 occurrences
   - agentMatching (camelCase) → 0 occurrences

2. Categorise by file type:
   - schemas/*.json → 2 files
   - src/schemas/*.d.ts → 3 files
   - src/schemas/index.ts → 1 file (re-exports!)
   - examples/**/*.json → 5 files
   - docs/**/*.md → 4 files

3. Generate prioritised list

4. Execute changes (or delegate to update agent)

5. Verify:
   - npm run build ✓
   - npm run validate:examples ✓
   - npm run match ✓
```

## Dependencies

- `grep` or `ripgrep` for searching
- `npm run build` for TypeScript verification
- `npm run validate:examples` for schema verification
