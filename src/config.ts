import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '8100', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  debug: process.env.DEBUG === 'true',
  adminKey: process.env.ADMIN_KEY || 'mojepodworko-admin-2026',
};
