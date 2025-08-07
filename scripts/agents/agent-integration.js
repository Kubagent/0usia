/**
 * Agent Integration System for Ovsia V4
 * 
 * This file helps Claude Code discover and utilize the markdown-defined agents
 * in the /agents directory. It loads agent definitions and makes them available
 * for use in the development process.
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter'); // For parsing frontmatter in markdown

/**
 * Agent Registry - Loads all agent definitions from markdown files
 */
class AgentRegistry {
  constructor() {
    this.agents = {};
    this.agentPath = path.join(__dirname, '../../agents');
    this.loadAgents();
  }

  /**
   * Load all agent definitions from the /agents directory
   */
  loadAgents() {
    try {
      // Get all .md files in the agents directory
      const agentFiles = fs.readdirSync(this.agentPath)
        .filter(file => file.endsWith('.md') && !file.startsWith('.'));
      
      console.log(`Found ${agentFiles.length} potential agent files`);
      
      // Process each agent file
      agentFiles.forEach(file => {
        try {
          const filePath = path.join(this.agentPath, file);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          
          // Parse the markdown content (assuming it has frontmatter)
          const { data, content } = matter(fileContent);
          
          // Create agent definition
          const agentName = file.replace('.md', '');
          this.agents[agentName] = {
            name: agentName,
            metadata: data || {},
            content: content,
            filePath: filePath
          };
          
          console.log(`Loaded agent: ${agentName}`);
        } catch (err) {
          console.error(`Error processing agent file ${file}:`, err);
        }
      });
      
      console.log(`Successfully loaded ${Object.keys(this.agents).length} agents`);
    } catch (err) {
      console.error('Error loading agents:', err);
    }
  }

  /**
   * Get an agent by name
   * @param {string} agentName - Name of the agent (without .md extension)
   * @returns {Object|null} - The agent definition or null if not found
   */
  getAgent(agentName) {
    return this.agents[agentName] || null;
  }

  /**
   * Get all available agent names
   * @returns {string[]} - Array of agent names
   */
  getAgentNames() {
    return Object.keys(this.agents);
  }

  /**
   * Get agents by capability/tag
   * @param {string} capability - Capability or tag to filter by
   * @returns {Object[]} - Array of matching agent definitions
   */
  getAgentsByCapability(capability) {
    return Object.values(this.agents).filter(agent => {
      // Check if agent has the capability in its metadata or content
      return (
        (agent.metadata.capabilities && 
         agent.metadata.capabilities.includes(capability)) ||
        agent.content.toLowerCase().includes(capability.toLowerCase())
      );
    });
  }
}

/**
 * Agent Runner - Executes agent tasks based on their definitions
 */
class AgentRunner {
  constructor(registry) {
    this.registry = registry;
  }

  /**
   * Run a task using the specified agent
   * @param {string} agentName - Name of the agent to use
   * @param {Object} taskParams - Parameters for the task
   * @returns {Promise<Object>} - Result of the agent's work
   */
  async runTask(agentName, taskParams) {
    const agent = this.registry.getAgent(agentName);
    if (!agent) {
      throw new Error(`Agent "${agentName}" not found`);
    }
    
    console.log(`Running task with agent: ${agentName}`);
    console.log(`Task parameters:`, taskParams);
    
    // Here you would implement the actual logic to have Claude Code
    // process the agent's markdown content and execute the task
    
    // For now, we'll just return a placeholder result
    return {
      agent: agentName,
      status: 'completed',
      result: `Task processed by ${agentName}`,
      timestamp: new Date().toISOString()
    };
  }
}

// Create and export the registry and runner
const registry = new AgentRegistry();
const runner = new AgentRunner(registry);

module.exports = {
  registry,
  runner,
  
  // Helper function to list all available agents
  listAgents: () => registry.getAgentNames(),
  
  // Helper function to run a task with an agent
  runAgentTask: (agentName, params) => runner.runTask(agentName, params)
};

// If this file is run directly, print the available agents
if (require.main === module) {
  console.log('Available agents:');
  console.log(registry.getAgentNames());
}
