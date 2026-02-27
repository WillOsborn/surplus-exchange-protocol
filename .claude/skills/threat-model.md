# Threat Model Skill

Generate comprehensive threat models for SEP components using STRIDE methodology.

## Invocation

```
/threat-model [component]
```

Where `[component]` is:
- `chain-confirmation` - The confirmation flow for exchange chains
- `trust-calculation` - Trust tier and reputation calculation
- `compensation-mechanism` - Failure handling and compensation
- `message-protocol` - Protocol message handling
- `matching-algorithm` - Chain discovery and matching
- Custom component name

## Instructions

### Threat Model Structure

For each component, produce a document following OWASP Threat Model format:

```markdown
# Threat Model: [Component Name]

## 1. Overview

### 1.1 Description
What the component does and its role in SEP.

### 1.2 Scope
What is included/excluded from this threat model.

### 1.3 External Dependencies
Other systems or components this depends on.

## 2. Assets

### 2.1 Data Assets
| Asset | Description | Sensitivity |
|-------|-------------|-------------|
| Participant identity | ... | High |
| Chain state | ... | High |

### 2.2 Functional Assets
| Asset | Description | Criticality |
|-------|-------------|-------------|
| State transition logic | ... | Critical |

## 3. Trust Boundaries

### 3.1 Diagram
```
[ASCII or Mermaid diagram showing trust boundaries]
```

### 3.2 Boundary Descriptions
| Boundary | From | To | Data Crossing |
|----------|------|-----|---------------|
| B1 | External | SEP Gateway | Messages |

## 4. Entry Points

| ID | Name | Description | Trust Level Required |
|----|------|-------------|---------------------|
| EP1 | Message API | Receives protocol messages | Authenticated participant |

## 5. STRIDE Analysis

### 5.1 Spoofing

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|----|--------|------------|--------|------|------------|
| S1 | Participant impersonation | Medium | High | High | Cryptographic signatures |

### 5.2 Tampering
[Same table format]

### 5.3 Repudiation
[Same table format]

### 5.4 Information Disclosure
[Same table format]

### 5.5 Denial of Service
[Same table format]

### 5.6 Elevation of Privilege
[Same table format]

## 6. Attack Trees

### 6.1 [Primary Attack Goal]
```
Goal: [Attack objective]
├── Method 1: [Attack path]
│   ├── Prerequisite: [What attacker needs]
│   └── Mitigation: [Defence]
└── Method 2: [Alternative path]
    ├── Prerequisite: [What attacker needs]
    └── Mitigation: [Defence]
```

## 7. Risk Summary

| Risk Level | Count | Examples |
|------------|-------|----------|
| Critical | 0 | - |
| High | 2 | S1, T3 |
| Medium | 5 | ... |
| Low | 3 | ... |

## 8. Recommended Mitigations

### 8.1 Immediate (Critical/High)
1. [Mitigation 1]
2. [Mitigation 2]

### 8.2 Short-term (Medium)
1. [Mitigation 3]

### 8.3 Long-term (Low/Improvements)
1. [Mitigation 4]

## 9. Assumptions

- [Assumption 1]
- [Assumption 2]

## 10. References

- Related specs
- Security standards
```

### Component-Specific Guidance

#### Chain Confirmation
Focus on:
- Confirmation message authenticity
- State synchronisation attacks
- Timeout manipulation
- Partial confirmation exploits

#### Trust Calculation
Focus on:
- Input manipulation (fake completions)
- Sybil account patterns
- Vouching ring detection
- Calculation timing attacks

#### Compensation Mechanism
Focus on:
- Forced failure scenarios
- Compensation amount manipulation
- Priority credit farming
- Selective failure attacks

### Output Location

Save threat models to:
```
docs/specs/threat-models/[component].md
```

### References

- OWASP Threat Modeling: https://owasp.org/www-community/Threat_Modeling
- Microsoft STRIDE: https://docs.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats
- SEP Security Audit: `docs/specs/security-audit.md`
