const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, '../../database.sqlite');

// Create SQLite database instance
const sqlite = new Database(dbPath);

// Create Drizzle instance
const db = drizzle(sqlite);

const connectDB = async () => {
  try {
    // Enable foreign keys
    sqlite.pragma('foreign_keys = ON');
    console.log('SQLite database connected successfully');
    return db;
  } catch (error) {
    console.error('SQLite connection error:', error.message);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    sqlite.close();
    console.log('SQLite database disconnected successfully');
  } catch (error) {
    console.error('SQLite disconnection error:', error.message);
  }
};

module.exports = {
  db,
  sqlite,
  connectDB,
  disconnectDB
};