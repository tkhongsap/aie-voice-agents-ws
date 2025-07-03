/**
 * Agent factory module
 * Creates and configures different types of agents with tools and servers
 */

import { Agent, webSearchTool, Runner } from '@openai/agents';
import { AGENT_CONFIG } from '../config';
import { weatherTool } from '../tools';
import { context7Server } from '../servers';
import { buildInstructions, getInstructionBuilder } from './instructions';
import type { 
  ConversationContext, 
  InstructionsContext, 
  AgentConfig, 
  ModelSettings 
} from '../types';

/**
 * Agent creation options
 */
export interface AgentCreationOptions {
  name?: string;
  model?: string;
  modelSettings?: ModelSettings;
  enableWeather?: boolean;
  enableWebSearch?: boolean;
  enableDocumentation?: boolean;
  mcpServers?: Array<any>;
  instructionType?: 'default' | 'weather' | 'search' | 'documentation' | 'chat';
  customInstructions?: string;
}

/**
 * Default agent creation options
 */
export const DEFAULT_AGENT_OPTIONS: AgentCreationOptions = {
  name: 'Advanced Assistant with Tools & Documentation',
  model: AGENT_CONFIG.MODEL,
  modelSettings: {
    temperature: AGENT_CONFIG.TEMPERATURE,
    toolChoice: AGENT_CONFIG.TOOL_CHOICE,
  },
  enableWeather: true,
  enableWebSearch: true,
  enableDocumentation: true,
  mcpServers: [context7Server],
  instructionType: 'default',
};

/**
 * Create a fully-featured agent with all tools and capabilities
 */
export const createAdvancedAgent = (
  options: AgentCreationOptions = {}
): Agent<ConversationContext> => {
  const opts = { ...DEFAULT_AGENT_OPTIONS, ...options };
  
  // Build tools array based on enabled options
  const tools = [];
  
  if (opts.enableWebSearch) {
    tools.push(webSearchTool());
  }
  
  if (opts.enableWeather) {
    tools.push(weatherTool);
  }
  
  // Get instruction builder
  const instructionBuilder = getInstructionBuilder(opts.instructionType);
  
  return new Agent<ConversationContext>({
    name: opts.name,
    mcpServers: opts.enableDocumentation ? opts.mcpServers : [],
    instructions: (context: InstructionsContext) => {
      if (opts.customInstructions) {
        return opts.customInstructions;
      }
      return instructionBuilder(context);
    },
    model: opts.model,
    tools,
    modelSettings: opts.modelSettings,
  });
};

/**
 * Create a weather-focused agent
 */
export const createWeatherAgent = (
  options: Partial<AgentCreationOptions> = {}
): Agent<ConversationContext> => {
  return createAdvancedAgent({
    ...options,
    name: 'Weather Assistant',
    enableWeather: true,
    enableWebSearch: false,
    enableDocumentation: false,
    instructionType: 'weather',
  });
};

/**
 * Create a search-focused agent
 */
export const createSearchAgent = (
  options: Partial<AgentCreationOptions> = {}
): Agent<ConversationContext> => {
  return createAdvancedAgent({
    ...options,
    name: 'Search Assistant',
    enableWeather: false,
    enableWebSearch: true,
    enableDocumentation: false,
    instructionType: 'search',
  });
};

/**
 * Create a documentation-focused agent
 */
export const createDocumentationAgent = (
  options: Partial<AgentCreationOptions> = {}
): Agent<ConversationContext> => {
  return createAdvancedAgent({
    ...options,
    name: 'Documentation Assistant',
    enableWeather: false,
    enableWebSearch: false,
    enableDocumentation: true,
    instructionType: 'documentation',
  });
};

/**
 * Create a general chat agent (no tools)
 */
export const createChatAgent = (
  options: Partial<AgentCreationOptions> = {}
): Agent<ConversationContext> => {
  return createAdvancedAgent({
    ...options,
    name: 'Chat Assistant',
    enableWeather: false,
    enableWebSearch: false,
    enableDocumentation: false,
    instructionType: 'chat',
  });
};

/**
 * Create a custom agent with specific configuration
 */
export const createCustomAgent = (
  config: AgentConfig,
  tools: Array<any> = [],
  mcpServers: Array<any> = [],
  instructions?: string | ((context: InstructionsContext) => string)
): Agent<ConversationContext> => {
  return new Agent<ConversationContext>({
    name: 'Custom Agent',
    mcpServers,
    instructions: instructions || buildInstructions,
    model: config.model,
    tools,
    modelSettings: {
      temperature: config.temperature || AGENT_CONFIG.TEMPERATURE,
      toolChoice: config.toolChoice || AGENT_CONFIG.TOOL_CHOICE,
    },
  });
};

/**
 * Agent factory class for more complex agent creation scenarios
 */
export class AgentFactory {
  private defaultOptions: AgentCreationOptions;
  private runner: Runner;

  constructor(defaultOptions: AgentCreationOptions = DEFAULT_AGENT_OPTIONS) {
    this.defaultOptions = defaultOptions;
    this.runner = new Runner();
  }

  /**
   * Create an agent with specific options
   */
  create(options: AgentCreationOptions = {}): Agent<ConversationContext> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    return createAdvancedAgent(mergedOptions);
  }

  /**
   * Create a weather agent
   */
  createWeather(options: Partial<AgentCreationOptions> = {}): Agent<ConversationContext> {
    return createWeatherAgent(options);
  }

  /**
   * Create a search agent
   */
  createSearch(options: Partial<AgentCreationOptions> = {}): Agent<ConversationContext> {
    return createSearchAgent(options);
  }

  /**
   * Create a documentation agent
   */
  createDocumentation(options: Partial<AgentCreationOptions> = {}): Agent<ConversationContext> {
    return createDocumentationAgent(options);
  }

  /**
   * Create a chat agent
   */
  createChat(options: Partial<AgentCreationOptions> = {}): Agent<ConversationContext> {
    return createChatAgent(options);
  }

  /**
   * Create an agent based on query type
   */
  createForQuery(query: string, options: Partial<AgentCreationOptions> = {}): Agent<ConversationContext> {
    const lowerQuery = query.toLowerCase();
    
    // Determine agent type based on query
    if (/weather|temperature|hot|cold|rain|snow|sunny|cloudy|humid|wind|forecast/i.test(lowerQuery)) {
      return this.createWeather(options);
    }
    
    if (/search|find|look up|latest|news|information about/i.test(lowerQuery)) {
      return this.createSearch(options);
    }
    
    if (/documentation|docs|api|library|framework|react|nextjs|openai|langchain|anthropic|features|how to use/i.test(lowerQuery)) {
      return this.createDocumentation(options);
    }
    
    // Default to advanced agent with all tools
    return this.create(options);
  }

  /**
   * Get the runner instance
   */
  getRunner(): Runner {
    return this.runner;
  }

  /**
   * Update default options
   */
  setDefaultOptions(options: AgentCreationOptions): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  /**
   * Get current default options
   */
  getDefaultOptions(): AgentCreationOptions {
    return { ...this.defaultOptions };
  }
}

/**
 * Default agent factory instance
 */
export const agentFactory = new AgentFactory();

/**
 * Quick agent creation functions using the default factory
 */
export const agents = {
  /**
   * Create the default advanced agent
   */
  createAdvanced: (options?: AgentCreationOptions) => agentFactory.create(options),
  
  /**
   * Create a weather agent
   */
  createWeather: (options?: Partial<AgentCreationOptions>) => agentFactory.createWeather(options),
  
  /**
   * Create a search agent
   */
  createSearch: (options?: Partial<AgentCreationOptions>) => agentFactory.createSearch(options),
  
  /**
   * Create a documentation agent
   */
  createDocumentation: (options?: Partial<AgentCreationOptions>) => agentFactory.createDocumentation(options),
  
  /**
   * Create a chat agent
   */
  createChat: (options?: Partial<AgentCreationOptions>) => agentFactory.createChat(options),
  
  /**
   * Create an agent based on query
   */
  createForQuery: (query: string, options?: Partial<AgentCreationOptions>) => agentFactory.createForQuery(query, options),
};

/**
 * Helper function to create an agent with backward compatibility
 */
export const createAgent = (options: AgentCreationOptions = {}): Agent<ConversationContext> => {
  return agentFactory.create(options);
};

/**
 * Helper function to get a runner instance
 */
export const createRunner = (): Runner => {
  return new Runner();
};

/**
 * Create agent configuration from environment and options
 */
export const createAgentConfig = (overrides: Partial<AgentConfig> = {}): AgentConfig => {
  return {
    model: AGENT_CONFIG.MODEL,
    temperature: AGENT_CONFIG.TEMPERATURE,
    toolChoice: AGENT_CONFIG.TOOL_CHOICE,
    ...overrides,
  };
};

/**
 * Validate agent creation options
 */
export const validateAgentOptions = (options: AgentCreationOptions): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (options.model && typeof options.model !== 'string') {
    errors.push('Model must be a string');
  }
  
  if (options.modelSettings?.temperature !== undefined && 
      (typeof options.modelSettings.temperature !== 'number' || 
       options.modelSettings.temperature < 0 || 
       options.modelSettings.temperature > 2)) {
    errors.push('Temperature must be a number between 0 and 2');
  }
  
  if (options.name && typeof options.name !== 'string') {
    errors.push('Name must be a string');
  }
  
  if (options.instructionType && 
      !['default', 'weather', 'search', 'documentation', 'chat'].includes(options.instructionType)) {
    errors.push('Invalid instruction type');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Agent presets for common use cases
 */
export const agentPresets = {
  /**
   * Full-featured agent with all tools
   */
  full: (): Agent<ConversationContext> => createAdvancedAgent(),
  
  /**
   * Weather-only agent
   */
  weather: (): Agent<ConversationContext> => createWeatherAgent(),
  
  /**
   * Search-only agent
   */
  search: (): Agent<ConversationContext> => createSearchAgent(),
  
  /**
   * Documentation-only agent
   */
  docs: (): Agent<ConversationContext> => createDocumentationAgent(),
  
  /**
   * Chat-only agent (no tools)
   */
  chat: (): Agent<ConversationContext> => createChatAgent(),
  
  /**
   * High-performance agent with optimized settings
   */
  fast: (): Agent<ConversationContext> => createAdvancedAgent({
    modelSettings: {
      temperature: 0.3,
      toolChoice: 'auto',
    },
  }),
  
  /**
   * Creative agent with higher temperature
   */
  creative: (): Agent<ConversationContext> => createAdvancedAgent({
    modelSettings: {
      temperature: 0.8,
      toolChoice: 'auto',
    },
  }),
  
  /**
   * Minimal agent with basic functionality
   */
  minimal: (): Agent<ConversationContext> => createAdvancedAgent({
    enableWeather: false,
    enableWebSearch: false,
    enableDocumentation: false,
    instructionType: 'chat',
  }),
};