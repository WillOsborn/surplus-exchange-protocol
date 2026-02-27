# Security and Integration Specification

**Status**: Draft
**Version**: 1.0.0
**Last Updated**: 2026-02-05

## 1. Overview and Terminology

This specification defines the security model, authentication mechanisms, and integration patterns for the Surplus Exchange Protocol (SEP). It covers how participants and their AI agents authenticate, how authorisation is managed, and how SEP interoperates with external agentic protocols.

### 1.1 Terminology

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

**Participant**: A business or individual who offers surplus capacity and/or has needs that could be satisfied through exchange.

**Agent**: An AI-powered software component that acts on behalf of a participant within the SEP network.

**Broker**: A specialised agent (or service) that discovers and proposes exchange chains across multiple participants.

**Identity Provider (IdP)**: A service that authenticates participants and issues credentials.

**Delegation**: The act of a participant granting an agent authority to perform specific actions on their behalf.

**Trust Tier**: A classification determining what actions a participant or agent can perform, based on track record.

### 1.2 Design Principles

1. **Defence in depth**: Multiple layers of security, from transport to application level
2. **Least privilege**: Agents receive only the permissions necessary for their function
3. **Auditability**: All security-relevant actions are logged with non-repudiation
4. **Graceful degradation**: Security failures result in denial, not exposure
5. **Interoperability**: Security mechanisms align with established standards (OAuth 2.0, A2A)

---

## 2. Authentication Model

SEP uses OAuth 2.0 as the primary authentication framework, following patterns established by the A2A Protocol for agent-to-agent communication.

### 2.1 Authentication Flows

#### 2.1.1 Participant Authentication

Participants MUST authenticate with an SEP-compatible Identity Provider to establish their identity within the network.

**Supported flows:**

| Flow | Use Case | Security Level |
|------|----------|----------------|
| Authorization Code + PKCE | Human participant onboarding | High |
| Client Credentials | Server-to-server (B2B) | High |
| Device Authorization | IoT/embedded participants | Medium |

Participants SHOULD use Authorization Code with PKCE for initial setup and Client Credentials for ongoing operations.

#### 2.1.2 Agent Authentication

Agents MUST authenticate using the OAuth 2.0 Client Credentials flow:

```
POST /oauth/token HTTP/1.1
Host: idp.example.com
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=agent:design-services@participant-456
&client_secret={secret}
&scope=sep:discover sep:receive_proposals sep:confirm
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6Ikp...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "sep:discover sep:receive_proposals sep:confirm"
}
```

### 2.2 Token Structure

SEP access tokens MUST be JSON Web Tokens (JWT) conforming to [RFC 7519](https://www.rfc-editor.org/rfc/rfc7519).

#### 2.2.1 Required Claims

| Claim | Description | Example |
|-------|-------------|---------|
| `iss` | Token issuer (IdP) | `https://idp.sep-network.org` |
| `sub` | Subject (agent identifier) | `agent:design-services@participant-456` |
| `aud` | Intended audience | `https://sep.network` |
| `exp` | Expiration timestamp | `1738800000` |
| `iat` | Issued at timestamp | `1738796400` |
| `jti` | Unique token identifier | `tok-a1b2c3d4` |

#### 2.2.2 SEP-Specific Claims

| Claim | Description | Example |
|-------|-------------|---------|
| `sep:participant` | Delegating participant | `participant-456` |
| `sep:trust_tier` | Current trust tier | `established` |
| `sep:scopes` | Granted SEP scopes | `["discover", "confirm"]` |
| `sep:delegation_limits` | Operational constraints | See Section 3.3 |

**Example Token Payload:**

```json
{
  "iss": "https://idp.sep-network.org",
  "sub": "agent:design-services@participant-456",
  "aud": "https://sep.network",
  "exp": 1738800000,
  "iat": 1738796400,
  "jti": "tok-a1b2c3d4",
  "sep:participant": "participant-456",
  "sep:trust_tier": "established",
  "sep:scopes": ["discover", "receive_proposals", "confirm"],
  "sep:delegation_limits": {
    "max_chain_size": 6,
    "max_execution_window_days": 90,
    "excluded_sectors": ["gambling", "tobacco"]
  }
}
```

### 2.3 Token Lifecycle

1. **Issuance**: Tokens MUST be issued with an expiry of no more than 1 hour for active operations
2. **Refresh**: Agents MAY use refresh tokens (24-hour validity) to obtain new access tokens
3. **Revocation**: Participants MUST be able to revoke agent tokens immediately via the IdP
4. **Rotation**: Client secrets SHOULD be rotated at least quarterly

### 2.4 Transport Security

All SEP communications MUST use TLS 1.3 or later. Implementations:

- MUST verify server certificates against trusted CA roots
- MUST reject self-signed certificates in production
- SHOULD implement certificate pinning for high-security deployments
- MUST NOT fall back to unencrypted connections

---

## 3. Agent Identity and Authorisation

### 3.1 Agent Registration

Before an agent can operate within SEP, it MUST be registered with both an Identity Provider and its delegating participant.

#### 3.1.1 Registration Process

1. **Participant creates agent identity**: The participant registers the agent with their chosen IdP
2. **Agent credentials issued**: The IdP issues client credentials (client_id, client_secret)
3. **Delegation grant**: The participant explicitly grants delegation to the agent
4. **Capability declaration**: The agent declares its capabilities (what SEP operations it can perform)

#### 3.1.2 Agent Identifier Format

Agent identifiers MUST follow the format:

```
agent:{agent_name}@{participant_id}
```

Examples:
- `agent:design-services@participant-456`
- `agent:procurement-bot@acme-corp`
- `agent:matching-broker@sep-network`

### 3.2 Authorisation Scopes

SEP defines the following OAuth 2.0 scopes for agent authorisation:

| Scope | Description | Risk Level |
|-------|-------------|------------|
| `sep:discover` | Browse public offerings and capabilities | Low |
| `sep:receive_proposals` | Receive chain proposals | Low |
| `sep:propose` | Create and send chain proposals | Medium |
| `sep:confirm` | Confirm chain participation | High |
| `sep:execute` | Signal execution start/completion | High |
| `sep:dispute` | Raise and respond to disputes | High |
| `sep:admin` | Manage participant settings and agents | Critical |

#### 3.2.1 Scope Requirements by Message Type

| Message Type | Required Scopes |
|--------------|-----------------|
| Browse offerings | `sep:discover` |
| Receive `ChainProposal` | `sep:receive_proposals` |
| Send `ChainProposal` | `sep:propose` |
| Send `ParticipantConfirmation` | `sep:confirm` |
| Send `ExecutionStart` | `sep:execute` |
| Send `ExecutionCompletion` | `sep:execute` |
| Send `SatisfactionSignal` | `sep:execute` |
| Send `DisputeRaised` | `sep:dispute` |

### 3.3 Delegation Limits

Participants MUST define operational limits when delegating authority to agents. These limits are embedded in the access token and enforced by receiving parties.

#### 3.3.1 Required Limits

| Limit | Description | Trust Tier Defaults |
|-------|-------------|---------------------|
| `max_chain_size` | Maximum participants in a chain | Probationary: 3, Established: 6, Anchor: unlimited |
| `max_execution_window_days` | Maximum execution period | Probationary: 30, Established: 90, Anchor: 365 |
| `excluded_sectors` | Industries the agent cannot engage with | Participant-defined |

#### 3.3.2 Optional Limits

| Limit | Description | Default |
|-------|-------------|---------|
| `max_concurrent_chains` | Active chains at once | 5 |
| `geographic_restrictions` | Allowed regions | None |
| `counterparty_whitelist` | Only engage with listed participants | None |
| `counterparty_blacklist` | Never engage with listed participants | None |
| `require_human_approval` | Chain size threshold requiring human review | 4 |

**Example Delegation Limits:**

```json
{
  "max_chain_size": 4,
  "max_execution_window_days": 60,
  "max_concurrent_chains": 3,
  "excluded_sectors": ["gambling", "weapons"],
  "geographic_restrictions": ["UK", "EU"],
  "require_human_approval": 3
}
```

### 3.4 Human Approval Checkpoints

For high-stakes operations, agents MUST request explicit human approval:

#### 3.4.1 Mandatory Approval Points

- First chain participation for a new agent
- Chains exceeding `require_human_approval` participant count
- Chains involving new counterparties (no prior history)
- Counter-proposals that modify timing by more than 50%
- Any dispute escalation

#### 3.4.2 Approval Request Format

Agents SHOULD present approval requests with:

```json
{
  "approval_type": "chain_confirmation",
  "chain_summary": {
    "chain_id": "chain-789",
    "participant_count": 4,
    "you_provide": "Design services to Marketing Agency",
    "you_receive": "Legal consultation from Law Firm",
    "execution_window": "2026-03-01 to 2026-04-15",
    "new_counterparties": ["Marketing Agency"]
  },
  "risk_assessment": {
    "counterparty_trust": "established",
    "chain_complexity": "moderate",
    "recommendation": "approve"
  },
  "expires_at": "2026-02-10T18:00:00Z"
}
```

---

## 4. A2A Integration

SEP agents SHOULD expose A2A-compatible interfaces to enable discovery and interaction with the broader agentic ecosystem.

### 4.1 Agent Card Generation from Offerings

SEP capability offerings MUST be translatable to A2A Agent Cards for external discovery.

#### 4.1.1 Mapping Rules

| SEP Field | A2A Agent Card Field | Transformation |
|-----------|---------------------|----------------|
| `provider` | `provider.organisation` | Direct mapping |
| `title` | `name` | Direct mapping |
| `description` | `description` | Direct mapping |
| `service_details.capability_mapping` | `capabilities[]` | One capability per mapping entry |
| `constraints` | `capabilities[].constraints` | Nested object |
| `track_record` | `capabilities[].metrics` | Nested object |

#### 4.1.2 Agent Card Template

SEP participants MUST publish an Agent Card at `/.well-known/agent.json`:

```json
{
  "name": "Design Services - Acme Corp",
  "description": "Surplus graphic design capacity available through SEP exchange",
  "url": "https://sep-agent.acme.com/api",
  "provider": {
    "organisation": "Acme Corp",
    "contact": "sep-agent@acme.com"
  },
  "version": "1.0.0",
  "capabilities": [
    {
      "id": "brand-identity-design",
      "name": "Brand Identity Design",
      "description": "Complete brand identity including logo, colour palette, and typography guidelines. Requires brand brief and 2-week lead time.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "brief": {
            "type": "string",
            "description": "Brand brief describing company, values, target audience"
          },
          "preferences": {
            "type": "object",
            "properties": {
              "style_direction": {
                "type": "string",
                "enum": ["modern", "classic", "playful", "minimal"]
              },
              "colour_preferences": {
                "type": "array",
                "items": { "type": "string" }
              }
            }
          }
        },
        "required": ["brief"]
      },
      "outputSchema": {
        "type": "object",
        "properties": {
          "deliverables": {
            "type": "array",
            "items": { "type": "string" }
          },
          "delivery_format": { "type": "string" }
        }
      },
      "sep:exchange_type": "surplus",
      "sep:typical_effort": "15-20 hours",
      "sep:availability": {
        "capacity": "20 hours remaining",
        "valid_until": "2026-03-31"
      },
      "sep:constraints": {
        "geographic": ["UK", "EU"],
        "excluded_sectors": ["gambling"]
      }
    }
  ],
  "authentication": {
    "schemes": ["oauth2"],
    "oauth2": {
      "authorizationUrl": "https://idp.sep-network.org/oauth/authorize",
      "tokenUrl": "https://idp.sep-network.org/oauth/token",
      "scopes": {
        "sep:discover": "Browse offerings",
        "sep:propose": "Create chain proposals",
        "sep:confirm": "Confirm participation"
      }
    }
  },
  "protocols": ["sep/1.0", "a2a/1.0"]
}
```

### 4.2 Task Mapping

A2A tasks can trigger SEP chain participation through a defined mapping.

#### 4.2.1 A2A Task to SEP Message Mapping

| A2A Task Action | SEP Message | Notes |
|-----------------|-------------|-------|
| Task Creation | `ChainProposal` or discovery query | Depends on whether chain is pre-identified |
| Task Acceptance | `ParticipantConfirmation` (confirm) | Subject to delegation limits |
| Task Rejection | `ParticipantConfirmation` (decline) | Include reason |
| Task In Progress | `ExecutionStart` | When provider begins work |
| Task Completed | `ExecutionCompletion` | With delivery evidence |
| Task Failed | Part of `ChainFailure` | Triggers compensation |

#### 4.2.2 A2A Task Context Extension

SEP-related A2A tasks SHOULD include SEP context:

```json
{
  "taskId": "task-a2a-123",
  "capability": "brand-identity-design",
  "parameters": {
    "brief": "B2B SaaS company focused on sustainability..."
  },
  "context": {
    "conversationId": "conv-456",
    "requester": "agent:procurement@external-corp",
    "priority": "normal",
    "sep": {
      "chain_id": "chain-sep-789",
      "edge_id": "edge-001",
      "exchange_type": "surplus",
      "reciprocal_offering_required": true
    }
  }
}
```

### 4.3 Discovery Patterns

#### 4.3.1 Direct Discovery

External agents can discover SEP participants by:

1. Querying the SEP registry for Agent Card URLs
2. Fetching Agent Cards from `/.well-known/agent.json`
3. Filtering capabilities by `sep:exchange_type: "surplus"`

#### 4.3.2 Registry-Based Discovery

SEP SHOULD operate a registry service that indexes participating Agent Cards:

```
GET /api/v1/agents?capability=brand-identity&exchange_type=surplus&region=UK
```

**Response:**

```json
{
  "agents": [
    {
      "url": "https://sep-agent.acme.com/api",
      "name": "Design Services - Acme Corp",
      "matching_capabilities": ["brand-identity-design"],
      "trust_tier": "established",
      "availability": "20 hours"
    }
  ],
  "total": 1,
  "page": 1
}
```

#### 4.3.3 Referral Discovery

Agents MAY recommend other SEP participants:

```json
{
  "referral_type": "capability_match",
  "referring_agent": "agent:matching-broker@sep-network",
  "referred_agent": "agent:design@acme-corp",
  "capability": "brand-identity-design",
  "reason": "High satisfaction rating, available capacity matches your timeline"
}
```

---

## 5. MCP Compatibility

SEP capabilities SHOULD be expressible as MCP tool definitions to enable AI assistants to discover and propose SEP participations.

### 5.1 Tool Definitions from Capabilities

Each SEP capability offering can be exposed as an MCP tool.

#### 5.1.1 Mapping Rules

| SEP Field | MCP Tool Field | Transformation |
|-----------|----------------|----------------|
| `id` | `name` | Prefixed with `sep_request_` |
| `description` | `description` | Extended with SEP context |
| `service_details.capability_mapping[].requirements` | `inputSchema.properties` | JSON Schema properties |
| `service_details.capability_mapping[].deliverables` | Output description | Natural language |

#### 5.1.2 Tool Definition Template

```json
{
  "name": "sep_request_brand_identity_design",
  "description": "Request brand identity design services through SEP surplus exchange. This does NOT require monetary payment - you participate by offering your own surplus capacity in return (directly or through a multi-party chain). Requires brand brief. Typical delivery: 2-3 weeks.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "brief": {
        "type": "string",
        "description": "Brand brief describing company, values, and target audience"
      },
      "style_direction": {
        "type": "string",
        "enum": ["modern", "classic", "playful", "minimal"],
        "description": "Preferred style direction"
      },
      "timeline_preference": {
        "type": "string",
        "description": "Preferred delivery timeline (e.g., '2 weeks', 'flexible')"
      },
      "your_offering": {
        "type": "string",
        "description": "What surplus capacity you can offer in exchange (for chain matching)"
      }
    },
    "required": ["brief", "your_offering"]
  }
}
```

### 5.2 Resource Exposure

SEP offerings and chain status can be exposed as MCP resources.

#### 5.2.1 Resource URIs

| Resource | URI Pattern | Description |
|----------|-------------|-------------|
| Offering | `sep://offering/{offering_id}` | Capability offering details |
| Chain | `sep://chain/{chain_id}` | Chain status and edges |
| Participant | `sep://participant/{participant_id}` | Participant profile |
| Need | `sep://need/{need_id}` | Active need details |

#### 5.2.2 Resource Access

```json
{
  "resources": [
    {
      "uri": "sep://offering/{id}",
      "description": "Access details of a specific surplus offering",
      "mimeType": "application/json",
      "read": true,
      "write": false
    },
    {
      "uri": "sep://chain/{id}",
      "description": "Access status of an exchange chain",
      "mimeType": "application/json",
      "read": true,
      "write": false
    }
  ]
}
```

### 5.3 MCP Server Manifest

SEP participants MAY expose an MCP-compatible server manifest:

```json
{
  "name": "sep-participant-acme",
  "version": "1.0.0",
  "description": "Acme Corp SEP surplus exchange interface",
  "tools": [
    {
      "name": "sep_browse_offerings",
      "description": "Browse available surplus offerings in the SEP network"
    },
    {
      "name": "sep_request_brand_identity_design",
      "description": "Request brand identity design through surplus exchange"
    },
    {
      "name": "sep_check_chain_status",
      "description": "Check the status of an active exchange chain"
    },
    {
      "name": "sep_register_offering",
      "description": "Register new surplus capacity offering"
    }
  ],
  "resources": [
    { "uri": "sep://offering/{id}", "description": "Offering details" },
    { "uri": "sep://chain/{id}", "description": "Chain status" }
  ],
  "prompts": [
    {
      "name": "propose_exchange",
      "description": "Help draft a surplus exchange proposal"
    }
  ]
}
```

---

## 6. Hybrid Chain Design

Hybrid chains contain edges that settle through different mechanisms - some via SEP surplus exchange, others via monetary payment.

### 6.1 Edge Types

| Edge Type | Settlement | Protocol | Use Case |
|-----------|------------|----------|----------|
| `surplus` | SEP exchange | SEP | Core surplus-to-surplus exchange |
| `monetary` | Currency payment | Agent Payment / UCP | When surplus match unavailable |
| `external` | Out-of-band | Custom | Legacy integrations |

### 6.2 Hybrid Chain Structure

```json
{
  "chain_id": "hybrid-chain-001",
  "edges": [
    {
      "edge_id": "edge-001",
      "edge_type": "surplus",
      "provider_id": "law-firm",
      "recipient_id": "restaurant",
      "offering_id": "contract-review",
      "settlement": {
        "protocol": "sep/1.0"
      }
    },
    {
      "edge_id": "edge-002",
      "edge_type": "surplus",
      "provider_id": "restaurant",
      "recipient_id": "marketing-agency",
      "offering_id": "catering-services",
      "settlement": {
        "protocol": "sep/1.0"
      }
    },
    {
      "edge_id": "edge-003",
      "edge_type": "monetary",
      "provider_id": "saas-vendor",
      "recipient_id": "marketing-agency",
      "offering_id": "software-licence",
      "settlement": {
        "protocol": "agent-payment/1.0",
        "amount": {
          "value": "299.00",
          "currency": "GBP"
        },
        "payment_reference": "pay-ext-456"
      }
    },
    {
      "edge_id": "edge-004",
      "edge_type": "surplus",
      "provider_id": "saas-vendor",
      "recipient_id": "law-firm",
      "offering_id": "unused-licences",
      "settlement": {
        "protocol": "sep/1.0"
      }
    }
  ]
}
```

### 6.3 Monetary Edge Handling

#### 6.3.1 Payment Integration

Monetary edges MUST integrate with an external payment protocol. SEP coordinates but does not handle funds.

**Payment flow:**

1. SEP chain reaches monetary edge during execution
2. SEP agent requests payment authorisation via Agent Payment Protocol
3. Payment executed outside SEP
4. Payment confirmation triggers SEP `ExecutionCompletion` for the edge
5. Chain continues to next edge

#### 6.3.2 Payment Confirmation Message Extension

```json
{
  "message_type": "ExecutionCompletion",
  "chain_id": "hybrid-chain-001",
  "edge_id": "edge-003",
  "completed_at": "2026-02-15T14:30:00Z",
  "delivery_evidence": {
    "evidence_type": "confirmation",
    "description": "Payment completed via Agent Payment Protocol"
  },
  "monetary_settlement": {
    "protocol": "agent-payment/1.0",
    "payment_id": "pay-ext-456",
    "amount": {
      "value": "299.00",
      "currency": "GBP"
    },
    "status": "completed",
    "completed_at": "2026-02-15T14:28:00Z"
  }
}
```

### 6.4 Hybrid Chain Failure Handling

Hybrid chains introduce additional failure modes.

#### 6.4.1 Failure Scenarios

| Scenario | Detection | Compensation Strategy |
|----------|-----------|----------------------|
| Payment fails before surplus edges execute | Payment rejection | Cancel entire chain |
| Payment succeeds but surplus edge fails | SEP monitoring | Surplus edges compensate; payment stands |
| Surplus edge fails before payment | SEP monitoring | Cancel chain including payment auth |

#### 6.4.2 Atomicity Considerations

SEP CANNOT guarantee atomicity across protocols. Implementations SHOULD:

- Execute monetary edges AFTER dependent surplus edges confirm (reduces exposure)
- Use payment pre-authorisation (reserve funds without capture)
- Implement compensation rather than rollback for cross-protocol edges
- Clearly communicate hybrid chain risks to participants

### 6.5 Hybrid Chain Visibility

Participants MUST be informed when a chain includes monetary edges:

```json
{
  "message_type": "ChainProposal",
  "chain_id": "hybrid-chain-001",
  "metadata": {
    "includes_monetary_edges": true,
    "monetary_edge_count": 1,
    "total_monetary_value": {
      "value": "299.00",
      "currency": "GBP"
    },
    "monetary_edges_involve_you": false
  }
}
```

---

## 7. Protocol Bridges

Protocol bridges enable SEP to interact with external agentic ecosystems.

### 7.1 Bridge Architecture

```
┌────────────────────┐     ┌──────────────────┐     ┌────────────────────┐
│   External Agent   │────▶│   SEP Bridge     │────▶│    SEP Network     │
│   (A2A / MCP)      │◀────│                  │◀────│                    │
└────────────────────┘     └──────────────────┘     └────────────────────┘
                                    │
                                    ▼
                           ┌──────────────────┐
                           │  Payment Bridge  │
                           │  (Agent Payment) │
                           └──────────────────┘
```

### 7.2 A2A Bridge

The A2A bridge translates between A2A task operations and SEP protocol messages.

#### 7.2.1 Inbound Translation (A2A to SEP)

| A2A Operation | SEP Translation |
|---------------|-----------------|
| Agent Card discovery | Return SEP-enhanced Agent Card |
| Task creation (with `sep:` context) | Create matching query or `ChainProposal` |
| Task status query | Query chain/edge status |
| Task cancellation | `ParticipantConfirmation` (decline) or compensation |

#### 7.2.2 Outbound Translation (SEP to A2A)

| SEP Event | A2A Translation |
|-----------|-----------------|
| `ChainProposal` | Task creation to external agent |
| `ChainCommitment` | Task acceptance confirmation |
| `ExecutionCompletion` | Task completion notification |
| `ChainFailure` | Task failure notification |

#### 7.2.3 Bridge Authentication

The A2A bridge MUST:

- Authenticate external agents via A2A's authentication mechanisms
- Map external agent identity to SEP participant context
- Enforce SEP authorisation scopes on bridge operations
- Log all cross-protocol interactions

### 7.3 MCP Bridge

The MCP bridge exposes SEP functionality as MCP tools for AI assistants.

#### 7.3.1 Bridge Capabilities

| MCP Tool | SEP Operation |
|----------|---------------|
| `sep_discover_offerings` | Query offering registry |
| `sep_request_capability` | Initiate matching for a need |
| `sep_view_proposals` | List pending `ChainProposal` messages |
| `sep_respond_to_proposal` | Create `ParticipantConfirmation` |
| `sep_check_status` | Query chain execution status |

#### 7.3.2 Assistant Integration Pattern

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  User       │────▶│  AI         │────▶│  MCP        │────▶│  SEP        │
│             │◀────│  Assistant  │◀────│  Bridge     │◀────│  Network    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

1. User asks assistant: "Can we get design help without spending budget?"
2. Assistant queries MCP bridge: `sep_discover_offerings(category: "design")`
3. Bridge returns available surplus offerings
4. Assistant presents options to user
5. User selects; assistant calls `sep_request_capability()`
6. Bridge creates need and initiates matching
7. Matching broker proposes chain
8. Assistant presents proposal to user for approval

### 7.4 Payment Bridge

The payment bridge coordinates monetary edges in hybrid chains.

#### 7.4.1 Supported Payment Protocols

| Protocol | Status | Use Case |
|----------|--------|----------|
| Agent Payment Protocol | Recommended | AI-initiated payments |
| Open Banking (PSD2) | Supported | EU bank transfers |
| Card payments (PCI-DSS) | Via processor | Card-based settlement |

#### 7.4.2 Payment Bridge Operations

| Operation | Description |
|-----------|-------------|
| `authorize` | Pre-authorise payment for monetary edge |
| `capture` | Complete payment after dependent edges execute |
| `void` | Cancel pre-authorisation (chain cancelled) |
| `refund` | Reverse completed payment (compensation) |
| `status` | Query payment status |

#### 7.4.3 Payment Security Requirements

Payment bridges MUST:

- Comply with PCI-DSS for card data handling
- Implement Strong Customer Authentication (SCA) for EU transactions
- Store only payment references, never full payment credentials
- Support payment tokenisation
- Maintain audit trails for regulatory compliance

---

## 8. Security Considerations

### 8.1 Threat Model

| Threat | Impact | Likelihood | Mitigation |
|--------|--------|------------|------------|
| **Agent impersonation** | High | Medium | OAuth 2.0 + JWT verification |
| **Token theft** | High | Medium | Short expiry, secure storage, rotation |
| **Man-in-the-middle** | High | Low | TLS 1.3, certificate verification |
| **Replay attacks** | Medium | Medium | Nonces, timestamps, idempotency |
| **Malicious chain proposals** | Medium | Medium | Human approval checkpoints |
| **Data exfiltration** | Medium | Low | Minimal disclosure, access logs |
| **Denial of service** | Low | Medium | Rate limiting, reputation filtering |
| **Collusion** | High | Low | Multi-party verification, network analysis |

### 8.2 Token Security

#### 8.2.1 Storage Requirements

Tokens MUST be stored securely:

- **Server-side agents**: Encrypted at rest, memory-only where possible
- **Client-side**: Secure storage APIs (Keychain, Credential Manager)
- **Never**: Plain text, version control, logs, URLs

#### 8.2.2 Token Validation

Recipients of SEP messages MUST validate tokens by:

1. Verifying JWT signature against IdP public key
2. Checking `exp` claim has not passed
3. Verifying `iss` is a trusted IdP
4. Confirming `aud` includes the recipient
5. Checking `sep:scopes` includes required scope for the operation
6. Validating `sep:delegation_limits` permit the operation

### 8.3 Message Signature Verification

#### 8.3.1 Signing Requirements

All SEP protocol messages SHOULD include a cryptographic signature:

```json
{
  "message_id": "msg-123",
  "message_type": "ParticipantConfirmation",
  "timestamp": "2026-02-05T10:30:00Z",
  "sender_id": "agent:design@acme-corp",
  "signature": "ed25519:base64encodedSignature..."
}
```

#### 8.3.2 Signature Algorithm

SEP implementations SHOULD use Ed25519 signatures:

1. Compute signature over canonical message JSON (sorted keys, no whitespace)
2. Exclude the `signature` field itself from the signed payload
3. Sign with the agent's private key
4. Encode signature as `algorithm:base64(signature)`

#### 8.3.3 Verification Process

Message recipients MUST:

1. Extract `signature` field
2. Reconstruct canonical message JSON
3. Retrieve sender's public key (from IdP or registry)
4. Verify signature matches message content
5. Reject messages with invalid signatures

### 8.4 Audit Logging

#### 8.4.1 Required Log Events

Implementations MUST log:

| Event | Data Captured |
|-------|---------------|
| Authentication attempt | Agent ID, timestamp, success/failure, IP |
| Token issuance | Agent ID, scopes, expiry, delegation limits |
| Token revocation | Agent ID, reason, revoking party |
| Message sent | Message ID, type, sender, recipients |
| Message received | Message ID, type, sender, validation result |
| Authorisation decision | Operation, agent, scopes, limits, result |
| Human approval | Chain ID, approver, decision, timestamp |

#### 8.4.2 Log Retention

- Security logs: Minimum 2 years
- Transaction logs: Minimum 7 years (regulatory compliance)
- Audit logs: Immutable storage recommended

### 8.5 Rate Limiting

To prevent abuse, implementations SHOULD enforce rate limits:

| Operation | Limit | Window |
|-----------|-------|--------|
| Authentication attempts | 10 | 1 minute |
| Discovery queries | 100 | 1 minute |
| Chain proposals sent | 20 | 1 hour |
| Messages per chain | 100 | 1 day |

Limits SHOULD scale with trust tier:
- Probationary: Base limits
- Established: 2x base limits
- Anchor: 5x base limits

### 8.6 Incident Response

#### 8.6.1 Security Incident Types

| Type | Severity | Response |
|------|----------|----------|
| Token compromise | Critical | Immediate revocation, participant notification |
| Agent compromise | Critical | Revoke all tokens, suspend agent, notify counterparties |
| Protocol vulnerability | High | Coordinated disclosure, patch deployment |
| Data breach | Critical | Regulatory notification, participant notification |

#### 8.6.2 Response Procedures

1. **Detection**: Automated anomaly detection + manual reporting
2. **Containment**: Revoke affected credentials, isolate compromised components
3. **Assessment**: Determine scope and impact
4. **Notification**: Inform affected parties within 72 hours
5. **Remediation**: Patch vulnerabilities, rotate credentials
6. **Review**: Post-incident analysis and documentation

---

## 9. Implementation Checklist

### 9.1 Minimum Viable Security

Implementations MUST support:

- [ ] OAuth 2.0 Client Credentials flow
- [ ] JWT access token validation
- [ ] TLS 1.3 transport security
- [ ] Scope-based authorisation
- [ ] Delegation limits enforcement
- [ ] Audit logging of security events

### 9.2 Recommended Security

Implementations SHOULD support:

- [ ] Message signing (Ed25519)
- [ ] Human approval checkpoints
- [ ] Rate limiting
- [ ] Token rotation
- [ ] A2A Agent Card publication

### 9.3 Enhanced Security

Implementations MAY support:

- [ ] Certificate pinning
- [ ] Hardware security modules (HSM) for key storage
- [ ] Multi-factor authentication for human approvals
- [ ] Real-time anomaly detection

---

## 10. References

### Standards

- [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) - Key words for use in RFCs
- [RFC 6749](https://www.rfc-editor.org/rfc/rfc6749) - OAuth 2.0 Authorization Framework
- [RFC 7519](https://www.rfc-editor.org/rfc/rfc7519) - JSON Web Token (JWT)
- [RFC 7636](https://www.rfc-editor.org/rfc/rfc7636) - Proof Key for Code Exchange (PKCE)
- [RFC 8725](https://www.rfc-editor.org/rfc/rfc8725) - JWT Best Current Practices

### Related SEP Documents

- [Protocol Messages Schema](/schemas/protocol-messages.schema.json)
- [Capability Offering Schema](/schemas/capability-offering.schema.json)
- [Agentic Protocols Analysis](/docs/research/agentic-protocols-analysis.md)
- [Comparative Analysis](/docs/research/comparative-analysis.md)

### External Protocols

- Google A2A Protocol Specification (2025)
- Anthropic Model Context Protocol Documentation
- Google Agent Payment Protocol Technical Specification

---

## Appendix A: Token Claim Reference

| Claim | Type | Required | Description |
|-------|------|----------|-------------|
| `iss` | string | Yes | Token issuer URL |
| `sub` | string | Yes | Agent identifier |
| `aud` | string/array | Yes | Intended audience(s) |
| `exp` | number | Yes | Expiration timestamp |
| `iat` | number | Yes | Issued at timestamp |
| `jti` | string | Yes | Unique token identifier |
| `sep:participant` | string | Yes | Delegating participant ID |
| `sep:trust_tier` | string | Yes | Trust tier (probationary/established/anchor) |
| `sep:scopes` | array | Yes | Granted SEP scopes |
| `sep:delegation_limits` | object | No | Operational constraints |

## Appendix B: Scope Reference

| Scope | Operations Permitted |
|-------|---------------------|
| `sep:discover` | Browse offerings, query registry |
| `sep:receive_proposals` | Receive ChainProposal messages |
| `sep:propose` | Send ChainProposal messages |
| `sep:confirm` | Send ParticipantConfirmation messages |
| `sep:execute` | Send ExecutionStart, ExecutionCompletion, SatisfactionSignal |
| `sep:dispute` | Send DisputeRaised, respond to disputes |
| `sep:admin` | Manage participant settings, register/revoke agents |

## Appendix C: Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `auth_invalid_token` | Token validation failed | 401 |
| `auth_expired_token` | Token has expired | 401 |
| `auth_insufficient_scope` | Token lacks required scope | 403 |
| `auth_delegation_exceeded` | Operation exceeds delegation limits | 403 |
| `auth_trust_insufficient` | Trust tier insufficient for operation | 403 |
| `auth_signature_invalid` | Message signature verification failed | 400 |
| `rate_limit_exceeded` | Rate limit exceeded | 429 |
