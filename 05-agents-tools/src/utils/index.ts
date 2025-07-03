/**
 * Utilities module
 * Contains helper functions and utilities
 */

export { CLIInterface } from './cli-interface';
export { ErrorHandler } from './error-handler';

// Existing utility functions
export function formatError(error: Error): string {
  return `Error: ${error.message}`;
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isValidPort(port: number): boolean {
  return port > 0 && port <= 65535;
}

// Additional utility functions
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function isEmptyOrWhitespace(str: string): boolean {
  return !str || str.trim().length === 0;
}

export function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function parseBoolean(value: string | undefined): boolean {
  return value?.toLowerCase() === 'true' || value === '1';
}

export function getTimestamp(): string {
  return new Date().toISOString();
}

export function ensureError(value: unknown): Error {
  if (value instanceof Error) return value;
  if (typeof value === 'string') return new Error(value);
  if (typeof value === 'object' && value !== null && 'message' in value) {
    return new Error(String(value.message));
  }
  return new Error('Unknown error');
}