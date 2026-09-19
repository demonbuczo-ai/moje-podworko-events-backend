import { Router, Request, Response } from 'express';
import { trackEvent, getStats } from '../services/analyticsService';

const router = Router();
const ADMIN_KEY = "mojepodworko-admin-2026";

// POST /api/analytics/track - zapisz zdarzenie (z frontendu)
router.post('/track', async (req: Request, res: Response) => {
  try {
    const { userId, eventType, eventId, metadata } = req.body;
    if (!userId || !eventType) {
      res.status(400).json({ detail: 'Brak userId lub eventType.' });
      return;
    }
    await trackEvent(userId, eventType, eventId, metadata);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /api/analytics/stats?key=XXX - statystyki (tylko admin)
router.get('/stats', async (req: Request, res: Response) => {
  if (req.query.key !== ADMIN_KEY) {
    res.status(403).json({ detail: 'Brak dostepu.' });
    return;
  }
  const stats = await getStats();
  res.json(stats);
});

export default router;
