# Building Voice Agents with OpenAI

Workshop at AI Engineer World's Fair 2025

## Requirements

- Node.js 22 or newer with npm installed.

  We will use Node.js for a consistent experience for all attendees but `bun` and `deno` are supported by the SDK.

- An OpenAI account with an OpenAI API key stored as `OPENAI_API_KEY` environment variable

## Setup

Clone this repository to have access to the boilerplate code for our workshop

```bash
git clone git@github.com:dkundel-openai/aie-voice-agents-workshop.git
cd aie-voice-agents-workshop
npm install
```

This will automatically install the [OpenAI Agents SDK](https://openai.github.io/openai-agents-js), [`zod`](https://zod.dev) and TypeScript for you.

## Project Structure

This workshop contains 6 progressive modules that build from basic text agents to advanced voice agents with multiple tools and MCP servers:

### [01-basic](01-basic/) - Basic Agent with Tools
A simple text-based agent to familiarize yourself with the [OpenAI Agents SDK for TypeScript](https://openai.github.io/openai-agents-js/).
- Simple weather tool integration
- Basic agent configuration
- Introduction to tools and execution

### [02-voice](02-voice/) - Voice Agent with Next.js
A Next.js application for building voice agents using the same SDK.
- Voice input/output capabilities
- Web-based interface
- Real-time voice processing
- Client-server architecture

### [03-hello](03-hello/) - Interactive Chat Assistant
An enhanced text-based assistant with conversation capabilities.
- Interactive chat interface
- Conversation history and context
- Continuous conversation loop
- Enhanced user experience

### [04-agents](04-agents/) - Advanced Search Agent
A sophisticated agent with web search capabilities and advanced features.
- Web search integration
- Streaming responses
- Enhanced error handling
- Smart tool usage decisions
- Advanced conversation management

### [05-agents-tools](05-agents-tools/) - Multi-Tool Assistant
The most advanced module featuring multiple integrated tools and services.
- 🌤️ Live weather data via OpenWeatherMap API
- 🔍 Web search capabilities
- 📚 Latest documentation access via Context7 MCP
- 💬 Intelligent tool selection
- 🔄 Streaming responses with progress indicators
- 📝 Conversation history and context management

### [06-agents-mcps](06-agents-mcps/) - MCP Server Integration
The ultimate module showcasing Model Context Protocol (MCP) server integration.
- 🌤️ **Weather MCP Server** - Real-time weather data via custom MCP server implementation
- 🌬️ **Air Quality MCP Server** - Live air quality data and health recommendations
- 📚 **Context7 MCP Server** - Latest documentation access via Context7 MCP server
- 🔄 **Dynamic Server Management** - Automatic connection handling and fallback strategies
- 💬 **Intelligent Conversations** - Context-aware responses based on connected MCP servers
- 🔧 **Modular Architecture** - Clean separation of concerns with extensible design

## Running Your Code

Each module can be run independently using the following commands:

### 01-basic
```bash
npm run start:01
```

### 02-voice
```bash
npm run start:02
```

### 03-hello
```bash
npm run start:03
```

### 04-agents
```bash
npm run start:04
```

### 05-agents-tools
```bash
npm run start:05
```

### 06-agents-mcps
```bash
npm run start:06
```

## Workshop Progression

The workshop is designed to progressively build your understanding:

1. **Start with 01-basic** to understand the core concepts of agents and tools
2. **Move to 02-voice** to explore voice capabilities in a web environment
3. **Try 03-hello** to learn about interactive chat and conversation management
4. **Advance to 04-agents** to understand web search integration and streaming
5. **Progress to 05-agents-tools** to see a full-featured multi-tool assistant
6. **Complete with 06-agents-mcps** to master MCP server integration and advanced architecture

## Environment Variables

For the advanced modules (04-agents, 05-agents-tools, and 06-agents-mcps), you'll need additional API keys:

```env
# Required for all modules
OPENAI_API_KEY=your_openai_api_key_here

# Required for 05-agents-tools and 06-agents-mcps weather functionality
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Required for 06-agents-mcps air quality functionality
AQICN_API_KEY=your_aqicn_api_key_here

# Optional for 05-agents-tools and 06-agents-mcps documentation features
CONTEXT7_API_KEY=your_context7_api_key_here
```

**Security Note**: Use the `.env.example` files in each module directory to set up your environment variables. See [SECURITY.md](SECURITY.md) for complete security guidelines.

## Security

⚠️ **Important**: This repository has addressed a security vulnerability where API keys were previously exposed in commit history. See [SECURITY.md](SECURITY.md) for:

- Complete security guidelines
- Required immediate actions for exposed keys
- Best practices for API key management
- Pre-commit hook setup for key detection

To set up security measures:

```bash
# Set up pre-commit hook for API key detection
./scripts/setup-pre-commit-hook.sh

# Copy environment template files
cp 05-agents-tools/.env.example 05-agents-tools/.env
cp 06-agents-mcps/.env.example 06-agents-mcps/.env
```

## Resources

- [Agents SDK Quickstart](https://openai.github.io/openai-agents-js/guides/quickstart)
- [Agents SDK Voice Quickstart](https://openai.github.io/openai-agents-js/guides/voice-agents/quickstart/)
- [Agents SDK Examples](https://github.com/openai/openai-agents-js-internal/tree/main/examples)
- [Details about Voice Agent Features](https://openai.github.io/openai-agents-js/guides/voice-agents/build/)
- [Voice Agents Guide on the OpenAI Docs](https://platform.openai.com/docs/guides/voice-agents)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs) - For understanding MCP servers
- [OpenWeatherMap API](https://openweathermap.org/api) - For weather data
- [AQICN API](https://aqicn.org/api/) - For air quality data
- [Context7 MCP](https://context7.com) - For documentation access
