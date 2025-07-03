# Chat Module

The chat module handles all user interaction and conversation management for the Advanced Assistant application.

## Components

### ChatInterface (`chat-interface.ts`)
The main orchestrator that:
- Initializes MCP server connections
- Shows welcome messages and instructions
- Creates and manages the agent instance
- Starts the chat loop
- Handles cleanup on exit

### ChatLoop (`chat-loop.ts`)
Manages the interactive conversation loop:
- Handles user input via readline interface
- Processes exit commands (quit, bye, exit)
- Manages conversation context and history
- Coordinates with streaming handler for responses
- Continues loop after errors

### StreamingHandler (`streaming-handler.ts`)
Handles streaming responses from the agent:
- `streamResponse()` - Stream to console with real-time output
- `streamWithHandler()` - Stream with custom chunk handler
- `collectStream()` - Collect response without displaying

### QueryClassifier (`query-classifier.ts`)
Analyzes user queries to determine intent:
- Classifies queries as weather, search, docs, or general
- Provides user-friendly indicators for query types
- Helps show appropriate processing messages

## Usage

```typescript
import { chatInterface } from './chat';

// Start the chat interface
await chatInterface.start();

// Access conversation history
const history = chatInterface.getConversationHistory();

// Clear history
chatInterface.clearConversationHistory();
```

## Architecture

```
ChatInterface (Main Orchestrator)
    ├── ChatLoop (User Interaction)
    │   ├── readline interface
    │   ├── Query classification
    │   └── Error handling
    ├── StreamingHandler (Response Processing)
    │   └── Real-time text streaming
    └── CLIInterface (Visual Output)
        ├── Welcome messages
        ├── Progress indicators
        └── Error displays
```

## Error Handling

The chat module includes comprehensive error handling:
- `MaxTurnsExceededError` - Agent reached conversation limit
- `ModelBehaviorError` - Unexpected model behavior
- API errors with specific status codes
- Connection and timeout errors
- Graceful continuation after errors

## Conversation Context

The module maintains conversation history:
- Stores user and assistant messages
- Limits history to recent messages for context
- Passes context to agent for continuity
- Can be cleared or accessed programmatically