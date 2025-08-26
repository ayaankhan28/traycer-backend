const Anthropic = require('@anthropic-ai/sdk');
const conversationService = require('./conversationService');
const { listDirectory, readFileContent } = require('../utils/fileTools');
const { searchInDirectory } = require('../utils/finderTools');
const { createScratchPad, scratchPadReadAll, scratchPadUpdate, scratchPadOverwrite } = require('../utils/scratchPadTools');
const { deepThinking } = require('../utils/deepThinkingTools');
const { sendMessage, MessageTypes } = require('./websocketService');
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Available tools configuration
const availableTools = [
  {
    name: "list_directory",
    description: "Get a list of all files and folders in a specified directory",
    input_schema: {
      type: "object",
      properties: {
        directory_path: {
          type: "string",
          description: "The path to the directory to list contents from"
        }
      },
      required: ["directory_path"]
    }
  },
  {
    name: "read_file_content",
    description: "Read and return the contents of a specified file",
    input_schema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "The path to the file to read"
        }
      },
      required: ["file_path"]
    }
  },
  {
    name: "search_in_directory",
    description: "Search for text within all files in a specified directory recursively",
    input_schema: {
      type: "object",
      properties: {
        directory_path: {
          type: "string",
          description: "The path to the directory to search in"
        },
        search_query: {
          type: "string",
          description: "The text to search for within the files"
        }
      },
      required: ["directory_path", "search_query"]
    }
  },
  {
    name: "deep_thinking",
    description: "Acts as a planning layer that analyzes user queries and chat history to provide strategic reasoning for response planning",
    input_schema: {
      type: "object",
      properties: {
        user_query: {
          type: "string",
          description: "The current user query that needs a planned response"
        },
        chat_history: {
          type: "string",
          description: "The previous chat conversation history as context for planning"
        }
      },
      required: ["user_query", "chat_history"]
    }
  }
];

// Tool implementation mapping
const toolImplementations = {
  list_directory: listDirectory,
  read_file_content: readFileContent,
  search_in_directory: searchInDirectory,
  deep_thinking: deepThinking
};

class ChatService {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });
  }

  /**
   * Execute a specific tool
   * @param {string} toolName - Name of the tool to execute
   * @param {object} args - Tool arguments
   * @returns {Promise<any>}
   */
  async executeTool(toolName, args, history) {
    const implementation = toolImplementations[toolName];
    if (!implementation) {
      throw new Error(`Tool ${toolName} not implemented`);
    }
    
    // Handle different tool parameter structures
    if (toolName === 'search_in_directory') {
      return implementation(args.directory_path, args.search_query);
    } else if (toolName === 'deep_thinking') {
      console.log('Deep thinking tool called with history:', history);
      return implementation(args.user_query, history);
    } else if (toolName === 'scratch_pad_update') {
      return implementation(args.id, args.updates);
    } else if (toolName === 'scratch_pad_overwrite') {
      return implementation(args.new_data);
    } else if (toolName === 'scratch_pad_read_all') {
      // These tools don't require any arguments
      return implementation();
    } else {
      // For other tools, use the first argument value
      return implementation(args[Object.keys(args)[0]]);
    }
  }

  /**
   * Format conversation history for tools, especially deep thinking
   * @param {Array} messages - Array of conversation messages
   * @returns {string} Formatted conversation history
   */
  formatConversationHistoryForTool(messages) {
    let formattedHistory = [];
    
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      if (!message || !message.role) continue;
      
      const role = message.role;
      
      if (role === 'user') {
        // Handle user messages
        if (Array.isArray(message.content)) {
          // Check if this is a tool result message
          const toolResult = message.content.find(content => content && content.type === 'tool_result');
          if (toolResult) {
            try {
              const toolResultData = JSON.parse(toolResult.content);
              formattedHistory.push(`[TOOL RESULT] ${JSON.stringify(toolResultData)}`);
            } catch (e) {
              formattedHistory.push(`[TOOL RESULT] ${toolResult.content}`);
            }
          } else {
            // Regular user message
            const textContent = message.content.find(content => content && content.type === 'text');
            if (textContent && textContent.text) {
              formattedHistory.push(`[USER] ${textContent.text}`);
            }
          }
        } else if (message.content) {
          // Simple string content
          formattedHistory.push(`[USER] ${message.content}`);
        }
      } else if (role === 'assistant') {
        // Handle assistant messages
        if (Array.isArray(message.content)) {
          // Check for tool use
          const toolUse = message.content.find(content => content && content.type === 'tool_use');
          if (toolUse) {
            formattedHistory.push(`[AI TOOL USE] ${toolUse.name}: ${JSON.stringify(toolUse.input)}`);
          } else {
            // Regular AI response
            const textContent = message.content.find(content => content && content.type === 'text');
            if (textContent && textContent.text) {
              formattedHistory.push(`[AI] ${textContent.text}`);
            }
          }
        } else if (message.content) {
          // Simple string content
          formattedHistory.push(`[AI] ${message.content}`);
        }
      }
    }
    
    return formattedHistory.join('\n');
  }

  /**
   * Send a message to Claude and get response
   * @param {string} message - User's message
   * @param {number} sessionId - Session ID (optional, will create new if not provided)
   * @param {number} userId - User ID (required, hardcoded as 1 for now)
   * @returns {Promise<Object>} Response from Claude with sessionId
   */
  async sendMessage(message, sessionId = null, userId = 1) {
    try {
      // Validate input
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        throw new Error('Message is required and must be a non-empty string');
      }

      let currentSessionId = sessionId;
      let conversationHistory = [];
      let finalResponse = [];

      // If no sessionId provided, create a new session
      if (!sessionId) {
        const sessionService = require('./sessionService');
        const newSession = await sessionService.createSession({ userId });
        currentSessionId = newSession.id;
        console.log('Created new session:', currentSessionId);
      } else {
        // If sessionId provided, fetch conversation history
        const conversations = await conversationService.getConversationsBySessionId(sessionId);
        
        // Convert conversations to Claude message format
        conversationHistory = conversations.map(conv => ({
          role: conv.userType === 'user' ? 'user' : 'assistant',
          content: conv.message
        }));
        
        console.log('Fetched conversation history:', conversationHistory.length, 'messages');
      }

      // Build initial messages array for Claude
      let messages = [
        ...conversationHistory,
        {
          role: "user",
          content: message.trim()
        }
      ];

      let attempt = 1;
      while (true) {


        // Send request to Claude
        const response = await this.anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          messages: messages,
          system: "You are a helpful assistant that can help the user in solving and code base editing when prompted with some task you have to create a detailed planned how to exectute and give final crisp plan with order and priority. You can use the following tools: " + availableTools.map(tool => tool.name).join(", ") + ". Answer all in beautiful structured markdown format. IMPORTANT: When mentioning any file names or file paths in your responses, always wrap them with special markers like this: {{filename:path/to/file.ext}} - this helps with proper highlighting in the UI. For example: {{filename:src/components/Button.tsx}} or {{filename:package.json}}. You can use the deep_thinking tool to plan your response when task is big and needs to be divided in smaller task. but use it only when asked to use. gather relevant file and other context frolm the other files tools to gather better context for the better thinking.",
          tools: availableTools
        });

        let assistantContent = [];
        let toolCalls = [];

        // Process each content piece from the response
        for (const content of response.content) {
          if (content.type === "text") {
            finalResponse.push(content.text);
            console.log('Assistant content:', content.text);
            await new Promise(resolve => setTimeout(resolve, 1000));
            sendMessage({
              type: MessageTypes.THINKING,
              content: content.text
            });
            assistantContent.push({ type: "text", text: content.text });
          } else if (content.type === "tool_use") {
            console.log('Tool use:', content);
            await new Promise(resolve => setTimeout(resolve, 1000));
            sendMessage({
              type: MessageTypes.THINKING,
              content: "🔧 Using tool: " + content.name
            });
            
            toolCalls.push(content);
          }
        }

        // If no more tools to call, we're done
        if (toolCalls.length === 0) {
          break;
        }

        // Process each tool call
        for (const toolCall of toolCalls) {
          try {
            // Create structured conversation history for deep thinking tool
            let conversationHistoryForTool;
            if (toolCall.name === 'deep_thinking') {
              // For deep thinking, pass the complete conversation structure
              conversationHistoryForTool = this.formatConversationHistoryForTool(messages);
              console.log('Formatted conversation history for deep thinking:', conversationHistoryForTool);
            } else {
              // For other tools, keep the existing behavior
              conversationHistoryForTool = messages.map(m => m.content).join("\n");
            }
            
            const result = await this.executeTool(toolCall.name, toolCall.input, conversationHistoryForTool);
            
            // Add tool results to conversation
            assistantContent.push({
              type: "tool_use",
              name: toolCall.name,
              input: toolCall.input,
              id: toolCall.id
            });

            messages.push({ role: "assistant", content: assistantContent });
            messages.push({
              role: "user",
              content: [{ 
                type: "tool_result", 
                tool_use_id: toolCall.id, 
                content: JSON.stringify(result)
              }]
            });
          } catch (toolError) {
            console.error(`Error executing ${toolCall.name}:`, toolError);
            throw toolError;
          }
        }

        attempt++;
      }

      const finalMessage = finalResponse[finalResponse.length - 1];

      // Send final thinking message
      sendMessage({
        type: MessageTypes.THINKING,
        content: "✅ Response ready!"
      });

      // Store conversation in database
      try {
        // Store user message
        await conversationService.createConversation({
          sessionId: currentSessionId,
          userId,
          userType: 'user',
          message: message.trim()
        });

        // Store bot response
        await conversationService.createConversation({
          sessionId: currentSessionId,
          userId,
          userType: 'bot',
          message: finalMessage
        });
      } catch (dbError) {
        console.error('Failed to store conversation:', dbError);
        // Don't fail the request if conversation storage fails
      }

      return {
        success: true,
        message: finalMessage,
        sessionId: currentSessionId
      };

    } catch (error) {
      console.error('Error in ChatService.sendMessage:', error);
      
      // Handle specific API errors
      if (error.status === 401) {
        throw new Error('Invalid API key. Please check your Anthropic API key configuration.');
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.status === 400) {
        throw new Error('Invalid request format.');
      }
      
      throw new Error(`Chat service error: ${error.message}`);
    }
  }

  /**
   * Health check for the chat service
   * @returns {Promise<Object>} Service status
   */
  async healthCheck() {
    try {
      if (!ANTHROPIC_API_KEY) {
        return {
          status: 'error',
          message: 'ANTHROPIC_API_KEY is not configured'
        };
      }

      return {
        status: 'healthy',
        message: 'Chat service is operational'
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Chat service health check failed: ${error.message}`
      };
    }
  }
}

module.exports = new ChatService();