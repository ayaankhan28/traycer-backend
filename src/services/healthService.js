const { sqlite } = require('../config/database');

class HealthService {
  async getHealthStatus() {
    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'disconnected'
    };

    // Check database connection
    try {
      // Try to execute a simple query to check if database is working
      const result = sqlite.prepare('SELECT 1 as test').get();
      if (result && result.test === 1) {
        status.database = 'connected';
      } else {
        status.database = 'error';
      }
    } catch (error) {
      status.database = 'error';
      status.databaseError = error.message;
    }

    return status;
  }
}

module.exports = new HealthService();
