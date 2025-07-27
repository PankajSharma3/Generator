import { Router } from 'express';
import Session from '../models/Session.js';
import auth from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res) => {
  const sessions = await Session.find({ userId: req.userId }).select('_id title updatedAt');
  res.json(sessions);
});

router.post('/', async (req, res) => {
  const session = await Session.create({ userId: req.userId, title: req.body.title || 'New Session' });
  res.json(session);
});

router.get('/:id', async (req, res) => {
  const session = await Session.findOne({ _id: req.params.id, userId: req.userId });
  if (!session) return res.status(404).json({ message: 'Session not found' });
  res.json(session);
});

export default router;