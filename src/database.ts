import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from './config';
import { Event } from './models/Event';
import { Participant } from './models/Participant';
import { Availability } from './models/Availability';
import { Message } from './models/Message';
import { Feedback } from './models/Feedback';
import { Analytics } from './models/Analytics';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: config.databasePath,
  synchronize: true,
  logging: config.debug,
  entities: [Event, Participant, Availability, Message, Feedback, Analytics],
});

export async function initDatabase(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log('[Database] Polaczono z baza danych.');
  }
}



