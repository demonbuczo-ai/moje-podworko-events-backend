import { Router, Request, Response } from 'express';
import { createFeedback, getAllFeedback, updateFeedbackStatus } from '../services/feedbackService';

const router = Router();

// Sekretny klucz do panelu admina (zmien na wlasny!)
const ADMIN_KEY = "mojepodworko-admin-2026";

// POST /api/feedback - wyslij sugestie
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, userName, type, text } = req.body;
    if (!userId || !userName || !text) {
      res.status(400).json({ detail: 'Brak userId, userName lub text.' });
      return;
    }
    if (text.length < 3) {
      res.status(400).json({ detail: 'Wiadomosc jest za krotka.' });
      return;
    }
    const fb = await createFeedback({ userId, userName, type: type || 'suggestion', text });
    res.json({ success: true, id: fb.id });
  } catch (err: any) {
    console.error('[Feedback] create error:', err.message);
    res.status(500).json({ detail: 'Blad serwera: ' + err.message });
  }
});

// GET /api/feedback/all?key=XXX - wszystkie sugestie (tylko dla admina)
router.get('/all', async (req: Request, res: Response) => {
  const key = req.query.key;
  if (key !== ADMIN_KEY) {
    res.status(403).json({ detail: 'Brak dostepu.' });
    return;
  }
  const feedbacks = await getAllFeedback();
  res.json(feedbacks);
});

// POST /api/feedback/:id/status - zmien status (new/read/done)
router.post('/:id/status', async (req: Request, res: Response) => {
  const key = req.query.key;
  if (key !== ADMIN_KEY) {
    res.status(403).json({ detail: 'Brak dostepu.' });
    return;
  }
  const { status } = req.body;
  const ok = await updateFeedbackStatus(parseInt(req.params.id, 10), status);
  res.json({ success: ok });
});

export default router;
