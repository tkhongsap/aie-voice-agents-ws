/**
 * Weather tool implementation
 * Provides weather information for any location using OpenWeatherMap API
 */

import axios from 'axios';
import { tool } from '@openai/agents';
import { z } from 'zod';
import { WEATHER_CONFIG, ERROR_MESSAGES } from '../config';
import type { WeatherToolResponse, WeatherAPIResponse, WeatherData } from '../types';

/**
 * Weather tool for getting current weather information
 * Uses OpenWeatherMap API to fetch real-time weather data
 */
export const weatherTool = tool({
  name: 'get_weather',
  description: 'Get current weather information for a specific city or location',
  parameters: z.object({
    location: z.string().describe('The city or location to get weather for (e.g., "New York", "London, UK", "Tokyo, Japan")')
  }),
  execute: async ({ location }: { location: string }): Promise<WeatherToolResponse> => {
    try {
      // Check if API key is configured
      if (!WEATHER_CONFIG.API_KEY) {
        return {
          error: ERROR_MESSAGES.WEATHER_API_KEY_MISSING,
          instructions: ERROR_MESSAGES.WEATHER_API_KEY_INSTRUCTIONS
        };
      }

      console.log(`🌤️ Fetching weather data for: ${location}`);
      
      // Fetch current weather from OpenWeatherMap API
      const weatherResponse = await axios.get<WeatherAPIResponse>(
        `${WEATHER_CONFIG.BASE_URL}/weather?q=${encodeURIComponent(location)}&appid=${WEATHER_CONFIG.API_KEY}&units=${WEATHER_CONFIG.DEFAULT_UNITS}`
      );

      const weatherData = weatherResponse.data;
      
      // Format the weather information
      const weather: WeatherData = {
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

    } catch (error: any) {
      console.error('Weather API error:', error.response?.data || error.message);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        return {
          error: ERROR_MESSAGES.WEATHER_API_INVALID,
          instructions: ERROR_MESSAGES.WEATHER_API_INVALID_INSTRUCTIONS
        };
      } else if (error.response?.status === 404) {
        return {
          error: `${ERROR_MESSAGES.WEATHER_LOCATION_NOT_FOUND.replace('Location', `Location "${location}"`)}`,
          suggestion: ERROR_MESSAGES.WEATHER_LOCATION_SUGGESTION
        };
      } else {
        return {
          error: ERROR_MESSAGES.WEATHER_FETCH_ERROR,
          details: error.message
        };
      }
    }
  }
});

/**
 * Helper function to validate weather tool parameters
 */
export const validateWeatherParams = (params: any): params is { location: string } => {
  return typeof params?.location === 'string' && params.location.trim().length > 0;
};

/**
 * Helper function to format temperature in both Celsius and Fahrenheit
 */
export const formatTemperature = (celsius: number): string => {
  const fahrenheit = Math.round(celsius * 9/5 + 32);
  return `${Math.round(celsius)}°C (${fahrenheit}°F)`;
};

/**
 * Helper function to format weather data for display
 */
export const formatWeatherData = (data: WeatherData): string => {
  return `Weather in ${data.location}:
🌡️ Temperature: ${data.temperature}
🌤️ Condition: ${data.description}
💧 Humidity: ${data.humidity}
💨 Wind: ${data.windSpeed}
🌅 Sunrise: ${data.sunrise}
🌅 Sunset: ${data.sunset}
☁️ Cloudiness: ${data.cloudiness}
👁️ Visibility: ${data.visibility}
📊 Pressure: ${data.pressure}`;
};

/**
 * Weather tool factory for creating customized weather tools
 */
export const createWeatherTool = (options?: {
  name?: string;
  description?: string;
  units?: 'metric' | 'imperial' | 'kelvin';
}) => {
  const { name = 'get_weather', description = 'Get current weather information for a specific city or location', units = 'metric' } = options || {};
  
  return tool({
    name,
    description,
    parameters: z.object({
      location: z.string().describe('The city or location to get weather for (e.g., "New York", "London, UK", "Tokyo, Japan")')
    }),
    execute: async ({ location }: { location: string }): Promise<WeatherToolResponse> => {
      // Re-implement weather fetching with custom units
      try {
        if (!WEATHER_CONFIG.API_KEY) {
          return {
            error: ERROR_MESSAGES.WEATHER_API_KEY_MISSING,
            instructions: ERROR_MESSAGES.WEATHER_API_KEY_INSTRUCTIONS
          };
        }

        console.log(`🌤️ Fetching weather data for: ${location} (${units})`);
        
        const weatherResponse = await axios.get<WeatherAPIResponse>(
          `${WEATHER_CONFIG.BASE_URL}/weather?q=${encodeURIComponent(location)}&appid=${WEATHER_CONFIG.API_KEY}&units=${units}`
        );

        const weatherData = weatherResponse.data;
        
        // Format temperature based on units
        const formatTemp = (temp: number) => {
          if (units === 'imperial') {
            return `${Math.round(temp)}°F`;
          } else if (units === 'kelvin') {
            return `${Math.round(temp)}K`;
          }
          return `${Math.round(temp)}°C`;
        };

        const weather: WeatherData = {
          location: `${weatherData.name}, ${weatherData.sys.country}`,
          temperature: formatTemp(weatherData.main.temp),
          description: weatherData.weather[0].description,
          humidity: `${weatherData.main.humidity}%`,
          windSpeed: `${weatherData.wind.speed} m/s`,
          feelsLike: formatTemp(weatherData.main.feels_like),
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

      } catch (error: any) {
        console.error('Weather API error:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
          return {
            error: ERROR_MESSAGES.WEATHER_API_INVALID,
            instructions: ERROR_MESSAGES.WEATHER_API_INVALID_INSTRUCTIONS
          };
        } else if (error.response?.status === 404) {
          return {
            error: `${ERROR_MESSAGES.WEATHER_LOCATION_NOT_FOUND.replace('Location', `Location "${location}"`)}`,
            suggestion: ERROR_MESSAGES.WEATHER_LOCATION_SUGGESTION
          };
        } else {
          return {
            error: ERROR_MESSAGES.WEATHER_FETCH_ERROR,
            details: error.message
          };
        }
      }
    }
  });
};