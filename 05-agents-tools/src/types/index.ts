/**
 * Type definitions module
 * Contains interfaces, types, and schemas used across the application
 */

// Conversation context interface
export interface ConversationContext {
  conversationHistory: string[];
}

// Weather API response types
export interface WeatherAPIResponse {
  name: string;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    description: string;
  }>;
  wind: {
    speed: number;
  };
  clouds: {
    all: number;
  };
  visibility?: number;
}

// Formatted weather data
export interface WeatherData {
  location: string;
  temperature: string;
  description: string;
  humidity: string;
  windSpeed: string;
  feelsLike: string;
  pressure: string;
  visibility: string;
  cloudiness: string;
  sunrise: string;
  sunset: string;
}

// Weather tool response types
export interface WeatherToolSuccess {
  success: true;
  data: WeatherData;
  summary: string;
}

export interface WeatherToolError {
  error: string;
  instructions?: string;
  suggestion?: string;
  details?: string;
}

export type WeatherToolResponse = WeatherToolSuccess | WeatherToolError;

// Tool parameter types
export interface WeatherToolParams {
  location: string;
}

// Generic tool result interface
export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Server information interface
export interface ServerInfo {
  name: string;
  port: number;
  status: 'running' | 'stopped' | 'error';
}

// Agent configuration interface
export interface AgentConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  toolChoice?: string;
}

// MCP Server configuration
export interface MCPServerConfig {
  name: string;
  fullCommand: string;
}

// Chat loop types
export interface ChatLoopOptions {
  conversationContext: ConversationContext;
  exitCommands: string[];
}

// Error types
export interface APIError {
  response?: {
    status: number;
    data: any;
  };
  message: string;
}

// Query classification types
export interface QueryClassification {
  isWeatherQuery: boolean;
  isSearchQuery: boolean;
  isDocsQuery: boolean;
  isGeneralChat: boolean;
}

// Agent instructions context
export interface InstructionsContext {
  context?: ConversationContext;
}

// Runner options
export interface RunnerOptions {
  context: ConversationContext;
  stream?: boolean;
}

// Stream result types
export interface StreamResult {
  toTextStream(): AsyncIterable<string>;
}

// Custom error types
export class MaxTurnsExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MaxTurnsExceededError';
  }
}

export class ModelBehaviorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModelBehaviorError';
  }
}

// Environment variable types
export interface EnvironmentVariables {
  OPENAI_API_KEY?: string;
  OPENWEATHER_API_KEY?: string;
  NODE_ENV?: string;
  PORT?: string;
}

// Configuration validation result
export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
}

// Tool execution context
export interface ToolExecutionContext {
  location: string;
  apiKey?: string;
  baseUrl: string;
}

// Chat state types
export type ChatState = 'idle' | 'processing' | 'waiting' | 'error';

// Exit conditions
export type ExitCondition = 'quit' | 'bye' | 'exit';

// Query types for classification
export type QueryType = 'weather' | 'search' | 'docs' | 'general';

// Tool types
export type ToolType = 'weather' | 'webSearch' | 'mcpTool';

// Response types
export type ResponseType = 'success' | 'error' | 'partial';

// Agent model settings
export interface ModelSettings {
  temperature: number;
  toolChoice: string;
}

// Re-export schema-based types from config
export type {
  WeatherToolParameters,
  EnvironmentVariables as EnvVars,
  AgentConfig as SchemaAgentConfig,
  WeatherConfig as SchemaWeatherConfig,
  MCPServerConfig as SchemaMCPServerConfig,
  AppConfig as SchemaAppConfig,
  ConversationContext as SchemaConversationContext,
  WeatherAPIResponse as SchemaWeatherAPIResponse,
  WeatherToolResponse as SchemaWeatherToolResponse,
  QueryClassification as SchemaQueryClassification,
  ToolExecutionResult as SchemaToolExecutionResult,
  RunnerOptions as SchemaRunnerOptions,
  ModelSettings as SchemaModelSettings,
} from '../config/schemas';