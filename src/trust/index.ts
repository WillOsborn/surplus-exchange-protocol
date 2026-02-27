/**
 * SEP Trust System
 *
 * Manages participant trust through graduated tiers, exposure limits,
 * and a vouching system for network entry.
 */

// Trust score computation
export {
  computeTrustScore,
  DEFAULT_OPTIONS as DEFAULT_CALCULATOR_OPTIONS,
  type TrustInput,
  type TrustScore,
  type TrustCalculatorOptions,
  type RoleSatisfaction,
} from './calculator.js';

// Tier system
export {
  assessTier,
  qualifiesForTier,
  calculateProgress,
  getLowerTier,
  getHigherTier,
  describeTier,
  getTierRequirements,
  summariseTierAssessment,
  TIER_DEFINITIONS,
  type TrustTier,
  type TierDefinition,
  type TierProgress,
  type TierAssessment,
  type TierAssessmentInput,
} from './tiers.js';

// Exposure limits
export {
  getExposureLimits,
  checkExposure,
  requiresEscrow,
  getAvailableCapacity,
  summariseExposureLimits,
  summariseCurrentExposure,
  validateLimitsConfiguration,
  TIER_EXPOSURE_LIMITS,
  type ExposureLimits,
  type CurrentExposure,
  type ExposureCheck,
  type ExposureCheckInput,
} from './exposure.js';

// Vouching system
export {
  createVouch,
  validateVouch,
  getVouchCapacity,
  calculateVouchImpact,
  revokeVouch,
  processExpiredVouches,
  DEFAULT_VOUCHING_CONFIG,
  type Vouch,
  type VouchStatus,
  type VouchCapacity,
  type VouchValidation,
  type VouchReputationImpact,
  type VouchingConfig,
  type SponsoredBehaviour,
} from './vouching.js';
