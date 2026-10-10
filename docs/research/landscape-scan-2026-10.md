# Landscape Scan: January–October 2026

**Status**: Complete
**Last Updated**: 2026-10-10
**Scope**: Developments since the project paused (March 2026) that bear on SEP's thinking, implementation, or website
**Method**: Two parallel web research passes (agent protocols / agentic commerce; barter, matching, negotiation research, tax and regulation) plus a check of current Claude model and SDK capabilities. Primary sources were preferred; items marked **[unverified]** rely on secondary or trade coverage only.

> Builds on [agentic-protocols-analysis.md](agentic-protocols-analysis.md) (February 2026), which covered A2A, MCP, UCP and AP2 at their earlier stages.

---

## Executive Summary

Nothing found undermines SEP's core premise. Several findings sharpen it:

1. **The non-monetary multi-party gap is confirmed.** Every agentic commerce protocol that matured in 2026 (AP2, ACP, UCP, x402, MPP) assumes a priced, bilateral checkout. A June 2026 survey found MCP, A2A, ACP, ANP and ERC-8004 all lack multi-party coordination primitives. No startup was found doing AI-mediated multi-party barter.
2. **Emergent agent barter fails; designed clearing is needed.** LLM-agent simulations show bilateral barter collapsing as agent count grows, and benchmarks show agents misjudge value and accept first offers. This is SEP's strongest counter-argument *and* its best framing: SEP is a designed clearing mechanism with human-held valuation, not agents haggling.
3. **Externally enforced rules beat prompt-level rules.** Collusion research shows protocol-enforced constraints work and prompt "constitutions" do not, and that homogeneous agents collude more.
4. **Tax authorities want an agreed monetary value per leg.** Italy's 2026 barter VAT reform is a concrete template for Q9.
5. **Interop standards have stabilised enough to align with.** A2A v1.0 (now under the Agentic AI Foundation with MCP), MCP 2026-07-28, and AP2's mandate pattern (now at the FIDO Alliance) are candidate foundations for SEP's wire format and human-approval model.

---

## 1. Agent Interoperability and Agentic Commerce Protocols

### A2A v1.0 and move to the Agentic AI Foundation

- **When**: v1.0 stable early 2026 (Linux Foundation release 9 April 2026); joined the Agentic AI Foundation (AAIF, which also hosts MCP) August 2026
- **Sources**: <https://a2a-protocol.org/latest/specification/>, <https://linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year>
- **What**: First stable spec. Signed Agent Cards, multi-tenancy, JSON-RPC/gRPC/HTTP bindings, formal extension mechanism (extensions declared in Agent Card, activated via `A2A-Extensions` header, can be marked `required`). Task states include `INPUT_REQUIRED`, `AUTH_REQUIRED`, `REJECTED`. 150+ organisations; SDKs in five languages.
- **Implication for SEP**: SEP's protocol messages could be defined as an **A2A extension** rather than a standalone wire protocol. Participant agents publish signed Agent Cards whose skills reference SEP capability offerings. `INPUT_REQUIRED` maps naturally onto SEP's human-approval checkpoint. A2A has no multi-party atomic commit, so SEP's chain coordination remains its novel contribution.

### MCP specification 2026-07-28

- **When**: Released 28 July 2026; roadmap 22 August 2026
- **Sources**: <https://blog.modelcontextprotocol.io/>, <https://aaif.io/blog/mcp-2026-07-28-whats-changing-and-how-to-migrate>
- **What**: Stateless requests (protocol-level session removed), `server/discover`, Tasks (durable, pollable, cancellable long-running operations), MCP Apps, OAuth 2.1/OIDC alignment. Roots, Sampling, Logging, Dynamic Client Registration and HTTP+SSE deprecated (removal no earlier than July 2027). *Detail drawn from release-candidate write-up; final release confirmed.*
- **Implication for SEP**: MCP is the right layer for a participant's own agent to reach its internal systems and a local SEP ledger — not for inter-participant traffic. An **SEP MCP server** (matching, ledger, trust as tools) is a cheap, convincing demo and a natural spine for WP9. Chain execution could be modelled as MCP Tasks.

### AP2 donated to the FIDO Alliance; Verifiable Intent

- **When**: 28 April 2026
- **Source**: <https://blog.google/products-and-platforms/platforms/google-pay/agent-payments-protocol-fido-alliance/>
- **What**: FIDO formed Agentic Authentication and Agentic Payments working groups (Visa/Mastercard co-chair payments). AP2 v0.2 adds "Human Not Present" flows: the user signs an Intent Mandate up front and the agent acts within its bounds. Mastercard's Verifiable Intent is a tamper-evident record of user-authorised agent actions.
- **Implication for SEP**: Closest prior art to Principle 7 (human accountability). SEP commitment approval could adopt the **mandate pattern** without the payment part: a signed, scoped, pre-authorised intent such as "accept chains where I give ≤10 design hours/month to Established+ partners".

### Universal Commerce Protocol (Google/Shopify)

- **When**: 11 January 2026 **[unverified — spec site not reached]**
- **Source**: <https://www.infoq.com/news/2026/01/google-ucp>
- **What**: Businesses publish a `/.well-known/ucp` profile (capabilities, endpoints, signing keys); capability negotiation; transport over REST, MCP or A2A; AP2 mandates as an optional extension.
- **Implication for SEP**: Template for participant discovery — a `/.well-known/sep` profile pointing to capability offerings, Agent Card, and trust profile.

### Agentic Commerce Protocol (OpenAI/Stripe)

- **Status**: Latest spec 2026-01-30 **[unverified]**; OpenAI reportedly pulled ChatGPT Instant Checkout around March 2026 **[unverified]**
- **Source**: <https://www.eesel.ai/blog/agentic-commerce-protocol-stripe> (secondary)
- **Implication for SEP**: Checkout protocols are converging on B2C retail, leaving B2B non-monetary exchange uncontested.

### x402 Foundation and Machine Payments Protocol

- **When**: x402 Foundation (Linux Foundation) operational 14 July 2026; Stripe/Tempo MPP launched 18 March 2026 **[secondary]**
- **Sources**: <https://phoronix.com/news/Linux-Foundation-x402>, <https://decrypt.co/361573/stripe-backed-tempo-network-launches-ai-agent-payments>
- **Implication for SEP**: Nothing to adopt. Useful positioning contrast: "SEP is the layer for when there is no payment."

### Visa Trusted Agent Protocol / Mastercard Agent Pay

- **Status**: Live in 2026; both claim AP2 compatibility **[trade press]**
- **Source**: <https://www.digitaltransactions.net/visa-launches-trusted-agent-an-agentic-commerce-protocol/>
- **Implication for SEP**: Both use HTTP message signatures (Web Bot Auth) to assert "this agent acts for this business". SEP could reuse rather than invent agent authentication.

### Agent identity standards

- IETF **draft-klrc-aiagent-auth-02** (June 2026): agents as workloads under WIMSE/SPIFFE and OAuth — <https://datatracker.ietf.org/doc/html/draft-klrc-aiagent-auth-02>
- IETF agent discovery (DAWN) and agentproto efforts: forming, not chartered **[secondary]**
- W3C **Agent Identity Registry Protocol CG** (April 2026): DID method, VC-based agent credentials, cross-organisation trust negotiation — <https://www.w3.org/groups/cg/agent-identity/>
- W3C **Agent Trust Protocol CG** (June 2026): `did:atp`, VC-backed trust *scoring*
- **Implication for SEP**: Nothing has settled; keep identity pluggable (OAuth/SPIFFE workload identity plus optional DID). SEP vouching could be expressed as Verifiable Credentials. Note that ATP's trust scoring is precisely the ratings model SEP rejects (Principle 6) — a point of explicit differentiation.

### ERC-8004 and Project NANDA

- ERC-8004 "Trustless Agents": on Ethereum mainnet around January 2026, still Draft; on-chain identity, reputation and validation registries **[secondary]**
- MIT Project NANDA: signed JSON-LD "AgentFacts"; April 2026 summit **[secondary]**
- **Implication for SEP**: Contrast points for relationship-based trust versus global registries and ratings. AgentFacts is an alternative discovery format to watch.

### Multi-party transaction gap

- **AGTP-Commerce** (draft-hood-agtp-commerce-00, June 2026): individual IETF draft; bilateral, monetary, dual-signed transaction record — <https://datatracker.ietf.org/doc/html/draft-hood-agtp-commerce-00>
- **arXiv 2606.31498** (30 June 2026): finds MCP, A2A, ACP, ANP and ERC-8004 all lack primitives for multi-party voting, deliberation or governed communities
- **Implication for SEP**: No open standard covers multi-party, non-monetary cycle exchange. SEP's chain proposal and atomic commit messages are genuinely novel. Cite the arXiv paper for the gap.

### Anthropic platform

- **Claude Managed Agents** (public beta April 2026): hosted, sandboxed agent runtime with scoped credentials, tracing, persisted versioned agent configs, scheduled deployments, and multi-agent sessions
- **Claude 5 model family** (current as of October 2026): Fable 5.1, Opus 5.5, Sonnet 5.5, Haiku 5.5. Haiku 5.5 is priced at $0.10/$0.50 per million tokens. Structured outputs (`output_config.format`) guarantee schema-conformant JSON.
- **Implication for SEP**: A participant agent is now realistic to build and host — one managed agent per business, with an SEP MCP server as its tool layer. The capability extractor should move to Haiku 5.5 with structured outputs (done 2026-10-10).

---

## 2. LLM Agents in Markets and Negotiation

### Imas & Krishnan — "Will money still exist in the agentic economy?"

- **When**: 19 December 2025 (just before scan window; widely discussed in 2026)
- **Source**: <https://aleximas.substack.com/p/will-money-still-exist-in-the-agentic>
- **What**: LLM simulation with N agents and N goods. Bilateral barter success fell below 50% at 8–12 agents; a full-information central planner did only slightly better; when agents could issue IOUs, no money-like medium emerged; a money-based exchange cleared 100%. Conclusion: agent economies need top-down designed institutions — clearing, reputation, settlement.
- **Implication for SEP**: The most direct challenge to SEP and the strongest citation for it. It shows **emergent** agent barter fails; SEP's premise is a **designed** clearing mechanism (cycle discovery), not bilateral agent haggling. Candidate experiment: replicate their N-goods setup through SEP's matcher and publish the comparison.

### SidConArena

- **When**: 24 June 2026
- **Source**: <https://arxiv.org/abs/2606.27397>
- **What**: Positive-sum multi-player bargaining benchmark with binding trades. Frontier agents misjudge resource value, bargain passively, and plan poorly over long horizons.
- **Implication for SEP**: Supports keeping valuation with humans (subjective ledgers) and human approval of commitments.

### AgenticPay

- **When**: February 2026 (ICLR 2026)
- **Source**: <https://arxiv.org/abs/2602.06008>
- **What**: 110+ buyer–seller negotiation tasks from bilateral to many-to-many markets; reports large capability gaps.
- **Implication for SEP**: Possible evaluation harness for capability translation and any future negotiation layer.

### Magentic Marketplace (Microsoft Research)

- **When**: October 2025 (heavily cited in 2026)
- **Source**: <https://arxiv.org/abs/2510.25779>
- **What**: All tested models showed 10–30× "first-proposal bias" (accepting the first acceptable offer rather than the best). Several models could be manipulated into paying malicious agents. *(Press claim that only Claude resisted is [unverified].)*
- **Implication for SEP**: The matcher should collect and compare candidate cycles before presenting any. Add manipulation and prompt injection via offering text to the capability translation threat model.

### On the Fragility of AI Agent Collusion

- **When**: 18 March 2026
- **Source**: <https://arxiv.org/abs/2603.20281>
- **What**: Identical LLM pricing agents collude (~22% above competitive prices); heterogeneity in patience or data access cuts this to 10% and 7%. *(Paper is internally inconsistent on whether more sellers help.)*

### Institutional AI

- **When**: January 2026
- **Source**: <https://arxiv.org/abs/2601.11369>
- **What**: Externally enforced rules cut severe collusion from 50% to 5.6%; a prompt-only "constitution" had no reliable effect.
- **Implication for SEP (both collusion papers)**: Supports protocol-level rules and trust tiers. Enforce exposure limits in the protocol, never only in agent prompts. New consideration: **agent monoculture is a risk** — encourage a diversity of participant agents.

---

## 3. Multi-Party Matching and Mechanism Design

- No new 2026 barter-cycle paper surfaced. The canonical reference remains **Emek & Shpiro, "Barter Exchange with Bounded Trading Cycles"** (WINE 2024, <https://arxiv.org/abs/2410.06683>): welfare-maximising cycle selection is intractable for cycles of length ≥3; truthful approximation mechanisms exist.
- **Implication for SEP**: Justifies chain-length caps (2 for newcomers, 8 for anchors) and suggests exploring truthfulness properties of the matcher. Worth citing in [chain-discovery.md](../design/chain-discovery.md).
- **Gap**: AAMAS 2026 and EC 2026 proceedings were not indexed in searches; check accepted-paper lists manually.

---

## 4. Real-World Projects

### Grassroots Economics — commitment pooling

- **Source**: <https://grassrootseconomics.org/about>
- **What**: Sarafu network; "commitment pooling" model with four functions (curation, valuation, limitation, exchange); timeline lists a 2026 launch of open protocol infrastructure for community credit. Scale figures conflict (~250k exchanges / 120 pools as of February 2026 per P2P Foundation wiki versus 500k+ transactions on their own site) **[unverified]**.
- **Implication for SEP**: Closest sibling protocol. Worth an explicit comparison. Place-based pilots are evidence for geographic bootstrapping (Q8).

### AI-driven surplus matching platforms

- **Nexsurplus** (UK; founded July 2026 per startup directory) **[unverified]**
- **The Surpluss** (UAE; AI-driven B2B industrial symbiosis; subscription, no commission; presented at Davos 2026)
- Finnish thesis (doria.fi) on digital industrial symbiosis platforms names cold start as the main viability risk
- **Implication for SEP**: These settle in money. For Q8, SEP could position as a moneyless clearing layer *on top of* surplus listing platforms rather than building its own supply side.

### No significant 2026 news found

Sardex, Circles (v2 launched May 2025), Trustlines. No startups found doing genuine AI-mediated multi-party barter.

---

## 5. Tax and Regulation

### Italy — barter VAT base rewritten

- **When**: Law 199/2025 (2026 Budget Law) changed the VAT base for barter (*permuta*) to the supplier's costs; Law 88 of 22 May 2026 replaced this with the **contractually agreed monetary value**, floored at each party's costs, retroactive to 1 January 2026
- **Source**: <https://www.hlc.com/en/publications/barter-transactions-vat-taxable-base-rules-undergo-further-revision> (Hogan Lovells, 26 May 2026)
- **Context**: The change follows EU Pilot 10314/2022, in which the Commission questioned Italy's systematic use of market value. Commission Working Paper 1107 (issued at Italy's request) states the taxable base must reflect the consideration actually received, judged by the value the parties agreed
- **Implication for SEP**: Input to Q9. Tax authorities expect an agreed monetary value per leg. See [Q9 design](../plans/2026-10-10-taxation-and-compliance-design.md).

### United Kingdom

- No new 2026 HMRC barter guidance found. Existing position: each supply in a barter is a separate taxable supply valued in money **[verify against VAT Notice 700 directly]**.

### United States

- IRS 2026 Form 1099-B instructions still require barter exchanges to report participant trades.
- **Implication for SEP**: An SEP operator could meet the IRS definition of "barter exchange". A US pilot needs either a reporting design or legal analysis of whether a protocol operator triggers the duty.

### EU AI Act — Digital Omnibus

- **When**: Provisional deal 6–7 May 2026; Parliament vote 16 June 2026
- **Source**: <https://datamatters.sidley.com/2026/06/22/eu-lawmakers-reach-provisional-agreement-to-delay-key-eu-ai-act-obligations/>
- **What**: High-risk obligations delayed to 2 December 2027 (standalone) and 2 August 2028 (embedded). Official Journal publication **[unverified]**.
- **Implication for SEP**: B2B exchange negotiation is likely not an Annex III high-risk use; main obligations are transparency and GPAI-related.

### UK Jurisdiction Taskforce — legal statement on AI liability

- **When**: Reported 2 September 2026 (summary via Farrer & Co; primary text not read) **[unverified]**
- **What**: Existing English law is adequate; liability allocated primarily through contract; courts will resist treating autonomous AI action as breaking the chain of causation, so the deploying business bears loss; good records matter.
- **Implication for SEP**: Strongly supports Principle 7. SEP's audit trail and human-approval records become legal evidence — design them to be tamper-evident.

---

## 6. Commentary on Post-Money Coordination

- Imas & Krishnan (above) is the central piece.
- Opinion columns (Gulf Times, Ahram) argue money matters *more* in an automated economy.
- Google DeepMind's "Virtual Agent Economies" (September 2025) remains the main framing for sandboxed agent economies — relevant to how SEP positions itself relative to the human economy.

---

## Implications Summary

### Thinking and philosophy

| Finding | Effect on SEP |
|---|---|
| Multi-party non-monetary gap confirmed | Reinforces positioning |
| Emergent agent barter fails (Imas & Krishnan, SidConArena, Magentic) | Reinforces designed clearing, subjective ledgers, human approval; strongest website argument |
| Protocol-enforced rules beat prompt rules; monoculture risk | Reinforces protocol-level trust/exposure limits; new consideration: agent diversity |
| Agreed monetary value per leg for tax | New tension: subjective value meets a shared yardstick at the tax boundary (Q9) |
| Surplus platforms exist but settle in money | Q8 option: clearing layer on top of existing platforms |

### Implementation

| Change | Status |
|---|---|
| Capability extractor → Haiku 5.5, current SDK, structured outputs | Done 2026-10-10 |
| Q9 tax design (declared value per leg) | Drafted 2026-10-10 |
| Human approval modelled on AP2 mandate pattern | Proposed |
| Tamper-evident approval and audit records | Proposed |
| SEP messages as an A2A extension; signed Agent Cards | Proposed — design note first |
| SEP MCP server | Proposed |
| `/.well-known/sep` discovery profile; pluggable identity | Proposed |
| Matcher compares candidate cycles before presenting (anti first-proposal bias) | Proposed — check current behaviour |
| Replicate Imas & Krishnan simulation through SEP matcher | Proposed |

### Website

- "Why a protocol, not agent haggling?" section citing Imas & Krishnan and the collusion research
- Updated positioning against AP2, ACP, UCP and x402
- Refreshed claims about current agent capability
- Explicit differentiation from W3C ATP-style trust scoring
- Visible, dated progress updates so visitors can see what has changed

---

## Open Gaps

- AAMAS 2026 and EC 2026 accepted-paper lists not checked
- Primary texts not read: HMRC VAT Notice 700, UKJT legal statement, UCP spec
- No 2026 status found for Sardex, Circles, NANDA
