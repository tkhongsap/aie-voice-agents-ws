/**
 * Chat interface for MCP agents
 * Provides interactive chat functionality with MCP server integration
 */

import * as readline from 'readline';
import { run } from '@openai/agents';
import { APP_MESSAGES, ERROR_MESSAGES, validateConfig } from '../config';
import { mcpAgentFactory } from '../agent';
import { mcpServerUtils } from '../servers';
import type { ConversationContext, ChatSession, MCPServerStatus } from '../types';

/**
 * Chat interface class
 */
export class MCPChatInterface {
  private rl: readline.Interface;
  private chatSession: ChatSession;
  private agent: any;
  private serverStatuses: Record<string, MCPServerStatus> = {};

  constructor() {
    this.chatSession = {
      id: `mcp-chat-${Date.now()}`,
      messages: [],
      startTime: new Date(),
      mcpServersConnected: [],
    };
  }

  private createReadlineInterface() {
    return readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Start the chat interface
   */
  async start(): Promise<void> {
    try {
      // Validate configuration
      const validation = validateConfig();
      if (!validation.isValid) {
        console.log('⚠️  Configuration warnings:');
        validation.errors.forEach(error => console.log(`   - ${error}`));
        console.log('   Some features may be limited.\n');
      }

      // Initialize MCP servers
      console.log('🔌 Initializing MCP servers...');
      const initResult = await mcpServerUtils.initializeAllServers();
      console.log('🔌 MCP server initialization completed.');
      
      this.serverStatuses = mcpServerUtils.getManager().getAllServerStatuses();
      this.chatSession.mcpServersConnected = initResult.connected;

      // Display initialization results
      if (initResult.connected.length > 0) {
        console.log(`✅ Connected MCP servers: ${initResult.connected.join(', ')}`);
      }
      
      if (initResult.failed.length > 0) {
        console.log(`❌ Failed MCP servers: ${initResult.failed.join(', ')}`);
        Object.entries(initResult.errors).forEach(([server, error]) => {
          console.log(`   ${server}: ${error}`);
        });
      }

      // Create agent AFTER MCP servers are initialized
      console.log('🤖 Creating agent...');
      this.agent = mcpAgentFactory.create({
        mcpServers: {
          weather: true,
          airQuality: true,
          documentation: initResult.connected.includes('context7'),
        },
      });
      console.log('🤖 Agent created successfully.');

      // Display welcome message
      console.log('\n' + APP_MESSAGES.WELCOME);
      console.log(APP_MESSAGES.DESCRIPTION);
      
      // Show available capabilities
      this.displayCapabilities();
      
      console.log(APP_MESSAGES.QUIT_INSTRUCTIONS);

      // Start chat loop
      console.log('💬 Starting chat loop...');
      this.rl = this.createReadlineInterface();
      await this.chatLoop();

    } catch (error: any) {
      console.error(ERROR_MESSAGES.CHAT_START_ERROR, error.message);
      throw error;
    }
  }

  /**
   * Main chat loop using recursive pattern (similar to 03-hello)
   */
  private async chatLoop(): Promise<void> {
    return new Promise((resolve) => {
      this.rl.question('You: ', async (userInput) => {
        const trimmedInput = userInput.trim().toLowerCase();
        
        // Check for exit conditions
        if (this.isQuitCommand(trimmedInput)) {
          console.log(APP_MESSAGES.GOODBYE);
          await this.cleanup();
          resolve();
          return;
        }

        // Skip empty inputs
        if (!userInput.trim()) {
          await this.chatLoop();
          resolve();
          return;
        }

        try {
          // Process user message
          await this.processUserMessage(userInput);
          
          // Recreate readline interface before continuing
          this.rl.close();
          this.rl = this.createReadlineInterface();
          
          // Continue the chat loop
          await this.chatLoop();
          resolve();
        } catch (error: any) {
          console.error('❌ Sorry, there was an error processing your message:', error.message);
          console.log('Please try again.\n');
          
          // Recreate readline interface before continuing
          this.rl.close();
          this.rl = this.createReadlineInterface();
          
          // Continue the chat loop even after an error
          await this.chatLoop();
          resolve();
        }
      });
    });
  }


  /**
   * Process user message
   */
  private async processUserMessage(message: string): Promise<void> {
    try {
      // Add user message to session
      this.chatSession.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
      });

             // Create conversation context
       const context: ConversationContext = {
         conversationId: this.chatSession.id,
         sessionId: this.chatSession.id,
         history: this.chatSession.messages,
         mcpServers: {
           context7: { name: 'Context7', command: 'context7-mcp-server', url: 'https://context7.upstash.com' },
         },
         capabilities: {
           weather: true, // Always available via direct tool
           airQuality: true, // Always available via direct tool
           documentation: this.serverStatuses.context7?.connected || false,
         },
       };

      // Show processing indicator
      console.log(APP_MESSAGES.PROCESSING);

      // Get agent response
      const result = await run(this.agent, message, { context });

      // Display response
      console.log('\nAssistant:', result.finalOutput);

      // Add assistant message to session
      this.chatSession.messages.push({
        role: 'assistant',
        content: result.finalOutput,
        timestamp: new Date(),
        metadata: {
          mcpServersUsed: this.chatSession.mcpServersConnected,
        },
      });

         } catch (error: any) {
       console.error(ERROR_MESSAGES.GENERAL_ERROR, error.message);
       console.log('Please try again.\n');
     }
  }

  /**
   * Check if input is a quit command
   */
  private isQuitCommand(input: string): boolean {
    const quitCommands = ['quit', 'exit', 'bye', 'goodbye'];
    return quitCommands.includes(input.toLowerCase().trim());
  }

  /**
   * Display available capabilities
   */
  private displayCapabilities(): void {
    console.log('\n🔧 Available Capabilities:');
    
    console.log('  🌤️  Weather data (via direct API integration)');
    console.log('  🌬️  Air quality data (via direct API integration)');
    
    if (this.serverStatuses.context7?.connected) {
      console.log('  📚 Documentation lookup (via Context7 MCP server)');
    }

    console.log('  💬 General conversation');
    
    console.log('');
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    try {
      // Close readline interface
      this.rl.close();

      // End chat session
      this.chatSession.endTime = new Date();

      // Disconnect MCP servers
      console.log('🔌 Disconnecting MCP servers...');
      const disconnectResult = await mcpServerUtils.disconnectAllServers();
      
      if (disconnectResult.disconnected.length > 0) {
        console.log(`✅ Disconnected: ${disconnectResult.disconnected.join(', ')}`);
      }
      
      if (disconnectResult.failed.length > 0) {
        console.log(`❌ Failed to disconnect: ${disconnectResult.failed.join(', ')}`);
      }

    } catch (error: any) {
      console.error('Error during cleanup:', error.message);
    }
  }

  /**
   * Get chat session information
   */
  getChatSession(): ChatSession {
    return { ...this.chatSession };
  }

  /**
   * Get server statuses
   */
  getServerStatuses(): Record<string, MCPServerStatus> {
    return { ...this.serverStatuses };
  }
}

/**
 * Create and start chat interface
 */
export const createChatInterface = (): MCPChatInterface => {
  return new MCPChatInterface();
};

/**
 * Default chat interface instance
 */
export const chatInterface = new MCPChatInterface();

/**
 * Chat utilities
 */
export const chatUtils = {
  /**
   * Create chat interface
   */
  create: createChatInterface,

  /**
   * Get default chat interface
   */
  getDefault(): MCPChatInterface {
    return chatInterface;
  },

  /**
   * Start chat with custom agent
   */
  async startWithAgent(agent: any): Promise<void> {
    const chat = new MCPChatInterface();
    (chat as any).agent = agent; // Set custom agent
    await chat.start();
  },

  /**
   * Format server status for display
   */
  formatServerStatus(status: MCPServerStatus): string {
    const icon = status.connected ? '✅' : '❌';
    const lastConnected = status.lastConnected 
      ? ` (last connected: ${status.lastConnected.toLocaleTimeString()})`
      : '';
    
    return `${icon} ${status.name}${lastConnected}`;
  },

  /**
   * Format all server statuses
   */
  formatAllServerStatuses(statuses: Record<string, MCPServerStatus>): string {
    return Object.values(statuses)
      .map(status => chatUtils.formatServerStatus(status))
      .join('\n');
  },
}; 