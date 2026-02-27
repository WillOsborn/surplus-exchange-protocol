# Expected Chains from Test Data

This document describes the viable chains that should be discovered from the test data.

## Participants Summary

| ID | Name | Offers | Needs |
|----|------|--------|-------|
| Alice | Harrison & Co (Legal) | Contract review | Brand refresh |
| Bob | Savour Events (Catering) | Corporate catering | Contract review |
| Carol | Pixel & Grain (Design) | Branding, Marketing collateral | Bookkeeping |
| Dan | Clearview (Accounting) | Bookkeeping, Tax advice | Content marketing |
| Eve | Momentum (Marketing) | Content strategy | Website rebuild |
| Frank | ByteForge (IT) | Web dev, IT support | Catering, Printing |
| Grace | PrintCraft (Printing) | Printed materials | Design work |

## Chain 1: Three-Party Legal-Catering-Design Loop

```
Alice (Legal) → Bob (Catering): Contract review
Bob (Catering) → Carol (Design): Event catering [NO - Bob is catering, not needing it]
```

Wait, let me re-examine the data...

**Corrected Chain 1: Alice-Carol-Dan**
```
Alice (Legal) ──contract review──► Bob (Catering) [Bob needs contract review]
                 ↑                           │
                 │                           │ [Bob offers catering]
                 │                           ↓
          [Carol offers branding]      Frank (IT) [Frank needs catering]
                 │                           │
                 │                           │ [Frank offers web dev]
                 │                           ↓
Alice (Legal) ◄──branding────────── Carol (Design)
                                         ↑
                                         │ [Carol needs bookkeeping]
                                         │
                                    Dan (Accounting) [Dan offers bookkeeping]
```

Hmm, this doesn't close cleanly. Let me trace viable cycles more carefully.

## Viable Cycles

### Cycle A: Alice → Bob → Frank → ? → Alice

- Alice OFFERS: Contract review
- Alice NEEDS: Branding
- Bob OFFERS: Catering
- Bob NEEDS: Contract review ✓ (Alice can provide)
- Frank OFFERS: Web dev, IT support
- Frank NEEDS: Catering ✓ (Bob can provide), Printing

For this to close, we need someone who:
- NEEDS what Frank offers (web dev)
- OFFERS what Alice needs (branding)

**Eve** NEEDS website (Frank can provide)
**Eve** OFFERS content marketing (Alice doesn't need this)

**Carol** doesn't need web dev but offers branding...

### Cycle B: Alice → Bob → Frank → Eve → Carol → Alice

```
Alice ──contract review──► Bob
Bob ──catering──► Frank
Frank ──web dev──► Eve
Eve ──content──► Dan
Dan ──bookkeeping──► Carol
Carol ──branding──► Alice
```

✓ Alice offers contracts, Bob needs contracts
✓ Bob offers catering, Frank needs catering
✓ Frank offers web dev, Eve needs website
✓ Eve offers content, Dan needs content
✓ Dan offers bookkeeping, Carol needs bookkeeping
✓ Carol offers branding, Alice needs branding

**This is a valid 6-party chain!**

### Cycle C: Shorter - Carol → Dan → Eve → ? → Carol

```
Carol ──needs bookkeeping, Dan offers it──► Dan
Dan ──needs content, Eve offers it──► Eve
Eve ──needs website, Frank offers it──► Frank
Frank ──needs catering, Bob offers it──► Bob
Bob ──needs contracts, Alice offers it──► Alice
Alice ──needs branding, Carol offers it──► Carol
```

Same as Cycle B, just different starting point.

### Cycle D: Three-party with Grace (probationary)

```
Carol ──marketing collateral design──► Grace (Grace needs design)
Grace ──printed materials──► Frank (Frank needs printing)
Frank ──??? ──► Carol (Carol needs bookkeeping, Frank offers IT)
```

This doesn't close. Frank doesn't offer what Carol needs.

### Cycle E: Carol → Dan → Eve → ?

If we can find a 3-4 party cycle:

```
Carol ──bookkeeping need──► Dan (Dan offers bookkeeping) ✓
Dan ──content need──► Eve (Eve offers content) ✓
Eve ──website need──► ???

Eve needs website (Frank offers)
Frank needs catering (Bob offers) or printing (Grace offers)
```

**Cycle E variant: Carol → Dan → Eve → Frank → Bob → Alice → Carol** = 6 parties (same as B)

### Cycle F: Grace inclusion (constrained by probationary status)

Grace (probationary) has max_chain_length: 3

```
Carol ──collateral design──► Grace
Grace ──printing──► ??? who needs printing and offers what Carol needs?
```

Frank needs printing, offers IT (Carol doesn't need)
No one else explicitly needs printing in the test data.

**Add a need for printing to Carol or Dan?**

Actually, we could create:
```
Carol ──design──► Grace
Grace ──printing──► Carol [Carol could use business cards]
```
But this is a 2-party direct swap, not a chain.

## Summary of Expected Chains

### High-confidence (should be found):

1. **6-party mega-chain**: Alice → Bob → Frank → Eve → Dan → Carol → Alice
   - All established participants
   - All explicit matches
   - Score: Should be moderate (long chain = complexity penalty)

### Medium-confidence (may require relaxed matching):

2. **Any sub-cycles** from the mega-chain (e.g., if someone drops out)

### Edge cases:

3. **Grace participation**: Limited to 3-party chains with at least one established participant. Test data may not have a viable 3-party chain including Grace due to sector/offering mismatch.

## Match Quality Notes

| Edge | Match Quality | Notes |
|------|--------------|-------|
| Alice → Bob | High | Contract review is explicit need |
| Bob → Frank | High | Catering for 25 matches 20-50 capacity, Manchester location works |
| Frank → Eve | High | Web dev matches website rebuild need |
| Eve → Dan | High | Content strategy matches content need |
| Dan → Carol | High | Bookkeeping matches bookkeeping need |
| Carol → Alice | High | Branding matches brand refresh need |

## Constraints to Verify

- Bob's catering is Manchester area only ✓ (Frank's event is in Manchester)
- Frank's web dev starts March 1 ✓ (Eve needs by April 30)
- Grace is probationary: max 3-party chains
- Dan requires min 3 exchanges from partners (Alice: 8, Carol: 10, Eve: 4 - all pass)

## Algorithm Validation

The matching algorithm should:

1. ✓ Find the 6-party chain
2. ✓ Rank it appropriately (penalised for length)
3. ✓ Not propose chains violating constraints
4. ✓ Handle probationary participants correctly
5. ✓ Provide match reasoning for each edge
