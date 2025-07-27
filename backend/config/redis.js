const redis = require('redis');

let client;

const connectRedis = async () => {
  try {
    client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
      console.log('Redis connected');
    });

    client.on('disconnect', () => {
      console.log('Redis disconnected');
    });

    await client.connect();

  } catch (error) {
    console.error('Error connecting to Redis:', error.message);
    // Don't exit process for Redis connection failure - app can work without cache
  }
};

const getRedisClient = () => {
  return client;
};

const setCache = async (key, value, expiration = 3600) => {
  try {
    if (client && client.isReady) {
      await client.setEx(key, expiration, JSON.stringify(value));
      return true;
    }
  } catch (error) {
    console.error('Error setting cache:', error);
  }
  return false;
};

const getCache = async (key) => {
  try {
    if (client && client.isReady) {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    }
  } catch (error) {
    console.error('Error getting cache:', error);
  }
  return null;
};

const deleteCache = async (key) => {
  try {
    if (client && client.isReady) {
      await client.del(key);
      return true;
    }
  } catch (error) {
    console.error('Error deleting cache:', error);
  }
  return false;
};

module.exports = {
  connectRedis,
  getRedisClient,
  setCache,
  getCache,
  deleteCache
};