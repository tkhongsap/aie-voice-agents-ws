/**
 * Chat module exports
 * Provides chat interface and utilities for MCP agents
 */

// Export chat interface
export * from './chat-interface';

// Re-export common types for convenience
export type { 
  ChatMessage, 
  ChatSession 
} from '../types'; 