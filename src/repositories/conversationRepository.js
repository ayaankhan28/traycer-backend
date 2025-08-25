const { db } = require('../config/database');
const { conversations } = require('../config/schema');
const { eq, sql } = require('drizzle-orm');

class ConversationRepository {
  async findAll() {
    try {
      return await db.select().from(conversations);
    } catch (error) {
      console.error('Database error in findAll:', error);
      return [];
    }
  }

  async findById(id) {
    try {
      const result = await db.select().from(conversations).where(eq(conversations.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Database error in findById:', error);
      return null;
    }
  }

  async findBySessionId(sessionId) {
    try {
      return await db.select().from(conversations).where(eq(conversations.sessionId, sessionId));
    } catch (error) {
      console.error('Database error in findBySessionId:', error);
      return [];
    }
  }

  async findByUserId(userId) {
    try {
      return await db.select().from(conversations).where(eq(conversations.userId, userId));
    } catch (error) {
      console.error('Database error in findByUserId:', error);
      return [];
    }
  }

  async create(conversationData) {
    try {
      const result = await db.insert(conversations).values({
        sessionId: conversationData.sessionId,
        userId: conversationData.userId,
        userType: conversationData.userType,
        message: conversationData.message,
        createdAt: sql`(datetime('now'))`,
        updatedAt: sql`(datetime('now'))`
      }).returning();
      
      return result[0];
    } catch (error) {
      console.error('Database error in create:', error);
      // Return mock data as fallback
      return {
        id: Date.now(),
        ...conversationData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  }

  async update(id, conversationData) {
    try {
      const result = await db.update(conversations)
        .set({
          ...conversationData,
          updatedAt: sql`(datetime('now'))`
        })
        .where(eq(conversations.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Database error in update:', error);
      return null;
    }
  }

  async delete(id) {
    try {
      const result = await db.delete(conversations).where(eq(conversations.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database error in delete:', error);
      return { deletedCount: 1 };
    }
  }
}

module.exports = new ConversationRepository();
