/**
 * Agent factory for MCP servers
 * Creates and configures agents with MCP server integrations
 */

import { Agent, Runner } from '@openai/agents';
import { buildInstructions, getInstructionBuilder } from './instructions';
import { createInstructionsContext, mcpConfigUtils, type MCPAgentConfig } from './agent-config';
import { mcpServerManager, context7Server } from '../servers';
import { isContext7ServerConnected } from '../servers/context7-mcp-server';
import { getToolsForCapabilities } from '../tools';
import type { 
  ConversationContext, 
  InstructionsContext, 
  ModelSettings,
  MCPServerStatus
} from '../types';

/**
 * MCP Agent creation options
 */
export interface MCPAgentCreationOptions {
  name?: string;
  model?: string;
  modelSettings?: ModelSettings;
  mcpServers?: {
    weather?: boolean;
    airQuality?: boolean;
    documentation?: boolean;
  };
  instructionType?: 'default' | 'weather' | 'airQuality' | 'documentation' | 'environmental' | 'chat';
  customInstructions?: string;
  agentConfig?: MCPAgentConfig;
}

/**
 * Default MCP agent creation options
 */
export const DEFAULT_MCP_AGENT_OPTIONS: MCPAgentCreationOptions = {
  name: 'Advanced MCP Assistant',
  mcpServers: {
    weather: true,
    airQuality: true,
    documentation: true,
  },
  instructionType: 'default',
};

/**
 * Create an agent with MCP servers
 */
export const createMCPAgent = (
  options: MCPAgentCreationOptions = {}
): Agent<ConversationContext> => {
  const opts = { ...DEFAULT_MCP_AGENT_OPTIONS, ...options };
  
  // Use provided config or create from environment
  const agentConfig = opts.agentConfig || mcpConfigUtils.createFromEnvironment();
  
  // Determine which MCP servers to include
  const enabledServers = {
    weather: opts.mcpServers?.weather ?? agentConfig.mcpServers.weather,
    airQuality: opts.mcpServers?.airQuality ?? agentConfig.mcpServers.airQuality,
    documentation: opts.mcpServers?.documentation ?? agentConfig.mcpServers.documentation,
  };
  
  const mcpServers = [];
  
  // Add Context7 server if documentation is enabled and server is connected
  if (enabledServers.documentation && isContext7ServerConnected()) {
    mcpServers.push(context7Server);
  }
  
  // Get tools for enabled capabilities
  const tools = getToolsForCapabilities(enabledServers);
  
  // Get instruction builder
  const instructionBuilder = getInstructionBuilder(opts.instructionType);
  
  return new Agent<ConversationContext>({
    name: opts.name || 'MCP Agent',
    mcpServers,
    instructions: () => {
      if (opts.customInstructions) {
        return opts.customInstructions;
      }
      
      // Get current server statuses
      const serverStatuses = mcpServerManager.getAllServerStatuses();
      
      // Create instructions context
      const instructionsContext: InstructionsContext = {
        capabilities: enabledServers,
        mcpServers: {
          weather: { name: 'Weather Direct Tool', connected: enabledServers.weather || false },
          airQuality: { name: 'Air Quality Direct Tool', connected: enabledServers.airQuality || false },
          context7: serverStatuses.context7 || { name: 'Context7 MCP Server', connected: false },
        },
      };
      
      return instructionBuilder(instructionsContext);
    },
    model: opts.model || agentConfig.model,
    tools: tools, // Include direct service tools
    modelSettings: {
      temperature: agentConfig.temperature,
      toolChoice: agentConfig.toolChoice,
      ...(opts.modelSettings || {}),
    },
  });
};

/**
 * Create a weather-focused MCP agent
 */
export const createWeatherMCPAgent = (
  options: Partial<MCPAgentCreationOptions> = {}
): Agent<ConversationContext> => {
  return createMCPAgent({
    ...options,
    name: 'Weather MCP Assistant',
    mcpServers: { weather: true, airQuality: false, documentation: false },
    instructionType: 'weather',
  });
};

/**
 * Create an air quality-focused MCP agent
 */
export const createAirQualityMCPAgent = (
  options: Partial<MCPAgentCreationOptions> = {}
): Agent<ConversationContext> => {
  return createMCPAgent({
    ...options,
    name: 'Air Quality MCP Assistant',
    mcpServers: { weather: false, airQuality: true, documentation: false },
    instructionType: 'airQuality',
  });
};

/**
 * Create a documentation-focused MCP agent
 */
export const createDocumentationMCPAgent = (
  options: Partial<MCPAgentCreationOptions> = {}
): Agent<ConversationContext> => {
  return createMCPAgent({
    ...options,
    name: 'Documentation MCP Assistant',
    mcpServers: { weather: false, airQuality: false, documentation: true },
    instructionType: 'documentation',
  });
};

/**
 * Create an environmental data MCP agent (weather + air quality)
 */
export const createEnvironmentalMCPAgent = (
  options: Partial<MCPAgentCreationOptions> = {}
): Agent<ConversationContext> => {
  return createMCPAgent({
    ...options,
    name: 'Environmental Data MCP Assistant',
    mcpServers: { weather: true, airQuality: true, documentation: false },
    instructionType: 'environmental',
  });
};

/**
 * Create a general chat MCP agent (no specialized servers)
 */
export const createChatMCPAgent = (
  options: Partial<MCPAgentCreationOptions> = {}
): Agent<ConversationContext> => {
  return createMCPAgent({
    ...options,
    name: 'Chat MCP Assistant',
    mcpServers: { weather: false, airQuality: false, documentation: false },
    instructionType: 'chat',
  });
};

/**
 * MCP Agent factory class for advanced agent creation scenarios
 */
export class MCPAgentFactory {
  private defaultOptions: MCPAgentCreationOptions;
  private runner: Runner;

  constructor(defaultOptions: MCPAgentCreationOptions = DEFAULT_MCP_AGENT_OPTIONS) {
    this.defaultOptions = defaultOptions;
    this.runner = new Runner();
  }

  /**
   * Create an agent with specific options
   */
  create(options: MCPAgentCreationOptions = {}): Agent<ConversationContext> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    return createMCPAgent(mergedOptions);
  }

  /**
   * Create a weather agent
   */
  createWeather(options: Partial<MCPAgentCreationOptions> = {}): Agent<ConversationContext> {
    return createWeatherMCPAgent(options);
  }

  /**
   * Create an air quality agent
   */
  createAirQuality(options: Partial<MCPAgentCreationOptions> = {}): Agent<ConversationContext> {
    return createAirQualityMCPAgent(options);
  }

  /**
   * Create a documentation agent
   */
  createDocumentation(options: Partial<MCPAgentCreationOptions> = {}): Agent<ConversationContext> {
    return createDocumentationMCPAgent(options);
  }

  /**
   * Create an environmental data agent
   */
  createEnvironmental(options: Partial<MCPAgentCreationOptions> = {}): Agent<ConversationContext> {
    return createEnvironmentalMCPAgent(options);
  }

  /**
   * Create a chat agent
   */
  createChat(options: Partial<MCPAgentCreationOptions> = {}): Agent<ConversationContext> {
    return createChatMCPAgent(options);
  }

  /**
   * Create agent based on query analysis
   */
  createForQuery(
    query: string, 
    options: Partial<MCPAgentCreationOptions> = {}
  ): Agent<ConversationContext> {
    // Simple query classification
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('weather') || lowerQuery.includes('temperature') || 
        lowerQuery.includes('rain') || lowerQuery.includes('sunny')) {
      return this.createWeather(options);
    }
    
    if (lowerQuery.includes('air quality') || lowerQuery.includes('pollution') || 
        lowerQuery.includes('aqi') || lowerQuery.includes('smog')) {
      return this.createAirQuality(options);
    }
    
    if (lowerQuery.includes('documentation') || lowerQuery.includes('docs') || 
        lowerQuery.includes('api') || lowerQuery.includes('library')) {
      return this.createDocumentation(options);
    }
    
    if ((lowerQuery.includes('weather') || lowerQuery.includes('air')) && 
        (lowerQuery.includes('outdoor') || lowerQuery.includes('environment'))) {
      return this.createEnvironmental(options);
    }
    
    // Default to full-featured agent
    return this.create(options);
  }

  /**
   * Get the runner instance
   */
  getRunner(): Runner {
    return this.runner;
  }

  /**
   * Set default options
   */
  setDefaultOptions(options: MCPAgentCreationOptions): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  /**
   * Get current default options
   */
  getDefaultOptions(): MCPAgentCreationOptions {
    return { ...this.defaultOptions };
  }

  /**
   * Initialize MCP servers
   */
  async initializeMCPServers(): Promise<{
    connected: string[];
    failed: string[];
    errors: Record<string, string>;
  }> {
    return await mcpServerManager.initializeAll();
  }

  /**
   * Disconnect MCP servers
   */
  async disconnectMCPServers(): Promise<{
    disconnected: string[];
    failed: string[];
    errors: Record<string, string>;
  }> {
    return await mcpServerManager.disconnectAll();
  }

  /**
   * Get MCP server statuses
   */
  getMCPServerStatuses(): Record<string, MCPServerStatus> {
    return mcpServerManager.getAllServerStatuses();
  }

  /**
   * Check if specific MCP server is connected
   */
  isMCPServerConnected(serverName: string): boolean {
    return mcpServerManager.isServerConnected(serverName);
  }
}

/**
 * Default MCP agent factory instance
 */
export const mcpAgentFactory = new MCPAgentFactory();

/**
 * Convenience functions for creating agents
 */
export const createAgent = (options: MCPAgentCreationOptions = {}): Agent<ConversationContext> => {
  return createMCPAgent(options);
};

export const createRunner = (): Runner => {
  return new Runner();
};

/**
 * Create agent configuration from options
 */
export const createAgentConfig = (overrides: Partial<MCPAgentConfig> = {}): MCPAgentConfig => {
  const baseConfig = mcpConfigUtils.createFromEnvironment();
  return mcpConfigUtils.mergeConfigs(baseConfig, overrides);
};

/**
 * Validate agent options
 */
export const validateAgentOptions = (options: MCPAgentCreationOptions): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];

  if (options.model && typeof options.model !== 'string') {
    errors.push('Model must be a string');
  }

  if (options.name && typeof options.name !== 'string') {
    errors.push('Name must be a string');
  }

  if (options.modelSettings) {
    if (options.modelSettings.temperature !== undefined && 
        (options.modelSettings.temperature < 0 || options.modelSettings.temperature > 2)) {
      errors.push('Temperature must be between 0 and 2');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * MCP Agent utilities
 */
export const mcpAgentUtils = {
  factory: mcpAgentFactory,
  createAgent,
  createRunner,
  createAgentConfig,
  validateAgentOptions,
  
  // Specialized agent creators
  weather: createWeatherMCPAgent,
  airQuality: createAirQualityMCPAgent,
  documentation: createDocumentationMCPAgent,
  environmental: createEnvironmentalMCPAgent,
  chat: createChatMCPAgent,
  
  // Factory class
  Factory: MCPAgentFactory,
}; 