/**
 * Schema loading unit tests — mocked filesystem.
 *
 * These tests mock `fs.readFileSync` to verify caching behaviour,
 * subset loading, and cache clearing without depending on real schema
 * files on disk.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';

// Hoist the mock so it's available before module imports
const mockReadFileSync = vi.hoisted(() => vi.fn());

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  return {
    ...actual,
    readFileSync: mockReadFileSync,
  };
});

// Import AFTER mock is set up
import { getSchema, loadSchemas, clearSchemaCache } from './schemas.js';

afterEach(() => {
  clearSchemaCache();
  mockReadFileSync.mockReset();
});

// ============================================================================
// getSchema — mock filesystem
// ============================================================================

describe('getSchema (mock fs)', () => {
  it('loads schema file and returns parsed object', () => {
    const fakeSchema = {
      $id: 'https://example.org/test.schema.json',
      type: 'object',
      properties: { name: { type: 'string' } },
    };
    mockReadFileSync.mockReturnValue(JSON.stringify(fakeSchema));

    const result = getSchema('need');

    expect(mockReadFileSync).toHaveBeenCalledOnce();
    expect(result).toEqual(fakeSchema);
  });

  it('returns cached result on second call (readFileSync called once)', () => {
    const fakeSchema = {
      $id: 'https://example.org/cached.schema.json',
      type: 'object',
    };
    mockReadFileSync.mockReturnValue(JSON.stringify(fakeSchema));

    const first = getSchema('need');
    const second = getSchema('need');

    expect(mockReadFileSync).toHaveBeenCalledOnce();
    expect(first).toBe(second);
  });
});

// ============================================================================
// loadSchemas — mock filesystem
// ============================================================================

describe('loadSchemas (mock fs)', () => {
  it('loads specified subset of schemas', () => {
    // Return a simple schema without $schema to avoid draft-2020-12 issues
    let callCount = 0;
    mockReadFileSync.mockImplementation(() => {
      callCount++;
      return JSON.stringify({
        $id: `https://example.org/schema-${callCount}.json`,
        type: 'object',
      });
    });

    const subset = ['need', 'participant'] as const;
    loadSchemas(undefined, [...subset]);

    // getSchema is called once per schema in the subset
    expect(mockReadFileSync).toHaveBeenCalledTimes(2);
  });

  it('loads all 6 schemas when no subset is specified', () => {
    let callCount = 0;
    mockReadFileSync.mockImplementation(() => {
      callCount++;
      return JSON.stringify({
        $id: `https://example.org/schema-${callCount}.json`,
        type: 'object',
      });
    });

    loadSchemas();

    // Default: all 6 schemas
    expect(mockReadFileSync).toHaveBeenCalledTimes(6);
  });
});

// ============================================================================
// clearSchemaCache — mock filesystem
// ============================================================================

describe('clearSchemaCache (mock fs)', () => {
  it('forces re-read from filesystem on next getSchema call', () => {
    const schemaV1 = { $id: 'https://example.org/v1.json', type: 'object' };
    const schemaV2 = { $id: 'https://example.org/v2.json', type: 'string' };

    mockReadFileSync
      .mockReturnValueOnce(JSON.stringify(schemaV1))
      .mockReturnValueOnce(JSON.stringify(schemaV2));

    const first = getSchema('need');
    expect(first).toEqual(schemaV1);
    expect(mockReadFileSync).toHaveBeenCalledTimes(1);

    clearSchemaCache();

    const second = getSchema('need');
    expect(second).toEqual(schemaV2);
    expect(mockReadFileSync).toHaveBeenCalledTimes(2);
  });
});
