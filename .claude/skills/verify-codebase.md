# Verify Codebase Skill

Run comprehensive verification to ensure codebase consistency after changes.

## Invocation

```
/verify [options]
```

### Options

- `--build` - Only run TypeScript build
- `--schemas` - Only run schema validation
- `--runtime` - Only run runtime demos
- `--all` - Run all checks (default)

## Instructions

### Verification Steps

Execute in order (later steps depend on earlier ones):

#### 1. TypeScript Build

```bash
npm run build
```

**Catches:**
- Missing imports/exports
- Type mismatches
- Renamed interfaces not updated in re-exports

**On failure:**
- Error shows file and line number
- Usually a missed update in `index.ts` or import statement

#### 2. Schema Validation

```bash
npm run validate:examples
```

**Catches:**
- JSON examples not matching schema
- Required properties missing
- Enum values changed
- Property renames not applied to examples

**On failure:**
- Shows which example file failed
- Shows JSON path to error
- Shows expected vs actual value

#### 3. Runtime Verification

```bash
npm run match
```

**Catches:**
- Property access errors at runtime
- Data structure mismatches
- Logic errors from renamed fields

**On failure:**
- Stack trace shows failing line
- Usually a `.oldPropertyName` that should be `.newPropertyName`

### Output Format

```
═══════════════════════════════════════════════════════════════════════
  CODEBASE VERIFICATION
═══════════════════════════════════════════════════════════════════════

── TypeScript Build ──────────────────────────────────────────────────
[OK] Build completed successfully

── Schema Validation ─────────────────────────────────────────────────
[OK] examples/needs/need-minimal.json valid
[OK] examples/needs/need-typical.json valid
[OK] examples/needs/need-maximal.json valid
[OK] examples/chains/three-party-happy-path.json valid
[OK] examples/messages/chain-proposal.json valid
... (all files)

── Runtime Verification ──────────────────────────────────────────────
[OK] Match demo executed successfully
     Found 7 chains connecting 7 participants

═══════════════════════════════════════════════════════════════════════
  RESULT: ALL CHECKS PASSED
═══════════════════════════════════════════════════════════════════════
```

### Failure Recovery

| Failure | Likely Cause | Fix |
|---------|--------------|-----|
| Build: "Module has no exported member" | Missed re-export in index.ts | Update the export in index.ts |
| Build: "Cannot find name" | Renamed type not imported | Update import statement |
| Validate: "must have required property" | Property renamed in schema but not example | Update example JSON |
| Validate: "must be equal to one of" | Enum value changed | Update example to use new enum |
| Runtime: "Cannot read property X" | Property access on old name | Update source code to new name |

### Quick Commands Reference

```bash
# Full verification
npm run build && npm run validate:examples && npm run match

# Just build
npm run build

# Just schemas
npm run validate:examples

# Individual schema validations
npm run validate:needs
npm run validate:chains
npm run validate:messages
npm run validate:trust

# Run with verbose output
npm run match 2>&1 | head -100
```

## When to Use

- After any bulk update operation
- Before committing schema changes
- After merging branches with schema modifications
- When debugging "it works locally but not in CI"

## Dependencies

- Node.js and npm
- Project dependencies installed (`npm install`)
