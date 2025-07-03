/**
 * Query Classifier Module
 * Classifies user queries to determine likely tool usage
 */

import { QueryClassification, QueryType } from '../types';

/**
 * Classify a user query to determine its type
 */
export function classifyQuery(query: string): QueryClassification {
  const lowerQuery = query.toLowerCase();
  
  const isWeatherQuery = /weather|temperature|hot|cold|rain|snow|sunny|cloudy|humid|wind|forecast/i.test(query);
  const isSearchQuery = /search|find|look up|latest|news|information about/i.test(query);
  const isDocsQuery = /documentation|docs|api|library|framework|react|nextjs|openai|langchain|anthropic|features|how to use/i.test(query);
  const isGeneralChat = !isWeatherQuery && !isSearchQuery && !isDocsQuery;

  return {
    isWeatherQuery,
    isSearchQuery,
    isDocsQuery,
    isGeneralChat
  };
}

/**
 * Get the primary query type from a classification
 */
export function getPrimaryQueryType(classification: QueryClassification): QueryType {
  if (classification.isWeatherQuery) return 'weather';
  if (classification.isDocsQuery) return 'docs';
  if (classification.isSearchQuery) return 'search';
  return 'general';
}

/**
 * Get a human-readable description of the query type
 */
export function getQueryTypeDescription(type: QueryType): string {
  switch (type) {
    case 'weather':
      return 'Weather Query';
    case 'search':
      return 'Web Search';
    case 'docs':
      return 'Documentation Query';
    case 'general':
      return 'General Chat';
    default:
      return 'Unknown Query Type';
  }
}