# Agent Module

This module provides a comprehensive agent creation and management system for the 05-agents-tools project.

## Overview

The agent module is organized into several key components:

- **Instructions** (`instructions.ts`) - Dynamic instruction builders for different agent types
- **Agent Factory** (`agent-factory.ts`) - Agent creation patterns and factory functions
- **Agent Configuration** (`agent-config.ts`) - Configuration utilities and builders
- **Index** (`index.ts`) - Main exports and backward compatibility

## Quick Start

### Basic Agent Creation

```typescript
import { createAdvancedAgent, createRunner, contextUtils } from './src/agent';

// Create a default agent with all tools
const agent = createAdvancedAgent();

// Create a runner for executing agent queries
const runner = createRunner();

// Create conversation context
const context = contextUtils.createEmpty();

// Run a query
const result = await runner.run(agent, "What's the weather in Tokyo?", { context });
```

### Agent Presets

```typescript
import { agentPresets } from './src/agent';

// Create specialized agents
const weatherAgent = agentPresets.weather();
const searchAgent = agentPresets.search();
const docsAgent = agentPresets.docs();
const chatAgent = agentPresets.chat();
```

### Custom Agent Creation

```typescript
import { createAdvancedAgent } from './src/agent';

const customAgent = createAdvancedAgent({
  name: 'My Custom Agent',
  modelSettings: {
    temperature: 0.7,
    toolChoice: 'auto',
  },
  enableWeather: true,
  enableWebSearch: false,
  enableDocumentation: true,
  instructionType: 'weather',
});
```

## Agent Types

### Advanced Agent (Default)
- **Tools**: Weather, Web Search, Documentation
- **Use Case**: General-purpose assistant with all capabilities
- **Best For**: Complex queries requiring multiple tools

### Weather Agent
- **Tools**: Weather only
- **Use Case**: Weather-specific queries
- **Best For**: Weather forecasts, conditions, location-based weather

### Search Agent
- **Tools**: Web Search only
- **Use Case**: Information retrieval from the web
- **Best For**: Current events, research, fact-checking

### Documentation Agent
- **Tools**: Context7 MCP (Documentation) only
- **Use Case**: Programming documentation and API references
- **Best For**: Latest framework docs, API usage, programming help

### Chat Agent
- **Tools**: None
- **Use Case**: General conversation
- **Best For**: Casual chat, advice, non-tool-based interactions

## Configuration

### Agent Configuration Builder

```typescript
import { AgentConfigBuilder } from './src/agent';

const config = new AgentConfigBuilder()
  .setModel('gpt-4.1-mini')
  .setTemperature(0.5)
  .setMaxTokens(2000)
  .setMaxConversationHistory(15)
  .build();
```

### Predefined Configurations

```typescript
import { agentConfigs, ConfigFactory } from './src/agent';

// Use predefined configurations
const creativeConfig = agentConfigs.creative();
const preciseConfig = agentConfigs.precise();
const fastConfig = agentConfigs.fast();

// Use factory configurations
const weatherConfig = ConfigFactory.forWeather();
const searchConfig = ConfigFactory.forSearch();
```

## Instructions

### Dynamic Instructions

Instructions are built dynamically based on context and agent type:

```typescript
import { buildInstructions, getInstructionBuilder } from './src/agent';

// Build default instructions
const instructions = buildInstructions({ context });

// Build weather-specific instructions
const weatherInstructions = getInstructionBuilder('weather')({ context });

// Build adaptive instructions based on query
const adaptiveInstructions = buildAdaptiveInstructions(query, { context });
```

### Instruction Types

- **default**: Multi-tool instructions with weather, search, and documentation
- **weather**: Weather-focused instructions
- **search**: Search-focused instructions
- **documentation**: Documentation-focused instructions
- **chat**: General conversation instructions

## Context Management

### Conversation Context

```typescript
import { contextUtils } from './src/agent';

// Create empty context
const context = contextUtils.createEmpty();

// Create with history
const contextWithHistory = contextUtils.createWithHistory([
  'User: Hello',
  'Assistant: Hi there!'
]);

// Add messages
const updatedContext = contextUtils.addMessage(context, 'User: How are you?');

// Truncate history
const truncatedContext = contextUtils.truncateHistory(context, 10);

// Get summary
const summary = contextUtils.getSummary(context);
```

## Factory Pattern

### Agent Factory

```typescript
import { AgentFactory } from './src/agent';

const factory = new AgentFactory();

// Create different agent types
const weatherAgent = factory.createWeather();
const searchAgent = factory.createSearch();
const docsAgent = factory.createDocumentation();

// Create based on query
const queryAgent = factory.createForQuery("What's the weather like?");
```

### Configuration Factory

```typescript
import { ConfigFactory } from './src/agent';

// Create task-specific configurations
const weatherConfig = ConfigFactory.forWeather();
const searchConfig = ConfigFactory.forSearch();
const docsConfig = ConfigFactory.forDocumentation();
const debugConfig = ConfigFactory.forDebugging();
```

## Validation

### Configuration Validation

```typescript
import { configValidation } from './src/agent';

// Validate agent configuration
const result = configValidation.validateAgentConfig(config);
if (!result.isValid) {
  console.error('Configuration errors:', result.errors);
}

// Validate environment
const envResult = configValidation.validateEnvironment();
```

## Best Practices

1. **Use Presets**: Start with predefined agent presets for common use cases
2. **Context Management**: Always maintain conversation context for better responses
3. **Configuration Validation**: Validate configurations before creating agents
4. **Error Handling**: Implement proper error handling for agent execution
5. **Performance**: Use appropriate model settings for your use case

## Migration from Legacy

The new modular structure maintains backward compatibility:

```typescript
// Legacy way (still works)
import { createAgent } from './src/agent';
const agent = createAgent();

// New way (recommended)
import { createAdvancedAgent } from './src/agent';
const agent = createAdvancedAgent();
```

## Environment Variables

Required environment variables:
- `OPENAI_API_KEY`: Required for OpenAI models
- `OPENWEATHER_API_KEY`: Required for weather functionality

## Examples

See the main `index.ts` file for complete examples of agent usage in the interactive chat interface.