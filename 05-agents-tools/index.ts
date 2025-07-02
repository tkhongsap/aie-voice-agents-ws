import * as dotenv from 'dotenv';
import * as path from 'path';
import * as readline from 'readline';
import axios from 'axios';

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

// Create multi-tool agent
const agent = new Agent<ConversationContext>({
  name: 'Advanced Assistant with Tools',
  instructions: (context) => {
    const baseInstructions = `You are a helpful assistant with access to web search and weather information tools.

AVAILABLE TOOLS:
1. **Weather Tool**: Use get_weather for weather-related queries
2. **Web Search Tool**: Use webSearch for general information searches

WHEN TO USE WEATHER TOOL:
- When users ask about weather, temperature, climate conditions
- Queries like "What's the weather in [location]?", "How hot is it in [city]?", "Will it rain in [place]?"
- Current weather conditions, temperature, humidity, wind, etc.

WHEN TO USE WEB SEARCH:
- When users explicitly ask to "search", "find", "look up" information
- Current events, facts, news, or specific topics not related to weather
- Information you don't have in your training data

WHEN NOT TO USE TOOLS:
- General conversation (e.g., "hello", "how are you", "what can you do")
- Questions about your abilities or instructions
- Simple chat or requests for general advice

Examples of weather queries:
- "What's the weather like in Tokyo?"
- "How hot is it in Phoenix today?"
- "Is it raining in London?"
- "Tell me the current weather in Paris"

Examples of search queries:
- "Search for information about renewable energy"
- "What are the latest developments in AI?"
- "Find facts about the solar system"

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
  tools: [webSearchTool(), weatherTool()],
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
  console.log('🚀 Welcome to the Advanced Assistant with Tools!');
  console.log('🌤️ I can help you with weather information and web searches.');
  console.log('');
  console.log('✨ Available Tools:');
  console.log('  • 🌤️ Weather Tool - Get live weather data for any location');
  console.log('  • 🔍 Web Search - Search the internet for information');
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
          
          if (isWeatherQuery) {
            console.log('🌤️ Checking weather information...');
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