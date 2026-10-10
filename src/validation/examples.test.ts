/**
 * Example data used by the demos must conform to the schemas.
 * The ajv-cli scripts in package.json cover single-document examples;
 * this covers the wrapped datasets the matching demo loads.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { createValidator } from './validate.js';
import { getSchema, type SchemaName } from './schemas.js';

const ajv = createValidator();

function loadDataset(file: string, key: string): Array<{ id: string }> {
  const url = new URL(`../../examples/matching/${file}`, import.meta.url);
  return JSON.parse(readFileSync(url, 'utf-8'))[key];
}

describe.each([
  ['participants.json', 'participants', 'participant'],
  ['offerings.json', 'offerings', 'capability-offering'],
  ['needs.json', 'needs', 'need'],
] as const)('examples/matching/%s', (file, key, schema: SchemaName) => {
  it(`every record validates against the ${schema} schema`, () => {
    const validator = ajv.compile(getSchema(schema));
    const invalid = loadDataset(file, key)
      .filter((record) => !validator(record))
      .map((record) => record.id);

    expect(invalid).toEqual([]);
  });
});
