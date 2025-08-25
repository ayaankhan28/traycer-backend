const express = require('express');
const router = express.Router();
const chatService = require('../services/chatService');
const { sendMessage, MessageTypes } = require('../services/websocketService');

// Send a message to all connected clients

/**
 * POST /api/chat/message
 * Send a message to Claude and get response
 * Body: { message: string, sessionId?: number, userId?: number }
 * If sessionId is not provided, a new session will be created
 * userId is optional and defaults to 1 (hardcoded for now)
 */
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId, userId = 1 } = req.body;
    // Validate required fields
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Send message to Claude
    const response = await chatService.sendMessage(message, sessionId, userId);

    // Send the response through websocket
    sendMessage({
      type: MessageTypes.CHAT,
      content: response.message
    });

    res.json({
      success: true,
      data: {
        message: response.message,
        sessionId: response.sessionId,
        usage: response.usage
      }
    });

  } catch (error) {
    console.error('Chat route error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while processing your message'
    });
  }
});

/**
 * GET /api/chat/health
 * Check chat service health
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await chatService.healthCheck();
    
    res.json({
      success: true,
      data: healthStatus
    });

  } catch (error) {
    console.error('Chat health check error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

/**
 * GET /api/chat
 * Chat API information
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Traycerai Chat API',
    version: '1.0.0',
    endpoints: {
      'POST /message': 'Send a message to Claude',
      'GET /health': 'Check chat service health'
    },
    usage: {
      'POST /message': {
        body: {
          message: 'string (required) - The message to send to Claude',
          sessionId: 'number (optional) - Session ID for conversation context. If not provided, a new session will be created',
          userId: 'number (optional) - User ID, defaults to 1'
        },
        response: {
          success: 'boolean',
          data: {
            message: 'string - Claude\'s response',
            sessionId: 'number - Session ID (new or existing)',
            usage: 'object - Token usage information'
          }
        }
      }
    },
    flow: {
      'First message': 'Send only { message: "Hello" } - Backend creates new session and returns sessionId',
      'Subsequent messages': 'Send { message: "How are you?", sessionId: 123 } - Backend uses conversation history'
    }
  });
});

module.exports = router;
