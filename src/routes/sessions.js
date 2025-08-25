const express = require('express');
const router = express.Router();
const sessionService = require('../services/sessionService');

// GET /api/sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await sessionService.getAllSessions();
    res.json({
      status: 'success',
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch sessions',
      error: error.message
    });
  }
});

// GET /api/sessions/:id
router.get('/:id', async (req, res) => {
  try {
    const session = await sessionService.getSessionById(req.params.id);
    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }
    res.json({
      status: 'success',
      data: session
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch session',
      error: error.message
    });
  }
});

// GET /api/sessions/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const sessions = await sessionService.getSessionsByUserId(req.params.userId);
    res.json({
      status: 'success',
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch sessions',
      error: error.message
    });
  }
});

// POST /api/sessions
router.post('/', async (req, res) => {
  try {
    const newSession = await sessionService.createSession(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Session created successfully',
      data: newSession
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to create session',
      error: error.message
    });
  }
});

// PUT /api/sessions/:id
router.put('/:id', async (req, res) => {
  try {
    const updatedSession = await sessionService.updateSession(req.params.id, req.body);
    if (!updatedSession) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }
    res.json({
      status: 'success',
      message: 'Session updated successfully',
      data: updatedSession
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to update session',
      error: error.message
    });
  }
});

// DELETE /api/sessions/:id
router.delete('/:id', async (req, res) => {
  try {
    const deletedSession = await sessionService.deleteSession(req.params.id);
    if (!deletedSession) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }
    res.json({
      status: 'success',
      message: 'Session deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete session',
      error: error.message
    });
  }
});

module.exports = router;
