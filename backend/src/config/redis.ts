import Redis from 'ioredis';
import { config } from 'dotenv';

config();

let redis: Redis | null = null;

try {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    lazyConnect: true,
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  redis.on('error', (error) => {
    console.error('❌ Redis connection error:', error.message);
    redis = null;
  });

  redis.on('close', () => {
    console.log('ℹ️ Redis connection closed');
  });
} catch (error) {
  console.error('❌ Failed to initialize Redis:', error);
  redis = null;
}

export { redis }; 