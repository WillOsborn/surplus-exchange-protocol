/**
 * Tests for validate.ts — ValidationError, createValidator, validate, createTypedValidator
 */
import { describe, it, expect } from 'vitest';
import type { ErrorObject } from 'ajv';
import {
  ValidationError,
  createValidator,
  validate,
  createTypedValidator,
} from './validate.js';

// ============================================================================
// ValidationError
// ============================================================================

describe('ValidationError', () => {
  it('creates error with formatted message from AJV error objects', () => {
    const errors: ErrorObject[] = [
      {
        instancePath: '/name',
        message: 'must be string',
        keyword: 'type',
        schemaPath: '#/properties/name/type',
        params: { type: 'string' },
      },
      {
        instancePath: '/age',
        message: 'must be number',
        keyword: 'type',
        schemaPath: '#/properties/age/type',
        params: { type: 'number' },
      },
    ];

    const error = new ValidationError(errors);

    expect(error.message).toBe(
      'Validation failed: /name: must be string; /age: must be number',
    );
    expect(error.name).toBe('ValidationError');
    expect(error).toBeInstanceOf(Error);
  });

  it('handles null/undefined errors gracefully (empty errors array)', () => {
    const fromNull = new ValidationError(null);
    const fromUndefined = new ValidationError(undefined);

    expect(fromNull.errors).toEqual([]);
    expect(fromNull.message).toBe('Validation failed: ');

    expect(fromUndefined.errors).toEqual([]);
    expect(fromUndefined.message).toBe('Validation failed: ');
  });

  it('preserves original error objects on errors property', () => {
    const errors: ErrorObject[] = [
      {
        instancePath: '/id',
        message: 'must NOT have fewer than 1 characters',
        keyword: 'minLength',
        schemaPath: '#/properties/id/minLength',
        params: { limit: 1 },
      },
    ];

    const error = new ValidationError(errors);

    expect(error.errors).toBe(errors);
    expect(error.errors).toHaveLength(1);
    expect(error.errors[0].instancePath).toBe('/id');
    expect(error.errors[0].keyword).toBe('minLength');
  });
});

// ============================================================================
// createValidator
// ============================================================================

describe('createValidator', () => {
  it('returns an Ajv instance', () => {
    const ajv = createValidator();

    // Ajv instances have a compile method
    expect(typeof ajv.compile).toBe('function');
    expect(typeof ajv.addSchema).toBe('function');
    expect(typeof ajv.validate).toBe('function');
  });

  it('instance supports format validation (date-time format via ajv-formats)', () => {
    const ajv = createValidator();

    const schema = {
      type: 'object' as const,
      properties: {
        timestamp: { type: 'string' as const, format: 'date-time' },
      },
      required: ['timestamp'],
    };

    const validator = ajv.compile(schema);

    // Valid date-time should pass
    expect(validator({ timestamp: '2026-03-06T10:00:00Z' })).toBe(true);

    // Invalid date-time should fail
    expect(validator({ timestamp: 'not-a-date' })).toBe(false);
  });
});

// ============================================================================
// validate
// ============================================================================

describe('validate', () => {
  it('returns data with correct type when valid', () => {
    const ajv = createValidator();
    const schema = {
      type: 'object' as const,
      properties: {
        name: { type: 'string' as const },
        value: { type: 'number' as const },
      },
      required: ['name', 'value'],
    };

    const validator = ajv.compile<{ name: string; value: number }>(schema);
    const data = { name: 'test', value: 42 };

    const result = validate(validator, data);

    expect(result).toEqual({ name: 'test', value: 42 });
    // Confirm it returns the same reference (not a copy)
    expect(result).toBe(data);
  });

  it('throws ValidationError when invalid', () => {
    const ajv = createValidator();
    const schema = {
      type: 'object' as const,
      properties: {
        name: { type: 'string' as const },
      },
      required: ['name'],
    };

    const validator = ajv.compile(schema);

    expect(() => validate(validator, {})).toThrow(ValidationError);
  });

  it('ValidationError.errors contains instancePath and message', () => {
    const ajv = createValidator();
    const schema = {
      type: 'object' as const,
      properties: {
        name: { type: 'string' as const, minLength: 1 },
      },
      required: ['name'],
      additionalProperties: false,
    };

    const validator = ajv.compile(schema);

    try {
      validate(validator, { name: 123, extra: true });
      expect.unreachable('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      const ve = err as ValidationError;

      // allErrors: true means we get multiple errors
      expect(ve.errors.length).toBeGreaterThanOrEqual(1);

      // Each error should have instancePath and message
      for (const error of ve.errors) {
        expect(error).toHaveProperty('instancePath');
        expect(error).toHaveProperty('message');
        expect(typeof error.message).toBe('string');
      }
    }
  });

  it('works with format-validated fields', () => {
    const ajv = createValidator();
    const schema = {
      type: 'object' as const,
      properties: {
        created_at: { type: 'string' as const, format: 'date-time' },
      },
      required: ['created_at'],
    };

    const validator = ajv.compile<{ created_at: string }>(schema);

    // Valid format passes
    const result = validate(validator, {
      created_at: '2026-03-06T12:00:00Z',
    });
    expect(result.created_at).toBe('2026-03-06T12:00:00Z');

    // Invalid format throws
    expect(() => validate(validator, { created_at: 'yesterday' })).toThrow(
      ValidationError,
    );
  });
});

// ============================================================================
// createTypedValidator
// ============================================================================

describe('createTypedValidator', () => {
  const simpleSchema = {
    type: 'object' as const,
    properties: {
      id: { type: 'string' as const },
      count: { type: 'number' as const },
    },
    required: ['id', 'count'],
    additionalProperties: false,
  };

  it('returns a function', () => {
    const ajv = createValidator();
    const typedValidate = createTypedValidator<{ id: string; count: number }>(
      ajv,
      simpleSchema,
    );

    expect(typeof typedValidate).toBe('function');
  });

  it('function returns typed data on valid input', () => {
    const ajv = createValidator();
    const typedValidate = createTypedValidator<{ id: string; count: number }>(
      ajv,
      simpleSchema,
    );

    const input = { id: 'abc', count: 7 };
    const result = typedValidate(input);

    expect(result).toEqual({ id: 'abc', count: 7 });
    expect(result).toBe(input);
  });

  it('function throws ValidationError on invalid input', () => {
    const ajv = createValidator();
    const typedValidate = createTypedValidator<{ id: string; count: number }>(
      ajv,
      simpleSchema,
    );

    expect(() => typedValidate({ id: 123 })).toThrow(ValidationError);
    expect(() => typedValidate(null)).toThrow(ValidationError);
    expect(() => typedValidate('not-an-object')).toThrow(ValidationError);
  });
});
