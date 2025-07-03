import * as dotenv from 'dotenv';
import * as path from 'path';
import * as readline from 'readline';
import axios from 'axios';
import fetch from 'node-fetch';

// Load .env from parent directory
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

import { Agent, webSearchTool, Runner } from '@openai/agents';
import { z } from 'zod';

// Define conversation context interface
interface ConversationContext {
  conversationHistory: string[];
}

// Weather API configuration
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Context7 MCP configuration
const CONTEXT7_MCP_URL = 'https://mcp.context7.com/sse';

// Weather tool function
const weatherTool = () => ({
  name: 'get_weather',
  description: 'Get current weather information for a specific city or location',
  parameters: z.object({
    location: z.string().describe('The city or location to get weather for (e.g., "New York", "London, UK", "Tokyo, Japan")')
  }),
  fn: async ({ location }: { location: string }) => {
    try {
      if (!WEATHER_API_KEY) {
        return {
          error: 'Weather API key not configured. Please add OPENWEATHER_API_KEY to your .env file.',
          instructions: 'Get a free API key from https://openweathermap.org/api'
        };
      }

      console.log(`🌤️ Fetching weather data for: ${location}`);
      
      // Get current weather
      const weatherResponse = await axios.get(
        `${WEATHER_BASE_URL}/weather?q=${encodeURIComponent(location)}&appid=${WEATHER_API_KEY}&units=metric`
      );

      const weatherData = weatherResponse.data;
      
      // Format the weather information
      const weather = {
        location: `${weatherData.name}, ${weatherData.sys.country}`,
        temperature: `${Math.round(weatherData.main.temp)}°C (${Math.round(weatherData.main.temp * 9/5 + 32)}°F)`,
        description: weatherData.weather[0].description,
        humidity: `${weatherData.main.humidity}%`,
        windSpeed: `${weatherData.wind.speed} m/s`,
        feelsLike: `${Math.round(weatherData.main.feels_like)}°C (${Math.round(weatherData.main.feels_like * 9/5 + 32)}°F)`,
        pressure: `${weatherData.main.pressure} hPa`,
        visibility: weatherData.visibility ? `${weatherData.visibility / 1000} km` : 'N/A',
        cloudiness: `${weatherData.clouds.all}%`,
        sunrise: new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString(),
        sunset: new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()
      };

      return {
        success: true,
        data: weather,
        summary: `Current weather in ${weather.location}: ${weather.temperature}, ${weather.description}. Feels like ${weather.feelsLike}. Humidity: ${weather.humidity}, Wind: ${weather.windSpeed}.`
      };

    } catch (error) {
      console.error('Weather API error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        return {
          error: 'Invalid Weather API key. Please check your OPENWEATHER_API_KEY in the .env file.',
          instructions: 'Make sure you have a valid API key from https://openweathermap.org/api'
        };
      } else if (error.response?.status === 404) {
        return {
          error: `Location "${location}" not found. Please check the spelling and try again.`,
          suggestion: 'Try using a more specific location name, like "New York, NY" or "London, UK"'
        };
      } else {
        return {
          error: 'Unable to fetch weather data at this time.',
          details: error.message
        };
      }
    }
  }
});

// Context7 MCP tool for retrieving latest documentation
const context7Tool = () => ({
  name: 'get_docs',
  description: 'Get the latest documentation and information for libraries, frameworks, and LLMs using Context7 MCP server',
  parameters: z.object({
    library: z.string().describe('The library or framework to get documentation for (e.g., "react", "nextjs", "openai", "langchain", "anthropic")'),
    query: z.string().describe('Specific question or topic about the library (e.g., "latest features", "how to use", "API reference")')
  }),
  fn: async ({ library, query }: { library: string; query: string }) => {
    try {
      console.log(`📚 Fetching latest documentation for: ${library} - ${query}`);
      
      // Create a simple MCP client request to context7
      const mcpRequest = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: 'get_context',
          arguments: {
            library: library.toLowerCase(),
            query: query
          }
        }
      };

      const response = await fetch(CONTEXT7_MCP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(mcpRequest)
      });

      if (!response.ok) {
        // Fallback to direct context7 API if MCP endpoint is not available
        console.log('📚 Using Context7 direct API as fallback...');
        
        const fallbackResponse = await fetch(`https://api.context7.com/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            library: library,
            query: query,
            limit: 5
          })
        });

        if (!fallbackResponse.ok) {
          return {
            error: 'Context7 service temporarily unavailable. Please try web search for the latest documentation.',
            suggestion: `Try asking: "Search for latest ${library} documentation ${query}"`
          };
        }

        const fallbackData = await fallbackResponse.json();
        
        return {
          success: true,
          data: fallbackData,
          summary: `Latest ${library} documentation: ${fallbackData.content || 'Information retrieved successfully. Check the data for details.'}`
        };
      }

      const mcpData = await response.json();
      
      if (mcpData.error) {
        return {
          error: `Context7 MCP error: ${mcpData.error.message || 'Unknown error'}`,
          suggestion: `Try with a different library name or check if ${library} is supported`
        };
      }

      return {
        success: true,
        data: mcpData.result,
        summary: `Latest documentation for ${library}: ${mcpData.result?.content || 'Documentation retrieved successfully'}`
      };

    } catch (error) {
      console.error('Context7 MCP error:', error.message);
      
      return {
        error: 'Unable to fetch documentation at this time.',
        details: error.message,
        suggestion: 'Try using web search for the latest information instead'
      };
    }
  }
});

// Create multi-tool agent
const agent = new Agent<ConversationContext>({
  name: 'Advanced Assistant with Tools & Documentation',
  instructions: (context) => {
    const baseInstructions = `You are a helpful assistant with access to weather information, web search, and the latest documentation tools.

AVAILABLE TOOLS:
1. **Weather Tool**: Use get_weather for weather-related queries
2. **Web Search Tool**: Use webSearch for general information searches  
3. **Documentation Tool**: Use get_docs for the latest library/framework documentation via Context7 MCP

WHEN TO USE WEATHER TOOL:
- When users ask about weather, temperature, climate conditions
- Queries like "What's the weather in [location]?", "How hot is it in [city]?", "Will it rain in [place]?"
- Current weather conditions, temperature, humidity, wind, etc.

WHEN TO USE WEB SEARCH:
- When users explicitly ask to "search", "find", "look up" information
- Current events, facts, news, or general topics
- Information you don't have in your training data

WHEN TO USE DOCUMENTATION TOOL:
- When users ask about specific libraries, frameworks, or LLMs
- Questions about "latest features", "how to use", "API reference", "documentation"
- Programming-related queries about React, Next.js, OpenAI, LangChain, Anthropic, etc.
- When users want the most up-to-date information about rapidly evolving libraries

WHEN NOT TO USE TOOLS:
- General conversation (e.g., "hello", "how are you", "what can you do")
- Questions about your abilities or instructions
- Simple chat or requests for general advice

Examples of weather queries:
- "What's the weather like in Tokyo?"
- "How hot is it in Phoenix today?"
- "Is it raining in London?"

Examples of search queries:
- "Search for information about renewable energy"
- "What are the latest developments in AI?"
- "Find facts about the solar system"

Examples of documentation queries:
- "What are the latest features in React 18?"
- "How do I use OpenAI's new API?"
- "Show me the latest LangChain documentation"
- "What's new in Next.js 14?"
- "Get Anthropic Claude API documentation"

When you use tools:
1. Use the appropriate tool based on the query type
2. Provide clear, well-organized responses
3. Include the most relevant information
4. Keep responses concise but informative

For general conversation, respond naturally without using tools.`;

    if (!context.context?.conversationHistory || context.context.conversationHistory.length === 0) {
      return baseInstructions;
    }

    const recentHistory = context.context.conversationHistory.slice(-10).join('\n');
    return `${baseInstructions}\n\nPrevious conversation context:\n${recentHistory}`;
  },
  model: "gpt-4.1-mini",
  tools: [webSearchTool(), weatherTool(), context7Tool()],
  modelSettings: { temperature: 0.45, toolChoice: "auto" }
});

// Create custom runner
const runner = new Runner();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to handle the interactive chat
async function startChat() {
  console.log('🚀 Welcome to the Advanced Assistant with Tools & Documentation!');
  console.log('🌤️ I can help you with weather, web searches, and the latest documentation.');
  console.log('');
  console.log('✨ Available Tools:');
  console.log('  • 🌤️ Weather Tool - Get live weather data for any location');
  console.log('  • 🔍 Web Search - Search the internet for information');
  console.log('  • 📚 Documentation Tool - Get latest docs via Context7 MCP');
  console.log('  • 💬 General Chat - Have conversations without tools');
  console.log('');
  console.log('🌍 Weather Examples:');
  console.log('  • "What\'s the weather in New York?"');
  console.log('  • "How hot is it in Tokyo today?"');
  console.log('  • "Is it raining in London?"');
  console.log('');
  console.log('🔍 Search Examples:');
  console.log('  • "Search for the latest news about AI"');
  console.log('  • "Find information about renewable energy"');
  console.log('');
  console.log('📚 Documentation Examples:');
  console.log('  • "What are the latest features in React?"');
  console.log('  • "Show me OpenAI API documentation"');
  console.log('  • "Get the latest LangChain docs"');
  console.log('  • "What\'s new in Next.js?"');
  console.log('');
  
  // Check if weather API key is configured
  if (!WEATHER_API_KEY) {
    console.log('⚠️ Weather API Key Missing:');
    console.log('   Add OPENWEATHER_API_KEY to your .env file for weather functionality');
    console.log('   Get a free key at: https://openweathermap.org/api\n');
  }
  
  console.log('💡 Type "quit", "bye", or "exit" to end the conversation.\n');

  // Initialize conversation context
  const conversationContext: ConversationContext = {
    conversationHistory: []
  };

  const chatLoop = async (): Promise<void> => {
    return new Promise((resolve) => {
      rl.question('You: ', async (userInput) => {
        const trimmedInput = userInput.trim().toLowerCase();
        
        // Check for exit conditions
        if (trimmedInput === 'quit' || trimmedInput === 'bye' || trimmedInput === 'exit') {
          console.log('\n🚀 Thanks for using the Advanced Assistant! Goodbye!');
          rl.close();
          resolve();
          return;
        }

        // Skip empty inputs
        if (!userInput.trim()) {
          await chatLoop();
          resolve();
          return;
        }

        try {
          console.log('\n🧠 Processing...');
          
          // Add user input to conversation history
          conversationContext.conversationHistory.push(`User: ${userInput.trim()}`);
          
          // Determine likely tool usage for better user feedback
          const isWeatherQuery = /weather|temperature|hot|cold|rain|snow|sunny|cloudy|humid|wind|forecast/i.test(userInput);
          const isSearchQuery = /search|find|look up|latest|news|information about/i.test(userInput);
          const isDocsQuery = /documentation|docs|api|library|framework|react|nextjs|openai|langchain|anthropic|features|how to use/i.test(userInput);
          
          if (isWeatherQuery) {
            console.log('🌤️ Checking weather information...');
          } else if (isDocsQuery) {
            console.log('📚 Fetching latest documentation...');
          } else if (isSearchQuery) {
            console.log('🔍 Searching the web...');
          } else {
            console.log('💭 Thinking...');
          }
          
          // Run with streaming enabled
          const streamResult = await runner.run(
            agent,
            userInput.trim(),
            { 
              context: conversationContext,
              stream: true
            }
          );

          // Process streaming events
          let eventCount = 0;
          let hasShownProgress = false;
          
          for await (const _ of streamResult) {
            eventCount++;
            
            if (!hasShownProgress && eventCount > 1) {
              console.log('⚡ Processing with tools...');
              hasShownProgress = true;
            }
            
            if (eventCount % 3 === 0) {
              process.stdout.write('.');
            }
          }
          
          console.log('\n✅ Processing complete!');
          
          // Get final result
          const result = await runner.run(
            agent,
            userInput.trim(),
            { context: conversationContext }
          );

          // Add assistant response to conversation history
          conversationContext.conversationHistory.push(`Assistant: ${result.finalOutput}`);

          console.log(`\nAssistant: ${result.finalOutput}\n`);
          
          // Continue the chat loop
          await chatLoop();
          resolve();
        } catch (error) {
          // Enhanced error handling
          if (error.name === 'MaxTurnsExceededError') {
            console.error('\n⚠️ The agent reached the maximum number of turns. This might indicate a complex query or potential loop.');
            console.log('Try rephrasing your question or breaking it into smaller parts.\n');
          } else if (error.name === 'ModelBehaviorError') {
            console.error('\n⚠️ The model exhibited unexpected behavior. Please try again.');
            console.log('If this persists, try rephrasing your request.\n');
          } else {
            console.error('\n❌ Sorry, there was an error processing your message:', error.message || error);
            console.log('Please try again.\n');
          }
          
          // Continue the chat loop even after an error
          await chatLoop();
          resolve();
        }
      });
    });
  };

  await chatLoop();
}

// Start the interactive chat
startChat().catch((error) => {
  console.error('Failed to start chat:', error);
  process.exit(1);
});