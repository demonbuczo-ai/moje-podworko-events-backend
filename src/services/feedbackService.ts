import { AppDataSource } from '../database';
import { Feedback } from '../models/Feedback';

const feedbackRepo = () => AppDataSource.getRepository(Feedback);

export interface CreateFeedbackInput {
  userId: string;
  userName: string;
  type: string;
  text: string;
}

export async function createFeedback(input: CreateFeedbackInput): Promise<Feedback> {
  const feedback = feedbackRepo().create({
    userId: input.userId,
    userName: input.userName,
    type: input.type || 'suggestion',
    text: input.text,
    status: 'new',
  });
  return await feedbackRepo().save(feedback);
}

export async function getAllFeedback(): Promise<Feedback[]> {
  return await feedbackRepo().find({
    order: { createdAt: 'DESC' },
    take: 200,
  });
}

export async function updateFeedbackStatus(id: number, status: string): Promise<boolean> {
  const fb = await feedbackRepo().findOne({ where: { id } });
  if (!fb) return false;
  fb.status = status;
  await feedbackRepo().save(fb);
  return true;
}
