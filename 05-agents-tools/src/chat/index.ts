/**
 * Chat module
 * Handles chat interface and conversation management
 */

export { ChatLoop } from './chat-loop';
export { StreamingHandler } from './streaming-handler';
export { classifyQuery, getPrimaryQueryType, getQueryTypeDescription } from './query-classifier';
export { ChatInterface, chatInterface } from './chat-interface';

// Re-export types used by chat module
export type { 
  ConversationContext,
  ChatLoopOptions,
  QueryClassification,
  QueryType,
  StreamResult
} from '../types';