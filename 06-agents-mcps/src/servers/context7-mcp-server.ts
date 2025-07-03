/**
 * Context7 MCP Server
 * Provides documentation lookup via Context7 MCP server using Smithery CLI
 * Simplified implementation to avoid duplicate connections
 */

import { MCPServerStdio } from '@openai/agents';
import { config, APP_MESSAGES } from '../config';

/**
 * Context7 MCP server configuration
 */
export const context7ServerConfig = {
  name: config.mcpServers.context7.name,
  command: config.mcpServers.context7.command,
  url: config.mcpServers.context7.url,
};

/**
 * Create and export the Context7 server instance
 * This is the single source of truth for the Context7 MCP server
 */
export const context7Server = new MCPServerStdio({
  name: context7ServerConfig.name,
  fullCommand: context7ServerConfig.command,
});

/**
 * Server status tracking
 */
let serverStatus = {
  connected: false,
  lastConnected: null as Date | null,
  lastError: null as string | null,
};

/**
 * Initialize and connect the Context7 server
 */
export const initializeContext7Server = async (): Promise<{
  server: MCPServerStdio;
  connected: boolean;
  error?: string;
}> => {
  try {
    // Only connect if not already connected
    if (!serverStatus.connected) {
      await context7Server.connect();
      serverStatus.connected = true;
      serverStatus.lastConnected = new Date();
      serverStatus.lastError = null;
      console.log(`${APP_MESSAGES.MCP_CONNECTED} ${context7ServerConfig.name}`);
    }
    
    return { 
      server: context7Server, 
      connected: true 
    };
  } catch (error: any) {
    serverStatus.connected = false;
    serverStatus.lastError = error.message;
    console.error(`${APP_MESSAGES.MCP_FAILED} ${context7ServerConfig.name}:`, error.message);
    return { 
      server: context7Server, 
      connected: false, 
      error: error.message 
    };
  }
};

/**
 * Get server status
 */
export const getContext7ServerStatus = () => {
  return {
    name: context7ServerConfig.name,
    connected: serverStatus.connected,
    lastConnected: serverStatus.lastConnected,
    lastError: serverStatus.lastError,
    capabilities: ['resolve_library_id', 'get_library_docs'],
  };
};

/**
 * Check if server is connected
 */
export const isContext7ServerConnected = (): boolean => {
  return serverStatus.connected;
};

/**
 * Disconnect from the server
 */
export const disconnectContext7Server = async (): Promise<boolean> => {
  try {
    if (serverStatus.connected && context7Server) {
      await context7Server.close();
      serverStatus.connected = false;
      console.log(`Disconnected from ${context7ServerConfig.name}`);
    }
    return true;
  } catch (error: any) {
    console.error('Error disconnecting Context7 server:', error.message);
    return false;
  }
};

/**
 * Handle connection errors and attempt recovery
 */
export const handleContext7ConnectionError = async (error: any): Promise<void> => {
  console.error('Context7 connection error:', error.message);
  serverStatus.connected = false;
  serverStatus.lastError = error.message;
  
  // Could implement reconnection logic here if needed
  // For now, we'll let the next operation trigger a reconnection
};

/**
 * Export utilities for Context7 server management
 */
export const context7ServerUtils = {
  server: context7Server,
  config: context7ServerConfig,
  initialize: initializeContext7Server,
  disconnect: disconnectContext7Server,
  getStatus: getContext7ServerStatus,
  isConnected: isContext7ServerConnected,
  handleError: handleContext7ConnectionError,
};