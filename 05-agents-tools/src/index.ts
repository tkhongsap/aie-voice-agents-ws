/**
 * Main entry point for the 05-agents-tools project
 * Modular refactored version
 */

import 'dotenv/config';
import { config } from './config';
import { chatInterface } from './chat';

async function main() {
  console.log('🚀 Starting Developer Tools Agent...');
  console.log(`Environment: ${config.environment}`);
  
  try {
    // Validate configuration
    if (!config.openaiApiKey) {
      throw new Error('OPENAI_API_KEY is required. Please set it in your .env file.');
    }

    // Start the chat interface
    await chatInterface.start();
  } catch (error) {
    console.error('Failed to start agent:', error);
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