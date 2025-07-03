/**
 * Weather MCP Server
 * Provides weather data via OpenWeatherMap API through MCP protocol
 */

import { MCPServerStdio } from '@openai/agents';
import { config, APP_MESSAGES, ERROR_MESSAGES } from '../config';
import type { MCPServerConfig, WeatherData, MCPServerStatus } from '../types';
import axios from 'axios';

/**
 * Weather MCP Server implementation
 */
export class WeatherMCPServer {
  private server: MCPServerStdio | null = null;
  private status: MCPServerStatus;
  private config: MCPServerConfig;

  constructor(serverConfig: MCPServerConfig) {
    this.config = serverConfig;
    this.status = {
      name: serverConfig.name,
      connected: false,
      capabilities: ['get_weather', 'get_forecast'],
    };
  }

  /**
   * Initialize the weather MCP server
   */
  async initialize(): Promise<boolean> {
    try {
      // Create MCP server instance
      this.server = new MCPServerStdio({
        name: this.config.name,
        fullCommand: this.config.command,
      });

      // Connect to the server
      await this.server.connect();
      
      this.status.connected = true;
      this.status.lastConnected = new Date();
      delete this.status.lastError;

      console.log(`${APP_MESSAGES.MCP_CONNECTED} ${this.config.name}`);
      return true;
    } catch (error: any) {
      this.status.connected = false;
      this.status.lastError = error.message;
      console.error(`${APP_MESSAGES.MCP_FAILED} ${this.config.name}:`, error.message);
      return false;
    }
  }

  /**
   * Get current weather for a location
   */
  async getWeather(location: string): Promise<WeatherData | null> {
    if (!config.weatherApiKey) {
      console.warn(ERROR_MESSAGES.WEATHER_API_KEY_MISSING);
      return null;
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

      return weatherData;
    } catch (error: any) {
      console.error('Weather API error:', error.response?.data || error.message);
      
      if (error.response?.status === 404) {
        throw new Error(ERROR_MESSAGES.LOCATION_NOT_FOUND);
      }
      
      throw new Error(ERROR_MESSAGES.FETCH_ERROR);
    }
  }

  /**
   * Get the server status
   */
  getStatus(): MCPServerStatus {
    return { ...this.status };
  }

  /**
   * Check if the server is connected
   */
  isConnected(): boolean {
    return this.status.connected;
  }

  /**
   * Disconnect from the server
   */
  async disconnect(): Promise<boolean> {
    try {
      if (this.server) {
        await this.server.close();
        this.server = null;
      }
      this.status.connected = false;
      return true;
    } catch (error: any) {
      console.error('Error disconnecting weather MCP server:', error.message);
      return false;
    }
  }

  /**
   * Get server configuration
   */
  getConfig(): MCPServerConfig {
    return { ...this.config };
  }
}

/**
 * Weather MCP server configuration
 */
export const weatherServerConfig = {
  name: config.mcpServers.weather.name,
  command: config.mcpServers.weather.command,
  url: config.mcpServers.weather.url,
};

/**
 * Create and initialize weather MCP server
 */
export const createWeatherMCPServer = async (): Promise<WeatherMCPServer> => {
  const weatherServer = new WeatherMCPServer(weatherServerConfig);
  await weatherServer.initialize();
  return weatherServer;
};

/**
 * Weather MCP server instance
 */
export const weatherMCPServer = new WeatherMCPServer(weatherServerConfig);

/**
 * Initialize weather MCP server
 */
export const initializeWeatherMCPServer = async (): Promise<{
  server: WeatherMCPServer;
  connected: boolean;
  error?: string;
}> => {
  try {
    const connected = await weatherMCPServer.initialize();
    if (connected) {
      return { server: weatherMCPServer, connected };
    } else {
      return { 
        server: weatherMCPServer, 
        connected: false, 
        error: 'Failed to connect to weather MCP server'
      };
    }
  } catch (error: any) {
    return { 
      server: weatherMCPServer, 
      connected: false, 
      error: error.message 
    };
  }
};

/**
 * Weather service functions for direct API calls
 */
export const weatherService = {
  /**
   * Get weather data for a location
   */
  async getWeather(location: string): Promise<WeatherData | null> {
    return await weatherMCPServer.getWeather(location);
  },

  /**
   * Format weather data for display
   */
  formatWeatherData(weather: WeatherData): string {
    return `Weather in ${weather.location}:
🌡️ Temperature: ${weather.temperature}${weather.temperatureUnit} (feels like ${weather.feelsLike}${weather.temperatureUnit})
📝 Description: ${weather.description}
💧 Humidity: ${weather.humidity}%
💨 Wind Speed: ${weather.windSpeed} m/s
⏰ Pressure: ${weather.pressure} hPa
👁️ Visibility: ${weather.visibility} km
☁️ Cloudiness: ${weather.cloudiness}%
🌅 Sunrise: ${weather.sunrise}
🌇 Sunset: ${weather.sunset}`;
  },

  /**
   * Validate location input
   */
  validateLocation(location: string): boolean {
    return typeof location === 'string' && location.trim().length > 0;
  },
};

/**
 * Export weather MCP server utilities
 */
export const weatherMCPUtils = {
  server: weatherMCPServer,
  service: weatherService,
  config: weatherServerConfig,
  createServer: createWeatherMCPServer,
  initializeServer: initializeWeatherMCPServer,
}; 