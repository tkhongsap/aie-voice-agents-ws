/**
 * Air Quality MCP Server
 * Provides air quality data via AQICN API through MCP protocol
 */

import { MCPServerStdio } from '@openai/agents';
import { config, APP_MESSAGES, ERROR_MESSAGES } from '../config';
import type { MCPServerConfig, AirQualityData, MCPServerStatus } from '../types';
import axios from 'axios';

/**
 * Air Quality MCP Server implementation
 */
export class AirQualityMCPServer {
  private server: MCPServerStdio | null = null;
  private status: MCPServerStatus;
  private config: MCPServerConfig;

  constructor(serverConfig: MCPServerConfig) {
    this.config = serverConfig;
    this.status = {
      name: serverConfig.name,
      connected: false,
      capabilities: ['get_air_quality', 'get_aqi_forecast'],
    };
  }

  /**
   * Initialize the air quality MCP server
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
   * Get air quality data for a location
   */
  async getAirQuality(location: string): Promise<AirQualityData | null> {
    if (!config.airQualityApiKey) {
      console.warn(ERROR_MESSAGES.AIR_QUALITY_API_KEY_MISSING);
      return null;
    }

    try {
      const response = await axios.get(
        `https://api.waqi.info/feed/${encodeURIComponent(location)}/`,
        {
          params: {
            token: config.airQualityApiKey,
          },
        }
      );

      const data = response.data;
      
      if (data.status !== 'ok') {
        throw new Error('Location not found or API error');
      }

      const feedData = data.data;
      
      // Get pollutants data
      const pollutants = {
        pm25: feedData.iaqi?.pm25?.v,
        pm10: feedData.iaqi?.pm10?.v,
        no2: feedData.iaqi?.no2?.v,
        so2: feedData.iaqi?.so2?.v,
        co: feedData.iaqi?.co?.v,
        o3: feedData.iaqi?.o3?.v,
      };

      // Determine dominant pollutant
      const dominentPollutant = this.getDominantPollutant(pollutants);

      // Get health implications
      const healthImplications = this.getHealthImplications(feedData.aqi);

      const airQualityData: AirQualityData = {
        location: feedData.city.name,
        aqi: feedData.aqi,
        level: this.getAQILevel(feedData.aqi),
        dominentPollutant,
        pollutants,
        timestamp: new Date(),
        healthImplications,
      };

      return airQualityData;
    } catch (error: any) {
      console.error('Air Quality API error:', error.response?.data || error.message);
      
      if (error.response?.status === 404 || error.message.includes('Location not found')) {
        throw new Error(ERROR_MESSAGES.LOCATION_NOT_FOUND);
      }
      
      throw new Error(ERROR_MESSAGES.FETCH_ERROR);
    }
  }

  /**
   * Get AQI level description
   */
  private getAQILevel(aqi: number): string {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  /**
   * Get dominant pollutant
   */
  private getDominantPollutant(pollutants: any): string {
    let maxValue = 0;
    let dominant = 'PM2.5';

    for (const [key, value] of Object.entries(pollutants)) {
      if (typeof value === 'number' && value > maxValue) {
        maxValue = value;
        dominant = key.toUpperCase();
      }
    }

    return dominant;
  }

  /**
   * Get health implications based on AQI
   */
  private getHealthImplications(aqi: number): string {
    if (aqi <= 50) {
      return 'Air quality is considered satisfactory, and air pollution poses little or no risk.';
    } else if (aqi <= 100) {
      return 'Air quality is acceptable for most people. However, sensitive individuals may experience minor symptoms.';
    } else if (aqi <= 150) {
      return 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.';
    } else if (aqi <= 200) {
      return 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.';
    } else if (aqi <= 300) {
      return 'Health warnings of emergency conditions. The entire population is more likely to be affected.';
    } else {
      return 'Health alert: everyone may experience more serious health effects. Avoid outdoor activities.';
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
      console.error('Error disconnecting air quality MCP server:', error.message);
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
 * Air Quality MCP server configuration
 */
export const airQualityServerConfig: MCPServerConfig = {
  name: config.mcpServers.airQuality.name,
  command: config.mcpServers.airQuality.command,
  url: config.mcpServers.airQuality.url,
};

/**
 * Create and initialize air quality MCP server
 */
export const createAirQualityMCPServer = async (): Promise<AirQualityMCPServer> => {
  const airQualityServer = new AirQualityMCPServer(airQualityServerConfig);
  await airQualityServer.initialize();
  return airQualityServer;
};

/**
 * Air Quality MCP server instance
 */
export const airQualityMCPServer = new AirQualityMCPServer(airQualityServerConfig);

/**
 * Initialize air quality MCP server
 */
export const initializeAirQualityMCPServer = async (): Promise<{
  server: AirQualityMCPServer;
  connected: boolean;
  error?: string;
}> => {
  try {
    const connected = await airQualityMCPServer.initialize();
    if (connected) {
      return { server: airQualityMCPServer, connected };
    } else {
      return { 
        server: airQualityMCPServer, 
        connected: false, 
        error: 'Failed to connect to air quality MCP server'
      };
    }
  } catch (error: any) {
    return { 
      server: airQualityMCPServer, 
      connected: false, 
      error: error.message 
    };
  }
};

/**
 * Air Quality service functions for direct API calls
 */
export const airQualityService = {
  /**
   * Get air quality data for a location
   */
  async getAirQuality(location: string): Promise<AirQualityData | null> {
    return await airQualityMCPServer.getAirQuality(location);
  },

  /**
   * Format air quality data for display
   */
  formatAirQualityData(airQuality: AirQualityData): string {
    return `Air Quality in ${airQuality.location}:
🌬️ AQI: ${airQuality.aqi} (${airQuality.level})
🏭 Dominant Pollutant: ${airQuality.dominentPollutant}
📊 Pollutants:
${airQuality.pollutants.pm25 ? `  • PM2.5: ${airQuality.pollutants.pm25} μg/m³` : ''}
${airQuality.pollutants.pm10 ? `  • PM10: ${airQuality.pollutants.pm10} μg/m³` : ''}
${airQuality.pollutants.no2 ? `  • NO2: ${airQuality.pollutants.no2} μg/m³` : ''}
${airQuality.pollutants.so2 ? `  • SO2: ${airQuality.pollutants.so2} μg/m³` : ''}
${airQuality.pollutants.co ? `  • CO: ${airQuality.pollutants.co} μg/m³` : ''}
${airQuality.pollutants.o3 ? `  • O3: ${airQuality.pollutants.o3} μg/m³` : ''}
💡 Health Implications: ${airQuality.healthImplications}`;
  },

  /**
   * Validate location input
   */
  validateLocation(location: string): boolean {
    return typeof location === 'string' && location.trim().length > 0;
  },
};

/**
 * Export air quality MCP server utilities
 */
export const airQualityMCPUtils = {
  server: airQualityMCPServer,
  service: airQualityService,
  config: airQualityServerConfig,
  createServer: createAirQualityMCPServer,
  initializeServer: initializeAirQualityMCPServer,
}; 