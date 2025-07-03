/**
 * Configuration module
 * Handles environment variables and application settings
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from parent directory
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

// Environment variables
export const ENV_VARS = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
  CONTEXT7_API_KEY: process.env.CONTEXT7_API_KEY,
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '3000',
} as const;

// Weather API configuration
export const WEATHER_CONFIG = {
  API_KEY: ENV_VARS.OPENWEATHER_API_KEY,
  BASE_URL: 'https://api.openweathermap.org/data/2.5',
  DEFAULT_UNITS: 'metric',
} as const;

// Agent configuration
export const AGENT_CONFIG = {
  MODEL: 'gpt-4.1-mini',
  TEMPERATURE: 0.45,
  TOOL_CHOICE: 'auto',
  MAX_CONVERSATION_HISTORY: 10,
} as const;

// MCP Server configuration (conditional based on API key availability)
export const getMcpConfig = () => {
  const config: any = {};
  
  if (ENV_VARS.CONTEXT7_API_KEY) {
    config.CONTEXT7_SERVER = {
      NAME: 'Context7 Documentation Server',
      COMMAND: `npx -y @smithery/cli@latest run @upstash/context7-mcp --key ${ENV_VARS.CONTEXT7_API_KEY}`
    };
  }
  
  return config;
};

// Legacy export for backward compatibility
export const MCP_CONFIG = getMcpConfig();

// Application messages
export const APP_MESSAGES = {
  WELCOME: '🚀 Welcome to the Advanced Assistant with Tools & Documentation!',
  DESCRIPTION: '🌤️ I can help you with weather, web searches, and the latest documentation.',
  GOODBYE: '🚀 Thanks for using the Advanced Assistant! Goodbye!',
  PROCESSING: '🧠 Processing...',
  THINKING: '💭 Thinking...',
  WEATHER_CHECKING: '🌤️ Checking weather information...',
  DOCS_FETCHING: '📚 Fetching latest documentation...',
  WEB_SEARCHING: '🔍 Searching the web...',
  MCP_CONNECTED: '📚 Context7 MCP server connected successfully!',
  MCP_FAILED: '⚠️ Context7 MCP server connection failed:',
  MCP_LIMITED: '📚 Documentation features will be limited to web search fallback',
  WEATHER_KEY_MISSING: '⚠️ Weather API Key Missing:',
  WEATHER_KEY_INSTRUCTIONS: '   Add OPENWEATHER_API_KEY to your .env file for weather functionality',
  WEATHER_KEY_URL: '   Get a free key at: https://openweathermap.org/api\n',
  QUIT_INSTRUCTIONS: '💡 Type "quit", "bye", or "exit" to end the conversation.\n',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  WEATHER_API_KEY_MISSING: 'Weather API key not configured. Please add OPENWEATHER_API_KEY to your .env file.',
  WEATHER_API_KEY_INSTRUCTIONS: 'Get a free API key from https://openweathermap.org/api',
  WEATHER_API_INVALID: 'Invalid Weather API key. Please check your OPENWEATHER_API_KEY in the .env file.',
  WEATHER_API_INVALID_INSTRUCTIONS: 'Make sure you have a valid API key from https://openweathermap.org/api',
  WEATHER_LOCATION_NOT_FOUND: 'Location not found. Please check the spelling and try again.',
  WEATHER_LOCATION_SUGGESTION: 'Try using a more specific location name, like "New York, NY" or "London, UK"',
  WEATHER_FETCH_ERROR: 'Unable to fetch weather data at this time.',
  MAX_TURNS_EXCEEDED: '⚠️ The agent reached the maximum number of turns. This might indicate a complex query or potential loop.',
  MAX_TURNS_SUGGESTION: 'Try rephrasing your question or breaking it into smaller parts.\n',
  MODEL_BEHAVIOR_ERROR: '⚠️ The model exhibited unexpected behavior. Please try again.',
  MODEL_BEHAVIOR_SUGGESTION: 'If this persists, try rephrasing your request.\n',
  GENERAL_ERROR: '❌ Sorry, there was an error processing your message:',
  GENERAL_SUGGESTION: 'Please try again.\n',
  CHAT_START_ERROR: 'Failed to start chat:',
} as const;

// Example queries
export const EXAMPLE_QUERIES = {
  WEATHER: [
    'What\'s the weather in New York?',
    'How hot is it in Tokyo today?',
    'Is it raining in London?',
  ],
  SEARCH: [
    'Search for the latest news about AI',
    'Find information about renewable energy',
  ],
  DOCS: [
    'What are the latest features in React?',
    'Show me OpenAI API documentation',
    'Get the latest LangChain docs',
    'What\'s new in Next.js?',
  ],
} as const;

// Tool descriptions
export const TOOL_DESCRIPTIONS = {
  WEATHER: '🌤️ Weather Tool - Get live weather data for any location',
  SEARCH: '🔍 Web Search - Search the internet for information',
  DOCS: '📚 Documentation Tool - Get latest docs via Context7 MCP',
  CHAT: '💬 General Chat - Have conversations without tools',
} as const;

// Main application configuration interface
export interface AppConfig {
  openaiApiKey: string;
  weatherApiKey: string | undefined;
  context7ApiKey: string | undefined;
  port: number;
  environment: string;
  agent: {
    model: string;
    temperature: number;
    toolChoice: string;
    maxConversationHistory: number;
  };
  weather: {
    apiKey: string | undefined;
    baseUrl: string;
    defaultUnits: string;
  };
}

// Consolidated configuration object
export const config: AppConfig = {
  openaiApiKey: ENV_VARS.OPENAI_API_KEY || '',
  weatherApiKey: ENV_VARS.OPENWEATHER_API_KEY,
  context7ApiKey: ENV_VARS.CONTEXT7_API_KEY,
  port: parseInt(ENV_VARS.PORT, 10),
  environment: ENV_VARS.NODE_ENV,
  agent: {
    model: AGENT_CONFIG.MODEL,
    temperature: AGENT_CONFIG.TEMPERATURE,
    toolChoice: AGENT_CONFIG.TOOL_CHOICE,
    maxConversationHistory: AGENT_CONFIG.MAX_CONVERSATION_HISTORY,
  },
  weather: {
    apiKey: WEATHER_CONFIG.API_KEY,
    baseUrl: WEATHER_CONFIG.BASE_URL,
    defaultUnits: WEATHER_CONFIG.DEFAULT_UNITS,
  },
};

// Validation helper
export const validateConfig = (): { 
  isValid: boolean; 
  errors: string[]; 
  warnings: string[] 
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required keys
  if (!config.openaiApiKey) {
    errors.push('OPENAI_API_KEY is required');
  }
  
  // Optional keys
  if (!config.weatherApiKey) {
    warnings.push('OPENWEATHER_API_KEY is recommended for weather functionality');
  }
  
  if (!config.context7ApiKey) {
    warnings.push('CONTEXT7_API_KEY is recommended for documentation functionality');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Re-export from other config modules
export * from './constants';
export * from './schemas';