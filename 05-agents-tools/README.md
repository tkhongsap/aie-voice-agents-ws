# 05-agents-tools - Advanced Assistant with Tools

An advanced AI assistant that combines web search capabilities with live weather data using OpenAI Agents framework.

## Features

- 🌤️ **Live Weather Data** - Get current weather information for any location worldwide
- 🔍 **Web Search** - Search the internet for information on any topic
- 💬 **Intelligent Tool Selection** - Automatically determines when to use tools vs. general conversation
- 🔄 **Streaming Responses** - Real-time response processing with progress indicators
- 📝 **Conversation History** - Maintains context across the conversation

## Setup

### 1. Install Dependencies
```bash
cd 05-agents-tools
npm install
```

### 2. Configure API Keys
Create a `.env` file in the root directory (one level up from this folder) with:

```env
# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_api_key_here

# OpenWeatherMap API Key (required for weather functionality)
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

#### Getting API Keys:
- **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- **OpenWeatherMap API Key**: Get free key from [OpenWeatherMap](https://openweathermap.org/api)

### 3. Run the Application
```bash
npm start
```
Or from the root directory:
```bash
npm run start:05
```

## Usage Examples

### Weather Queries
- "What's the weather in New York?"
- "How hot is it in Tokyo today?"
- "Is it raining in London?"
- "Tell me the current weather in Paris"

### Search Queries
- "Search for the latest news about AI"
- "Find information about renewable energy"
- "Look up facts about the solar system"
- "What are the latest developments in quantum computing?"

### General Conversation
- "Hello, how are you?"
- "What can you help me with?"
- "Tell me something interesting"

## Features in Detail

### Weather Tool
- Provides comprehensive weather data including:
  - Current temperature (Celsius and Fahrenheit)
  - Weather description and conditions
  - Humidity, wind speed, and pressure
  - "Feels like" temperature
  - Visibility and cloudiness
  - Sunrise and sunset times
- Handles location not found errors gracefully
- Provides helpful error messages for API issues

### Web Search Tool
- Searches the internet for current information
- Summarizes findings in concise, organized responses
- Handles various search topics and queries
- Provides up-to-date information beyond training data

### Smart Tool Selection
The assistant intelligently determines when to use tools:
- **Weather queries** trigger the weather tool
- **Search queries** trigger web search
- **General conversation** uses natural language without tools

## Error Handling

The application includes comprehensive error handling for:
- Missing or invalid API keys
- Network connectivity issues
- Location not found errors
- Rate limiting and API quota issues
- Agent execution errors

## Commands

- Type `quit`, `bye`, or `exit` to end the conversation
- Leave input empty and press Enter to continue without input

## Technical Details

- Built with OpenAI Agents framework
- Uses GPT-4.1-mini model for efficient processing
- Implements streaming responses for better user experience
- Maintains conversation context for coherent interactions
- Uses TypeScript for type safety