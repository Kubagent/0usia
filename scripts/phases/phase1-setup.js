/**
 * Phase 1: Foundation & Architecture
 * 
 * This script demonstrates how to use specialized agents for the first phase
 * of Ovsia V4 development, focusing on project setup and architecture planning.
 */

const { executeWithClaude, getAgentsWithCapability } = require('../agents/claude-agent-interface');
const fs = require('fs').promises;
const path = require('path');

// Define the phase tasks
const phase1Tasks = [
  {
    name: 'Project Architecture Planning',
    agent: 'architect-review',
    params: {
      task: 'Design component architecture for Ovsia V4',
      context: 'One-page animated website with 6 scroll-locked sections',
      requirements: 'Must preserve V3 hero section, implement scroll animations, and ensure performance',
      deliverables: 'Component architecture diagram, state management strategy, animation system design'
    }
  },
  {
    name: 'Next.js Project Setup',
    agent: 'frontend-developer',
    params: {
      task: 'Initialize Next.js project with TypeScript and Tailwind CSS',
      context: 'Building on V3 foundation but with clean architecture',
      requirements: 'TypeScript, Tailwind CSS, Framer Motion, ESLint/Prettier',
      deliverables: 'Project scaffold with proper configuration'
    }
  },
  {
    name: 'V3 Asset Analysis',
    agent: 'legacy-modernizer',
    params: {
      task: 'Extract and analyze hero section from V3',
      context: 'Need to preserve exact functionality and appearance',
      requirements: 'Identify all components, animations, and dependencies',
      deliverables: 'Migration plan and component extraction strategy'
    }
  }
];

/**
 * Execute a phase task with the appropriate agent
 * @param {Object} task - Task definition
 * @returns {Promise<string>} - Claude's response
 */
async function executePhaseTask(task) {
  console.log(`\n=== EXECUTING TASK: ${task.name} ===`);
  console.log(`Using agent: ${task.agent}`);
  
  try {
    const response = await executeWithClaude(task.agent, task.params);
    
    // Save the response to a file for reference
    const outputDir = path.join(__dirname, 'agent-outputs');
    await fs.mkdir(outputDir, { recursive: true });
    
    const filename = `${task.name.toLowerCase().replace(/\s+/g, '-')}.md`;
    await fs.writeFile(path.join(outputDir, filename), response);
    
    console.log(`Task completed. Output saved to agent-outputs/${filename}`);
    return response;
  } catch (error) {
    console.error(`Error executing task ${task.name}:`, error);
    return null;
  }
}

/**
 * Find the best agents for a specific capability
 * @param {string} capability - Capability to look for
 */
function findAgentsForCapability(capability) {
  console.log(`\n=== FINDING AGENTS WITH CAPABILITY: ${capability} ===`);
  const agents = getAgentsWithCapability(capability);
  console.log(`Found ${agents.length} agents with ${capability} capability:`);
  console.log(agents);
}

/**
 * Run all Phase 1 tasks in sequence
 */
async function runPhase1() {
  console.log('=== STARTING PHASE 1: FOUNDATION & ARCHITECTURE ===');
  
  // First, find agents with relevant capabilities
  findAgentsForCapability('architecture');
  findAgentsForCapability('frontend');
  findAgentsForCapability('migration');
  
  // Then execute each task
  for (const task of phase1Tasks) {
    await executePhaseTask(task);
  }
  
  console.log('\n=== PHASE 1 COMPLETE ===');
}

// Run the phase if this script is executed directly
if (require.main === module) {
  runPhase1().catch(console.error);
}

module.exports = {
  runPhase1,
  executePhaseTask,
  findAgentsForCapability,
  phase1Tasks
};
