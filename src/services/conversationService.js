const conversationRepository = require('../repositories/conversationRepository');

class ConversationService {
  async getAllConversations() {
    try {
      return await conversationRepository.findAll();
    } catch (error) {
      throw new Error(`Failed to fetch conversations: ${error.message}`);
    }
  }

  async getConversationById(id) {
    try {
      if (!id) {
        throw new Error('Conversation ID is required');
      }
      return await conversationRepository.findById(id);
    } catch (error) {
      throw new Error(`Failed to fetch conversation: ${error.message}`);
    }
  }

  async getConversationsBySessionId(sessionId) {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      return await conversationRepository.findBySessionId(sessionId);
    } catch (error) {
      throw new Error(`Failed to fetch conversations: ${error.message}`);
    }
  }

  async getConversationsByUserId(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return await conversationRepository.findByUserId(userId);
    } catch (error) {
      throw new Error(`Failed to fetch conversations: ${error.message}`);
    }
  }

  async createConversation(conversationData) {
    try {
      // Basic validation
      if (!conversationData.sessionId || !conversationData.userId || !conversationData.userType || !conversationData.message) {
        throw new Error('Session ID, User ID, User Type, and Message are required');
      }

      // Validate userType
      if (!['user', 'bot'].includes(conversationData.userType)) {
        throw new Error('User type must be either "user" or "bot"');
      }

      return await conversationRepository.create(conversationData);
    } catch (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }
  }

  async updateConversation(id, conversationData) {
    try {
      if (!id) {
        throw new Error('Conversation ID is required');
      }
      return await conversationRepository.update(id, conversationData);
    } catch (error) {
      throw new Error(`Failed to update conversation: ${error.message}`);
    }
  }

  async deleteConversation(id) {
    try {
      if (!id) {
        throw new Error('Conversation ID is required');
      }
      return await conversationRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }
  }
}

module.exports = new ConversationService();
