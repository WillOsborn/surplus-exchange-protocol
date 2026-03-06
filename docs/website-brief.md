# Surplus Exchange Protocol — Website Brief

*A comprehensive description for redesigning the SEP website.*

---

## What Is the Surplus Exchange Protocol?

The Surplus Exchange Protocol (SEP) is an AI-mediated system for matching and facilitating exchanges of surplus capacity between businesses — without using money as an intermediary.

**The core insight:** Money was invented to solve the "double coincidence of wants" — the baker needs what the carpenter has, but the carpenter doesn't need bread. Money bridged that gap. But money introduced its own costs: intermediaries, interest, timing mismatches, artificial scarcity. The insight is that AI can now solve the matching problem directly, finding multi-party exchange chains (A gives to B, B gives to C, C gives back to A) that humans couldn't compute. This potentially reduces the need for capital while redirecting value toward participants rather than financial intermediaries.

**Current state:** This is a proof-of-concept / conceptual provocation. There is working code (matching algorithm, trust system, protocol state machine, capability translation), detailed design documents analysing 10 hard questions, and JSON schemas defining the protocol — but no live network or production deployment. The project has been developed by one person with AI assistance.

**Historical precedent:** This isn't a new idea in spirit. The WIR Bank in Switzerland has run a complementary currency system for 90 years with 60,000+ businesses and CHF 2 billion in annual volume. Sardex in Sardinia serves 4,000+ businesses with EUR 50M+ annually. What's new is the proposition that AI matching can make multi-party chains feasible at scale without requiring a shared currency unit at all.

---

## What the Website Needs to Do

The website serves as the public face of a proof-of-concept. It needs to:

1. **Explain a complex idea clearly** — most visitors will never have encountered anything like this
2. **Establish intellectual credibility** — show this isn't naive utopianism but a serious, well-thought-through design
3. **Serve multiple audiences** — business people, technologists, economists, designers, and the curious all arrive with different questions
4. **Be honest about what exists and what doesn't** — this is a PoC, not a product; transparency builds trust
5. **Invite engagement** — the project is open source and benefits from scrutiny and contribution

The tone should be **confident but humble**, **pragmatic in framing but radical in implication**, and **intellectually honest** about hard problems and open questions.

---

## Audiences

### 1. Business Leaders / Operators
**Arriving question:** "Could this actually work for my business?"
**What they need:** Clear explanation of the mechanism, concrete scenarios they recognise, honest assessment of what's real vs. aspirational.
**Typical journey:** Home → The Idea → How It Works → Scenarios → Hard Questions

### 2. Designers / Strategists
**Arriving question:** "How would this work in practice?"
**What they need:** Scenarios showing real exchanges, the design thinking behind decisions, how different participant types interact.
**Typical journey:** Home → Scenarios → How It Works → Philosophy

### 3. Developers / Protocol Architects
**Arriving question:** "How is this built? Can I integrate with it?"
**What they need:** Architecture overview, schema definitions, algorithm details, code orientation, GitHub access.
**Typical journey:** Home → Technical → GitHub → Code

### 4. Economists / Policy Thinkers
**Arriving question:** "What are the implications? Has this been thought through?"
**What they need:** Design principles, analysis of hard questions (taxation, labour effects, governance), historical precedent, philosophical positioning.
**Typical journey:** The Idea → Philosophy → Hard Questions

### 5. Curious Generalists
**Arriving question:** "What is this?"
**What they need:** A clear hook, an interactive demo that makes the concept tangible, and clear pathways to go deeper based on what interests them.
**Typical journey:** Home → Interactive demo → whichever pathway catches their interest

---

## Pages

### 1. Home Page

**Purpose:** First impression. Explain the concept in 10 seconds, prove it's real, and route visitors to the right deeper content.

**Key content:**
- **Hero:** Short, punchy headline. The current one is "Trade what you have. Get what you need. No money required." — it works well. Brief description of the mechanism (algorithm finds exchange chains). Primary CTAs.
- **Value proposition:** 2-3 paragraphs explaining the core insight — money solved matching, but introduced costs; AI can solve matching directly. Position as proof-of-concept, not product.
- **Interactive demo:** A network of 6 fictional local businesses. Click "Find Chains" and the algorithm discovers a 4-party exchange chain, animated on screen. This is the single most important element — it makes the abstract concept tangible in seconds.
- **Audience pathways:** 3 cards routing visitors based on interest (Scenarios for the practical, Philosophy for the curious, Technical for builders).
- **Credibility signals:** Historical precedent (90 years, WIR Bank), working code, depth of analysis. These are compact — stat + one sentence each.
- **Pull quote:** "Your spare Friday is someone else's missing piece."

**Design notes:** The interactive demo is load-bearing — it does more explanatory work than any paragraph. It should be prominent and delightful.

---

### 2. The Idea

**Purpose:** Establish the conceptual foundation. Why does this exist? What problem does it solve? Why now?

**Key content:**
- **The problem money solves:** Double coincidence of wants, explained through a simple example (baker and carpenter). Money was the solution.
- **The cost of money:** Intermediaries, interest, timing gaps, artificial scarcity. Money works, but it extracts value.
- **What's now possible:** AI can find multi-party chains directly. Example: baker→designer→lawyer→carpenter. Why now: LLMs for capability translation, network analysis for matching, reputation systems for trust.
- **Foundations (5 key concepts):**
  - *Surplus, not sacrifice* — exchange what would otherwise be wasted
  - *Subjective value* — each participant keeps their own sense of balance, no shared currency
  - *Multi-party chains* — A→B→C→D→A, not just A↔B
  - *Protocol, not platform* — open standard, not a centralised service
  - *Trust through relationships* — earned through track record, not star ratings
- **Historical precedent:** WIR Bank (60,000 businesses, 90 years, CHF 2B annual), Sardex (4,000 businesses, EUR 50M+). Why they worked, why SEP could go further (AI matching removes the density constraint).
- **What this isn't:** Not cryptocurrency, not bartering, not an ideological manifesto. Myth-busting is important — people will immediately reach for the wrong mental model.
- **What exists vs. what doesn't:** Honest status. Working: matching algorithm, trust system, schemas, design analysis. Not working: live network, agent integration, deployment.

---

### 3. Philosophy

**Purpose:** Articulate the design principles and the tensions the project navigates. This page is for people who think deeply about systems.

**Key content:**
- **8 Design Principles** (each with rationale and accepted trade-offs):
  1. Subjective value over shared currency
  2. Protocol over platform
  3. Business-to-business focus
  4. Pragmatic framing, radical intent
  5. Professional management over volunteer enthusiasm
  6. Trust through relationships, not ratings
  7. Human accountability in the loop
  8. Sustainable and efficient operation

- **8 Active Tensions** (each with the conflict, the position taken, and how it's resolved):
  1. Subjective value vs. accountability
  2. Openness vs. trust
  3. Federation vs. momentum
  4. Peer exchange vs. enterprise adoption
  5. Algorithm transparency vs. gaming
  6. Efficiency vs. resilience
  7. Governance weight vs. participant experience
  8. Radical intent vs. pragmatic survival

- **The Horizon:** What could happen if SEP succeeds, presented speculatively with appropriate caveats. This ranges from "success in narrow scope is valuable" through to "restructured value flows" — each step clearly more speculative than the last.

**Design notes:** This is a long, dense page. It needs good navigation (table of contents, reading progress indicator) and clear visual hierarchy to remain scannable.

---

### 4. How It Works

**Purpose:** Explain the mechanism step by step. This is the "how" to The Idea's "why".

**Key content — 4 components:**

1. **Describe (Capability Translation)**
   - Participants describe what they have (surplus) and what they need in natural language
   - AI interprets and translates between different vocabularies (a restaurant's "extra catering capacity" maps to an office's "need for event food")
   - This is what makes cross-industry matching feasible — humans describe things differently, AI bridges the gap

2. **Match (Multi-Party Matching)**
   - All participants and their offerings/needs form a graph
   - Algorithm detects cycles (closed loops where everyone gives and receives)
   - Chains are filtered by constraints (geography, timing, trust) and ranked by quality
   - Ranking considers: match quality, trust levels, chain length, timing alignment, surplus urgency, relationship diversity
   - Key point: the algorithm finds chains humans couldn't compute

3. **Trust (4-Tier Trust System)**
   - Newcomer → Probationary → Established → Anchor
   - Each tier unlocks more capability (larger exchanges, longer chains, vouching for others)
   - Trust earned through: identity verification, successful exchanges, network participation
   - Vouching accelerates trust but isn't required (you can progress through track record alone)
   - Network position decays over time (180-day half-life) — trust must be maintained

4. **Exchange (Protocol Lifecycle)**
   - Proposal → Confirmation → Execution → Satisfaction
   - All parties must confirm before execution begins
   - Counter-proposals are possible (adjusting scope/timing)
   - Stuck states have escalation paths
   - Satisfaction signals are subjective (each participant rates from their own perspective)

   *Terminology note: We use "Satisfaction" rather than "Fulfilment" deliberately. "Fulfilment" is ambiguous — it could mean the practical action of fulfilling an order (logistics, delivery). "Satisfaction" unambiguously refers to a participant's subjective assessment of an outcome, which is what this signal represents.*

**Preceding the 4 components — Subjective Value framing:**
A brief (2-3 sentence) reminder that there's no shared currency. Each participant maintains their own sense of balance. This is the foundation everything else sits on.

**Summary table** at the end mapping each component to what it does.

**Design notes:** Process flow diagrams are essential here. The progression from Describe → Match → Trust → Exchange should be visually clear. Each section needs both a "concept card" (visual summary) and expandable detail.

---

### 5. Scenarios

**Purpose:** Show the mechanism working with realistic examples. Proof by demonstration.

**4 scenarios:**

1. **Cross-Industry Exchange (4 participants)**
   - Flourish Cafe, Nina Chen (bookkeeper), Southside Theatre, Pixel & Press (design studio)
   - Chain: Catering → Design → Venue → Bookkeeping → back to start
   - Key point: "No two could have traded directly. The algorithm found a path that closes the loop."

2. **Arts & Culture Network (5 participants)**
   - Dance collective, videographer, chapel venue, sound studio, poetry collective
   - Pentagon-shaped chain
   - Key point: What becomes possible when matching works — arts organisations can access services they could never afford

3. **Startup Bootstrapping (4 participants)**
   - SaaS startup, solicitor, designer, bookkeeper
   - Square chain
   - Key point: The bootstrap problem — everyone has gaps but no cash for services

4. **Professional Services (3 participants)**
   - Solicitors, caterer, design agency
   - Triangle chain (simplest multi-party exchange)
   - Key point: Even established businesses have surplus capacity

**Each scenario includes:**
- Participant cards (what they have, what they need)
- Chain diagram (SVG showing the flow)
- Outcome grid (who gave what, who received what)
- Brief narrative explaining what's significant about this exchange

**Common threads section:** Surplus not sacrifice, multi-party chains, real business value, trust builds over time.

---

### 6. Technical

**Purpose:** Architecture, algorithms, design decisions, and code orientation for developers.

**Key content (collapsible sections):**

1. **Architecture Overview** — 4-component diagram (Describe, Match, Trust, Exchange) with brief descriptions
2. **Matching Algorithm** — Graph construction, cycle detection (Johnson's algorithm), constraint filtering, 8-dimension scoring
3. **Trust System** — 4-tier model, three-layer evidence (identity, network position, satisfaction signals), decay mechanics
4. **Participant Types & Roadmap** — Current (human), Phase 2 (delegated agents), Phase 3 (autonomous agents)
5. **Key Design Decisions** — 6 decisions with rationale (subjective value, B2B focus, trust model, cycles over direct matching, algorithm transparency, commitment-based accountability)
6. **Schema Overview** — 6 JSON schemas with purposes and example structure
7. **Start Here (open by default)** — Repository structure, npm commands, key entry points, what's working vs. open

**Design notes:** This page should have an experimental/PoC warning prominent at the top. Most sections should be collapsed by default except "Start Here" — developers want to orient quickly, then drill into specifics. Include links to GitHub files throughout.

---

### 7. Hard Questions

**Purpose:** Address criticisms and design challenges. Show that the hard problems have been thought through, and be honest about what's still open.

**10 questions grouped by analysis status:**

**Analysed (7):**
1. Accountability without shared currency
2. Enterprise capture (preventing large players from dominating)
3. Centralisation and federation
4. Trust and gatekeeping
5. Bad actors
6. Algorithm transparency
7. Labour market effects

Each analysed question has: the challenge stated clearly, the position taken, and bullet-point reasoning.

**Partially Analysed (1):**
8. Agent integration — what's been designed, what's unresolved

**Open (2):**
9. Network bootstrapping — how to get from 0 to critical mass
10. Taxation and compliance — legal/regulatory implications

Open questions show: what we think so far, and what we don't know.

**On the Horizon:** Unaddressed questions that are real but further out (physical goods logistics, cross-border exchanges, environmental impact measurement, etc.).

**How to Contribute:** What kinds of input are valuable, link to GitHub Issues.

**Design notes:** Status badges (Analysed / Partial / Open) with colour coding are important — they immediately communicate intellectual depth. The honest "what we don't know" sections are a feature, not a weakness.

---


## Interactive Elements
- **Interactive demo** on homepage (animated chain discovery)
- **Tabbed content** for scenarios (CSS-only, no JS framework)
- **Collapsible sections** (HTML5 details/summary) throughout technical and questions pages
- **Reading progress bar** on long pages
- **Scroll-reveal animations** with stagger timing

### Key Visual Patterns
- **Process flow diagrams:** Numbered steps with connectors (horizontal or vertical)
- **Tier diagrams:** Progression visualisations for trust levels
- **Chain diagrams:** SVG network graphs showing exchange flows
- **Cards:** Consistent treatment for participants, questions, pathways, credibility signals
- **Exit points:** Card-based links to related content at section ends
- **Eyebrow labels:** Small-caps category labels above headings

---

## Content Strategy

### Tone Principles
- **Confident but humble** — "We've thought about this deeply" not "We've solved everything"
- **Pragmatic framing, radical implication** — Lead with mechanism, not ideology
- **Intellectually honest** — Dedicated sections for what we don't know
- **Concrete over abstract** — Every concept demonstrated with an example
- **British English** throughout (colour, organisation, behaviour)

### Credibility Approach
The site builds credibility through three pillars:
1. **Historical precedent** — "This has worked for 90 years" (WIR Bank)
2. **Working code** — "You can run the demos yourself" (GitHub)
3. **Intellectual depth** — "We've analysed the hard questions" (10 design questions, 8 with positions)

### What This Is NOT
The site should never feel like:
- A crypto/Web3 pitch
- A startup landing page promising disruption
- An academic paper
- An ideological manifesto
- A product you can sign up for

It IS:
- A proof-of-concept exploration
- A serious design exercise
- An invitation to think differently about exchange
- Open source and open to scrutiny

---

## Navigation and Information Architecture

### Primary Navigation
SEP (logo) | The Idea | Philosophy | How It Works | Scenarios | Technical | Hard Questions | GitHub

### Footer
Grouped into Explore / Build / Contribute sections with links to all pages plus GitHub Issues and Discussions.

### Cross-Page Linking
Every page ends with "exit points" — 2-3 card-based links to the most relevant next pages. This ensures visitors always have a clear next step regardless of where they entered.

### Table of Contents
Long pages (Philosophy, How It Works, Technical) have anchor-linked tables of contents for quick navigation.

---

## Key Things to Get Right

1. **The interactive demo is the most important element on the site.** It does more to explain the concept than any paragraph. Make it prominent and delightful.

2. **The "What This Isn't" framing is critical.** People will immediately reach for "oh, it's crypto" or "oh, it's bartering." The site needs to redirect these assumptions early.

3. **Honesty is a feature.** The "Hard Questions" page with its status badges (Analysed/Open) and "what we don't know" sections builds more credibility than any amount of confident claims.

4. **Multiple reading depths.** Every page should work for a 30-second scan AND a 10-minute deep read. Use visual hierarchy, collapsible sections, and summary tables.

5. **The scenarios make it real.** Abstract descriptions of "surplus exchange" mean nothing until you see Flourish Cafe getting bookkeeping in exchange for catering that goes to a design studio that does work for a theatre that provides a venue for the bookkeeper's workshop.

6. **Proof-of-concept positioning is deliberate.** The site should feel like an invitation to explore an idea, not a sales pitch. The "Proof of Concept" badge in the nav is important.
