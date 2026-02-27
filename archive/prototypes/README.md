# Prototypes

This directory contains experimental implementations and drafts created during research phases. These are **not production-ready** — they exist to test ideas and inform design decisions.

## Purpose

Prototypes help us:
- Test schema designs before committing to formal specifications
- Visualise state machines and message flows
- Explore integration patterns with external protocols
- Validate assumptions through concrete examples

## Status Levels

| Status | Meaning |
|--------|---------|
| **Draft** | Initial exploration, may be incomplete |
| **Review** | Ready for feedback, structurally complete |
| **Validated** | Tested against requirements, ready to inform spec |
| **Superseded** | Replaced by formal specification |

## Contents

### Need Schema Prototypes
- `need-schema-draft.json` — Draft JSON schema for participant needs
- `need-examples.json` — Example needs demonstrating the schema

### Execution Protocol Prototypes
- `execution-state-machine.md` — State diagram for chain execution
- `protocol-messages.json` — Draft message formats
- `security-model.md` — Authentication/authorisation sketch
- `integration-patterns.md` — Agentic protocol integration approaches

## Guidelines

1. **Label clearly**: Include status and date in file headers
2. **Document assumptions**: Note what you're testing and why
3. **Link to research**: Reference findings that informed the prototype
4. **Note limitations**: What doesn't work or isn't addressed
5. **Track evolution**: When updating, note what changed and why

## Relationship to Formal Specs

```
Research Findings
      ↓
  Prototypes (this directory)
      ↓
  Design Decisions (docs/design/)
      ↓
  Formal Schemas (schemas/)
  Formal Specs (docs/specs/)
```

Prototypes are disposable. Once a design decision is made and formalised, the prototype becomes historical reference only.
