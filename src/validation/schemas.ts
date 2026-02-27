/**
 * Schema loading and management utilities.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import { createValidator } from './validate.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMAS_DIR = join(__dirname, '../../..', 'schemas');

/**
 * Schema names that can be loaded.
 */
export type SchemaName =
  | 'need'
  | 'exchange-chain'
  | 'capability-offering'
  | 'participant'
  | 'protocol-messages'
  | 'trust-profile';

/**
 * Cache for loaded schemas.
 */
const schemaCache = new Map<SchemaName, object>();

/**
 * Get the file path for a schema.
 */
function getSchemaPath(name: SchemaName): string {
  return join(SCHEMAS_DIR, `${name}.schema.json`);
}

/**
 * Load a single schema by name.
 *
 * @param name - Schema name
 * @returns The parsed JSON schema
 */
export function getSchema(name: SchemaName): object {
  const cached = schemaCache.get(name);
  if (cached) {
    return cached;
  }

  const path = getSchemaPath(name);
  const content = readFileSync(path, 'utf-8');
  const schema = JSON.parse(content) as object;

  schemaCache.set(name, schema);
  return schema;
}

/**
 * Load all schemas into an ajv instance.
 *
 * @param ajv - Ajv instance to load schemas into
 * @param names - Optional list of schema names to load (defaults to all)
 * @returns The ajv instance with schemas loaded
 */
export function loadSchemas(
  ajv?: Ajv,
  names?: SchemaName[]
): Ajv {
  const instance = ajv ?? createValidator();
  const schemasToLoad = names ?? [
    'participant',
    'capability-offering',
    'exchange-chain',
    'need',
    'protocol-messages',
    'trust-profile',
  ];

  for (const name of schemasToLoad) {
    try {
      const schema = getSchema(name);
      instance.addSchema(schema);
    } catch (error) {
      // Schema may not exist yet during development
      console.warn(`Could not load schema '${name}':`, error);
    }
  }

  return instance;
}

/**
 * Clear the schema cache (useful for testing).
 */
export function clearSchemaCache(): void {
  schemaCache.clear();
}
