/**
 * Chat Loop Module
 * Handles the main conversation loop with user interaction
 */

import * as readline from 'readline';
import { ConversationContext, ChatLoopOptions } from '../types';
import { StreamingHandler } from './streaming-handler';
import { CLIInterface } from '../utils/cli-interface';
import { ErrorHandler } from '../utils/error-handler';
import { classifyQuery } from './query-classifier';
import { Runner } from '@openai/agents';
import type { Agent } from '@openai/agents';

export class ChatLoop {
  private rl: readline.Interface | null = null;
  private streamingHandler: StreamingHandler;
  private cliInterface: CLIInterface;
  private errorHandler: ErrorHandler;
  private runner: Runner;

  constructor(runner: Runner) {
    this.runner = runner;
    this.streamingHandler = new StreamingHandler();
    this.cliInterface = new CLIInterface();
    this.errorHandler = new ErrorHandler();
  }

  /**
   * Initialize readline interface
   */
  private initializeReadline(): void {
    if (!this.rl) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
    }
  }

  /**
   * Start the interactive chat loop
   */
  async start(agent: Agent<ConversationContext>, options: ChatLoopOptions): Promise<void> {
    const { conversationContext, exitCommands } = options;
    let shouldExit = false;

    // Initialize readline when starting the chat loop
    this.initializeReadline();

    while (!shouldExit) {
      await new Promise<void>((resolve) => {
        this.rl!.question('You: ', async (userInput) => {
          const trimmedInput = userInput.trim().toLowerCase();
          
          // Check for exit conditions
          if (exitCommands.includes(trimmedInput)) {
            this.cliInterface.showGoodbye();
            shouldExit = true;
            resolve();
            return;
          }

          // Skip empty inputs
          if (!userInput.trim()) {
            resolve();
            return;
          }

          try {
            // Process user input
            await this.processUserInput(agent, userInput, conversationContext);
          } catch (error) {
            this.errorHandler.handleError(error);
          }
          
          resolve();
        });
      });
    }
  }

  /**
   * Process a single user input
   */
  private async processUserInput(
    agent: Agent<ConversationContext>,
    userInput: string,
    conversationContext: ConversationContext
  ): Promise<void> {
    this.cliInterface.showProcessing();
    
    // Add user input to conversation history
    conversationContext.conversationHistory.push(`User: ${userInput.trim()}`);
    
    // Classify the query for better user feedback
    const queryType = classifyQuery(userInput);
    this.cliInterface.showQueryTypeIndicator(queryType);
    
    // Execute the agent with streaming
    const result = await this.runner.run(
      agent,
      userInput.trim(),
      { 
        context: conversationContext,
        stream: true
      }
    );

    // Stream the response
    console.log('\nAssistant: ');
    const responseText = await this.streamingHandler.streamResponse(result);
    console.log('\n');

    // Add assistant response to conversation history
    conversationContext.conversationHistory.push(`Assistant: ${responseText}`);
  }

  /**
   * Close the chat interface
   */
  close(): void {
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }
}