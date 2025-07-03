/**
 * Agent module
 * Contains the main agent configuration, instructions, and factory functions
 */

// Export all instruction builders and utilities
export * from './instructions';

// Export all agent factory functions and utilities
export * from './agent-factory';

// Export all agent configuration utilities
export * from './agent-config';

// Re-export commonly used functions for backward compatibility
export { 
  createAdvancedAgent as createAgent,
  createRunner,
  agentFactory,
  agents,
  agentPresets,
} from './agent-factory';

export {
  buildInstructions as getAgentInstructions,
  buildContextAwareInstructions,
  getInstructionBuilder,
} from './instructions';

export {
  AgentConfigBuilder,
  ConfigFactory,
  agentConfigs,
  contextUtils,
  configValidation,
} from './agent-config';

// Export types for agent configuration
export type { 
  AgentCreationOptions,
} from './agent-factory';

export type {
  ExtendedAgentConfig,
} from './agent-config';