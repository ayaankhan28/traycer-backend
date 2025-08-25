const Anthropic = require('@anthropic-ai/sdk');
const conversationService = require('./conversationService');
const { listDirectory, readFileContent } = require('../utils/fileTools');
const { searchInDirectory } = require('../utils/finderTools');
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
  }
];

// Tool implementation mapping
const toolImplementations = {
  list_directory: listDirectory,
  read_file_content: readFileContent,
  search_in_directory: searchInDirectory
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
  async executeTool(toolName, args) {
    const implementation = toolImplementations[toolName];
    if (!implementation) {
      throw new Error(`Tool ${toolName} not implemented`);
    }
    
    // Handle different tool parameter structures
    if (toolName === 'search_in_directory') {
      return implementation(args.directory_path, args.search_query);
    } else {
      // For other tools, use the first argument value
      return implementation(args[Object.keys(args)[0]]);
    }
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
          system: "You are a helpful assistant that can use tools to search for information. You can use the following tools: " + availableTools.map(tool => tool.name).join(", ")+"Answer all in beautiful structured markdown format",
          tools: availableTools
        });

        let assistantContent = [];
        let toolCalls = [];

        // Process each content piece from the response
        for (const content of response.content) {
          if (content.type === "text") {
            finalResponse.push(content.text);
            console.log('Assistant content:', content.text);
            assistantContent.push({ type: "text", text: content.text });
          } else if (content.type === "tool_use") {
            console.log('Tool use:', content);
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
            const result = await this.executeTool(toolCall.name, toolCall.input);
            
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

      const finalMessage = finalResponse.join("\n");

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