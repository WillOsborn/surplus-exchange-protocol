# Validate Schema Skill

Validate JSON schemas and example documents using ajv.

## Invocation

```
/validate-schema [path]
```

Where `[path]` is:
- A schema file: `schemas/need.schema.json`
- An example file: `examples/needs/minimal.json`
- A directory: `schemas/` or `examples/`
- Omit for all schemas and examples

## Instructions

### Schema Validation

For `.schema.json` files:

1. **Compile check** - Verify schema is valid JSON Schema 2020-12
   ```bash
   npx ajv compile -s [schema-path]
   ```

2. **Reference check** - Verify all `$ref` references resolve

3. **Best practice check**:
   - All properties have descriptions
   - Required arrays are non-empty
   - Enums have at least 2 values
   - Format keywords are standard (date-time, uri, email, etc.)

### Example Validation

For example JSON files:

1. **Identify schema** - Determine which schema to validate against:
   - `examples/needs/*.json` → `schemas/need.schema.json`
   - `examples/chains/*.json` → `schemas/exchange-chain.schema.json`
   - `examples/messages/*.json` → `schemas/protocol-messages.schema.json`

2. **Validate**:
   ```bash
   npx ajv validate -s [schema] -d [example]
   ```

3. **Report errors** with:
   - JSON path to error
   - Expected vs actual value
   - Schema constraint violated

### Output Format

```
=== Schema Validation: schemas/need.schema.json ===
[OK] Schema compiles successfully
[OK] All $ref references resolve
[WARN] Property 'foo' at line 42 missing description
[OK] 3 examples validated

=== Example Validation: examples/needs/minimal.json ===
[OK] Valid against schemas/need.schema.json

=== Example Validation: examples/needs/broken.json ===
[ERROR] Validation failed:
  - /status: must be one of: active, fulfilled, expired, withdrawn
    Found: "invalid_status"
  - /participant: required property missing
```

### Anti-Patterns to Check

Flag these schema anti-patterns:
- `additionalProperties: true` without good reason
- Missing `type` on properties
- `enum` with single value (use `const`)
- Overly permissive `maxLength` (>10000)
- Missing `format` on obvious date/time/email fields

## Dependencies

Requires `ajv` CLI:
```bash
npm install -g ajv-cli
# or use npx ajv
```
