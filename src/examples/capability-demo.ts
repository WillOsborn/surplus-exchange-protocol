/**
 * SEP Capability Translation Demo
 *
 * Interactive CLI demonstrating the capability translation flow:
 * Natural language → Term extraction → Matching → Feedback capture
 *
 * Usage:
 *   export ANTHROPIC_API_KEY="your-key-here"
 *   npm run capability
 */

import * as readline from 'readline';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import {
  extractTerms,
  formatExtractionResult,
  findMatches,
  formatMatchCandidate,
  loadFeedbackStore,
  saveFeedbackStore,
  recordExtraction,
  recordMatch,
  recordFeedback,
  formatStoreSummary,
  type ExtractionResult,
  type ExtractedOffering,
  type ExtractedNeed,
  type MatchFeedback,
  type FeedbackStore,
} from '../capability/index.js';

// ═══════════════════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════════════════

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '../../examples/capability/demo-output.json');

// ═══════════════════════════════════════════════════════════════════════════════
// Readline Utilities
// ═══════════════════════════════════════════════════════════════════════════════

function createInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function promptChoice(
  rl: readline.Interface,
  question: string,
  validChoices: string[]
): Promise<string> {
  return new Promise((resolve) => {
    const ask = () => {
      rl.question(question, (answer) => {
        const normalised = answer.trim().toLowerCase();
        if (validChoices.includes(normalised)) {
          resolve(normalised);
        } else {
          console.log(`  Please enter one of: ${validChoices.join(', ')}`);
          ask();
        }
      });
    };
    ask();
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Demo Flow
// ═══════════════════════════════════════════════════════════════════════════════

async function runDemo(): Promise<void> {
  const rl = createInterface();

  // Check for API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('\nError: ANTHROPIC_API_KEY environment variable not set.');
    console.error('Please run: export ANTHROPIC_API_KEY="your-key-here"\n');
    rl.close();
    process.exit(1);
  }

  // Load existing store
  let store: FeedbackStore = loadFeedbackStore(OUTPUT_PATH);

  console.log('\n' + '═'.repeat(70));
  console.log('  SEP Capability Translation Demo');
  console.log('═'.repeat(70));
  console.log('\n  This demo walks through the capability matching flow.');
  console.log('  You\'ll create an offering, then a need, and see how they match.\n');

  if (store.extractions.length > 0) {
    console.log('  Loaded existing feedback store:');
    console.log('  ' + formatStoreSummary(store).split('\n').join('\n  '));
    console.log();
  }

  let continueDemo = true;

  while (continueDemo) {
    try {
      // ─────────────────────────────────────────────────────────────────────────
      // Step 1: Define an Offering
      // ─────────────────────────────────────────────────────────────────────────

      console.log('─'.repeat(70));
      console.log('\n[Step 1: Define an Offering]\n');
      console.log('  Describe surplus capacity in natural language.');
      console.log('  Examples:');
      console.log('    • "I\'m a solicitor with 10 hours spare for contract work"');
      console.log('    • "Graphic designer, can do logos and pitch decks"');
      console.log('    • "Van driver with empty return journey Birmingham to Manchester"\n');

      const offeringInput = await prompt(rl, '  Your input: ');

      if (!offeringInput) {
        console.log('\n  No input provided. Skipping...\n');
        continue;
      }

      console.log('\n  Extracting capability terms...\n');

      let offeringExtraction: ExtractionResult;
      try {
        offeringExtraction = await extractTerms(offeringInput, 'offering', apiKey);
      } catch (error) {
        console.error(`\n  Error extracting terms: ${error}\n`);
        continue;
      }

      console.log(formatExtractionResult(offeringExtraction));

      // Confirm extraction
      const offeringConfirm = await promptChoice(
        rl,
        '\n  Does this look right? [Y]es / [R]etry / [S]kip: ',
        ['y', 'yes', 'r', 'retry', 's', 'skip']
      );

      if (offeringConfirm === 's' || offeringConfirm === 'skip') {
        console.log('\n  Skipping...\n');
        continue;
      }

      if (offeringConfirm === 'r' || offeringConfirm === 'retry') {
        console.log('\n  Let\'s try again...\n');
        continue;
      }

      // Record extraction
      recordExtraction(store, offeringExtraction);

      const offering: ExtractedOffering = {
        id: `off-${Date.now()}`,
        description: offeringInput,
        extraction: offeringExtraction,
      };

      // ─────────────────────────────────────────────────────────────────────────
      // Step 2: Define a Need
      // ─────────────────────────────────────────────────────────────────────────

      console.log('\n' + '─'.repeat(70));
      console.log('\n[Step 2: Define a Need]\n');
      console.log('  Describe what you need in natural language.');
      console.log('  Examples:');
      console.log('    • "We need someone to check our supplier agreement"');
      console.log('    • "Looking for help with our investor presentation"');
      console.log('    • "Need to move some boxes from Birmingham to Manchester"\n');

      const needInput = await prompt(rl, '  Your input: ');

      if (!needInput) {
        console.log('\n  No input provided. Skipping...\n');
        continue;
      }

      console.log('\n  Extracting capability terms...\n');

      let needExtraction: ExtractionResult;
      try {
        needExtraction = await extractTerms(needInput, 'need', apiKey);
      } catch (error) {
        console.error(`\n  Error extracting terms: ${error}\n`);
        continue;
      }

      console.log(formatExtractionResult(needExtraction));

      // Confirm extraction
      const needConfirm = await promptChoice(
        rl,
        '\n  Does this look right? [Y]es / [R]etry / [S]kip: ',
        ['y', 'yes', 'r', 'retry', 's', 'skip']
      );

      if (needConfirm === 's' || needConfirm === 'skip') {
        console.log('\n  Skipping...\n');
        continue;
      }

      if (needConfirm === 'r' || needConfirm === 'retry') {
        console.log('\n  Let\'s try again from the need...\n');
        continue;
      }

      // Record extraction
      recordExtraction(store, needExtraction);

      const need: ExtractedNeed = {
        id: `need-${Date.now()}`,
        description: needInput,
        extraction: needExtraction,
      };

      // ─────────────────────────────────────────────────────────────────────────
      // Step 3: Matching
      // ─────────────────────────────────────────────────────────────────────────

      console.log('\n' + '─'.repeat(70));
      console.log('\n[Step 3: Matching]\n');
      console.log('  Searching for matches...\n');

      const matches = findMatches(need, [offering]);

      if (matches.length === 0) {
        console.log('  No match found between offering and need.');
        console.log('  This could mean:');
        console.log('    • The capabilities don\'t overlap');
        console.log('    • Confidence scores were too low');
        console.log('    • Different sectors with no cross-over\n');
      } else {
        const bestMatch = matches[0];
        console.log(formatMatchCandidate(bestMatch));

        // Record match
        recordMatch(store, bestMatch);

        // ───────────────────────────────────────────────────────────────────────
        // Step 4: Feedback
        // ───────────────────────────────────────────────────────────────────────

        console.log('\n' + '─'.repeat(70));
        console.log('\n[Step 4: Feedback]\n');
        console.log('  Would you confirm this match in a real scenario?\n');

        const feedbackChoice = await promptChoice(
          rl,
          '  [C]onfirm / [D]ecline / [S]kip: ',
          ['c', 'confirm', 'd', 'decline', 's', 'skip']
        );

        let feedback: MatchFeedback;

        if (feedbackChoice === 'c' || feedbackChoice === 'confirm') {
          const notes = await prompt(rl, '  Notes (optional): ');
          feedback = {
            match_id: bestMatch.id,
            outcome: 'confirmed',
            notes: notes || undefined,
            timestamp: new Date().toISOString(),
          };
          console.log('\n  ✓ Match confirmed!\n');
        } else if (feedbackChoice === 'd' || feedbackChoice === 'decline') {
          console.log('\n  Reason:');
          console.log('    [1] Poor fit');
          console.log('    [2] Trust concern');
          console.log('    [3] Timing issue');
          console.log('    [4] Other\n');

          const reasonChoice = await promptChoice(rl, '  Enter 1-4: ', [
            '1',
            '2',
            '3',
            '4',
          ]);

          const reasonMap: Record<string, MatchFeedback['decline_reason']> = {
            '1': 'poor_fit',
            '2': 'trust_concern',
            '3': 'timing',
            '4': 'other',
          };

          const notes = await prompt(rl, '  Notes (optional): ');

          feedback = {
            match_id: bestMatch.id,
            outcome: 'declined',
            decline_reason: reasonMap[reasonChoice],
            notes: notes || undefined,
            timestamp: new Date().toISOString(),
          };
          console.log('\n  ✗ Match declined.\n');
        } else {
          feedback = {
            match_id: bestMatch.id,
            outcome: 'skipped',
            timestamp: new Date().toISOString(),
          };
          console.log('\n  — Match skipped.\n');
        }

        // Record feedback
        recordFeedback(store, feedback);
      }

      // Save store
      saveFeedbackStore(store, OUTPUT_PATH);
      console.log(`  Saved to ${OUTPUT_PATH}\n`);

      // ─────────────────────────────────────────────────────────────────────────
      // Continue?
      // ─────────────────────────────────────────────────────────────────────────

      const continueChoice = await promptChoice(
        rl,
        '  Another round? [Y]es / [N]o: ',
        ['y', 'yes', 'n', 'no']
      );

      continueDemo = continueChoice === 'y' || continueChoice === 'yes';

    } catch (error) {
      console.error(`\n  Unexpected error: ${error}\n`);
      continueDemo = false;
    }
  }

  // Final summary
  console.log('\n' + '═'.repeat(70));
  console.log('  Session Complete');
  console.log('═'.repeat(70));
  console.log('\n' + formatStoreSummary(store));
  console.log(`\n  Data saved to: ${OUTPUT_PATH}\n`);
  console.log('═'.repeat(70) + '\n');

  rl.close();
}

// ═══════════════════════════════════════════════════════════════════════════════
// Entry Point
// ═══════════════════════════════════════════════════════════════════════════════

runDemo().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
