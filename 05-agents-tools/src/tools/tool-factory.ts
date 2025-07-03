/**
 * Tool factory pattern for creating and managing tools
 * Provides a centralized way to create, configure, and manage tools
 */

import { tool } from '@openai/agents';
import { z } from 'zod';
import { weatherTool, createWeatherTool } from './weather-tool';

/**
 * Tool registry for managing available tools
 */
export class ToolRegistry {
  private tools: Map<string, any> = new Map();
  private toolConfigs: Map<string, any> = new Map();

  /**
   * Register a tool
   */
  registerTool(name: string, toolInstance: any, config?: any): void {
    this.tools.set(name, toolInstance);
    if (config) {
      this.toolConfigs.set(name, config);
    }
  }

  /**
   * Get a tool by name
   */
  getTool(name: string): any {
    return this.tools.get(name);
  }

  /**
   * Get all registered tools
   */
  getAllTools(): any[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tool names
   */
  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Check if a tool is registered
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Remove a tool
   */
  removeTool(name: string): boolean {
    const removed = this.tools.delete(name);
    this.toolConfigs.delete(name);
    return removed;
  }

  /**
   * Get tool configuration
   */
  getToolConfig(name: string): any {
    return this.toolConfigs.get(name);
  }

  /**
   * Update tool configuration
   */
  updateToolConfig(name: string, config: any): void {
    this.toolConfigs.set(name, config);
  }
}

/**
 * Default tool registry instance
 */
export const defaultToolRegistry = new ToolRegistry();

/**
 * Tool factory for creating various types of tools
 */
export class ToolFactory {
  private registry: ToolRegistry;

  constructor(registry: ToolRegistry = defaultToolRegistry) {
    this.registry = registry;
  }

  /**
   * Create a weather tool
   */
  createWeatherTool(options?: {
    name?: string;
    description?: string;
    units?: 'metric' | 'imperial' | 'kelvin';
  }): any {
    const weatherToolInstance = createWeatherTool(options);
    const toolName = options?.name || 'weather_tool';
    this.registry.registerTool(toolName, weatherToolInstance, options);
    return weatherToolInstance;
  }

  /**
   * Create a generic tool with custom parameters
   */
  createGenericTool<T extends z.ZodSchema>(config: {
    name: string;
    description: string;
    parameters: T;
    execute: (params: z.infer<T>) => Promise<any>;
  }): any {
    const toolInstance = tool({
      name: config.name,
      description: config.description,
      parameters: config.parameters,
      execute: config.execute
    });
    
    this.registry.registerTool(config.name, toolInstance, config);
    return toolInstance;
  }

  /**
   * Create a simple text tool
   */
  createTextTool(config: {
    name: string;
    description: string;
    execute: (input: string) => Promise<string>;
  }): any {
    const textToolInstance = tool({
      name: config.name,
      description: config.description,
      parameters: z.object({
        input: z.string().describe('Input text for the tool')
      }),
      execute: async ({ input }: { input: string }) => {
        return await config.execute(input);
      }
    });

    this.registry.registerTool(config.name, textToolInstance, config);
    return textToolInstance;
  }

  /**
   * Create a validation tool
   */
  createValidationTool<T extends z.ZodSchema>(config: {
    name: string;
    description: string;
    schema: T;
    validate: (data: z.infer<T>) => Promise<{ valid: boolean; errors?: string[] }>;
  }): any {
    const validationToolInstance = tool({
      name: config.name,
      description: config.description,
      parameters: z.object({
        data: z.any().describe('Data to validate')
      }),
      execute: async ({ data }: { data: any }) => {
        try {
          const parsedData = config.schema.parse(data);
          const result = await config.validate(parsedData);
          return result;
        } catch (error: any) {
          return {
            valid: false,
            errors: error.errors || [error.message]
          };
        }
      }
    });

    this.registry.registerTool(config.name, validationToolInstance, config);
    return validationToolInstance;
  }

  /**
   * Create a batch of tools
   */
  createToolBatch(configs: Array<{
    name: string;
    description: string;
    parameters: z.ZodSchema;
    execute: (params: any) => Promise<any>;
  }>): any[] {
    return configs.map(config => this.createGenericTool(config));
  }

  /**
   * Get the tool registry
   */
  getRegistry(): ToolRegistry {
    return this.registry;
  }
}

/**
 * Default tool factory instance
 */
export const defaultToolFactory = new ToolFactory();

/**
 * Pre-configured tool creators
 */
export const toolCreators = {
  /**
   * Create a weather tool with default configuration
   */
  weather: () => {
    return defaultToolFactory.createWeatherTool();
  },

  /**
   * Create a custom weather tool
   */
  customWeather: (options: {
    name?: string;
    description?: string;
    units?: 'metric' | 'imperial' | 'kelvin';
  }) => {
    return defaultToolFactory.createWeatherTool(options);
  },

  /**
   * Create a text processing tool
   */
  textProcessor: (processor: (text: string) => Promise<string>) => {
    return defaultToolFactory.createTextTool({
      name: 'text_processor',
      description: 'Process text with custom logic',
      execute: processor
    });
  },

  /**
   * Create a data validator tool
   */
  dataValidator: <T extends z.ZodSchema>(schema: T, validator: (data: z.infer<T>) => Promise<{ valid: boolean; errors?: string[] }>) => {
    return defaultToolFactory.createValidationTool({
      name: 'data_validator',
      description: 'Validate data against schema',
      schema,
      validate: validator
    });
  }
};

/**
 * Initialize default tools
 */
export const initializeDefaultTools = (): void => {
  // Register the default weather tool
  defaultToolRegistry.registerTool('weather', weatherTool, {
    name: 'get_weather',
    description: 'Get current weather information for a specific city or location',
    units: 'metric'
  });
};

/**
 * Helper function to create a tool bundle
 */
export const createToolBundle = (toolNames: string[]): any[] => {
  return toolNames
    .map(name => defaultToolRegistry.getTool(name))
    .filter(tool => tool !== undefined);
};

/**
 * Export commonly used tools
 */
export const commonTools = {
  weather: weatherTool,
  // Add more common tools here as they are created
};

// Initialize default tools on module load
initializeDefaultTools();