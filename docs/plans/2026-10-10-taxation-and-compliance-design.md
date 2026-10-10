# Taxation and Compliance Design

*Date: 2026-10-10*
*Status: Accepted (2026-10-10)*. D1: declared values at the tax boundary, staged. D2: shared with the recipient only, agreement step deferred. D3: UK pilot first. VAT handling built in (§7).
*Addresses: Q9 (Taxation and Compliance)*

> **Not legal or tax advice.** This is a protocol design analysis. Every jurisdictional statement here needs confirmation from a qualified tax adviser before any pilot.

---

## Problem Statement

**Q9**: How do we handle tax treatment of exchanges?

SEP runs without shared valuation. Tax authorities need monetary values. In February, [Commitment-Based Accountability (Q1)](2026-02-26-commitment-based-accountability-design.md) made tax a participant responsibility: the network "does not provide valuations" and the detail was deferred. The [consolidated design impact review](2026-02-26-consolidated-design-impact.md) then warned that this gap "may become a blocker for real-world adoption".

Two things have changed since then (see [landscape scan](../research/landscape-scan-2026-10.md)):

1. **Tax authorities are firming up how barter is valued.** In May 2026 Italy rewrote the VAT base for barter (*permuta*) in Article 13(2)(d) of DPR 633/1972. It is now the **monetary value of the goods and services exchanged, as established by the parties under the contract**. That value can't be lower than the total costs attributable to each party's supplies, and cost is the fallback if no value is stated (Law 88 of 2026, converting Decree-Law 38/2026, applicable from 1 January 2026). See "Why Italy requires an agreed value" below.
2. **Operator reporting duties are real.** The US still requires "barter exchanges" to report each member's trades to the IRS on Form 1099-B. A protocol operator could fall within that definition.

"Participant responsibility, no network support" no longer holds up on its own terms. Without some agreed figure per exchange, a participant in an Italian-style regime can't comply, however good their own bookkeeping.

## Prior Constraints

- **Principle 1, subjective value over shared currency.** The network never sets, suggests or compares values.
- **Q1.** Accountability tracks commitments, not balances. Balance patterns are never visible to governance.
- **Q3/Q4.** A governed managed service with a federation escape hatch. The operator is an identifiable legal entity, which matters for any reporting duty.
- **Q7.** Algorithm transparency. Whatever the matcher reads must be publicly documented.

## Why Italy Requires an Agreed Value

*Source: Hogan Lovells, 26 May 2026 (secondary). Primary legislative texts not yet read.*

1. **EU law sets the base as the consideration actually received.** Under the VAT Directive (Article 73, read with CJEU case law), the taxable amount is the consideration the supplier obtains. Where that consideration is a supply in kind, its value is assessed **subjectively**, from the parties' own valuation. Fair market value is only allowed in narrow cases (Article 80: mainly related parties and tax-avoidance risk).
2. **Italy had been using market value for all barter.** Article 13(2)(d) previously taxed barter at *valore normale*, the price between independent parties in normal market conditions. The European Commission questioned this systematic use of market value through **EU Pilot 10314/2022**. At Italy's request, Commission services then issued **Working Paper 1107**: the taxable base must reflect the consideration actually received, judged subjectively by reference to the value the parties agreed.
3. **First fix: cost-based (2026 Budget Law, Law 199/2025).** The base became the total costs attributable to the supplies. Businesses objected that this meant **disclosing their profit margins to counterparties** and allocating costs in complicated ways.
4. **Second fix: agreed contractual value (Law 88/2026).** The base became the value the parties set in the contract, with cost as a floor (to prevent under-valuation) and as the fallback where no value is stated.

**What this means for SEP:**
- Italy is not imposing a shared currency. It is asking for **the parties' own subjective valuation, written into the contract**. That is close to SEP's Principle 1.
- The requirement is framed **bilaterally**: each party values what it receives from the other. How it applies to a multi-party cycle, where A's supply is "paid for" by C, is untested (Open Question 1).
- The cost floor means even surplus with a low marginal cost carries a tax value of at least its attributable costs. That tempers the "baseline is zero" framing in PHILOSOPHY.md.

## A Useful Precedent: Subjective Value Already Exists in VAT Law

EU VAT case law, carried into UK law, values payment in kind **subjectively**: by the value the supplier attributes to what it receives, usually what it would be prepared to spend to get it (*Naturally Yours Cosmetics*, C‑230/87; *Empire Stores*, C‑33/93). Italy's agreed-value rule and VAT working paper 1107 are consistent with this: the parties' own valuation is the base, with cost as a floor in some regimes.

**Implication:** tax authorities don't need a *shared currency*. They need a *declared value per supply*, attributed by the parties themselves. That is compatible with Principle 1, as long as the declared value stays at the tax boundary and never feeds back into the network. *(To be confirmed by a tax adviser.)*

US federal income tax is the exception. It uses fair market value, which is an objective standard. That makes the US a poor first jurisdiction (see §5).

## Approaches Considered

### Approach A: Status quo (participant responsibility, record export only)

The network exports exchange records (what, with whom, when). Participants value them privately.

**Rejected because:** It fails wherever authorities expect the parties to an exchange to have *agreed* a value (Italy; EU direction of travel). Two counterparties who value independently will produce figures that don't match, which invites scrutiny. It also leaves the operator's own reporting duties unaddressed.

### Approach B: Declared values at the tax boundary (Recommended)

Participants declare monetary values for tax purposes. The protocol carries and records these values, but **structurally walls them off** from matching, trust and governance. The network never produces a value.

**Recommended because:** It satisfies agreed-value regimes. It keeps Principle 1 intact where it matters (matching, trust, culture). It matches the subjective-valuation basis that VAT law already uses.

### Approach C: Network-assigned fair market value

The operator or an AI estimates a monetary value for each exchange.

**Rejected because:** It brings back a shared currency in all but name. A network-published value becomes a de facto price list, which is exactly the "ledger mentality" Q1 was built to prevent. It also turns the operator into a valuer, with the liability that brings.

---

## Design (Approach B)

### 1. The tax-boundary firewall

Declared values are **write-only from the network's point of view**:

- The matcher, trust calculator, exposure limits and governance dashboards never read them. This is enforced structurally: values live in a separate record, not in the offering, need or chain-matching inputs, and Q7's published algorithm description states the exclusion.
- Values are never aggregated, ranked or shown across participants.
- The network never suggests a value. No AI estimate, no "typical value for this kind of exchange".

This is the single most important rule in the design. It is the line between "tax compliance" and "shared currency".

### 2. Per-leg declared values

For each edge (provider → recipient) of a chain:

- **Provider declaration.** The provider records the value of the supply they are making, for their own tax records.
- **Shared with the recipient only.** The provider's declared value is visible to that edge's recipient, who needs it for the VAT invoice and their own books, and to no one else (D2).
- **Leg agreement (deferred).** Where a jurisdiction needs an *agreed* value (Italian-style), the provider proposes a figure and the recipient accepts it or counter-proposes. Built only when such a jurisdiction comes into scope.
- **Timing.** Declarations are made at, or after, commitment approval. They are never a precondition for matching, and only a precondition for commitment where the participant's jurisdiction profile requires agreement.
- **Cost floor guidance.** In regimes with a cost floor (Italy), the participant's interface warns if a declared value is below the cost they have recorded. The protocol doesn't enforce it.

**Multi-party cycles.** In an A→B→C→A chain, A's supply to B is "paid for" by what A receives from C. Per-leg declaration still works: every supply carries its own declared value, and each participant's books show their outgoing supplies at the values they declared and their incoming supplies at the values their providers declared. **These totals needn't balance.** The gap is each participant's subjective surplus, and it remains invisible to the network. *How each jurisdiction treats consideration that comes from a third party in a cycle (rather than from the counterparty) is the biggest open legal question in this design. See Open Questions.*

### 3. Jurisdiction profiles

A participant selects a jurisdiction profile when they join. The profile sets:

- whether leg agreement is required, optional or off
- whether cost-floor warnings apply
- the export format for their records (VAT-ready, income-tax-ready)

Initial profile: **UK** (provider declaration shared with recipient; VAT handling per §7). Later: **Italy** (agreement required, cost-floor warning). **US** not supported in the pilot (see §5).

### 4. Records and export

- Each participant can export their own exchange history with declared values in a jurisdiction-specific format.
- Declared values and agreements are stored in the tamper-evident audit trail proposed in the landscape scan. If the counterparties' records ever differ, the trail shows what was agreed and when.

### 5. Operator reporting duties

- **Principle:** Where law requires the operator to report, the operator reports. It reports only what participants have declared and never adds its own valuation.
- **US:** Before any US participation, get a legal view on whether a protocol operator counts as a "barter exchange" under the IRS rules. If it does, Form 1099-B reporting is mandatory and needs fair-market values, which is in tension with subjective declaration. **Recommendation: no US participants in the pilot.**
- **UK/EU:** No operator-level barter reporting duty identified. Confirm with an adviser.

### 6. Pilot jurisdiction

**Decided (D3): UK for the first pilot, more complex jurisdictions later.** It has the subjective-value VAT basis, no identified operator reporting duty, and English common law's contract-centred approach to AI liability (UK Jurisdiction Taskforce, September 2026). It also fits the project's base. Italy is a strong second, given Sardex's precedent and its now-explicit legal framework.

### 7. VAT handling (in scope)

SEP handles the fiddly part of VAT so participants don't have to work it out themselves. **SEP never holds or moves money.** It produces the paperwork and the figures, and participants settle VAT between themselves. See "How VAT Works in Practice" below for the mechanics.

- **VAT status at onboarding.** Each participant declares whether they are VAT-registered (with VAT number) and how much VAT they can recover: full, partial or none (for example a charity, a financial services firm, or a business below the threshold).
- **Before approval: each participant's VAT position.** When a chain is proposed, each participant sees, for their own edges only:
  - the VAT they will charge on what they supply
  - the VAT they will be charged on what they receive
  - their net cash position
  - **any VAT they cannot reclaim, shown as a real cost**

  This is disclosure, not a matching penalty. The firewall (§1) still applies: the matcher never reads VAT figures.
- **On commitment: VAT invoice data.** For each edge where the supplier is VAT-registered, SEP generates the data for a VAT invoice from supplier to recipient: parties, VAT numbers, description of the supply, declared value, rate and VAT amount. The supplier issues it, or a self-billing arrangement is used if the adviser confirms that is appropriate.
- **Settlement statement.** SEP shows who owes whom how much VAT for the chain. Whether amounts can be netted around a cycle is an adviser question (Open Question 5). Until that's answered, the default is that each recipient pays its own supplier.
- **Records.** VAT invoices and settlement confirmations are kept in each participant's export and in the tamper-evident audit trail.

---

## Schema Changes (to apply in WP13)

A separate, optional `tax_declaration` object on each edge in `exchange-chain.schema.json`, kept outside the fields the matcher uses:

```json
"tax_declaration": {
  "type": "object",
  "description": "Participant-declared values for tax purposes only. Never read by matching, trust or governance.",
  "properties": {
    "provider_declared": { "$ref": "#/$defs/declaredValue" },
    "agreement": {
      "type": "object",
      "properties": {
        "agreed_value": { "$ref": "#/$defs/declaredValue" },
        "proposed_by": { "type": "string" },
        "accepted_at": { "type": "string", "format": "date-time" }
      }
    }
  }
}
```

`declaredValue` = `{ amount, currency (ISO 4217), declared_at }`.

The edge's `tax_declaration` also carries VAT fields: `vat_rate`, `vat_amount`, `invoice_reference`, `vat_settled_at`.

The participant schema gains `jurisdiction_profile` and `vat_status`: `{ registered, vat_number, recovery: "full" | "partial" | "none" }`. The VAT number is visible only to the counterparties of that participant's edges.

The firewall gets a test: a chain's matching score must be unchanged whatever declared values and VAT data it carries. Implementation is backlog B1 (WP13).

---

## Effect on Prior Decisions

| Decision | Effect |
|---|---|
| Q1: tax "out of scope, network does not provide valuations" | **Refined.** The network still never *provides* valuations; it now *carries* participant-declared values at the tax boundary |
| Principle 1: subjective value | **Preserved and clarified.** Subjective value governs matching and relationships; declared values exist only at the boundary with the monetary state |
| Q3/Q4: governed managed service | Operator inherits any reporting duty; this is a governance commitment |
| Q7: algorithm transparency | Published algorithm description must state the firewall |
| Q8: bootstrapping | Adds a constraint: pilot jurisdiction should be UK (or Italy), not US |

**Proposed PHILOSOPHY.md tension (new):** *Subjective value vs the monetary state.* SEP's interior has no shared currency, but its participants live in a monetary legal system. We accept declared monetary values at that boundary and refuse to let them leak inward.

---

## How VAT Works in Practice in a Barter (UK)

*General principles, to be confirmed with a tax adviser before any pilot.*

**The value, not the VAT, has the floor.** VAT is a percentage (UK standard rate 20%) of the taxable value of each supply. Rules like Italy's cost floor limit how low the *value* can be declared.

**Can the value be zero?** Not in a real exchange. If you received something in return, there was consideration, and it was worth something to you. "Subjective" means the value to the parties, usually evidenced by an agreed price or by cost, not whatever figure suits. If nothing at all came back, it isn't barter but a gift, which follows different rules.

**Who pays whom.** The **supplier** is liable to HMRC for VAT on what it supplies, whether or not money changed hands. So:
1. The supplier issues a VAT invoice to the recipient: declared value plus 20% VAT.
2. The value is settled in kind. The **VAT amount is normally paid in cash by the recipient to the supplier**, unless the contract says otherwise.
3. The supplier pays that VAT to HMRC on its VAT return.
4. If the recipient is VAT-registered and uses the supply for taxable business, it **reclaims** the VAT on its own return.

For two VAT-registered businesses, VAT has no net cost; it is a short-term cash movement. It is a **real cost** for recipients who cannot reclaim it: businesses below the registration threshold (£90,000 turnover at last check) and VAT-exempt or partly exempt organisations such as charities, financial services and some health and education.

A supplier that is not VAT-registered charges no VAT at all.

**Worked example: three-party cycle, all VAT-registered.** Studio → Accountant → Printer → Studio.

| Supply | Declared value | VAT | VAT paid in cash by → to |
|---|---|---|---|
| Studio's design to Accountant | £1,000 | £200 | Accountant → Studio |
| Accountant's bookkeeping to Printer | £800 | £160 | Printer → Accountant |
| Printer's print run to Studio | £600 | £120 | Studio → Printer |

Each business passes the VAT it collects to HMRC and reclaims the VAT it paid, so each ends up with **no net VAT cost**. But **cash still moves round the cycle in the opposite direction to the supplies**, and timing gaps between paying the supplier and reclaiming from HMRC are a small cash-flow cost.

**Direct tax applies too.** For income or corporation tax, the value of what you receive is generally a taxable trading receipt, and what you gave up is a cost. Because surplus often has a low marginal cost, a participant can end up with taxable income on an exchange that brought in no cash. This may matter more than VAT.

### Design Implications

1. **"No money" needs a footnote.** Even in a moneyless exchange, VAT amounts are normally settled in cash between participants. SEP should say so plainly rather than let participants find out from their accountant.
2. **VAT registration status is matching-relevant.** A chain where a VAT-registered supplier provides to an unregistered or exempt recipient gives that recipient a real cash cost. Participants should declare their VAT status, and the recipient should see "this exchange will cost you £X in VAT you cannot reclaim" before approving. This is a disclosure, not a matching penalty.
3. **SEP could optionally help with VAT settlement.** The protocol knows the cycle and the declared values. It could generate the VAT invoices and show each participant their net VAT position, without SEP holding or moving any money.

## D1 Implications: Declared Values vs Status Quo

| | **Status quo (A)**: network exports records; participants value privately | **Declared values (B)**: protocol carries participant-declared values, walled off from the network |
|---|---|---|
| Principle 1 (subjective value) | Purest: no money figure ever enters the protocol | Kept where it matters (matching, trust, culture), but money figures now exist in the system |
| UK compliance | Workable for small participants. VAT-registered participants still need the supplier's figure on a VAT invoice to the recipient, so it gets swapped outside SEP, unrecorded and with no firewall | Supplier's figure travels with the leg it belongs to; both sides' books match |
| Italian-style compliance | Not workable: the value must be set by the parties in the contract | Workable with the agreement mechanism |
| Counterparty consistency | Two sides of one exchange can book different figures, which invites scrutiny | One figure per exchange leg (UK) or one agreed figure (Italy) |
| Operator role | Holds no valuation data: lowest liability and data-protection exposure | Holds commercially sensitive figures: needs access control, retention rules and breach handling |
| Culture risk | Lowest | Writing a money figure may encourage score-keeping ("ledger mentality"); the firewall reduces but can't remove this |
| Adoption | Accountants will ask "what value do I put?", and history shows tax ambiguity kills networks (LETS) | Answers the accountant's first question; matches the survivors (WIR, Sardex, ITEX) |
| Build cost | None now; it becomes a retrofit later | A schema object, firewall test, export and access rules |
| Reversibility | Easy to move to B later, but anything exchanged outside SEP in the meantime is lost | Hard to remove once participants rely on it |

**The deciding point:** under the status quo, values don't disappear. They move outside SEP, onto invoices and emails, where the protocol can neither keep them consistent nor keep them away from matching. B controls something that exists anyway; A pretends it doesn't.

**Staged option (recommended for a UK-first pilot):** adopt B in its minimal form.
- The provider declares a value for the supply they make.
- It is shared only with that leg's recipient, which is what a UK VAT invoice needs anyway.
- It is never visible to anyone else or read by the network.
- The bilateral agreement mechanism (D2) is added only when an agreed-value jurisdiction such as Italy is in scope.

*(The UK VAT-invoice point needs confirming with an adviser.)*

## Decisions (made 2026-10-10)

| # | Decision | Outcome | |
|---|---|---|---|
| D1 | Adopt the tax-boundary approach? | **Decided: Approach B, staged, with VAT handling built in (§7)** | — |
| D2 | Leg value visibility | **Decided: provider's value shared with that edge's recipient only; bilateral agreement step deferred until an agreed-value jurisdiction is in scope** | — |
| D3 | Pilot jurisdiction | **Decided 2026-10-10: UK first; more complex jurisdictions (such as Italy) later** | — |

Recorded in [decisions.md](../design/decisions.md#decision-taxation-and-compliance--declared-values-at-the-tax-boundary); PHILOSOPHY.md tension added; Q1's tax section points here. Schema changes, firewall test and VAT handling are backlog B1 (WP13). Questions for a tax adviser are collected in [tax-adviser-questions.md](../design/tax-adviser-questions.md).

## Open Questions

1. **Third-party consideration in cycles.** Does each jurisdiction treat an A→B→C→A cycle as three supplies each paid for by another participant? Or does it need a bilateral framing (for example, each participant contracting with a chain "clearing" entity)? The answer may decide whether the operator must be a legal party to each chain.
2. **UK confirmation.** Check VAT Notice 700 and HMRC's current position on valuing barter with no monetary element. Do participants below the VAT threshold need anything beyond income tax records?
3. **Direct tax.** For corporation tax, is the declared VAT value enough as the income and cost figure?
4. **Agreement deadlock.** If two parties can't agree a leg value in an agreement-required jurisdiction, does the chain fail, or does the leg proceed with separate declarations?
5. **VAT settlement in cycles.** Can VAT amounts in a cycle be netted off between participants, or must each supplier collect from its own recipient? Does the triangular structure change who must invoice whom?
6. **Mixed VAT status.** How should the recipient's unrecoverable VAT be disclosed before approval, and should a participant be able to exclude exchanges that would cost them VAT?
7. **Direct tax on surplus.** Confirm how barter receipts are treated for income or corporation tax when the surplus given up had little marginal cost.
8. **Does declaring a value erode the culture?** Making people write down a money figure may bring "ledger mentality" in through the side door. Monitor this in the pilot (ties to the Q1 learning loop).

---

## Sources

- Hogan Lovells, "Barter transactions: VAT taxable base rules undergo further revision" (26 May 2026), which cites EU Pilot 10314/2022 and Commission Working Paper 1107: <https://www.hlc.com/en/publications/barter-transactions-vat-taxable-base-rules-undergo-further-revision>
- CJEU C‑230/87 *Naturally Yours Cosmetics*; C‑33/93 *Empire Stores*: subjective value of non-monetary consideration
- IRS, 2026 Instructions for Form 1099-B (barter exchange reporting)
- Historical precedent: WIR, Sardex and ITEX are all fully tax-compliant ([historical-systems-deep-dive.md](../research/historical-systems-deep-dive.md))
