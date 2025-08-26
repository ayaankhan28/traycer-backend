const Anthropic = require('@anthropic-ai/sdk');
const { sendMessage, MessageTypes } = require('../services/websocketService');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Deep thinking tool that acts as a planning layer for user queries
 * @param {string} userQuery - The current user query to plan a response for
 * @param {string} chatHistory - The chat history as context for planning
 * @returns {Promise<string>} A planning and reasoning string for how to respond
 */
async function deepThinking(userQuery, chatHistory) {
  try {
    // Validate inputs
    if (!userQuery) {
      return "No user query provided for planning.";
    }

    // Create the prompt for planning
    console.log("--------------------------------");
    console.log("Deep Thinking Tool - userQuery:", userQuery);
    console.log("Deep Thinking Tool - chatHistory:", chatHistory);
    console.log("Deep Thinking Tool - chatHistory type:", typeof chatHistory);
    console.log("Deep Thinking Tool - chatHistory length:", chatHistory ? chatHistory.length : 'undefined');
    const prompt = `You are a planning layer that helps reason about how to respond to user queries given the conversation context.

CURRENT USER QUERY:
${userQuery}

CONVERSATION HISTORY (with tool responses and AI reasoning):
${chatHistory || "No previous chat history available."}

Please analyze the conversation flow and provide a comprehensive planning for the given task.

Consider:
1. What has already been discussed or attempted
2. What tools have been used and their results
3. What AI responses have been provided
4. The current state of the conversation

Provide a structured list of tasks in order of priority to be executed to complete the task.`;

    // Use streaming with thinking enabled (based on test.py)
    const stream = await anthropic.messages.stream({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 16000,
      thinking: { type: "enabled", budget_tokens: 8000 },
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    let thinkingContent = "";
    let responseContent = "";

    for await (const event of stream) {
      if (event.type === "content_block_delta") {
        if (event.delta.type === "thinking_delta") {
          thinkingContent += event.delta.thinking;
          sendMessage({
            type: MessageTypes.DEEP_THINKING,
            content: event.delta.thinking
          });
        } else if (event.delta.type === "text_delta") {
          responseContent += event.delta.text;
          
        }
      }
    }

    // Return both thinking and response content as structured planning guide
    const result = `**Deep Thinking Process:**\n${thinkingContent}\n\n**Planning Analysis:**\n${responseContent}`;

    return result;

  } catch (error) {
    console.error('Error in deepThinking tool:', error);
    throw new Error(`Deep thinking analysis failed: ${error.message}`);
  }
}

module.exports = {
  deepThinking
};
