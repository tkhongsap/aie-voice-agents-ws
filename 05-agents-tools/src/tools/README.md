# Tools Module

This module contains all tool definitions and implementations for the 05-agents-tools project.

## Available Tools

### Weather Tool

The weather tool provides current weather information for any location using the OpenWeatherMap API.

**Usage:**
```typescript
import { weatherTool, createWeatherTool } from './weather-tool';

// Use the default weather tool
const tools = [weatherTool];

// Create a custom weather tool with imperial units
const imperialWeatherTool = createWeatherTool({
  name: 'get_weather_imperial',
  description: 'Get weather in Fahrenheit',
  units: 'imperial'
});
```

**Features:**
- Current weather conditions
- Temperature in Celsius and Fahrenheit
- Humidity, wind speed, and pressure
- Sunrise and sunset times
- Visibility and cloudiness
- Comprehensive error handling

**Configuration:**
- Requires `OPENWEATHER_API_KEY` environment variable
- Uses OpenWeatherMap API
- Supports metric, imperial, and kelvin units

### Tool Factory

The tool factory provides a flexible way to create and manage tools.

**Usage:**
```typescript
import { ToolFactory, toolCreators } from './tool-factory';

// Create a tool factory
const factory = new ToolFactory();

// Create a custom weather tool
const customWeatherTool = factory.createWeatherTool({
  name: 'weather_metric',
  units: 'metric'
});

// Create a generic text processing tool
const textTool = factory.createTextTool({
  name: 'text_processor',
  description: 'Process text',
  execute: async (text: string) => {
    return text.toUpperCase();
  }
});

// Use pre-configured tool creators
const weatherTool = toolCreators.weather();
const customTool = toolCreators.customWeather({ units: 'imperial' });
```

**Features:**
- Tool registry for managing tools
- Generic tool creation patterns
- Validation tools
- Batch tool creation
- Pre-configured tool creators

## Tool Structure

Each tool follows this pattern:

```typescript
import { tool } from '@openai/agents';
import { z } from 'zod';

export const myTool = tool({
  name: 'my_tool',
  description: 'Description of what the tool does',
  parameters: z.object({
    param1: z.string().describe('Parameter description'),
    param2: z.number().optional().describe('Optional parameter')
  }),
  execute: async ({ param1, param2 }) => {
    // Tool implementation
    return result;
  }
});
```

## Error Handling

Tools should handle errors gracefully and return structured error responses:

```typescript
return {
  error: 'Error message',
  instructions: 'How to fix the error',
  suggestion: 'Alternative suggestions',
  details: 'Technical details'
};
```

## Testing

Tools can be tested individually:

```typescript
// Test a tool
const result = await weatherTool.execute({ location: 'New York' });
console.log(result);
```

## Adding New Tools

1. Create a new file in the tools directory
2. Implement the tool using the standard pattern
3. Add exports to `index.ts`
4. Update the tool factory if needed
5. Add documentation to this README

## Best Practices

- Use descriptive names and descriptions
- Include comprehensive parameter validation
- Handle all error cases gracefully
- Add TypeScript types for better development experience
- Include helpful error messages and suggestions
- Test tools thoroughly before deployment