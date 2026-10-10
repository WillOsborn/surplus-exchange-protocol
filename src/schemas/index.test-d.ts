/**
 * Type-level checks: convenience types must match the generated schema types.
 * Run with `npx vitest run --typecheck`.
 */
import { describe, it, expectTypeOf } from 'vitest';
import type { TrustTier, ChainState, EdgeState, TrustProfile, ExchangeChain, ChainEdge } from './index.js';

describe('schema convenience types', () => {
  it('TrustTier matches the trust-profile schema', () => {
    expectTypeOf<TrustTier>().toEqualTypeOf<TrustProfile['current_tier']>();
  });

  it('ChainState matches the exchange-chain schema', () => {
    expectTypeOf<ChainState>().toEqualTypeOf<ExchangeChain['status']>();
  });

  it('EdgeState matches the chain edge schema', () => {
    expectTypeOf<EdgeState>().toEqualTypeOf<ChainEdge['status']>();
  });
});
