const { Anthropic } = require('@anthropic-ai/sdk');
const toolsConfig = require('../config/tools.json');
const { listDirectory, readFileContent } = require('../utils/fileTools');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Map of tool names to their implementation functions
 */
const toolImplementations = {
  list_directory: listDirectory,
  read_file_content: readFileContent
};

/**
 * Handles the execution of a specific tool
 * @param {string} toolName - Name of the tool to execute
 * @param {object} parameters - Parameters for the tool
 * @returns {Promise<any>}
 */
async function executeTool(toolName, parameters) {
  const implementation = toolImplementations[toolName];
  if (!implementation) {
    throw new Error(`Tool ${toolName} not implemented`);
  }
  return implementation(parameters);
}

/**
 * Creates a message with Claude using the configured tools
 * @param {string} userMessage - The user's message
 * @returns {Promise<any>}
 */
async function createTooledMessage(userMessage) {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      tools: toolsConfig.tools,
      messages: [{
        role: "user",
        content: userMessage
      }]
    });
    return response;
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
}

module.exports = {
  executeTool,
  createTooledMessage,
  toolsConfig
};
