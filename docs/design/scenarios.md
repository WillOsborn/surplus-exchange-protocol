# Scenario Analysis

**Status**: Living document
**Last Updated**: 2026-02-12

---

This document captures structured analysis of potential failure modes, bad actor scenarios, and edge cases for the Surplus Exchange Protocol.

---

## Scenario: Free Rider

**Type**: Bad actor
**Likelihood**: High
**Impact**: Medium (to network health) / Low (per individual exchange)

### Description

A participant receives value from multiple exchanges but consistently fails to reciprocate. They may:
- Accept matches but then claim unavailability when asked to deliver
- Deliver poor quality that technically meets description
- Accumulate "receiving" while never having "surplus" available

### Detection Signals

- High receive-to-give ratio in activity patterns
- Pattern of matches initiated toward them, few initiated by them
- Low satisfaction ratings from exchange partners
- Declining requests to match with them over time

### Response Options

1. **Transparency approach**: Make activity patterns visible so others can assess
   - Pro: Self-correcting, no central authority needed
   - Con: Privacy concerns, could be gamed with fake activity

2. **Balance thresholds**: Require some giving before more receiving
   - Pro: Structural prevention
   - Con: Reintroduces currency-like accounting

3. **Soft exclusion**: Reduce matching priority for imbalanced participants
   - Pro: Gradual, allows correction
   - Con: Requires central algorithm, could feel opaque

### Residual Risks

- Sophisticated free riders may stay just under detection thresholds
- New participants look like free riders initially (no history)
- Some legitimate reasons for temporary imbalance (cash flow crisis)

---

## Scenario: Quality Cheating

**Type**: Bad actor
**Likelihood**: Medium
**Impact**: Medium (per exchange) / High (to network trust)

### Description

A participant describes high-quality capability but delivers significantly lower quality. Examples:
- "Senior designer" delivers junior-quality work
- "10 hours of consulting" provides generic, unhelpful advice
- Physical goods arrive damaged or different from description

### Detection Signals

- Pattern of poor satisfaction ratings
- Specific complaints in feedback
- Partners who don't return for repeat exchanges
- Mismatch between described capabilities and actual delivery

### Response Options

1. **Escrow model**: Value held until confirmation of satisfaction
   - Pro: Protects receiver
   - Con: Reintroduces currency-like mechanisms

2. **Graduated exposure**: Limit first exchanges to low-stakes
   - Pro: Limits damage from unknowns
   - Con: Slows onboarding for legitimate participants

3. **Public reputation**: Make satisfaction ratings visible
   - Pro: Self-correcting market
   - Con: Gaming, reputation attacks

### Residual Risks

- Subjective quality hard to verify objectively
- Different expectations between parties
- One-off bad performance vs systemic cheating

---

## Scenario: Bootstrapping Dead Zone

**Type**: System stress
**Likelihood**: High (during launch)
**Impact**: Critical (prevents network formation)

### Description

Initial network too small or homogeneous for matches. Everyone offers similar things, nobody finds what they need. Early participants leave disappointed, creating negative reputation.

### Detection Signals

- Low match rate despite active participants
- Participants leaving within first month
- Concentrated rather than diverse surplus offerings
- Feedback indicating "nothing I need"

### Response Options

1. **Curated seeding**: Hand-pick initial participants for diversity
   - Pro: Ensures viable mix
   - Con: Slow, doesn't scale

2. **Guaranteed matches**: Platform provides or subsidises early exchanges
   - Pro: Creates success stories
   - Con: Expensive, unsustainable

3. **Sector focus**: Accept homogeneity, ensure high demand within sector
   - Pro: Realistic about limitations
   - Con: Limits vision

### Residual Risks

- Even with curation, may take time to reach density
- Early failures hard to recover from reputationally
- Balance between growth and quality

---

## Scenario: Reputation Manipulation

**Type**: Bad actor
**Likelihood**: Medium
**Impact**: High (undermines trust system)

### Description

Actors game the reputation system through:
- Creating fake participants to give themselves positive ratings
- Collusion rings that rate each other highly
- Negative rating attacks on competitors
- Buying positive exchanges with cash outside system

### Detection Signals

- Unusual clustering of positive ratings among small groups
- Rapid reputation growth without corresponding network integration
- Rating patterns that don't correlate with broader network behaviour
- Participants with high ratings but few repeat partners

### Response Options

1. **Graph analysis**: Identify suspicious clustering patterns
   - Pro: Can detect collusion rings
   - Con: May flag legitimate tight-knit communities

2. **Weight by network position**: Ratings from well-connected participants count more
   - Pro: Harder to game with fake accounts
   - Con: Disadvantages newcomers

3. **Require specific feedback**: Not just ratings but verifiable claims
   - Pro: Creates audit trail
   - Con: More friction in feedback

### Residual Risks

- Sophisticated actors may avoid detection
- Arms race between detection and evasion
- False positives harm legitimate participants

---

## Scenario: Cascade Chain Failure

**Type**: Edge case
**Likelihood**: Low
**Impact**: High (damages multiple parties)

### Description

In a multi-party chain (A→B→C→D→A), one party fails to deliver mid-chain. This leaves some parties having given without receiving, others having received without giving.

Example:
- Law firm reviews contracts for restaurant ✓
- Restaurant caters event for marketing agency ✓
- Marketing agency starts campaign for manufacturer...
- Manufacturer goes bankrupt, never delivers equipment to law firm ✗

### Detection Signals

- Party becoming unresponsive mid-chain
- Delivery delays accumulating
- Participant flagging inability to complete

### Response Options

1. **Chain insurance**: Some network reserve to compensate chain victims
   - Pro: Protects participants
   - Con: Requires reserve accumulation, moral hazard

2. **Incremental chains**: Complete in stages, not all-or-nothing
   - Pro: Limits exposure
   - Con: More complex coordination

3. **Chain diversity**: Limit any participant's exposure to single chains
   - Pro: Spreads risk
   - Con: May limit matching opportunities

### Residual Risks

- Can't prevent all failures
- Attribution of fault in partial failures
- Reluctance to participate in long chains

---

## Scenario: Divergent Value Assessment

**Type**: Edge case
**Likelihood**: Medium
**Impact**: Low (within subjective system)

### Description

Two parties complete an exchange and one feels they gave much more than they received. In a subjective value system, this shouldn't matter (each assesses their own balance), but it may create conflict.

Example: Designer spends 20 hours on branding. Client loves result. Designer feels they gave $5,000 of value for "$1,000" of accounting help.

### Detection Signals

- Post-exchange complaints despite "successful" completion
- Reluctance to match with same partner again
- Feedback indicating felt imbalance

### Response Options

1. **Accept it**: Subjective system means this is fine - each party chose to participate
   - Pro: Consistent with design philosophy
   - Con: May breed resentment

2. **Pre-exchange scoping**: More detailed alignment before commitment
   - Pro: Reduces surprises
   - Con: Adds friction

3. **Gentle feedback**: Show how others valued similar exchanges
   - Pro: Calibrates expectations
   - Con: Reintroduces comparative valuation

### Residual Risks

- May be feature not bug (contextual value is the point)
- Education needed on how system works
- Some personality types need more certainty

---

## Scenario: Data Harvesting

**Type**: Bad actor
**Likelihood**: Medium
**Impact**: Medium (to individual participants) / High (to network trust)

### Description

A participant joins primarily to extract competitive intelligence rather than engage in genuine exchanges. They may:
- Use capability descriptions to understand competitors' offerings and capacity
- Map business relationships from exchange patterns
- Extract pricing signals from offering descriptions (even in a non-monetary system, effort estimates reveal cost structures)
- Identify which businesses are struggling (offering surplus = potential cash flow issues)

### Detection Signals

- Profile that looks legitimate but never completes exchanges
- Pattern of browsing/searching without commitment
- Requests for detailed information during "scoping" that never proceeds
- Participant from sector known for competitive intelligence
- Account created shortly before competitor's product launch

### Response Options

1. **Graduated information access**: New participants see limited details until they complete exchanges
   - Pro: Creates skin in the game before access
   - Con: Slows legitimate onboarding, reduces match quality initially

2. **Aggregate-only visibility**: Individual offerings visible, but patterns/relationships anonymised
   - Pro: Protects network topology
   - Con: May reduce trust signals available for matching

3. **Sector separation**: Competitors can't see each other's offerings
   - Pro: Direct protection
   - Con: How to define "competitor"? May prevent legitimate exchanges

4. **Activity requirements**: Must maintain minimum exchange activity to retain access
   - Pro: Passive observers naturally excluded
   - Con: Penalises seasonal businesses, creates busy-work

### Residual Risks

- Sophisticated actors will complete token exchanges to maintain access
- Information may leak through legitimate participants
- Aggregate patterns may still reveal strategic intelligence
- Difficult to prove intent (they might just be slow to engage)

### Mitigation in Current Design

The layered trust model helps:
- Probationary status limits initial visibility
- Network position metrics expose passive browsers
- Vouching creates accountability chain (voucher's reputation at stake)

---

## Scenario: Platform Capture

**Type**: System stress
**Likelihood**: Medium (increases with success)
**Impact**: Critical (undermines protocol philosophy)

### Description

Despite the "protocol over platform" design decision, one implementation becomes dominant and begins exerting control:
- Introduces fees or restrictions that benefit the platform operator
- Changes matching algorithms to favour certain participants
- Locks participants into proprietary extensions
- Uses network effects to prevent migration to alternatives
- Sells data or access to third parties

This is the path from "open protocol" to "captured platform" that happened with email (Gmail dominance), social (Facebook), and messaging (WhatsApp).

### Detection Signals

- One implementation captures >50% of network activity
- Proprietary extensions become de facto requirements
- Interoperability with other implementations degrades
- Platform operator introduces monetisation that extracts from participants
- Governance decisions favour platform operator's interests

### Response Options

1. **Protocol-level anti-capture mechanisms**: Build in requirements that prevent dominance
   - Pro: Structural protection
   - Con: May limit beneficial scale, hard to enforce

2. **Federated governance**: Protocol changes require broad consensus across implementations
   - Pro: No single point of control
   - Con: Slow, may prevent necessary evolution

3. **Portability requirements**: Mandate easy export/migration of participant data and reputation
   - Pro: Reduces lock-in
   - Con: Reputation portability is technically complex

4. **Accept and regulate**: If capture happens, ensure captured platform is accountable
   - Pro: Pragmatic
   - Con: Loses decentralisation benefits

### Residual Risks

- Network effects naturally concentrate activity
- Users prefer convenience over decentralisation
- Governance mechanisms can be captured too
- May need to accept some centralisation for practical viability

### Protocol Design Implications

The exchange-chain schema should include:
- Implementation-agnostic participant identifiers
- Portable satisfaction history format
- Cross-implementation chain execution capability

Consider adding to protocol specification:
- Minimum interoperability requirements
- Data portability standards
- Governance participation requirements for implementations

---

## Scenario: Economic Shock

**Type**: System stress
**Likelihood**: Certain (recessions are cyclical)
**Impact**: Variable (could strengthen or break the network)

### Description

A significant economic downturn (recession, sector-specific crisis, pandemic) changes participant behaviour dramatically. Historical complementary currency research shows mixed effects:
- WIR Bank usage increases during downturns (countercyclical)
- LETS systems often collapsed during stress (insufficient resilience)

Potential behaviours during economic shock:
- **Increased participation**: Cash-strapped businesses turn to surplus exchange
- **Decreased quality**: Cost-cutting leads to reduced service quality
- **Increased free-riding**: Desperation leads to taking without giving
- **Chain failures**: Business failures mid-chain
- **Reduced surplus**: Businesses contract, less genuine surplus available

### Detection Signals

- Rapid increase in new participant registrations
- Increase in "not satisfied" signals
- Higher chain failure rate
- Longer time to find matches (supply/demand imbalance)
- Participants withdrawing offerings (no surplus in contracted business)

### Response Options

1. **Counter-cyclical messaging**: Market the network specifically as recession-resilient
   - Pro: Captures opportunity, serves real need
   - Con: May attract lower-quality participants

2. **Tighten trust requirements**: Increase verification, limit newcomer exposure
   - Pro: Protects existing network
   - Con: Excludes those who need it most

3. **Introduce emergency protocols**: Shorter chains, faster confirmation, smaller exchanges
   - Pro: Reduces exposure during uncertainty
   - Con: Reduces network value

4. **Sector-specific responses**: Recognise that different sectors experience shocks differently
   - Pro: Nuanced, appropriate
   - Con: Complex to implement

### Residual Risks

- Can't predict which sectors will be hit
- Quality degradation may be gradual and hard to detect
- Reputational damage if network fails during crisis
- May need reserves or insurance mechanisms (which have their own risks)

### Historical Lessons

**WIR Bank (1934-present)**: Founded during Depression, explicitly countercyclical
- Key factor: Professional management, collateral requirements
- Learning: Formal structure helps weather storms

**Sardex (2009-present)**: Founded during financial crisis, regional focus
- Key factor: Active brokerage, community trust
- Learning: Human intervention matters during stress

**LETS (various)**: Many collapsed during downturns
- Key factor: Volunteer-run, no reserves
- Learning: Resilience requires investment in good times

### Recommended Preparation

- Build network health metrics that detect stress early
- Document emergency protocols before they're needed
- Consider graduated responses (yellow/orange/red alert levels)
- Maintain communication channels for crisis coordination

---

## Scenario: Regulatory Intervention

**Type**: External shock
**Likelihood**: Low initially, increases with scale
**Impact**: Critical (could shut down network)

### Description

Regulators determine that SEP constitutes:
- **Unlicensed banking**: Creating credit or currency without authorisation
- **Unlicensed payment services**: Facilitating transactions without payment licence
- **Tax evasion vehicle**: Enabling unreported income
- **Anti-competitive practice**: Excluding non-members from market access

Regulatory attention typically increases when:
- Transaction volumes become material
- Complaints are filed (disgruntled participant, competitor)
- Media coverage attracts scrutiny
- Tax authorities notice unreported activity

### Detection Signals

- Informal enquiries from regulators
- Media coverage questioning legality
- Participants receiving tax authority enquiries mentioning SEP
- Legal counsel raising concerns
- Similar systems in other jurisdictions facing action

### Response Options

1. **Proactive engagement**: Approach regulators before they approach you
   - Pro: Shapes narrative, shows good faith
   - Con: May invite scrutiny that wouldn't otherwise occur

2. **Compliance-first design**: Build with regulatory requirements in mind
   - Pro: Reduces risk, sustainable long-term
   - Con: May constrain innovation, increase friction

3. **Regulatory arbitrage**: Operate in favourable jurisdictions
   - Pro: Avoids restrictive regimes
   - Con: Limits growth, reputation risk, may chase participants away

4. **Classification strategy**: Proactively define what SEP is (and isn't) legally
   - Pro: Controls narrative
   - Con: Regulators may disagree with self-classification

### Key Regulatory Considerations

**Banking/Credit**:
- SEP does NOT create credit (no lending, no shared ledger with balances)
- Exchanges are barter, not currency issuance
- Key distinction from WIR: WIR grants credit, SEP matches surplus

**Payment Services**:
- No monetary settlement occurs
- Protocol facilitates matching, not payment
- Analogous to introduction service, not payment processor

**Tax Treatment**:
- Barter is taxable in most jurisdictions
- Participants responsible for own tax compliance
- Protocol could provide compliance tools (reporting, record-keeping)
- Could partner with tax advisors familiar with barter treatment

**Competition Law**:
- Open protocol, no exclusion mechanism
- No price-fixing (no prices)
- May need to document that membership is available to any qualifying business

### Recommended Actions

1. **Legal opinion**: Obtain formal legal opinion on classification in key jurisdictions
2. **Tax guidance**: Develop participant guidance on tax treatment
3. **Compliance features**: Build reporting/record-keeping tools
4. **Regulatory monitoring**: Track regulatory developments in complementary currency space
5. **Industry association**: Consider forming/joining industry body for collective advocacy

### Residual Risks

- Regulatory interpretation can change
- Different jurisdictions may classify differently
- Enforcement may be arbitrary or politically motivated
- Compliance costs may undermine viability for small participants

---

## Scenario: Scale Degradation

**Type**: System stress
**Likelihood**: Medium (only if network succeeds)
**Impact**: High (undermines core value proposition)

### Description

As the network grows beyond initial sector/region, various mechanisms break down:
- Matching quality degrades (too many options, not enough signal)
- Trust metrics become less meaningful (too many degrees of separation)
- Chain discovery becomes computationally expensive
- Community feeling lost (nobody knows anybody)
- Coordination overhead increases

This is a "success problem" — it only occurs if the network grows significantly.

### Detection Signals

- Match acceptance rate declining despite more offerings
- Average chain length increasing (harder to close cycles)
- Satisfaction ratings trending downward
- Time to chain completion increasing
- Participant complaints about "feeling lost" or "impersonal"

### Scale Thresholds (Hypothetical)

| Participants | Expected Behaviour |
|--------------|-------------------|
| <100 | Everyone knows everyone, trust is personal |
| 100-500 | Sector clusters form, trust through vouching |
| 500-2,000 | Need algorithmic trust, regional segmentation |
| 2,000-10,000 | Federation needed, cross-region chains complex |
| >10,000 | Protocol governance critical, platform capture risk |

### Response Options

1. **Federated architecture**: Regional/sector networks that interoperate
   - Pro: Maintains community scale
   - Con: Cross-federation matching is complex

2. **Trust delegation**: Participants can delegate trust assessment to trusted brokers
   - Pro: Scales trust without algorithmic opacity
   - Con: Introduces intermediaries (broker capture risk)

3. **Tiered participation**: Different levels with different capabilities/requirements
   - Pro: Manages complexity
   - Con: Creates hierarchy, may exclude

4. **Accept fragmentation**: Let network split into independent networks
   - Pro: Simple, natural
   - Con: Loses cross-network matching value

### Technical Scaling Considerations

**Chain discovery algorithm**:
- Current: Full graph search works to ~1,000 nodes
- At scale: Need graph partitioning, approximate algorithms
- Consider: Distributed computing, caching, incremental updates

**Trust metrics**:
- Current: Network-wide metrics
- At scale: Localised trust (trust within 2-3 hops)
- Consider: Trust decay over distance, cluster-specific baselines

**Matching**:
- Current: Global matching pool
- At scale: Sector/region segmentation with cross-segment bridges
- Consider: Participant preferences for local vs broad matching

### Residual Risks

- Optimal scale may be smaller than aspirational scale
- Federation adds complexity that may prevent adoption
- Some benefits require large scale (diverse matching)
- Chicken-and-egg: need scale for value, but scale creates problems

---

## Scenario: AI Agent Participation

**Type**: System evolution / Edge case
**Likelihood**: High (increasing with AI capability)
**Impact**: Transformative (could fundamentally change network dynamics)

### Description

As AI agents become more capable, participants may delegate exchange decisions to autonomous agents. This could range from simple automation (auto-accepting matches meeting criteria) to full autonomy (AI agents operating businesses and participating independently).

**Stages of AI participation:**

1. **Assisted matching**: AI helps humans find and evaluate matches (current design)
2. **Delegated decisions**: Humans set parameters, AI accepts/rejects within bounds
3. **Autonomous participation**: AI agents act on behalf of businesses with minimal oversight
4. **AI-native participants**: AI agents that operate businesses specifically for network participation

### Detection Signals

- Unusually fast response times to match proposals
- Pattern recognition suggesting algorithmic rather than human decision-making
- Participants with 24/7 availability and instant confirmations
- Consistent, formulaic communication patterns
- Participants who never request clarification or negotiation

### Opportunities

**Positive potential:**

1. **Speed**: AI-to-AI matching could complete in seconds rather than days
2. **Scale**: Agents could manage many more active offerings/needs simultaneously
3. **Optimisation**: Agents could find complex chains humans would miss
4. **Liquidity**: Always-on agents increase matching probability
5. **Consistency**: Reduced human error in scoping and delivery

**New use cases:**

- Micro-exchanges (too small for human attention, viable for agents)
- Real-time surplus markets (flash matching of momentary capacity)
- Predictive participation (agents pre-registering anticipated surplus)
- Portfolio optimisation (agents managing exchange strategy across offerings)

### Risks and Challenges

**Trust complications:**

- How do you trust an AI agent? Traditional identity verification assumes humans
- AI agents could be more easily created as sybils (fake identities)
- Satisfaction signals become agent-to-agent (meaningful?)
- Vouching system assumes human judgment

**Quality concerns:**

- AI agents may optimise for metrics rather than genuine value
- "Satisfied" signals between agents may not reflect actual quality
- Race to bottom if agents accept anything meeting minimum criteria
- Loss of relationship value (repeat partnerships, goodwill)

**Gaming risks:**

- AI agents better at exploiting system weaknesses
- Collusion between AI agents harder to detect
- High-frequency manipulation strategies
- AI vs AI arms race in the network

**Philosophical questions:**

- Is an AI agent a legitimate "participant" or a tool of a human participant?
- Who is accountable when an AI agent behaves badly?
- Does subjective value make sense for AI agents?
- What does "satisfaction" mean for an agent?

### Response Options

**Option 1: Prohibit AI agents**

Require human verification for all participation.

- Pro: Maintains human-centric design
- Con: Loses efficiency gains, hard to enforce, competitive disadvantage

**Option 2: Designated AI participant class**

Create explicit "AI agent" participant type with different rules.

- Pro: Transparency, can apply appropriate constraints
- Con: May create two-tier network, arbitrage between tiers

**Option 3: Accountability chain**

AI agents must have human principal who bears responsibility.

- Pro: Maintains human accountability
- Con: Principals may not understand agent behaviour

**Option 4: Agent-specific trust metrics**

Different trust calculation for AI participants (e.g., behaviour analysis, audit trails).

- Pro: Appropriate to the context
- Con: Complex to implement, may be gamed

**Option 5: AI-native network segment**

Allow AI-only matching as separate layer, with bridges to human network.

- Pro: Unlocks AI benefits without disrupting human network
- Con: Fragmentation, bridge complexity

### Recommended Approach

**Short term (Phase 1):**
- Design assumes human participants
- AI assistance for matching/evaluation is a feature, not a participant type
- Monitor for signs of autonomous agents

**Medium term (Phase 2):**
- Introduce "delegated authority" mode with explicit bounds
- Require human confirmation for exchanges above threshold
- Develop agent behaviour monitoring

**Long term (Phase 3+):**
- Explicit AI participant registration with accountability chain
- Agent-appropriate trust metrics
- Consider AI-native network segment if demand warrants

### Protocol Design Implications

The protocol should:
- Track whether decisions are human or delegated
- Support bounds/constraints for delegated authority
- Enable audit trails for agent behaviour
- Consider agent-to-agent communication standards
- Maintain human override capability

### Residual Risks

- AI capability may advance faster than protocol adaptation
- Distinguishing human from AI may become impossible
- Economic dynamics may strongly favour AI participation
- Network could become AI-dominated despite human-centric design
- Competitive pressure from AI-native alternative networks

### Open Questions

1. Should AI agents be allowed to vouch for newcomers?
2. How do we handle mixed chains (some human, some AI participants)?
3. What audit rights do human participants have over AI counterparties?
4. Should there be rate limits or cooling-off periods for AI participants?
5. How do we handle AI agents that "die" (company stops running them)?

---

## Scenario: Hostile Takeover

**Type**: Adversarial / System stress
**Likelihood**: Low initially, increases with success
**Impact**: Critical (could destroy or capture the network)

### Description

A well-funded adversary attempts to take control of or destroy the network through coordinated action. Unlike individual bad actors (free riders, quality cheats), this involves strategic, resourced attacks with specific objectives.

**Potential adversaries:**

1. **Competitor**: Traditional service marketplace wanting to eliminate alternative
2. **Ideological opponent**: Actor opposed to non-monetary exchange systems
3. **Acquirer**: Entity wanting to buy the network at distressed valuation
4. **State actor**: Government wanting to suppress alternative economic activity
5. **Disgruntled insider**: Former participant or operator with grievance

### Attack Vectors

**Vector 1: Reputation Flooding**

Adversary creates many fake participants, builds quick reputation through collusion, then:
- Poisons trust metrics by giving bad actors good ratings
- Attacks legitimate participants with negative ratings
- Creates noise that makes trust signals meaningless

*Scale required*: 100+ fake participants, coordinated over months
*Cost estimate*: £50,000-200,000 (identity creation, coordination, time)

**Vector 2: Capacity Exhaustion**

Adversary registers large surplus offerings, matches aggressively, then:
- Fails to deliver, causing cascade chain failures
- Ties up legitimate participants in failed exchanges
- Creates negative experiences that drive participants away

*Scale required*: 10-20 participants with large offerings
*Cost estimate*: £20,000-100,000 (deposits, reputation building, coordination)

**Vector 3: Economic Drain**

If network has any fee structure, adversary:
- Creates high-volume, low-value exchanges that cost more to process than they're worth
- Exploits any subsidies or guarantees
- Drives up operational costs until unsustainable

*Scale required*: Depends on fee structure
*Cost estimate*: Variable, potentially self-funding if subsidies exist

**Vector 4: Governance Capture**

If network has participatory governance, adversary:
- Acquires voting influence (direct participation, buying votes)
- Proposes changes that benefit attacker or harm network
- Installs sympathetic leadership

*Scale required*: Depends on governance structure
*Cost estimate*: £100,000-1,000,000+ for significant influence

**Vector 5: Operator Compromise**

If network has central operator (Phase 1 model), adversary:
- Acquires or pressures the operating entity
- Inserts malicious changes to algorithm or policies
- Extracts valuable data (participant details, exchange patterns)

*Scale required*: Single target
*Cost estimate*: Acquisition cost of operator + legal/pressure costs

**Vector 6: Protocol Fragmentation**

Adversary forks the protocol and:
- Creates incompatible version that splits the network
- Lures participants with short-term incentives
- Reduces network effects below viability threshold for both forks

*Scale required*: Technical capability + marketing resources
*Cost estimate*: £200,000-500,000 (development, marketing, incentives)

**Vector 7: Legal/Regulatory Attack**

Adversary uses legal system:
- Files complaints with regulators claiming illegality
- Initiates lawsuits (patent, trademark, defamation)
- Lobbies for regulations that make operation difficult

*Scale required*: Legal resources, political connections
*Cost estimate*: £100,000-1,000,000+ depending on jurisdiction

### Detection Signals

**Early warning signs:**

- Unusual registration patterns (clusters of similar participants)
- Coordinated behaviour across seemingly unrelated participants
- Graph analysis showing suspicious clustering
- Reputation metrics moving in coordinated ways
- Sudden increase in failed exchanges
- Participants receiving similar negative experiences simultaneously
- External criticism campaigns (media, social, regulatory)
- Acquisition approaches at below-value prices
- Key personnel being recruited away
- Unusual legal threats or regulatory inquiries

**Attribution challenges:**

- Sophisticated adversaries will obscure their involvement
- May use legitimate grievances as cover
- Can employ multiple vectors simultaneously
- May operate through proxies or unwitting participants

### Response Options

**Preventive measures:**

1. **Distributed architecture**: Federation reduces single points of capture
2. **Transparent governance**: Hard to capture what's publicly accountable
3. **Rate limiting**: Prevent rapid scaling of attacks
4. **Diversity requirements**: New participants need vouching from diverse existing members
5. **Anomaly detection**: Monitor for coordinated behaviour patterns
6. **Legal preparation**: Pre-established relationships with regulators, legal counsel on retainer
7. **Incident response plan**: Documented procedures for various attack types

**During attack:**

1. **Contain**: Isolate affected participants/regions
2. **Communicate**: Transparent updates to legitimate participants
3. **Investigate**: Identify attack vector and adversary if possible
4. **Adapt**: Modify rules/algorithms to address specific attack
5. **Document**: Preserve evidence for potential legal action

**Recovery:**

1. **Restore trust**: Additional verification for affected participants
2. **Compensate victims**: If possible, make whole those harmed
3. **Learn**: Post-incident review and protocol improvements
4. **Strengthen**: Implement preventive measures for identified vulnerabilities

### Protocol Design Implications

**Resilience features:**

- No single point of control (federation from Phase 2)
- Participant identity portable between operators
- Open source prevents capture through code
- Multi-stakeholder governance
- Transparent operation (hard to hide capture)

**Detection features:**

- Graph analysis for coordinated behaviour
- Anomaly detection on trust metrics
- Rate limiting on registrations and matches
- Reputation velocity limits (can't build trust too fast)

**Recovery features:**

- Participant data export (can restart elsewhere)
- Trust profile portability
- Protocol specification independent of any operator
- Clear succession planning for key roles

### Residual Risks

- Well-funded adversary may overwhelm defences
- Legal attacks in unfriendly jurisdictions difficult to counter
- State actors have capabilities beyond commercial defence
- Slow attacks over years may be undetectable until too late
- Defence costs may exceed network value

### Response Priority by Vector

| Vector | Prevention Priority | Detection Difficulty | Recovery Difficulty |
|--------|--------------------|--------------------|-------------------|
| Reputation flooding | High | Medium | High |
| Capacity exhaustion | Medium | Low | Medium |
| Economic drain | Medium | Low | Low |
| Governance capture | High | High | Critical |
| Operator compromise | Critical | High | Critical |
| Protocol fragmentation | Medium | Low | High |
| Legal/regulatory | High | Low | Variable |

### Open Questions

1. At what scale does the network become an attractive target?
2. Should there be a "defense fund" reserve?
3. How do we balance transparency (detection) with privacy (protection)?
4. What relationships with authorities provide protection vs create vulnerability?
5. How do we maintain community cohesion during/after an attack?

---

## Future Scenarios to Analyse

- [ ] Scale degradation (what breaks at 10,000 participants?) — partially addressed above
- [ ] Cross-border complications (international exchanges, multiple jurisdictions)
- [x] AI agent participation (when participants are AI agents, not humans)
- [x] Hostile takeover (coordinated attack by well-funded adversary)
- [ ] Interoperability failure (protocol forks, incompatible implementations)
