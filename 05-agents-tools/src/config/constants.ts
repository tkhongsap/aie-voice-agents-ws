/**
 * Application constants
 * Contains regex patterns, classification rules, and other constants
 */

// Query classification patterns
export const QUERY_PATTERNS = {
  WEATHER: /weather|temperature|hot|cold|rain|snow|sunny|cloudy|humid|wind|forecast/i,
  SEARCH: /search|find|look up|latest|news|information about/i,
  DOCS: /documentation|docs|api|library|framework|react|nextjs|openai|langchain|anthropic|features|how to use/i,
} as const;

// Exit commands
export const EXIT_COMMANDS = ['quit', 'bye', 'exit'] as const;

// HTTP status codes for weather API
export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  OK: 200,
} as const;

// Agent instruction templates
export const INSTRUCTION_TEMPLATES = {
  BASE_INSTRUCTIONS: `You are a helpful assistant with access to weather information, web search, and the latest documentation tools.

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

For general conversation, respond naturally without using tools.`,
} as const;

// Temperature conversion constants
export const TEMPERATURE_CONVERSION = {
  CELSIUS_TO_FAHRENHEIT: (celsius: number) => celsius * 9/5 + 32,
  FAHRENHEIT_TO_CELSIUS: (fahrenheit: number) => (fahrenheit - 32) * 5/9,
} as const;

// Unit conversion constants
export const UNIT_CONVERSION = {
  METERS_TO_KILOMETERS: (meters: number) => meters / 1000,
  METERS_PER_SECOND_TO_KMH: (mps: number) => mps * 3.6,
  METERS_PER_SECOND_TO_MPH: (mps: number) => mps * 2.237,
} as const;

// Default values
export const DEFAULTS = {
  CONVERSATION_HISTORY_LIMIT: 10,
  TEMPERATURE_PRECISION: 0,
  VISIBILITY_UNIT: 'km',
  PRESSURE_UNIT: 'hPa',
  WIND_SPEED_UNIT: 'm/s',
  HUMIDITY_UNIT: '%',
  CLOUDINESS_UNIT: '%',
} as const;

// Tool names
export const TOOL_NAMES = {
  WEATHER: 'get_weather',
  WEB_SEARCH: 'webSearch',
  RESOLVE_LIBRARY_ID: 'resolve-library-id',
  GET_LIBRARY_DOCS: 'get-library-docs',
} as const;

// Model names
export const MODEL_NAMES = {
  GPT_4_MINI: 'gpt-4.1-mini',
  GPT_4_NANO: 'gpt-4.1-nano',
  GPT_4_TURBO: 'gpt-4-turbo',
} as const;

// Progress indicators
export const PROGRESS_INDICATORS = {
  DOTS: '...',
  SPINNER: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  WEATHER_EMOJI: '🌤️',
  SEARCH_EMOJI: '🔍',
  DOCS_EMOJI: '📚',
  THINKING_EMOJI: '🤔',
} as const;

// Time formatting
export const TIME_FORMAT = {
  LOCALE: 'en-US',
  OPTIONS: {
    hour: '2-digit' as const,
    minute: '2-digit' as const,
    second: '2-digit' as const,
  },
} as const;

// API endpoints
export const API_ENDPOINTS = {
  WEATHER: {
    CURRENT: '/weather',
    FORECAST: '/forecast',
  },
  CONTEXT7: {
    BASE: 'https://context7.io/api',
  },
} as const;

// Validation patterns
export const VALIDATION_PATTERNS = {
  API_KEY: /^[a-zA-Z0-9_-]+$/,
  CITY_NAME: /^[a-zA-Z\s,.-]+$/,
  COUNTRY_CODE: /^[A-Z]{2}$/,
} as const;

// Rate limiting
export const RATE_LIMITS = {
  WEATHER_API: {
    CALLS_PER_MINUTE: 60,
    CALLS_PER_HOUR: 1000,
  },
  OPENAI_API: {
    TOKENS_PER_MINUTE: 10000,
    REQUESTS_PER_MINUTE: 100,
  },
} as const;

// Cache settings
export const CACHE_SETTINGS = {
  WEATHER_TTL: 10 * 60 * 1000, // 10 minutes
  DOCS_TTL: 60 * 60 * 1000, // 1 hour
  SEARCH_TTL: 30 * 60 * 1000, // 30 minutes
} as const;