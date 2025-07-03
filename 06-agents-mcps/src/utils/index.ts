/**
 * Utility functions for the MCP agents application
 */

/**
 * CLI utilities
 */
export const cliUtils = {
  /**
   * Clear console screen
   */
  clearScreen(): void {
    console.clear();
  },

  /**
   * Print separator line
   */
  printSeparator(char: string = '─', length: number = 50): void {
    console.log(char.repeat(length));
  },

  /**
   * Print formatted header
   */
  printHeader(title: string): void {
    cliUtils.printSeparator('═');
    console.log(`  ${title}`);
    cliUtils.printSeparator('═');
  },

  /**
   * Print formatted section
   */
  printSection(title: string): void {
    console.log(`\n📋 ${title}`);
    cliUtils.printSeparator();
  },
};

/**
 * Error handling utilities
 */
export const errorUtils = {
  /**
   * Format error for display
   */
  formatError(error: Error | any): string {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}`;
    }
    return String(error);
  },

  /**
   * Check if error is network related
   */
  isNetworkError(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    return message.includes('network') || 
           message.includes('connection') || 
           message.includes('timeout') ||
           message.includes('econnrefused') ||
           message.includes('enotfound');
  },

  /**
   * Check if error is API key related
   */
  isApiKeyError(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    const status = error?.response?.status || 0;
    return message.includes('api key') || 
           message.includes('unauthorized') || 
           status === 401 || 
           status === 403;
  },

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: any): string {
    if (errorUtils.isNetworkError(error)) {
      return 'Network connection error. Please check your internet connection.';
    }
    
    if (errorUtils.isApiKeyError(error)) {
      return 'API key error. Please check your API key configuration.';
    }
    
    return errorUtils.formatError(error);
  },
};

/**
 * Validation utilities
 */
export const validationUtils = {
  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate URL format
   */
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validate location string
   */
  isValidLocation(location: string): boolean {
    return typeof location === 'string' && 
           location.trim().length > 0 && 
           location.trim().length <= 100;
  },

  /**
   * Validate API key format
   */
  isValidApiKey(apiKey: string): boolean {
    return typeof apiKey === 'string' && 
           apiKey.trim().length >= 10;
  },
};

/**
 * String formatting utilities
 */
export const stringUtils = {
  /**
   * Capitalize first letter
   */
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Truncate string with ellipsis
   */
  truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
  },

  /**
   * Convert camelCase to Title Case
   */
  camelToTitle(str: string): string {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (match) => match.toUpperCase())
      .trim();
  },

  /**
   * Remove extra whitespace
   */
  normalizeWhitespace(str: string): string {
    return str.replace(/\s+/g, ' ').trim();
  },
};

/**
 * Date/time utilities
 */
export const dateUtils = {
  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  /**
   * Format time for display
   */
  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  /**
   * Format datetime for display
   */
  formatDateTime(date: Date): string {
    return `${dateUtils.formatDate(date)} ${dateUtils.formatTime(date)}`;
  },

  /**
   * Get relative time string
   */
  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return dateUtils.formatDate(date);
  },
};

/**
 * Object utilities
 */
export const objectUtils = {
  /**
   * Deep clone an object
   */
  deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Check if object is empty
   */
  isEmpty(obj: any): boolean {
    if (obj === null || obj === undefined) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
  },

  /**
   * Get nested property safely
   */
  getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  },

  /**
   * Set nested property safely
   */
  setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!(key in current)) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  },
};

/**
 * Array utilities
 */
export const arrayUtils = {
  /**
   * Remove duplicates from array
   */
  unique<T>(array: T[]): T[] {
    return [...new Set(array)];
  },

  /**
   * Chunk array into smaller arrays
   */
  chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  /**
   * Shuffle array
   */
  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },
};

/**
 * Export all utilities
 */
export const utils = {
  cli: cliUtils,
  error: errorUtils,
  validation: validationUtils,
  string: stringUtils,
  date: dateUtils,
  object: objectUtils,
  array: arrayUtils,
}; 