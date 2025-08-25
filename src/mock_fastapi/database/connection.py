import sqlite3
from contextlib import contextmanager
import os

DATABASE_URL = "mock_database.db"

def init_db():
    """Initialize the mock database with tables"""
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            age INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            stock INTEGER DEFAULT 0
        )
    """)
    
    conn.commit()
    conn.close()

@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    conn = sqlite3.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        conn.close()

def close_db():
    """Close database connection and remove file"""
    if os.path.exists(DATABASE_URL):
        os.remove(DATABASE_URL)
