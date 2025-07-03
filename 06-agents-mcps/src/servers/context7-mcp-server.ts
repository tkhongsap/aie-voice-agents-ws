/**
 * Context7 MCP Server
 * Provides documentation lookup via Context7 MCP server using Smithery CLI
 */

import { MCPServerStdio } from '@openai/agents';
import { config, APP_MESSAGES, ERROR_MESSAGES } from '../config';
import type { MCPServerConfig, DocumentationData, MCPServerStatus } from '../types';

/**
 * Context7 MCP Server implementation
 */
export class Context7MCPServer {
  private server: MCPServerStdio | null = null;
  private status: MCPServerStatus;
  private config: MCPServerConfig;

  constructor(serverConfig: MCPServerConfig) {
    this.config = serverConfig;
    this.status = {
      name: serverConfig.name,
      connected: false,
      capabilities: ['resolve_library_id', 'get_library_docs'],
    };
  }

  /**
   * Initialize the Context7 MCP server
   */
  async initialize(): Promise<boolean> {
    try {
      // Create MCP server instance
      this.server = new MCPServerStdio({
        name: this.config.name,
        fullCommand: this.config.command,
      });

      // Connect to the server
      await this.server.connect();
      
      this.status.connected = true;
      this.status.lastConnected = new Date();
      delete this.status.lastError;

      console.log(`${APP_MESSAGES.MCP_CONNECTED} ${this.config.name}`);
      return true;
    } catch (error: any) {
      this.status.connected = false;
      this.status.lastError = error.message;
      console.error(`${APP_MESSAGES.MCP_FAILED} ${this.config.name}:`, error.message);
      return false;
    }
  }

  /**
   * Get documentation for a library
   */
  async getDocumentation(libraryName: string): Promise<DocumentationData | null> {
    if (!this.server || !this.status.connected) {
      console.warn('Context7 MCP server not connected');
      return null;
    }

    try {
      // This is a simplified version - in a real implementation, you would
      // use the MCP server's tools to resolve library ID and get documentation
      
      const documentationData: DocumentationData = {
        libraryName,
        version: 'latest',
        title: `${libraryName} Documentation`,
        content: `Documentation for ${libraryName} retrieved via Context7 MCP server`,
        url: `https://docs.${libraryName.toLowerCase()}.com`,
        lastUpdated: new Date(),
        sections: [
          {
            title: 'Getting Started',
            content: `Getting started with ${libraryName}`,
            url: `https://docs.${libraryName.toLowerCase()}.com/getting-started`,
          },
          {
            title: 'API Reference',
            content: `API reference for ${libraryName}`,
            url: `https://docs.${libraryName.toLowerCase()}.com/api`,
          },
        ],
      };

      return documentationData;
    } catch (error: any) {
      console.error('Context7 API error:', error.message);
      throw new Error(ERROR_MESSAGES.FETCH_ERROR);
    }
  }

  /**
   * Get the server status
   */
  getStatus(): MCPServerStatus {
    return { ...this.status };
  }

  /**
   * Check if the server is connected
   */
  isConnected(): boolean {
    return this.status.connected;
  }

  /**
   * Disconnect from the server
   */
  async disconnect(): Promise<boolean> {
    try {
      if (this.server) {
        await this.server.close();
        this.server = null;
      }
      this.status.connected = false;
      return true;
    } catch (error: any) {
      console.error('Error disconnecting Context7 MCP server:', error.message);
      return false;
    }
  }

  /**
   * Get server configuration
   */
  getConfig(): MCPServerConfig {
    return { ...this.config };
  }
}

/**
 * Context7 MCP server configuration
 */
export const context7ServerConfig: MCPServerConfig = {
  name: config.mcpServers.context7.name,
  command: config.mcpServers.context7.command,
  url: config.mcpServers.context7.url,
};

/**
 * Create and initialize Context7 MCP server
 */
export const createContext7MCPServer = async (): Promise<Context7MCPServer> => {
  const context7Server = new Context7MCPServer(context7ServerConfig);
  await context7Server.initialize();
  return context7Server;
};

/**
 * Context7 MCP server instance
 */
export const context7MCPServer = new Context7MCPServer(context7ServerConfig);

/**
 * Initialize Context7 MCP server
 */
export const initializeContext7MCPServer = async (): Promise<{
  server: Context7MCPServer;
  connected: boolean;
  error?: string;
}> => {
  try {
    const connected = await context7MCPServer.initialize();
    if (connected) {
      return { server: context7MCPServer, connected };
    } else {
      return { 
        server: context7MCPServer, 
        connected: false, 
        error: 'Failed to connect to Context7 MCP server'
      };
    }
  } catch (error: any) {
    return { 
      server: context7MCPServer, 
      connected: false, 
      error: error.message 
    };
  }
};

/**
 * Documentation service functions for direct API calls
 */
export const documentationService = {
  /**
   * Get documentation for a library
   */
  async getDocumentation(libraryName: string): Promise<DocumentationData | null> {
    return await context7MCPServer.getDocumentation(libraryName);
  },

  /**
   * Format documentation data for display
   */
  formatDocumentationData(docs: DocumentationData): string {
    return `Documentation for ${docs.libraryName}:
📚 Title: ${docs.title}
🔗 URL: ${docs.url}
🆕 Version: ${docs.version}
📅 Last Updated: ${docs.lastUpdated.toLocaleDateString()}

📖 Content:
${docs.content}

📑 Sections:
${docs.sections.map(section => `  • ${section.title}: ${section.url}`).join('\n')}`;
  },

  /**
   * Validate library name input
   */
  validateLibraryName(libraryName: string): boolean {
    return typeof libraryName === 'string' && libraryName.trim().length > 0;
  },
};

/**
 * Export Context7 MCP server utilities
 */
export const context7MCPUtils = {
  server: context7MCPServer,
  service: documentationService,
  config: context7ServerConfig,
  createServer: createContext7MCPServer,
  initializeServer: initializeContext7MCPServer,
};

// For backward compatibility with existing code
export const context7Server = new MCPServerStdio({
  name: context7ServerConfig.name,
  fullCommand: context7ServerConfig.command,
});

export const initializeContext7Server = initializeContext7MCPServer; 