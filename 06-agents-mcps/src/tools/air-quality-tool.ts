/**
 * Air Quality tool for direct API integration  
 * Provides air quality data via AQICN API
 */

import { tool } from '@openai/agents';
import { z } from 'zod';
import axios from 'axios';
import { config, ERROR_MESSAGES } from '../config';
import type { AirQualityData } from '../types';

/**
 * Air Quality tool for getting current air quality conditions
 */
export const airQualityTool = tool({
  name: 'get_air_quality',
  description: 'Get current air quality conditions and health recommendations for a specific location',
  parameters: z.object({
    location: z.string().describe('The city or location to get air quality for (e.g., "Beijing", "Delhi", "Los Angeles")'),
  }),
  execute: async ({ location }) => {
    if (!config.airQualityApiKey) {
      return {
        error: ERROR_MESSAGES.AIR_QUALITY_API_KEY_MISSING,
        instructions: ERROR_MESSAGES.AIR_QUALITY_API_KEY_INSTRUCTIONS,
      };
    }

    try {
      const response = await axios.get(
        `https://api.waqi.info/feed/${encodeURIComponent(location)}/`,
        {
          params: {
            token: config.airQualityApiKey,
          },
          timeout: 10000,
        }
      );

      const data = response.data;
      
      if (data.status !== 'ok') {
        return {
          error: ERROR_MESSAGES.LOCATION_NOT_FOUND,
          suggestion: ERROR_MESSAGES.LOCATION_SUGGESTION,
        };
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
      const dominentPollutant = getDominantPollutant(pollutants);

      // Get health implications
      const healthImplications = getHealthImplications(feedData.aqi);

      const airQualityData: AirQualityData = {
        location: feedData.city.name,
        aqi: feedData.aqi,
        level: getAQILevel(feedData.aqi),
        dominentPollutant,
        pollutants,
        timestamp: new Date(),
        healthImplications,
      };

      return {
        success: true,
        data: airQualityData,
        formatted: formatAirQualityData(airQualityData),
      };
    } catch (error: any) {
      console.error('Air Quality API error:', error.response?.data || error.message);
      
      if (error.response?.status === 404 || error.message.includes('Location not found')) {
        return {
          error: ERROR_MESSAGES.LOCATION_NOT_FOUND,
          suggestion: ERROR_MESSAGES.LOCATION_SUGGESTION,
        };
      }
      
      if (error.code === 'ECONNABORTED') {
        return {
          error: 'Air quality service request timed out. Please try again.',
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
 * Get AQI level description
 */
function getAQILevel(aqi: number): string {
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
function getDominantPollutant(pollutants: any): string {
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
function getHealthImplications(aqi: number): string {
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
 * Format air quality data for display
 */
function formatAirQualityData(airQuality: AirQualityData): string {
  const pollutantLines = [];
  if (airQuality.pollutants.pm25) pollutantLines.push(`  • PM2.5: ${airQuality.pollutants.pm25} μg/m³`);
  if (airQuality.pollutants.pm10) pollutantLines.push(`  • PM10: ${airQuality.pollutants.pm10} μg/m³`);
  if (airQuality.pollutants.no2) pollutantLines.push(`  • NO2: ${airQuality.pollutants.no2} μg/m³`);
  if (airQuality.pollutants.so2) pollutantLines.push(`  • SO2: ${airQuality.pollutants.so2} μg/m³`);
  if (airQuality.pollutants.co) pollutantLines.push(`  • CO: ${airQuality.pollutants.co} μg/m³`);
  if (airQuality.pollutants.o3) pollutantLines.push(`  • O3: ${airQuality.pollutants.o3} μg/m³`);

  return `Air Quality in ${airQuality.location}:
🌬️ AQI: ${airQuality.aqi} (${airQuality.level})
🏭 Dominant Pollutant: ${airQuality.dominentPollutant}
📊 Pollutants:
${pollutantLines.join('\n')}
💡 Health Implications: ${airQuality.healthImplications}`;
}

/**
 * Air Quality service utilities
 */
export const airQualityService = {
  /**
   * Validate location input
   */
  validateLocation(location: string): boolean {
    return typeof location === 'string' && location.trim().length > 0;
  },

  /**
   * Format air quality data for display
   */
  formatAirQualityData,

  /**
   * Get AQI level description
   */
  getAQILevel,

  /**
   * Get health implications
   */
  getHealthImplications,
};