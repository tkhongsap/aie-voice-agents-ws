/**
 * CLI Interface Module
 * Handles command-line interface output and formatting
 */

import { QueryClassification, QueryType } from '../types';
import { getPrimaryQueryType } from '../chat/query-classifier';

export class CLIInterface {
  /**
   * Show welcome message and available tools
   */
  showWelcome(hasWeatherKey: boolean, isMCPConnected: boolean): void {
    console.log('🚀 Welcome to the Advanced Assistant with Tools & Documentation!');
    console.log('🌤️ I can help you with weather, web searches, and the latest documentation.');
    console.log('');
    console.log('✨ Available Tools:');
    console.log('  • 🌤️ Weather Tool - Get live weather data for any location');
    console.log('  • 🔍 Web Search - Search the internet for information');
    
    if (isMCPConnected) {
      console.log('  • 📚 Documentation Tool - Get latest docs via Context7 MCP');
    } else {
      console.log('  • 📚 Documentation Tool - Limited to web search fallback');
    }
    
    console.log('  • 💬 General Chat - Have conversations without tools');
    console.log('');
    
    this.showExamples();
    
    if (!hasWeatherKey) {
      this.showWeatherKeyWarning();
    }
    
    console.log('💡 Type "quit", "bye", or "exit" to end the conversation.\n');
  }

  /**
   * Show usage examples
   */
  private showExamples(): void {
    console.log('🌍 Weather Examples:');
    console.log('  • "What\'s the weather in New York?"');
    console.log('  • "How hot is it in Tokyo today?"');
    console.log('  • "Is it raining in London?"');
    console.log('');
    console.log('🔍 Search Examples:');
    console.log('  • "Search for the latest news about AI"');
    console.log('  • "Find information about renewable energy"');
    console.log('');
    console.log('📚 Documentation Examples:');
    console.log('  • "What are the latest features in React?"');
    console.log('  • "Show me OpenAI API documentation"');
    console.log('  • "Get the latest LangChain docs"');
    console.log('  • "What\'s new in Next.js?"');
    console.log('');
  }

  /**
   * Show weather API key warning
   */
  private showWeatherKeyWarning(): void {
    console.log('⚠️ Weather API Key Missing:');
    console.log('   Add OPENWEATHER_API_KEY to your .env file for weather functionality');
    console.log('   Get a free key at: https://openweathermap.org/api\n');
  }

  /**
   * Show MCP server connection status
   */
  showMCPConnectionStatus(connected: boolean, error?: string): void {
    if (connected) {
      console.log('📚 Context7 MCP server connected successfully!');
    } else {
      console.log('⚠️ Context7 MCP server connection failed:', error || 'Unknown error');
      console.log('📚 Documentation features will be limited to web search fallback');
    }
  }

  /**
   * Show processing indicator
   */
  showProcessing(): void {
    console.log('\n🧠 Processing...');
  }

  /**
   * Show query type indicator
   */
  showQueryTypeIndicator(classification: QueryClassification): void {
    const primaryType = getPrimaryQueryType(classification);
    
    switch (primaryType) {
      case 'weather':
        console.log('🌤️ Checking weather information...');
        break;
      case 'docs':
        console.log('📚 Fetching latest documentation...');
        break;
      case 'search':
        console.log('🔍 Searching the web...');
        break;
      case 'general':
        console.log('💭 Thinking...');
        break;
    }
  }

  /**
   * Show goodbye message
   */
  showGoodbye(): void {
    console.log('\n🚀 Thanks for using the Advanced Assistant! Goodbye!');
  }

  /**
   * Format and display an error message
   */
  showError(title: string, message: string, suggestion?: string): void {
    console.error(`\n❌ ${title}`);
    console.error(`   ${message}`);
    if (suggestion) {
      console.log(`   💡 ${suggestion}`);
    }
    console.log('');
  }

  /**
   * Show a warning message
   */
  showWarning(title: string, message: string): void {
    console.log(`\n⚠️ ${title}`);
    console.log(`   ${message}\n`);
  }

  /**
   * Show an info message
   */
  showInfo(title: string, message: string): void {
    console.log(`\nℹ️ ${title}`);
    console.log(`   ${message}\n`);
  }

  /**
   * Show a success message
   */
  showSuccess(title: string, message: string): void {
    console.log(`\n✅ ${title}`);
    console.log(`   ${message}\n`);
  }

  /**
   * Create a formatted section divider
   */
  showDivider(char: string = '─', length: number = 60): void {
    console.log(char.repeat(length));
  }

  /**
   * Show a loading spinner (for non-streaming operations)
   */
  showSpinner(message: string): { stop: () => void } {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    
    const timer = setInterval(() => {
      process.stdout.write(`\r${frames[i]} ${message}`);
      i = (i + 1) % frames.length;
    }, 80);

    return {
      stop: () => {
        clearInterval(timer);
        process.stdout.write('\r' + ' '.repeat(message.length + 3) + '\r');
      }
    };
  }

  /**
   * Clear the current line
   */
  clearLine(): void {
    process.stdout.write('\r' + ' '.repeat(80) + '\r');
  }

  /**
   * Format a timestamp
   */
  formatTimestamp(date: Date = new Date()): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}