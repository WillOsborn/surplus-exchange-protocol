# TypeScript Implementer Agent

## Purpose

Build the TypeScript reference implementation for the Surplus Exchange Protocol, including type generation from schemas, validation utilities, state machine implementation, and example runners.

## Tools Available

- Read - Read schemas and specifications
- Write - Create TypeScript code
- Bash - Run npm commands, compile, test

## Instructions

### Project Setup

Create the TypeScript project structure:

```
src/
├── schemas/                      # Generated types
│   ├── index.ts
│   ├── need.ts
│   ├── exchange-chain.ts
│   ├── protocol-messages.ts
│   └── trust-profile.ts
├── validation/                   # Schema validation
│   ├── index.ts
│   ├── validate.ts
│   └── schemas.ts
├── protocol/                     # Protocol implementation
│   ├── state-machine.ts
│   ├── message-handler.ts
│   └── compensation.ts
├── matching/                     # Chain discovery (stub)
│   └── cycle-detection.ts
└── examples/
    └── trace-chain.ts
```

### Package Configuration

**package.json**:
```json
{
  "name": "sep-reference",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "validate": "ajv compile -s 'schemas/*.schema.json'",
    "validate:examples": "ajv validate -s schemas/need.schema.json -d 'examples/needs/*.json'",
    "generate:types": "json2ts -i schemas -o src/schemas",
    "build": "tsc",
    "trace": "ts-node src/examples/trace-chain.ts"
  },
  "dependencies": {
    "ajv": "^8.12.0",
    "ajv-formats": "^2.1.1"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "ts-node": "^10.9.0",
    "json-schema-to-typescript": "^13.1.0",
    "@types/node": "^20.0.0"
  }
}
```

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Type Generation

Generate TypeScript types from JSON schemas using `json-schema-to-typescript`:

```bash
npx json2ts -i schemas/need.schema.json -o src/schemas/need.ts
```

### Validation Utilities

Create ajv wrapper for runtime validation:

```typescript
// src/validation/validate.ts
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { needSchema, chainSchema, messageSchema } from './schemas.js';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export const validateNeed = ajv.compile(needSchema);
export const validateChain = ajv.compile(chainSchema);
export const validateMessage = ajv.compile(messageSchema);

export function validate<T>(validator: ValidateFunction, data: unknown): T {
  if (validator(data)) {
    return data as T;
  }
  throw new ValidationError(validator.errors);
}
```

### State Machine Implementation

Implement the chain state machine from `docs/specs/execution-protocol.md`:

```typescript
// src/protocol/state-machine.ts
export type ChainState =
  | 'DRAFT' | 'PROPOSED' | 'CONFIRMING' | 'COMMITTED'
  | 'EXECUTING' | 'COMPLETED' | 'DISCARDED' | 'ABANDONED'
  | 'DECLINED' | 'CANCELLED' | 'FAILED';

export type ChainEvent =
  | { type: 'SUBMIT' }
  | { type: 'FIRST_CONFIRMATION'; participantId: string }
  | { type: 'ALL_CONFIRMED' }
  | { type: 'DECLINE'; participantId: string; reason: string }
  // ... etc

export class ChainStateMachine {
  private state: ChainState;

  transition(event: ChainEvent): ChainState {
    // Implement state transitions
  }
}
```

### Example Runners

Create executable examples that trace through protocol flows:

```typescript
// src/examples/trace-chain.ts
import { ChainStateMachine } from '../protocol/state-machine.js';

async function traceHappyPath() {
  console.log('=== Happy Path: 3-Party Chain ===\n');

  const machine = new ChainStateMachine();

  console.log(`Initial state: ${machine.state}`);

  machine.transition({ type: 'SUBMIT' });
  console.log(`After submit: ${machine.state}`);

  // Continue tracing...
}
```

### Quality Requirements

1. **Type Safety**
   - No `any` types except where unavoidable
   - Strict null checks enabled
   - All public APIs have JSDoc comments

2. **Error Handling**
   - Custom error classes for validation, state, protocol errors
   - Informative error messages
   - Error codes for programmatic handling

3. **Testing Readiness**
   - Code structured for unit testing
   - Dependencies injectable
   - State visible for assertions

### Critical Files

**Input:**
- `schemas/*.schema.json` - Schema definitions
- `docs/specs/execution-protocol.md` - State machine spec
- `docs/specs/message-protocol.md` - Message handling spec

**Output:**
- `package.json`
- `tsconfig.json`
- `src/**/*.ts` - All TypeScript implementation
