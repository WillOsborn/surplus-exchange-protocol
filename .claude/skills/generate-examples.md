# Generate Examples Skill

Generate realistic example data from JSON schemas.

## Invocation

```
/generate-examples [schema]
```

Where `[schema]` is:
- A schema name: `need`, `exchange-chain`, `protocol-messages`, `trust-profile`
- Omit for all schemas

## Instructions

### Example Types

For each schema, generate three example files:

1. **Minimal** (`[name]-minimal.json`)
   - Only required fields
   - Simplest valid document
   - Tests baseline validation

2. **Typical** (`[name]-typical.json`)
   - Common usage pattern
   - Representative optional fields
   - Realistic values

3. **Maximal** (`[name]-maximal.json`)
   - All fields populated
   - Edge case values (max lengths, etc.)
   - Tests full schema coverage

### Output Locations

```
examples/
├── needs/
│   ├── need-minimal.json
│   ├── need-typical.json
│   └── need-maximal.json
├── chains/
│   ├── chain-3party-happy.json
│   ├── chain-5party-physical.json
│   └── chain-failure.json
├── messages/
│   ├── proposal.json
│   ├── confirmation.json
│   ├── completion.json
│   └── dispute.json
└── trust/
    ├── profile-probationary.json
    ├── profile-established.json
    └── profile-anchor.json
```

### Realistic Data Guidelines

Use realistic but clearly fake data:

**Participant IDs**: `participant-alice`, `participant-bob`, `participant-carol`

**Organisation names**: "Acme Design Studio", "Bright Legal LLP", "Catalyst Catering"

**Capabilities**:
- "Brand identity design (20 hours)"
- "Contract review and advice"
- "Event catering for 50-200 people"

**Dates**: Use relative dates from current date, formatted ISO 8601

**IDs**: Use descriptive slugs: `need-001`, `chain-abc123`, `edge-a-to-b`

### Scenario Examples

For chains, create scenario-based examples:

1. **Happy Path** - 3-party chain completes successfully
2. **Physical Goods** - Chain including physical item logistics
3. **Failure Recovery** - Chain with edge failure and compensation
4. **Dispute Resolution** - Chain with disputed edge

### Validation

After generating, run validation:
```
/validate-schema examples/
```

### Output

List generated files and provide summary:

```
=== Generated Examples for: need ===

Created: examples/needs/need-minimal.json
  - Type: service
  - Participant: participant-alice
  - Status: active

Created: examples/needs/need-typical.json
  - Type: service
  - With: capability_links, constraints, urgency
  - Participant: participant-bob

Created: examples/needs/need-maximal.json
  - Type: physical_good
  - All fields populated
  - Includes: fulfilment_history, inferred_signals

Run /validate-schema examples/needs/ to verify
```
