const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    console.log("HELLLOOLL")
    res.json({
      status: 'success',
      data: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// POST /api/users
router.post('/', async (req, res) => {
  try {
    console.log("gggggggggggggg");
    const newUser = await userService.createUser(req.body);
    
    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: newUser
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to create user',
      error: error.message
    });
  }
});

module.exports = router;
