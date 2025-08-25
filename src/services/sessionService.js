const sessionRepository = require('../repositories/sessionRepository');

class SessionService {
  async getAllSessions() {
    try {
      return await sessionRepository.findAll();
    } catch (error) {
      throw new Error(`Failed to fetch sessions: ${error.message}`);
    }
  }

  async getSessionById(id) {
    try {
      if (!id) {
        throw new Error('Session ID is required');
      }
      return await sessionRepository.findById(id);
    } catch (error) {
      throw new Error(`Failed to fetch session: ${error.message}`);
    }
  }

  async getSessionsByUserId(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return await sessionRepository.findByUserId(userId);
    } catch (error) {
      throw new Error(`Failed to fetch sessions: ${error.message}`);
    }
  }

  async createSession(sessionData) {
    try {
      // Basic validation
      if (!sessionData.userId) {
        throw new Error('User ID is required');
      }

      return await sessionRepository.create(sessionData);
    } catch (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  async updateSession(id, sessionData) {
    try {
      if (!id) {
        throw new Error('Session ID is required');
      }
      return await sessionRepository.update(id, sessionData);
    } catch (error) {
      throw new Error(`Failed to update session: ${error.message}`);
    }
  }

  async deleteSession(id) {
    try {
      if (!id) {
        throw new Error('Session ID is required');
      }
      return await sessionRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete session: ${error.message}`);
    }
  }
}

module.exports = new SessionService();
