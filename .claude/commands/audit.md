# /audit - Codebase Audit Command

Run a comprehensive audit of the codebase for terminology changes, schema updates, or cross-cutting modifications.

## Usage

```
/audit <term> [options]
```

### Arguments

- `<term>` - The term to search for (e.g., `offering_type`, `OfferingType`, or a JSON pattern)

### Options

- `--replacement <new>` - Specify the replacement term for the report
- `--exclude <folder>` - Exclude a folder from the audit (e.g., `--exclude Website`)
- `--fix` - After generating the report, proceed to make the changes
- `--verify-only` - Only run verification steps (build, validate, test)

## Examples

```
/audit offering_type --replacement capacity_type
```
Finds all occurrences of `offering_type` (and `OfferingType`, `offeringType`) and generates a prioritised update plan.

```
/audit "type": "organisation" --exclude Website
```
Finds old-format participant types, excluding the Website folder.

```
/audit --verify-only
```
Runs build and validation without searching.

## What It Does

1. **Multi-convention search** - Searches snake_case, PascalCase, camelCase variants
2. **File type coverage** - Checks schemas, TypeScript, examples, docs, configs
3. **Dependency analysis** - Finds re-exports in index.ts, imports, type references
4. **Priority categorisation** - Separates build-breaking vs documentation-only changes
5. **Verification steps** - Provides commands to verify changes

## Output

Generates a markdown report with:
- Summary counts by file type
- Prioritised file list (HIGH/MEDIUM/LOW)
- Excluded files with reasons
- Verification commands to run after changes

## Related

- See `.claude/skills/codebase-audit.md` for detailed methodology
- Use with agent team for large-scale updates
