import { AppDataSource } from '../database';
import { Analytics } from '../models/Analytics';

const analyticsRepo = () => AppDataSource.getRepository(Analytics);

export async function trackEvent(
  userId: string,
  eventType: string,
  eventId?: string,
  metadata?: string
): Promise<void> {
  try {
    const a = analyticsRepo().create({
      userId,
      eventType,
      eventId: eventId || null,
      metadata: metadata || null,
    });
    await analyticsRepo().save(a);
  } catch (err: any) {
    console.error('[Analytics] track error:', err.message);
  }
}

export interface StatsSummary {
  totalVisits: number;
  uniqueUsers: number;
  returningUsers: number;
  totalEvents: number;
  totalPolls: number;
  totalJoins: number;
  totalAvailabilityAnswers: number;
  totalMessages: number;
  totalFeedback: number;
  visitsToday: number;
  visitsThisWeek: number;
}

export async function getStats(): Promise<StatsSummary> {
  const repo = analyticsRepo();

  const totalVisits = await repo.count({ where: { eventType: 'visit' } });
  const totalEvents = await repo.count({ where: { eventType: 'create_event' } });
  const totalJoins = await repo.count({ where: { eventType: 'join_event' } });
  const totalAvailabilityAnswers = await repo.count({ where: { eventType: 'answer_availability' } });
  const totalMessages = await repo.count({ where: { eventType: 'send_message' } });
  const totalFeedback = await repo.count({ where: { eventType: 'open_feedback' } });

  const uniqueResult = await repo
    .createQueryBuilder('a')
    .select('COUNT(DISTINCT a.userId)', 'count')
    .where("a.eventType = 'visit'")
    .getRawOne();
  const uniqueUsers = parseInt(uniqueResult?.count || '0', 10);

  const returningResult = await repo
    .createQueryBuilder('a')
    .select('a.userId', 'userId')
    .addSelect('COUNT(*)', 'visitCount')
    .where("a.eventType = 'visit'")
    .groupBy('a.userId')
    .having('COUNT(*) > 1')
    .getRawMany();
  const returningUsers = returningResult.length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const visitsToday = await repo
    .createQueryBuilder('a')
    .where("a.eventType = 'visit'")
    .andWhere('a.createdAt >= :today', { today })
    .getCount();

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const visitsThisWeek = await repo
    .createQueryBuilder('a')
    .where("a.eventType = 'visit'")
    .andWhere('a.createdAt >= :weekAgo', { weekAgo })
    .getCount();

  const totalPolls = await repo
    .createQueryBuilder('a')
    .where("a.eventType = 'create_event'")
    .andWhere("a.metadata LIKE '%poll%'")
    .getCount();

  return {
    totalVisits,
    uniqueUsers,
    returningUsers,
    totalEvents,
    totalPolls,
    totalJoins,
    totalAvailabilityAnswers,
    totalMessages,
    totalFeedback,
    visitsToday,
    visitsThisWeek,
  };
}
