/**
 * Test script for agent integration
 * Run with: node test-agents.js
 */

const { listAgents, runAgentTask } = require('../scripts/agents/agent-integration');

// List all available agents
console.log('Available agents:');
const agents = listAgents();
console.log(agents);

// If there are agents available, run a test task with the first one
if (agents.length > 0) {
  console.log(`\nRunning test task with agent: ${agents[0]}`);
  
  runAgentTask(agents[0], { 
    task: 'Test task',
    context: 'Testing agent integration'
  }).then(result => {
    console.log('Task result:', result);
  });
}
