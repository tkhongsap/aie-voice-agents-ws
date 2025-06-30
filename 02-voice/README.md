# Voice Agent Demo

A real-time voice chat application that allows you to have spoken conversations with AI agents using OpenAI's Realtime API.

## Overview

This Next.js application demonstrates:
- Real-time voice conversations with AI
- Agent handoffs between specialized agents
- Tool usage with approval workflows
- WebSocket-based communication for low latency

## Prerequisites

- Node.js v22 or newer
- OpenAI API key with access to the Realtime API
- A microphone and speakers/headphones
- Modern web browser with WebRTC support

## Setup

1. Ensure you have a `.env` file in the parent directory with:
   ```
   OPENAI_API_KEY=your-api-key-here
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. Click the "Connect" button to establish a voice session
2. Allow microphone access when prompted by your browser
3. Start speaking - the AI will listen and respond
4. Try asking about the weather to see agent handoff in action
5. When tools are used, approve them via the browser prompt
6. Click "Disconnect" to end the session

## Features

### 🎤 Real-time Voice Chat
- Speak naturally with the AI assistant
- Low-latency responses using WebSocket connections
- Automatic speech recognition and synthesis

### 🤝 Agent Handoffs
The demo includes two agents:
- **Main Voice Agent**: General-purpose assistant
- **Weather Agent**: Specialized for weather queries (speaks with a New York accent!)

When you ask about weather, the main agent hands off the conversation to the weather specialist.

### 🛠️ Tools
Agents can use tools to perform actions. The demo includes:
- `getWeather`: Returns weather information for a location (currently hardcoded to "sunny")

### ✅ Tool Approval
For safety, tool calls require user approval through a browser prompt.

### 📝 Conversation History
View the full conversation history in the UI, showing both user and assistant messages.

## Code Structure

```
02-voice/
├── src/app/
│   ├── page.tsx          # Main client component with UI and session management
│   ├── server/
│   │   └── token.ts      # Server action for generating session tokens
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── next.config.ts        # Next.js configuration
└── package.json          # Dependencies and scripts
```

### Key Components

#### `page.tsx`
- Manages the realtime session lifecycle
- Handles WebSocket events
- Renders UI and conversation history
- Implements tool approval flow

#### `server/token.ts`
- Server-side function to generate secure session tokens
- Protects your API key from client exposure

## Key Concepts

### RealtimeAgent
Defines an AI agent with:
- Name and instructions
- Available tools
- Handoff capabilities to other agents

### RealtimeSession
Manages the WebSocket connection:
- Handles audio streaming
- Emits events for state changes
- Manages conversation history

### Tools
Functions that agents can call:
- Defined with Zod schemas for parameters
- Require user approval before execution
- Return results back to the agent

## Customization

### Adding New Tools
```typescript
const myTool = tool({
  name: "myTool",
  description: "What this tool does",
  parameters: z.object({
    param: z.string(),
  }),
  execute: async ({ param }) => {
    // Tool implementation
    return "result";
  },
});
```

### Creating New Agents
```typescript
const customAgent = new RealtimeAgent({
  name: "Custom Agent",
  instructions: "Your agent's personality and capabilities",
  tools: [myTool],
});
```

### Modifying Agent Behavior
Edit the `instructions` field to change how agents respond and behave.

## Troubleshooting

- **"OPENAI_API_KEY environment variable is missing"**: Ensure your `.env` file exists in the parent directory
- **No audio input/output**: Check browser permissions and audio device settings
- **Connection fails**: Verify your API key has access to the Realtime API

## Learn More

- [OpenAI Realtime API Documentation](https://platform.openai.com/docs/guides/realtime)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI Agents SDK](https://www.npmjs.com/package/@openai/agents)