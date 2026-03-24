const { Redis } = require('ioredis');

let connection = null;

function getRedisConnection() {
  if (!connection) {
    connection = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
      maxRetriesPerRequest: null,
      lazyConnect: true,
      enableOfflineQueue: false,
      connectTimeout: 2000,
      retryStrategy: () => null,
    });
    
    connection.on('error', (err) => {
      console.warn('[Redis] Connection Error:', err.message);
    });
  }

  return connection;
}

module.exports = { getRedisConnection };
