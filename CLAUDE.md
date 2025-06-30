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
- Set `OPENAI_API_KEY` environment variable before running either project

## Architecture

This is a workshop repository demonstrating OpenAI's Agents SDK with two progressive examples:

### 01-basic
A minimal TypeScript example demonstrating:
- Tool definition using Zod schemas
- Agent creation with the `@openai/agents` SDK
- Simple text-based interaction with the `o4-mini` model

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
- **Zod** - Runtime type validation for tool parameters
- **Next.js 15** with App Router - React framework for 02-voice
- **Tailwind CSS v4** - Styling for the web interface
- **TypeScript** - Type safety throughout both projects

### Key Patterns
1. Tools are defined using Zod schemas for parameter validation
2. The voice agent uses WebSocket connections for real-time communication
3. Session tokens are generated server-side for secure client authentication
4. Agent handoffs allow specialization (e.g., weather queries handled by dedicated agent)