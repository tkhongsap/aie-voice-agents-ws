/**
 * Agent configuration for MCP servers
 * Provides configuration utilities for agents that use MCP servers
 */

import { AGENT_CONFIG, config } from '../config';
import type { 
  AgentConfig, 
  ModelSettings, 
  ConversationContext,
  ConfigValidationResult,
  MCPServerStatus,
  InstructionsContext
} from '../types';

/**
 * Extended agent configuration for MCP servers
 */
export interface MCPAgentConfig extends AgentConfig {
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  enableStreaming?: boolean;
  timeout?: number;
  mcpServers: {
    weather: boolean;
    airQuality: boolean;
    documentation: boolean;
  };
}

/**
 * MCP Agent configuration builder
 */
export class MCPAgentConfigBuilder {
  private config: MCPAgentConfig;

  constructor(baseConfig?: Partial<MCPAgentConfig>) {
    this.config = {
      model: AGENT_CONFIG.MODEL,
      temperature: AGENT_CONFIG.TEMPERATURE,
      toolChoice: AGENT_CONFIG.TOOL_CHOICE,
      maxConversationHistory: AGENT_CONFIG.MAX_CONVERSATION_HISTORY,
      enableStreaming: true,
      timeout: 30000,
      mcpServers: {
        weather: true,
        airQuality: true,
        documentation: true,
      },
      ...baseConfig,
    };
  }

  /**
   * Set the model
   */
  setModel(model: string): this {
    this.config.model = model;
    return this;
  }

  /**
   * Set the temperature
   */
  setTemperature(temperature: number): this {
    this.config.temperature = temperature;
    return this;
  }

  /**
   * Set the tool choice
   */
  setToolChoice(toolChoice: string): this {
    this.config.toolChoice = toolChoice;
    return this;
  }

  /**
   * Set max tokens
   */
  setMaxTokens(maxTokens: number): this {
    this.config.maxTokens = maxTokens;
    return this;
  }

  /**
   * Set conversation history limit
   */
  setMaxConversationHistory(maxHistory: number): this {
    this.config.maxConversationHistory = maxHistory;
    return this;
  }

  /**
   * Enable or disable streaming
   */
  setStreaming(enabled: boolean): this {
    this.config.enableStreaming = enabled;
    return this;
  }

  /**
   * Set timeout
   */
  setTimeout(timeout: number): this {
    this.config.timeout = timeout;
    return this;
  }

  /**
   * Set MCP server enablement
   */
  setMCPServers(servers: {
    weather?: boolean;
    airQuality?: boolean;
    documentation?: boolean;
  }): this {
    this.config.mcpServers = {
      ...this.config.mcpServers,
      ...servers,
    };
    return this;
  }

  /**
   * Enable specific MCP server
   */
  enableMCPServer(serverName: keyof MCPAgentConfig['mcpServers']): this {
    this.config.mcpServers[serverName] = true;
    return this;
  }

  /**
   * Disable specific MCP server
   */
  disableMCPServer(serverName: keyof MCPAgentConfig['mcpServers']): this {
    this.config.mcpServers[serverName] = false;
    return this;
  }

  /**
   * Set advanced parameters
   */
  setAdvancedParams(params: {
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];
  }): this {
    Object.assign(this.config, params);
    return this;
  }

  /**
   * Build the configuration
   */
  build(): MCPAgentConfig {
    return { ...this.config };
  }

  /**
   * Validate the configuration
   */
  validate(): ConfigValidationResult {
    const errors: string[] = [];

    if (!this.config.model) {
      errors.push('Model is required');
    }

    if (this.config.temperature !== undefined && 
        (this.config.temperature < 0 || this.config.temperature > 2)) {
      errors.push('Temperature must be between 0 and 2');
    }

    if (this.config.maxTokens !== undefined && this.config.maxTokens < 1) {
      errors.push('Max tokens must be positive');
    }

    if (this.config.maxConversationHistory !== undefined && this.config.maxConversationHistory < 0) {
      errors.push('Max conversation history must be non-negative');
    }

    if (this.config.timeout !== undefined && this.config.timeout < 1000) {
      errors.push('Timeout must be at least 1000ms');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Predefined MCP agent configurations
 */
export const mcpAgentConfigs = {
  /**
   * Default configuration with all MCP servers enabled
   */
  default: (): MCPAgentConfig => new MCPAgentConfigBuilder().build(),

  /**
   * Weather-focused configuration
   */
  weather: (): MCPAgentConfig => new MCPAgentConfigBuilder()
    .setMCPServers({ weather: true, airQuality: false, documentation: false })
    .setTemperature(0.3)
    .build(),

  /**
   * Air quality-focused configuration
   */
  airQuality: (): MCPAgentConfig => new MCPAgentConfigBuilder()
    .setMCPServers({ weather: false, airQuality: true, documentation: false })
    .setTemperature(0.3)
    .build(),

  /**
   * Documentation-focused configuration
   */
  documentation: (): MCPAgentConfig => new MCPAgentConfigBuilder()
    .setMCPServers({ weather: false, airQuality: false, documentation: true })
    .setTemperature(0.4)
    .build(),

  /**
   * Environmental data configuration (weather + air quality)
   */
  environmental: (): MCPAgentConfig => new MCPAgentConfigBuilder()
    .setMCPServers({ weather: true, airQuality: true, documentation: false })
    .setTemperature(0.35)
    .build(),

  /**
   * Performance-optimized configuration
   */
  performance: (): MCPAgentConfig => new MCPAgentConfigBuilder()
    .setTemperature(0.2)
    .setMaxTokens(1000)
    .setTimeout(15000)
    .build(),

  /**
   * Creative configuration
   */
  creative: (): MCPAgentConfig => new MCPAgentConfigBuilder()
    .setTemperature(0.8)
    .setMaxTokens(2000)
    .setAdvancedParams({
      topP: 0.9,
      frequencyPenalty: 0.5,
      presencePenalty: 0.3,
    })
    .build(),
};

/**
 * Configuration factory for different use cases
 */
export class MCPConfigFactory {
  /**
   * Create configuration for weather queries
   */
  static forWeather(): MCPAgentConfig {
    return mcpAgentConfigs.weather();
  }

  /**
   * Create configuration for air quality queries
   */
  static forAirQuality(): MCPAgentConfig {
    return mcpAgentConfigs.airQuality();
  }

  /**
   * Create configuration for documentation queries
   */
  static forDocumentation(): MCPAgentConfig {
    return mcpAgentConfigs.documentation();
  }

  /**
   * Create configuration for environmental data
   */
  static forEnvironmental(): MCPAgentConfig {
    return mcpAgentConfigs.environmental();
  }

  /**
   * Create configuration for general chat
   */
  static forChat(): MCPAgentConfig {
    return new MCPAgentConfigBuilder()
      .setTemperature(0.7)
      .setMaxTokens(1500)
      .build();
  }

  /**
   * Create configuration for debugging
   */
  static forDebugging(): MCPAgentConfig {
    return new MCPAgentConfigBuilder()
      .setTemperature(0.1)
      .setMaxTokens(2000)
      .enableMCPServer('weather')
      .enableMCPServer('airQuality')
      .enableMCPServer('documentation')
      .build();
  }
}

/**
 * Create environment-based configuration
 */
export const createEnvironmentConfig = (): MCPAgentConfig => {
  const builder = new MCPAgentConfigBuilder();

  // Adjust configuration based on environment
  if (config.environment === 'development') {
    builder
      .setTemperature(0.5)
      .setTimeout(45000)
      .setMaxTokens(2000);
  } else if (config.environment === 'production') {
    builder
      .setTemperature(0.3)
      .setTimeout(20000)
      .setMaxTokens(1500);
  }

  // Enable MCP servers based on available API keys
  builder.setMCPServers({
    weather: !!config.weatherApiKey,
    airQuality: !!config.airQualityApiKey,
    documentation: true, // Context7 doesn't require our API keys
  });

  return builder.build();
};

/**
 * Create instructions context from agent configuration
 */
export const createInstructionsContext = (
  agentConfig: MCPAgentConfig,
  serverStatuses: Record<string, MCPServerStatus>
): InstructionsContext => {
  return {
    capabilities: agentConfig.mcpServers,
    mcpServers: {
      weather: serverStatuses.weather || { name: 'Weather', connected: false },
      airQuality: serverStatuses.airQuality || { name: 'Air Quality', connected: false },
      context7: serverStatuses.context7 || { name: 'Context7', connected: false },
    },
  };
};

/**
 * Helper functions
 */
export const mcpConfigUtils = {
  /**
   * Create configuration from environment
   */
  createFromEnvironment(): MCPAgentConfig {
    return createEnvironmentConfig();
  },

  /**
   * Merge configurations
   */
  mergeConfigs(
    base: MCPAgentConfig, 
    override: Partial<MCPAgentConfig>
  ): MCPAgentConfig {
    return {
      ...base,
      ...override,
      mcpServers: {
        ...base.mcpServers,
        ...override.mcpServers,
      },
    };
  },

  /**
   * Create configuration builder
   */
  createBuilder(base?: Partial<MCPAgentConfig>): MCPAgentConfigBuilder {
    return new MCPAgentConfigBuilder(base);
  },

  /**
   * Validate configuration
   */
  validateConfig(config: MCPAgentConfig): ConfigValidationResult {
    const builder = new MCPAgentConfigBuilder(config);
    return builder.validate();
  },
};

/**
 * Export configuration instances
 */
export const defaultMCPConfig = mcpAgentConfigs.default();
export const environmentMCPConfig = createEnvironmentConfig(); 