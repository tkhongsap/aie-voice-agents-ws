# 05-agents-tools - Advanced Assistant with Tools & Documentation

An advanced AI assistant that combines web search capabilities, live weather data, and latest documentation access via Context7 MCP using OpenAI Agents framework.

## Features

- 🌤️ **Live Weather Data** - Get current weather information for any location worldwide
- 🔍 **Web Search** - Search the internet for information on any topic
- 📚 **Latest Documentation** - Access up-to-date library and framework docs via Context7 MCP
- 💬 **Intelligent Tool Selection** - Automatically determines when to use tools vs. general conversation
- 🔄 **Streaming Responses** - Real-time response processing with progress indicators
- 📝 **Conversation History** - Maintains context across the conversation

## Setup

### 1. Install Dependencies
```bash
cd 05-agents-tools
npm install
```

### 2. Configure API Keys
Create a `.env` file in the root directory (one level up from this folder) with:

```env
# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_api_key_here

# OpenWeatherMap API Key (required for weather functionality)
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

#### Getting API Keys:
- **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- **OpenWeatherMap API Key**: Get free key from [OpenWeatherMap](https://openweathermap.org/api)

### 3. Run the Application
```bash
npm start
```
Or from the root directory:
```bash
npm run start:05
```

## Usage Examples

### Weather Queries
- "What's the weather in New York?"
- "How hot is it in Tokyo today?"
- "Is it raining in London?"
- "Tell me the current weather in Paris"

### Search Queries
- "Search for the latest news about AI"
- "Find information about renewable energy"
- "Look up facts about the solar system"
- "What are the latest developments in quantum computing?"

### Documentation Queries
- "What are the latest features in React 18?"
- "Show me the OpenAI API documentation"
- "Get the latest LangChain documentation"
- "What's new in Next.js 14?"
- "How do I use Anthropic Claude API?"
- "Latest features in TypeScript"

### General Conversation
- "Hello, how are you?"
- "What can you help me with?"
- "Tell me something interesting"

## Features in Detail

### Weather Tool
- Provides comprehensive weather data including:
  - Current temperature (Celsius and Fahrenheit)
  - Weather description and conditions
  - Humidity, wind speed, and pressure
  - "Feels like" temperature
  - Visibility and cloudiness
  - Sunrise and sunset times
- Handles location not found errors gracefully
- Provides helpful error messages for API issues

### Web Search Tool
- Searches the internet for current information
- Summarizes findings in concise, organized responses
- Handles various search topics and queries
- Provides up-to-date information beyond training data

### Documentation Tool (Context7 MCP)
- Retrieves the latest documentation for libraries and frameworks via Context7 MCP server
- Accesses version-specific API documentation for rapidly evolving tools
- Supports popular libraries like React, Next.js, OpenAI, LangChain, Anthropic, TypeScript, Node.js, etc.
- Uses two-step process: resolve-library-id → get-library-docs for accurate results
- Provides up-to-date, authoritative documentation directly from official sources

### Smart Tool Selection
The assistant intelligently determines when to use tools:
- **Weather queries** trigger the weather tool
- **Documentation queries** trigger the Context7 MCP tool
- **Search queries** trigger web search
- **General conversation** uses natural language without tools

## Error Handling

The application includes comprehensive error handling for:
- Missing or invalid API keys
- Network connectivity issues
- Location not found errors
- Rate limiting and API quota issues
- Agent execution errors

## Commands

- Type `quit`, `bye`, or `exit` to end the conversation
- Leave input empty and press Enter to continue without input

## Technical Details

- Built with OpenAI Agents framework
- Uses GPT-4.1-mini model for efficient processing
- Integrates Context7 MCP server for latest documentation access
- Implements streaming responses for better user experience
- Maintains conversation context for coherent interactions
- Uses TypeScript for type safety
- Features robust error handling and fallback mechanisms

## Architecture

The application follows a modular architecture with clear separation of concerns:

### Project Structure
```
05-agents-tools/
├── src/
│   ├── index.ts          # Main entry point
│   ├── config/           # Configuration management
│   │   ├── constants.ts  # Application constants
│   │   ├── schemas.ts    # Zod validation schemas
│   │   └── index.ts      # Config exports
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts      # Shared interfaces and types
│   ├── tools/            # Tool implementations
│   │   ├── weather-tool.ts      # Weather API integration
│   │   ├── tool-factory.ts      # Tool creation utilities
│   │   └── index.ts             # Tool exports
│   ├── servers/          # MCP server integrations
│   │   ├── context7-server.ts   # Context7 documentation server
│   │   └── index.ts             # Server exports
│   ├── agent/            # Agent configuration
│   │   ├── agent-config.ts      # Agent settings
│   │   ├── agent-factory.ts     # Agent creation
│   │   ├── instructions.ts      # Dynamic instructions
│   │   └── index.ts             # Agent exports
│   ├── chat/             # Chat interface
│   │   ├── chat-interface.ts    # Main chat controller
│   │   ├── chat-loop.ts         # Conversation loop
│   │   ├── streaming-handler.ts # Stream processing
│   │   ├── query-classifier.ts  # Query type detection
│   │   └── index.ts             # Chat exports
│   └── utils/            # Utility functions
│       ├── cli-interface.ts     # CLI utilities
│       ├── error-handler.ts     # Error handling
│       └── index.ts             # Utils exports
├── package.json
├── tsconfig.json
└── README.md
```

### Key Modules

1. **Config Module**: Centralizes configuration and environment management
2. **Types Module**: Defines shared TypeScript interfaces and types
3. **Tools Module**: Implements tool integrations (weather, web search)
4. **Servers Module**: Manages MCP server connections
5. **Agent Module**: Handles agent creation and configuration
6. **Chat Module**: Manages the interactive chat interface
7. **Utils Module**: Provides utility functions and error handling

### Design Principles

- **Separation of Concerns**: Each module has a single, well-defined responsibility
- **Type Safety**: Full TypeScript implementation with strict typing
- **Error Resilience**: Comprehensive error handling at all levels
- **Extensibility**: Easy to add new tools or modify existing functionality
- **Testability**: Modular design enables unit testing of individual components
