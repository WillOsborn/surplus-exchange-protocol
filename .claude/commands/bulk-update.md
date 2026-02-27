# /bulk-update - Coordinated Bulk Update Command

Execute large-scale codebase updates using a two-agent team: one to make changes, one to verify.

## Usage

```
/bulk-update [options]
```

### Options

- `--from-audit <file>` - Use a previously generated audit report
- `--dry-run` - Generate the agent instructions without executing
- `--skip-verification` - Run only the update agent (not recommended)

## How It Works

1. **Launches two agents in parallel:**
   - UPDATE AGENT - Makes all file changes systematically
   - VERIFICATION AGENT - Monitors progress and validates changes

2. **After agents complete:**
   - Runs `npm run build` to verify TypeScript compilation
   - Runs `npm run validate:examples` to verify schema compliance
   - Runs `npm run match` to verify runtime behaviour

3. **Reports final status** with any issues found

## When to Use

- Renaming terms across the codebase (e.g., `offering_type` → `capacity_type`)
- Updating schema structures in multiple files
- Any change affecting more than 5-10 files

## Example Workflow

```
# First, generate an audit report
/audit offering_type --replacement capacity_type

# Review the report, then execute the update
/bulk-update --from-audit

# Or run both together
/audit offering_type --replacement capacity_type --fix
```

## Related

- `/audit` - Generate the audit report first
- `.claude/skills/bulk-update.md` - Detailed methodology
- `.claude/skills/codebase-audit.md` - Audit methodology
