# Security Review Skill

Assess security risks in a specific file or component.

## Invocation

```
/security-review [target]
```

Where `[target]` is:
- A file path: `schemas/need.schema.json`, `src/protocol/state-machine.ts`
- A component name: `chain-confirmation`, `trust-calculation`
- A spec document: `docs/specs/execution-protocol.md`

## Instructions

### Review Process

1. **Read the target** file or component
2. **Identify assets** - What data/functionality needs protection?
3. **Apply STRIDE** - Check each threat category
4. **Assess SEP-specific threats** - Check the SEP threat vectors
5. **Rate findings** - Severity based on impact and exploitability
6. **Recommend fixes** - Specific, actionable remediation

### STRIDE Categories

For each target, consider:

| Category | Question | Examples |
|----------|----------|----------|
| **Spoofing** | Can an attacker impersonate a legitimate entity? | Fake participant, forged message |
| **Tampering** | Can data be modified maliciously? | Alter chain state, modify messages |
| **Repudiation** | Can actions be denied later? | Unsigned confirmations, missing audit |
| **Information Disclosure** | Can sensitive data leak? | Exposed needs, transaction patterns |
| **Denial of Service** | Can availability be affected? | Chain spam, resource exhaustion |
| **Elevation of Privilege** | Can unauthorised access be gained? | Bypass trust tier, forge vouching |

### SEP-Specific Threat Vectors

Check for these SEP-specific threats:

1. **Identity/Authentication**
   - Agent impersonation
   - Credential replay
   - Delegation abuse

2. **Chain Manipulation**
   - Fraudulent confirmations
   - State desync attacks
   - Timing manipulation

3. **Trust Gaming**
   - Sybil accounts
   - Vouching collusion
   - Satisfaction manipulation

4. **Compensation Abuse**
   - Forced failures
   - Strategic partial completion
   - Priority credit farming

### Output Format

```markdown
# Security Review: [target]

## Summary
Brief overview of findings

## Assets Identified
- [Asset 1]: Description
- [Asset 2]: Description

## Findings

### [SEV-001] Finding Title
**Severity**: Critical | High | Medium | Low | Info
**Category**: STRIDE category + SEP vector
**Location**: Specific location (line number, field, etc.)

**Description**:
What the vulnerability is and how it could be exploited.

**Impact**:
What damage could result from exploitation.

**Recommendation**:
Specific fix or mitigation.

**Code Example** (if applicable):
```[language]
// Before (vulnerable)
...

// After (fixed)
...
```

---

[Repeat for each finding]

## Recommendations Summary

| ID | Severity | Fix Effort | Priority |
|----|----------|------------|----------|
| SEV-001 | High | Low | Immediate |
| SEV-002 | Medium | Medium | Next sprint |

## Notes
Additional observations or accepted risks
```

### Severity Criteria

| Severity | Impact | Exploitability |
|----------|--------|----------------|
| Critical | System compromise, fund loss | Easy, remote, no auth needed |
| High | Significant data breach, service disruption | Moderate effort, auth bypass |
| Medium | Limited data exposure, degraded service | Requires specific conditions |
| Low | Minor information leak, edge case | Difficult, unlikely scenario |
| Info | Best practice improvement | Not exploitable |

### References

- OWASP Top 10: https://owasp.org/Top10/
- STRIDE: Microsoft threat modelling
- SEP threat model: `docs/specs/security-audit.md`
