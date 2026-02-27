/**
 * Capability Translation System — Seed Vocabulary
 *
 * Initial capability terms covering 4 sectors: Creative, Legal,
 * Professional Services, and Transport/Logistics.
 *
 * This vocabulary bootstraps the capability translation system.
 * Terms progress from 'seed' to 'canonical' based on usage patterns.
 */

import type { TermDefinition } from './types.js';

/**
 * Seed vocabulary — 15 terms across 4 sectors.
 */
export const SEED_VOCABULARY: TermDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Creative (5 terms)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'logo_design',
    label: 'Logo Design',
    sector: 'creative',
    synonyms: [
      'logo',
      'brand mark',
      'company logo',
      'business logo',
      'logotype',
      'brand identity design',
    ],
    typical_capacity: { amount: 5, unit: 'hours', confidence: 'typical' },
  },
  {
    id: 'pitch_deck',
    label: 'Pitch Deck',
    sector: 'creative',
    synonyms: [
      'investor deck',
      'investor presentation',
      'funding deck',
      'pitch presentation',
      'startup deck',
      'investment presentation',
    ],
    typical_capacity: { amount: 8, unit: 'hours', confidence: 'typical' },
  },
  {
    id: 'brand_guidelines',
    label: 'Brand Guidelines',
    sector: 'creative',
    synonyms: [
      'brand guide',
      'style guide',
      'brand book',
      'brand standards',
      'visual identity guide',
      'brand manual',
    ],
    typical_capacity: { amount: 12, unit: 'hours', confidence: 'typical' },
  },
  {
    id: 'social_media_pack',
    label: 'Social Media Pack',
    sector: 'creative',
    synonyms: [
      'social media graphics',
      'social media templates',
      'social content',
      'social media kit',
      'social assets',
    ],
    typical_capacity: { amount: 4, unit: 'hours', confidence: 'typical' },
  },
  {
    id: 'illustration',
    label: 'Illustration',
    sector: 'creative',
    synonyms: [
      'custom illustration',
      'artwork',
      'graphic illustration',
      'digital illustration',
      'drawings',
    ],
    typical_capacity: { amount: 6, unit: 'hours', confidence: 'variable' },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Legal (4 terms)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'contract_review',
    label: 'Contract Review',
    sector: 'legal',
    synonyms: [
      'legal review',
      'contract check',
      'agreement review',
      'document review',
      'contract analysis',
      'legal document review',
    ],
    typical_capacity: { amount: 3, unit: 'hours', confidence: 'typical' },
  },
  {
    id: 'contract_drafting',
    label: 'Contract Drafting',
    sector: 'legal',
    synonyms: [
      'draft contract',
      'write contract',
      'agreement drafting',
      'legal drafting',
      'contract writing',
      'prepare contract',
    ],
    typical_capacity: { amount: 5, unit: 'hours', confidence: 'typical' },
  },
  {
    id: 'terms_and_conditions',
    label: 'Terms and Conditions',
    sector: 'legal',
    synonyms: [
      'T&Cs',
      'terms of service',
      'terms of use',
      'website terms',
      'service terms',
      'user agreement',
    ],
    typical_capacity: { amount: 4, unit: 'hours', confidence: 'typical' },
  },
  {
    id: 'legal_consultation',
    label: 'Legal Consultation',
    sector: 'legal',
    synonyms: [
      'legal advice',
      'legal guidance',
      'solicitor consultation',
      'lawyer consultation',
      'legal counsel',
      'legal opinion',
    ],
    typical_capacity: { amount: 1, unit: 'hours', confidence: 'typical' },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Professional Services (4 terms)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'consulting_session',
    label: 'Consulting Session',
    sector: 'professional_services',
    synonyms: [
      'consultation',
      'advisory session',
      'expert consultation',
      'professional advice',
      'consulting call',
      'advisory call',
    ],
    typical_capacity: { amount: 2, unit: 'hours', confidence: 'typical' },
  },
  {
    id: 'strategy_document',
    label: 'Strategy Document',
    sector: 'professional_services',
    synonyms: [
      'strategic plan',
      'strategy report',
      'business strategy',
      'strategic analysis',
      'strategy paper',
      'strategic roadmap',
    ],
    typical_capacity: { amount: 10, unit: 'hours', confidence: 'estimated' },
  },
  {
    id: 'research_report',
    label: 'Research Report',
    sector: 'professional_services',
    synonyms: [
      'market research',
      'research analysis',
      'research document',
      'analysis report',
      'industry research',
      'competitive analysis',
    ],
    typical_capacity: { amount: 8, unit: 'hours', confidence: 'estimated' },
  },
  {
    id: 'training_session',
    label: 'Training Session',
    sector: 'professional_services',
    synonyms: [
      'workshop',
      'training workshop',
      'teaching session',
      'coaching session',
      'skills training',
      'team training',
    ],
    typical_capacity: { amount: 3, unit: 'hours', confidence: 'typical' },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Transport/Logistics (2 terms)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'local_delivery',
    label: 'Local Delivery',
    sector: 'transport',
    synonyms: [
      'same city delivery',
      'local transport',
      'local courier',
      'city delivery',
      'local drop-off',
      'nearby delivery',
    ],
    typical_capacity: { amount: 1, unit: 'trips', confidence: 'exact' },
  },
  {
    id: 'regional_transport',
    label: 'Regional Transport',
    sector: 'transport',
    synonyms: [
      'intercity transport',
      'regional delivery',
      'cross-city transport',
      'regional courier',
      'longer distance delivery',
      'regional shipping',
    ],
    typical_capacity: { amount: 1, unit: 'trips', confidence: 'exact' },
  },
];

/**
 * Map for O(1) term lookup by ID.
 */
export const SEED_VOCABULARY_MAP: Map<string, TermDefinition> = new Map(
  SEED_VOCABULARY.map((term) => [term.id, term])
);

/**
 * Get all terms in a specific sector.
 */
export function getTermsBySector(sector: string): TermDefinition[] {
  return SEED_VOCABULARY.filter((term) => term.sector === sector);
}

/**
 * Get all unique sectors in the vocabulary.
 */
export function getSectors(): string[] {
  return [...new Set(SEED_VOCABULARY.map((term) => term.sector))];
}

/**
 * Format vocabulary for inclusion in an LLM prompt.
 */
export function formatVocabularyForPrompt(): string {
  const sectors = getSectors();
  const lines: string[] = [];

  for (const sector of sectors) {
    const terms = getTermsBySector(sector);
    lines.push(`\n${sector.toUpperCase().replace('_', ' ')}:`);
    for (const term of terms) {
      const synonymList = term.synonyms.slice(0, 3).join(', ');
      lines.push(`  - ${term.id}: "${term.label}" (also: ${synonymList})`);
    }
  }

  return lines.join('\n');
}
