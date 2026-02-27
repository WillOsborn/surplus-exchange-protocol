/**
 * SEP Capability Translation Demo — Offline Mode
 *
 * Demonstrates the capability matching pipeline without requiring an API key.
 * Three pre-recorded scenarios show extraction results and matching outcomes:
 *
 * 1. Good match — solicitor offering ↔ contract review need
 * 2. Partial match — graphic designer ↔ investor presentation
 * 3. No match — van driver ↔ quarterly accounts
 *
 * The extraction step is pre-recorded (hardcoded ExtractionResult objects),
 * but the matching step uses the real matching engine.
 *
 * For the interactive version with live AI extraction:
 *   npm run capability:live
 *
 * Run with: npm run capability
 */

import {
  findMatches,
  formatExtractionResult,
  formatMatchCandidate,
  type ExtractionResult,
  type ExtractedOffering,
  type ExtractedNeed,
} from '../capability/index.js';

// ═══════════════════════════════════════════════════════════════════════════════
// Pre-Recorded Extractions
// ═══════════════════════════════════════════════════════════════════════════════

const scenarios: Array<{
  title: string;
  description: string;
  offering: { input: string; extraction: ExtractionResult };
  need: { input: string; extraction: ExtractionResult };
}> = [
  {
    title: 'Good Match — Solicitor ↔ Contract Review',
    description:
      'A solicitor with spare capacity and a business needing a supplier agreement reviewed. ' +
      'Both map to the same capability term (contract_review), producing a high-confidence match.',
    offering: {
      input: "I'm a solicitor with 10 hours spare for contract work this month",
      extraction: {
        id: 'extract-offline-offering-1',
        input: "I'm a solicitor with 10 hours spare for contract work this month",
        source_type: 'offering',
        extracted_terms: [
          {
            term_id: 'contract_review',
            confidence: 0.95,
            reasoning: '"solicitor" + "contract work" maps directly to contract_review',
          },
          {
            term_id: 'legal_advisory',
            confidence: 0.7,
            reasoning: 'Solicitor implies general legal advisory capability',
          },
        ],
        unmatched_fragments: [],
        timestamp: '2026-02-27T10:00:00Z',
      },
    },
    need: {
      input: 'We need someone to check our supplier agreement before we sign',
      extraction: {
        id: 'extract-offline-need-1',
        input: 'We need someone to check our supplier agreement before we sign',
        source_type: 'need',
        extracted_terms: [
          {
            term_id: 'contract_review',
            confidence: 0.92,
            reasoning: '"check our supplier agreement" is a contract review task',
          },
        ],
        unmatched_fragments: [],
        timestamp: '2026-02-27T10:01:00Z',
      },
    },
  },
  {
    title: 'Partial Match — Graphic Designer ↔ Investor Presentation',
    description:
      'A graphic designer offering pitch deck work and a business needing an investor presentation. ' +
      'They overlap on pitch_deck but the need also includes financial_reporting which the designer cannot fulfil.',
    offering: {
      input: 'Graphic designer, can do logos and pitch decks for the next 3 weeks',
      extraction: {
        id: 'extract-offline-offering-2',
        input: 'Graphic designer, can do logos and pitch decks for the next 3 weeks',
        source_type: 'offering',
        extracted_terms: [
          {
            term_id: 'logo_design',
            confidence: 0.95,
            reasoning: '"logos" maps directly to logo_design',
          },
          {
            term_id: 'pitch_deck',
            confidence: 0.9,
            reasoning: '"pitch decks" maps directly to pitch_deck',
          },
          {
            term_id: 'brand_identity',
            confidence: 0.6,
            reasoning: 'Logo and pitch deck work implies brand identity capability',
          },
        ],
        unmatched_fragments: [],
        timestamp: '2026-02-27T10:02:00Z',
      },
    },
    need: {
      input: 'Looking for help with our investor presentation — needs financial slides and visual polish',
      extraction: {
        id: 'extract-offline-need-2',
        input: 'Looking for help with our investor presentation — needs financial slides and visual polish',
        source_type: 'need',
        extracted_terms: [
          {
            term_id: 'pitch_deck',
            confidence: 0.85,
            reasoning: '"investor presentation" with "visual polish" maps to pitch_deck',
          },
          {
            term_id: 'financial_reporting',
            confidence: 0.6,
            reasoning: '"financial slides" suggests financial reporting capability needed',
          },
        ],
        unmatched_fragments: ['financial slides'],
        timestamp: '2026-02-27T10:03:00Z',
      },
    },
  },
  {
    title: 'No Match — Van Driver ↔ Quarterly Accounts',
    description:
      'A van driver with spare transport capacity and a business needing accounting. ' +
      'Completely different sectors with no term overlap — the matcher correctly finds no match.',
    offering: {
      input: 'Van driver with empty return journey Birmingham to Manchester every Tuesday',
      extraction: {
        id: 'extract-offline-offering-3',
        input: 'Van driver with empty return journey Birmingham to Manchester every Tuesday',
        source_type: 'offering',
        extracted_terms: [
          {
            term_id: 'courier_delivery',
            confidence: 0.85,
            reasoning: '"van driver" + "journey" maps to courier/delivery capability',
          },
          {
            term_id: 'logistics_transport',
            confidence: 0.75,
            reasoning: 'Regular route between cities implies transport/logistics',
          },
        ],
        unmatched_fragments: [],
        timestamp: '2026-02-27T10:04:00Z',
      },
    },
    need: {
      input: 'We need someone to do our quarterly accounts and VAT return',
      extraction: {
        id: 'extract-offline-need-3',
        input: 'We need someone to do our quarterly accounts and VAT return',
        source_type: 'need',
        extracted_terms: [
          {
            term_id: 'bookkeeping',
            confidence: 0.9,
            reasoning: '"quarterly accounts" maps to bookkeeping',
          },
          {
            term_id: 'tax_compliance',
            confidence: 0.88,
            reasoning: '"VAT return" maps to tax compliance',
          },
        ],
        unmatched_fragments: [],
        timestamp: '2026-02-27T10:05:00Z',
      },
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════════

function main(): void {
  console.log();
  console.log('╔'.padEnd(69, '═') + '╗');
  console.log('║' + '  SEP Capability Translation Demo — Offline Mode'.padEnd(68) + '║');
  console.log('╚'.padEnd(69, '═') + '╝');
  console.log();
  console.log('  This demo shows how SEP translates natural language descriptions');
  console.log('  into structured capability terms and finds matches between them.');
  console.log();
  console.log('  The pipeline:');
  console.log('    1. Participant describes surplus or need in plain language');
  console.log('    2. AI extracts structured capability terms (pre-recorded here)');
  console.log('    3. Matcher finds term overlap between offerings and needs');
  console.log('    4. Participants review and give feedback on proposed matches');
  console.log();
  console.log('  Running in offline mode — extraction results are pre-recorded.');
  console.log('  For live AI extraction: npm run capability:live');
  console.log();

  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i];

    console.log('═'.repeat(70));
    console.log(`  Scenario ${i + 1}: ${scenario.title}`);
    console.log('═'.repeat(70));
    console.log();
    console.log(`  ${scenario.description}`);
    console.log();

    // Show offering extraction
    console.log('─── Offering ───');
    console.log(`  Input: "${scenario.offering.input}"`);
    console.log();
    console.log(formatExtractionResult(scenario.offering.extraction));
    console.log();

    // Show need extraction
    console.log('─── Need ───');
    console.log(`  Input: "${scenario.need.input}"`);
    console.log();
    console.log(formatExtractionResult(scenario.need.extraction));
    console.log();

    // Run real matching
    console.log('─── Matching ───');

    const offering: ExtractedOffering = {
      id: `offering-offline-${i + 1}`,
      description: scenario.offering.input,
      extraction: scenario.offering.extraction,
    };

    const need: ExtractedNeed = {
      id: `need-offline-${i + 1}`,
      description: scenario.need.input,
      extraction: scenario.need.extraction,
    };

    const matches = findMatches(need, [offering]);

    if (matches.length === 0) {
      console.log('  No match found.');
      console.log('  The offering and need have no overlapping capability terms.');
      console.log('  In a real network, the matcher would search across all available');
      console.log('  offerings — here we only had one to compare against.');
    } else {
      console.log(formatMatchCandidate(matches[0]));
    }

    console.log();
  }

  // Summary
  console.log('═'.repeat(70));
  console.log('  Summary');
  console.log('═'.repeat(70));
  console.log();
  console.log('  Three scenarios demonstrated:');
  console.log('  1. Good match: same capability term, high confidence (contract_review)');
  console.log('  2. Partial match: one overlapping term (pitch_deck), one unmatched need');
  console.log('  3. No match: completely different sectors (transport vs accounting)');
  console.log();
  console.log('  Key capability translation patterns:');
  console.log('  - Natural language maps to structured terms via AI extraction');
  console.log('  - Synonyms and related phrases collapse to canonical term IDs');
  console.log('  - Matching works on term overlap, not string comparison');
  console.log('  - Confidence scores reflect extraction certainty');
  console.log('  - Unmatched fragments highlight gaps the system cannot yet bridge');
  console.log();
  console.log('═'.repeat(70));
}

main();
