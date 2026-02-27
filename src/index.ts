/**
 * Surplus Exchange Protocol - Reference Implementation
 *
 * This package provides TypeScript types and utilities for working with
 * the Surplus Exchange Protocol (SEP).
 */

// Re-export schema types
export * from './schemas/index.js';

// Re-export validation utilities
export * from './validation/index.js';

// Re-export protocol implementation
export * from './protocol/state-machine.js';
export * from './protocol/message-handler.js';

// Re-export capability translation system
export * from './capability/index.js';
