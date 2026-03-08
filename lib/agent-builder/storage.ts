import { Agent, AgentBlock, AgentValidationResult } from '@/types/agent-builder';

const STORAGE_KEY = 'omeswap_agents';
const ACTIVE_AGENT_KEY = 'omeswap_active_agent';

export class AgentStorageManager {
  // Save all agents
  static saveAgents(agents: Agent[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
    } catch (error) {
      console.error('Error saving agents:', error);
    }
  }

  // Load all agents
  static loadAgents(): Agent[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading agents:', error);
      return [];
    }
  }

  // Save single agent
  static saveAgent(agent: Agent): void {
    const agents = this.loadAgents();
    const index = agents.findIndex(a => a.id === agent.id);
    
    if (index >= 0) {
      agents[index] = agent;
    } else {
      agents.push(agent);
    }
    
    this.saveAgents(agents);
  }

  // Load single agent
  static loadAgent(id: string): Agent | null {
    const agents = this.loadAgents();
    return agents.find(a => a.id === id) || null;
  }

  // Delete agent
  static deleteAgent(id: string): void {
    const agents = this.loadAgents();
    const filtered = agents.filter(a => a.id !== id);
    this.saveAgents(filtered);
  }

  // Set active agent
  static setActiveAgent(id: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACTIVE_AGENT_KEY, id);
  }

  // Get active agent
  static getActiveAgentId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACTIVE_AGENT_KEY);
  }

  // Clear all agents
  static clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_AGENT_KEY);
  }

  // Export agent as JSON
  static exportAgent(agent: Agent): string {
    return JSON.stringify(agent, null, 2);
  }

  // Import agent from JSON
  static importAgent(jsonString: string): Agent | null {
    try {
      const agent = JSON.parse(jsonString) as Agent;
      // Validate basic structure
      if (agent.id && agent.name && agent.blocks && agent.connections) {
        return agent;
      }
      return null;
    } catch (error) {
      console.error('Error importing agent:', error);
      return null;
    }
  }

  // Duplicate agent
  static duplicateAgent(agent: Agent): Agent {
    const newAgent: Agent = {
      ...agent,
      id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${agent.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: false,
      status: 'draft',
    };
    
    // Update block IDs
    const blockIdMap = new Map<string, string>();
    newAgent.blocks = agent.blocks.map(block => {
      const newBlockId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      blockIdMap.set(block.id, newBlockId);
      return { ...block, id: newBlockId };
    });
    
    // Update connections with new block IDs
    newAgent.connections = agent.connections.map(conn => ({
      ...conn,
      id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source: blockIdMap.get(conn.source) || conn.source,
      target: blockIdMap.get(conn.target) || conn.target,
    }));
    
    return newAgent;
  }
}

export class AgentValidator {
  static validate(agent: Agent): AgentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check if agent has blocks
    if (agent.blocks.length === 0) {
      errors.push('Agent must have at least one block');
      return { isValid: false, errors, warnings, suggestions };
    }

    // Check for trigger block
    const triggerBlocks = agent.blocks.filter(b => b.type === 'trigger');
    if (triggerBlocks.length === 0) {
      errors.push('Agent must have at least one trigger block');
    }

    // Check for orphaned blocks (not connected)
    const connectedBlockIds = new Set<string>();
    agent.connections.forEach(conn => {
      connectedBlockIds.add(conn.source);
      connectedBlockIds.add(conn.target);
    });

    const orphanedBlocks = agent.blocks.filter(
      block => !connectedBlockIds.has(block.id) && agent.blocks.length > 1
    );

    if (orphanedBlocks.length > 0) {
      warnings.push(`${orphanedBlocks.length} block(s) are not connected`);
    }

    // Validate each block
    agent.blocks.forEach(block => {
      const blockErrors = this.validateBlock(block);
      errors.push(...blockErrors.map(err => `${block.label}: ${err}`));
    });

    // Check for circular dependencies
    if (this.hasCircularDependency(agent)) {
      errors.push('Agent has circular dependencies in block connections');
    }

    // Suggestions
    if (agent.blocks.length === 1) {
      suggestions.push('Consider adding more blocks to create a complete trading strategy');
    }

    if (!agent.blocks.some(b => b.type === 'action')) {
      suggestions.push('Add action blocks to execute trades');
    }

    if (!agent.blocks.some(b => b.type === 'condition')) {
      suggestions.push('Add condition blocks to control flow logic');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  static validateBlock(block: AgentBlock): string[] {
    const errors: string[] = [];

    // Check required parameters
    block.parameters.forEach(param => {
      if (param.required && !param.value && param.value !== 0) {
        errors.push(`Parameter "${param.name}" is required`);
      }

      // Validate number ranges
      if (param.type === 'number' && param.value !== undefined) {
        if (param.min !== undefined && param.value < param.min) {
          errors.push(`Parameter "${param.name}" must be at least ${param.min}`);
        }
        if (param.max !== undefined && param.value > param.max) {
          errors.push(`Parameter "${param.name}" must be at most ${param.max}`);
        }
      }
    });

    return errors;
  }

  static hasCircularDependency(agent: Agent): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (blockId: string): boolean => {
      visited.add(blockId);
      recursionStack.add(blockId);

      // Get all connections from this block
      const outgoingConnections = agent.connections.filter(c => c.source === blockId);

      for (const conn of outgoingConnections) {
        if (!visited.has(conn.target)) {
          if (hasCycle(conn.target)) {
            return true;
          }
        } else if (recursionStack.has(conn.target)) {
          return true;
        }
      }

      recursionStack.delete(blockId);
      return false;
    };

    // Check from each block
    for (const block of agent.blocks) {
      if (!visited.has(block.id)) {
        if (hasCycle(block.id)) {
          return true;
        }
      }
    }

    return false;
  }
}

export const generateAgentId = (): string => {
  return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateBlockId = (): string => {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateConnectionId = (): string => {
  return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
