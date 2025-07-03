# Servers Module

This module handles MCP (Model Context Protocol) server configurations and management for the 05-agents-tools project.

## Available Servers

### Context7 MCP Server

The Context7 server provides documentation lookup capabilities using the Context7 MCP server via Smithery CLI.

**Usage:**
```typescript
import { 
  context7Server, 
  initializeContext7Server, 
  Context7ServerManager,
  createContext7Server 
} from './context7-server';

// Use the default server
const server = context7Server;

// Initialize and connect
const { connected, error } = await initializeContext7Server();

// Create a custom server
const customServer = createContext7Server({
  name: 'Custom Documentation Server',
  fullCommand: 'npx -y @smithery/cli@latest run @upstash/context7-mcp --key your-key'
});

// Use the server manager
const manager = new Context7ServerManager();
manager.addServer('docs', {
  name: 'Documentation Server',
  fullCommand: 'npx -y @smithery/cli@latest run @upstash/context7-mcp --key your-key'
});
await manager.connectServer('docs');
```

**Features:**
- Documentation lookup via Context7 MCP
- Server connection management
- Multiple server instance support
- Connection status tracking
- Error handling and fallback support

**Configuration:**
- Uses Smithery CLI to run Context7 MCP server
- Requires Context7 API key
- Supports custom server configurations

### Server Manager

The Context7ServerManager provides advanced server management capabilities:

**Usage:**
```typescript
import { Context7ServerManager } from './context7-server';

const manager = new Context7ServerManager();

// Add multiple servers
manager.addServer('docs', {
  name: 'Documentation Server',
  fullCommand: 'npx -y @smithery/cli@latest run @upstash/context7-mcp --key key1'
});

manager.addServer('api', {
  name: 'API Reference Server',
  fullCommand: 'npx -y @smithery/cli@latest run @upstash/context7-mcp --key key2'
});

// Connect to all servers
const { connected, failed } = await manager.connectAll();

// Get server status
const isConnected = manager.isConnected('docs');
const server = manager.getServer('docs');

// Disconnect all servers
await manager.disconnectAll();
```

**Features:**
- Multiple server management
- Batch operations (connect/disconnect all)
- Server status tracking
- Error handling per server
- Server configuration validation

## Server Structure

Each MCP server follows this pattern:

```typescript
import { MCPServerStdio } from '@openai/agents';

export const myServer = new MCPServerStdio({
  name: 'My Server',
  fullCommand: 'command-to-run-server'
});

// Initialize function
export const initializeMyServer = async () => {
  try {
    await myServer.connect();
    return { server: myServer, connected: true };
  } catch (error) {
    return { server: myServer, connected: false, error: error.message };
  }
};
```

## Error Handling

Servers should handle connection errors gracefully:

```typescript
try {
  await server.connect();
  console.log('✅ Server connected successfully');
} catch (error) {
  console.log('⚠️ Server connection failed:', error.message);
  console.log('📚 Features will be limited');
}
```

## Available Tools

When connected, the Context7 server provides these tools:

1. **resolve-library-id** - Find library ID by name
2. **get-library-docs** - Get documentation for a library

**Usage Pattern:**
```typescript
// 1. First resolve the library ID
const libraryId = await agent.run('resolve-library-id', { name: 'react' });

// 2. Then get the documentation
const docs = await agent.run('get-library-docs', { libraryId });
```

## Server Factory

Create servers with different configurations:

```typescript
import { createContext7ServerFactory } from './context7-server';

const factory = createContext7ServerFactory();

// Create a documentation server
const docServer = factory.createDocumentationServer('your-api-key');

// Create a custom server
const customServer = factory.createCustomServer('Custom Server', 'custom-command');
```

## Testing

Test server connections:

```typescript
// Test server connection
const { connected, error } = await initializeContext7Server();

if (connected) {
  console.log('✅ Server ready');
} else {
  console.log('❌ Server failed:', error);
}
```

## Configuration

Server configurations are managed through the config module:

```typescript
import { MCP_CONFIG } from '../config';

// Access server configuration
const serverConfig = MCP_CONFIG.CONTEXT7_SERVER;
console.log('Server name:', serverConfig.NAME);
console.log('Command:', serverConfig.COMMAND);
```

## Adding New Servers

1. Create a new server file in the servers directory
2. Implement the server using MCPServerStdio
3. Add initialization and management functions
4. Add exports to `index.ts`
5. Update configuration if needed
6. Add documentation to this README

## Best Practices

- Always handle connection failures gracefully
- Provide fallback mechanisms when servers are unavailable
- Use descriptive server names and commands
- Implement proper error logging
- Test server connections before use
- Document server capabilities and tool availability
- Use the server manager for multiple server scenarios