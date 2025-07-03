/**
 * Main entry point for the 06-agents-mcps project
 * MCP server-based AI assistant
 */

import 'dotenv/config';
import { config } from './config';
import { chatInterface } from './chat';

async function main() {
  console.log('🚀 Starting MCP Agents Assistant...');
  console.log(`Environment: ${config.environment}`);
  
  try {
    // Validate configuration
    if (!config.openaiApiKey) {
      throw new Error('OPENAI_API_KEY is required. Please set it in your .env file.');
    }

    // Display API key status
    console.log(`OpenAI API Key: ${config.openaiApiKey ? '✅ Configured' : '❌ Missing'}`);
    console.log(`Weather API Key: ${config.weatherApiKey ? '✅ Configured' : '⚠️  Missing (weather features limited)'}`);
    console.log(`Air Quality API Key: ${config.airQualityApiKey ? '✅ Configured' : '⚠️  Missing (air quality features limited)'}`);

    // Start the chat interface
    await chatInterface.start();
  } catch (error) {
    console.error('Failed to start MCP agents:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye!');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Goodbye!');
  process.exit(0);
});

// Start the application
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 