# Use Case Scenarios

Real-world scenarios illustrating how the Surplus Exchange Protocol creates value for participants. These examples are designed for external communication, website content, and explaining the protocol to potential users.

---

## Scenario 1: The Direct Swap

**The simplest case — two businesses help each other**

### The Situation

**Harrison & Co** is a small law firm in Brighton. They have a junior associate with spare capacity on Tuesdays and Wednesdays — time that's currently unproductive.

**Savour Events** is a catering company expanding into corporate events. They've drafted three venue partnership contracts but can't afford legal review at commercial rates.

### The Problem Without SEP

- Harrison & Co's spare capacity generates no value
- Savour Events either risks signing unreviewed contracts or delays expansion
- Neither knows the other exists or has compatible needs

### How SEP Helps

1. Harrison & Co registers their surplus: "Contract review capacity, 8 hours/week available"
2. Savour Events registers their need: "Legal review of 3 venue contracts"
3. Savour Events also registers surplus: "Corporate catering for 20-50 people"
4. Harrison & Co registers a need: "Catering for summer client event"

The matching algorithm identifies the opportunity. Both parties review the proposed exchange, agree terms, and execute.

### The Outcome

- Harrison & Co gets professional catering worth £2,000+ (their valuation)
- Savour Events gets legal review worth £1,500+ (their valuation)
- Both used surplus capacity that would otherwise be wasted
- No cash changed hands

### Why This Works

Neither party needs to agree on "fair value." Harrison & Co values the catering at what it would cost them commercially. Savour Events values the legal review at what they'd pay a solicitor. Both are better off than doing nothing with their surplus.

---

## Scenario 2: The Three-Party Chain

**When direct swaps don't exist, AI finds the path**

### The Situation

**Pixel & Grain** is a design studio. They need bookkeeping help — they're three months behind and year-end is approaching.

**Clearview Accounting** offers bookkeeping services. But they don't need design work — they need content marketing to improve their online presence.

**Momentum Marketing** offers content strategy. They don't need accounting — they need their website rebuilt.

No direct swaps exist. Pixel & Grain can't help Clearview, Clearview can't help Momentum.

### The Problem Without SEP

Each business has surplus and need, but no obvious trading partner. Traditional barter fails because no two parties have matching wants.

### How SEP Helps

The matching algorithm sees the whole network:

```
Pixel & Grain (Design) ──design work──► ???
        ▲
        │
   [needs bookkeeping]
        │
Clearview Accounting ──bookkeeping──► Pixel & Grain
        ▲
        │
   [needs content]
        │
Momentum Marketing ──content──► Clearview
        ▲
        │
   [needs website]
        │
        └─────── Pixel & Grain (also does web design)
```

Wait — Pixel & Grain also offers web design. The chain closes:

```
Pixel & Grain ──web design──► Momentum Marketing
Momentum Marketing ──content strategy──► Clearview Accounting
Clearview Accounting ──bookkeeping──► Pixel & Grain
```

### The Outcome

Three businesses, each getting what they need, each providing from their surplus. The algorithm found a solution none of them could have computed manually.

### Why This Matters

This is where AI matching provides unique value. Humans struggle to hold more than 2-3 parties in mind. The algorithm can scan thousands of participants and find complex chains that close.

---

## Scenario 3: The Six-Party Mega-Chain

**Complex exchanges that demonstrate the full potential**

### The Situation

Six professional services firms in a network:

| Business | Surplus | Need |
|----------|---------|------|
| **Harrison & Co** (Legal) | Contract review | Brand refresh |
| **Savour Events** (Catering) | Corporate events | Contract review |
| **ByteForge** (IT) | Web development | Event catering |
| **Momentum Marketing** | Content strategy | Website rebuild |
| **Clearview Accounting** | Bookkeeping | Content marketing |
| **Pixel & Grain** (Design) | Branding, design | Bookkeeping |

### The Chain

```
Harrison (Legal) ──contract review──► Savour (Catering)
Savour (Catering) ──event catering──► ByteForge (IT)
ByteForge (IT) ──web development──► Momentum (Marketing)
Momentum (Marketing) ──content strategy──► Clearview (Accounting)
Clearview (Accounting) ──bookkeeping──► Pixel & Grain (Design)
Pixel & Grain (Design) ──brand refresh──► Harrison (Legal)
```

### The Execution

1. **Algorithm proposes** the chain with match scores for each edge
2. **All six participants** review and confirm within 48 hours
3. **Execution window** set for 6 weeks
4. **Each edge executes** according to agreed timeline
5. **Satisfaction signals** collected as each delivery completes
6. **Chain completes** — all six businesses received value

### Why This Is Remarkable

No human could have computed this chain by scanning the network manually. The algorithm evaluated hundreds of possible combinations to find one where:
- All six parties have matching capabilities and needs
- Timing constraints align
- Trust thresholds are met
- Geographic constraints (where applicable) are satisfied

---

## Scenario 4: The Newcomer Path

**How a new business builds trust and starts exchanging**

### The Situation

**PrintCraft** is a new printing company. They've just joined the network but have no exchange history, no trust score, and no network connections.

### The Challenge

Established participants are cautious about newcomers. How does PrintCraft prove reliability?

### The Onboarding Journey

**Week 1: Verification**
- PrintCraft provides business registration details
- Professional credentials verified
- Marked as "probationary" status

**Week 2: Vouching**
- Pixel & Grain (an established design studio) vouches for PrintCraft
- They've worked together before outside the network
- Pixel & Grain's reputation is now partially at stake

**Week 3: First Exchange**
- PrintCraft matched in a small, 2-party exchange
- Delivers business cards and letterheads to Clearview Accounting
- Receives positive satisfaction signal

**Month 2: Building History**
- Completes 3 more exchanges
- All receive "satisfied" signals
- Network position metrics start accumulating

**Month 3: Established Status**
- Reaches threshold: 5+ exchanges, 4+ distinct partners
- Promoted from "probationary" to "established"
- Now eligible for longer chains and higher-value exchanges

### Why This Works

The graduated exposure protects the network from bad actors while giving legitimate newcomers a clear path to full participation. The vouching system creates accountability — Pixel & Grain wouldn't vouch for PrintCraft if they weren't confident in their reliability.

---

## Scenario 5: Physical Goods Exchange

**When surplus isn't just services**

### The Situation

**ByteForge** (IT consultancy) is exhibiting at a tech conference. They need:
- Pull-up banner printed
- 200 brochures

**PrintCraft** has printing capacity and surplus paper stock from a cancelled job.

### The Complication

Unlike services, physical goods have:
- Location constraints (delivery required)
- Timing constraints (conference date is fixed)
- Condition requirements (must be new quality)

### How SEP Handles Physical Goods

The offering includes physical-specific details:
```
Type: physical_good
Location: Ships from Manchester
Delivery: UK mainland, 5-7 business days
Condition: New (surplus stock from cancelled order)
```

The need specifies:
```
Delivery location: London (conference venue)
Needed by: 2026-04-01 (conference starts April 3)
Condition required: New
```

The algorithm verifies compatibility:
- Delivery time fits deadline ✓
- Location is serviceable ✓
- Condition matches requirement ✓

### The Chain

This can be part of a larger exchange:
```
ByteForge ──IT support──► PrintCraft
PrintCraft ──printed materials──► ByteForge
```

Or integrated into a multi-party chain where ByteForge provides IT services to a third party who provides something PrintCraft needs.

---

## Scenario 6: The Recession Resilience Story

**When cash is tight, surplus exchange becomes essential**

### The Situation

Economic downturn hits. Businesses are cutting costs, but still need services to operate.

**Clearview Accounting** has lost several clients. Their accountants have spare capacity, but new business is hard to find.

**Multiple small businesses** need accounting help but have frozen their "discretionary" spending, including professional services.

### The Problem

Cash-constrained businesses stop buying services → Service providers have unused capacity → Economy contracts further.

### How SEP Helps

During downturns, surplus exchange becomes more attractive:
- Businesses have more surplus (unused capacity)
- Businesses have less cash (can't buy what they need)
- Exchange becomes a way to access services without cash outlay

**Clearview's response:**
- Increases surplus offering (more capacity available)
- Actively matches with businesses who have surplus they need
- Maintains client relationships through exchange rather than losing them entirely

### Historical Precedent

This isn't theoretical. The WIR Bank in Switzerland (founded 1934) sees increased activity during recessions. When conventional commerce contracts, complementary exchange expands. SEP is designed to capture this counter-cyclical opportunity.

---

## Scenario 7: The Sector Ecosystem

**When a cluster of related businesses form a mini-economy**

### The Situation

A cluster of professional services firms discover each other through SEP:
- 3 law firms (different specialisations)
- 2 accountancy practices
- 4 marketing/design agencies
- 2 IT consultancies
- 1 HR consultancy
- 2 training providers

### The Ecosystem Dynamic

These businesses:
- Regularly need each other's services
- Have predictable surplus patterns (quiet periods, spare capacity)
- Share professional standards and communication norms
- Can assess each other's quality relatively easily

### The Network Effect

As more professional services firms join:
- Match probability increases (more potential partners)
- Chain discovery improves (more paths to close loops)
- Trust accumulates (satisfaction signals compound)
- Specialisation becomes viable (niche offerings find matches)

### The Virtuous Cycle

```
More participants → Better matches
Better matches → Higher satisfaction
Higher satisfaction → Word of mouth
Word of mouth → More participants
```

### Why Professional Services First

This sector was chosen for initial focus because:
- Clear surplus patterns (billable capacity)
- Describable capabilities (professional credentials)
- Inter-dependent needs (businesses need each other)
- Professional accountability (reputation matters)

---

## Scenario 8: The Near-Miss Save

**When traditional commerce almost happened, but didn't**

### The Situation

**Momentum Marketing** needs a website rebuild. They got three quotes:
- Agency A: £15,000
- Agency B: £12,000
- ByteForge: £9,000

Even the lowest quote exceeds their budget. The project is shelved.

### The SEP Alternative

Momentum checks the network. ByteForge has web development surplus and needs content marketing — which Momentum offers.

The exchange:
- ByteForge builds Momentum's website
- Momentum provides ByteForge's content strategy and 6 months of blog content

### The Economics

**Without SEP:**
- Momentum: No website (project shelved)
- ByteForge: No sale (lost to budget constraints)
- Result: No value created

**With SEP:**
- Momentum: Gets website (values at £9,000+)
- ByteForge: Gets content marketing (values at £8,000+)
- Result: £17,000+ of value unlocked from surplus

### Why This Happens

Cash constraints create artificial barriers. Momentum had the budget eventually, ByteForge had the capacity now. SEP removes the timing mismatch by enabling exchange without cash flow requirements.

---

## Summary: The Value Proposition

| Scenario | Value Created | Key Insight |
|----------|---------------|-------------|
| Direct swap | Both parties gain from surplus | Subjective value means both can "win" |
| 3-party chain | Matches found where none existed | AI discovers non-obvious paths |
| 6-party chain | Complex network value unlocked | Scale enables sophisticated matching |
| Newcomer path | Trust built systematically | Graduated exposure protects network |
| Physical goods | Non-service surplus exchanged | Protocol handles logistics complexity |
| Recession resilience | Counter-cyclical exchange | Cash constraints don't block value |
| Sector ecosystem | Network effects compound | Density enables specialisation |
| Near-miss save | Blocked transactions unblocked | Removes cash timing barriers |

---

## Appendix: What Makes a Good SEP Participant?

Based on these scenarios, ideal participants have:

**Predictable surplus**
- Regular spare capacity (not just occasional)
- Describable offerings (can be matched algorithmically)
- Flexible timing (can accommodate chain coordination)

**Genuine needs**
- Services/goods they would otherwise purchase
- Willingness to receive from network partners
- Openness to multi-party chains

**Professional standards**
- Reliable delivery (reputation at stake)
- Clear communication (scope agreement)
- Fair dealing (subjective value respected)

**Network orientation**
- Willing to vouch for newcomers they trust
- Active participation (not just passive listing)
- Long-term thinking (network health matters)
