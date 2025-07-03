/**
 * Dynamic instructions for MCP agents
 * Provides context-aware instructions based on connected MCP servers
 */

import { APP_MESSAGES, EXAMPLE_QUERIES } from '../config';
import type { InstructionsContext } from '../types';

/**
 * Build instructions based on connected MCP servers and capabilities
 */
export const buildInstructions = (context: InstructionsContext): string => {
  const { capabilities, mcpServers, userQuery } = context;
  
  let instructions = `You are an advanced AI assistant with access to MCP (Model Context Protocol) servers for specialized data retrieval.

## Available MCP Servers

`;

  // Weather MCP Server
  if (capabilities.weather && mcpServers.weather.connected) {
    instructions += `### 🌤️ Weather MCP Server (${mcpServers.weather.connected ? 'Connected' : 'Disconnected'})
- Get current weather data for any location worldwide
- Provides temperature, humidity, wind speed, pressure, visibility, and more
- Capabilities: ${mcpServers.weather.capabilities?.join(', ') || 'weather data'}

`;
  }

  // Air Quality MCP Server
  if (capabilities.airQuality && mcpServers.airQuality.connected) {
    instructions += `### 🌬️ Air Quality MCP Server (${mcpServers.airQuality.connected ? 'Connected' : 'Disconnected'})
- Get real-time air quality data and AQI (Air Quality Index)
- Provides pollutant levels (PM2.5, PM10, NO2, SO2, CO, O3)
- Health implications and recommendations
- Capabilities: ${mcpServers.airQuality.capabilities?.join(', ') || 'air quality data'}

`;
  }

  // Context7 Documentation MCP Server
  if (capabilities.documentation && mcpServers.context7.connected) {
    instructions += `### 📚 Context7 Documentation MCP Server (${mcpServers.context7.connected ? 'Connected' : 'Disconnected'})
- Access latest documentation for libraries and frameworks
- Get up-to-date API references and guides
- Supports React, Next.js, OpenAI, LangChain, TypeScript, and more
- Capabilities: ${mcpServers.context7.capabilities?.join(', ') || 'documentation lookup'}

`;
  }

  instructions += `## Your Capabilities

You should:
1. **Automatically determine** when to use MCP servers based on user queries
2. **Use appropriate MCP servers** for weather, air quality, or documentation queries
3. **Provide comprehensive responses** combining data from multiple servers when relevant
4. **Handle errors gracefully** if MCP servers are unavailable
5. **Offer alternatives** when specific servers are disconnected

## Query Examples

`;

  // Add relevant examples based on connected servers
  if (capabilities.weather && mcpServers.weather.connected) {
    instructions += `### Weather Queries:
${EXAMPLE_QUERIES.WEATHER.map(q => `- "${q}"`).join('\n')}

`;
  }

  if (capabilities.airQuality && mcpServers.airQuality.connected) {
    instructions += `### Air Quality Queries:
${EXAMPLE_QUERIES.AIR_QUALITY.map(q => `- "${q}"`).join('\n')}

`;
  }

  if (capabilities.documentation && mcpServers.context7.connected) {
    instructions += `### Documentation Queries:
${EXAMPLE_QUERIES.DOCS.map(q => `- "${q}"`).join('\n')}

`;
  }

  instructions += `## Response Guidelines

1. **Be specific and detailed** when providing data from MCP servers
2. **Format data clearly** with appropriate emojis and structure
3. **Combine multiple data sources** when relevant (e.g., weather + air quality for outdoor activities)
4. **Provide context and interpretation** of the data
5. **Suggest actions** based on the data when appropriate
6. **Handle location variations** (city names, coordinates, etc.)

## Error Handling

If an MCP server is unavailable:
- Acknowledge the limitation clearly
- Provide general guidance when possible
- Suggest alternative approaches
- Maintain a helpful and professional tone

Remember: Always prioritize providing accurate, helpful, and well-formatted responses using the available MCP server data.`;

  return instructions;
};

/**
 * Instruction builders for specific use cases
 */
export const instructionBuilders = {
  /**
   * Weather-focused instructions
   */
  weather: (context: InstructionsContext): string => {
    return buildInstructions({
      ...context,
      capabilities: { weather: true, airQuality: false, documentation: false }
    });
  },

  /**
   * Air quality-focused instructions
   */
  airQuality: (context: InstructionsContext): string => {
    return buildInstructions({
      ...context,
      capabilities: { weather: false, airQuality: true, documentation: false }
    });
  },

  /**
   * Documentation-focused instructions
   */
  documentation: (context: InstructionsContext): string => {
    return buildInstructions({
      ...context,
      capabilities: { weather: false, airQuality: false, documentation: true }
    });
  },

  /**
   * Environmental data (weather + air quality) instructions
   */
  environmental: (context: InstructionsContext): string => {
    return buildInstructions({
      ...context,
      capabilities: { weather: true, airQuality: true, documentation: false }
    });
  },

  /**
   * General chat instructions (no MCP servers)
   */
  chat: (context: InstructionsContext): string => {
    return `You are a helpful AI assistant. You can engage in general conversation and provide information on a wide range of topics. 

While you don't have access to specialized MCP servers in this mode, you can still provide helpful responses based on your training data.

Please:
- Be helpful, informative, and conversational
- Provide accurate information to the best of your ability
- Ask clarifying questions when needed
- Maintain a friendly and professional tone`;
  },

  /**
   * Default instructions with all capabilities
   */
  default: buildInstructions,
};

/**
 * Get instruction builder by type
 */
export const getInstructionBuilder = (
  type: 'default' | 'weather' | 'airQuality' | 'documentation' | 'environmental' | 'chat' = 'default'
): ((context: InstructionsContext) => string) => {
  return instructionBuilders[type] || instructionBuilders.default;
};

/**
 * Generate instructions for debugging
 */
export const buildDebugInstructions = (context: InstructionsContext): string => {
  const baseInstructions = buildInstructions(context);
  
  return `${baseInstructions}

## Debug Mode

Additional debug information:
- MCP Server Statuses: ${JSON.stringify(context.mcpServers, null, 2)}
- Capabilities: ${JSON.stringify(context.capabilities, null, 2)}
- User Query: ${context.userQuery || 'N/A'}

Please include debug information in your responses when relevant.`;
};

/**
 * Generate instructions based on query analysis
 */
export const buildContextualInstructions = (
  context: InstructionsContext,
  queryAnalysis?: {
    type: 'weather' | 'air_quality' | 'documentation' | 'general';
    confidence: number;
    location?: string;
    libraryName?: string;
  }
): string => {
  if (!queryAnalysis) {
    return buildInstructions(context);
  }

  // Use specialized instruction builder based on query type
  let builderType: 'default' | 'weather' | 'airQuality' | 'documentation' | 'environmental' | 'chat' = 'default';
  
  if (queryAnalysis.type === 'weather') {
    builderType = 'weather';
  } else if (queryAnalysis.type === 'air_quality') {
    builderType = 'airQuality';
  } else if (queryAnalysis.type === 'documentation') {
    builderType = 'documentation';
  }
  
  const builder = getInstructionBuilder(builderType);

  let instructions = builder(context);

  // Add context-specific guidance
  if (queryAnalysis.location) {
    instructions += `\n\n## Location Context
The user is asking about: ${queryAnalysis.location}
Please ensure location-specific accuracy in your response.`;
  }

  if (queryAnalysis.libraryName) {
    instructions += `\n\n## Library Context
The user is asking about: ${queryAnalysis.libraryName}
Focus on providing accurate, up-to-date documentation for this specific library.`;
  }

  if (queryAnalysis.confidence < 0.8) {
    instructions += `\n\n## Query Interpretation
Query classification confidence is ${(queryAnalysis.confidence * 100).toFixed(1)}%.
Please ask clarifying questions if the user's intent is unclear.`;
  }

  return instructions;
};

/**
 * Instruction utilities
 */
export const instructionUtils = {
  /**
   * Get instructions for current context
   */
  getInstructions: buildInstructions,
  
  /**
   * Get builder by type
   */
  getBuilder: getInstructionBuilder,
  
  /**
   * Build contextual instructions
   */
  buildContextual: buildContextualInstructions,
  
  /**
   * Build debug instructions
   */
  buildDebug: buildDebugInstructions,
  
  /**
   * Check if instructions should include specific capability
   */
  shouldIncludeCapability: (
    capability: keyof InstructionsContext['capabilities'],
    context: InstructionsContext
  ): boolean => {
    return context.capabilities[capability] && 
           context.mcpServers[capability === 'documentation' ? 'context7' : capability]?.connected;
  },
  
  /**
   * Get available capabilities summary
   */
  getCapabilitiesSummary: (context: InstructionsContext): string => {
    const available = [];
    
    if (instructionUtils.shouldIncludeCapability('weather', context)) {
      available.push('Weather data');
    }
    
    if (instructionUtils.shouldIncludeCapability('airQuality', context)) {
      available.push('Air quality data');
    }
    
    if (instructionUtils.shouldIncludeCapability('documentation', context)) {
      available.push('Documentation lookup');
    }
    
    return available.length > 0 
      ? `Available capabilities: ${available.join(', ')}`
      : 'No MCP servers currently available';
  }
}; 