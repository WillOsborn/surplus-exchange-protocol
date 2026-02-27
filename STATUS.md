# Project Status

*Last updated: 2026-02-27*

## Current State

### What's Working
- Core schemas compile and validate (`npm run validate`)
- TypeScript types generated from schemas (`npm run generate:types`)
- Matching algorithm with 8-dimension scorer (`npm run match`)
- Trust calculation with 4-tier model (`npm run trust`)
- Protocol trace with 3 scenarios (`npm run trace`)
- Capability translation — offline (`npm run capability`) and interactive (`npm run capability:live`)
- All example data validates against schemas

### What's In Progress
- **Developer Documentation** (WP7) — Developer guide for agent integration

### Known Issues
- No test suite yet (`npm test` is placeholder)
- Some documentation may reference deprecated `agent_matching` terminology

---

## Phase 1 Readiness: 95% Complete

**Completed:**
- [x] Core schemas (need, offering, participant, exchange-chain, trust-profile)
- [x] Matching algorithm implementation
- [x] Trust calculation system
- [x] Agent integration analysis and boundary definition
- [x] Terminology clarification (`agent_matching` → `capability_matching`)
- [x] User journey diagrams (human, delegated, autonomous)
- [x] **Capability Translation System** (WP8) — Core matching proven; schemas contain capacity, constraints, capability outputs

**Remaining:**
- [ ] Developer guide for agent integration (WP7)

---

## Recent Session Summary

*Session: 2026-02-27 (demo enrichment — executable protocol documentation)*

**What was done:**
- **Executed 8-task demo enrichment plan** (`docs/plans/2026-02-27-demo-enrichment-plan.md`) across 2 sessions
- **Task 0**: Added Newcomer tier to trust module (`src/trust/calculator.ts`, `src/trust/vouching.ts`)
- **Task 1**: Enriched core scorer with 3 new dimensions — surplus sensitivity, relationship diversity, sector overlap (`src/matching/scorer.ts`), total 8 dimensions
- **Task 2**: Enriched example JSON data with surplus context, geographic constraints, timing windows, urgency
- **Task 3**: Rewrote match demo to use core scorer with constraint filtering, 8-dimension breakdowns, top-3 detailed output
- **Task 4**: Enriched trust demo with 4-tier model, narrateTrustScore helper, newcomer exposure limits, vouch acceleration
- **Task 5**: Rewrote trace demo with self-contained characters and 3 scenarios (happy path, counter-proposal, stuck flag) showing protocol messages alongside state transitions
- **Task 6**: Created offline capability demo with 3 pre-recorded scenarios (good match, partial match, no match); moved interactive demo to `capability:live`
- **Task 7**: Full verification — build, schemas, examples, all 4 demos pass

**Key decisions:**
- All demos are now self-contained executable documentation — no external dependencies or API keys needed for default runs
- Core scorer uses deal-breaker pattern for trust and geographic dimensions (fail → score 0, not weighted average)
- `npm run capability` now runs offline mode; `npm run capability:live` for interactive AI extraction

**Files created:**
- `src/examples/capability-offline-demo.ts`

**Files modified:**
- `src/trust/calculator.ts`, `src/trust/vouching.ts` (Newcomer tier)
- `src/matching/scorer.ts` (3 new scoring dimensions)
- `src/examples/match-demo.ts` (core scorer integration)
- `src/examples/trust-demo.ts` (4-tier enrichment)
- `src/examples/trace-chain.ts` (complete rewrite)
- `src/examples/capability-demo.ts` (interactive mode intro)
- `package.json` (capability script split)
- `examples/matching/offerings.json`, `needs.json`, `participants.json` (enriched data)
- `examples/trust/profile-newcomer.json` (new trust profile)

**Issues encountered:**
- Import naming mismatch (`Offering`/`Need` vs `ScorerOffering`/`ScorerNeed` re-exports) — fixed
- Unused import (`validateVouch`) after trust demo refactor — fixed

**Next priorities:**
1. Q8 (Network Bootstrapping) and Q9 (Taxation & Compliance) — remaining unanalysed questions
2. Developer Guide (WP7) — may be reframed given "conceptual provocation" positioning
3. Website content review against updated diagrams

---

*Session: 2026-02-27 (diagram review and update)*

**What was done:**
- **Comprehensive review and update of all 4 architecture diagrams** in `docs/diagrams/` against latest design decisions from Q1-Q7 and Q10 analysis
- Deployed 4 parallel agents (one per diagram file) plus a code-review agent for cross-file consistency checking
- **c4-model.md** (major updates):
  - Container Diagram: Added 5 new containers (Governance & Monitoring Service, Participant Transparency Service, Identity Verification Service, Escalation & Recourse Service, Onboarding Service) — reflects the 7→12 container expansion from consolidated design
  - Trust Engine component: Added Newcomer tier, corrected vouching (accelerator not gate, Established + Anchor can vouch), corrected all exposure limits, renamed satisfaction → fulfilment signals, added 180-day network position decay, per-participant failure attribution
  - Matching Engine component: Added relationship diversity, cross-cluster incentive, participation discount, hard cap enforcement, concentration limit check, Decision Log output feeding Transparency Service
  - Trust Tier Progression: Added Newcomer tier, fixed entry path (identity verification, no vouch required), corrected all promotion criteria, bounded Anchor limits
  - Exchange Chain Lifecycle: Fulfilment signals throughout, added STUCK state with escalation routing
  - Schema Relationships: Renamed to FULFILMENT SIGNALS
  - Technology Stack: Fixed ASCII art overflow
- **human-journey.md** (moderate updates):
  - Onboarding: Identity verification with 3 paths, cultural onboarding, Newcomer tier assignment
  - Matching: Added matching profile visibility step
  - Execution: Added stuck flag branch, fulfilment signals replace satisfaction
  - Sequence diagram: New stuck flag alt block, new matching profile section
  - ER diagram: FULFILMENT_SIGNAL replaces SATISFACTION
- **delegated-agent-journey.md** (minor updates):
  - Agent registration notes Newcomer tier with structural limits
  - Satisfaction → fulfilment signals in execution, human checkpoints, decision logic
  - Added stuck flag handling in execution flow
- **autonomous-agent-journey.md** (minor updates):
  - Agent starts at Newcomer tier (not Probationary)
  - Concentration limit check in negotiation flow
  - Fulfilment signals replace trust signals throughout
  - Governance constraints in learning loop
  - New concentration limit safeguard
  - Network effects: "Governance-bounded optimisation" replaces "Market-like price discovery"
- **Cross-file review** found and fixed 3 small issues: stray "Satisfaction" reference, capitalisation inconsistency, ASCII art overflow

**Key decisions:**
- Diagrams now reflect the full consolidated design (Q1-Q7, Q10) rather than just the original Phase 1 implementation
- The C4 container diagram shows the full 12-container architecture, with new services clearly delineated
- "NEW SERVICES" section in the container diagram separates original containers from governance/transparency/onboarding additions
- No changes to the Multi-Party Chain Discovery visualisation (still accurate)

**Files modified:**
- `docs/diagrams/c4-model.md` (substantial rewrite — all sections updated)
- `docs/diagrams/human-journey.md` (moderate updates across all 3 levels)
- `docs/diagrams/delegated-agent-journey.md` (minor updates)
- `docs/diagrams/autonomous-agent-journey.md` (minor updates)

**Issues encountered:**
- One stray "Satisfaction confirmed" reference in autonomous-agent-journey.md missed by the agent — caught and fixed in review pass
- ASCII art overflow in Technology Stack section of c4-model.md — fixed in review pass

**Next priorities:**
1. Q8 (Network Bootstrapping) and Q9 (Taxation & Compliance) — remaining unanalysed questions
2. Developer Guide (WP7) — may be reframed given "conceptual provocation" positioning
3. Website content review against updated diagrams

---

*Session: 2026-02-27 (website content update)*

**What was done:**
- **Comprehensive website content update** — Reshaped all 8 pages to reflect the "protocol is the story" framing and intellectual maturity from analysing 8 of 10 open questions
- **New page: philosophy.html** — Created from PHILOSOPHY.md, presenting 8 design principles with trade-offs, 8 active tensions with positions, and horizon section
- **Restructured questions.html** — Was 7 outdated questions all showing "Open" or "Partial"; now 10 questions grouped by status: 7 Analysed (green), 1 Partial (amber), 2 Open (red), each with brief position summaries
- **Trust sections updated** — All trust content now shows 4-tier model (Newcomer → Probationary → Established → Anchor), vouching reframed as accelerator not gate, commitment-based accountability language
- **Homepage updated** — Middle pathway card links to Philosophy ("See the Thinking"), credibility signal changed to "Hard questions, honest answers", hero button simplified to "How It Works"
- **Technical and code pages updated** — Added Newcomer tier to trust diagrams, capability translation demo, updated agent integration/federation descriptions
- **Navigation updated across all pages** — Philosophy added to nav and footer, "Open Questions" → "Hard Questions" in all footers and exit points
- **CSS updated** — Added `.tier--newcomer` styling
- **Browser review completed** — All 8 pages verified, caught and fixed 3 exit-point links still saying "Open Questions"

**Key decisions:**
- Philosophy gets its own page rather than overloading the-idea.html
- Questions page restructured to show intellectual maturity — "We've thought about the hard parts"
- "Open Questions" renamed to "Hard Questions" site-wide
- Tiered presentation maintained: website tells protocol story, links to docs for depth

**Files created:**
- `Website/site/philosophy.html`

**Files modified:**
- `Website/site/questions.html` (complete rewrite)
- `Website/site/index.html` (pathway card, credibility signal, hero button)
- `Website/site/the-idea.html` (new principles, philosophy bridge, exit points)
- `Website/site/how-it-works.html` (trust tiers, vouching, accountability)
- `Website/site/technical.html` (trust tiers, capability translation, exit points)
- `Website/site/code.html` (capability demo, agent integration, exit points)
- `Website/site/scenarios.html` (exit points)
- `Website/site/css/styles.css` (Newcomer tier CSS)

**Issues encountered:**
- Some exit-point links missed during initial subagent updates — caught during browser review
- journey-demo.html still has one "Open Questions" reference (left for future update)

**Next priorities:**
1. Q8 (Network Bootstrapping) and Q9 (Taxation & Compliance) — remaining unanalysed questions
2. Developer Guide (WP7) — may be reframed given "conceptual provocation" positioning
3. journey-demo.html nav update if demo pages are revisited
4. Add links to GitHub design docs from questions.html once code is on GitHub

---

*Session: 2026-02-27 (website layered reading — visual polish)*

**What was done:**
- **Continued "Layered Reading" implementation** for website pages (Tasks 12-13 of 13-task plan from `docs/plans/2026-02-27-layered-reading.md`)
- **Visual review and polish** (Task 12) — reviewed all four pages (Philosophy, Scenarios, How It Works, Technical) at desktop and mobile widths using Playwright browser testing
  - Fixed trust tier diagram overflow on How It Works page (concept card expanding to 848px, crushing detail column)
  - Fixed vertical process flow alignment (Matching and Exchange sections) — switched from flex to CSS Grid for proper number/title/description alignment
  - Fixed summary table formatting — "Component" column header was indistinguishable from data rows; added `.summary-table` class with uppercase small headers and stronger border
  - Added missing chain diagrams to Scenarios page — Arts & Culture (pentagon, 5 nodes) and Startup Bootstrap (square, 4 nodes) now have SVG diagrams matching the existing Cross-Industry and Professional Services diagrams
  - Added `overflow: visible` to `.scenario-chain svg` to prevent label clipping on pentagon diagram

**Files modified:**
- `Website/site/css/styles.css` — Process flow grid layout, trust tier overflow fix, summary table styles, SVG overflow fix
- `Website/site/how-it-works.html` — Added `summary-table` class to summary table
- `Website/site/scenarios.html` — Replaced blockquote text with SVG chain diagrams for Arts & Culture and Startup Bootstrap scenarios

**Issues encountered:**
- Playwright browser crash due to conflicting user-data-dir session (resolved by clearing cache)

**Next priorities:**
1. Final code review of entire layered reading implementation (Task 13)
2. Website content review against "protocol is the story" framing
3. Q8 (Network Bootstrapping) and Q9 (Taxation & Compliance) — remaining unanalysed questions

*For earlier session history (Feb 12–26), see [docs/session-log.md](docs/session-log.md).*

---

## Next Priority

1. **Q8 (Network Bootstrapping) and Q9 (Taxation & Compliance)** — remaining unanalysed questions
2. **Developer Guide** (WP7) — may be reframed given "conceptual provocation" positioning
3. **Website content review** against updated diagrams

---

## Future Work

### Backlog (Pre-Launch)
- [ ] Animated UX prototype for website — Demonstrate the matching/exchange flow visually

### Technical Debt
- [ ] Test suite for matching algorithm (`src/matching/`)
- [ ] Test suite for trust calculation (`src/trust/`)
- [ ] Schema validation tests
- [ ] Integration tests for protocol flows
- [ ] DEPLOYMENT.md with setup instructions

### Phase 2 Roadmap
- Explicit delegation bounds implementation
- Conditional auto-confirmation within bounds
- Principal accountability chain
- Bounded-fast lane for delegated agents

### Phase 3+ Roadmap
- Autonomous buyer participant type
- M2M satisfaction metrics
- Fast lane for fully autonomous chains
- Multi-agent networks (collective identity, governance)

---

## Quick Links

- [CHANGELOG.md](CHANGELOG.md) — Version history
- [docs/INDEX.md](docs/INDEX.md) — Documentation index
- [docs/design/decisions.md](docs/design/decisions.md) — Design decisions
- [docs/design/open-questions.md](docs/design/open-questions.md) — Open questions
