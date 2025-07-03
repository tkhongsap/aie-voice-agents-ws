/**
 * Main Chat Interface
 * Orchestrates the chat system with all components
 */

import { ConversationContext } from '../types';
import { ChatLoop } from './chat-loop';
import { CLIInterface } from '../utils/cli-interface';
import { createAgent } from '../agent';
import { context7Server } from '../servers';
import { Runner } from '@openai/agents';
import { config } from '../config';

export class ChatInterface {
  private cliInterface: CLIInterface;
  private chatLoop: ChatLoop;
  private runner: Runner;
  private conversationContext: ConversationContext;

  constructor() {
    this.cliInterface = new CLIInterface();
    this.runner = new Runner();
    this.chatLoop = new ChatLoop(this.runner);
    this.conversationContext = {
      conversationHistory: []
    };
  }

  /**
   * Start the chat interface
   */
  async start(): Promise<void> {
    // Initialize MCP server
    const isMCPConnected = await this.initializeMCPServer();
    
    // Show welcome message
    this.cliInterface.showWelcome(!!config.weatherApiKey, isMCPConnected);
    
    // Create the agent
    const agent = createAgent();
    
    // Start the chat loop
    await this.chatLoop.start(agent, {
      conversationContext: this.conversationContext,
      exitCommands: ['quit', 'bye', 'exit']
    });
    
    // Cleanup
    await this.cleanup();
  }

  /**
   * Initialize MCP server connection
   */
  private async initializeMCPServer(): Promise<boolean> {
    try {
      await context7Server.connect();
      this.cliInterface.showMCPConnectionStatus(true);
      return true;
    } catch (error: any) {
      this.cliInterface.showMCPConnectionStatus(false, error.message);
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    try {
      // Close chat loop
      this.chatLoop.close();
      
      // Disconnect MCP server if connected
      if (context7Server) {
        await context7Server.disconnect?.();
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): string[] {
    return this.conversationContext.conversationHistory;
  }

  /**
   * Clear conversation history
   */
  clearConversationHistory(): void {
    this.conversationContext.conversationHistory = [];
  }

  /**
   * Add to conversation history
   */
  addToHistory(role: string, content: string): void {
    this.conversationContext.conversationHistory.push(`${role}: ${content}`);
  }
}

// Export singleton instance
export const chatInterface = new ChatInterface();