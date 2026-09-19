import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '8100', 10),
  databasePath: process.env.DATABASE_PATH || './events.db',
  debug: process.env.DEBUG === 'true',
};
