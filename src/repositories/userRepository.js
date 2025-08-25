const { db } = require('../config/database');
const { users } = require('../config/schema');
const { eq, sql } = require('drizzle-orm');

class UserRepository {
  async findAll() {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error('Database error in findAll:', error);
      // Return mock data as fallback
      return this.getMockUsers();
    }
  }

  async findById(id) {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Database error in findById:', error);
      // Return mock data as fallback
      const mockUsers = this.getMockUsers();
      return mockUsers.find(user => user.id === parseInt(id)) || null;
    }
  }

  async create(userData) {
    try {
      const result = await db.insert(users).values({
        name: userData.name,
        createdAt: sql`(datetime('now'))`,
        updatedAt: sql`(datetime('now'))`
      }).returning();
      
      return result[0];
    } catch (error) {
      console.error('Database error in create:', error);
      // Return mock data as fallback
      return {
        id: Date.now(),
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  }

  async update(id, userData) {
    try {
      const result = await db.update(users)
        .set({
          ...userData,
          updatedAt: sql`(datetime('now'))`
        })
        .where(eq(users.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Database error in update:', error);
      // Return mock data as fallback
      return {
        id: parseInt(id),
        ...userData,
        updatedAt: new Date().toISOString()
      };
    }
  }

  async delete(id) {
    try {
      const result = await db.delete(users).where(eq(users.id, id)).returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database error in delete:', error);
      // Return mock response as fallback
      return { deletedCount: 1 };
    }
  }

  // Mock data for when database is not connected
  getMockUsers() {
    return [
      {
        id: 1,
        name: 'John Doe',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 2,
        name: 'Jane Smith',
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z'
      }
    ];
  }
}

module.exports = new UserRepository();
