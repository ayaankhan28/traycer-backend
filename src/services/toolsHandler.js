const { Anthropic } = require('@anthropic-ai/sdk');
const toolsConfig = require('../config/tools.json');
const { listDirectory, readFileContent } = require('../utils/fileTools');
const { createScratchPad, scratchPadReadAll, scratchPadUpdate, scratchPadOverwrite } = require('../utils/scratchPadTools');
const { deepThinking } = require('../utils/deepThinkingTools');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Map of tool names to their implementation functions
 */
const toolImplementations = {
  list_directory: listDirectory,
  read_file_content: readFileContent,
  create_scratch_pad: createScratchPad,
  scratch_pad_read_all: scratchPadReadAll,
  scratch_pad_update: scratchPadUpdate,
  scratch_pad_overwrite: scratchPadOverwrite,
  deep_thinking: deepThinking
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
  
  // Handle different tool parameter structures
  if (toolName === 'scratch_pad_update') {
    return implementation(parameters.id, parameters.updates);
  } else if (toolName === 'scratch_pad_overwrite') {
    return implementation(parameters.new_data);
  } else if (toolName === 'deep_thinking') {
    return implementation(parameters.user_query, parameters.chat_history);
  } else if (toolName === 'create_scratch_pad' || toolName === 'scratch_pad_read_all') {
    // These tools don't require any arguments
    return implementation();
  } else {
    // For other tools, use the first parameter value
    return implementation(parameters[Object.keys(parameters)[0]]);
  }
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
