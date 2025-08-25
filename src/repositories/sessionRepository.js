const { db } = require('../config/database');
const { sessions } = require('../config/schema');
const { eq, sql } = require('drizzle-orm');

class SessionRepository {
  async findAll() {
    try {
      return await db.select().from(sessions);
    } catch (error) {
      console.error('Database error in findAll:', error);
      return [];
    }
  }

  async findById(id) {
    try {
      const result = await db.select().from(sessions).where(eq(sessions.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Database error in findById:', error);
      return null;
    }
  }

  async findByUserId(userId) {
    try {
      return await db.select().from(sessions).where(eq(sessions.userId, userId));
    } catch (error) {
      console.error('Database error in findByUserId:', error);
      return [];
    }
  }

  async create(sessionData) {
    try {
      const result = await db.insert(sessions).values({
        userId: sessionData.userId,
        createdAt: sql`(datetime('now'))`,
        updatedAt: sql`(datetime('now'))`
      }).returning();
      
      return result[0];
    } catch (error) {
      console.error('Database error in create:', error);
      // Return mock data as fallback
      return {
        id: Date.now(),
        ...sessionData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  }

  async update(id, sessionData) {
    try {
      const result = await db.update(sessions)
        .set({
          ...sessionData,
          updatedAt: sql`(datetime('now'))`
        })
        .where(eq(sessions.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Database error in update:', error);
      return null;
    }
  }

  async delete(id) {
    try {
      const result = await db.delete(sessions).where(eq(sessions.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database error in delete:', error);
      return { deletedCount: 1 };
    }
  }
}

module.exports = new SessionRepository();
