# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development Commands

From the root directory:
- `npm install` - Install dependencies for all projects
- `npm run start:01` - Run the basic text agent example  
- `npm run start:02` - Start the Next.js voice agent development server
- `npm run start:03` - Run the hello world agent example
- `npm run start:04` - Run the search assistant agent example
- `npm run start:05` - Run the multi-tool assistant with weather and docs
- `npm run start:06` - Run the advanced MCP server integration assistant

From individual project directories:
- `npm start` - Run TypeScript agents directly with tsx (01, 03, 04, 05)
- `npm run dev` - Start Next.js dev server with Turbopack (02-voice only)
- `npm run build` - Build for production (02-voice only)
- `npm run lint` - Run Next.js linter (02-voice only)

### Testing & Validation
- Kill existing servers before starting new ones: `pkill -f "npm run start"` or `lsof -ti:3000 | xargs kill`
- Verify environment variables are loaded: Check for API key errors in console
- Test weather functionality (05): Requires `OPENWEATHER_API_KEY` in .env
- Test air quality functionality (06): Requires `AQICN_API_KEY` in .env
- No formal testing framework configured - this is a workshop environment focused on interactive development

## Architecture

This is a workshop repository demonstrating OpenAI's Agents SDK with six progressive examples:

### Project Structure & Capabilities

**01-basic**: Minimal TypeScript example
- Tool definition using Zod schemas
- Single interaction with `gpt-4.1-nano`
- Hardcoded `getWeather` tool demonstration

**02-voice**: Next.js 15 real-time voice application
- `RealtimeAgent` and `RealtimeSession` for voice interactions
- WebSocket-based communication
- Agent handoff capabilities (main → weather agent)
- Server Actions for secure token generation
- Tool approval flow for interactive confirmation

**03-hello**: Interactive chat with memory
- `ConversationContext` interface for chat history
- Dynamic instructions using conversation context
- Continuous chat loop with graceful exit

**04-agents**: Advanced search assistant
- Built-in `webSearchTool()` integration
- Custom `Runner` with streaming execution
- Enhanced error handling (`MaxTurnsExceededError`, `ModelBehaviorError`)
- Real-time progress indicators

**05-agents-tools**: Multi-tool assistant
- Weather data via OpenWeatherMap API
- Web search capabilities
- Documentation access via Context7 MCP
- Intelligent tool selection based on query patterns
- Fallback mechanisms for API failures

**06-agents-mcps**: Advanced MCP server integration
- Pure MCP server architecture (no traditional tools)
- Weather MCP server with OpenWeatherMap API
- Air quality MCP server with AQICN API
- Context7 MCP server for documentation
- Dynamic server management and connection handling
- Comprehensive error handling and fallback strategies

### Key Patterns

**Agent Creation**:
```typescript
// Text agent with context
const agent = new Agent<ConversationContext>({
  name: "Agent Name",
  instructions: (context) => {
    // Access context via context.context.yourData
    return `Instructions using ${context.context.yourData}`;
  },
  model: "gpt-4.1-mini",
  tools: [tool1, tool2],
  modelSettings: { temperature: 0.45, toolChoice: "auto" }
});
```

**Tool Definition**:
```typescript
const myTool = () => ({
  name: "tool_name",
  description: "What this tool does",
  parameters: z.object({
    param: z.string().describe("Parameter description")
  }),
  fn: async ({ param }) => {
    // Implementation
    return { result: "data" };
  }
});
```

**Running Agents**:
```typescript
// Basic execution
const result = await run(agent, input, { context: contextData });

// Advanced with streaming
const runner = new Runner();
const streamResult = await runner.run(agent, input, { 
  context: contextData,
  stream: true 
});
```

### Environment Configuration

**Environment Variables**:
- CLI projects (01, 03, 04, 05, 06): Load `.env` from parent directory using `dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') })`
- Next.js (02): Uses `.env.local` in its own directory
- Required: `OPENAI_API_KEY`
- Optional: `OPENWEATHER_API_KEY` (for 05-agents-tools and 06-agents-mcps weather features)
- Optional: `AQICN_API_KEY` (for 06-agents-mcps air quality feature)

**Model Selection**:
- Simple interactions: `gpt-4.1-nano`
- Complex tasks: `gpt-4.1-mini` with temperature 0.45
- Voice: `gpt-4o-realtime-preview-2025-06-03`

### Development Guidelines

**Code Organization**:
- Keep agent definitions focused and single-purpose
- Use TypeScript interfaces for context types
- Implement proper error handling with user-friendly messages
- Use streaming for better UX in long-running operations
- Follow the progressive complexity pattern: start simple, add sophistication incrementally

**Module Structure Patterns**:
- Simple modules (01, 03, 04): Single `index.ts` file with direct execution
- Advanced modules (05, 06): Structured `/src` directory with agent/, chat/, tools/, and utils/ folders
- Next.js module (02): App Router with server actions for secure token generation

**Tool Development**:
- Define clear, descriptive tool names and descriptions
- Use Zod for robust parameter validation
- Return structured data that agents can interpret
- Include error handling with helpful fallback messages

**Context Management**:
- Maintain conversation history in context objects
- Limit history size to prevent token overflow
- Access context data via `context.context` in instructions
- Pass context consistently through agent runs

**MCP Server Management**:
- **Server Initialization**: Automatic connection handling for MCP servers
- **Connection Monitoring**: Real-time status tracking and health checks
- **Error Handling**: Graceful degradation when servers are unavailable
- **Dynamic Instructions**: Agent capabilities adjust based on connected servers
- **Fallback Strategies**: Intelligent fallback when specific servers fail

### Common Issues & Solutions

**Port Conflicts**: 
- Next.js auto-selects next available port if 3000 is taken
- Kill existing processes before starting new ones

**API Key Errors**:
- CLI projects: Ensure `.env` exists in parent directory
- Next.js: Create `.env.local` in 02-voice directory
- Verify keys are valid and have appropriate permissions

**MCP SDK Missing**:
- Run `npm install @modelcontextprotocol/sdk` if import errors occur
- This is a required peer dependency for agents-core

**Agent Errors**:
- `MaxTurnsExceededError`: Simplify query or increase turn limit
- `ModelBehaviorError`: Retry or rephrase request
- Tool execution failures: Check API keys and network connectivity

**MCP Server Issues**:
- Server connection failures: Check API keys and network connectivity
- Server timeout errors: Increase timeout values in server configuration
- Invalid responses: Verify API key permissions and rate limits
- Missing servers: Ensure required environment variables are set (OPENWEATHER_API_KEY, AQICN_API_KEY)

## Quick Reference

### Workshop Progression
1. **01-basic**: Foundation concepts (single tool, basic execution)
2. **02-voice**: Next.js voice application (WebSocket, real-time)
3. **03-hello**: Interactive chat (conversation context, loops)
4. **04-agents**: Advanced features (web search, streaming, error handling)
5. **05-agents-tools**: Multi-tool integration (weather, web search, MCP)
6. **06-agents-mcps**: Pure MCP architecture (air quality, weather, docs)

### Key Patterns
- **Environment loading**: `dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') })`
- **Context management**: Always truncate history with `.slice(-10)`
- **Agent execution**: `await run(agent, input, { context })`
- **Error handling**: Check for `MaxTurnsExceededError` and `ModelBehaviorError`
- **Exit commands**: `quit`, `bye`, `exit` for CLI modules

### Port Usage
- **Next.js (02-voice)**: Port 3000 (auto-assigns if occupied)
- **CLI modules**: No port usage (direct console interaction)

## External Resources

- [Agents SDK Documentation](https://openai.github.io/openai-agents-js)
- [Agents SDK Quickstart](https://openai.github.io/openai-agents-js/guides/quickstart)
- [Voice Agents Quickstart](https://openai.github.io/openai-agents-js/guides/voice-agents/quickstart/)
- [Voice Agents Build Guide](https://openai.github.io/openai-agents-js/guides/voice-agents/build/)
- [OpenAI Platform Voice Agents Guide](https://platform.openai.com/docs/guides/voice-agents)