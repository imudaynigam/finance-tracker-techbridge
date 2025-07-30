import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { Category } from '../models/Category';

config();

// Determine database type from environment
const dbType = process.env.DB_TYPE || 'sqlite';

let AppDataSource: DataSource;

if (dbType === 'mysql') {
  // MySQL configuration
  AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'finance_tracker',
    synchronize: process.env.NODE_ENV !== 'production', // Set to false in production
    logging: process.env.NODE_ENV === 'development',
    entities: [User, Transaction, Category],
    migrations: ['src/migrations/*.ts'],
    subscribers: ['src/subscribers/*.ts'],
    charset: 'utf8mb4',
    timezone: 'Z',
    extra: {
      connectionLimit: 10
    },
    connectTimeout: 30000,
  });
  console.log('🗄️ Using MySQL database');
} else if (dbType === 'postgres') {
  // PostgreSQL configuration
  AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'finance_tracker',
    synchronize: process.env.NODE_ENV !== 'production', // Set to false in production
    logging: process.env.NODE_ENV === 'development',
    entities: [User, Transaction, Category],
    migrations: ['src/migrations/*.ts'],
    subscribers: ['src/subscribers/*.ts'],
    extra: {
      max: 20,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    },
  });
  console.log('🗄️ Using PostgreSQL database');
} else {
  // SQLite configuration (default for development)
  AppDataSource = new DataSource({
    type: 'sqlite',
    database: 'finance_tracker.db',
    synchronize: true, // Set to false in production
    logging: false,
    entities: [User, Transaction, Category],
    migrations: ['src/migrations/*.ts'],
    subscribers: ['src/subscribers/*.ts'],
  });
  console.log('🗄️ Using SQLite database (finance_tracker.db)');
}

export { AppDataSource }; 