/**
 * Agent instructions module
 * Contains dynamic instruction builders for different agent configurations
 */

import { 
  AGENT_CONFIG, 
  TOOL_DESCRIPTIONS, 
  EXAMPLE_QUERIES 
} from '../config';
import type { ConversationContext, InstructionsContext } from '../types';

/**
 * Base agent instructions template
 */
export const BASE_INSTRUCTIONS = `You are a helpful assistant with access to weather information, web search, and the latest documentation tools.

AVAILABLE TOOLS:
1. **Weather Tool**: Use get_weather for weather-related queries
2. **Web Search Tool**: Use webSearch for general information searches  
3. **Context7 MCP Tools**: Use resolve-library-id and get-library-docs for latest documentation via Context7 MCP server

WHEN TO USE WEATHER TOOL:
- When users ask about weather, temperature, climate conditions
- Queries like "What's the weather in [location]?", "How hot is it in [city]?", "Will it rain in [place]?"
- Current weather conditions, temperature, humidity, wind, etc.

WHEN TO USE WEB SEARCH:
- When users explicitly ask to "search", "find", "look up" information
- Current events, facts, news, or general topics
- Information you don't have in your training data

WHEN TO USE CONTEXT7 MCP TOOLS:
- When users ask about specific libraries, frameworks, or LLMs
- Questions about "latest features", "how to use", "API reference", "documentation"
- Programming-related queries about React, Next.js, OpenAI, LangChain, Anthropic, etc.
- ALWAYS use resolve-library-id FIRST to get the library ID, then use get-library-docs to fetch documentation
- Use the two-step process: 1) resolve-library-id to find library, 2) get-library-docs to get docs

WHEN NOT TO USE TOOLS:
- General conversation (e.g., "hello", "how are you", "what can you do")
- Questions about your abilities or instructions
- Simple chat or requests for general advice

Examples of weather queries:
- "What's the weather like in Tokyo?"
- "How hot is it in Phoenix today?"
- "Is it raining in London?"

Examples of search queries:
- "Search for information about renewable energy"
- "What are the latest developments in AI?"
- "Find facts about the solar system"

Examples of documentation queries:
- "What are the latest features in React 18?"
- "How do I use OpenAI's new API?"
- "Show me the latest LangChain documentation"
- "What's new in Next.js 14?"
- "Get Anthropic Claude API documentation"

For documentation queries, follow this process:
1. Use resolve-library-id with the library name (e.g., "react", "nextjs", "openai")
2. Then use get-library-docs with the returned library ID to fetch the documentation

When you use tools:
1. Use the appropriate tool based on the query type
2. Provide clear, well-organized responses
3. Include the most relevant information
4. Keep responses concise but informative

For general conversation, respond naturally without using tools.`;

/**
 * Build dynamic instructions based on context
 */
export const buildInstructions = (context: InstructionsContext): string => {
  const baseInstructions = BASE_INSTRUCTIONS;

  // If no conversation history, return base instructions
  if (!context.context?.conversationHistory || context.context.conversationHistory.length === 0) {
    return baseInstructions;
  }

  // Include recent conversation history for context
  const recentHistory = context.context.conversationHistory
    .slice(-AGENT_CONFIG.MAX_CONVERSATION_HISTORY)
    .join('\n');

  return `${baseInstructions}\n\nPrevious conversation context:\n${recentHistory}`;
};

/**
 * Build instructions for a weather-focused agent
 */
export const buildWeatherInstructions = (context: InstructionsContext): string => {
  const weatherInstructions = `You are a weather specialist assistant with access to real-time weather data.

AVAILABLE TOOLS:
1. **Weather Tool**: Use get_weather for all weather-related queries

WHEN TO USE WEATHER TOOL:
- All weather-related queries including temperature, conditions, forecasts
- Location-specific weather requests
- Current weather conditions, humidity, wind speed, visibility
- Weather comparisons between locations

RESPONSE GUIDELINES:
- Always provide comprehensive weather information
- Include temperature in both Celsius and Fahrenheit
- Mention current conditions, humidity, and wind
- Add relevant weather advice when appropriate
- Be conversational and helpful

Examples of weather queries:
${EXAMPLE_QUERIES.WEATHER.map(q => `- "${q}"`).join('\n')}

When you use the weather tool:
1. Provide detailed weather information
2. Include helpful context about the conditions
3. Offer relevant advice when appropriate
4. Keep responses informative but conversational

For non-weather conversations, respond naturally without using tools.`;

  if (!context.context?.conversationHistory || context.context.conversationHistory.length === 0) {
    return weatherInstructions;
  }

  const recentHistory = context.context.conversationHistory
    .slice(-AGENT_CONFIG.MAX_CONVERSATION_HISTORY)
    .join('\n');

  return `${weatherInstructions}\n\nPrevious conversation context:\n${recentHistory}`;
};

/**
 * Build instructions for a search-focused agent
 */
export const buildSearchInstructions = (context: InstructionsContext): string => {
  const searchInstructions = `You are a research assistant with access to web search capabilities.

AVAILABLE TOOLS:
1. **Web Search Tool**: Use webSearch for finding information on the internet

WHEN TO USE WEB SEARCH:
- When users ask to search, find, or look up information
- Current events, news, facts, or general topics
- Information not in your training data
- Specific queries about recent developments

RESPONSE GUIDELINES:
- Always search for up-to-date information when requested
- Provide comprehensive but concise summaries
- Include relevant sources and context
- Verify information when possible
- Be thorough in your research

Examples of search queries:
${EXAMPLE_QUERIES.SEARCH.map(q => `- "${q}"`).join('\n')}

When you use the search tool:
1. Search for the most relevant and recent information
2. Summarize findings clearly and concisely
3. Include important context and sources
4. Verify information across multiple sources when possible

For general conversation, respond naturally without using tools.`;

  if (!context.context?.conversationHistory || context.context.conversationHistory.length === 0) {
    return searchInstructions;
  }

  const recentHistory = context.context.conversationHistory
    .slice(-AGENT_CONFIG.MAX_CONVERSATION_HISTORY)
    .join('\n');

  return `${searchInstructions}\n\nPrevious conversation context:\n${recentHistory}`;
};

/**
 * Build instructions for a documentation-focused agent
 */
export const buildDocumentationInstructions = (context: InstructionsContext): string => {
  const docsInstructions = `You are a documentation specialist with access to the latest library and framework documentation.

AVAILABLE TOOLS:
1. **Context7 MCP Tools**: Use resolve-library-id and get-library-docs for latest documentation

WHEN TO USE CONTEXT7 MCP TOOLS:
- Questions about specific libraries, frameworks, or LLMs
- "Latest features", "how to use", "API reference", "documentation" queries
- Programming-related queries about React, Next.js, OpenAI, LangChain, Anthropic, etc.
- ALWAYS use resolve-library-id FIRST, then get-library-docs

RESPONSE GUIDELINES:
- Always follow the two-step process for documentation queries
- Provide the most current and accurate information
- Include code examples when available
- Structure responses clearly with sections
- Reference official documentation sources

Examples of documentation queries:
${EXAMPLE_QUERIES.DOCS.map(q => `- "${q}"`).join('\n')}

Documentation query process:
1. Use resolve-library-id with the library name (e.g., "react", "nextjs", "openai")
2. Then use get-library-docs with the returned library ID to fetch documentation

When you use the documentation tools:
1. Always start with resolve-library-id to find the correct library
2. Use get-library-docs to fetch the most current documentation
3. Provide clear, well-organized responses with examples
4. Include relevant API references and usage patterns

For general conversation, respond naturally without using tools.`;

  if (!context.context?.conversationHistory || context.context.conversationHistory.length === 0) {
    return docsInstructions;
  }

  const recentHistory = context.context.conversationHistory
    .slice(-AGENT_CONFIG.MAX_CONVERSATION_HISTORY)
    .join('\n');

  return `${docsInstructions}\n\nPrevious conversation context:\n${recentHistory}`;
};

/**
 * Build minimal instructions for a general chat agent
 */
export const buildGeneralChatInstructions = (context: InstructionsContext): string => {
  const chatInstructions = `You are a helpful and friendly assistant for general conversation.

CAPABILITIES:
- Engaging in natural conversation
- Answering general questions
- Providing advice and suggestions
- Discussing various topics
- Being helpful and supportive

GUIDELINES:
- Be conversational and friendly
- Provide helpful and accurate information
- Ask clarifying questions when needed
- Stay engaging and supportive
- Avoid using tools for simple conversations

For general conversation, respond naturally and helpfully.`;

  if (!context.context?.conversationHistory || context.context.conversationHistory.length === 0) {
    return chatInstructions;
  }

  const recentHistory = context.context.conversationHistory
    .slice(-AGENT_CONFIG.MAX_CONVERSATION_HISTORY)
    .join('\n');

  return `${chatInstructions}\n\nPrevious conversation context:\n${recentHistory}`;
};

/**
 * Instruction builder factory for different agent types
 */
export const instructionBuilders = {
  default: buildInstructions,
  weather: buildWeatherInstructions,
  search: buildSearchInstructions,
  documentation: buildDocumentationInstructions,
  chat: buildGeneralChatInstructions,
} as const;

/**
 * Get instruction builder by type
 */
export const getInstructionBuilder = (type: keyof typeof instructionBuilders = 'default') => {
  return instructionBuilders[type];
};

/**
 * Build context-aware instructions for any agent type
 */
export const buildContextAwareInstructions = (
  type: keyof typeof instructionBuilders,
  context: InstructionsContext
): string => {
  const builder = getInstructionBuilder(type);
  return builder(context);
};

/**
 * Helper function to determine the best instruction type based on query
 */
export const inferInstructionType = (query: string): keyof typeof instructionBuilders => {
  const lowerQuery = query.toLowerCase();
  
  // Check for weather patterns
  if (/weather|temperature|hot|cold|rain|snow|sunny|cloudy|humid|wind|forecast/i.test(lowerQuery)) {
    return 'weather';
  }
  
  // Check for search patterns
  if (/search|find|look up|latest|news|information about/i.test(lowerQuery)) {
    return 'search';
  }
  
  // Check for documentation patterns
  if (/documentation|docs|api|library|framework|react|nextjs|openai|langchain|anthropic|features|how to use/i.test(lowerQuery)) {
    return 'documentation';
  }
  
  // Default to general instructions for everything else
  return 'default';
};

/**
 * Build adaptive instructions that change based on query type
 */
export const buildAdaptiveInstructions = (
  query: string,
  context: InstructionsContext
): string => {
  const type = inferInstructionType(query);
  return buildContextAwareInstructions(type, context);
};