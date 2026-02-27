# /verify - Codebase Verification Command

Run comprehensive verification checks to ensure codebase consistency.

## Usage

```
/verify [options]
```

### Options

- `--build` - Only run TypeScript build
- `--schemas` - Only run schema validation
- `--runtime` - Only run runtime demos
- (no options) - Run all checks

## What It Checks

1. **TypeScript Build** - Catches missing imports, type mismatches, export errors
2. **Schema Validation** - Ensures all JSON examples match their schemas
3. **Runtime Demo** - Verifies the matching algorithm runs correctly

## Example

```
/verify
```

Output:
```
═══════════════════════════════════════════════════════════════════════
  CODEBASE VERIFICATION
═══════════════════════════════════════════════════════════════════════

── TypeScript Build ──────────────────────────────────────────────────
[OK] Build completed successfully

── Schema Validation ─────────────────────────────────────────────────
[OK] 12 example files validated

── Runtime Verification ──────────────────────────────────────────────
[OK] Match demo executed successfully

═══════════════════════════════════════════════════════════════════════
  RESULT: ALL CHECKS PASSED
═══════════════════════════════════════════════════════════════════════
```

## When to Use

- After bulk updates (`/bulk-update`)
- Before committing changes
- After schema modifications
- When debugging issues

## Related

- `/audit` - Find what needs updating
- `/bulk-update` - Make coordinated changes
- `.claude/skills/verify-codebase.md` - Detailed methodology
