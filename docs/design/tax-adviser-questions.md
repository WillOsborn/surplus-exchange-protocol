# Questions for a Tax Adviser

*Prepared: 2026-10-10 · Status: open, not yet put to an adviser*
*For: a UK tax adviser (VAT and direct tax) reviewing a proposed business-to-business exchange network before a pilot*

---

## What the network does

The Surplus Exchange Protocol (SEP) helps businesses exchange **surplus capacity** (unbilled staff time, spare equipment, excess stock) **without money changing hands for the exchange itself**.

Exchanges are often **multi-party cycles** rather than two-way swaps. For example:

> A design studio does 10 hours of design for an accountancy firm. The accountancy firm does bookkeeping for a printer. The printer does a print run for the design studio.

Nobody gives anything directly back to the business they supplied. Each business gives to one participant and receives from another. All participants commit to the whole cycle together before any work starts. A network operator (a UK company) runs the matching software and keeps records, but **never holds or moves money**.

The pilot would be **UK only**, with UK-established businesses, most of them small and medium-sized.

## What we propose

1. **Each supplier declares a money value** for what it supplies. The value is shared only with the business receiving it, never with the rest of the network, and the matching software never uses it.
2. **SEP handles VAT paperwork.** Each participant records its VAT status (registered or not, and how much VAT it can recover). Before committing, each participant sees the VAT it will charge, the VAT it will be charged, and any VAT it cannot recover. On commitment, SEP generates VAT invoice data for each supply made by a VAT-registered business, plus a statement of who owes whom how much VAT.
3. **VAT is settled in cash between participants.** Each recipient pays the VAT on what it received to its supplier. SEP shows the amounts but doesn't handle the payments.
4. **Records**: each participant can export its exchange history (what, with whom, when, declared value, VAT) for its own accounts.

### Worked example (all VAT-registered, standard rate)

| Supply | Declared value | VAT | VAT paid by → to |
|---|---|---|---|
| Studio's design to Accountant | £1,000 | £200 | Accountant → Studio |
| Accountant's bookkeeping to Printer | £800 | £160 | Printer → Accountant |
| Printer's print run to Studio | £600 | £120 | Studio → Printer |

---

## Questions

Each question notes the design decision its answer affects.

### A. VAT: valuation and consideration

1. **Consideration in a cycle.** In the example, the studio supplies the accountant but receives from the printer. Is the studio's supply a supply *for consideration*, with the printer's supply as third-party consideration under a single multi-party agreement? Or could some supplies be treated as made for no consideration?
   *Affects: whether the per-supply invoicing model works at all, and whether the operator must be a contractual party to each cycle.*
2. **Basis of value.** For supplies paid for in kind between unconnected businesses, is a value **declared by the supplier** acceptable? Under the subjective-value principle (*Naturally Yours Cosmetics* C‑230/87, *Empire Stores* C‑33/93; VATA 1994 s19(3)), must the value reflect what the supplier receives rather than what it gives? In a cycle, what the supplier receives comes from a different business.
   *Affects: who declares the value, and of what.*
3. **Low marginal cost.** Surplus often costs the supplier little or nothing at the margin (for example, unbilled staff time already paid for). Is there a practical minimum HMRC would expect, such as a cost-based floor or open market value, and in what circumstances? Does HMRC VAT Notice 700 or the VAT Valuation Manual (VATVAL) give guidance for barter between unconnected parties?
   *Affects: guidance shown to participants when declaring a value.*
4. **Connected parties.** If two participants are connected, does the open-market-value direction (VATA 1994 Sch 6 para 1) apply, and should SEP flag connected-party exchanges?
   *Affects: onboarding questions and warnings.*

### B. VAT: invoicing and settlement

5. **Who invoices whom.** Is the normal VAT invoice from each supplier to its recipient correct for a cycle? Or does the cycle structure change invoicing obligations?
6. **Netting.** Can VAT amounts in a cycle be netted off, so that only net differences are paid in cash between participants? Or must each recipient pay the full VAT to its own supplier?
   *Affects: the settlement statement SEP produces.*
7. **Self-billing.** Could SEP generate invoices on the supplier's behalf under a self-billing arrangement, or must each supplier issue its own invoice from data SEP provides? What agreements would be needed?
8. **Tax point.** What is the tax point for a supply settled in kind within a cycle: commitment, performance, or invoice?
9. **Mixed VAT status.** A VAT-registered supplier providing to an unregistered or exempt recipient creates a cost the recipient cannot recover. Is there anything beyond clear disclosure that SEP should do? Are there pitfalls for partially exempt businesses?
10. **Operator's own position.** Is the operator making any supply (for example, a matching service) that is itself subject to VAT, if it charges a subscription and takes no commission?

### C. Direct tax

11. **Barter receipts.** For corporation tax and income tax, is the value of what a business receives in an exchange a taxable trading receipt? What value should be used, and is the VAT declared value appropriate?
12. **Cost side.** What can the supplier deduct for what it gave up, especially where the surplus had little marginal cost? Does this produce taxable income on exchanges that brought in no cash?
13. **Timing.** When is the receipt recognised: on commitment, on delivery, or on completion of the whole cycle?

### D. Reporting and records

14. **Operator reporting.** Does a UK network operator have any reporting duty to HMRC for exchanges between participants? For comparison, in the US barter exchanges must report each member's trades on Form 1099-B. Would the OECD/HMRC digital platform reporting rules apply?
15. **Record-keeping.** What records must participants keep for exchanges paid in kind, and for how long? Is SEP's export (supply description, counterparty, date, declared value, VAT, invoice reference) enough for Making Tax Digital?

### E. Later: other jurisdictions

16. **Italy** (for a later phase). Since Law 88/2026, the Italian VAT base for barter is the value set by the parties in the contract, with each party's costs as a floor (Article 13(2)(d), DPR 633/1972). Does this bilateral framing extend to multi-party cycles? Would it need an agreement step between each supplier and recipient, which SEP has deferred for the UK pilot?

---

## Related documents

- [Taxation and Compliance Design (Q9)](../plans/2026-10-10-taxation-and-compliance-design.md): full design and rationale
- [Landscape scan (October 2026)](../research/landscape-scan-2026-10.md), section 5: tax and regulatory developments
