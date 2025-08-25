const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { initializeWebSocket } = require('./services/websocketService');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const { connectDB } = require('./config/database');
const { migrate } = require('./config/migrate');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Database and run migrations
(async () => {
  try {
    await connectDB();
    await migrate();
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error);
  }
})();

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Hello World! Traycerai Backend is running!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    status: 'error'
  });
});

const server = http.createServer(app);

// Initialize WebSocket server
initializeWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} for Hello World message`);
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});

module.exports = app;
