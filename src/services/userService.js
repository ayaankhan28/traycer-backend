const userRepository = require('../repositories/userRepository');

class UserService {
  async getAllUsers() {
    try {
      return await userRepository.findAll();
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  async getUserById(id) {
    try {
      if (!id) {
        throw new Error('User ID is required');
      }
      return await userRepository.findById(id);
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  async createUser(userData) {
    try {
      // Basic validation
      if (!userData.name) {
        throw new Error('Name is required');
      }

      return await userRepository.create(userData);
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async updateUser(id, userData) {
    try {
      if (!id) {
        throw new Error('User ID is required');
      }
      return await userRepository.update(id, userData);
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async deleteUser(id) {
    try {
      if (!id) {
        throw new Error('User ID is required');
      }
      return await userRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}

module.exports = new UserService();
