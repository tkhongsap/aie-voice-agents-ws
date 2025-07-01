import * as dotenv from 'dotenv';
import * as path from 'path';
import * as readline from 'readline';

// Load .env from parent directory
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

import { Agent, run } from '@openai/agents';

// Define conversation context interface
interface ConversationContext {
  conversationHistory: string[];
}

const agent = new Agent<ConversationContext>({
  name: 'Assistant',
  instructions: (context) => {
    const baseInstructions = 'You are a helpful assistant that can have conversations with users. Be friendly and helpful.';
    
    if (!context.context?.conversationHistory || context.context.conversationHistory.length === 0) {
      return baseInstructions;
    }
    
    const recentHistory = context.context.conversationHistory.slice(-10).join('\n');
    return `${baseInstructions}\n\nPrevious conversation context:\n${recentHistory}`;
  },
  model: "gpt-4.1-nano"
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to handle the interactive chat
async function startChat() {
  console.log('🧠 Hello! I\'m your AI assistant. Type your message and press Enter.');
  console.log('💡 You can type "quit", "bye", or "exit" to end the conversation.\n');

  // Initialize conversation context
  const conversationContext: ConversationContext = {
    conversationHistory: []
  };

  const chatLoop = async (): Promise<void> => {
    return new Promise((resolve) => {
      rl.question('You: ', async (userInput) => {
        const trimmedInput = userInput.trim().toLowerCase();
        
        // Check for exit conditions
        if (trimmedInput === 'quit' || trimmedInput === 'bye' || trimmedInput === 'exit') {
          console.log('\n🧠 Goodbye! Have a great day!');
          rl.close();
          resolve();
          return;
        }

        // Skip empty inputs
        if (!userInput.trim()) {
          await chatLoop();
          resolve();
          return;
        }

        try {
          console.log('\n🧠 Thinking...');
          
          // Add user input to conversation history
          conversationContext.conversationHistory.push(`User: ${userInput.trim()}`);
          
          const result = await run(
            agent,
            userInput.trim(),
            { context: conversationContext }
          );

          // Add assistant response to conversation history
          conversationContext.conversationHistory.push(`Assistant: ${result.finalOutput}`);

          console.log(`\nAssistant: ${result.finalOutput}\n`);
          
          // Continue the chat loop
          await chatLoop();
          resolve();
        } catch (error) {
          console.error('\n❌ Sorry, there was an error processing your message:', error);
          console.log('Please try again.\n');
          
          // Continue the chat loop even after an error
          await chatLoop();
          resolve();
        }
      });
    });
  };

  await chatLoop();
}

// Start the interactive chat
startChat().catch((error) => {
  console.error('Failed to start chat:', error);
  process.exit(1);
});