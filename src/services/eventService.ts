import crypto from 'crypto';
import { AppDataSource } from '../database';
import { Event } from '../models/Event';
import { Participant } from '../models/Participant';
import { Availability } from '../models/Availability';
import { Message } from '../models/Message';

const eventRepo = () => AppDataSource.getRepository(Event);
const participantRepo = () => AppDataSource.getRepository(Participant);
const availabilityRepo = () => AppDataSource.getRepository(Availability);
const messageRepo = () => AppDataSource.getRepository(Message);

// ============================================================
// TWORZENIE WYDARZENIA
// ============================================================
export interface CreateEventInput {
  title: string;
  description: string;
  ownerId: string;
  ownerName: string;
  type: string;
  dateFrom: string;
  dateTo: string;
  hourFrom: string;
  hourTo: string;
  deadlineHours: number;
}

export async function createEvent(input: CreateEventInput): Promise<Event> {
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + input.deadlineHours);

  const event = eventRepo().create({
    eventId: crypto.randomUUID(),
    title: input.title,
    description: input.description,
    ownerId: input.ownerId,
    ownerName: input.ownerName,
    type: input.type,
    status: 'collecting',
    dateFrom: input.dateFrom,
    dateTo: input.dateTo,
    hourFrom: input.hourFrom,
    hourTo: input.hourTo,
    deadline,
    finalSlot: null,
  });

  await eventRepo().save(event);

  const participant = participantRepo().create({
    participantId: crypto.randomUUID(),
    eventId: event.eventId,
    userId: input.ownerId,
    userName: input.ownerName,
    status: 'joined',
    isOwner: true,
  });
  await participantRepo().save(participant);

  return event;
}

// ============================================================
// POBIERANIE
// ============================================================
export async function getEventById(eventId: string): Promise<Event | null> {
  return await eventRepo().findOne({ where: { eventId } });
}

export async function getMyEvents(userId: string): Promise<Event[]> {
  const owned = await eventRepo().find({
    where: { ownerId: userId },
    order: { createdAt: 'DESC' },
  });

  const joinedParticipants = await participantRepo().find({
    where: { userId },
  });
  const joinedIds = joinedParticipants
    .map(p => p.eventId)
    .filter(id => !owned.some(e => e.eventId === id));

  let joined: Event[] = [];
  if (joinedIds.length > 0) {
    joined = await eventRepo()
      .createQueryBuilder('e')
      .where('e.eventId IN (:...ids)', { ids: joinedIds })
      .orderBy('e.createdAt', 'DESC')
      .getMany();
  }

  return [...owned, ...joined];
}

export async function getParticipants(eventId: string): Promise<Participant[]> {
  return await participantRepo().find({ where: { eventId } });
}

// ============================================================
// DOLACZANIE
// ============================================================
export async function joinEvent(
  eventId: string,
  userId: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  const event = await eventRepo().findOne({ where: { eventId } });
  if (!event) return { success: false, error: 'Wydarzenie nie znalezione.' };
  if (event.status === 'cancelled') return { success: false, error: 'Wydarzenie odwolane.' };

  const existing = await participantRepo().findOne({ where: { eventId, userId } });
  if (existing) return { success: true };

  const participant = participantRepo().create({
    participantId: crypto.randomUUID(),
    eventId,
    userId,
    userName,
    status: 'joined',
    isOwner: false,
  });
  await participantRepo().save(participant);
  return { success: true };
}

// ============================================================
// DOSTEPNOSC
// ============================================================
export async function saveAvailability(
  eventId: string,
  userId: string,
  userName: string,
  slots: string[]
): Promise<void> {
  await availabilityRepo().delete({ eventId, userId });

  for (const slot of slots) {
    const a = availabilityRepo().create({
      eventId,
      userId,
      userName,
      slot,
    });
    await availabilityRepo().save(a);
  }
}

export async function getAvailabilities(eventId: string): Promise<Availability[]> {
  return await availabilityRepo().find({ where: { eventId } });
}

// ============================================================
// ALGORYTM - NAJLEPSZE TERMINY
// ============================================================
export interface SlotScore {
  slot: string;
  count: number;
  users: string[];
}

export async function getBestSlots(eventId: string): Promise<SlotScore[]> {
  const availabilities = await availabilityRepo().find({ where: { eventId } });

  const slotMap = new Map<string, { count: number; users: string[] }>();
  for (const a of availabilities) {
    if (!slotMap.has(a.slot)) {
      slotMap.set(a.slot, { count: 0, users: [] });
    }
    const entry = slotMap.get(a.slot)!;
    entry.count += 1;
    entry.users.push(a.userName);
  }

  const result: SlotScore[] = [];
  for (const [slot, data] of slotMap.entries()) {
    result.push({ slot, count: data.count, users: data.users });
  }
  result.sort((a, b) => b.count - a.count);

  return result;
}

// ============================================================
// CZAT
// ============================================================
export async function addMessage(
  eventId: string,
  userId: string,
  userName: string,
  text: string
): Promise<Message> {
  const msg = messageRepo().create({
    messageId: crypto.randomUUID(),
    eventId,
    userId,
    userName,
    text,
  });
  return await messageRepo().save(msg);
}

export async function getMessages(eventId: string): Promise<Message[]> {
  return await messageRepo().find({
    where: { eventId },
    order: { createdAt: 'ASC' },
    take: 200,
  });
}

// ============================================================
// FINALIZACJA
// ============================================================
export async function finalizeEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
  const event = await eventRepo().findOne({ where: { eventId } });
  if (!event) return { success: false, error: 'Wydarzenie nie znalezione.' };

  const bestSlots = await getBestSlots(eventId);
  if (bestSlots.length === 0) {
    return { success: false, error: 'Brak odpowiedzi.' };
  }

  event.status = 'finalized';
  event.finalSlot = bestSlots[0].slot;
  await eventRepo().save(event);

  return { success: true };
}
