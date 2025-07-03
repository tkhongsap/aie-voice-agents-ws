/**
 * Configuration schemas
 * Zod schemas for validation of configuration and tool parameters
 */

import { z } from 'zod';

// Weather tool parameter schema
export const WeatherToolParametersSchema = z.object({
  location: z.string().describe('The city or location to get weather for (e.g., "New York", "London, UK", "Tokyo, Japan")'),
});

// Environment variables schema
export const EnvironmentSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  OPENWEATHER_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
});

// Agent configuration schema
export const AgentConfigSchema = z.object({
  model: z.string().default('gpt-4.1-mini'),
  temperature: z.number().min(0).max(2).default(0.45),
  toolChoice: z.enum(['auto', 'none', 'required']).default('auto'),
  maxConversationHistory: z.number().positive().default(10),
});

// Weather API configuration schema
export const WeatherConfigSchema = z.object({
  apiKey: z.string().optional(),
  baseUrl: z.string().url().default('https://api.openweathermap.org/data/2.5'),
  defaultUnits: z.enum(['metric', 'imperial', 'kelvin']).default('metric'),
});

// MCP server configuration schema
export const MCPServerConfigSchema = z.object({
  name: z.string(),
  fullCommand: z.string(),
});

// Application configuration schema
export const AppConfigSchema = z.object({
  openaiApiKey: z.string().min(1, 'OpenAI API key is required'),
  weatherApiKey: z.string().optional(),
  port: z.number().positive().default(3000),
  environment: z.enum(['development', 'production', 'test']).default('development'),
  agent: AgentConfigSchema,
  weather: WeatherConfigSchema,
});

// Conversation context schema
export const ConversationContextSchema = z.object({
  conversationHistory: z.array(z.string()).default([]),
});

// Weather API response schema
export const WeatherAPIResponseSchema = z.object({
  name: z.string(),
  sys: z.object({
    country: z.string(),
    sunrise: z.number(),
    sunset: z.number(),
  }),
  main: z.object({
    temp: z.number(),
    feels_like: z.number(),
    humidity: z.number(),
    pressure: z.number(),
  }),
  weather: z.array(z.object({
    description: z.string(),
  })),
  wind: z.object({
    speed: z.number(),
  }),
  clouds: z.object({
    all: z.number(),
  }),
  visibility: z.number().optional(),
});

// Weather tool response schema
export const WeatherToolResponseSchema = z.union([
  z.object({
    success: z.literal(true),
    data: z.object({
      location: z.string(),
      temperature: z.string(),
      description: z.string(),
      humidity: z.string(),
      windSpeed: z.string(),
      feelsLike: z.string(),
      pressure: z.string(),
      visibility: z.string(),
      cloudiness: z.string(),
      sunrise: z.string(),
      sunset: z.string(),
    }),
    summary: z.string(),
  }),
  z.object({
    error: z.string(),
    instructions: z.string().optional(),
    suggestion: z.string().optional(),
    details: z.string().optional(),
  }),
]);

// Query classification schema
export const QueryClassificationSchema = z.object({
  isWeatherQuery: z.boolean(),
  isSearchQuery: z.boolean(),
  isDocsQuery: z.boolean(),
  isGeneralChat: z.boolean(),
});

// Tool execution result schema
export const ToolExecutionResultSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Runner options schema
export const RunnerOptionsSchema = z.object({
  context: ConversationContextSchema,
  stream: z.boolean().optional().default(false),
  maxTurns: z.number().positive().optional(),
  timeout: z.number().positive().optional(),
});

// Model settings schema
export const ModelSettingsSchema = z.object({
  temperature: z.number().min(0).max(2).default(0.45),
  toolChoice: z.enum(['auto', 'none', 'required']).default('auto'),
  maxTokens: z.number().positive().optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
});

// Export type definitions based on schemas
export type WeatherToolParameters = z.infer<typeof WeatherToolParametersSchema>;
export type EnvironmentVariables = z.infer<typeof EnvironmentSchema>;
export type AgentConfig = z.infer<typeof AgentConfigSchema>;
export type WeatherConfig = z.infer<typeof WeatherConfigSchema>;
export type MCPServerConfig = z.infer<typeof MCPServerConfigSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
export type ConversationContext = z.infer<typeof ConversationContextSchema>;
export type WeatherAPIResponse = z.infer<typeof WeatherAPIResponseSchema>;
export type WeatherToolResponse = z.infer<typeof WeatherToolResponseSchema>;
export type QueryClassification = z.infer<typeof QueryClassificationSchema>;
export type ToolExecutionResult = z.infer<typeof ToolExecutionResultSchema>;
export type RunnerOptions = z.infer<typeof RunnerOptionsSchema>;
export type ModelSettings = z.infer<typeof ModelSettingsSchema>;