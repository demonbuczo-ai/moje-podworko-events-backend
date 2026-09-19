import { Router, Request, Response } from 'express';
import {
  createEvent,
  getEventById,
  getMyEvents,
  getParticipants,
  joinEvent,
  saveAvailability,
  getAvailabilities,
  getBestSlots,
  addMessage,
  getMessages,
  finalizeEvent,
} from '../services/eventService';

const router = Router();

// ============================================================
// POST /api/event/create
// ============================================================
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { title, description, ownerId, ownerName, type, dateFrom, dateTo, hourFrom, hourTo, deadlineHours } = req.body;

    if (!title || !ownerId || !ownerName) {
      res.status(400).json({ detail: 'Brak wymaganych pol: title, ownerId, ownerName.' });
      return;
    }

    const event = await createEvent({
      title,
      description: description || '',
      ownerId,
      ownerName,
      type: type || 'poll',
      dateFrom: dateFrom || '',
      dateTo: dateTo || '',
      hourFrom: hourFrom || '16:00',
      hourTo: hourTo || '23:00',
      deadlineHours: deadlineHours || 24,
    });

    res.json({
      success: true,
      eventId: event.eventId,
      title: event.title,
      status: event.status,
    });
  } catch (err: any) {
    console.error('[Route] create error:', err.message);
    res.status(500).json({ detail: 'Blad serwera: ' + err.message });
  }
});

// ============================================================
// GET /api/event/my/:userId - lista moich wydarzen
// ============================================================
router.get('/my/:userId', async (req: Request, res: Response) => {
  try {
    const events = await getMyEvents(req.params.userId);
    res.json(events.map(e => ({
      eventId: e.eventId,
      title: e.title,
      description: e.description,
      ownerId: e.ownerId,
      ownerName: e.ownerName,
      type: e.type,
      status: e.status,
      dateFrom: e.dateFrom,
      dateTo: e.dateTo,
      hourFrom: e.hourFrom,
      hourTo: e.hourTo,
      deadline: e.deadline,
      finalSlot: e.finalSlot,
      createdAt: e.createdAt,
    })));
  } catch (err: any) {
    console.error('[Route] my events error:', err.message);
    res.status(500).json({ detail: 'Blad serwera: ' + err.message });
  }
});

// ============================================================
// GET /api/event/:eventId - szczegoly wydarzenia
// ============================================================
router.get('/:eventId', async (req: Request, res: Response) => {
  try {
    const event = await getEventById(req.params.eventId);
    if (!event) {
      res.status(404).json({ detail: 'Wydarzenie nie znalezione.' });
      return;
    }

    const participants = await getParticipants(event.eventId);
    const availabilities = await getAvailabilities(event.eventId);
    const bestSlots = await getBestSlots(event.eventId);

    res.json({
      event: {
        eventId: event.eventId,
        title: event.title,
        description: event.description,
        ownerId: event.ownerId,
        ownerName: event.ownerName,
        type: event.type,
        status: event.status,
        dateFrom: event.dateFrom,
        dateTo: event.dateTo,
        hourFrom: event.hourFrom,
        hourTo: event.hourTo,
        deadline: event.deadline,
        finalSlot: event.finalSlot,
        createdAt: event.createdAt,
      },
      participants: participants.map(p => ({
        userId: p.userId,
        userName: p.userName,
        isOwner: p.isOwner,
        status: p.status,
      })),
      availabilities: availabilities.map(a => ({
        userId: a.userId,
        userName: a.userName,
        slot: a.slot,
      })),
      bestSlots,
    });
  } catch (err: any) {
    console.error('[Route] get event error:', err.message);
    res.status(500).json({ detail: 'Blad serwera: ' + err.message });
  }
});

// ============================================================
// POST /api/event/:eventId/join - dolacz do wydarzenia
// ============================================================
router.post('/:eventId/join', async (req: Request, res: Response) => {
  try {
    const { userId, userName } = req.body;
    if (!userId || !userName) {
      res.status(400).json({ detail: 'Brak userId lub userName.' });
      return;
    }

    const result = await joinEvent(req.params.eventId, userId, userName);
    if (!result.success) {
      res.status(400).json({ detail: result.error });
      return;
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error('[Route] join error:', err.message);
    res.status(500).json({ detail: 'Blad serwera: ' + err.message });
  }
});

// ============================================================
// POST /api/event/:eventId/availability - zapisz dostepnosc
// ============================================================
router.post('/:eventId/availability', async (req: Request, res: Response) => {
  try {
    const { userId, userName, slots } = req.body;
    if (!userId || !userName || !Array.isArray(slots)) {
      res.status(400).json({ detail: 'Brak userId, userName lub slots.' });
      return;
    }

    await saveAvailability(req.params.eventId, userId, userName, slots);

    const bestSlots = await getBestSlots(req.params.eventId);
    res.json({ success: true, bestSlots });
  } catch (err: any) {
    console.error('[Route] availability error:', err.message);
    res.status(500).json({ detail: 'Blad serwera: ' + err.message });
  }
});

// ============================================================
// GET /api/event/:eventId/best-slots - najlepsze terminy
// ============================================================
router.get('/:eventId/best-slots', async (req: Request, res: Response) => {
  try {
    const bestSlots = await getBestSlots(req.params.eventId);
    res.json(bestSlots);
  } catch (err: any) {
    console.error('[Route] best-slots error:', err.message);
    res.status(500).json({ detail: 'Blad serwera: ' + err.message });
  }
});

// ============================================================
// POST /api/event/:eventId/finalize - zamknij i wybierz termin
// ============================================================
router.post('/:eventId/finalize', async (req: Request, res: Response) => {
  try {
    const result = await finalizeEvent(req.params.eventId);
    if (!result.success) {
      res.status(400).json({ detail: result.error });
      return;
    }
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Route] finalize error:', err.message);
    res.status(500).json({ detail: 'Blad serwera: ' + err.message });
  }
});

// ============================================================
// POST /api/event/:eventId/message - wyslij wiadomosc
// ============================================================
router.post('/:eventId/message', async (req: Request, res: Response) => {
  try {
    const { userId, userName, text } = req.body;
    if (!userId || !userName || !text) {
      res.status(400).json({ detail: 'Brak userId, userName lub text.' });
      return;
    }

    const msg = await addMessage(req.params.eventId, userId, userName, text);
    res.json({ success: true, messageId: msg.messageId });
  } catch (err: any) {
    console.error('[Route] message error:', err.message);
    res.status(500).json({ detail: 'Blad serwera: ' + err.message });
  }
});

// ============================================================
// GET /api/event/:eventId/messages - pobierz wiadomosci
// ============================================================
router.get('/:eventId/messages', async (req: Request, res: Response) => {
  try {
    const messages = await getMessages(req.params.eventId);
    res.json(messages.map(m => ({
      messageId: m.messageId,
      userId: m.userId,
      userName: m.userName,
      text: m.text,
      createdAt: m.createdAt,
    })));
  } catch (err: any) {
    console.error('[Route] messages error:', err.message);
    res.status(500).json({ detail: 'Blad serwera: ' + err.message });
  }
});

export default router;
