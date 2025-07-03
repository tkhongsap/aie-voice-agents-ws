# 06-agents-mcps - AI Assistant with MCP Servers

An advanced AI assistant that uses Model Context Protocol (MCP) servers for specialized data retrieval, including weather data, air quality information, and latest documentation access.

## Features

- 🌤️ **Weather MCP Server** - Real-time weather data via custom MCP server implementation
- 🌬️ **Air Quality MCP Server** - Live air quality data and health recommendations via custom MCP server
- 📚 **Context7 MCP Server** - Latest documentation access via Context7 MCP server
- 🔄 **Dynamic Server Management** - Automatic connection handling and fallback strategies
- 💬 **Intelligent Conversations** - Context-aware responses based on connected MCP servers
- 🔧 **Modular Architecture** - Clean separation of concerns with extensible design

## MCP Servers

### Weather MCP Server
- **Purpose**: Provides real-time weather data
- **Data Source**: OpenWeatherMap API
- **Capabilities**: 
  - Current weather conditions
  - Temperature, humidity, wind speed
  - Visibility, pressure, cloudiness
  - Sunrise/sunset times

### Air Quality MCP Server
- **Purpose**: Provides air quality data and health recommendations
- **Data Source**: AQICN (Air Quality Index China Network) API
- **Capabilities**:
  - Air Quality Index (AQI)
  - Pollutant levels (PM2.5, PM10, NO2, SO2, CO, O3)
  - Health implications and recommendations
  - Dominant pollutant identification

### Context7 MCP Server
- **Purpose**: Provides latest documentation for libraries and frameworks
- **Data Source**: Context7 documentation service
- **Capabilities**:
  - Latest API documentation
  - Framework guides and tutorials
  - Version-specific information
  - Real-time updates

## Setup

### 1. Install Dependencies
```bash
cd 06-agents-mcps
npm install
```

### 2. Configure API Keys
Create a `.env` file in the root directory (one level up from this folder) with:

```env
# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_api_key_here

# Weather API Key (required for weather functionality)
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Air Quality API Key (required for air quality functionality)
AQICN_API_KEY=your_aqicn_api_key_here
```

#### Getting API Keys:
- **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- **OpenWeatherMap API Key**: Get free key from [OpenWeatherMap](https://openweathermap.org/api)
- **AQICN API Key**: Get free key from [AQICN API](https://aqicn.org/api/)

### 3. Run the Application
```bash
npm start
```
Or from the root directory:
```bash
npm run start:06
```

## Usage Examples

### Weather Queries
- "What's the weather in New York?"
- "How hot is it in Tokyo today?"
- "Is it raining in London?"
- "Tell me the current weather in Paris"

### Air Quality Queries
- "What's the air quality in Beijing?"
- "How's the air pollution in Delhi?"
- "Is the air quality good in San Francisco?"
- "Should I exercise outdoors in Los Angeles today?"

### Documentation Queries
- "What are the latest features in React 18?"
- "Show me the OpenAI API documentation"
- "Get the latest LangChain documentation"
- "What's new in Next.js 14?"
- "How do I use Anthropic Claude API?"

### Combined Queries
- "What's the weather and air quality in Shanghai?"
- "Is it safe to go jogging outdoors in Mumbai today?"

## Architecture

### MCP Server Implementation

Unlike traditional tools, this component uses MCP (Model Context Protocol) servers for data retrieval:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Weather MCP   │    │ Air Quality MCP │    │  Context7 MCP   │
│     Server      │    │     Server      │    │     Server      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ OpenWeatherMap  │    │   AQICN API     │    │ Context7 Service│
│      API        │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  MCP Agent      │
                    │  (OpenAI)       │
                    └─────────────────┘
```

### Project Structure
```
06-agents-mcps/
├── src/
│   ├── index.ts              # Main entry point
│   ├── config/               # Configuration management
│   │   └── index.ts          # Environment variables and settings
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts          # Shared interfaces and types
│   ├── servers/              # MCP server implementations
│   │   ├── weather-mcp-server.ts     # Weather data MCP server
│   │   ├── air-quality-mcp-server.ts # Air quality MCP server
│   │   ├── context7-mcp-server.ts    # Documentation MCP server
│   │   └── index.ts          # Server management utilities
│   ├── agent/                # Agent configuration and factory
│   │   ├── agent-config.ts   # Agent configuration builders
│   │   ├── agent-factory.ts  # Agent creation utilities
│   │   ├── instructions.ts   # Dynamic instruction generation
│   │   └── index.ts          # Agent exports
│   └── chat/                 # Chat interface
│       ├── chat-interface.ts # Interactive chat controller
│       └── index.ts          # Chat exports
├── package.json
├── tsconfig.json
└── README.md
```

## MCP Server Management

The application includes sophisticated MCP server management:

### Connection Handling
- Automatic server initialization
- Connection status monitoring
- Graceful error handling
- Fallback strategies for disconnected servers

### Server Status Monitoring
```typescript
// Get all server statuses
const statuses = mcpServerManager.getAllServerStatuses();

// Check specific server
const isConnected = mcpServerManager.isServerConnected('weather');

// Get connected servers
const connected = mcpServerManager.getConnectedServers();
```

### Dynamic Instructions
The agent's instructions are dynamically generated based on connected MCP servers:

```typescript
const instructions = buildInstructions({
  capabilities: {
    weather: true,
    airQuality: true,
    documentation: true
  },
  mcpServers: serverStatuses
});
```

## Error Handling

The application includes comprehensive error handling for:

### MCP Server Issues
- Connection failures
- Server timeouts
- Invalid responses
- Network connectivity problems

### API Key Issues
- Missing API keys
- Invalid API keys
- Rate limiting
- Quota exceeded

### General Issues
- Invalid user input
- Unexpected errors
- Graceful degradation

## Environment Support

The application adapts to different environments:

### Development
- Extended timeouts
- Verbose logging
- Debug information
- All servers enabled by default

### Production
- Optimized timeouts
- Essential logging only
- Error handling priority
- Server enablement based on API key availability

## Commands

- Type `quit`, `bye`, or `exit` to end the conversation
- Leave input empty and press Enter to continue without input

## Comparison with 05-agents-tools

| Feature | 05-agents-tools | 06-agents-mcps |
|---------|----------------|----------------|
| Data Retrieval | Direct API calls via tools | MCP servers |
| Weather | Weather tool | Weather MCP server |
| Air Quality | Not available | Air Quality MCP server |
| Documentation | Context7 MCP server | Context7 MCP server |
| Architecture | Tools + MCP hybrid | Pure MCP servers |
| Scalability | Limited by tool model | Highly scalable |
| Extensibility | Add new tools | Add new MCP servers |

## Technical Details

- **Model**: GPT-4.1-mini for efficient processing
- **Architecture**: Pure MCP server implementation
- **Language**: TypeScript with strict typing
- **Error Handling**: Comprehensive error management
- **Server Management**: Automatic connection handling
- **Streaming**: Real-time response processing

## Contributing

When adding new MCP servers:

1. Create server implementation in `src/servers/`
2. Add server configuration to `src/config/index.ts`
3. Register server in `src/servers/index.ts`
4. Update agent instructions in `src/agent/instructions.ts`
5. Add example queries to README

## License

This project is part of the AI Voice Agents Workshop. 