const WebSocket = require('ws');
const http = require('http');

let wss = null;

// Message types enum
const MessageTypes = {
  CHAT: 'chat',
  NOTIFICATION: 'notification',
  STATUS: 'status',
  ERROR: 'error'
};

// Initialize WebSocket server
function initializeWebSocket(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    // Send welcome message
    sendToClient(ws, {
      type: MessageTypes.STATUS,
      message: 'Connected to WebSocket server'
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        handleMessage(ws, message);
      } catch (error) {
        console.error('Error processing message:', error);
        sendToClient(ws, {
          type: MessageTypes.ERROR,
          message: 'Invalid message format'
        });
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return wss;
}

// Handle incoming messages
function handleMessage(ws, message) {
  // Basic message validation
  if (!message.type || !message.content) {
    sendToClient(ws, {
      type: MessageTypes.ERROR,
      message: 'Invalid message format. Required fields: type, content'
    });
    return;
  }

  // Process message based on type
  switch (message.type) {
    case MessageTypes.CHAT:
      // Handle chat messages
      broadcastMessage({
        type: MessageTypes.CHAT,
        content: message.content,
        timestamp: new Date().toISOString()
      });
      break;
    
    case MessageTypes.STATUS:
      // Handle status updates
      sendToClient(ws, {
        type: MessageTypes.STATUS,
        message: 'Status received'
      });
      break;

    default:
      sendToClient(ws, {
        type: MessageTypes.ERROR,
        message: 'Unsupported message type'
      });
  }
}

// Send message to a specific client
function sendToClient(ws, message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

// Broadcast message to all connected clients
function broadcastMessage(message) {
  if (!wss) return;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Utility function to send message from anywhere in the application
function sendMessage(message) {
  if (!message.type || !message.content) {
    console.error('Invalid message format. Required fields: type, content');
    return;
  }

  broadcastMessage({
    type: message.type,
    content: message.content,
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  initializeWebSocket,
  sendMessage,
  MessageTypes
};
