/**
 * Validation utilities wrapping ajv for SEP schema validation.
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import type { ValidateFunction, ErrorObject, AnySchema } from 'ajv';

/**
 * Custom validation error with detailed information.
 */
export class ValidationError extends Error {
  public readonly errors: ErrorObject[];

  constructor(errors: ErrorObject[] | null | undefined) {
    const errorMessages = (errors ?? [])
      .map(e => `${e.instancePath}: ${e.message}`)
      .join('; ');

    super(`Validation failed: ${errorMessages}`);
    this.name = 'ValidationError';
    this.errors = errors ?? [];
  }
}

/**
 * Create an ajv instance configured for SEP schemas.
 */
export function createValidator(): Ajv {
  const ajv = new Ajv({
    allErrors: true,
    strict: true,
    validateFormats: true,
  });

  addFormats(ajv);

  return ajv;
}

/**
 * Validate data against a compiled schema.
 *
 * @param validator - Compiled ajv validation function
 * @param data - Data to validate
 * @returns The validated data with type assertion
 * @throws ValidationError if validation fails
 */
export function validate<T>(validator: ValidateFunction<T>, data: unknown): T {
  if (validator(data)) {
    return data;
  }

  throw new ValidationError(validator.errors);
}

/**
 * Create a type-safe validator function for a schema.
 *
 * @param ajv - Ajv instance
 * @param schema - JSON schema object
 * @returns A function that validates and returns typed data
 */
export function createTypedValidator<T>(
  ajv: Ajv,
  schema: AnySchema
): (data: unknown) => T {
  const validator = ajv.compile<T>(schema);

  return (data: unknown): T => {
    return validate(validator, data);
  };
}
