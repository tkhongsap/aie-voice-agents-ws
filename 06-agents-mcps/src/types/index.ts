/**
 * Type definitions for the 06-agents-mcps component
 */

import type { Agent } from '@openai/agents';

// MCP Server configuration interface
export interface MCPServerConfig {
  name: string;
  command: string;
  url?: string;
  options?: Record<string, any>;
}

// Conversation context interface
export interface ConversationContext {
  conversationId: string;
  userId?: string;
  sessionId?: string;
  history: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>;
  mcpServers: {
    weather: MCPServerConfig;
    context7: MCPServerConfig;
    airQuality: MCPServerConfig;
  };
  capabilities: {
    weather: boolean;
    airQuality: boolean;
    documentation: boolean;
  };
}

// Agent configuration interface
export interface AgentConfig {
  model: string;
  temperature: number;
  toolChoice: string;
  maxConversationHistory: number;
}

// Model settings interface
export interface ModelSettings {
  temperature: number;
  toolChoice: string;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

// MCP Server status interface
export interface MCPServerStatus {
  name: string;
  connected: boolean;
  lastConnected?: Date;
  lastError?: string;
  capabilities?: string[];
}

// Instructions context interface
export interface InstructionsContext {
  capabilities: {
    weather: boolean;
    airQuality: boolean;
    documentation: boolean;
  };
  mcpServers: {
    weather: MCPServerStatus;
    context7: MCPServerStatus;
    airQuality: MCPServerStatus;
  };
  userQuery?: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
}

// Chat interface types
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    mcpServersUsed?: string[];
    processingTime?: number;
    tokens?: number;
  };
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  startTime: Date;
  endTime?: Date;
  mcpServersConnected: string[];
}

// Error handling types
export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface MCPServerError {
  serverName: string;
  errorType: 'connection' | 'execution' | 'timeout' | 'unknown';
  message: string;
  timestamp: Date;
  details?: any;
}

// Weather data types
export interface WeatherData {
  location: string;
  temperature: number;
  temperatureUnit: string;
  description: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  cloudiness: number;
  feelsLike: number;
  sunrise: string;
  sunset: string;
  timestamp: Date;
}

// Air quality data types
export interface AirQualityData {
  location: string;
  aqi: number;
  level: string;
  dominentPollutant: string;
  pollutants: {
    pm25?: number;
    pm10?: number;
    no2?: number;
    so2?: number;
    co?: number;
    o3?: number;
  };
  timestamp: Date;
  healthImplications: string;
}

// Documentation data types
export interface DocumentationData {
  libraryName: string;
  version: string;
  title: string;
  content: string;
  url: string;
  lastUpdated: Date;
  sections: Array<{
    title: string;
    content: string;
    url: string;
  }>;
}

// MCP Server management types
export interface MCPServerManager {
  servers: Map<string, MCPServerConfig>;
  statuses: Map<string, MCPServerStatus>;
  connect(serverName: string): Promise<boolean>;
  disconnect(serverName: string): Promise<boolean>;
  getStatus(serverName: string): MCPServerStatus | undefined;
  getAllStatuses(): MCPServerStatus[];
  isConnected(serverName: string): boolean;
}

// Query classification types
export type QueryType = 'weather' | 'air_quality' | 'documentation' | 'general';

export interface QueryClassification {
  type: QueryType;
  confidence: number;
  location?: string;
  libraryName?: string;
  additionalContext?: Record<string, any>;
}

// Stream handling types
export interface StreamingEvent {
  type: 'start' | 'progress' | 'data' | 'end' | 'error';
  data?: any;
  serverName?: string;
  timestamp: Date;
}

export interface StreamingHandler {
  onStart: (event: StreamingEvent) => void;
  onProgress: (event: StreamingEvent) => void;
  onData: (event: StreamingEvent) => void;
  onEnd: (event: StreamingEvent) => void;
  onError: (event: StreamingEvent) => void;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type MCPServerName = 'weather' | 'context7' | 'airQuality';

// Agent factory types
export type AgentType = Agent<ConversationContext>; 