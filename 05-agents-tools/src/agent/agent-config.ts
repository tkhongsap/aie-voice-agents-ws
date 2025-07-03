/**
 * Agent configuration utilities
 * Provides helper functions for creating and managing agent configurations
 */

import { AGENT_CONFIG, ENV_VARS, config } from '../config';
import type { 
  AgentConfig, 
  ModelSettings, 
  ConversationContext,
  ConfigValidationResult 
} from '../types';

/**
 * Extended agent configuration interface
 */
export interface ExtendedAgentConfig extends AgentConfig {
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  maxConversationHistory?: number;
  enableStreaming?: boolean;
  timeout?: number;
}

/**
 * Agent configuration builder
 */
export class AgentConfigBuilder {
  private config: ExtendedAgentConfig;

  constructor(baseConfig?: Partial<ExtendedAgentConfig>) {
    this.config = {
      model: AGENT_CONFIG.MODEL,
      temperature: AGENT_CONFIG.TEMPERATURE,
      toolChoice: AGENT_CONFIG.TOOL_CHOICE,
      maxConversationHistory: AGENT_CONFIG.MAX_CONVERSATION_HISTORY,
      enableStreaming: true,
      timeout: 30000,
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
  build(): ExtendedAgentConfig {
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
 * Predefined agent configurations
 */
export const agentConfigs = {
  /**
   * Default balanced configuration
   */
  default: (): ExtendedAgentConfig => new AgentConfigBuilder().build(),

  /**
   * High-performance configuration
   */
  performance: (): ExtendedAgentConfig => new AgentConfigBuilder()
    .setTemperature(0.3)
    .setMaxTokens(1000)
    .setTimeout(15000)
    .build(),

  /**
   * Creative configuration
   */
  creative: (): ExtendedAgentConfig => new AgentConfigBuilder()
    .setTemperature(0.8)
    .setMaxTokens(2000)
    .setAdvancedParams({
      topP: 0.9,
      frequencyPenalty: 0.5,
      presencePenalty: 0.3,
    })
    .build(),

  /**
   * Precise configuration
   */
  precise: (): ExtendedAgentConfig => new AgentConfigBuilder()
    .setTemperature(0.1)
    .setMaxTokens(1500)
    .setAdvancedParams({
      topP: 0.95,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
    })
    .build(),

  /**
   * Fast configuration
   */
  fast: (): ExtendedAgentConfig => new AgentConfigBuilder()
    .setTemperature(0.4)
    .setMaxTokens(500)
    .setTimeout(10000)
    .setMaxConversationHistory(5)
    .build(),

  /**
   * Comprehensive configuration
   */
  comprehensive: (): ExtendedAgentConfig => new AgentConfigBuilder()
    .setTemperature(0.6)
    .setMaxTokens(3000)
    .setTimeout(45000)
    .setMaxConversationHistory(20)
    .build(),
};

/**
 * Configuration factory for different use cases
 */
export class ConfigFactory {
  /**
   * Create weather-optimized configuration
   */
  static forWeather(): ExtendedAgentConfig {
    return new AgentConfigBuilder()
      .setTemperature(0.3)
      .setMaxTokens(800)
      .setMaxConversationHistory(5)
      .build();
  }

  /**
   * Create search-optimized configuration
   */
  static forSearch(): ExtendedAgentConfig {
    return new AgentConfigBuilder()
      .setTemperature(0.4)
      .setMaxTokens(1500)
      .setMaxConversationHistory(8)
      .setTimeout(25000)
      .build();
  }

  /**
   * Create documentation-optimized configuration
   */
  static forDocumentation(): ExtendedAgentConfig {
    return new AgentConfigBuilder()
      .setTemperature(0.2)
      .setMaxTokens(2000)
      .setMaxConversationHistory(10)
      .setTimeout(35000)
      .build();
  }

  /**
   * Create chat-optimized configuration
   */
  static forChat(): ExtendedAgentConfig {
    return new AgentConfigBuilder()
      .setTemperature(0.7)
      .setMaxTokens(1000)
      .setMaxConversationHistory(15)
      .build();
  }

  /**
   * Create debugging configuration
   */
  static forDebugging(): ExtendedAgentConfig {
    return new AgentConfigBuilder()
      .setTemperature(0.0)
      .setMaxTokens(2000)
      .setMaxConversationHistory(30)
      .setTimeout(60000)
      .setStreaming(false)
      .build();
  }
}

/**
 * Environment-based configuration
 */
export const createEnvironmentConfig = (): ExtendedAgentConfig => {
  const isDevelopment = config.environment === 'development';
  const isProduction = config.environment === 'production';

  const builder = new AgentConfigBuilder();

  if (isDevelopment) {
    // Development: More verbose, longer timeouts
    builder
      .setTemperature(0.5)
      .setMaxTokens(2000)
      .setTimeout(45000)
      .setMaxConversationHistory(20)
      .setStreaming(true);
  } else if (isProduction) {
    // Production: Optimized for performance
    builder
      .setTemperature(0.4)
      .setMaxTokens(1500)
      .setTimeout(25000)
      .setMaxConversationHistory(10)
      .setStreaming(true);
  } else {
    // Test or other environments: Conservative settings
    builder
      .setTemperature(0.3)
      .setMaxTokens(1000)
      .setTimeout(20000)
      .setMaxConversationHistory(5)
      .setStreaming(false);
  }

  return builder.build();
};

/**
 * Model-specific configurations
 */
export const modelConfigs = {
  'gpt-4.1-mini': (): ExtendedAgentConfig => new AgentConfigBuilder()
    .setModel('gpt-4.1-mini')
    .setTemperature(0.45)
    .setMaxTokens(1500)
    .build(),

  'gpt-4.1-nano': (): ExtendedAgentConfig => new AgentConfigBuilder()
    .setModel('gpt-4.1-nano')
    .setTemperature(0.4)
    .setMaxTokens(1000)
    .build(),

  'gpt-4o': (): ExtendedAgentConfig => new AgentConfigBuilder()
    .setModel('gpt-4o')
    .setTemperature(0.5)
    .setMaxTokens(2000)
    .build(),
};

/**
 * Conversation context utilities
 */
export const contextUtils = {
  /**
   * Create empty conversation context
   */
  createEmpty: (): ConversationContext => ({
    conversationHistory: [],
  }),

  /**
   * Create conversation context with initial history
   */
  createWithHistory: (history: string[]): ConversationContext => ({
    conversationHistory: [...history],
  }),

  /**
   * Truncate conversation history to fit within limits
   */
  truncateHistory: (
    context: ConversationContext, 
    maxItems: number = AGENT_CONFIG.MAX_CONVERSATION_HISTORY
  ): ConversationContext => ({
    conversationHistory: context.conversationHistory.slice(-maxItems),
  }),

  /**
   * Add message to conversation history
   */
  addMessage: (context: ConversationContext, message: string): ConversationContext => ({
    conversationHistory: [...context.conversationHistory, message],
  }),

  /**
   * Clear conversation history
   */
  clearHistory: (context: ConversationContext): ConversationContext => ({
    conversationHistory: [],
  }),

  /**
   * Get conversation summary
   */
  getSummary: (context: ConversationContext): string => {
    const history = context.conversationHistory;
    if (history.length === 0) return 'No conversation history';
    
    const messageCount = history.length;
    const lastMessage = history[history.length - 1];
    
    return `${messageCount} messages in history. Last: "${lastMessage.substring(0, 50)}${lastMessage.length > 50 ? '...' : ''}"`;
  },
};

/**
 * Configuration validation utilities
 */
export const configValidation = {
  /**
   * Validate agent configuration
   */
  validateAgentConfig: (config: ExtendedAgentConfig): ConfigValidationResult => {
    const builder = new AgentConfigBuilder(config);
    return builder.validate();
  },

  /**
   * Validate model settings
   */
  validateModelSettings: (settings: ModelSettings): ConfigValidationResult => {
    const errors: string[] = [];

    if (settings.temperature !== undefined && 
        (settings.temperature < 0 || settings.temperature > 2)) {
      errors.push('Temperature must be between 0 and 2');
    }

    if (settings.toolChoice && 
        !['auto', 'required', 'none'].includes(settings.toolChoice)) {
      errors.push('Tool choice must be "auto", "required", or "none"');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validate environment configuration
   */
  validateEnvironment: (): ConfigValidationResult => {
    const errors: string[] = [];

    if (!ENV_VARS.OPENAI_API_KEY) {
      errors.push('OPENAI_API_KEY is required');
    }

    if (!ENV_VARS.OPENWEATHER_API_KEY) {
      errors.push('OPENWEATHER_API_KEY is recommended for weather functionality');
    }

    return {
      isValid: errors.filter(e => e.includes('required')).length === 0,
      errors,
    };
  },
};

/**
 * Helper function to create a configuration from environment
 */
export const createConfigFromEnvironment = (): ExtendedAgentConfig => {
  return createEnvironmentConfig();
};

/**
 * Helper function to merge configurations
 */
export const mergeConfigs = (
  base: ExtendedAgentConfig, 
  override: Partial<ExtendedAgentConfig>
): ExtendedAgentConfig => {
  return { ...base, ...override };
};

/**
 * Helper function to create a configuration builder
 */
export const createConfigBuilder = (base?: Partial<ExtendedAgentConfig>): AgentConfigBuilder => {
  return new AgentConfigBuilder(base);
};