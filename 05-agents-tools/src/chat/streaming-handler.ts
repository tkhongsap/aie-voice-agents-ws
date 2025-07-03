/**
 * Streaming Handler Module
 * Handles streaming responses from the agent
 */

import { StreamResult } from '../types';

export class StreamingHandler {
  /**
   * Stream a response from the agent to the console
   * @param result The stream result from the agent
   * @returns The complete response text
   */
  async streamResponse(result: StreamResult): Promise<string> {
    let responseText = '';
    const textStream = result.toTextStream();
    
    // Process the text stream
    for await (const chunk of textStream) {
      process.stdout.write(chunk);
      responseText += chunk;
    }
    
    return responseText;
  }

  /**
   * Stream with custom handler
   * @param result The stream result from the agent
   * @param handler Custom handler for each chunk
   * @returns The complete response text
   */
  async streamWithHandler(
    result: StreamResult,
    handler: (chunk: string) => void
  ): Promise<string> {
    let responseText = '';
    const textStream = result.toTextStream();
    
    for await (const chunk of textStream) {
      handler(chunk);
      responseText += chunk;
    }
    
    return responseText;
  }

  /**
   * Collect stream without displaying
   * @param result The stream result from the agent
   * @returns The complete response text
   */
  async collectStream(result: StreamResult): Promise<string> {
    let responseText = '';
    const textStream = result.toTextStream();
    
    for await (const chunk of textStream) {
      responseText += chunk;
    }
    
    return responseText;
  }
}