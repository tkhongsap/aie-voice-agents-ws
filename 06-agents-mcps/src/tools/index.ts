/**
 * Tools module
 * Exports all available tools for the MCP agents
 * 
 * Architecture:
 * - Weather: Direct tool integration (not MCP server)
 * - Air Quality: Direct tool integration (not MCP server)  
 * - Documentation: Context7 MCP server (true MCP integration)
 */

export * from './air-quality-tool';

import { airQualityTool } from './air-quality-tool';

// Restore weather tool
import { tool } from '@openai/agents';
import { z } from 'zod';
import axios from 'axios';
import { config, ERROR_MESSAGES } from '../config';
import type { WeatherData } from '../types';

/**
 * Weather tool for getting current weather conditions
 * This is a direct tool, not an MCP server
 */
export const weatherTool = tool({
  name: 'get_weather',
  description: 'Get current weather conditions for a specific location',
  parameters: z.object({
    location: z.string().describe('The city or location to get weather for (e.g., "New York, NY" or "London, UK")'),
  }),
  execute: async ({ location }) => {
    if (!config.weatherApiKey) {
      return {
        error: ERROR_MESSAGES.WEATHER_API_KEY_MISSING,
        instructions: ERROR_MESSAGES.WEATHER_API_KEY_INSTRUCTIONS,
      };
    }

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            q: location,
            appid: config.weatherApiKey,
            units: 'metric',
          },
          timeout: 10000,
        }
      );

      const data = response.data;
      
      const weatherData: WeatherData = {
        location: `${data.name}, ${data.sys.country}`,
        temperature: Math.round(data.main.temp),
        temperatureUnit: '°C',
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        pressure: data.main.pressure,
        visibility: data.visibility / 1000, // Convert to km
        cloudiness: data.clouds.all,
        feelsLike: Math.round(data.main.feels_like),
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
        timestamp: new Date(),
      };

      return {
        success: true,
        data: weatherData,
        formatted: `Weather in ${weatherData.location}:
🌡️ Temperature: ${weatherData.temperature}${weatherData.temperatureUnit} (feels like ${weatherData.feelsLike}${weatherData.temperatureUnit})
📝 Description: ${weatherData.description}
💧 Humidity: ${weatherData.humidity}%
💨 Wind Speed: ${weatherData.windSpeed} m/s
⏰ Pressure: ${weatherData.pressure} hPa
👁️ Visibility: ${weatherData.visibility} km
☁️ Cloudiness: ${weatherData.cloudiness}%
🌅 Sunrise: ${weatherData.sunrise}
🌇 Sunset: ${weatherData.sunset}`,
      };
    } catch (error: any) {
      console.error('Weather API error:', error.response?.data || error.message);
      
      if (error.response?.status === 404) {
        return {
          error: ERROR_MESSAGES.LOCATION_NOT_FOUND,
          suggestion: ERROR_MESSAGES.LOCATION_SUGGESTION,
        };
      }
      
      if (error.code === 'ECONNABORTED') {
        return {
          error: 'Weather service request timed out. Please try again.',
        };
      }
      
      return {
        error: ERROR_MESSAGES.FETCH_ERROR,
        details: error.message,
      };
    }
  },
});

/**
 * All available tools (direct tools only, MCP servers handle their own tools)
 */
export const allTools = [
  weatherTool,
  airQualityTool,
];

/**
 * Tool collections for different agent types
 */
export const toolCollections = {
  weather: [weatherTool], // Direct tool integration
  airQuality: [airQualityTool], // Direct tool integration
  environmental: [weatherTool, airQualityTool], // Both direct tools
  documentation: [], // Documentation handled by Context7 MCP server
  all: allTools,
};

/**
 * Get tools based on enabled capabilities
 * Returns direct tools only - MCP servers provide their own tools
 */
export const getToolsForCapabilities = (capabilities: {
  weather?: boolean;
  airQuality?: boolean;
  documentation?: boolean;
}) => {
  const tools = [];
  
  if (capabilities.weather) {
    tools.push(weatherTool); // Direct tool integration
  }
  
  if (capabilities.airQuality) {
    tools.push(airQualityTool); // Direct tool integration
  }
  
  // Documentation tools are provided by Context7 MCP server natively
  // No direct tools needed for documentation
  
  return tools;
};