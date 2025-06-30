# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development Commands

From the root directory:
- `npm install` - Install dependencies for both projects
- `npm run start:01` - Run the basic text agent example
- `npm run start:02` - Start the Next.js voice agent development server

From 01-basic directory:
- `npm start` - Run the TypeScript agent directly with tsx

From 02-voice directory:
- `npm run dev` - Start Next.js dev server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run Next.js linter

### Environment Setup
- Requires Node.js v22 or newer
- Set `OPENAI_API_KEY` environment variable:
  - For 01-basic: Uses dotenv to load from parent directory's `.env` file
  - For 02-voice: Create `.env.local` file in the 02-voice directory (already gitignored)
- 02-voice requires microphone/audio access for voice features

## Architecture

This is a workshop repository demonstrating OpenAI's Agents SDK with two progressive examples:

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

### Technology Stack
- **OpenAI Agents SDK** (`@openai/agents`) - Core agent functionality
- **Model Context Protocol SDK** (`@modelcontextprotocol/sdk`) - Required dependency for agents-core
- **Zod** - Runtime type validation for tool parameters
- **Next.js 15** with App Router - React framework for 02-voice
- **Tailwind CSS v4** - Styling for the web interface
- **TypeScript** - Type safety throughout both projects
- **dotenv** - Environment variable loading for 01-basic

### Key Patterns
1. Tools are defined using Zod schemas for parameter validation
2. The voice agent uses WebSocket connections for real-time communication
3. Session tokens are generated server-side for secure client authentication
4. Agent handoffs allow specialization (e.g., weather queries handled by dedicated agent)

## Important Notes

### Environment Variable Handling
- **01-basic**: Manually loads `.env` from parent directory using dotenv configuration
- **02-voice**: Requires `.env.local` file in its own directory (Next.js convention)
- Never commit `.env` or `.env.local` files - they are gitignored

### Common Issues & Solutions
- **MCP SDK Error**: Install `@modelcontextprotocol/sdk` in 02-voice if missing
- **OPENAI_API_KEY Error in 02-voice**: Create `.env.local` file in 02-voice directory
- **Port Conflicts**: Next.js will automatically use next available port (e.g., 3001 if 3000 in use)

### Model Usage
- **01-basic**: Uses `gpt-4.1-nano` for text interactions
- **02-voice**: Uses `gpt-4o-realtime-preview-2025-06-03` for voice interactions