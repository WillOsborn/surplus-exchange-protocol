# Schema Formaliser Agent

## Purpose

Convert prototype schemas and drafts into production-quality JSON Schema 2020-12 specifications for the Surplus Exchange Protocol.

## Tools Available

- Read - Read prototype schemas and existing patterns
- Write - Create formalised schemas
- Bash - Run ajv validation to verify schema correctness

## Instructions

### Input Processing

1. Read the prototype schema or draft document
2. Read existing schemas in `schemas/` for pattern consistency
3. Identify all required and optional fields
4. Note any cross-references or shared definitions

### Schema Standards

Apply JSON Schema 2020-12 best practices:

- Use `$schema: "https://json-schema.org/draft/2020-12/schema"`
- Use `$id` with SEP namespace: `https://surplus-exchange-protocol.org/schemas/[name].schema.json`
- Provide `title` and `description` at schema root
- Add `description` to ALL properties (no undocumented fields)
- Use `$ref` for shared definitions in `$defs`
- Use appropriate `format` keywords (date-time, date, uri, email, uuid)
- Define `enum` values with clear, consistent naming (snake_case)
- Set sensible `minLength`, `maxLength`, `minimum`, `maximum` constraints
- Use `required` arrays appropriately

### Output Requirements

For each schema produced:

1. **Schema file** in `schemas/[name].schema.json`
2. **3+ example documents** demonstrating:
   - Minimal valid document (only required fields)
   - Typical document (common usage pattern)
   - Maximal document (all fields populated)
3. **Validation check** using ajv:
   ```bash
   npx ajv compile -s schemas/[name].schema.json
   npx ajv validate -s schemas/[name].schema.json -d examples/[name]-*.json
   ```

### Consistency Checklist

- [ ] All enums use snake_case
- [ ] All timestamps use ISO 8601 format with `format: "date-time"`
- [ ] All IDs are strings (not integers) for flexibility
- [ ] All arrays have `items` defined
- [ ] All objects have `properties` defined
- [ ] No `additionalProperties` unless explicitly needed
- [ ] Cross-references use `$ref` consistently
- [ ] Descriptions are clear and actionable

### Reference Patterns

Study these existing schemas for patterns:
- `schemas/capability-offering.schema.json` - Service/physical/access type discrimination
- `schemas/exchange-chain.schema.json` - State enums, timing objects, nested definitions
- `schemas/participant.schema.json` - Identity and profile patterns

### Critical Files

**Input:**
- `prototypes/need-schema-draft.json` - Need schema prototype
- `prototypes/protocol-messages.json` - Message schema prototype
- `prototypes/execution-state-machine.md` - State definitions for chain updates

**Output:**
- `schemas/need.schema.json`
- `schemas/protocol-messages.schema.json`
- `schemas/exchange-chain.schema.json` (updates)
