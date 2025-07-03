/**
 * Configuration module for 06-agents-mcps
 * Handles environment variables and MCP server settings
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from parent directory
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

// Environment variables
export const ENV_VARS = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
  AQICN_API_KEY: process.env.AQICN_API_KEY,
  CONTEXT7_API_KEY: process.env.CONTEXT7_API_KEY,
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '3000',
} as const;

// Agent configuration
export const AGENT_CONFIG = {
  MODEL: 'gpt-4.1-mini',
  TEMPERATURE: 0.45,
  TOOL_CHOICE: 'auto',
  MAX_CONVERSATION_HISTORY: 10,
} as const;

// MCP Server configurations
export const MCP_CONFIG = {
  CONTEXT7_SERVER: {
    name: 'Context7 Documentation Server',
    command: `npx -y @smithery/cli@latest run @upstash/context7-mcp --key ${ENV_VARS.CONTEXT7_API_KEY || 'your_context7_api_key_here'}`,
    url: 'https://context7.upstash.com',
  },
} as const;

// Application messages
export const APP_MESSAGES = {
  WELCOME: '🚀 Welcome to the Advanced Assistant with MCP Servers!',
  DESCRIPTION: '🌤️ I can help you with weather, air quality, and the latest documentation via MCP servers.',
  GOODBYE: '🚀 Thanks for using the MCP Assistant! Goodbye!',
  PROCESSING: '🧠 Processing...',
  THINKING: '💭 Thinking...',
  WEATHER_CHECKING: '🌤️ Checking weather via MCP server...',
  AIR_QUALITY_CHECKING: '🌬️ Checking air quality via MCP server...',
  DOCS_FETCHING: '📚 Fetching latest documentation via MCP server...',
  MCP_CONNECTED: '✅ MCP server connected successfully!',
  MCP_FAILED: '⚠️ MCP server connection failed:',
  MCP_LIMITED: '📚 Some features will be limited due to MCP server connectivity',
  QUIT_INSTRUCTIONS: '💡 Type "quit", "bye", or "exit" to end the conversation.\n',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  WEATHER_API_KEY_MISSING: 'Weather API key not configured. Please add OPENWEATHER_API_KEY to your .env file.',
  WEATHER_API_KEY_INSTRUCTIONS: 'Get a free API key from https://openweathermap.org/api',
  AIR_QUALITY_API_KEY_MISSING: 'Air Quality API key not configured. Please add AQICN_API_KEY to your .env file.',
  AIR_QUALITY_API_KEY_INSTRUCTIONS: 'Get a free API key from https://aqicn.org/api/',
  LOCATION_NOT_FOUND: 'Location not found. Please check the spelling and try again.',
  LOCATION_SUGGESTION: 'Try using a more specific location name, like "New York, NY" or "London, UK"',
  FETCH_ERROR: 'Unable to fetch data at this time.',
  MAX_TURNS_EXCEEDED: '⚠️ The agent reached the maximum number of turns.',
  MAX_TURNS_SUGGESTION: 'Try rephrasing your question or breaking it into smaller parts.\n',
  MODEL_BEHAVIOR_ERROR: '⚠️ The model exhibited unexpected behavior. Please try again.',
  GENERAL_ERROR: '❌ Sorry, there was an error processing your message:',
  CHAT_START_ERROR: 'Failed to start chat:',
} as const;

// Example queries
export const EXAMPLE_QUERIES = {
  WEATHER: [
    'What\'s the weather in New York?',
    'How hot is it in Tokyo today?',
    'Is it raining in London?',
  ],
  AIR_QUALITY: [
    'What\'s the air quality in Beijing?',
    'How\'s the air pollution in Delhi?',
    'Is the air quality good in San Francisco?',
  ],
  DOCS: [
    'What are the latest features in React?',
    'Show me OpenAI API documentation',
    'Get the latest LangChain docs',
    'What\'s new in Next.js?',
  ],
} as const;

// Main application configuration interface
export interface AppConfig {
  openaiApiKey: string;
  weatherApiKey: string | undefined;
  airQualityApiKey: string | undefined;
  context7ApiKey: string | undefined;
  port: number;
  environment: string;
  agent: {
    model: string;
    temperature: number;
    toolChoice: string;
    maxConversationHistory: number;
  };
  mcpServers: {
    context7: {
      name: string;
      command: string;
      url: string;
    };
  };
}

// Consolidated configuration object
export const config: AppConfig = {
  openaiApiKey: ENV_VARS.OPENAI_API_KEY || '',
  weatherApiKey: ENV_VARS.OPENWEATHER_API_KEY,
  airQualityApiKey: ENV_VARS.AQICN_API_KEY,
  context7ApiKey: ENV_VARS.CONTEXT7_API_KEY,
  port: parseInt(ENV_VARS.PORT, 10),
  environment: ENV_VARS.NODE_ENV,
  agent: {
    model: AGENT_CONFIG.MODEL,
    temperature: AGENT_CONFIG.TEMPERATURE,
    toolChoice: AGENT_CONFIG.TOOL_CHOICE,
    maxConversationHistory: AGENT_CONFIG.MAX_CONVERSATION_HISTORY,
  },
  mcpServers: {
    context7: MCP_CONFIG.CONTEXT7_SERVER,
  },
};

// Validation helper
export const validateConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!config.openaiApiKey) {
    errors.push('OPENAI_API_KEY is required');
  }
  
  if (!config.weatherApiKey) {
    errors.push('OPENWEATHER_API_KEY is recommended for weather functionality');
  }
  
  if (!config.airQualityApiKey) {
    errors.push('AQICN_API_KEY is recommended for air quality functionality');
  }
  
  if (!config.context7ApiKey) {
    errors.push('CONTEXT7_API_KEY is recommended for documentation functionality');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}; 