# SEP Security Model Prototype

**Status**: Draft
**Created**: 2026-02-05
**Informed by**: participant.schema.json, protocol-messages.json, comparative-analysis.md

## Overview

This document defines the authentication, authorisation, and cryptographic mechanisms for SEP. The security model must:

1. Enable decentralised operation (no central authority required for message validation)
2. Support participant privacy while enabling trust assessment
3. Prevent common attack vectors identified in historical barter systems
4. Integrate with existing identity verification services

## Design Principles

1. **Decentralised verification**: Any node can verify message authenticity without contacting issuer
2. **Minimal disclosure**: Share only what's needed for each interaction
3. **Cryptographic accountability**: All commitments are signed and non-repudiable
4. **Graduated trust**: Security requirements scale with exchange complexity/value
5. **Recovery paths**: Account recovery without central authority dependency

---

## Identity Layer

### Participant Identity Structure

```
Participant Identity:
├── Cryptographic Identity (Layer 0)
│   ├── Primary key pair (Ed25519)
│   ├── Recovery key pair (cold storage)
│   └── Delegate keys (for agents/automation)
│
├── Verified Identity (Layer 1)
│   ├── Legal entity verification
│   ├── Professional body memberships
│   └── Jurisdiction information
│
├── Network Identity (Layer 2)
│   ├── Exchange history (computed)
│   ├── Satisfaction signals (aggregated)
│   └── Vouching relationships
│
└── Public Profile (Layer 3)
    ├── Display name
    ├── Description
    └── Contact preferences
```

### Key Management

#### Primary Key Pair
- **Algorithm**: Ed25519 (fast, small signatures, widely supported)
- **Purpose**: Sign all protocol messages
- **Storage**: Participant-controlled (hardware key, secure enclave, or encrypted file)
- **Rotation**: Supported via signed key rotation message

#### Recovery Key
- **Purpose**: Recover account if primary key compromised
- **Storage**: Offline/cold storage
- **Usage**: Can sign key rotation message to replace primary key
- **Recommendation**: Multi-signature recovery (2-of-3 with trusted parties)

#### Delegate Keys
- **Purpose**: Allow AI agents or automation to act on behalf of participant
- **Constraints**:
  - Can be scoped to specific actions (e.g., "can confirm chains under 3 parties")
  - Time-limited
  - Revocable by primary key
- **Format**: Signed delegation certificate

```json
{
  "type": "DelegationCertificate",
  "delegate_public_key": "ed25519:abc123...",
  "grantor_id": "participant-001",
  "permissions": [
    "sign_acknowledgments",
    "sign_health_checks",
    {
      "action": "sign_confirmations",
      "constraints": {
        "max_chain_size": 3,
        "max_execution_window_days": 30
      }
    }
  ],
  "valid_from": "2026-02-05T00:00:00Z",
  "valid_until": "2026-08-05T00:00:00Z",
  "grantor_signature": "..."
}
```

---

## Message Authentication

### Signature Format

All protocol messages include a signature covering the message content:

```json
{
  "message_id": "msg-001-abc",
  "message_type": "ParticipantConfirmation",
  "timestamp": "2026-02-06T09:15:00Z",
  "sender_id": "participant-A",
  "protocol_version": "1.0",
  "chain_id": "chain-123",
  "participant_id": "participant-A",
  "decision": "confirm",

  "_signature": {
    "algorithm": "ed25519",
    "public_key": "ed25519:participant-A-pubkey...",
    "signature": "base64-encoded-signature...",
    "signed_fields": ["message_id", "message_type", "timestamp", "sender_id", "protocol_version", "chain_id", "participant_id", "decision"]
  }
}
```

### Signature Verification Process

```
1. Extract signed_fields from message
2. Canonicalise: Sort fields alphabetically, encode as JSON with no whitespace
3. Compute: signature = Ed25519_sign(private_key, canonicalised_content)
4. Verify: Ed25519_verify(public_key, canonicalised_content, signature)
```

### Message Integrity Chain

For chain proposals and commitments, messages form an integrity chain:

```
ChainProposal (hash: H1)
    ↓
ParticipantConfirmation A (references: H1, hash: H2)
    ↓
ParticipantConfirmation B (references: H1, hash: H3)
    ↓
ChainCommitment (references: H1, H2, H3, hash: H4)
    commitment_hash = SHA256(H1 || H2 || H3)
```

This allows any party to verify the complete confirmation sequence.

---

## Authorisation Model

### Action Permissions

| Action | Who Can Perform | Verification |
|--------|-----------------|--------------|
| Create chain proposal | Any verified participant | Valid signature |
| Confirm chain | Named participants only | Signature matches participant_id |
| Signal execution start | Edge provider only | Signature matches provider_id |
| Signal delivery | Edge provider only | Signature matches provider_id |
| Signal satisfaction | Edge recipient only | Signature matches recipient_id |
| Raise dispute | Provider or recipient of edge | Signature matches either party |
| Health check | Chain participants or designated monitors | Valid signature + role verification |

### Role-Based Constraints

```
Participant Roles:
├── PROBATIONARY
│   ├── Max chain size: 3 participants
│   ├── Max execution window: 30 days
│   ├── Requires vouch for first exchange
│   └── Cannot vouch for others
│
├── ACTIVE
│   ├── Max chain size: 6 participants
│   ├── Max execution window: 90 days
│   ├── Can vouch for up to 2 newcomers
│   └── Standard rate limits
│
└── ANCHOR
    ├── No chain size limit
    ├── No execution window limit
    ├── Can vouch for up to 5 newcomers
    └── Priority in chain matching
```

### Escalation of Privilege

Advancement through trust tiers requires:

```
PROBATIONARY → ACTIVE:
- Completed 3+ chains with "satisfied" signals
- 60+ days since joining
- No disputes where found at fault
- Voucher still in good standing

ACTIVE → ANCHOR:
- Completed 20+ chains
- 180+ days since joining
- 95%+ satisfaction rate as provider
- Vouched for at least 1 participant who became ACTIVE
- Manual review by network governance
```

---

## Threat Model

### Threat Categories

#### T1: Identity Attacks

| Threat | Description | Mitigation |
|--------|-------------|------------|
| T1.1 Key theft | Attacker obtains participant's private key | Recovery key mechanism; key rotation; hardware key recommendation |
| T1.2 Impersonation | Attacker creates fake participant mimicking real business | KYB verification; professional body checks; vouching requirements |
| T1.3 Sybil attack | Attacker creates multiple fake participants | Verification costs; vouching limits; network analysis |

#### T2: Protocol Attacks

| Threat | Description | Mitigation |
|--------|-------------|------------|
| T2.1 Replay attack | Attacker replays old valid message | Message ID uniqueness; timestamp validation; state machine guards |
| T2.2 Message tampering | Attacker modifies message in transit | Cryptographic signatures on all messages |
| T2.3 Denial of service | Attacker floods network with invalid messages | Rate limiting; signature verification before processing |
| T2.4 State manipulation | Attacker tries invalid state transitions | State machine validation; signed state transitions |

#### T3: Economic Attacks

| Threat | Description | Mitigation |
|--------|-------------|------------|
| T3.1 Free riding | Participant receives but never provides | Balance tracking; graduated limits; activity monitoring |
| T3.2 Quality fraud | Provider delivers less than promised | Satisfaction signals; dispute resolution; reputation impact |
| T3.3 Collusion | Multiple participants coordinate to exploit others | Network analysis; unusual pattern detection; vouch chain analysis |
| T3.4 Abandonment | Participant disappears mid-chain | Escrow-like commitment; compensation mechanisms; reputation impact |

#### T4: Privacy Attacks

| Threat | Description | Mitigation |
|--------|-------------|------------|
| T4.1 Activity tracking | Observer infers business relationships | Encrypted point-to-point communication; selective disclosure |
| T4.2 Capability harvesting | Competitor maps another's capabilities | Access controls on capability details; aggregated public metrics only |
| T4.3 Network mapping | Observer maps entire network structure | Decentralised architecture; no central registry requirement |

---

## Cryptographic Primitives

### Recommended Algorithms

| Purpose | Algorithm | Rationale |
|---------|-----------|-----------|
| Signatures | Ed25519 | Fast, small (64 bytes), no RNG needed for signing, widely supported |
| Hashing | SHA-256 | Ubiquitous, sufficient security margin, hardware acceleration common |
| Encryption (at rest) | AES-256-GCM | Authenticated encryption, hardware acceleration |
| Encryption (in transit) | TLS 1.3 | Standard transport security |
| Key derivation | Argon2id | Memory-hard, resistant to GPU/ASIC attacks |

### Commitment Schemes

For chain commitments, use hash-based commitment:

```
Commitment Phase:
1. Each participant commits: commit_i = SHA256(decision_i || nonce_i)
2. All commits collected
3. Reveal phase: each participant reveals decision_i and nonce_i
4. Verify: SHA256(decision_i || nonce_i) == commit_i

Final commitment hash:
commitment_hash = SHA256(
  chain_id ||
  sorted(all_confirmation_hashes) ||
  final_timing_hash
)
```

---

## Privacy Considerations

### Data Classification

| Data Type | Visibility | Rationale |
|-----------|------------|-----------|
| Participant ID | Public | Required for protocol operation |
| Display name | Public | Enables human interaction |
| Verified identity details | Private (attestation only) | Legal name not needed for exchange |
| Capability offerings | Selective | Shared with potential matches only |
| Exchange history | Aggregated only | Individual transactions private |
| Satisfaction signals | Aggregated only | Specific feedback private |

### Selective Disclosure

Participants can prove attributes without revealing underlying data:

```
Zero-Knowledge Proofs (future consideration):
- "I have completed >10 exchanges" without revealing exact count
- "My satisfaction rate is >90%" without revealing individual signals
- "I am verified by a professional body" without revealing which one

Initial Implementation:
- Attestation-based: Trusted third party signs claims
- Aggregation-based: Network computes and signs aggregate metrics
```

### Communication Privacy

```
Point-to-Point Messages:
- Encrypted to recipient's public key
- Only participants in a chain see chain details
- Health checks visible only to chain participants

Public Information:
- Participant public keys
- Aggregate network statistics
- Protocol version information
```

---

## Implementation Notes

### Signature Library Recommendations

**Node.js/TypeScript**:
```typescript
import { sign, verify } from '@noble/ed25519';

// Sign message
const signature = await sign(messageHash, privateKey);

// Verify signature
const isValid = await verify(signature, messageHash, publicKey);
```

**Alternative**: `tweetnacl` for broader compatibility

### Key Storage Recommendations

| Environment | Recommendation |
|-------------|----------------|
| Server | Hardware Security Module (HSM) or encrypted keyfile with separate access controls |
| Desktop | OS keychain (macOS Keychain, Windows Credential Manager) |
| Mobile | Secure enclave / Android Keystore |
| Development | Encrypted file with environment variable passphrase |

### Rate Limiting

```
Default Rate Limits:
- Message submission: 100/minute per participant
- Chain proposals: 10/hour per participant
- Confirmation requests: 50/hour per participant

Elevated Limits (ANCHOR tier):
- Message submission: 500/minute
- Chain proposals: 50/hour
- Confirmation requests: 200/hour
```

---

## Open Questions

1. **Key recovery without centralisation**: How do participants recover accounts without a central authority? Current thinking: social recovery (M-of-N trusted contacts) or time-locked recovery keys.

2. **Delegation revocation propagation**: How quickly must delegation revocations propagate? Immediate vs batched?

3. **Cross-network identity**: If SEP federates, how do identities transfer between networks?

4. **Quantum resistance**: When should we plan migration to post-quantum algorithms? Ed25519 is not quantum-resistant.

5. **Audit logging**: What's the minimum audit trail for dispute resolution without compromising privacy?

---

## References

- Ed25519: Bernstein et al., "High-speed high-security signatures" (2012)
- Argon2: Biryukov et al., "Argon2: the memory-hard function" (2015)
- W3C DID: Decentralised Identifiers specification
- FIDO2/WebAuthn: For hardware key integration patterns
- docs/research/comparative-analysis.md: Trust mechanism research
