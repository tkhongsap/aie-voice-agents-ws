import * as dotenv from 'dotenv';
import * as path from 'path';
import * as readline from 'readline';

// Load .env from parent directory
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

import { Agent, run, webSearchTool } from '@openai/agents';

// Define conversation context interface
interface ConversationContext {
  conversationHistory: string[];
}

// Create search agent
const agent = new Agent<ConversationContext>({
  name: 'Search Assistant',
  instructions: (context) => {
    const baseInstructions = `You are a helpful search assistant that specializes in finding information for users.

WHEN TO USE WEB SEARCH:
- When users explicitly ask to "search", "find", "look up" information
- When users ask about current events, facts, or specific topics
- When users request information you don't have in your training data

WHEN NOT TO SEARCH:
- General conversation (e.g., "hello", "how are you", "what can you do", "what are your capabilities")
- Questions about your abilities or instructions
- Simple chat or requests for general advice
- When users say things like "tell me something" without asking for specific information

Examples of search queries:
- "Search for information about renewable energy"
- "What are the latest developments in AI?"
- "Find facts about the solar system"
- "Look up the history of the internet"

Examples of non-search queries:
- "What are your capabilities?"
- "Tell me something interesting"
- "How do you work?"
- "Hello, how are you?"

When you DO use search:
1. Use the webSearch tool to find relevant information
2. Summarize the key findings in a short, well-organized paragraph
3. Include the most important facts and insights
4. Keep responses concise and focused

For general conversation, respond naturally without using tools.`;

    if (!context.context?.conversationHistory || context.context.conversationHistory.length === 0) {
      return baseInstructions;
    }

    const recentHistory = context.context.conversationHistory.slice(-10).join('\n');
    return `${baseInstructions}\n\nPrevious conversation context:\n${recentHistory}`;
  },
  model: "gpt-4.1-mini",
  tools: [webSearchTool()],
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to handle the interactive chat
async function startChat() {
  console.log('🔍 Welcome to the Search Assistant!');
  console.log('💡 I can help you search for information on any topic.');
  console.log('');
  console.log('Just ask me anything, and I\'ll search the web to find relevant information');
  console.log('and provide you with a concise summary of what I find.');
  console.log('');
  console.log('💡 Type "quit", "bye", or "exit" to end the conversation.\n');

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
          console.log('\n🔍 Thanks for using the Search Assistant! Goodbye!');
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
          console.log('\n🧠 Processing...');
          
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