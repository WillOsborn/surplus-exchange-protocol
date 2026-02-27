# Surplus Exchange Protocol (SEP)

## Project Overview

An AI-mediated system for matching and facilitating exchanges of surplus capacity between participants without using money as a medium of exchange. The core insight: money solved the matching problem in commerce; AI agents could solve matching directly, potentially reducing need for capital while redirecting "excess value" toward participants rather than intermediaries.

## Key Concepts

- **Subjective Value Ledgers**: Each participant maintains their own sense of balance based on their own valuation, not shared currency
- **Surplus Focus**: Exchange what would otherwise be wasted (unused capacity, excess inventory, available time)
- **Multi-Party Matching**: AI agents find complex exchange chains (A→B→C→D→A) that humans couldn't compute
- **Decentralised Protocol**: Open standard for agent discovery/negotiation/execution, not a centralised service

## Project Structure

```
surplus-exchange-protocol/
├── CLAUDE.md                    # This file - project context
├── PHILOSOPHY.md                # Core philosophy and design principles
├── STATUS.md                    # Current status and session handoff
├── README.md                    # Project overview for humans
├── CHANGELOG.md                 # Version history
├── LICENSE                      # Apache 2.0 licence
├── .gitignore                   # Build artifact exclusions
├── package.json                 # Node.js configuration
├── tsconfig.json                # TypeScript configuration
│
├── .claude/
│   ├── README.md                # Explanation of Claude Code tooling
│   ├── agents/                  # Subagent definitions
│   ├── commands/                # Slash commands
│   ├── skills/                  # Auto-invoked skills
│   └── settings.local.json      # Local Claude settings (gitignored)
│
├── docs/
│   ├── INDEX.md                 # Guide to the repository
│   ├── session-log.md           # Historical session summaries
│   ├── use-cases.md             # Concrete exchange scenarios
│   ├── research/                # 6 historical systems research files
│   ├── design/                  # Core design documents
│   │   └── analysis/            # Supporting analysis
│   ├── plans/                   # 8 open question design documents
│   ├── specs/                   # 4 protocol specifications
│   ├── diagrams/                # 4 architecture diagrams
│   └── explainer-tests/         # 5 explainer test files
│
├── schemas/                     # JSON schemas
│   ├── need.schema.json
│   ├── capability-offering.schema.json
│   ├── participant.schema.json
│   ├── exchange-chain.schema.json
│   ├── trust-profile.schema.json
│   └── protocol-messages.schema.json
│
├── src/                         # TypeScript implementation
│   ├── matching/                # Matching algorithm
│   ├── trust/                   # Trust calculation
│   ├── capability/              # Capability translation
│   ├── protocol/                # Protocol state machine
│   ├── validation/              # Schema validation
│   ├── schemas/                 # Generated types
│   └── examples/                # Demo scripts
│
├── dist/                        # Compiled output (gitignored)
│
├── examples/                    # JSON example data
│   ├── chains/                  # Exchange chain examples
│   ├── matching/                # Matching examples
│   ├── messages/                # Protocol message examples
│   ├── needs/                   # Need examples
│   └── trust/                   # Trust profile examples
│
└── archive/                     # Archived experimental work
    └── prototypes/              # Early prototypes (superseded)
```

> **Website**: The project website lives in a separate repository ([SEPWebsite](https://github.com/WillOsborn/SEPWebsite)).

## Current Focus Areas

### Phase 1 Readiness: 95% Complete

> **Source**: [STATUS.md](STATUS.md) — See for current state and session summaries.

For detailed tracking:
- [docs/design/work-packages.md](docs/design/work-packages.md) — Work package status (authoritative)
- [docs/design/open-questions.md](docs/design/open-questions.md) — Question lifecycle
- [docs/design/decisions.md](docs/design/decisions.md) — Design decisions

## Available Commands

### NPM Scripts

```bash
npm run build              # Compile TypeScript to dist/
npm run validate           # Validate all JSON schemas
npm run validate:examples  # Validate example JSON files
npm run validate:chains    # Validate exchange chain examples
npm run validate:needs     # Validate need examples
npm run validate:messages  # Validate protocol messages
npm run generate:types     # Generate TypeScript types from schemas
npm run trace              # Run chain tracing demo
npm run match              # Run matching algorithm demo
npm run trust              # Run trust calculation demo
npm test                   # (Placeholder - no tests yet)
```

### Claude Code Commands

- `/audit <term>` — Search for terminology/patterns across codebase
- `/bulk-update` — Coordinated multi-file updates with verification
- `/verify` — Build, validate schemas, and verify codebase state
- `/session-start` — Orient at start of session (reads STATUS.md)
- `/session-end` — Maintain docs at end of session (updates STATUS.md)

## Where to Find Things

### By Task

| Task | Start Here |
|------|------------|
| Understanding the project | README.md, [PHILOSOPHY.md](PHILOSOPHY.md) |
| Project philosophy and principles | [PHILOSOPHY.md](PHILOSOPHY.md) |
| Current status | [STATUS.md](STATUS.md) |
| Work package status | [docs/design/work-packages.md](docs/design/work-packages.md) |
| Design decisions | [docs/design/decisions.md](docs/design/decisions.md) |
| Open questions | [docs/design/open-questions.md](docs/design/open-questions.md) |
| Documentation index | [docs/INDEX.md](docs/INDEX.md) |
| Schema work | [schemas/](schemas/) |
| TypeScript implementation | [src/](src/) |
| Running demos | `npm run match`, `npm run trust`, `npm run trace` |
| Agent integration | [docs/design/agent-integration-plan.md](docs/design/agent-integration-plan.md) |
| Trust system | [docs/design/trust-implementation-plan.md](docs/design/trust-implementation-plan.md), [src/trust/](src/trust/) |
| Matching algorithm | [docs/design/chain-discovery.md](docs/design/chain-discovery.md), [src/matching/](src/matching/) |
| Architecture diagrams | [docs/diagrams/c4-model.md](docs/diagrams/c4-model.md) |

### Key Entry Points

- **New to project**: Start with README.md, then [docs/research/initial-exploration.md](docs/research/initial-exploration.md)
- **Resuming work**: Check [STATUS.md](STATUS.md) for current state and next priorities
- **Schema changes**: Check [docs/design/schema-revision-plan.md](docs/design/schema-revision-plan.md) first
- **Adding features**: Review existing patterns in [src/](src/) before starting
- **Understanding decisions**: [docs/design/decisions.md](docs/design/decisions.md) has rationale for all major choices

## Session Workflow

**Starting a session:**
```
/session-start
```
This reads STATUS.md and shows current state, recent session summary, and next priorities.

**Ending a session:**
```
/session-end
```
This updates STATUS.md with what was done, runs verification, and suggests CHANGELOG updates.

## Information Hierarchy

Each piece of information has one authoritative source. Other documents link or summarise.

| Information | Primary Source | Summaries In |
|-------------|----------------|--------------|
| Project philosophy | [PHILOSOPHY.md](PHILOSOPHY.md) | CLAUDE.md, README.md |
| Project state | [STATUS.md](STATUS.md) | README.md, CLAUDE.md |
| Work package status | [docs/design/work-packages.md](docs/design/work-packages.md) | docs/INDEX.md |
| Design decisions | [docs/design/decisions.md](docs/design/decisions.md) | — |
| Open questions | [docs/design/open-questions.md](docs/design/open-questions.md) | — |
| Phase 1 readiness % | [STATUS.md](STATUS.md) | README.md, CLAUDE.md, CHANGELOG.md |

**When updating, always update the primary source first.**

## Design Principles

See [PHILOSOPHY.md](PHILOSOPHY.md) for the full philosophy including the core insight, design principles with rationale, active tensions, and future horizon.

Summary of the 8 principles:
1. **Subjective value over shared currency**
2. **Protocol over platform**
3. **Business-to-business focus**
4. **Pragmatic framing, radical intent**
5. **Professional management over volunteer enthusiasm**
6. **Trust through relationships, not ratings**
7. **Human accountability in the loop**
8. **Sustainable and efficient operation**

## Style Guidelines

- Use British English (colour, organisation, behaviour)
- Prefer concrete examples over abstract descriptions
- Document design decisions with rationale
- Keep schemas minimal — add complexity only when proven necessary

## Verification Checklist

Before ending a session, verify:

1. **Build passes**: `npm run build`
2. **Schemas valid**: `npm run validate`
3. **Examples valid**: `npm run validate:examples`
4. **Types generated**: `npm run generate:types`
5. **STATUS.md updated**: Document what was done and what's next
6. **CHANGELOG.md updated**: If substantive changes were made

## Working Notes

- Transcript from initial exploration: [docs/research/initial-exploration.md](docs/research/initial-exploration.md)
- Key historical lessons: [docs/research/historical-systems-deep-dive.md](docs/research/historical-systems-deep-dive.md)
- Design questions to resolve: [docs/design/open-questions.md](docs/design/open-questions.md)
- Version history: [CHANGELOG.md](CHANGELOG.md)
