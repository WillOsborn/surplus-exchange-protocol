# SEP Integration Patterns Prototype

**Status**: Draft
**Created**: 2026-02-05
**Informed by**: agentic-protocols-analysis.md, security-model.md, protocol-messages.json

## Overview

This document defines how SEP integrates with external agentic protocols (A2A, MCP) and supports hybrid exchange scenarios. The goal is interoperability without compromising SEP's non-monetary value proposition.

## Design Principles

1. **SEP-native first**: SEP capability schema is the source of truth; other formats are generated
2. **Minimal surface area**: Expose only what's needed for interoperability
3. **Clear boundaries**: Distinguish SEP exchanges from monetary transactions
4. **Progressive integration**: Start simple, add complexity as needed
5. **Human approval preserved**: External agents can propose, humans still approve

---

## A2A Integration

### SEP Agent Card

SEP participants expose an A2A-compatible Agent Card for discovery by external agents.

**Endpoint**: `/.well-known/agent.json`

```json
{
  "name": "Acme Design Services",
  "description": "Graphic design and brand identity services available for surplus exchange",
  "url": "https://acme-design.example.com/sep",
  "provider": {
    "organisation": "Acme Design Ltd",
    "contact": "sep@acme-design.example.com"
  },
  "version": "1.0.0",
  "protocols": ["sep/1.0", "a2a/1.0"],

  "capabilities": [
    {
      "id": "sep-offering-001",
      "name": "Brand Identity Design",
      "description": "Complete brand identity including logo, colour palette, typography guidelines. Available as surplus capacity through SEP exchange.",
      "type": "sep_offering",
      "inputSchema": {
        "type": "object",
        "properties": {
          "brief": {
            "type": "string",
            "description": "Project brief describing the brand vision and requirements"
          },
          "deliverables": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Specific deliverables requested"
          }
        },
        "required": ["brief"]
      },
      "outputSchema": {
        "type": "object",
        "properties": {
          "chain_id": { "type": "string" },
          "proposal_status": { "type": "string" }
        }
      },
      "sep_metadata": {
        "offering_type": "service",
        "available_capacity": "20 hours",
        "typical_effort": "12-16 hours",
        "constraints": {
          "geographic": ["UK", "EU"],
          "lead_time": "2 weeks"
        }
      }
    }
  ],

  "authentication": {
    "schemes": ["oauth2"],
    "oauth2": {
      "authorizationUrl": "https://auth.acme-design.example.com/oauth/authorize",
      "tokenUrl": "https://auth.acme-design.example.com/oauth/token",
      "scopes": {
        "sep:discover": "Browse available offerings",
        "sep:propose": "Propose chain participation"
      }
    }
  },

  "sep_profile": {
    "participant_id": "participant-acme-001",
    "trust_tier": "active",
    "network_metrics": {
      "exchanges_completed": 23,
      "satisfaction_rate": 0.96,
      "repeat_partner_rate": 0.35
    }
  }
}
```

### A2A Task Mapping

External A2A agents can trigger SEP participation through task requests.

**A2A Task Request → SEP Chain Interest**

```json
{
  "taskId": "a2a-task-789",
  "capability": "sep-offering-001",
  "parameters": {
    "brief": "Rebrand for sustainable packaging company",
    "deliverables": ["logo", "colour palette", "brand guidelines"]
  },
  "context": {
    "requester": "agent:procurement@external-corp.com",
    "conversationId": "conv-456"
  }
}
```

**SEP Response (Interest Recorded)**

```json
{
  "taskId": "a2a-task-789",
  "status": "pending_chain_discovery",
  "sep_reference": {
    "need_id": "need-external-789",
    "participant_id": "participant-external-corp",
    "message": "Interest recorded. SEP matching algorithm will search for suitable chains. Human approval required before commitment."
  }
}
```

### A2A Bridge Service

The bridge translates between A2A task lifecycle and SEP chain lifecycle.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        A2A Bridge Service                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────────┐    │
│  │ A2A Task    │───►│ Task         │───►│ SEP Need            │    │
│  │ Request     │    │ Translator   │    │ Registration        │    │
│  └─────────────┘    └──────────────┘    └─────────────────────┘    │
│                                                   │                  │
│                                                   ▼                  │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────────┐    │
│  │ A2A Task    │◄───│ Status       │◄───│ SEP Chain           │    │
│  │ Updates     │    │ Translator   │    │ Lifecycle           │    │
│  └─────────────┘    └──────────────┘    └─────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**State Mapping**

| A2A Task State | SEP Chain State | Notes |
|----------------|-----------------|-------|
| `created` | Need registered | Initial interest recorded |
| `accepted` | Chain proposed | Matching algorithm found chain |
| `in_progress` | Confirming/Committed/Executing | Varies by chain stage |
| `completed` | Completed | All edges satisfied |
| `failed` | Failed/Declined | With compensation info |
| `cancelled` | Abandoned/Cancelled | Withdrawn before execution |

---

## MCP Integration

### SEP Tools for AI Assistants

MCP tools allow AI assistants to help users discover and participate in SEP.

**Tool: Browse SEP Offerings**

```json
{
  "name": "sep_browse_offerings",
  "description": "Search for surplus offerings available through SEP exchange. Use when user asks about finding services or goods without monetary payment, or wants to know what's available for surplus exchange.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Natural language description of what the user needs"
      },
      "category": {
        "type": "string",
        "enum": ["service", "physical_good", "access", "space"],
        "description": "Type of offering to search for"
      },
      "location": {
        "type": "string",
        "description": "Geographic constraint (e.g., 'UK', 'London')"
      },
      "max_results": {
        "type": "integer",
        "default": 5
      }
    },
    "required": ["query"]
  }
}
```

**Tool: Check SEP Balance**

```json
{
  "name": "sep_check_balance",
  "description": "Check the user's current SEP network position - exchanges completed, satisfaction rating, and what they might need to offer to participate in exchanges. Use when user asks about their SEP status or whether they can participate in an exchange.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "participant_id": {
        "type": "string",
        "description": "The user's SEP participant ID"
      }
    },
    "required": ["participant_id"]
  }
}
```

**Tool: Express SEP Interest**

```json
{
  "name": "sep_express_interest",
  "description": "Register interest in receiving something through SEP exchange. This triggers the matching algorithm to search for chains that could fulfil this need. Use when user wants to get something via SEP. Note: This does NOT commit to any exchange - human approval is required for chain participation.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "description": {
        "type": "string",
        "description": "What the user needs"
      },
      "category": {
        "type": "string",
        "enum": ["service", "physical_good", "access", "space"]
      },
      "urgency": {
        "type": "string",
        "enum": ["flexible", "within_month", "within_week", "urgent"],
        "default": "flexible"
      },
      "constraints": {
        "type": "object",
        "properties": {
          "geographic": { "type": "string" },
          "timing": { "type": "string" }
        }
      }
    },
    "required": ["description", "category"]
  }
}
```

**Tool: Review SEP Proposal**

```json
{
  "name": "sep_review_proposal",
  "description": "Get details of a chain proposal for user review. Use when user receives notification of a potential SEP exchange and wants to understand what's being proposed.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "proposal_id": {
        "type": "string",
        "description": "ID of the chain proposal to review"
      }
    },
    "required": ["proposal_id"]
  }
}
```

### MCP Server Implementation

```typescript
// SEP MCP Server (simplified)
import { Server } from '@modelcontextprotocol/sdk/server';
import { SEPClient } from './sep-client';

const server = new Server({
  name: 'sep-mcp-server',
  version: '1.0.0'
});

server.setRequestHandler('tools/list', async () => ({
  tools: [
    { name: 'sep_browse_offerings', ... },
    { name: 'sep_check_balance', ... },
    { name: 'sep_express_interest', ... },
    { name: 'sep_review_proposal', ... }
  ]
}));

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  const sepClient = new SEPClient(/* credentials */);

  switch (name) {
    case 'sep_browse_offerings':
      return await sepClient.searchOfferings(args);
    case 'sep_check_balance':
      return await sepClient.getParticipantStatus(args.participant_id);
    case 'sep_express_interest':
      return await sepClient.registerNeed(args);
    case 'sep_review_proposal':
      return await sepClient.getProposalDetails(args.proposal_id);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});
```

---

## Hybrid Chain Patterns

### Pattern 1: SEP Chain with External Fulfilment

Some chain edges may require external services (logistics, translation) that operate monetarily.

```
┌────────────┐    SEP    ┌────────────┐    SEP    ┌────────────┐
│Participant │──────────►│Participant │──────────►│Participant │
│     A      │  (service)│     B      │ (goods)   │     C      │
└────────────┘           └────────────┘           └────────────┘
      ▲                        │                        │
      │                        │ External               │
      │                        ▼ (logistics)            │
      │                  ┌────────────┐                 │
      │       SEP        │  Courier   │                 │
      └──────────────────│  (paid)    │◄────────────────┘
                         └────────────┘
```

**Handling:**
- SEP chain tracks the core surplus exchanges
- External services tracked as "chain dependencies"
- Cost allocation agreed during chain confirmation
- Options: participant pays, shared cost, or logistics itself as SEP offering

**Chain Proposal with Dependencies**

```json
{
  "message_type": "ChainProposal",
  "chain_id": "chain-456",
  "edges": [
    { "edge_id": "edge-001", "type": "sep", ... },
    { "edge_id": "edge-002", "type": "sep", ... },
    { "edge_id": "edge-003", "type": "sep", ... }
  ],
  "dependencies": [
    {
      "dependency_id": "dep-001",
      "type": "logistics",
      "description": "Courier service for physical goods (edge-002)",
      "affected_edge": "edge-002",
      "settlement": {
        "method": "external_monetary",
        "estimated_cost": {
          "value": "45.00",
          "currency": "GBP"
        },
        "cost_bearer": "recipient",
        "note": "Recipient B arranges and pays for courier"
      }
    }
  ]
}
```

### Pattern 2: Hybrid Value Chain

A chain where some edges exchange surplus, others settle monetarily (for participants who can't close the loop).

```
┌────────────┐    SEP    ┌────────────┐   Monetary  ┌────────────┐
│Participant │──────────►│Participant │────────────►│Participant │
│     A      │  (design) │     B      │  (payment)  │     C      │
└────────────┘           └────────────┘             └────────────┘
      ▲                                                    │
      │                      SEP                           │
      └────────────────────(marketing)─────────────────────┘
```

**When to use:**
- Participant B needs design but has nothing C needs
- B pays C monetarily for something
- C provides marketing to A (closing the loop)
- Net effect: B pays money, A and C exchange surplus

**Hybrid Edge Definition**

```json
{
  "edge_id": "edge-002",
  "type": "monetary",
  "provider_id": "participant-C",
  "recipient_id": "participant-B",
  "settlement": {
    "method": "external_payment",
    "payment_protocol": "agent_payment",
    "amount": {
      "value": "500.00",
      "currency": "GBP"
    },
    "payment_terms": "on_delivery"
  },
  "offering_summary": "Software licence (1 year)"
}
```

**Constraints:**
- Hybrid chains require explicit opt-in from participants
- Monetary edges use standard payment protocols (not SEP's concern)
- SEP orchestration ensures all edges complete (or compensation triggers)
- Clear separation in UI between surplus and monetary edges

### Pattern 3: SEP as Fallback to Commerce

Integration with UCP/Agentic Commerce where SEP is offered as an alternative.

```
User: "I need office furniture"
      │
      ▼
┌─────────────────────────────────────────────┐
│           AI Shopping Assistant              │
├─────────────────────────────────────────────┤
│  1. Search UCP for products                  │
│  2. Search SEP for surplus offerings         │
│  3. Present options:                         │
│     - Buy from Store A: £500                │
│     - Buy from Store B: £450                │
│     - SEP exchange with Participant X:       │
│       "Office furniture available - you      │
│        would provide 8 hours consulting"     │
└─────────────────────────────────────────────┘
```

**Integration Flow:**
1. Commerce agent queries both UCP and SEP
2. SEP returns matching offerings with "exchange terms" (what user would provide)
3. User chooses between monetary and surplus options
4. If SEP chosen, triggers chain discovery and confirmation

---

## Capability Translation

### SEP → A2A Translation

```typescript
function sepOfferingToA2ACapability(offering: SEPOffering): A2ACapability {
  return {
    id: offering.id,
    name: offering.title,
    description: `${offering.description} (Available via SEP surplus exchange)`,
    inputSchema: generateInputSchema(offering),
    outputSchema: {
      type: 'object',
      properties: {
        chain_proposal_id: { type: 'string' },
        status: { type: 'string', enum: ['interest_recorded', 'chain_proposed', 'declined'] }
      }
    },
    metadata: {
      protocol: 'sep/1.0',
      offering_type: offering.type,
      exchange_basis: 'surplus',
      requires_reciprocity: true
    }
  };
}
```

### SEP → MCP Translation

```typescript
function sepOfferingToMCPTool(offering: SEPOffering): MCPTool {
  return {
    name: `sep_request_${sanitise(offering.id)}`,
    description: `Request "${offering.title}" through SEP surplus exchange. ${offering.description}. Note: Requires surplus offering from your side to participate.`,
    inputSchema: {
      type: 'object',
      properties: {
        requirements: {
          type: 'string',
          description: 'Specific requirements for this request'
        },
        urgency: {
          type: 'string',
          enum: ['flexible', 'within_month', 'within_week'],
          default: 'flexible'
        }
      },
      required: ['requirements']
    }
  };
}
```

### Bidirectional Sync

```
┌─────────────────────────────────────────────────────────────────┐
│                     Capability Sync Service                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SEP Offering (source of truth)                                 │
│         │                                                        │
│         ├──────────► A2A Agent Card (generated)                 │
│         │                 └──► Published to /.well-known/       │
│         │                                                        │
│         ├──────────► MCP Tool Definition (generated)            │
│         │                 └──► Registered with MCP server       │
│         │                                                        │
│         └──────────► Search Index (generated)                   │
│                           └──► For discovery queries            │
│                                                                  │
│  On offering update: regenerate all derived formats             │
│  On offering deletion: remove from all channels                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

### Cross-Protocol Authentication

```
External Agent                    SEP Network
     │                                │
     │  1. Discover SEP Agent Card    │
     │──────────────────────────────►│
     │◄──────────────────────────────│
     │     (includes OAuth endpoints) │
     │                                │
     │  2. OAuth client credentials   │
     │──────────────────────────────►│
     │◄──────────────────────────────│
     │     (access_token)             │
     │                                │
     │  3. A2A Task with token        │
     │──────────────────────────────►│
     │                                │
     │  4. SEP validates token        │
     │     - Check scopes             │
     │     - Check participant status │
     │     - Apply rate limits        │
     │                                │
     │  5. Process request            │
     │◄──────────────────────────────│
     │     (task accepted)            │
```

### Delegation for External Agents

External agents acting on behalf of SEP participants need explicit delegation.

**Delegation Grant**

```json
{
  "type": "ExternalAgentDelegation",
  "participant_id": "participant-123",
  "agent_identifier": "agent:procurement@external-corp.com",
  "permissions": [
    "sep:discover",
    "sep:express_interest",
    {
      "action": "sep:confirm",
      "constraints": {
        "max_chain_size": 3,
        "max_execution_days": 30,
        "require_human_approval": true
      }
    }
  ],
  "valid_from": "2026-02-05T00:00:00Z",
  "valid_until": "2026-05-05T00:00:00Z",
  "granted_by": "participant-123",
  "signature": "..."
}
```

---

## Error Handling

### Cross-Protocol Error Mapping

| SEP Error | A2A Mapping | MCP Mapping |
|-----------|-------------|-------------|
| `PARTICIPANT_NOT_FOUND` | Task rejected: invalid requester | Tool error: authentication required |
| `OFFERING_UNAVAILABLE` | Task rejected: capability unavailable | Tool error: offering no longer available |
| `CHAIN_DECLINED` | Task failed: declined by participant | Tool error: chain not viable |
| `INSUFFICIENT_TRUST` | Task rejected: insufficient permissions | Tool error: trust tier insufficient |
| `RATE_LIMITED` | Task rejected: rate limit exceeded | Tool error: rate limit exceeded |

### Graceful Degradation

```typescript
async function handleA2ATask(task: A2ATask): Promise<A2AResponse> {
  try {
    const sepResult = await sepClient.processTask(task);
    return translateToA2A(sepResult);
  } catch (error) {
    if (error instanceof SEPNetworkError) {
      // SEP network unavailable - inform external agent
      return {
        taskId: task.taskId,
        status: 'failed',
        error: {
          code: 'SEP_UNAVAILABLE',
          message: 'SEP network temporarily unavailable. Please retry later.',
          retryAfter: 300 // seconds
        }
      };
    }
    if (error instanceof SEPValidationError) {
      // Request invalid for SEP
      return {
        taskId: task.taskId,
        status: 'rejected',
        error: {
          code: 'INVALID_REQUEST',
          message: error.message,
          details: error.validationErrors
        }
      };
    }
    throw error;
  }
}
```

---

## Monitoring and Observability

### Integration Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| `sep_a2a_tasks_received` | A2A tasks received per minute | N/A (informational) |
| `sep_a2a_tasks_converted` | A2A tasks that became SEP needs | < 10% conversion (may indicate mismatch) |
| `sep_mcp_tool_calls` | MCP tool invocations per hour | N/A (informational) |
| `sep_external_auth_failures` | Failed external auth attempts | > 100/hour (possible attack) |
| `sep_hybrid_chains_active` | Active chains with monetary edges | N/A (track for reporting) |
| `sep_bridge_latency_p99` | 99th percentile bridge response time | > 2000ms |

### Audit Trail

All cross-protocol interactions logged:

```json
{
  "timestamp": "2026-02-05T14:30:00Z",
  "event_type": "external_task_received",
  "protocol": "a2a",
  "external_agent": "agent:procurement@external-corp.com",
  "task_id": "a2a-task-789",
  "capability_requested": "sep-offering-001",
  "sep_participant": "participant-123",
  "outcome": "need_registered",
  "sep_reference": "need-456",
  "latency_ms": 145
}
```

---

## Open Questions

1. **Protocol negotiation**: When an agent supports multiple protocols, how do we negotiate which to use?

2. **Trust transitivity**: If an A2A agent is trusted by Google, should SEP trust it? How much?

3. **Capability versioning**: How do we handle SEP offering changes that affect published A2A/MCP definitions?

4. **Hybrid chain atomicity**: If a monetary edge fails, what happens to SEP edges? Vice versa?

5. **Discovery federation**: Should SEP offerings be discoverable through A2A registries? Privacy implications?

6. **Rate limiting across protocols**: Should A2A and MCP access share rate limits or have separate quotas?

---

## Implementation Priority

### Phase 1: A2A Compatibility
- Agent Card generation from SEP offerings
- A2A task receiver (create SEP needs from tasks)
- Basic authentication bridge

### Phase 2: MCP Tools
- Core MCP tools (browse, check balance, express interest)
- MCP server reference implementation
- Integration with Claude and other MCP clients

### Phase 3: Hybrid Chains
- Dependency tracking in chain proposals
- Monetary edge support
- External payment protocol integration

### Phase 4: Full Federation
- Cross-network discovery
- Trust score bridging
- Multi-protocol capability sync

---

## References

- docs/research/agentic-protocols-analysis.md
- prototypes/security-model.md
- prototypes/protocol-messages.json
- Google A2A Protocol Specification
- Anthropic MCP Documentation
