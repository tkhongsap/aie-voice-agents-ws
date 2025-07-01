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

From 01-basic directory:
- `npm start` - Run the TypeScript agent directly with tsx

From 03-hello directory:
- `npm start` - Run the hello world agent example with tsx

From 04-agents directory:
- `npm start` - Run the search assistant agent with tsx

From 02-voice directory:
- `npm run dev` - Start Next.js dev server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run Next.js linter

### Environment Setup
- Requires Node.js v22 or newer
- Set `OPENAI_API_KEY` environment variable:
  - For 03-hello: Uses dotenv to load from parent directory's `.env` file
  - For 01-basic: Uses dotenv to load from parent directory's `.env` file
  - For 04-agents: Uses dotenv to load from parent directory's `.env` file
  - For 02-voice: Create `.env.local` file in the 02-voice directory (already gitignored)
- 02-voice requires microphone/audio access for voice features

## Architecture

This is a workshop repository demonstrating OpenAI's Agents SDK with four progressive examples:

### 03-hello
An interactive chat agent with conversation memory:
- Interactive command-line chat using readline interface
- **Conversation Context**: Implements `ConversationContext` interface to maintain chat history
- **Dynamic Instructions**: Uses `context.context.conversationHistory` to include previous conversation in agent instructions
- **Context Pattern**: Demonstrates proper usage of `RunContext<T>` for stateful conversations
- Uses `gpt-4.1-nano` model for conversations
- Continuous chat loop with graceful exit commands (quit/bye/exit)

### 01-basic
A minimal TypeScript example demonstrating:
- Tool definition using Zod schemas
- Agent creation with the `@openai/agents` SDK
- Simple text-based interaction with the `gpt-4.1-nano` model
- Uses `dotenv` to load environment variables from parent directory
- Includes hardcoded `getWeather` tool for demonstration

### 02-voice
A Next.js 15 application with real-time voice capabilities:
- **Client Component** (`src/app/page.tsx`): Manages WebSocket connections, voice sessions, and UI state
- **Server Action** (`src/app/server/token.ts`): Generates secure session tokens for client authentication
- **Key Features**:
  - Real-time voice interaction using `RealtimeAgent` and `RealtimeSession`
  - Agent handoff capabilities (main agent can hand off to weather agent)
  - Tool approval flow for interactive confirmation
  - Conversation history tracking

### 04-agents
A search assistant agent with web search capabilities:
- Interactive command-line chat using readline interface
- **Web Search Integration**: Uses built-in `webSearchTool()` from OpenAI Agents SDK
- **Intelligent Tool Usage**: Distinguishes between search queries and general conversation
- **Conversation Context**: Maintains chat history like 03-hello
- **Model Configuration**: Uses `gpt-4.1-mini` with temperature 0.45 and auto tool choice
- Demonstrates advanced tool integration and decision-making logic

### Technology Stack
- **OpenAI Agents SDK** (`@openai/agents`) - Core agent functionality
- **Model Context Protocol SDK** (`@modelcontextprotocol/sdk`) - Required dependency for agents-core
- **Zod** - Runtime type validation for tool parameters
- **Next.js 15** with App Router - React framework for 02-voice
- **Tailwind CSS v4** - Styling for the web interface
- **TypeScript** - Type safety throughout both projects
- **dotenv** - Environment variable loading for 01-basic

### Key Patterns
1. **Tool Definition**: Tools are defined using Zod schemas for parameter validation
2. **Context Management**: Use `RunContext<T>` for stateful conversations - access via `context.context.yourData`
3. **Voice Communication**: Voice agents use WebSocket connections for real-time interaction
4. **Authentication**: Session tokens are generated server-side for secure client authentication
5. **Agent Handoffs**: Specialized agents can be handed off to (e.g., weather agent with specific personality)
6. **Environment Loading**: CLI projects use dotenv to load from parent `.env`, Next.js uses `.env.local`

## OpenAI Agents SDK Patterns

### Agent Creation
- **Text Agents**: Use `Agent` class with optional `RunContext<T>` for state management
- **Voice Agents**: Use `RealtimeAgent` class for voice interactions
- **Dynamic Instructions**: Pass a function to `instructions` to generate context-aware prompts

### Context Access in Instructions
```typescript
// Correct way to access context in instructions
instructions: (context) => {
  // Access your data via context.context
  return `Instructions using ${context.context.yourData}`;
}
```

### Running Agents
- **Text**: `await run(agent, input, { context: yourContextData })`
- **Voice**: Create `RealtimeSession` with token authentication

### Built-in Tools
- **webSearchTool()**: Available from `@openai/agents`, used in 04-agents for web search capabilities
- **Custom Tools**: Defined with Zod schemas for parameter validation (see 01-basic example)

### Model Settings Configuration
```typescript
const agent = new Agent({
  // ... other config
  modelSettings: { 
    temperature: 0.45,     // Control randomness (04-agents example)
    toolChoice: "auto"     // Let model decide when to use tools
  }
});
```

## Important Notes

### Environment Variable Handling
- **03-hello**: Manually loads `.env` from parent directory using dotenv configuration
- **01-basic**: Manually loads `.env` from parent directory using dotenv configuration
- **04-agents**: Manually loads `.env` from parent directory using dotenv configuration
- **02-voice**: Requires `.env.local` file in its own directory (Next.js convention)
- Never commit `.env` or `.env.local` files - they are gitignored

### Common Issues & Solutions
- **MCP SDK Error**: Install `@modelcontextprotocol/sdk` in 02-voice if missing
- **OPENAI_API_KEY Error in 02-voice**: Create `.env.local` file in 02-voice directory
- **Port Conflicts**: Next.js will automatically use next available port (e.g., 3001 if 3000 in use)

### Model Usage
- **03-hello**: Uses `gpt-4.1-nano` for interactive chat conversations
- **01-basic**: Uses `gpt-4.1-nano` for text interactions
- **04-agents**: Uses `gpt-4.1-mini` with temperature 0.45 for search operations
- **02-voice**: Uses `gpt-4o-realtime-preview-2025-06-03` for voice interactions

## Development Guidelines

### Server Management
- After making changes, ALWAYS restart the server for testing
- Kill all existing related servers before starting new ones to avoid port conflicts
- Use `pkill -f` or `lsof -ti:PORT | xargs kill` to clean up running processes

### Code Development Principles
- **Iterate, don't recreate**: Always look for existing code to build upon instead of creating new implementations
- **Preserve patterns**: Do not drastically change established patterns - iterate on existing ones first
- **Prefer simplicity**: Choose simple solutions over complex ones
- **Avoid duplication**: Check for similar functionality elsewhere in the codebase before implementing
- **Environment awareness**: Write code that considers dev, test, and prod environments

### Change Management
- Only make changes that are explicitly requested or clearly related to the task
- When fixing bugs, exhaust all options with existing implementation before introducing new patterns
- If new patterns are introduced, remove old implementations to prevent duplicate logic
- Focus only on code areas relevant to the task - avoid unrelated changes
- Avoid major architectural changes to proven features unless explicitly instructed

### Code Organization
- Keep files under 200-300 lines - refactor when approaching this limit
- Maintain a clean and organized codebase structure
- Avoid writing one-time scripts in permanent files
- Write thorough tests for all major functionality

### Data Handling
- Never mock data for dev or prod environments - only use mocking in tests
- Never add stubbing or fake data patterns that affect dev/prod environments
- Use real data flows for development and production code

## External Resources

- [Agents SDK Documentation](https://openai.github.io/openai-agents-js)
- [Agents SDK Quickstart](https://openai.github.io/openai-agents-js/guides/quickstart)
- [Voice Agents Quickstart](https://openai.github.io/openai-agents-js/guides/voice-agents/quickstart/)
- [Voice Agents Build Guide](https://openai.github.io/openai-agents-js/guides/voice-agents/build/)
- [OpenAI Platform Voice Agents Guide](https://platform.openai.com/docs/guides/voice-agents)