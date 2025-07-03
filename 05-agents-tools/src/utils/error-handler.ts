/**
 * Error Handler Module
 * Centralized error handling for the application
 */

import { APIError } from '../types';
import { CLIInterface } from './cli-interface';

export class ErrorHandler {
  private cli: CLIInterface;

  constructor() {
    this.cli = new CLIInterface();
  }

  /**
   * Handle various types of errors with appropriate messaging
   */
  handleError(error: any): void {
    // Check for specific error types
    if (error.name === 'MaxTurnsExceededError') {
      this.handleMaxTurnsError();
    } else if (error.name === 'ModelBehaviorError') {
      this.handleModelBehaviorError();
    } else if (this.isAPIError(error)) {
      this.handleAPIError(error as APIError);
    } else if (error.code === 'ECONNREFUSED') {
      this.handleConnectionError(error);
    } else if (error.code === 'ETIMEDOUT') {
      this.handleTimeoutError();
    } else if (error.message?.includes('API key')) {
      this.handleAPIKeyError(error);
    } else {
      this.handleGenericError(error);
    }
  }

  /**
   * Handle max turns exceeded error
   */
  private handleMaxTurnsError(): void {
    this.cli.showWarning(
      'Maximum turns exceeded',
      'The agent reached the maximum number of turns. This might indicate a complex query or potential loop.'
    );
    console.log('Try rephrasing your question or breaking it into smaller parts.\n');
  }

  /**
   * Handle model behavior error
   */
  private handleModelBehaviorError(): void {
    this.cli.showWarning(
      'Model behavior issue',
      'The model exhibited unexpected behavior. Please try again.'
    );
    console.log('If this persists, try rephrasing your request.\n');
  }

  /**
   * Handle API errors with status codes
   */
  private handleAPIError(error: APIError): void {
    const status = error.response?.status;
    
    switch (status) {
      case 401:
        this.cli.showError(
          'Authentication Error',
          'Invalid API key or authentication failed.',
          'Please check your API keys in the .env file.'
        );
        break;
      case 404:
        this.cli.showError(
          'Not Found',
          error.message || 'The requested resource was not found.',
          'Please check your input and try again.'
        );
        break;
      case 429:
        this.cli.showError(
          'Rate Limit Exceeded',
          'Too many requests. Please wait a moment.',
          'Try again in a few seconds.'
        );
        break;
      case 500:
      case 502:
      case 503:
        this.cli.showError(
          'Server Error',
          'The service is temporarily unavailable.',
          'Please try again later.'
        );
        break;
      default:
        this.cli.showError(
          'API Error',
          error.message || 'An error occurred while calling the API.',
          'Please try again.'
        );
    }
  }

  /**
   * Handle connection errors
   */
  private handleConnectionError(error: any): void {
    this.cli.showError(
      'Connection Error',
      'Unable to connect to the service.',
      'Please check your internet connection and try again.'
    );
  }

  /**
   * Handle timeout errors
   */
  private handleTimeoutError(): void {
    this.cli.showError(
      'Timeout Error',
      'The request took too long to complete.',
      'Please try again with a simpler query.'
    );
  }

  /**
   * Handle API key related errors
   */
  private handleAPIKeyError(error: any): void {
    const isOpenAI = error.message.includes('OPENAI');
    const isWeather = error.message.includes('OPENWEATHER');
    
    if (isOpenAI) {
      this.cli.showError(
        'OpenAI API Key Error',
        'OPENAI_API_KEY is not configured or invalid.',
        'Please add a valid OPENAI_API_KEY to your .env file.'
      );
    } else if (isWeather) {
      this.cli.showError(
        'Weather API Key Error',
        'OPENWEATHER_API_KEY is not configured or invalid.',
        'Get a free API key from https://openweathermap.org/api'
      );
    } else {
      this.cli.showError(
        'API Key Error',
        error.message,
        'Please check your API keys in the .env file.'
      );
    }
  }

  /**
   * Handle generic errors
   */
  private handleGenericError(error: any): void {
    this.cli.showError(
      'Error',
      error.message || 'An unexpected error occurred.',
      'Please try again.'
    );
    
    // Log detailed error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error details:', error);
    }
  }

  /**
   * Check if error is an API error
   */
  private isAPIError(error: any): boolean {
    return error.response !== undefined && error.response.status !== undefined;
  }

  /**
   * Format error for logging
   */
  formatErrorForLogging(error: any): string {
    const timestamp = new Date().toISOString();
    const errorInfo = {
      timestamp,
      name: error.name || 'UnknownError',
      message: error.message || 'No message',
      stack: error.stack || 'No stack trace',
      code: error.code,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : undefined
    };
    
    return JSON.stringify(errorInfo, null, 2);
  }

  /**
   * Create user-friendly error message
   */
  getUserFriendlyMessage(error: any): string {
    if (error.name === 'MaxTurnsExceededError') {
      return 'The conversation became too complex. Please try a simpler question.';
    }
    
    if (error.name === 'ModelBehaviorError') {
      return 'I encountered an issue processing your request. Please try again.';
    }
    
    if (error.code === 'ECONNREFUSED') {
      return 'Unable to connect. Please check your internet connection.';
    }
    
    if (error.message?.includes('API key')) {
      return 'There\'s an issue with the API configuration. Please contact support.';
    }
    
    return 'Something went wrong. Please try again.';
  }
}