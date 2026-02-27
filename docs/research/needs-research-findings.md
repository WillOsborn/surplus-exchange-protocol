# Needs Research Findings

**Status**: Complete
**Last Updated**: 2026-02-05
**Researcher**: need-researcher subagent

## Executive Summary

This research analyses how various systems represent participant needs, from marketplaces and job boards to barter networks and recommendation systems. The key findings reveal a tension between **specification completeness** (enabling precise matching) and **user friction** (reducing barriers to participation).

**Core insight for SEP**: The most successful need representations share three characteristics:
1. **Structured essentials, flexible details** - Core fields are standardised; context-specific fields are optional
2. **Outcome-oriented language** - Focus on what the requester wants to achieve, not just what they want to receive
3. **Progressive disclosure** - Start simple, elaborate through interaction or inference

SEP's unique challenge is representing needs without monetary anchors. The recommended approach combines explicit need declarations with AI-inferred need signals, using capability mappings to bridge "what I want" to "what others offer."

---

## Systems Analysed

### Marketplaces

#### Upwork/Fiverr

**How needs are represented**:

Upwork structures job postings with:
- **Required fields**: Title, description, category, budget type (fixed/hourly), required skills
- **Optional fields**: Experience level, project duration, attachment files, screening questions
- **Implicit signals**: Client history, previous hires, verification status

Fiverr inverts this with "Buyer Requests" where buyers post needs against seller categories:
- Brief description (up to 2,500 characters)
- Budget range
- Delivery timeline
- Category selection

**Key patterns**:
- **Skill tagging**: Both systems use standardised skill taxonomies (e.g., "React", "Logo Design", "Financial Analysis")
- **Budget anchoring**: Needs are framed around monetary value, which SEP must replace
- **Screening questions**: Optional custom questions help providers self-select
- **Attachment support**: Complex needs include reference files, briefs, examples

**SEP applicability**: HIGH for skill taxonomy approach; ADAPT for budget replacement. The capability mapping in SEP's offering schema already addresses translation - needs should reference compatible capability outputs.

#### Alibaba RFQ (Request for Quotation)

**How needs are represented**:

Alibaba's RFQ system structures procurement needs with:
- **Product details**: Name, category, quantity, unit, specifications
- **Quality requirements**: Certifications, standards compliance, testing requirements
- **Logistics preferences**: Shipping terms (FOB, CIF, etc.), destination port, packaging
- **Commercial terms**: Payment terms, trade assurance preferences
- **Timeline**: Quotation deadline, delivery deadline

**Key patterns**:
- **Category-driven templates**: Different product categories trigger different required fields
- **Specification richness**: Detailed technical requirements reduce quote variance
- **Supplier pre-qualification**: Buyers can specify minimum supplier requirements (verified, gold supplier, etc.)
- **Multi-supplier broadcasting**: Single RFQ reaches multiple potential suppliers

**SEP applicability**: MEDIUM. The detailed specification approach works for physical goods but creates friction for services. The supplier pre-qualification maps to SEP's trust tiers.

#### AngelList (now Wellfound)

**How needs are represented**:

For talent acquisition:
- **Role fundamentals**: Title, description, location (or remote), team size
- **Requirements**: Skills, experience level, visa sponsorship status
- **Company context**: Stage, funding, culture keywords
- **Compensation**: Equity range, salary range, benefits list

For startup resources:
- Less structured - typically through pitch decks and introductions
- Investor matching based on thesis fit, stage preferences, check size

**Key patterns**:
- **Stage-appropriate fields**: Early-stage roles have fewer requirements than later-stage
- **Culture signalling**: Values, work style, and mission prominently featured
- **Equity representation**: Non-monetary compensation clearly structured
- **Two-sided matching**: Roles have fit scores based on candidate preferences

**SEP applicability**: HIGH. The stage-appropriate complexity and non-monetary compensation representation directly apply. Cultural fit fields could translate to SEP's sector and values matching.

#### Bark.com

**How needs are represented**:

Service requests flow through guided questionnaires:
- **Category selection**: "What service do you need?"
- **Context questions**: Category-specific (e.g., "What type of event?" for catering)
- **Location**: Postcode-based for local services
- **Timeline**: When do you need this?
- **Budget indication**: Often ranges rather than exact figures
- **Contact details**: For provider outreach

**Key patterns**:
- **Wizard-style capture**: Step-by-step reduces cognitive load
- **Categorical branching**: Questions adapt based on previous answers
- **Provider push**: Requests broadcast to providers who pay to respond
- **Low barrier to entry**: Minimal required fields, elaboration through conversation

**SEP applicability**: HIGH for the guided capture approach. The categorical branching could inform SEP's need type differentiation. However, SEP should avoid Bark's pay-to-respond model.

---

### Matching Protocols

#### Dating Apps (Preference Matching)

**How needs are represented**:

Apps like Hinge, Bumble, and Tinder use:
- **Deal-breakers**: Non-negotiable criteria (age range, location radius, etc.)
- **Preferences**: Weighted criteria (height, education, religion)
- **Signals**: Profile interactions, message patterns, swipe behaviour
- **Prompts**: Guided self-disclosure ("I'm looking for...", "My ideal first date...")

**Key patterns**:
- **Explicit vs revealed preferences**: What users say vs what they do
- **Compatibility scoring**: Weighted algorithms combining multiple factors
- **Progressive disclosure**: Basic matching, then detail exploration
- **Feedback loops**: Successful matches inform future recommendations
- **Asymmetric information**: Users don't see how their preferences are weighted

**SEP applicability**: MEDIUM. The explicit/revealed preference tension is instructive - SEP needs should track both declared needs and actual exchange patterns. Deal-breakers map to constraints; preferences map to matching weights.

#### UNOS (Organ Donation Matching)

**How needs are represented**:

The UNOS system represents recipient needs through:
- **Medical urgency**: MELD/PELD scores, status codes
- **Compatibility factors**: Blood type, tissue type, body size
- **Geographic factors**: Donation service area, transport time
- **Time-on-list**: Duration of waiting
- **Prior living donor**: Priority for previous donors

**Key patterns**:
- **Objective urgency scoring**: Algorithmic determination, not self-reported
- **Multi-factor ranking**: Complex weighting of competing priorities
- **Geographic constraints**: Physical logistics built into matching
- **Fairness considerations**: Anti-gaming measures built into scoring
- **Bypass reasons**: Documented reasons when offers are declined

**SEP applicability**: HIGH for urgency representation without price signals. The objective scoring approach suggests SEP could compute need urgency from contextual factors (timing constraints, perishability of offerings) rather than self-reported priority.

#### Job Matching (LinkedIn/Indeed)

**How needs are represented**:

**Employer side (job postings)**:
- **Core**: Title, location, employment type, experience level
- **Requirements**: Skills (required vs preferred), qualifications, experience years
- **Offering**: Salary range, benefits, perks, growth opportunities
- **Context**: Team size, reporting structure, company culture
- **Application requirements**: Resume, cover letter, portfolio, assessments

**Candidate side (profiles/preferences)**:
- **Availability**: Job search status, notice period
- **Preferences**: Location, salary expectations, role type, remote preference
- **Skills**: Self-declared and endorsed
- **Experience**: Structured work history
- **Open to**: Specific job types and titles

**Key patterns**:
- **Bidirectional matching**: Both sides specify preferences
- **Skills as matching currency**: Standardised skill taxonomies enable matching
- **Implicit signals**: Application patterns, profile views, engagement
- **Recommendation blending**: Combining explicit preferences with inferred fit
- **Salary expectation handling**: Often ranges or "negotiable" to reduce mismatch

**SEP applicability**: HIGH. The bidirectional matching and skills-as-currency directly apply. SEP's capability mappings parallel the skills taxonomy approach.

---

### Barter/Exchange Systems

#### ITEX

**How needs are represented**:

ITEX members signal needs through:
- **Want ads**: Posted requests in the marketplace
- **Trade director communication**: Members tell local reps what they're looking for
- **Category browsing**: Viewing specific offering categories signals interest
- **Direct outreach**: Contacting specific members

**Key patterns**:
- **Broker-mediated discovery**: Trade directors actively match, not just passive browsing
- **Relationship-based needs capture**: Regular check-ins surface evolving needs
- **Trade credits as anchor**: Needs framed in terms of trade dollar amounts
- **Multi-party facilitation**: Brokers create chains when direct matches fail
- **Spending pressure**: Credit balances encourage need articulation

**SEP applicability**: HIGH for broker-mediated matching. The AI agent role in SEP parallels trade directors. However, SEP must handle needs without the monetary anchor ITEX uses.

#### Bartercard

**How needs are represented**:

Similar to ITEX:
- **Online marketplace**: Posted wants and offers
- **Regional franchisee brokering**: Local facilitators match needs
- **Trade dollar framing**: Needs expressed in equivalent monetary value
- **Category-based discovery**: Browse offerings by business type

**Key patterns**:
- **Geographic clustering**: Stronger matching within regions
- **Regular spend targets**: Members encouraged to maintain activity
- **Quality assurance**: Dispute resolution for unmet needs
- **Network density**: Success depends on diversity of offerings

**SEP applicability**: MEDIUM. Regional clustering relevant for physical goods; less so for remote services. The quality assurance and dispute mechanisms inform SEP's execution phase.

#### TimeBanks

**How needs are represented**:

TimeBanks use simple request formats:
- **Service type**: What help is needed
- **Description**: Freeform details
- **Location**: Where service is needed
- **Timing**: When help is needed
- **Time estimate**: Expected hours (the "currency")

**Key patterns**:
- **All time equal**: One hour = one time credit regardless of service
- **Simple posting**: Low barrier to entry
- **Coordinator matching**: Human facilitators connect needs and offers
- **Reciprocity tracking**: Members expected to give and receive
- **Community focus**: Local, relationship-based exchanges

**SEP applicability**: LOW for valuation (SEP explicitly rejects "all value equal"); HIGH for simplicity of need capture. The low barrier approach is instructive, but SEP needs more structure for AI matching.

---

### Recommendation Systems

#### Collaborative Filtering

**How needs are inferred**:

Collaborative filtering systems (Netflix, Amazon, Spotify) don't rely on explicit need statements:
- **Behaviour patterns**: Purchase/view/listen history
- **Similar user clustering**: Users with similar histories have similar needs
- **Matrix factorisation**: Latent need factors derived from interactions
- **Temporal patterns**: Need evolution over time

**Key patterns**:
- **Cold start problem**: New users lack history for accurate inference
- **Serendipity**: Surfacing needs users didn't know they had
- **Feedback loops**: Shown items influence future behaviour
- **Explicit overrides**: "Not interested" buttons refine inference

**SEP applicability**: MEDIUM for long-term. Initially, SEP lacks the interaction history for pure collaborative filtering. However, the approach informs how SEP's matching should evolve as exchange history accumulates. The "similar participants have similar needs" logic could enhance discovery.

#### Content-Based Inference

**How needs are inferred**:

Content-based systems build need models from:
- **Explicit preferences**: Stated interests, saved items, followed categories
- **Implicit signals**: Time spent, scroll depth, click patterns
- **Content analysis**: Features of consumed content define preference vectors
- **Profile information**: Demographics, stated interests, professional context

**Key patterns**:
- **Feature extraction**: Needs decomposed into measurable dimensions
- **Profile updating**: Models adapt as new signals arrive
- **Explanation**: "Because you liked X" makes inference transparent
- **Filter bubbles**: Risk of over-fitting to observed behaviour

**SEP applicability**: HIGH for the feature extraction concept. SEP needs could be decomposed into dimensions (sector, timing, scale, geographic scope) that enable content-based matching to offerings. The explanation capability is crucial for human approval of AI-proposed matches.

---

## Pattern Analysis

### Common Approaches

| Pattern | Systems Using It | Strengths | Weaknesses |
|---------|------------------|-----------|------------|
| **Structured categories** | Upwork, Alibaba, Bark, LinkedIn | Fast filtering, consistent matching | Misses edge cases, requires maintenance |
| **Freeform description** | Fiverr requests, TimeBanks | Low friction, captures nuance | Hard to match automatically |
| **Guided wizards** | Bark, dating apps | Progressive disclosure, low cognitive load | Longer capture time |
| **Skill/tag taxonomies** | LinkedIn, Upwork, job boards | Standardised matching currency | Taxonomy maintenance burden |
| **Broker mediation** | ITEX, Bartercard, Sardex | Handles complexity, builds relationships | Doesn't scale without technology |
| **Behavioural inference** | Netflix, Spotify, dating apps | Captures revealed preferences | Cold start, privacy concerns |
| **Bidirectional preferences** | Dating apps, LinkedIn | Both parties filter | Reduces match volume |
| **Urgency scoring** | UNOS, job boards | Prioritises without price | Gaming risk |

### Explicit vs Implicit Needs

Systems handle the explicit/implicit spectrum differently:

**Mostly explicit** (low inference):
- Alibaba RFQ: Detailed specifications required
- UNOS: Medical data objectively captured
- Job postings: Requirements clearly stated

**Mixed** (inference supplements declaration):
- LinkedIn: Stated preferences + engagement patterns
- Dating apps: Profiles + swipe behaviour
- ITEX: Want ads + broker conversations

**Mostly implicit** (high inference):
- Netflix: Viewing history drives recommendations
- Spotify: Listening patterns define taste profile
- Amazon: Purchase and browse history

**SEP positioning**: Start explicit (declared needs), evolve toward mixed as exchange history accumulates. Avoid pure implicit initially due to cold-start limitations.

### Granularity Trade-offs

The research reveals a clear tension:

| Granularity | Friction | Match Precision | Example |
|-------------|----------|-----------------|---------|
| **Very high** | High (complex forms) | High (exact matches) | Alibaba RFQ technical specs |
| **High** | Medium (guided wizards) | Medium-high | Upwork job posts |
| **Medium** | Low-medium | Medium | LinkedIn job searches |
| **Low** | Very low | Low (many false positives) | TimeBanks requests |
| **Inferred** | None (passive) | Variable (depends on data) | Netflix recommendations |

**Optimal for SEP**: Medium granularity with progressive elaboration. Capture essentials upfront; elaborate through AI dialogue or matching feedback.

### Urgency Representation

Without price signals, systems represent urgency through:

1. **Temporal constraints**: "Need by [date]" (most common)
2. **Explicit priority**: "Urgent", "ASAP", priority levels (easily gamed)
3. **Objective scoring**: Medical urgency, wait time (hard to manipulate)
4. **Contextual inference**: Perishability, expiration, business cycle
5. **Willingness to trade off**: Accept less-perfect matches for speed

**SEP recommendation**: Combine temporal constraints (explicit) with contextual factors (inferred). Avoid pure self-reported urgency due to gaming risk. Example: A need linked to perishable inventory or time-limited capacity has objective urgency signals.

---

## Trade-off Analysis

| Approach | Best For | Worst For | SEP Fit |
|----------|----------|-----------|---------|
| **Structured forms** | Commoditised needs, physical goods | Novel/creative needs | Good for core fields |
| **Freeform text** | Complex/unique needs | Automated matching | Good for description |
| **Category trees** | Browsing/filtering | Discovery of unexpected matches | Medium - use for filtering |
| **Tag clouds** | Multi-dimensional needs | Precise specification | Good for capability linking |
| **Broker mediation** | Complex chains, relationship building | Scale, speed | Core to SEP via AI agents |
| **Behavioural inference** | Ongoing refinement | Cold start, new participants | Future enhancement |
| **Bidirectional filtering** | Reducing poor matches | Limiting serendipity | Use sparingly |

---

## SEP Recommendations

### Recommended Approach

**Hybrid need representation with AI-mediated elaboration**:

1. **Core structure**: Minimal required fields capture essential matching dimensions
2. **Capability linking**: Needs reference capability outputs (from offering schema), not raw resources
3. **Constraint separation**: Hard constraints vs soft preferences distinguished
4. **Progressive elaboration**: AI agents can query for additional detail during matching
5. **Inferred enhancement**: Exchange history enriches need understanding over time

### Rationale

This approach fits SEP's context because:

1. **Addresses cold start**: Explicit declaration works from day one; inference grows with history
2. **Enables AI matching**: Structured core fields enable algorithmic chain discovery
3. **Preserves flexibility**: Freeform description handles novelty; AI interprets edge cases
4. **Avoids monetary anchor**: Capability linking focuses on outcomes, not prices
5. **Supports multi-party chains**: Standardised constraint format enables chain feasibility checking

### Schema Draft

See `/prototypes/need-schema-draft.json` for the detailed JSON schema based on these findings.

Key schema design decisions:

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **Required: type, participant, description** | Minimal viable need | May miss matching opportunities |
| **Optional: capability_links** | Enables precise matching when known | Requires capability vocabulary |
| **Separate constraints object** | Clean constraint checking | Additional complexity |
| **Urgency as temporal + contextual** | Avoids gaming | Requires inference capability |
| **Status enum for lifecycle** | Track need evolution | State management overhead |
| **Inferred_signals array** | Progressive enrichment | Requires exchange history |

### Open Questions

1. **Capability vocabulary governance**: Who maintains the mapping between needs and capability outputs? Should this be network-maintained, AI-generated, or emergent from usage?

2. **Need expiration**: How long should unfulfilled needs persist? Auto-archive after X days? Require re-confirmation?

3. **Partial fulfilment**: How should the schema represent partially-met needs? Reduce quantity? Split into sub-needs?

4. **Need privacy levels**: Should some needs be visible only to brokers/agents but not publicly browsable? Different visibility tiers?

5. **Need templates**: Should common need types have pre-built templates (like Alibaba's category-specific RFQ forms)?

6. **Recurring needs**: How to represent ongoing needs vs one-time needs? Subscription-like patterns?

7. **Conditional needs**: "I need X if Y happens" - should contingent needs be supported?

---

## References

### Academic Sources

- Stodder, J. (2009). "Complementary credit networks and macroeconomic stability: Switzerland's Wirtschaftsring." *Journal of Economic Behavior & Organization*, 72(1), 79-95.

- Seyfang, G. & Longhurst, N. (2013). "Growing green money? Mapping community currencies for sustainable development." *Ecological Economics*, 86, 65-77.

- North, P. (2007). *Money and Liberation: The Micropolitics of Alternative Currency Movements*. University of Minnesota Press.

- Resnick, P. & Varian, H.R. (1997). "Recommender systems." *Communications of the ACM*, 40(3), 56-58.

### System Documentation

- Upwork API Documentation (2025). Job Posting Object Specification.
- LinkedIn Recruiter System Design (various industry analyses).
- UNOS Policy 3.5: Allocation of Organs (2024 revision).
- ITEX Member Handbook (2023 edition).
- hCommunity TimeBanking Software Documentation.

### Industry Analysis

- Schor, J. (2010). *Plenitude: The New Economics of True Wealth*. Penguin Press. Chapter on time banks and local exchange.
- Lietaer, B. & Dunne, J. (2013). *Rethinking Money: How New Currencies Turn Scarcity into Prosperity*. Berrett-Koehler Publishers.
