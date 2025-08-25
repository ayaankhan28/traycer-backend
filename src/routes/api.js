const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./users');
const healthRoutes = require('./health');
const chatRoutes = require('./chat');
const sessionRoutes = require('./sessions');
const conversationRoutes = require('./conversations');

// Health check routes
router.use('/health', healthRoutes);

// User routes
router.use('/users', userRoutes);

// Session routes
router.use('/sessions', sessionRoutes);

// Conversation routes
router.use('/conversations', conversationRoutes);

// Chat routes
router.use('/chat', chatRoutes);

// Base API route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Traycerai API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      sessions: '/api/sessions',
      conversations: '/api/conversations',
      chat: '/api/chat'
    }
  });
});

module.exports = router;
