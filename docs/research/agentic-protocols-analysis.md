# Agentic Protocols Analysis

**Status**: Complete
**Last Updated**: 2026-02-05
**Researcher**: execution-researcher subagent

## Executive Summary

This document analyses emerging agentic protocols that enable AI agents to discover, negotiate, and transact with each other. Understanding these protocols is critical for SEP because:

1. **Interoperability**: SEP agents may need to bridge to/from these ecosystems
2. **Design patterns**: These protocols solve similar problems (discovery, trust, coordination)
3. **Market positioning**: SEP differentiates by being non-monetary in a monetary landscape
4. **Technical learning**: Capability description and security patterns are directly applicable

**Key findings:**
1. **A2A Protocol** provides the most relevant patterns for SEP's agent-to-agent negotiation
2. **MCP** offers excellent capability description patterns that SEP should adopt
3. **Google's UCP and Agent Payment Protocol** show the direction of commercial agent ecosystems
4. **SEP's non-monetary nature is a significant differentiator** requiring unique trust and execution mechanisms
5. **Protocol bridges** will be essential for SEP to participate in mixed-mode transactions


## Protocols Analysed

### Google A2A Protocol (Agent-to-Agent)

**Overview:**
Google's A2A Protocol (announced 2025) provides a standardised way for AI agents to discover each other's capabilities, communicate securely, and coordinate on tasks. It's designed for enterprise agent ecosystems where multiple AI assistants need to collaborate.

**Current Status:**
- Open specification with reference implementations
- Adopted by enterprise AI platforms (Salesforce AgentForce, SAP Joule, ServiceNow)
- Active development with quarterly specification updates
- Growing ecosystem of compliant agents

#### Capability Discovery

**Agent Cards:**
A2A uses "Agent Cards" as machine-readable capability descriptions, published at a well-known URL (typically `/.well-known/agent.json`).

```json
{
  "name": "Procurement Assistant",
  "description": "Handles purchase requisitions and vendor management",
  "url": "https://procurement.example.com/agent",
  "provider": {
    "organisation": "Example Corp",
    "contact": "agents@example.com"
  },
  "version": "1.2.0",
  "capabilities": [
    {
      "id": "create-requisition",
      "name": "Create Purchase Requisition",
      "description": "Creates a new purchase requisition for approval",
      "inputSchema": { /* JSON Schema */ },
      "outputSchema": { /* JSON Schema */ }
    },
    {
      "id": "check-budget",
      "name": "Check Budget Availability",
      "description": "Verifies budget for a cost centre",
      "inputSchema": { /* JSON Schema */ },
      "outputSchema": { /* JSON Schema */ }
    }
  ],
  "authentication": {
    "schemes": ["oauth2", "api_key"],
    "oauth2": {
      "authorizationUrl": "https://auth.example.com/oauth/authorize",
      "tokenUrl": "https://auth.example.com/oauth/token",
      "scopes": {
        "procurement:read": "Read procurement data",
        "procurement:write": "Create/modify requisitions"
      }
    }
  },
  "protocols": ["a2a/1.0", "mcp/1.0"]
}
```

**Discovery mechanisms:**
1. **Direct URL**: Agent knows the target agent's URL
2. **Registry lookup**: Query a registry service for agents with specific capabilities
3. **Referral**: One agent recommends another
4. **Enterprise directory**: Integrated with corporate identity systems

#### Task Coordination

**Task lifecycle:**
1. **Task creation**: Requesting agent creates task with capability reference and parameters
2. **Task acceptance**: Receiving agent accepts or rejects based on capacity/permissions
3. **Execution**: Agent performs the task, may create subtasks
4. **Status updates**: Progress reported via streaming or polling
5. **Completion**: Results returned, task marked complete

**Task message format:**
```json
{
  "taskId": "task-123",
  "capability": "create-requisition",
  "parameters": {
    "vendor": "Acme Corp",
    "items": [...],
    "costCentre": "CC-5500"
  },
  "context": {
    "conversationId": "conv-456",
    "requester": "agent:user-assistant@example.com",
    "priority": "normal"
  },
  "constraints": {
    "timeout": "PT1H",
    "budget": null
  }
}
```

**Multi-agent coordination:**
- **Sequential**: Task A completes, then Task B starts
- **Parallel**: Tasks A and B execute simultaneously
- **Conditional**: Task B only if Task A succeeds
- **Workflow**: Complex DAG of task dependencies

#### Security Model

**Authentication:**
- OAuth 2.0 is the primary authentication mechanism
- Client credentials flow for agent-to-agent
- Delegation tokens for acting on behalf of users
- API keys for simpler integrations

**Authorisation:**
- Scope-based permissions (OAuth scopes)
- Fine-grained capability access control
- Organisation-level trust policies
- Audit logging of all inter-agent communications

**Trust verification:**
- Agent identity verified via OAuth provider
- Organisation verification through enterprise directory
- Certificate-based verification for high-security contexts
- Reputation metrics (optional, ecosystem-dependent)

#### SEP Relevance

**Similarities:**
- Agent Card concept is very similar to SEP capability offerings
- Task coordination maps to SEP chain execution
- Multi-agent workflows are analogous to multi-party chains
- Discovery mechanisms are applicable

**Differences:**
- A2A is for task delegation, not value exchange
- No concept of reciprocity or closed loops
- Monetary billing handled externally (not part of protocol)
- Assumes enterprise trust context

**Integration opportunity:**
- SEP agents could expose A2A-compatible endpoints
- A2A tasks could trigger SEP chain participation
- SEP could use A2A for auxiliary services (translation, logistics)
- Agent Cards could include SEP capability offerings as a protocol extension


### MCP (Model Context Protocol)

**Overview:**
Model Context Protocol (MCP), developed by Anthropic, provides a standardised way to connect AI models to external tools, data sources, and services. It's focused on tool use and context management rather than agent-to-agent communication.

**Current Status:**
- Open specification with growing adoption
- Implemented in Claude, various IDEs, and developer tools
- Focus on developer experience and tool integration
- Rapidly evolving specification

#### Capability Description

**Tool definitions:**
MCP describes tools (capabilities) using JSON Schema with rich semantic annotations:

```json
{
  "name": "search_database",
  "description": "Search the customer database for matching records. Use when the user asks about customer information, orders, or account details.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Search query - can be customer name, email, or order ID"
      },
      "filters": {
        "type": "object",
        "properties": {
          "dateRange": {
            "type": "object",
            "properties": {
              "start": { "type": "string", "format": "date" },
              "end": { "type": "string", "format": "date" }
            }
          },
          "status": {
            "type": "string",
            "enum": ["active", "inactive", "pending"]
          }
        }
      },
      "limit": {
        "type": "integer",
        "default": 10,
        "maximum": 100
      }
    },
    "required": ["query"]
  }
}
```

**Key patterns:**
- **Semantic descriptions**: Natural language descriptions guide model understanding
- **Structured schemas**: JSON Schema defines inputs/outputs precisely
- **Optional parameters**: Defaults and optional fields reduce friction
- **Enumerations**: Constrain values to valid options

#### Tool Discovery

**Server manifest:**
MCP servers advertise their capabilities through a manifest:

```json
{
  "name": "customer-data-service",
  "version": "1.0.0",
  "description": "Access customer data, orders, and account information",
  "tools": [
    { "name": "search_database", ... },
    { "name": "get_customer", ... },
    { "name": "list_orders", ... }
  ],
  "resources": [
    { "uri": "customer://{id}", "description": "Customer profile" },
    { "uri": "order://{id}", "description": "Order details" }
  ],
  "prompts": [
    { "name": "customer_summary", "description": "Generate a customer summary" }
  ]
}
```

**Resource access:**
- URI-based resource identification
- Read/write capabilities per resource
- Streaming support for large data
- Caching hints for performance

#### SEP Relevance

**Similarities:**
- Tool descriptions are analogous to SEP capability offerings
- Schema-driven approach matches SEP's need for structured matching
- Discovery mechanism provides patterns for SEP

**Differences:**
- MCP is model-to-tool, not agent-to-agent
- Single direction: model calls tool, not negotiation
- No concept of value exchange or reciprocity
- No multi-party coordination

**Learning for capability schema:**
- Adopt JSON Schema for capability inputs/outputs
- Use rich semantic descriptions for AI matching
- Support optional parameters with defaults
- Define enumerations for constrained values
- Consider resource-based access patterns

**SEP adaptation:**
- SEP capability offerings should have MCP-compatible descriptions
- This enables AI assistants to understand and propose SEP participations
- Tool definitions could wrap SEP participation APIs


### Google Agent Payment Protocol

**Overview:**
Google's Agent Payment Protocol (announced alongside UCP in early 2026) enables AI agents to conduct monetary transactions securely on behalf of users. It focuses on payment authorisation, fraud prevention, and audit trails.

**Current Status:**
- Integrated with Google Pay infrastructure
- Adopted by UCP-participating merchants
- Regulatory compliance (PCI-DSS, PSD2) built-in
- Limited to US and EU initially

#### Payment Flow

**Authorisation model:**
1. **Pre-authorisation**: User grants agent permission to spend up to a limit
2. **Transaction request**: Agent requests payment for specific amount
3. **Risk assessment**: Google evaluates fraud risk
4. **User confirmation** (if required): For high-risk or high-value transactions
5. **Payment execution**: Funds transferred
6. **Notification**: User notified of transaction

**Payment message:**
```json
{
  "paymentId": "pay-789",
  "amount": {
    "value": "49.99",
    "currency": "USD"
  },
  "merchant": {
    "id": "merchant-123",
    "name": "Example Store",
    "category": "retail"
  },
  "agent": {
    "id": "agent:shopping-assistant@google.com",
    "delegatedBy": "user:alice@example.com"
  },
  "description": "Purchase: Widget Pro X (order #12345)",
  "metadata": {
    "orderId": "12345",
    "items": [...]
  }
}
```

#### Security Model

**User delegation:**
- Explicit user consent required for agent payment capability
- Spending limits and category restrictions
- Time-limited authorisation
- Revocable at any time

**Agent verification:**
- Agent must be registered with Google
- Compliance with Agent Code of Conduct
- Technical security requirements
- Audit trail requirements

**Fraud prevention:**
- Behavioural analysis of agent transactions
- Anomaly detection
- Merchant verification
- Multi-factor authentication for high-risk transactions

#### SEP Relevance

**Similarities:**
- Both handle "transactions" between parties
- Authorisation patterns applicable to SEP commitment
- Audit trail concepts relevant

**Differences:**
- Agent Payment is monetary; SEP is surplus-based
- Agent Payment is two-party (user-merchant); SEP is multi-party
- Agent Payment has central authority (Google); SEP is decentralised
- Different trust model (financial vs reputation)

**Integration opportunity:**
- SEP could support hybrid chains where some edges settle monetarily
- Agent Payment could cover logistics costs in SEP chains
- SEP participants might use Agent Payment for fees/premiums


### Agentic Commerce Protocol

**Overview:**
The Agentic Commerce Protocol (emerging industry standard, multiple contributors) focuses on enabling AI agents to engage in commerce activities: product discovery, comparison, negotiation, and purchase.

**Current Status:**
- Consortium-driven specification
- Early adoption by e-commerce platforms
- Focus on consumer shopping scenarios
- Integrates with UCP and Agent Payment Protocol

#### Commerce Flow

**Discovery:**
- Structured product catalogues (Schema.org, GS1)
- Semantic search across merchants
- Price and availability queries
- Comparison across multiple sources

**Negotiation:**
- Price negotiation (within merchant policies)
- Bundle creation
- Availability reservation
- Conditional commitments

**Transaction:**
- Cart management
- Checkout process
- Payment integration
- Order tracking

#### Merchant Integration

**Merchant Agent Card extension:**
```json
{
  "commerce": {
    "catalogueEndpoint": "https://api.example.com/catalogue",
    "negotiationEnabled": true,
    "negotiationPolicies": {
      "maxDiscount": 0.15,
      "bundleDiscounts": true,
      "priceMatchEnabled": true
    },
    "paymentMethods": ["google_pay", "credit_card"],
    "shippingOptions": [...]
  }
}
```

**Inventory integration:**
- Real-time availability checks
- Reservation with timeout
- Backorder handling
- Allocation policies

#### SEP Relevance

**Similarities:**
- Negotiation patterns relevant to SEP matching
- Reservation concepts applicable
- Multi-step transaction flow similar

**Differences:**
- Monetary commerce; SEP is surplus exchange
- Consumer focus; SEP is B2B
- Single-direction flow; SEP requires chain closure

**Positioning:**
- SEP operates in a different value domain
- Could complement Agentic Commerce for B2B surplus
- Merchants might participate in both ecosystems


### Google Universal Commerce Protocol (UCP)

**Overview:**
Google's Universal Commerce Protocol (announced January 2026) is a comprehensive framework enabling AI agents to discover, evaluate, and purchase products from participating merchants. It standardises the end-to-end shopping experience for AI agents.

**Current Status:**
- Major retailers onboarded (Shopify, Etsy, Wayfair, Target, Walmart)
- Chrome and Google Assistant integration
- Active expansion to more merchants and categories
- Focus on trusted, verified merchants

#### Commerce Flow

**End-to-end shopping:**
1. **Intent recognition**: User expresses shopping need to AI assistant
2. **Product discovery**: Agent queries UCP for matching products
3. **Evaluation**: Agent compares options based on user preferences
4. **Selection**: Agent presents recommendations to user
5. **Purchase**: Agent completes transaction (with user confirmation)
6. **Fulfilment**: Tracking and delivery management
7. **Post-purchase**: Returns, reviews, support

**Product data format:**
```json
{
  "product": {
    "id": "prod-456",
    "name": "Ergonomic Office Chair",
    "description": "...",
    "brand": "OfficePro",
    "category": "Furniture > Office > Chairs",
    "price": {
      "value": "299.00",
      "currency": "USD",
      "validUntil": "2026-02-10T00:00:00Z"
    },
    "availability": {
      "status": "in_stock",
      "quantity": 42,
      "leadTime": "P2D"
    },
    "attributes": {
      "colour": "Black",
      "material": "Mesh",
      "adjustable": true
    },
    "reviews": {
      "averageRating": 4.5,
      "count": 1247
    }
  }
}
```

#### Merchant Integration

**UCP merchant requirements:**
- Structured product data (Schema.org + UCP extensions)
- Real-time inventory API
- Secure checkout API
- Fulfilment tracking API
- Customer service integration

**Trust and verification:**
- Merchant verification process
- Product data quality requirements
- Return policy compliance
- Customer protection standards

#### SEP Relevance

**Similarities:**
- Structured capability/product descriptions
- Discovery and matching mechanisms
- Transaction lifecycle management
- Trust verification requirements

**Differences:**
- **Key difference: UCP is monetary; SEP bypasses money entirely**
- UCP is consumer commerce; SEP is B2B surplus exchange
- UCP is one-direction (buy); SEP is circular (give and receive)
- UCP has Google as central coordinator; SEP is decentralised

**Positioning:**
- SEP and UCP serve different needs
- Some participants may be in both ecosystems
- SEP differentiates as "commerce without capital"

**Hybrid scenarios:**
- SEP chain participant might use UCP for component purchases
- SEP surplus could supplement UCP commerce (trade credits as payment option)
- Cross-ecosystem referrals for different value domains


## Cross-Protocol Comparison

### Capability Discovery

| Protocol | Approach | Strengths | Weaknesses |
|----------|----------|-----------|------------|
| A2A | Agent Cards at well-known URLs | Simple, decentralised | Requires knowing URL or registry |
| MCP | Server manifest via stdio/websocket | Rich tool descriptions | Connection-oriented, less discoverable |
| UCP | Merchant catalogues via API | Comprehensive product data | Merchant-centric, consumer focus |
| Agentic Commerce | Schema.org + extensions | Interoperable, SEO-friendly | Less structured for agents |

**SEP recommendation:** Adopt Agent Card pattern from A2A, with MCP-style rich descriptions for offerings.

### Transaction Coordination

| Protocol | Approach | Multi-party Support | Failure Handling |
|----------|----------|---------------------|------------------|
| A2A | Task-based with workflows | DAG-based task dependencies | Task retry, timeout, cancellation |
| MCP | Request-response tool calls | Single tool invocation | Error codes and messages |
| UCP | Shopping cart to checkout | Two-party (buyer-merchant) | Order cancellation, returns |
| Agent Payment | Payment authorisation flow | Two-party (payer-merchant) | Payment reversal, disputes |

**SEP recommendation:** Extend A2A task coordination for multi-party chains with saga-style compensation.

### Security Models

| Protocol | Authentication | Authorisation | Trust Model |
|----------|----------------|---------------|-------------|
| A2A | OAuth 2.0, API keys | Scope-based permissions | Enterprise identity |
| MCP | Server-specific | Capability grants | Local trust |
| UCP | OAuth 2.0, Google accounts | Merchant policies | Platform verification |
| Agent Payment | User delegation + agent verification | Spending limits, categories | Financial regulations |

**SEP recommendation:** Layered trust model combining identity (like A2A), delegation (like Agent Payment), and network reputation (SEP-specific).


## SEP Integration Opportunities

### Protocol Bridges

SEP agents should support bridging to these protocols:

**A2A Bridge:**
- SEP participant exposes A2A-compatible Agent Card
- A2A tasks can trigger SEP chain participation
- SEP completion notifications as A2A task updates

```
┌────────────────┐     ┌──────────────┐     ┌────────────────┐
│ External Agent │────►│  A2A Bridge  │────►│  SEP Network   │
│   (A2A)        │◄────│              │◄────│                │
└────────────────┘     └──────────────┘     └────────────────┘
```

**MCP Bridge:**
- SEP participant offers MCP tools for capability discovery
- AI assistants can browse and propose SEP participations
- Tool calls translate to SEP protocol messages

**UCP/Payment Bridge (Hybrid Chains):**
- Some chain edges settle monetarily (outside SEP)
- SEP orchestrator coordinates with payment protocols
- Clear separation: surplus edges vs monetary edges

### Capability Translation

SEP offerings should be expressible in multiple formats:

**SEP native format:**
```json
{
  "id": "offering-123",
  "type": "service",
  "provider": "participant-456",
  "category": "design",
  "subcategory": "graphic_design",
  "available_capacity": {
    "hours": 20,
    "valid_until": "2026-03-01"
  },
  "capability_mapping": [
    {
      "output": "Brand identity design",
      "typical_effort_hours": 15
    },
    {
      "output": "Marketing collateral",
      "typical_effort_hours": 8
    }
  ]
}
```

**A2A Agent Card format:**
```json
{
  "name": "Design Services",
  "capabilities": [
    {
      "id": "brand-identity",
      "name": "Brand Identity Design",
      "description": "Create complete brand identity including logo, colours, typography",
      "availability": {
        "capacity": "15 hours",
        "validUntil": "2026-03-01"
      },
      "exchangeType": "SEP_SURPLUS"
    }
  ]
}
```

**MCP tool format:**
```json
{
  "name": "request_design_service",
  "description": "Request graphic design services through SEP surplus exchange",
  "inputSchema": {
    "type": "object",
    "properties": {
      "project_type": {
        "type": "string",
        "enum": ["brand_identity", "marketing_collateral", "presentation"]
      },
      "brief": {
        "type": "string",
        "description": "Project brief and requirements"
      }
    }
  }
}
```

### Hybrid Scenarios

**Scenario 1: Mixed-mode chain**
```
Law Firm →(SEP: contract review)→ Restaurant
Restaurant →(SEP: catering)→ Marketing Agency
Marketing Agency →(UCP: software purchase)→ SaaS Vendor
SaaS Vendor →(SEP: unused licences)→ Law Firm
```
Some edges are SEP surplus exchanges; one edge is monetary (handled via UCP).

**Scenario 2: SEP with monetary settlement option**
```
Participant A offers design services via SEP
Participant B needs design but has nothing to offer
Option: B pays market rate (via Agent Payment), A receives credit towards future SEP participation
```

**Scenario 3: Agentic commerce with surplus fallback**
```
AI assistant searching for office supplies via UCP
Discovers SEP participant with surplus inventory
Offers to include in SEP chain instead of monetary purchase
```


## SEP Differentiation

### Key Differences from Agentic Commerce

| Aspect | Agentic Commerce | SEP |
|--------|------------------|-----|
| **Value exchange** | Monetary (fiat/crypto) | Surplus-based (no money) |
| **Transaction direction** | One-way (buy/sell) | Circular (multi-party chains) |
| **Matching** | Product search | Multi-party chain discovery |
| **Trust basis** | Platform verification, financial guarantees | Network reputation, graduated exposure |
| **Coordination** | Two-party | N-party chains |
| **Settlement** | Immediate (payment) | Deferred (execution over time) |
| **Value domain** | Market prices | Subjective value |
| **Focus** | Consumer commerce | B2B surplus utilisation |

### Unique SEP Value Proposition

**What SEP offers that agentic commerce protocols don't:**

1. **Capital-free exchange**: Participate without money
   - Unlock value from otherwise-wasted capacity
   - No need for capital allocation
   - Decoupled from monetary constraints

2. **Multi-party matching**: AI finds complex chains
   - Beyond two-party transactions
   - Discover matches humans couldn't find
   - Network effects in matching

3. **Subjective value preservation**: Each participant values on their own terms
   - No need to agree on price
   - Respects contextual value differences
   - Eliminates valuation disputes

4. **Surplus focus**: Lower stakes, higher participation
   - Not competing with core business
   - "Something is better than nothing" baseline
   - Encourages experimentation

5. **Network resilience**: No single point of failure
   - Decentralised protocol
   - No platform dependency
   - Participant-owned network effects


## Security Considerations

### Threat Model

| Threat | Relevance to SEP | Mitigation |
|--------|------------------|------------|
| **Identity spoofing** | Agent impersonates trusted participant | Strong agent identity verification (OAuth, certificates) |
| **Man-in-the-middle** | Interception of chain messages | TLS for all communications, message signing |
| **Replay attacks** | Resubmit old confirmations | Nonces, timestamps, idempotency keys |
| **Malicious agents** | Agent proposes harmful chains | Human approval for chain participation |
| **Data exfiltration** | Agent extracts sensitive capability data | Minimal disclosure, access controls |
| **Denial of service** | Flood network with invalid proposals | Rate limiting, reputation-based filtering |
| **Collusion** | Agents collude to exploit participants | Multi-party verification, network analysis |

### Authentication Patterns

**Recommended approach for SEP:**

1. **Agent identity**: OAuth 2.0 client credentials
   - Agents registered with identity provider
   - Short-lived access tokens
   - Scopes for SEP operations

2. **Participant delegation**: User authorises agent
   - Clear delegation scope and duration
   - Revocable authorisation
   - Audit trail of delegated actions

3. **Message authentication**: Signed messages
   - Digital signatures on protocol messages
   - Verifiable sender identity
   - Non-repudiation for commitments

4. **Network trust**: Layered verification
   - New participants: identity verification + probationary status
   - Established participants: trust score + history
   - Vouching: trusted participants can vouch for newcomers

### Authorisation Model

**Capability-based authorisation:**
- Agents have specific capabilities (discover, propose, confirm, execute)
- Participants grant capabilities to agents
- Fine-grained control over agent actions

**Operation permissions:**
| Operation | Required Capability | Notes |
|-----------|---------------------|-------|
| Browse offerings | `sep:discover` | Public by default |
| Receive proposals | `sep:receive_proposals` | Opt-in |
| Confirm chains | `sep:confirm` | Requires explicit grant |
| Execute exchanges | `sep:execute` | Requires explicit grant |
| Raise disputes | `sep:dispute` | Requires explicit grant |

**Delegation limits:**
- Maximum chain size agent can confirm
- Maximum execution window
- Sector/category restrictions
- Counterparty restrictions


## Recommendations

### Adopt from Agentic Protocols

| Pattern | Source | Adaptation for SEP |
|---------|--------|-------------------|
| **Agent Cards** | A2A | Capability offering discovery |
| **JSON Schema descriptions** | MCP | Rich semantic matching |
| **OAuth 2.0 authentication** | A2A, Agent Payment | Agent identity and delegation |
| **Task lifecycle** | A2A | Chain execution monitoring |
| **Reservation with timeout** | Agentic Commerce | Capacity commitment management |
| **Structured product data** | UCP | Offering description format |

### Differentiate from Agentic Protocols

| Aspect | Why Differentiate | SEP Approach |
|--------|-------------------|--------------|
| **Value exchange** | SEP's core innovation | Surplus-based, no monetary value |
| **Transaction shape** | Multi-party is unique value | Circular chains, not two-party |
| **Matching algorithm** | AI-powered multi-party discovery | Chain discovery as core capability |
| **Trust model** | Can't rely on financial guarantees | Network reputation + graduated exposure |
| **Coordination** | Long-running, human-approved | Saga pattern with human checkpoints |

### Integration Roadmap

**Phase 1: Foundation (Months 1-3)**
- Define SEP protocol messages compatible with A2A patterns
- Implement capability schema with MCP-style descriptions
- Establish OAuth 2.0 authentication for SEP agents
- Document SEP Agent Card format

**Phase 2: Discovery (Months 4-6)**
- Implement A2A-compatible Agent Card endpoints
- Build MCP tool wrappers for SEP participation
- Create registry for SEP agent discovery
- Test interoperability with A2A implementations

**Phase 3: Bridges (Months 7-9)**
- Build A2A bridge for external agent integration
- Implement hybrid chain support (SEP + monetary edges)
- Develop UCP integration for surplus-to-commerce scenarios
- Create Agent Payment integration for fee handling

**Phase 4: Ecosystem (Months 10-12)**
- Publish SEP protocol specification
- Release reference bridge implementations
- Engage with A2A/MCP communities
- Establish SEP protocol governance


## Open Questions

1. **Protocol versioning**: How do SEP agents handle protocol version mismatches with A2A/MCP?
2. **Privacy in discovery**: How much offering detail should be publicly discoverable vs require authentication?
3. **Cross-ecosystem trust**: Can A2A trust scores inform SEP trust, and vice versa?
4. **Hybrid chain atomicity**: How do we handle failure of monetary edge in a mixed chain?
5. **Agent marketplace**: Should there be a marketplace for SEP-compatible agents?


## References

- Google A2A Protocol Specification (2025)
- Anthropic Model Context Protocol Documentation
- Google Universal Commerce Protocol Whitepaper (January 2026)
- Agent Payment Protocol Technical Specification
- OAuth 2.0 Authorization Framework (RFC 6749)
- JSON Schema Specification (Draft 2020-12)
