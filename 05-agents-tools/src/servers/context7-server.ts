/**
 * Context7 MCP server implementation
 * Provides documentation tools via Context7 MCP server using Smithery CLI
 */

import { MCPServerStdio } from '@openai/agents';
import { MCP_CONFIG, APP_MESSAGES } from '../config';
import type { MCPServerConfig } from '../types';

/**
 * Context7 MCP server for documentation lookup
 * Uses Smithery CLI to run the Context7 MCP server
 */
export const context7Server = new MCPServerStdio({
  name: MCP_CONFIG.CONTEXT7_SERVER.NAME,
  fullCommand: MCP_CONFIG.CONTEXT7_SERVER.COMMAND
});

/**
 * Context7 server configuration
 */
export const context7Config: MCPServerConfig = {
  name: MCP_CONFIG.CONTEXT7_SERVER.NAME,
  fullCommand: MCP_CONFIG.CONTEXT7_SERVER.COMMAND
};

/**
 * Initialize and connect to Context7 MCP server
 */
export const initializeContext7Server = async (): Promise<{
  server: MCPServerStdio;
  connected: boolean;
  error?: string;
}> => {
  try {
    await context7Server.connect();
    console.log(APP_MESSAGES.MCP_CONNECTED);
    return { server: context7Server, connected: true };
  } catch (error: any) {
    console.log(`${APP_MESSAGES.MCP_FAILED} ${error.message}`);
    console.log(APP_MESSAGES.MCP_LIMITED);
    return { server: context7Server, connected: false, error: error.message };
  }
};

/**
 * Create a custom Context7 MCP server with different configuration
 */
export const createContext7Server = (config: MCPServerConfig): MCPServerStdio => {
  return new MCPServerStdio({
    name: config.name,
    fullCommand: config.fullCommand
  });
};

/**
 * Context7 server manager for handling multiple server instances
 */
export class Context7ServerManager {
  private servers: Map<string, MCPServerStdio> = new Map();
  private connectionStatus: Map<string, boolean> = new Map();

  /**
   * Add a new Context7 server
   */
  addServer(id: string, config: MCPServerConfig): void {
    const server = createContext7Server(config);
    this.servers.set(id, server);
    this.connectionStatus.set(id, false);
  }

  /**
   * Connect to a specific server
   */
  async connectServer(id: string): Promise<boolean> {
    const server = this.servers.get(id);
    if (!server) {
      throw new Error(`Server with id '${id}' not found`);
    }

    try {
      await server.connect();
      this.connectionStatus.set(id, true);
      return true;
    } catch (error: any) {
      this.connectionStatus.set(id, false);
      console.error(`Failed to connect to server '${id}':`, error.message);
      return false;
    }
  }

  /**
   * Disconnect from a specific server
   */
  async disconnectServer(id: string): Promise<boolean> {
    const server = this.servers.get(id);
    if (!server) {
      throw new Error(`Server with id '${id}' not found`);
    }

    try {
      await server.disconnect();
      this.connectionStatus.set(id, false);
      return true;
    } catch (error: any) {
      console.error(`Failed to disconnect from server '${id}':`, error.message);
      return false;
    }
  }

  /**
   * Get server by ID
   */
  getServer(id: string): MCPServerStdio | undefined {
    return this.servers.get(id);
  }

  /**
   * Get connection status for a server
   */
  isConnected(id: string): boolean {
    return this.connectionStatus.get(id) || false;
  }

  /**
   * Get all servers
   */
  getAllServers(): Array<{ id: string; server: MCPServerStdio; connected: boolean }> {
    return Array.from(this.servers.entries()).map(([id, server]) => ({
      id,
      server,
      connected: this.isConnected(id)
    }));
  }

  /**
   * Connect to all servers
   */
  async connectAll(): Promise<{ connected: number; failed: number }> {
    let connected = 0;
    let failed = 0;

    for (const [id] of this.servers) {
      const success = await this.connectServer(id);
      if (success) {
        connected++;
      } else {
        failed++;
      }
    }

    return { connected, failed };
  }

  /**
   * Disconnect from all servers
   */
  async disconnectAll(): Promise<{ disconnected: number; failed: number }> {
    let disconnected = 0;
    let failed = 0;

    for (const [id] of this.servers) {
      const success = await this.disconnectServer(id);
      if (success) {
        disconnected++;
      } else {
        failed++;
      }
    }

    return { disconnected, failed };
  }
}

/**
 * Default Context7 server manager instance
 */
export const context7ServerManager = new Context7ServerManager();

/**
 * Helper function to validate Context7 server configuration
 */
export const validateContext7Config = (config: any): config is MCPServerConfig => {
  return (
    typeof config?.name === 'string' &&
    typeof config?.fullCommand === 'string' &&
    config.name.trim().length > 0 &&
    config.fullCommand.trim().length > 0
  );
};

/**
 * Context7 server factory for creating different server instances
 */
export const createContext7ServerFactory = () => {
  return {
    /**
     * Create a documentation server
     */
    createDocumentationServer: (key: string) => {
      return createContext7Server({
        name: 'Context7 Documentation Server',
        fullCommand: `npx -y @smithery/cli@latest run @upstash/context7-mcp --key ${key}`
      });
    },

    /**
     * Create a custom server with specific configuration
     */
    createCustomServer: (name: string, command: string) => {
      return createContext7Server({
        name,
        fullCommand: command
      });
    },

    /**
     * Create a server with timeout
     */
    createServerWithTimeout: (config: MCPServerConfig, timeout: number) => {
      // Note: MCPServerStdio doesn't directly support timeout in constructor
      // This would need to be implemented with additional wrapper logic
      return createContext7Server(config);
    }
  };
};