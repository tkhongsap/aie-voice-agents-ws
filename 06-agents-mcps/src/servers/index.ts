/**
 * MCP Servers module
 * Exports all MCP server implementations and management utilities
 */

import type { MCPServerConfig, MCPServerStatus } from '../types';

// Export all MCP servers
export * from './weather-mcp-server';
export * from './air-quality-mcp-server';
export * from './context7-mcp-server';

// Import server instances
import { weatherMCPServer, initializeWeatherMCPServer } from './weather-mcp-server';
import { airQualityMCPServer, initializeAirQualityMCPServer } from './air-quality-mcp-server';
import { context7MCPServer, initializeContext7MCPServer } from './context7-mcp-server';

/**
 * MCP Server Manager
 * Manages all MCP server instances and their connections
 */
export class MCPServerManager {
  private servers: Map<string, any> = new Map();
  private statuses: Map<string, MCPServerStatus> = new Map();
  private initializers: Map<string, () => Promise<any>> = new Map();

  constructor() {
    // Register all MCP servers
    this.servers.set('weather', weatherMCPServer);
    this.servers.set('airQuality', airQualityMCPServer);
    this.servers.set('context7', context7MCPServer);

    // Register initializers
    this.initializers.set('weather', initializeWeatherMCPServer);
    this.initializers.set('airQuality', initializeAirQualityMCPServer);
    this.initializers.set('context7', initializeContext7MCPServer);
  }

  /**
   * Initialize all MCP servers
   */
  async initializeAll(): Promise<{
    connected: string[];
    failed: string[];
    errors: Record<string, string>;
  }> {
    const connected: string[] = [];
    const failed: string[] = [];
    const errors: Record<string, string> = {};

    for (const [name, initializer] of this.initializers) {
      try {
        const result = await initializer();
                 const status: MCPServerStatus = {
           name: result.server.getStatus().name,
           connected: result.connected,
           capabilities: result.server.getStatus().capabilities,
         };
         
         if (result.connected) {
           status.lastConnected = new Date();
         }
         
         if (result.error) {
           status.lastError = result.error;
         }
         
         this.statuses.set(name, status);

        if (result.connected) {
          connected.push(name);
        } else {
          failed.push(name);
          if (result.error) {
            errors[name] = result.error;
          }
        }
      } catch (error: any) {
        failed.push(name);
        errors[name] = error.message;
        this.statuses.set(name, {
          name: name,
          connected: false,
          lastError: error.message,
        });
      }
    }

    return { connected, failed, errors };
  }

  /**
   * Initialize a specific MCP server
   */
  async initializeServer(serverName: string): Promise<boolean> {
    const initializer = this.initializers.get(serverName);
    if (!initializer) {
      throw new Error(`Server '${serverName}' not found`);
    }

    try {
      const result = await initializer();
             const status: MCPServerStatus = {
         name: result.server.getStatus().name,
         connected: result.connected,
         capabilities: result.server.getStatus().capabilities,
       };
       
       if (result.connected) {
         status.lastConnected = new Date();
       }
       
       if (result.error) {
         status.lastError = result.error;
       }
       
       this.statuses.set(serverName, status);

      return result.connected;
    } catch (error: any) {
      this.statuses.set(serverName, {
        name: serverName,
        connected: false,
        lastError: error.message,
      });
      return false;
    }
  }

  /**
   * Disconnect all MCP servers
   */
  async disconnectAll(): Promise<{
    disconnected: string[];
    failed: string[];
    errors: Record<string, string>;
  }> {
    const disconnected: string[] = [];
    const failed: string[] = [];
    const errors: Record<string, string> = {};

    for (const [name, server] of this.servers) {
      try {
        const success = await server.disconnect();
        if (success) {
          disconnected.push(name);
          this.statuses.set(name, {
            ...this.statuses.get(name)!,
            connected: false,
          });
        } else {
          failed.push(name);
        }
      } catch (error: any) {
        failed.push(name);
        errors[name] = error.message;
      }
    }

    return { disconnected, failed, errors };
  }

  /**
   * Disconnect a specific MCP server
   */
  async disconnectServer(serverName: string): Promise<boolean> {
    const server = this.servers.get(serverName);
    if (!server) {
      throw new Error(`Server '${serverName}' not found`);
    }

    try {
      const success = await server.disconnect();
      if (success) {
        this.statuses.set(serverName, {
          ...this.statuses.get(serverName)!,
          connected: false,
        });
      }
      return success;
    } catch (error: any) {
      console.error(`Error disconnecting server '${serverName}':`, error.message);
      return false;
    }
  }

  /**
   * Get server instance by name
   */
  getServer(serverName: string): any {
    return this.servers.get(serverName);
  }

  /**
   * Get server status by name
   */
  getServerStatus(serverName: string): MCPServerStatus | undefined {
    return this.statuses.get(serverName);
  }

  /**
   * Get all server statuses
   */
  getAllServerStatuses(): Record<string, MCPServerStatus> {
    const statuses: Record<string, MCPServerStatus> = {};
    for (const [name, status] of this.statuses) {
      statuses[name] = status;
    }
    return statuses;
  }

  /**
   * Check if a server is connected
   */
  isServerConnected(serverName: string): boolean {
    const status = this.statuses.get(serverName);
    return status?.connected || false;
  }

  /**
   * Get connected servers
   */
  getConnectedServers(): string[] {
    const connected: string[] = [];
    for (const [name, status] of this.statuses) {
      if (status.connected) {
        connected.push(name);
      }
    }
    return connected;
  }

  /**
   * Get failed servers
   */
  getFailedServers(): string[] {
    const failed: string[] = [];
    for (const [name, status] of this.statuses) {
      if (!status.connected) {
        failed.push(name);
      }
    }
    return failed;
  }

  /**
   * Get server capabilities
   */
  getServerCapabilities(serverName: string): string[] {
    const status = this.statuses.get(serverName);
    return status?.capabilities || [];
  }

  /**
   * Get all server configurations
   */
  getAllServerConfigs(): Record<string, MCPServerConfig> {
    const configs: Record<string, MCPServerConfig> = {};
    for (const [name, server] of this.servers) {
      configs[name] = server.getConfig();
    }
    return configs;
  }
}

/**
 * Default MCP server manager instance
 */
export const mcpServerManager = new MCPServerManager();

/**
 * Utility functions for MCP server management
 */
export const mcpServerUtils = {
  /**
   * Initialize all MCP servers
   */
  async initializeAllServers() {
    return await mcpServerManager.initializeAll();
  },

  /**
   * Disconnect all MCP servers
   */
  async disconnectAllServers() {
    return await mcpServerManager.disconnectAll();
  },

  /**
   * Get server manager instance
   */
  getManager(): MCPServerManager {
    return mcpServerManager;
  },

  /**
   * Get connected servers count
   */
  getConnectedServersCount(): number {
    return mcpServerManager.getConnectedServers().length;
  },

  /**
   * Get failed servers count
   */
  getFailedServersCount(): number {
    return mcpServerManager.getFailedServers().length;
  },

  /**
   * Check if any servers are connected
   */
  hasConnectedServers(): boolean {
    return mcpServerManager.getConnectedServers().length > 0;
  },

  /**
   * Format server status for display
   */
  formatServerStatus(status: MCPServerStatus): string {
    const connectionStatus = status.connected ? '✅ Connected' : '❌ Disconnected';
    const lastConnected = status.lastConnected 
      ? `Last connected: ${status.lastConnected.toLocaleString()}`
      : 'Never connected';
    const capabilities = status.capabilities 
      ? `Capabilities: ${status.capabilities.join(', ')}`
      : 'No capabilities';
    const error = status.lastError ? `Error: ${status.lastError}` : '';

    return `${status.name}: ${connectionStatus}
${lastConnected}
${capabilities}
${error}`.trim();
  },

  /**
   * Format all server statuses for display
   */
  formatAllServerStatuses(): string {
    const statuses = mcpServerManager.getAllServerStatuses();
    return Object.values(statuses)
      .map(status => this.formatServerStatus(status))
      .join('\n\n');
  }
};

/**
 * Export individual server instances for direct access
 */
export const servers = {
  weather: weatherMCPServer,
  airQuality: airQualityMCPServer,
  context7: context7MCPServer,
};

/**
 * Export server initializers
 */
export const serverInitializers = {
  weather: initializeWeatherMCPServer,
  airQuality: initializeAirQualityMCPServer,
  context7: initializeContext7MCPServer,
}; 