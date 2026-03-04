# Project Status

*Last updated: 2026-03-04*

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

*Session: 2026-03-04 (website alignment execution — how-it-works.html and technical.html)*

**What was done:**
- **Executed the 16-change website alignment plan** (`.claude/plans/wise-stargazing-meadow.md`) across both pages using parallel sub-agents
- **how-it-works.html (changes 1-8)**:
  - Restructured from 3 to 4 components: Describe → Match → Trust → Exchange
  - Moved Subjective Value to concise framing section at top (2-3 sentences + Philosophy link)
  - New "Describe" section: capability translation, natural language interpretation, why AI makes cross-industry matching feasible
  - Refocused Matching section on algorithm (moved "what you describe" content to Describe)
  - Added surplus urgency and relationship diversity to ranking factors
  - Added concentration limits sentence and algorithm transparency paragraph
  - Trust section: added network position decay
  - Exchange section: explicit stuck state escalation path, counter-proposal language, "commitment delivery" terminology
  - Summary table: 4 components + Foundation row
  - Fixed band alternation (Summary band changed to `--bg` after Subjective Value section removal)
- **technical.html (changes 9-16)**:
  - Architecture Overview: 4 components including Capability Description
  - Exchange Orchestration description updated (adjustments, stuck state, escalation)
  - Matching section: capability translation mention in Graph Construction, new "Network Health and Transparency" subsection (concentration limits dual defence + algorithm transparency)
  - Trust section: 180-day half-life decay bullet, updated vouching/cold-start trade-off
  - Design Decisions: 2 new collapsible subsections (Algorithm Transparency, Commitment-Based Accountability), updated count to "Six foundational decisions"
- **Cross-reference review**: checked all overlapping topics (capability translation, concentration limits, transparency, stuck state, counter-proposals, trust decay, commitment-based accountability) — consistent between pages with appropriate detail levels
- **Browser review**: both pages verified visually, all sections render correctly, collapsible subsections work

**Key decisions:**
- "Describe" / "Capability Description" naming split (narrative vs technical) works well
- Band alternation fix: Summary section changed from `--surface` to `--bg` since removing old Subjective Value band left two adjacent same-colored bands
- No CSS changes needed — all content uses existing patterns

**Files modified (website repo — surplus-exchange-protocol-website):**
- `site/how-it-works.html` (changes 1-8: structural restructure + content additions)
- `site/technical.html` (changes 9-16: architecture update + new subsections + design decisions)

**Next priorities:**
1. Check the-idea.html Foundations section renders correctly (label column width, prose styles)
2. Q8 (Network Bootstrapping) and Q9 (Taxation & Compliance) — remaining unanalysed questions
3. Developer Guide (WP7) — may be reframed given "conceptual provocation" positioning
4. Journey demo pages — fix rating scale and terminology
5. Add GitHub design doc links to questions.html

---

*Session: 2026-03-04 (website alignment review — how-it-works.html and technical.html)*

**What was done:**
- **Reviewed how-it-works.html against current SEP state** — identified 7 gaps where recent design work (Q1-Q7, demos, capability translation) isn't reflected on the website
- **Reviewed technical.html** — identified 7 additional gaps (stale design decisions, missing network health/transparency, vouching framing)
- **Discussed and decided on each gap** — where content belongs (how-it-works vs technical), level of detail for each page
- **Key structural decision**: Restructure how-it-works from 3 components to 4 (Describe → Match → Trust → Exchange). The new "Describe" section gives capability translation a proper home and explains why AI makes multi-party matching feasible now. Matching section becomes focused on the algorithm.
- **Key structural decision**: Move Subjective Value from last section to a concise framing section at the top (reminder, not lecture)
- **Developed implementation plan** with 16 changes across both pages, execution strategy using parallel sub-agents

**Key decisions:**
- "Describe" as the name for the new first component
- Subjective Value: 2-3 sentence framing at top, not full section
- Concentration limits + algorithm transparency grouped into one "Network Health and Transparency" subsection on technical.html (avoids section bloat)
- Capability translation included in this round (fills a narrative gap in the matching flow)
- "Satisfaction" terminology kept on website (conscious decision from earlier session)

**Plan file:** `.claude/plans/wise-stargazing-meadow.md` — 16 changes, execution strategy with parallel agents, verification steps

**No files modified** (planning session only, except STATUS.md)

**Next:** Execute the plan in a new session using parallel sub-agents

---

*Session: 2026-03-04 (website — homepage value prop rewrite and the-idea.html Foundations section)*

**What was done:**
- **Rewrote the homepage value proposition** from scratch across several iterations — the old text opened with a confusing "you" and buried the concept behind an example chain nobody could follow on first read
- **New structure**: problem (the matching problem) → solution (algorithm finds chains directly) → context (money was the old workaround, with its own problems) → "We can do better."
- **Visual improvements to value prop section**: added "PROPOSITION" eyebrow, left-aligned text (was centered), added thin top border for visual separation from hero, reduced from 3 to 2 typography levels
- **Renamed "Key Principles" to "Foundations"** on the-idea.html — "Key Principles" conflicted with "Design Principles" on philosophy.html; "Foundations" is distinct and accurate
- **Reformatted Foundations section** using the existing `principle-item` layout (title left, body right, no numbers) — matches the philosophy page's Design Principles layout for easier skimming
- Updated bridging paragraph: "These principles" → "These foundations"

**Key decisions:**
- "PROPOSITION" as eyebrow label — honest, fits PoC positioning, doesn't overclaim
- "We can do better." as closing line for money paragraph — punchy, action-oriented
- "Foundations" as section name (not "Key Principles", "Project Scope", etc.)
- Reused existing `principle-item` CSS rather than creating new classes
- Left-aligning the value prop text was the single most impactful visual fix

**Files modified (website repo — surplus-exchange-protocol-website):**
- `site/index.html` (value prop text rewrite, eyebrow, left-align)
- `site/css/styles.css` (value-prop: text-align left, border-top, padding-top)
- `site/the-idea.html` (Foundations section rename and principle-item layout)

**Issues encountered:**
- Centered value prop text was making the section feel adrift — left-align resolved it
- No visual distinction between hero and value prop sections — eyebrow + top border resolved it

**Next priorities:**
1. Check the-idea.html Foundations section renders correctly (label column width, prose styles inside principle-item)
2. Q8 (Network Bootstrapping) and Q9 (Taxation & Compliance) — remaining unanalysed questions
3. Developer Guide (WP7) — may be reframed given "conceptual provocation" positioning
4. Journey demo pages — fix rating scale and terminology
5. Add GitHub design doc links to questions.html

---

*Session: 2026-02-27 (website deployment prep and homepage layout redesign)*

**What was done:**
- **Prepared website for deployment** to Hostinger at sep.willosborn.xyz — walkthrough of subdomain setup, file manager upload, SSL, and post-upload verification checklist
- **Applied user feedback**: moved interactive demo section above audience pathways on homepage (friend's suggestion — visitors should interact with the demo before choosing a deeper path)
- **Redesigned homepage layout**: pathway cards now stack vertically in the demo section's left column, filling the dead space below the intro text; separate Audience Pathways section removed
- **Added "Go deeper" eyebrow** to introduce the stacked pathway cards
- **Compacted pathway cards** for narrower column — smaller type, hidden meta text on desktop (restored on mobile)
- **Differentiated "Chain discovered" result box** — plain border instead of orange accent bar, so it reads as explanation rather than navigation

**Key decisions:**
- Pathway cards integrated into demo section rather than being a separate page section — uses vertical space more efficiently
- Result box visual language deliberately different from pathway cards (full border vs accent left-border)
- Card body copy slightly shortened for the narrower column width

**Files modified (website repo — surplus-exchange-protocol-website):**
- `site/index.html` (layout redesign — pathways in demo column, inline style overrides, result box differentiation)

**Issues encountered:**
- Port 8080 already in use for local preview server — used 8091

**Next priorities:**
1. Q8 (Network Bootstrapping) and Q9 (Taxation & Compliance) — remaining unanalysed questions
2. Developer Guide (WP7) — may be reframed given "conceptual provocation" positioning
3. Journey demo pages — fix rating scale and terminology
4. Add GitHub design doc links to questions.html

---

*Session: 2026-02-27 (website update — demo content, cleanup, GitHub URLs)*

**What was done:**
- **Updated technical.html** to reflect enriched demos — matching section now describes multi-dimensional scoring, constraint filtering, surplus urgency, and relationship diversity; trust section corrected vouching (Established or Anchor); Start Here section updated with capability translation entry points, demo commands, and repository structure
- **Updated code.html** with enriched demo descriptions (subsequently deleted — see below)
- **Discovered code.html was orphaned** — no page linked to it. Migrated the experimental warning to technical.html and deleted code.html
- **Added experimental warning** to technical.html with polished styling (accent left-border, generous padding) matching the site's callout pattern
- **Updated all GitHub URLs site-wide** from `github.com/surplus-exchange/protocol` to `github.com/WillOsborn/surplus-exchange-protocol` across all 7 HTML pages (nav, footer, exit points, CTAs, license links)
- **Tidied tooling references** — updated `.claude/commands/audit.md` examples (removed stale `--exclude Website`), updated `CLAUDE.md` website repo link

**Key decisions:**
- Keep "satisfaction" on the website rather than renaming to "fulfilment" — more accessible to non-technical readers
- Use qualitative descriptions of demos (not exact dimension counts) to avoid staleness
- Journey demo pages (`journey-demo.html`, `journey-demo-a.html`, `journey-demo-b.html`) excluded — they have deeper issues (1-5 rating scale doesn't match signal model) that need a separate pass
- code.html deleted rather than maintained — all useful content captured on technical.html or GitHub

**Files modified (website repo — surplus-exchange-protocol-website):**
- `site/technical.html` (demo content updates + experimental warning + GitHub URLs)
- `site/index.html`, `site/the-idea.html`, `site/philosophy.html`, `site/how-it-works.html`, `site/scenarios.html`, `site/questions.html` (GitHub URLs)
- `site/css/styles.css` (experimental warning CSS)

**Files deleted (website repo):**
- `site/code.html`

**Files modified (main repo):**
- `.claude/commands/audit.md` (removed stale Website references)
- `CLAUDE.md` (updated website repo link)

**Issues encountered:**
- Browser CSS caching caused new styles not to appear until cache was busted
- `--radius-md` CSS variable didn't exist in the design system — fixed by switching to the site's established callout pattern (thick left border)

**Next priorities:**
1. Q8 (Network Bootstrapping) and Q9 (Taxation & Compliance) — remaining unanalysed questions
2. Developer Guide (WP7) — may be reframed given "conceptual provocation" positioning
3. Journey demo pages — need separate pass to fix rating scale and terminology
4. Add links to GitHub design docs from questions.html

---

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

1. **Check the-idea.html Foundations section** — verify label column width and prose styles render correctly in browser
2. **Q8 (Network Bootstrapping) and Q9 (Taxation & Compliance)** — remaining unanalysed questions
3. **Developer Guide** (WP7) — may be reframed given "conceptual provocation" positioning
4. **Journey demo pages** — fix rating scale and terminology (separate website repo)
5. **Add GitHub design doc links** to questions.html

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
