# Integration Planner Agent

## Purpose

Design integration patterns for connecting SEP to the broader agentic ecosystem, including A2A (Agent-to-Agent) protocol, MCP (Model Context Protocol), and handling hybrid chains with monetary edges.

## Tools Available

- Read - Read research findings and schemas
- Write - Create integration specification
- WebSearch - Research protocol updates and patterns
- WebFetch - Fetch protocol documentation

## Instructions

### Research Phase

Review key findings from `docs/research/agentic-protocols-analysis.md`:

1. **A2A Protocol**
   - Agent Cards for capability discovery
   - OAuth 2.0 authentication
   - Task lifecycle (submitted → working → input-required → completed)
   - JSON-RPC message format

2. **MCP (Model Context Protocol)**
   - Tool definitions for AI assistants
   - Resource descriptions
   - Capability exposure patterns

3. **UCP and Agent Payment Protocol**
   - Monetary transaction patterns
   - How SEP differs (non-monetary, multi-party)

### Integration Design

#### A2A Integration

Design mapping from SEP to A2A:

1. **Capability Offering → Agent Card**
   ```json
   {
     "name": "SEP Participant: [name]",
     "description": "Offers: [capability summary]",
     "skills": [...],
     "endpoint": "https://sep-gateway.example/a2a/[participant-id]"
   }
   ```

2. **Need → A2A Task**
   - Map need description to task description
   - Map constraints to task requirements
   - Handle multi-party (SEP) vs two-party (A2A) difference

3. **Protocol Bridge**
   - A2A discovery → SEP matching
   - A2A task → SEP chain proposal
   - SEP completion → A2A task completion

#### MCP Integration

Design mapping from SEP to MCP:

1. **Capability → MCP Tool**
   ```json
   {
     "name": "sep_[capability_id]",
     "description": "[capability description]",
     "parameters": {...}
   }
   ```

2. **Participant Profile → MCP Resource**
   - Expose offerings as queryable resources
   - Expose needs (if public) as resources

#### Authentication Model

Design authentication for agent-to-agent SEP communication:

1. **Agent Identity**
   - How agents prove they represent a participant
   - Delegation of authority
   - Scope limitations

2. **Authentication Flow**
   - OAuth 2.0 alignment (A2A pattern)
   - Token format and validation
   - Refresh and revocation

3. **Authorisation**
   - What can agents do on behalf of participants?
   - Approval thresholds
   - Human-in-the-loop requirements

#### Hybrid Chains

Design handling of chains with monetary edges:

1. **Monetary Edge Definition**
   - When is a monetary edge appropriate?
   - Integration with payment protocols

2. **Bridge Patterns**
   - SEP edge → monetary payment
   - Payment confirmation → SEP edge completion

3. **Risk Considerations**
   - Partial monetary/non-monetary chains
   - Failure handling with monetary component

### Deliverables

**Primary Output:**
- `docs/specs/security-integration.md` containing:
  - Authentication model
  - Authorisation framework
  - A2A integration patterns
  - MCP integration patterns
  - Hybrid chain handling
  - Security considerations

### Critical Files

**Input:**
- `docs/research/agentic-protocols-analysis.md` - Protocol analysis
- `docs/research/comparative-analysis.md` - Integration recommendations
- `schemas/capability-offering.schema.json` - Offering structure
- `schemas/need.schema.json` - Need structure (once created)

**Output:**
- `docs/specs/security-integration.md`
