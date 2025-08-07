/**
 * Ovsia V4 Development Orchestration
 * 
 * This script orchestrates the entire development process for the Ovsia V4 website,
 * allowing you to run all phases in sequence or individual phases as needed.
 */

const { runPhase1 } = require('../scripts/phases/phase1-setup');
const { runPhase2 } = require('../scripts/phases/phase2-sections');
const { runPhase3 } = require('../scripts/phases/phase3-scroll');
const { runPhase4 } = require('../scripts/phases/phase4-integrations');
const { runPhase5 } = require('../scripts/phases/phase5-optimization');
const { runPhase6 } = require('../scripts/phases/phase6-deployment');

/**
 * Run all phases in sequence
 */
async function runAllPhases() {
  console.log('=== STARTING OVSIA V4 DEVELOPMENT PROCESS ===');
  console.log('Running all phases in sequence...');
  
  try {
    // Phase 1: Foundation & Architecture
    await runPhase1();
    
    // Phase 2: Core Sections Development
    await runPhase2();
    
    // Phase 3: Scroll System & Animations
    await runPhase3();
    
    // Phase 4: Integrations & Content
    await runPhase4();
    
    // Phase 5: Performance & SEO
    await runPhase5();
    
    // Phase 6: Deployment & QA
    await runPhase6();
    
    console.log('\n=== OVSIA V4 DEVELOPMENT COMPLETE ===');
  } catch (error) {
    console.error('Error in development process:', error);
  }
}

/**
 * Run a specific phase by number
 * @param {number} phaseNumber - The phase number to run (1-6)
 */
async function runPhase(phaseNumber) {
  console.log(`=== RUNNING PHASE ${phaseNumber} ===`);
  
  try {
    switch (phaseNumber) {
      case 1:
        await runPhase1();
        break;
      case 2:
        await runPhase2();
        break;
      case 3:
        await runPhase3();
        break;
      case 4:
        await runPhase4();
        break;
      case 5:
        await runPhase5();
        break;
      case 6:
        await runPhase6();
        break;
      default:
        console.error(`Invalid phase number: ${phaseNumber}. Please specify a number between 1 and 6.`);
    }
  } catch (error) {
    console.error(`Error running phase ${phaseNumber}:`, error);
  }
}

// Process command line arguments
function processArgs() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // No arguments, run all phases
    runAllPhases();
  } else if (args[0] === '--phase' && args[1]) {
    // Run a specific phase
    const phaseNumber = parseInt(args[1], 10);
    runPhase(phaseNumber);
  } else {
    // Invalid arguments
    console.log('Usage:');
    console.log('  node ovsia-development.js            # Run all phases');
    console.log('  node ovsia-development.js --phase 2  # Run phase 2 only');
  }
}

// If this script is executed directly, process arguments
if (require.main === module) {
  processArgs();
}

module.exports = {
  runAllPhases,
  runPhase
};
