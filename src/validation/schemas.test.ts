/**
 * Schema loading integration tests — real filesystem reads.
 *
 * The original "path resolution spike" tests are preserved here alongside
 * new integration tests that exercise getSchema and loadSchemas against
 * the actual JSON schema files on disk.
 */
import { describe, it, expect, afterEach } from 'vitest';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {
  getSchema,
  loadSchemas,
  clearSchemaCache,
  type SchemaName,
} from './schemas.js';

afterEach(() => {
  clearSchemaCache();
});

/**
 * Create an Ajv instance that can handle our draft-2020-12 schemas.
 *
 * The project schemas declare `"$schema": "https://json-schema.org/draft/2020-12/schema"`,
 * which standard Ajv 8 does not recognise as a meta-schema. We disable
 * `validateSchema` to allow compilation of these schemas in tests.
 */
function createTestAjv(): Ajv {
  const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
  addFormats(ajv);
  return ajv;
}

// ============================================================================
// Path resolution spike (original 2 tests)
// ============================================================================

describe('getSchema (path resolution spike)', () => {
  it('loads need schema from real filesystem with $schema property', () => {
    const schema = getSchema('need') as Record<string, unknown>;

    expect(schema).toBeDefined();
    expect(typeof schema).toBe('object');
    expect(schema['$schema']).toBeDefined();
    expect(typeof schema['$schema']).toBe('string');
  });

  it('caches schema on second call', () => {
    const first = getSchema('need');
    const second = getSchema('need');

    expect(first).toBe(second); // same reference
  });
});

// ============================================================================
// Integration tests — real filesystem
// ============================================================================

describe('getSchema (integration)', () => {
  const allSchemaNames: SchemaName[] = [
    'need',
    'exchange-chain',
    'capability-offering',
    'participant',
    'protocol-messages',
    'trust-profile',
  ];

  it('loads all 6 schemas without error', () => {
    for (const name of allSchemaNames) {
      const schema = getSchema(name) as Record<string, unknown>;

      expect(schema).toBeDefined();
      expect(typeof schema).toBe('object');
      expect(schema['$id']).toBeDefined();
    }
  });

  it('loaded schema validates a valid example document', () => {
    const ajv = createTestAjv();
    const needSchema = getSchema('need');
    const validator = ajv.compile(needSchema);

    const validNeed = {
      id: 'need-2026-001',
      type: 'service',
      participant: 'participant-startup-abc',
      status: 'active',
      description:
        'We need help with our investor pitch deck. Looking for design support to make our existing content more visually compelling before our Series A round.',
      capability_matching: {
        capability_sought: ['pitch_deck', 'presentation_design'],
      },
    };

    expect(validator(validNeed)).toBe(true);
  });

  it('loaded schema rejects an invalid document', () => {
    const ajv = createTestAjv();
    const needSchema = getSchema('need');
    const validator = ajv.compile(needSchema);

    // Missing required fields (participant, status, description, capability_matching)
    // and uses an invalid enum value for type
    const invalidNeed = {
      id: '',
      type: 'invalid_type',
    };

    expect(validator(invalidNeed)).toBe(false);
    expect(validator.errors).not.toBeNull();
    expect(validator.errors!.length).toBeGreaterThan(0);
  });
});

describe('loadSchemas (integration)', () => {
  it('returns an Ajv instance with all 6 schemas loaded', () => {
    const ajv = loadSchemas();

    expect(ajv).toBeDefined();
    expect(typeof ajv.compile).toBe('function');

    // Verify schemas were actually loaded by checking known $id URIs
    const needValidator = ajv.getSchema('https://surplus-exchange-protocol.org/schemas/need.schema.json');
    expect(needValidator).toBeDefined();
  });
});
