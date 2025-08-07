/**
 * Phase 2: Core Sections Development
 * 
 * This script handles the development of the six main sections of the Ovsia V4 website,
 * focusing on component creation, animations, and interactions.
 */

const { executeWithClaude, getAgentsWithCapability } = require('../agents/claude-agent-interface');
const fs = require('fs').promises;
const path = require('path');

// Define the phase tasks
const phase2Tasks = [
  {
    name: 'Hero Section Integration',
    agent: 'frontend-developer',
    params: {
      task: 'Adapt hero section from V3',
      context: 'Must preserve exact appearance and functionality',
      requirements: 'Scroll-triggered logo inversion, white→black transition',
      deliverables: 'Functioning hero component with animations'
    }
  },
  {
    name: 'Essence Manifesto Section',
    agent: 'javascript-pro',
    params: {
      task: 'Implement Essence Manifesto section with word morphing',
      context: 'Black background with centered text',
      requirements: 'Scroll-linked word morphing, hover interaction, white flash transition',
      deliverables: 'Animated text component with interactions'
    }
  },
  {
    name: 'Core Capabilities Section',
    agent: 'frontend-developer',
    params: {
      task: 'Build rotating capability cards component',
      context: 'White background with centered rotating pillar',
      requirements: 'Auto-rotation (5s), hover pause, modal system',
      deliverables: 'Interactive card component with rotation and modals'
    }
  },
  {
    name: 'Proof of Ousia Section',
    agent: 'javascript-pro',
    params: {
      task: 'Create 3-item carousel with animations',
      context: 'Black background with alternating contrast slides',
      requirements: 'Progress bar animation, hover effects, overlay system',
      deliverables: 'Carousel component with interactions'
    }
  },
  {
    name: 'Choose Your Path Section',
    agent: 'frontend-developer',
    params: {
      task: 'Implement split-screen CTAs with forms',
      context: 'White background with left/right layout',
      requirements: 'Modal form, mailto link, file upload system',
      deliverables: 'Split layout with working interactions'
    }
  },
  {
    name: 'Stay in Ousia Section',
    agent: 'frontend-developer',
    params: {
      task: 'Build footer section with animations',
      context: 'Black background with centered text',
      requirements: 'Text pulse animation, social links, legal footer',
      deliverables: 'Footer component with subtle animations'
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
 * Run all Phase 2 tasks in sequence
 */
async function runPhase2() {
  console.log('=== STARTING PHASE 2: CORE SECTIONS DEVELOPMENT ===');
  
  // First, find agents with relevant capabilities
  findAgentsForCapability('react');
  findAgentsForCapability('animation');
  findAgentsForCapability('component');
  
  // Then execute each task
  for (const task of phase2Tasks) {
    await executePhaseTask(task);
  }
  
  console.log('\n=== PHASE 2 COMPLETE ===');
}

// Run the phase if this script is executed directly
if (require.main === module) {
  runPhase2().catch(console.error);
}

module.exports = {
  runPhase2,
  executePhaseTask,
  findAgentsForCapability,
  phase2Tasks
};
