# Surplus Exchange Protocol (SEP)

**What if AI could solve the matching problem that money was invented for?**

Money solved a fundamental challenge: the double coincidence of wants. Before money, you had to find someone who had what you needed *and* needed what you had, at the same time and place. Money abstracted this into a universal medium.

But money also concentrates in certain hands, requires capital to participate, and lets intermediaries extract value at every exchange point.

SEP explores a different approach: AI agents that find complex multi-party exchange chains — A needs from B, B needs from C, C needs from A — across networks that humans couldn't navigate. If matching can be solved algorithmically, some exchanges currently mediated by money could happen without it.

## What this is

SEP is an open protocol for matching and facilitating exchanges of surplus capacity between businesses — without money as a medium of exchange.

We focus on **surplus**: capacity that would otherwise go unused, inventory that would otherwise expire, time that would otherwise be unbilled. The baseline is zero, so anything received in exchange is better than nothing.

This is a conceptual exploration backed by working code, not a product. The protocol is the story; the design thinking is the substance.

## What we've built

- **JSON schemas** defining needs, offerings, participants, exchange chains, and trust profiles
- **A matching algorithm** that finds multi-party exchange cycles in a network graph
- **A trust system** with tiered progression (Newcomer → Probationary → Established → Anchor)
- **Protocol state machine** for managing exchange lifecycle
- **Capability translation** for AI-assisted matching of varied service descriptions

```bash
npm run build              # Compile TypeScript
npm run match              # See the matching algorithm in action
npm run trust              # See trust calculation
npm run trace              # Trace an exchange chain
npm run validate           # Validate all schemas
```

## What we've thought through

This project takes the hard questions seriously. Ten design challenges have been identified through systematic risk analysis, and eight have been deeply analysed:

| Question | Status | Position |
|----------|--------|----------|
| How do you maintain accountability without shared currency? | Analysed | Commitment fulfilment, not balance tracking |
| How do you prevent enterprise capture of a peer system? | Analysed | Behaviour monitoring, not size-based exclusion |
| Managed service or federation? | Analysed | Governed managed service with federation escape hatch |
| How do you maintain trust without gatekeeping? | Analysed | Structural constraints on newcomers, not social gates |
| How do you handle bad actors? | Analysed | Existing mechanisms cover most cases; three gaps filled |
| How transparent should the algorithm be? | Analysed | Full transparency — accept that gaming means aligned incentives |
| What about labour market effects? | Analysed | Governance concern, not protocol concern |
| Network bootstrapping? | Open | |
| Taxation and compliance? | Open | |

Each analysis produced a design document with concrete mechanisms, not just discussion. See [docs/design/open-questions.md](docs/design/open-questions.md) for the full detail.

## Historical context

This project learns from decades of complementary currency experiments:

| System | Outcome | Key Lesson |
|--------|---------|------------|
| WIR Bank (1934–) | Success | Professional management, collateral requirements |
| Sardex (2009–) | Success | Active brokerage, cyclic transaction motifs |
| LETS (1983–) | Mostly failed | Critical mass essential, volunteer burnout |
| Time Banks (1973–) | Limited | "All time equal" is practically problematic |
| ITEX/BizX | Viable | B2B focus, trade directors, tax compliance |

For the full research: [docs/research/historical-systems-deep-dive.md](docs/research/historical-systems-deep-dive.md)

## Where to start

**Interested in the core idea?**
Start with [PHILOSOPHY.md](PHILOSOPHY.md) — the insight, the scope, the design principles, and the tensions we're navigating.

**Want to understand the design decisions?**
See [docs/design/decisions.md](docs/design/decisions.md) for architectural choices with rationale, and [docs/design/open-questions.md](docs/design/open-questions.md) for the harder questions.

**Want to look at the technical implementation?**
Browse [schemas/](schemas/) for the data model, [src/](src/) for the TypeScript implementation, and [docs/specs/](docs/specs/) for formal protocol specifications.

**Want to challenge assumptions?**
[docs/design/unintended-consequences-analysis.md](docs/design/unintended-consequences-analysis.md) is an honest assessment of structural vulnerabilities, and [PHILOSOPHY.md](PHILOSOPHY.md) names eight active tensions the project is navigating.

**Want to see architecture diagrams?**
[docs/diagrams/c4-model.md](docs/diagrams/c4-model.md) has C4 architecture diagrams; the other files in [docs/diagrams/](docs/diagrams/) show participant journeys.

## Contributing

This is an exploratory project. The best way to contribute is to:

1. Review the design documents and challenge assumptions
2. Add scenarios to stress-test the design
3. Propose schema improvements
4. Share knowledge of relevant historical systems

## Development

This project was developed with [Claude Code](https://claude.ai/code). The `.claude/` directory contains AI agents, commands, and skills used during development — see [.claude/README.md](.claude/README.md) for details.

```bash
npm install                # Install dependencies
npm run build              # Compile TypeScript
npm run validate:examples  # Validate example data against schemas
npm run generate:types     # Generate TypeScript types from schemas
```

## Project status

**Phase 1: 95% complete** — See [STATUS.md](STATUS.md) for current state and priorities.

## License

Apache 2.0 — See [LICENSE](LICENSE).
