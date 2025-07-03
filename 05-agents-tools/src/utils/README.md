# Utils Module

The utils module provides shared utilities and helper functions used throughout the application.

## Components

### CLIInterface (`cli-interface.ts`)
Handles all command-line interface output and formatting:

**Display Methods:**
- `showWelcome()` - Welcome message with available tools
- `showMCPConnectionStatus()` - MCP server connection status
- `showProcessing()` - Processing indicator
- `showQueryTypeIndicator()` - Query-specific indicators
- `showGoodbye()` - Exit message
- `showError/Warning/Info/Success()` - Formatted messages
- `showSpinner()` - Loading spinner for non-streaming ops
- `showDivider()` - Visual section dividers

**Formatting:**
- `formatTimestamp()` - Human-readable timestamps
- `clearLine()` - Clear current terminal line

### ErrorHandler (`error-handler.ts`)
Centralized error handling with user-friendly messages:

**Error Types:**
- `MaxTurnsExceededError` - Conversation complexity limit
- `ModelBehaviorError` - Unexpected model behavior
- API errors (401, 404, 429, 500, etc.)
- Connection errors (ECONNREFUSED)
- Timeout errors (ETIMEDOUT)
- API key errors

**Methods:**
- `handleError()` - Main error dispatcher
- `formatErrorForLogging()` - Detailed error logging
- `getUserFriendlyMessage()` - Simple error messages

### Utility Functions (`index.ts`)

**Error Handling:**
- `formatError()` - Basic error formatting
- `ensureError()` - Convert unknown values to Error

**Text Processing:**
- `truncateText()` - Truncate long text with ellipsis
- `isEmptyOrWhitespace()` - Check for empty strings
- `capitalizeFirst()` - Capitalize first letter

**Type Conversions:**
- `parseBoolean()` - Parse string to boolean
- `getTimestamp()` - Get ISO timestamp

**Validation:**
- `isValidPort()` - Validate port numbers

**Async Utilities:**
- `delay()` - Promise-based delay

## Usage Examples

### CLI Interface
```typescript
const cli = new CLIInterface();

// Show welcome
cli.showWelcome(hasWeatherKey, isMCPConnected);

// Show progress
cli.showProcessing();

// Show error
cli.showError('Connection Failed', 'Unable to connect', 'Check your internet');

// Show spinner
const spinner = cli.showSpinner('Loading...');
// ... do work
spinner.stop();
```

### Error Handler
```typescript
const errorHandler = new ErrorHandler();

try {
  // ... operation
} catch (error) {
  errorHandler.handleError(error);
}

// Get user-friendly message
const message = errorHandler.getUserFriendlyMessage(error);
```

### Utility Functions
```typescript
// Text processing
const truncated = truncateText('Very long text...', 50);
const capitalized = capitalizeFirst('hello'); // "Hello"

// Validation
if (isValidPort(3000)) {
  // Valid port
}

// Async delay
await delay(1000); // Wait 1 second

// Error conversion
const error = ensureError(unknownValue);
```

## Design Principles

1. **User-Friendly Output**: All CLI output is formatted for clarity
2. **Consistent Styling**: Emojis and formatting follow patterns
3. **Error Context**: Errors include helpful suggestions
4. **Non-Blocking**: Utilities don't block the main thread
5. **Type Safety**: Full TypeScript support throughout