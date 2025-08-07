/**
 * Claude Agent Interface
 * 
 * This file provides methods for Claude Code to interact with your specialized agents.
 * It handles loading agent content and generating prompts that Claude can use.
 */

const fs = require('fs');
const path = require('path');
const { registry } = require('./agent-integration');

/**
 * Generate a Claude prompt that incorporates an agent's expertise
 * @param {string} agentName - Name of the agent to use
 * @param {Object} taskParams - Parameters for the task
 * @returns {string} - Formatted prompt for Claude
 */
function generateClaudePrompt(agentName, taskParams) {
  const agent = registry.getAgent(agentName);
  if (!agent) {
    throw new Error(`Agent "${agentName}" not found`);
  }

  // Format the task parameters as a string
  const taskParamsString = Object.entries(taskParams)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  // Create a prompt that includes the agent's content and the task
  return `
# Task for ${agentName}

## Agent Expertise
${agent.content}

## Task Details
${taskParamsString}

## Instructions
Please complete this task using the expertise of the ${agentName} agent.
Respond in the voice and style appropriate for this agent.
  `;
}

/**
 * Get agent content for reference
 * @param {string} agentName - Name of the agent
 * @returns {string} - The agent's content
 */
function getAgentContent(agentName) {
  const agent = registry.getAgent(agentName);
  if (!agent) {
    throw new Error(`Agent "${agentName}" not found`);
  }
  return agent.content;
}

/**
 * Get a list of agents with specific capabilities
 * @param {string} capability - Capability to filter by
 * @returns {Array} - List of agent names with that capability
 */
function getAgentsWithCapability(capability) {
  const agents = registry.getAgentsByCapability(capability);
  return agents.map(agent => agent.name);
}

/**
 * Execute a task using an agent via Claude
 * @param {string} agentName - Name of the agent to use
 * @param {Object} taskParams - Parameters for the task
 * @returns {Promise<string>} - Claude's response
 */
async function executeWithClaude(agentName, taskParams) {
  const prompt = generateClaudePrompt(agentName, taskParams);
  
  // Here you would call Claude API with the prompt
  // For now, we'll just return the prompt for demonstration
  console.log(`Generated prompt for Claude using ${agentName}:`);
  console.log('-------------------------------------------');
  console.log(prompt);
  console.log('-------------------------------------------');
  
  return `This would be Claude's response after processing the task with ${agentName}'s expertise.`;
}

module.exports = {
  generateClaudePrompt,
  getAgentContent,
  getAgentsWithCapability,
  executeWithClaude
};
