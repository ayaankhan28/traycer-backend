const express = require('express');
const router = express.Router();
const conversationService = require('../services/conversationService');

// GET /api/conversations
router.get('/', async (req, res) => {
  try {
    const conversations = await conversationService.getAllConversations();
    res.json({
      status: 'success',
      data: conversations,
      count: conversations.length
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
});

// GET /api/conversations/:id
router.get('/:id', async (req, res) => {
  try {
    const conversation = await conversationService.getConversationById(req.params.id);
    if (!conversation) {
      return res.status(404).json({
        status: 'error',
        message: 'Conversation not found'
      });
    }
    res.json({
      status: 'success',
      data: conversation
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch conversation',
      error: error.message
    });
  }
});

// GET /api/conversations/session/:sessionId
router.get('/session/:sessionId', async (req, res) => {
  try {
    const conversations = await conversationService.getConversationsBySessionId(req.params.sessionId);
    res.json({
      status: 'success',
      data: conversations,
      count: conversations.length
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
});

// GET /api/conversations/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const conversations = await conversationService.getConversationsByUserId(req.params.userId);
    res.json({
      status: 'success',
      data: conversations,
      count: conversations.length
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
});

// POST /api/conversations
router.post('/', async (req, res) => {
  try {
    const newConversation = await conversationService.createConversation(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Conversation created successfully',
      data: newConversation
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to create conversation',
      error: error.message
    });
  }
});

// PUT /api/conversations/:id
router.put('/:id', async (req, res) => {
  try {
    const updatedConversation = await conversationService.updateConversation(req.params.id, req.body);
    if (!updatedConversation) {
      return res.status(404).json({
        status: 'error',
        message: 'Conversation not found'
      });
    }
    res.json({
      status: 'success',
      message: 'Conversation updated successfully',
      data: updatedConversation
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to update conversation',
      error: error.message
    });
  }
});

// DELETE /api/conversations/:id
router.delete('/:id', async (req, res) => {
  try {
    const deletedConversation = await conversationService.deleteConversation(req.params.id);
    if (!deletedConversation) {
      return res.status(404).json({
        status: 'error',
        message: 'Conversation not found'
      });
    }
    res.json({
      status: 'success',
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete conversation',
      error: error.message
    });
  }
});

module.exports = router;
